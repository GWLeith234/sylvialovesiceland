/*! SafeTravel / ICE-SAR compact alert bar for IcelandNOW.
 * CPT primary: https://safetravel.is/wp-json/wp/v2/alert
 * Fallback: data/safetravel-alerts-cache.json
 * Attribution + official link-out mandatory. Never invent or soften.
 * Weather (Vedurstofa) stays separate. Hide bar when zero alerts.
 *
 * Dismiss: localStorage key `st-alerts-dismissed` stores
 *   { ids: ["6419","6351"], until: <epoch ms> }
 * Hide the current set for 7 days, or until a new alert id appears
 * (whichever comes first). Same/subset ids stay hidden; a new id shows
 * the bar again. Expired `until` also shows the bar again.
 */
(function () {
  var CPT = "https://safetravel.is/wp-json/wp/v2/alert";
  var CACHE = "data/safetravel-alerts-cache.json";
  var ATTR = "Safetravel / ICE-SAR";
  var LS_KEY = "st-alerts-dismissed";
  var DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

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

  function readDismiss() {
    try {
      var rec = JSON.parse(localStorage.getItem(LS_KEY) || "null");
      if (!rec || !Array.isArray(rec.ids) || typeof rec.until !== "number") return null;
      return rec;
    } catch (e) {
      return null;
    }
  }

  function writeDismiss(alerts) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        ids: alerts.map(function (a) { return String(a.id); }),
        until: Date.now() + DISMISS_MS
      }));
    } catch (e) { /* private mode / quota */ }
  }

  /* Hide if still inside the 7-day window and no new alert id. */
  function shouldHide(alerts) {
    var rec = readDismiss();
    if (!rec || Date.now() > rec.until) return false;
    return alerts.every(function (a) {
      return rec.ids.indexOf(String(a.id)) !== -1;
    });
  }

  function ensureCss() {
    return new Promise(function (resolve) {
      var existing = document.querySelector('link[data-st-alert-css]');
      if (existing) {
        if (existing.sheet) resolve();
        else {
          existing.addEventListener("load", function () { resolve(); });
          existing.addEventListener("error", function () { resolve(); });
        }
        return;
      }
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "css/safetravel-alert.css";
      link.setAttribute("data-st-alert-css", "1");
      link.addEventListener("load", function () { resolve(); });
      link.addEventListener("error", function () { resolve(); });
      document.head.appendChild(link);
    });
  }

  function syncHeight() {
    var slot = document.querySelector(".slot-alert");
    if (!slot) {
      document.documentElement.style.removeProperty("--st-alert-h");
      return;
    }
    document.documentElement.style.setProperty("--st-alert-h", Math.ceil(slot.offsetHeight) + "px");
  }

  function removeSlot() {
    var old = document.querySelector(".slot-alert");
    if (old) old.parentNode.removeChild(old);
    document.body.classList.remove("has-st-alerts");
    document.documentElement.style.removeProperty("--st-alert-h");
    window.removeEventListener("resize", syncHeight);
  }

  function detailsHtml(alerts) {
    return alerts.map(function (a) {
      return (
        '<article class="st-alert-item" data-alert-id="' + escapeHtml(String(a.id)) + '">' +
          '<h2 class="st-alert-item-title"><a href="' + escapeHtml(a.permalink) + '" target="_blank" rel="noopener">' +
            escapeHtml(a.title) +
          "</a></h2>" +
          (a.excerpt ? '<p class="st-alert-body">' + escapeHtml(a.excerpt) + "</p>" : "") +
          '<p class="st-alert-item-attr">Source: ' + ATTR +
            ' · <a href="' + escapeHtml(a.permalink) + '" target="_blank" rel="noopener">Official alert</a></p>' +
        "</article>"
      );
    }).join("");
  }

  function mount(alerts) {
    removeSlot();
    if (!alerts || !alerts.length) return;
    if (shouldHide(alerts)) return;

    var hd = document.querySelector("header.site-hd");
    if (!hd || !hd.parentNode) return;

    var first = alerts[0];
    var extra = alerts.length - 1;
    var hasDetails = alerts.length > 1 || !!(first.excerpt);

    var slot = document.createElement("div");
    slot.className = "slot-alert";
    slot.setAttribute("role", "region");
    slot.setAttribute("aria-label", "SafeTravel alerts");

    var bar = document.createElement("div");
    bar.className = "st-alert-bar";

    var more = extra > 0
      ? '<span class="st-alert-more">+' + extra + " more</span>"
      : "";

    bar.innerHTML =
      '<span class="st-alert-mark" aria-hidden="true">!</span>' +
      '<div class="st-alert-main">' +
        '<p class="st-alert-line">' +
          '<span class="st-alert-kicker">Alert</span>' +
          '<a class="st-alert-title" href="' + escapeHtml(first.permalink) + '" target="_blank" rel="noopener">' +
            escapeHtml(first.title) +
          "</a>" +
          more +
          '<span class="st-alert-attr">Source: ' + ATTR +
            ' · <a href="' + escapeHtml(first.permalink) + '" target="_blank" rel="noopener">Official alert</a></span>' +
        "</p>" +
        (hasDetails
          ? '<div class="st-alert-details" id="st-alert-details" hidden>' + detailsHtml(alerts) + "</div>"
          : "") +
      "</div>" +
      (hasDetails
        ? '<button type="button" class="st-alert-toggle" aria-expanded="false" aria-controls="st-alert-details" aria-label="Show alert details">Details</button>'
        : "") +
      '<button type="button" class="st-alert-dismiss" aria-label="Hide SafeTravel alerts" title="Hide alerts for 7 days">×</button>';

    slot.appendChild(bar);
    hd.parentNode.insertBefore(slot, hd);
    document.body.classList.add("has-st-alerts");

    var details = slot.querySelector("#st-alert-details");
    var toggle = slot.querySelector(".st-alert-toggle");
    if (toggle && details) {
      toggle.addEventListener("click", function () {
        var open = details.hasAttribute("hidden");
        if (open) details.removeAttribute("hidden");
        else details.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Hide alert details" : "Show alert details");
        toggle.textContent = open ? "Hide" : "Details";
        syncHeight();
      });
    }

    slot.querySelector(".st-alert-dismiss").addEventListener("click", function () {
      writeDismiss(alerts);
      removeSlot();
    });

    window.addEventListener("resize", syncHeight);
    syncHeight();
  }

  function fetchJson(url) {
    return fetch(url, { credentials: "omit", cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("http " + r.status);
      return r.json();
    });
  }

  function run() {
    ensureCss().then(function () {
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
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
