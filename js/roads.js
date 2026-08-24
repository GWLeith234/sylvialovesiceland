(function () {
  document.querySelectorAll("[data-roads-frame]").forEach(function (frame) {
    var iframe = frame.querySelector("iframe");
    var fallback = frame.querySelector("[data-roads-fallback]");
    if (!iframe || !fallback) return;

    var expectOpen = frame.getAttribute("data-roads-expect") === "open";
    var painted = false;

    function showFallback() {
      if (painted) return;
      fallback.hidden = false;
    }

    function hideFallback() {
      painted = true;
      fallback.hidden = true;
    }

    function looksPainted() {
      if (!iframe.contentWindow) return false;
      try {
        var doc = iframe.contentDocument;
        if (!doc) return false;
        var href = "";
        try {
          href = (doc.location && doc.location.href) || "";
        } catch (e) {
          return true;
        }
        if (!href || href === "about:blank") return false;
        var body = doc.body;
        if (!body) return false;
        return body.childElementCount > 0 || String(body.textContent || "").trim().length > 0;
      } catch (e) {
        return true;
      }
    }

    iframe.addEventListener("error", showFallback);
    iframe.addEventListener("load", function () {
      if (looksPainted()) hideFallback();
      else if (!expectOpen) showFallback();
    });

    setTimeout(function () {
      if (looksPainted()) hideFallback();
      else if (!expectOpen || !iframe.contentWindow) showFallback();
    }, 2000);
  });
})();
