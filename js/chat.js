(function () {
  var FACE = "sylvia.jpg";

  function el(html) {
    var d = document.createElement("div");
    d.innerHTML = html.trim();
    return d.firstChild;
  }

  function mount() {
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
          '<div class="sli-note">Link only. Checkout stays on TourDesk. No card in this chat.</div>' +
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
    else if (window.SLI._restored) restore();
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
  window.SLI = window.SLI || {};
  window.SLI.openChat = open;
  window.SLI.closeChat = close;

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
        "Open Reykjavik Summit Helicopter Tour on TourDesk · EVX reseller portal" +
        "<small>[EVX reseller portal] · same Norðurflug product · not the 201 Hotel portal</small>" +
      "</a>"
    );
  }
  function hotelLink() {
    var href = (window.SLI && window.SLI.checkoutHref) ? window.SLI.checkoutHref() : "checkout-201.html";
    var qs = (window.SLI && window.SLI.trackQS) ? window.SLI.trackQS() : "";
    var live = ((window.SLI && window.SLI.liveItem) ? window.SLI.liveItem : "https://201hotel.tourdesk.is/Tour/Item/1391/1/reykjavik-summit-helicopter-tour") + qs;
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
      "<br><br>I do not take the card. Checkout is on TourDesk, on <strong>EvolveX360’s own reseller portal</strong>." +
      evxLink()
    );
    setReplies([]);
  }

  function offer201() {
    step = "offer";
    addSylvia(
      "You are at 201 Hotel in Kópavogur. Reykjavík domestic airport heliport is a short hop. Húsavík is still five hours — I will not sell that as a day trip from this hotel." +
      "<br><br><strong>Reykjavik Summit Helicopter Tour</strong> — Norðurflug, vendor 64 on the 201 portal. About 40 minutes. Checkout stays on the <strong>201 Hotel TourDesk portal</strong>. I will not send this tagged visit to the EVX reseller portal." +
      hotelLink()
    );
    setReplies([]);
  }

  function offerEyja() {
    addSylvia(
      "Eyja scooters are a city-day — Reykjavík at street level. They are <strong>not on TourDesk yet</strong> (pending operator onboarding). I will not invent a TourDesk item for them." +
      "<br><br>The bookable buy from this desk is the <strong>Norðurflug Reykjavik Summit Helicopter Tour</strong>." +
      '<br><a class="td-link" href="checkout-eyja.html">Eyja stand-in<small>Not TourDesk · checkout pending onboarding</small></a>'
    );
    setReplies([{ label: "Reykjavík from the air tomorrow" }]);
  }

  function onGuest(text) {
    addMe(text);
    var t = text.toLowerCase();
    var wants = /heli|summit|air|nordur|norður|norðurflug|tomorrow|flight|fly|airport/.test(t);
    var eyja = /eyja|scooter|scoot/.test(t);
    var reyk = /reykjav|capital|not sure|don't know|dont know|unknown/.test(t);
    var north = /húsav|husav|akureyri|north/.test(t);
    var oldboats = /puffin|whale|boat|harbour|harbor/.test(t);

    if (eyja) {
      offerEyja();
      return;
    }
    if (oldboats && !wants) {
      addSylvia(
        "I don’t book harbour puffin or whale boats on this desk. From Reykjavík tomorrow, the bookable buy is a <strong>Norðurflug Summit helicopter</strong>. Húsavík is still five hours if you were thinking of the north."
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
