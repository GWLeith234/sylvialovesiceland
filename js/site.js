(function () {
  var KEY = "sli_source";
  var KEY_SRC = "sli_src";
  var KEY_SRC_NAME = "sli_src_name";
  var KEY_CLOSER = "sli_closer";

  var DEFAULT_SRC = "201";
  var DEFAULT_SRC_NAME = "201-hotel-flora";
  var DEFAULT_CLOSER = "sylvia";
  var SRC_LABEL = "201 Hotel / Flora lobby";
  var CLOSER_LABEL = "Sylvia";
  var LIVE_ITEM = "https://201hotel.tourdesk.is/Tour/Item/1391/1/reykjavik-summit-helicopter-tour";
  var FLORA_URL = "https://www.floracollection.is/";
  var FLORA201_URL = "https://201hotel.is/";

  var file = (location.pathname.split("/").pop() || "index.html");
  var params = new URLSearchParams(location.search);

  function persist201(src, srcName, closer) {
    sessionStorage.setItem(KEY, "201");
    sessionStorage.setItem(KEY_SRC, src || sessionStorage.getItem(KEY_SRC) || DEFAULT_SRC);
    sessionStorage.setItem(KEY_SRC_NAME, srcName || sessionStorage.getItem(KEY_SRC_NAME) || DEFAULT_SRC_NAME);
    sessionStorage.setItem(KEY_CLOSER, closer || sessionStorage.getItem(KEY_CLOSER) || DEFAULT_CLOSER);
  }

  function persistOrganic() {
    sessionStorage.setItem(KEY, "organic");
    sessionStorage.removeItem(KEY_SRC);
    sessionStorage.removeItem(KEY_SRC_NAME);
    sessionStorage.removeItem(KEY_CLOSER);
  }

  if (params.get("src") === "organic" || params.get("door") === "a") {
    persistOrganic();
  } else if (params.get("src") === "201" || file === "201.html" || file === "demo.html") {
    persist201(params.get("src"), params.get("src_name"), params.get("closer"));
  }
  if (file === "checkout-201.html") {
    persist201(params.get("src"), params.get("src_name"), params.get("closer"));
  }
  if (file === "checkout-evx.html") persistOrganic();

  var source = sessionStorage.getItem(KEY) || "organic";
  var src = sessionStorage.getItem(KEY_SRC) || "";
  var srcName = sessionStorage.getItem(KEY_SRC_NAME) || "";
  var closer = sessionStorage.getItem(KEY_CLOSER) || "";

  function trackParams() {
    if (source !== "201") return null;
    return {
      src: src || DEFAULT_SRC,
      src_name: srcName || DEFAULT_SRC_NAME,
      closer: closer || DEFAULT_CLOSER
    };
  }

  function trackQS() {
    var t = trackParams();
    if (!t) return "";
    var q = new URLSearchParams();
    q.set("src", t.src);
    q.set("src_name", t.src_name);
    q.set("closer", t.closer);
    return "?" + q.toString();
  }

  function checkoutHref() {
    return source === "201" ? "checkout-201.html" + trackQS() : "checkout-evx.html";
  }

  function closerLabel() {
    if (!closer) return CLOSER_LABEL;
    return closer === "sylvia" ? CLOSER_LABEL : closer;
  }

  function codesText() {
    return "";
  }

  window.SLI = {
    source: source,
    is201: source === "201",
    label: source === "201" ? "201 Hotel QR" : "Found online",
    file: file,
    src: source === "201" ? (src || DEFAULT_SRC) : "",
    src_name: source === "201" ? (srcName || DEFAULT_SRC_NAME) : "",
    closer: source === "201" ? (closer || DEFAULT_CLOSER) : "",
    srcLabel: source === "201" ? SRC_LABEL : "",
    closerLabel: source === "201" ? closerLabel() : "",
    trackQS: trackQS,
    trackParams: trackParams,
    checkoutHref: checkoutHref,
    codesText: codesText,
    liveItem: LIVE_ITEM
  };

  document.documentElement.setAttribute("data-source", source);

  document.querySelectorAll("[data-preview]").forEach(function (a) {
    if (a.getAttribute("data-preview") === source) a.classList.add("on");
  });

  document.querySelectorAll("[data-ad]").forEach(function (a) {
    var kind = a.getAttribute("data-ad");
    if (kind === "heli") a.setAttribute("href", checkoutHref());
    if (kind === "flora") {
      a.setAttribute("href", FLORA_URL);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    }
    if (kind === "flora201") {
      a.setAttribute("href", FLORA201_URL);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    }
  });

  document.querySelectorAll('a[href^="checkout-201.html"]').forEach(function (a) {
    a.setAttribute("href", source === "201" ? "checkout-201.html" + trackQS() : "checkout-201.html");
  });

  if (file === "checkout-201.html") {
    var live = LIVE_ITEM + trackQS();
    var urlEl = document.querySelector(".td-url");
    if (urlEl) urlEl.textContent = LIVE_ITEM;
    var liveA = document.getElementById("sli-live");
    if (liveA) {
      liveA.setAttribute("href", live);
      liveA.textContent = LIVE_ITEM;
    }
  }

  document.addEventListener("click", function (e) {
    var ask = e.target.closest("[data-open-chat]");
    if (ask) {
      e.preventDefault();
      if (window.SLI.openChat) window.SLI.openChat();
    }
  });

  window.addEventListener("load", function () {
    if (new URLSearchParams(location.search).get("chat") === "1" && window.SLI.openChat) {
      window.SLI.openChat();
    }
  });
})();
