/* Checks for the compact SafeTravel bar. Run: node js/safetravel-alerts.test.js */
var fs = require("fs");
var path = require("path");
var assert = require("assert");

var src = fs.readFileSync(path.join(__dirname, "safetravel-alerts.js"), "utf8");
var css = fs.readFileSync(path.join(__dirname, "..", "css", "safetravel-alert.css"), "utf8");

function has(hay, needle) {
  assert.ok(hay.indexOf(needle) !== -1, "missing " + needle);
}

function lacksDefaultExcerptMount(hay) {
  /* Collapsed chip must not dump excerpt into the default line. */
  assert.ok(
    hay.indexOf("st-alert-body") !== -1,
    "excerpt markup must still exist for optional expand"
  );
  assert.ok(
    /hasDetails[\s\S]*st-alert-details/.test(hay) || hay.indexOf('id="st-alert-details"') !== -1,
    "excerpt belongs in optional details, not the default line"
  );
}

has(src, 'var CPT = "https://safetravel.is/wp-json/wp/v2/alert"');
has(src, 'var CACHE = "data/safetravel-alerts-cache.json"');
has(src, 'var ATTR = "Safetravel / ICE-SAR"');
has(src, 'var LS_KEY = "st-alerts-dismissed"');
has(src, "var DISMISS_MS = 7 * 24 * 60 * 60 * 1000");
has(src, 'setAttribute("aria-label", "SafeTravel alerts")');
has(src, 'aria-label="Hide SafeTravel alerts"');
has(src, 'aria-label="Show alert details"');
has(src, 'setAttribute("role", "region")');
has(src, "Official alert");
has(src, "shouldHide");
has(src, "writeDismiss");
has(src, "Never invent or soften");
has(src, "if (!alerts || !alerts.length) return");
has(src, "if (shouldHide(alerts)) return");
lacksDefaultExcerptMount(src);

has(css, "var(--crimson, #a30b37)");
has(css, ".st-alert-dismiss");
has(css, ".st-alert-toggle");
has(css, "-webkit-line-clamp: 2");
has(css, "min-height: 28px");

assert.ok(src.indexOf("Travel safety alert") === -1, "drop the large kicker copy");
assert.ok(css.indexOf("padding: 10px 0 12px") === -1, "old billboard padding must be gone");

console.log("safetravel-alerts.test.js ok");
