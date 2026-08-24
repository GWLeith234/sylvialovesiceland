(function () {
  var FACE = "sylvia.jpg";
  var WIDGET_ID = "df50fe75-9f19-11f1-b1e3-42c104493bd3";

  function hasVendastaWidget() {
    return !!(
      document.querySelector('script[src*="webchat-client"]') ||
      document.querySelector('script[data-widget-id="' + WIDGET_ID + '"]')
    );
  }

  function openVendasta() {
    if (window.webchatAPI && typeof window.webchatAPI.fillMessage === "function") {
      window.webchatAPI.fillMessage("", WIDGET_ID);
      return;
    }
    var hash = "#webchat-fill-message?webchat-widgetId=" + encodeURIComponent(WIDGET_ID);
    if (location.hash === hash) {
      location.hash = "";
    }
    location.hash = hash;
  }

  window.SLI = window.SLI || {};
  window.SLI.openChat = openVendasta;
  window.SLI.closeChat = function () {};

  function el(html) {
    var d = document.createElement("div");
    d.innerHTML = html.trim();
    return d.firstChild;
  }

  function mount() {
    if (hasVendastaWidget()) return;
    if (document.getElementById("sli-root")) return;
    var src = window.SLI || { is201: false, label: "Found online" };
    var chipClass = src.is201 ? "sli-chip partner" : "sli-chip";
    var root = el(
      '<div id="sli-root">' +
        '<div class="sli-launcher" id="sli-launcher">' +
          '<div class="' + chipClass + '" id="sli-chip"><i></i>' + src.label + "</div>" +
          '<button type="button" class="sli-fab" id="sli-fab" aria-label="Ask Sylvia">' +
            '<img src="' + FACE + '" alt="Sylvia">' +
          "</button>" +
        "</div>" +
        '<aside class="sli-panel" id="sli-panel" role="dialog" aria-label="Chat with Sylvia">' +
          '<div class="sli-head">' +
            '<img src="' + FACE + '" alt="">' +
            "<div><strong>Sylvia</strong><span>Your AI travel expert · Iceland</span></div>" +
            '<button type="button" class="x" id="sli-close" aria-label="Close">×</button>' +
          "</div>" +
          '<div class="sli-msgs" id="sli-msgs"></div>' +
          '<div class="sli-replies" id="sli-replies"></div>' +
          '<form class="sli-input" id="sli-form">' +
            '<input name="q" autocomplete="off" placeholder="Ask about tomorrow…">' +
            "<button type=\"submit\">Send</button>" +
          "</form>" +
        "</aside>" +
      "</div>"
    );
    document.body.appendChild(root);

    document.getElementById("sli-fab").addEventListener("click", open);
    document.getElementById("sli-close").addEventListener("click", close);
    document.getElementById("sli-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var v = (e.target.q.value || "").trim();
      if (!v) return;
      e.target.q.value = "";
      onGuest(v);
    });

    if (!sessionStorage.getItem("sli_greeted")) greet();
    else greet();
  }

  function open() {
    document.getElementById("sli-panel").classList.add("open");
    document.getElementById("sli-launcher").style.display = "none";
    if (!document.getElementById("sli-msgs").dataset.ready) greet();
  }
  function close() {
    document.getElementById("sli-panel").classList.remove("open");
    document.getElementById("sli-launcher").style.display = "flex";
  }

  if (!hasVendastaWidget()) {
    window.SLI.openChat = open;
    window.SLI.closeChat = close;
  }

  function msgs() { return document.getElementById("sli-msgs"); }
  function replies() { return document.getElementById("sli-replies"); }

  function addSylvia(html) {
    var b = el('<div class="bubble s"><div class="who"><img src="' + FACE + '" alt="">Sylvia</div><div class="body"></div></div>');
    b.querySelector(".body").innerHTML = html;
    msgs().appendChild(b);
    msgs().scrollTop = msgs().scrollHeight;
  }
  function addMe(text) {
    var b = el('<div class="bubble me"></div>');
    b.textContent = text;
    msgs().appendChild(b);
    msgs().scrollTop = msgs().scrollHeight;
  }
  function setReplies(items) {
    var box = replies();
    box.innerHTML = "";
    items.forEach(function (it) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = it.label;
      btn.addEventListener("click", function () { onGuest(it.value || it.label); });
      box.appendChild(btn);
    });
  }

  var step = "greet";

  function evxLink() {
    return (
      '<a class="td-link" href="checkout-evx.html">' +
        "Open Reykjavik Summit Helicopter Tour on TourDesk" +
        "<small>same Norðurflug product</small>" +
      "</a>"
    );
  }
  function hotelLink() {
    var href = (window.SLI && window.SLI.checkoutHref) ? window.SLI.checkoutHref() : "checkout-201.html";
    var live = (window.SLI && window.SLI.liveItem) ? window.SLI.liveItem : "https://201hotel.tourdesk.is/Tour/Item/1391/1/reykjavik-summit-helicopter-tour";
    return (
      '<a class="td-link" href="' + href + '">' +
        "Open on 201 TourDesk" +
        "<small>" + live.replace(/^https:\/\//, "") + "</small>" +
      "</a>"
    );
  }

  function greet() {
    msgs().innerHTML = "";
    msgs().dataset.ready = "1";
    step = "greet";
    if (window.SLI.is201) {
      addSylvia(
        "You scanned at <strong>201 Hotel</strong>, Hlíðarsmári 5, Kópavogur. I’m Sylvia. Tell me what you want to see — I’ll keep you on things you can actually reach from here."
      );
    } else {
      addSylvia(
        "I’m Sylvia. Tell me what you want to see in Iceland. I’ll be honest about the hours."
      );
    }
    setReplies([{ label: "Reykjavík from the air tomorrow" }]);
  }

  function offerOrganic() {
    step = "offer";
    addSylvia(
      "Húsavík is the postcard — and it is about <strong>five hours each way</strong> from Reykjavík (~480 km). From where you are, stay in the capital." +
      "<br><br><strong>Reykjavik Summit Helicopter Tour</strong> with Norðurflug leaves the domestic airport heliport. Capital Region. About 40 minutes. Flying." +
      "<br><br>I do not take the card. Checkout is on TourDesk." +
      evxLink()
    );
    setReplies([]);
  }

  function offer201() {
    step = "offer";
    addSylvia(
      "You are at 201 Hotel in Kópavogur. Reykjavík domestic airport heliport is a short hop. Húsavík is still five hours — I will not sell that as a day trip from this hotel." +
      "<br><br><strong>Reykjavik Summit Helicopter Tour</strong> — Norðurflug, vendor 64. About 40 minutes. Checkout is on TourDesk." +
      hotelLink()
    );
    setReplies([]);
  }

  function onGuest(text) {
    addMe(text);
    var t = text.toLowerCase();
    var wants = /heli|summit|air|nordur|norður|norðurflug|tomorrow|flight|fly|airport/.test(t);
    var reyk = /reykjav|capital|not sure|don't know|dont know|unknown/.test(t);
    var north = /húsav|husav|akureyri|north/.test(t);
    var stay = /hotel|201|flóra|flora|stay|room/.test(t);

    if (stay && !wants) {
      addSylvia(
        "A great stay in Iceland starts at 201 Hotel. Comfort, simplicity, and great value in Kópavogur — just minutes from Reykjavík. Flóra: 5 Hotels. One Collection. Hospitality, rooted in Iceland."
      );
      setReplies([{ label: "Reykjavík from the air tomorrow" }]);
      return;
    }

    if (window.SLI.is201) {
      if (wants || step === "greet" || step === "ask") {
        offer201();
        return;
      }
    }

    if (step === "greet" && wants) {
      step = "ask";
      addSylvia("Are you in Reykjavík tomorrow, or already up north?");
      setReplies([{ label: "Reykjavík" }, { label: "Not sure" }]);
      return;
    }
    if (step === "ask" && (reyk || /reykjav/.test(t) || t === "not sure")) {
      offerOrganic();
      return;
    }
    if (north && !window.SLI.is201) {
      addSylvia(
        "If you are already sleeping in the north, Húsavík can wait until you’re there. If you are still in the capital area tomorrow, do not drive ten hours. Take the Norðurflug Summit flight from the domestic airport heliport."
      );
      setReplies([{ label: "I’m in Reykjavík" }]);
      return;
    }
    if (wants) {
      if (window.SLI.is201) offer201();
      else {
        step = "ask";
        addSylvia("Are you in Reykjavík tomorrow, or already up north?");
        setReplies([{ label: "Reykjavík" }, { label: "Not sure" }]);
      }
      return;
    }
    addSylvia("Ask me about Reykjavík from the air tomorrow — I’ll keep the geography honest. The bookable tour is Norðurflug’s Summit helicopter.");
    setReplies([{ label: "Reykjavík from the air tomorrow" }]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
