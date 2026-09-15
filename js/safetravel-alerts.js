/*! SafeTravel / ICE-SAR alert chip for IcelandNOW.
 * CPT primary: https://safetravel.is/wp-json/wp/v2/alert
 * Fallback: data/safetravel-alerts-cache.json
 * Attribution + official link-out mandatory. Never invent or soften.
 * Weather (Vedurstofa) stays separate. Hide chip when zero alerts.
 */
(function () {
  var CPT = "https://safetravel.is/wp-json/wp/v2/alert";
  var CACHE = "data/safetravel-alerts-cache.json";
  var ATTR = "Safetravel / ICE-SAR";

  function stripHtml(s) {
    if (!s) return "";
    var d = document.createElement("div");
    d.innerHTML = String(s);
    return (d.textContent || d.innerText || "").replace(/\s+/g, " ").trim();
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normalizeFromCpt(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map(function (a) {
      var title = stripHtml((a.title && a.title.rendered) || a.title || "");
      var excerpt = stripHtml((a.excerpt && a.excerpt.rendered) || a.excerpt || "");
      return {
        id: a.id,
        title: title,
        permalink: a.link || a.permalink || "",
        excerpt: excerpt
      };
    }).filter(function (a) { return a.id && a.title && a.permalink; });
  }

  function normalizeFromCache(data) {
    if (!data || !Array.isArray(data.alerts)) return [];
    return data.alerts.map(function (a) {
      return {
        id: a.id,
        title: a.title || "",
        permalink: a.permalink || "",
        excerpt: a.excerpt || ""
      };
    }).filter(function (a) { return a.id && a.title && a.permalink; });
  }

  function ensureCss() {
    if (document.querySelector('link[data-st-alert-css]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "css/safetravel-alert.css";
    link.setAttribute("data-st-alert-css", "1");
    document.head.appendChild(link);
  }

  function removeSlot() {
    var old = document.querySelector(".slot-alert");
    if (old) old.parentNode.removeChild(old);
    document.body.classList.remove("has-st-alerts");
    document.documentElement.style.removeProperty("--st-alert-h");
  }

  function mount(alerts) {
    ensureCss();
    removeSlot();
    if (!alerts || !alerts.length) return;

    var hd = document.querySelector("header.site-hd");
    if (!hd || !hd.parentNode) return;

    var slot = document.createElement("div");
    slot.className = "slot-alert";
    slot.setAttribute("role", "region");
    slot.setAttribute("aria-label", "SafeTravel alerts");

    alerts.forEach(function (a) {
      var art = document.createElement("article");
      art.className = "st-alert-chip";
      art.setAttribute("data-alert-id", String(a.id));
      art.innerHTML =
        '<p class="st-alert-kicker">Travel safety alert</p>' +
        '<h2 class="st-alert-title"><a href="' + escapeHtml(a.permalink) + '" target="_blank" rel="noopener">' +
          escapeHtml(a.title) +
        "</a></h2>" +
        (a.excerpt
          ? '<p class="st-alert-body">' + escapeHtml(a.excerpt) + "</p>"
          : "") +
        '<p class="st-alert-attr">Source: ' + ATTR +
          ' · <a href="' + escapeHtml(a.permalink) + '" target="_blank" rel="noopener">Official alert</a></p>';
      slot.appendChild(art);
    });

    hd.parentNode.insertBefore(slot, hd);
    document.body.classList.add("has-st-alerts");
    var h = Math.ceil(slot.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--st-alert-h", h + "px");
    // remeasure after fonts/layout
    requestAnimationFrame(function () {
      var h2 = Math.ceil(slot.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--st-alert-h", h2 + "px");
    });
  }

  function fetchJson(url) {
    return fetch(url, { credentials: "omit", cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("http " + r.status);
      return r.json();
    });
  }

  function run() {
    fetchJson(CPT)
      .then(function (data) {
        var alerts = normalizeFromCpt(data);
        if (alerts.length) {
          mount(alerts);
          return;
        }
        return fetchJson(CACHE).then(function (cache) {
          mount(normalizeFromCache(cache));
        });
      })
      .catch(function () {
        return fetchJson(CACHE)
          .then(function (cache) {
            mount(normalizeFromCache(cache));
          })
          .catch(function () {
            removeSlot();
          });
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
