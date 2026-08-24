(function () {
  var TICK_KEY = "sli_ad_tick";
  var FLORA_URL = "https://www.floracollection.is/";
  var FLORA201_URL = "https://201hotel.is/";
  var FLORA201_BOOK = "https://201hotel.tourdesk.is/Tour";
  var HELI_URL = "https://www.helicopter.is/";
  var HELI_BOOK = "https://201hotel.tourdesk.is/Tour/Item/1391/1/reykjavik-summit-helicopter-tour";
  var EVX_URL = "https://www.evolvex360.com/";

  var EVX_COPY = {
    takeover: "Our AI workforce avatars. Get them working for your business today.",
    wide: "They speak 40 languages, and never take a minute off.",
    half: "Our AI workforce avatars. Get them working for your business today.",
    box: "They speak 40 languages, and never take a minute off."
  };
  var HOTEL201_IMG = {
    takeover: "img/hotel201-ad-hero.jpg",
    wide: "img/hotel201-ad-wide.jpg",
    half: "img/hotel201-ad-half.jpg",
    box: "img/hotel201-ad-box.jpg"
  };
  var HELI_IMG = {
    takeover: "img/heli-ad-hero.jpg",
    wide: "img/heli-ad-wide.jpg",
    half: "img/heli-ad-half.jpg",
    box: "img/heli-ad-box.jpg"
  };
  var EVX_IMG = {
    takeover: "img/evx-ad-hero.jpg",
    wide: "img/evx-ad-wide.jpg",
    half: "img/evx-ad-logo-half.jpg?v=workforce",
    box: "img/evx-ad-logo.jpg?v=workforce",
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

  function applyLink(el, href, kind, line, hideCopy) {
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
    if (copy) {
      if (hideCopy) {
        copy.style.display = "none";
      } else {
        copy.style.display = "";
        copy.textContent = line;
      }
    }
  }

  function applyImages(el, imgSrc, logoSrc, brand) {
    var img = mainImg(el);
    if (img && imgSrc) img.src = imgSrc;
    var lock = el.querySelector("img.ad-lockup");
    if (!lock) return;
    if (logoSrc) {
      lock.style.display = "";
      lock.src = logoSrc;
      if (brand) lock.alt = brand;
    } else {
      lock.style.display = "none";
    }
  }

  function applyMeta(el, ad) {
    var line = ad.line || ad.copy || ad.mark || ad.brand || "";
    applyLink(el, ad.href, ad.kind, line, !!(ad.baked || ad.hideCopy));
    if (ad.book) el.setAttribute("data-book", ad.book);
    else el.removeAttribute("data-book");
    var unit = el.closest(".ad-unit");
    if (unit) {
      if (ad.baked) unit.classList.add("ad-baked");
      else unit.classList.remove("ad-baked");
    }
    if (ad.baked) {
      el.setAttribute("data-baked", "true");
      var copy = el.querySelector(".ad-copy");
      if (copy) {
        copy.style.display = "none";
        copy.textContent = "";
      }
    } else {
      el.removeAttribute("data-baked");
    }
  }

  function paint(el, creative, marksOrig) {
    var isHit = el.classList.contains("takeover-hit");
    var src = isHit ? creative.bg : creative.img;
    probe(src, function () {
      applyMeta(el, creative);
      if (!isHit) applyImages(el, creative.img, creative.logo, creative.brand);
      if (isHit) {
        setTakeoverClass(creative.kind);
        if (creative.marks) setMarks(creative.marks.l, creative.marks.r);
        else if (marksOrig) setMarks(marksOrig.l, marksOrig.r);
      }
    });
  }

  function flora201Creative(shape, marksOrig) {
    return {
      kind: "flora201",
      href: FLORA201_URL,
      book: FLORA201_BOOK,
      img: HOTEL201_IMG[shape] || HOTEL201_IMG.wide,
      copy: "",
      baked: true,
      logo: "",
      brand: "201 Hotel",
      line: "201 Hotel",
      bg: HOTEL201_IMG.takeover,
      marks: marksOrig
    };
  }

  function floraCreative(orig, marksOrig, shape) {
    if (orig.kind === "flora201") return flora201Creative(shape, marksOrig);
    return {
      kind: "flora",
      href: FLORA_URL,
      line: orig.line,
      img: orig.img,
      logo: orig.logo,
      brand: orig.brand || "Flóra Hotels",
      bg: "img/flora-lobby.jpg",
      marks: marksOrig
    };
  }

  function heliCreative(shape) {
    return {
      kind: "nordurflug",
      href: HELI_URL,
      book: HELI_BOOK,
      img: HELI_IMG[shape] || HELI_IMG.wide,
      copy: "",
      baked: true,
      logo: "",
      brand: "Norðurflug",
      line: "Visit helicopter.is",
      mark: "Visit helicopter.is",
      bg: HELI_IMG.takeover,
      marks: markPair("Visit helicopter.is", "Norðurflug")
    };
  }

  function evxCreative(shape) {
    var small = shape === "half" || shape === "box";
    return {
      kind: "evx",
      href: EVX_URL,
      line: EVX_COPY[shape] || EVX_COPY.wide,
      img: EVX_IMG[shape] || EVX_IMG.wide,
      logo: small ? "" : EVX_IMG.logo,
      hideCopy: small,
      brand: "EvolveX360 Iceland",
      bg: EVX_IMG.takeover,
      marks: markPair("Our AI workforce avatars.", "Get them working for your business today.")
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
      var shape = shapeOf(el);
      var who = (n + i) % 3;
      var creative;
      if (who === 0) creative = floraCreative(orig, marksOrig, shape);
      else if (who === 1) creative = heliCreative(shape);
      else creative = evxCreative(shape);
      paint(el, creative, marksOrig);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
