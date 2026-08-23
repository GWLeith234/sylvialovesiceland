(function () {
  var CACHE_KEY = "sli_wx_v1";
  var CACHE_MS = 12 * 60 * 1000;
  var AWS = "https://api.vedur.is/weather/observations/aws/hour/latest";
  var SYNOP = "https://api.vedur.is/weather/observations/synop/latest?station_id=1";
  var HEADER_STATION = 1470;
  var ZONE_STATIONS = [1470, 1350, 6300, 2644, 3471, 4271, 2050];
  var ATTR = "Veðurstofa Íslands";

  function fetchJson(url) {
    return fetch(url, { credentials: "omit" }).then(function (res) {
      if (!res.ok) throw new Error("imo");
      return res.json();
    });
  }

  function awsUrl(ids) {
    var q = ["parameters=basic"];
    ids.forEach(function (id) {
      q.push("station_id=" + encodeURIComponent(id));
    });
    return AWS + "?" + q.join("&");
  }

  function lastCommaWord(text) {
    if (!text) return "";
    var parts = String(text).split(",");
    return parts[parts.length - 1].replace(/\s+/g, " ").trim();
  }

  function readCache() {
    try {
      var raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || !data.at || Date.now() - data.at > CACHE_MS) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function writeCache(data) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function stationMap(rows) {
    var map = {};
    (rows || []).forEach(function (row) {
      if (row && row.station != null) map[String(row.station)] = row;
    });
    return map;
  }

  function paintHeader(chip, row, cond) {
    if (!chip || !row || row.t == null || row.t === "" || !cond) return;
    var t = Number(row.t);
    if (!isFinite(t)) return;
    chip.textContent = "Reykjavík " + Math.round(t) + "°C · " + cond;
  }

  function paintBox(box, row) {
    if (!box || !row || row.t == null || row.t === "") return;
    var t = Number(row.t);
    if (!isFinite(t)) return;
    var name = row.name || "";
    box.innerHTML =
      '<p class="kicker">Now · ' + ATTR + "</p>" +
      '<p class="wx-name">' + name + "</p>" +
      '<p class="wx-temp">' + Math.round(t) + "°C</p>" +
      '<p class="wx-attr"><a href="https://en.vedur.is/" target="_blank" rel="noopener">' + ATTR + "</a></p>";
  }

  function apply(payload) {
    var map = stationMap(payload.aws);
    var chip = document.querySelector("a.hd-wx");
    paintHeader(chip, map[String(HEADER_STATION)], payload.cond);
    document.querySelectorAll("[data-wx-station]").forEach(function (box) {
      paintBox(box, map[String(box.getAttribute("data-wx-station"))]);
    });
  }

  function loadFresh() {
    var boxes = document.querySelectorAll("[data-wx-station]");
    var awsReq = boxes.length
      ? fetchJson(awsUrl(ZONE_STATIONS))
      : fetchJson(awsUrl([HEADER_STATION]));
    var synopReq = fetchJson(SYNOP);
    return Promise.all([awsReq, synopReq]).then(function (parts) {
      var aws = parts[0];
      var synop = parts[1];
      var row = Array.isArray(synop)
        ? synop.filter(function (s) { return String(s.station) === "1"; })[0] || synop[0]
        : null;
      var cond = lastCommaWord(row && row.n_txt_en);
      var payload = { at: Date.now(), aws: aws, cond: cond };
      writeCache(payload);
      apply(payload);
    });
  }

  var cached = readCache();
  if (cached) apply(cached);
  loadFresh().catch(function () {});
})();
