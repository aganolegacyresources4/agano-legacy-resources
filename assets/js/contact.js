/* Optional contact details and a local enquiry shortcut; no tracking or background request. */
(function () {
  "use strict";
  function initContact() {
    if (document.querySelector("[data-utility-dock]")) return;
    var config = window.AGANO_CONFIG || {};
    document.querySelectorAll("[data-contact]").forEach(function (element) {
      var key = element.dataset.contact, value = config[key];
      if (typeof value !== "string" || !value.trim()) return;
      value = value.trim();
      if (key === "email" && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value)) {
        var email = document.createElement("a"); email.href = "mailto:" + encodeURIComponent(value).replace(/%40/gi, "@"); email.textContent = value; element.replaceChildren(email);
      } else if (key === "telephone" && /^[+\d\s().-]+$/.test(value)) {
        var digits = value.replace(/[^\d+]/g, "");
        if (/^\+?\d{7,15}$/.test(digits)) { var phone = document.createElement("a"); phone.href = "tel:" + digits; phone.textContent = value; element.replaceChildren(phone); }
      } else if (key !== "email" && key !== "telephone") element.textContent = value;
    });
    var dock = document.createElement("div");
    dock.className = "utility-dock";
    dock.setAttribute("data-utility-dock", "");
    var shortcut = document.createElement("a");
    shortcut.className = "whatsapp";
    var onArticle = /\/(?:news|sites)\/[^/]+\.html$/.test(window.location.pathname);
    shortcut.href = (onArticle ? "../" : "") + "contact.html#enquiry";
    shortcut.setAttribute("aria-label", "Prepare a WhatsApp enquiry");
    var icon = document.createElement("img");
    icon.src = (onArticle ? "../" : "") + "assets/icons/whatsapp.svg";
    icon.alt = ""; icon.width = 28; icon.height = 28;
    shortcut.append(icon);
    var top = document.createElement("a");
    top.className = "utility-top";
    top.href = "#top";
    top.hidden = true;
    top.setAttribute("data-utility-top", "");
    top.setAttribute("aria-label", "Back to top");
    var arrow = document.createElement("span");
    arrow.textContent = "↑";
    arrow.setAttribute("aria-hidden", "true");
    top.append(arrow);
    dock.append(shortcut, top);
    var footer = document.querySelector(".site-footer");
    if (footer) footer.before(dock); else document.body.append(dock);
  }
  window.AGANO = window.AGANO || {};
  window.AGANO.initContact = initContact;
})();
