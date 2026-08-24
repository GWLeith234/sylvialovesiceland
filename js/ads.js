(function () {
  var TICK_KEY = "sli_ad_tick";
  var FLORA_URL = "https://www.floracollection.is/";
  var FLORA201_URL = "https://201hotel.is/";
  var HELI_URL = "https://www.helicopter.is/";
  var EVX_URL = "https://www.evolvex360.com/";

  var HELI_COPY = {
    takeover: "Experience the breathtaking beauty of Iceland from above with Norðurflug Helicopter Service.",
    wide: "Book your volcano experience",
    half: "Start unique tours with us",
    box: "Reykjavik Summit"
  };
  var EVX_COPY = {
    takeover: "Icelandic businesses. We open the North American market.",
    wide: "Icelandic businesses. We open the North American market.",
    half: "Gilsi · CEO, EvolveX360 Iceland.",
    box: "North America, from Iceland."
  };
  var HELI_IMG = {
    takeover: "img/heli-hero.jpg",
    wide: "img/heli-reykjavik.jpg",
    half: "img/heli-helicopter.jpg",
    box: "img/heli-summit.jpg",
    logo: "img/heli-logo.png"
  };
  var EVX_IMG = {
    takeover: "img/evx-ad-hero.jpg",
    wide: "img/evx-ad-wide.jpg",
    half: "img/evx-gilsi.jpg",
    box: "img/evx-ad-box.jpg",
    logo: "img/evx-logo.png"
  };

  function tick() {
    var n = 0;
    try {
      n = parseInt(sessionStorage.getItem(TICK_KEY) || "0", 10) || 0;
    } catch (e) {
      n = 0;
    }
    try {
      sessionStorage.setItem(TICK_KEY, String(n + 1));
    } catch (e2) {}
    return n;
  }

  function collect() {
    var nodes = document.querySelectorAll('[data-ad="flora"], [data-ad="flora201"], .takeover-hit');
    var out = [];
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.getAttribute("data-ad") === "heli") continue;
      if (el.classList.contains("gold") || el.classList.contains("tour")) continue;
      if (el.closest(".gold") || el.closest(".tour")) continue;
      out.push(el);
    }
    return out;
  }

  function shapeOf(el) {
    if (el.classList.contains("takeover-hit")) return "takeover";
    var unit = el.closest(".ad-unit");
    if (!unit) return "wide";
    if (unit.classList.contains("ad-half")) return "half";
    if (unit.classList.contains("ad-box")) return "box";
    return "wide";
  }

  function mainImg(el) {
    return el.querySelector("img:not(.ad-lockup)");
  }

  function snapshot(el) {
    var img = mainImg(el);
    var lock = el.querySelector("img.ad-lockup");
    var copy = el.querySelector(".ad-copy");
    var kind = el.getAttribute("data-ad") || "flora";
    var line = "";
    if (copy && copy.textContent) line = copy.textContent.replace(/\s+/g, " ").trim();
    if (!line && el.getAttribute("aria-label")) {
      line = el.getAttribute("aria-label").replace(/^Advertisement:\s*/i, "").trim();
    }
    return {
      kind: kind,
      href: el.getAttribute("href") || "",
      line: line,
      img: img ? img.getAttribute("src") || "" : "",
      logo: lock ? lock.getAttribute("src") || "" : "",
      brand: lock ? lock.getAttribute("alt") || "" : "",
      aria: el.getAttribute("aria-label") || ""
    };
  }

  function probe(src, ok) {
    if (!src) {
      ok();
      return;
    }
    var im = new Image();
    im.onload = function () { ok(); };
    im.onerror = function () { /* 404: leave previous */ };
    im.src = src;
  }

  function setMarks(htmlL, htmlR) {
    var l = document.querySelector(".takeover-mark-l");
    var r = document.querySelector(".takeover-mark-r");
    if (l && htmlL != null) l.innerHTML = htmlL;
    if (r && htmlR != null) r.innerHTML = htmlR;
  }

  function markPair(title, sub) {
    return {
      l: title + "<small>" + sub + "</small>",
      r: title + "<small>Advertisement</small>"
    };
  }

  function setTakeoverClass(kind) {
    var b = document.body;
    if (!b.classList.contains("has-takeover")) return;
    b.classList.remove("takeover-flora", "takeover-flora201", "takeover-nordurflug", "takeover-evx", "takeover-heli");
    b.classList.add("takeover-" + kind);
  }

  function applyLink(el, href, kind, line) {
    el.setAttribute("href", href);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
    el.setAttribute("data-ad", kind);
    el.setAttribute("aria-label", "Advertisement: " + line);
    var unit = el.closest(".ad-unit");
    if (unit) {
      unit.classList.remove("ad-flora", "ad-flora201", "ad-nordurflug", "ad-evx");
      unit.classList.add("ad-" + kind);
    }
    var copy = el.querySelector(".ad-copy");
    if (copy) copy.textContent = line;
  }

  function applyImages(el, imgSrc, logoSrc, brand) {
    var img = mainImg(el);
    if (img && imgSrc) img.src = imgSrc;
    var lock = el.querySelector("img.ad-lockup");
    if (lock && logoSrc) {
      lock.src = logoSrc;
      if (brand) lock.alt = brand;
    }
  }

  function paint(el, creative, marksOrig) {
    var isHit = el.classList.contains("takeover-hit");
    var src = isHit ? creative.bg : creative.img;
    probe(src, function () {
      applyLink(el, creative.href, creative.kind, creative.line);
      if (!isHit) applyImages(el, creative.img, creative.logo, creative.brand);
      if (isHit) {
        setTakeoverClass(creative.kind);
        if (creative.marks) setMarks(creative.marks.l, creative.marks.r);
        else if (marksOrig) setMarks(marksOrig.l, marksOrig.r);
      }
    });
  }

  function floraCreative(orig, marksOrig) {
    var kind = orig.kind === "flora201" ? "flora201" : "flora";
    return {
      kind: kind,
      href: kind === "flora201" ? FLORA201_URL : FLORA_URL,
      line: orig.line,
      img: orig.img,
      logo: orig.logo,
      brand: orig.brand || (kind === "flora201" ? "201 Hotel" : "Flóra Hotels"),
      bg: kind === "flora201" ? "img/flora-reception.jpg" : "img/flora-lobby.jpg",
      marks: marksOrig
    };
  }

  function heliCreative(shape) {
    return {
      kind: "nordurflug",
      href: HELI_URL,
      line: HELI_COPY[shape] || HELI_COPY.wide,
      img: HELI_IMG[shape] || HELI_IMG.wide,
      logo: HELI_IMG.logo,
      brand: "Norðurflug",
      bg: HELI_IMG.takeover,
      marks: markPair("Book your volcano experience", "Start unique tours with us")
    };
  }

  function evxCreative(shape) {
    return {
      kind: "evx",
      href: EVX_URL,
      line: EVX_COPY[shape] || EVX_COPY.wide,
      img: EVX_IMG[shape] || EVX_IMG.wide,
      logo: EVX_IMG.logo,
      brand: "EvolveX360 Iceland",
      bg: EVX_IMG.takeover,
      marks: markPair("Icelandic businesses.", "We open the North American market.")
    };
  }

  function run() {
    var n = tick();
    var slots = collect();
    var markL = document.querySelector(".takeover-mark-l");
    var markR = document.querySelector(".takeover-mark-r");
    var marksOrig = {
      l: markL ? markL.innerHTML : "",
      r: markR ? markR.innerHTML : ""
    };
    for (var i = 0; i < slots.length; i++) {
      var el = slots[i];
      var orig = snapshot(el);
      var who = (n + i) % 3;
      var creative;
      if (who === 0) creative = floraCreative(orig, marksOrig);
      else if (who === 1) creative = heliCreative(shapeOf(el));
      else creative = evxCreative(shapeOf(el));
      paint(el, creative, marksOrig);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
