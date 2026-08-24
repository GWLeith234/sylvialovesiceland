/* Minimal checks for baked Hotel 201 / Norðurflug wiring. Run: node js/ads-baked.test.js */
var fs = require("fs");
var path = require("path");
var assert = require("assert");

var src = fs.readFileSync(path.join(__dirname, "ads.js"), "utf8");
var css = fs.readFileSync(path.join(__dirname, "..", "css", "site.css"), "utf8");

function has(hay, needle) {
  assert.ok(hay.indexOf(needle) !== -1, "missing " + needle);
}

has(src, 'var FLORA201_URL = "https://201hotel.is/";');
has(src, 'var FLORA201_BOOK = "https://201hotel.tourdesk.is/Tour";');
has(src, 'var HELI_URL = "https://www.helicopter.is/";');
has(src, 'var HELI_BOOK = "https://201hotel.tourdesk.is/Tour/Item/1391/1/reykjavik-summit-helicopter-tour";');
has(src, "function applyMeta");
has(src, "if (ad.baked)");
has(src, 'copy.style.display = "none"');
has(src, "img/hotel201-ad-wide.jpg");
has(src, "img/hotel201-ad-half.jpg");
has(src, "img/hotel201-ad-box.jpg");
has(src, "img/hotel201-ad-hero.jpg");
has(src, "img/heli-ad-wide.jpg");
has(src, "img/heli-ad-half.jpg");
has(src, "img/heli-ad-box.jpg");
has(src, "img/heli-ad-hero.jpg");
has(src, 'mark: "Visit helicopter.is"');
has(src, 'baked: true');
assert.ok(src.indexOf("flora-room.jpg") === -1, "ads.js must not reference flora-room.jpg");
assert.ok(src.indexOf("eyja") === -1 && src.indexOf("scooter") === -1, "no Eyja scooters");

has(css, 'url("../img/hotel201-ad-hero.jpg")');
has(css, 'url("../img/heli-ad-hero.jpg")');
has(css, ".ad-baked .ad-copy");

has(src, "img/flora-lobby.jpg");
has(src, "img/evx-ad-wide.jpg");

var htmlFiles = fs.readdirSync(path.join(__dirname, "..")).filter(function (n) {
  return n.slice(-5) === ".html";
});
htmlFiles.forEach(function (name) {
  var html = fs.readFileSync(path.join(__dirname, "..", name), "utf8");
  assert.ok(html.indexOf("flora-room.jpg") === -1, name + " still has flora-room.jpg");
});

function applyMeta(el, ad) {
  var copy = el.querySelector(".ad-copy");
  if (ad.baked && copy) {
    copy.style.display = "none";
    copy.textContent = "";
  }
}

var copy = { style: { display: "" }, textContent: "doubled" };
var el = {
  querySelector: function (sel) { return sel === ".ad-copy" ? copy : null; }
};
applyMeta(el, { baked: true });
assert.strictEqual(copy.style.display, "none");
assert.strictEqual(copy.textContent, "");

console.log("ok " + htmlFiles.length + " html files + ads.js + site.css");
