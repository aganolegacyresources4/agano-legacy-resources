/* Non-modal disclosure navigation. Visibility is owned by this controller, not animation. */
(function () {
  "use strict";
  function initNavigation() {
    var nav = document.querySelector("#primary-nav");
    var toggle = document.querySelector("[data-menu-toggle]");
    var header = document.querySelector(".site-header");
    if (!nav || !toggle || !header || nav.dataset.navigationReady || typeof window.matchMedia !== "function") return;
    var disclosures = Array.prototype.slice.call(nav.querySelectorAll("[data-nav-dropdown]"));
    var desktop = window.matchMedia("(min-width:1101px)");
    var open = false;
    function focus(element) {
      if (element && typeof element.focus === "function") element.focus({ preventScroll: true });
    }
    function notify() {
      document.dispatchEvent(new CustomEvent("agano:navigation", { detail: { open: open && !desktop.matches } }));
    }
    function sync() {
      nav.hidden = !desktop.matches && !open;
      toggle.hidden = desktop.matches;
      nav.classList.toggle("is-open", !desktop.matches && open);
      toggle.setAttribute("aria-expanded", String(!desktop.matches && open));
      toggle.setAttribute("aria-label", "Main menu");
      notify();
    }
    function close(restoreFocus, navigating) {
      var focusedInside = nav.contains(document.activeElement);
      open = false;
      disclosures.forEach(function (item) { item.open = false; });
      sync();
      if (!desktop.matches && !navigating && (restoreFocus || focusedInside)) focus(toggle);
    }
    function closeOthers(current) {
      disclosures.forEach(function (item) { if (item !== current) item.open = false; });
    }
    toggle.addEventListener("click", function () {
      if (desktop.matches) return;
      if (open) { close(false); return; }
      open = true;
      sync();
    });
    disclosures.forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (item.open) closeOthers(item);
        notify();
      });
      var summary = item.querySelector("summary");
      if (summary) summary.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowDown") return;
        var first = item.querySelector("a[href]");
        if (!first) return;
        event.preventDefault();
        item.open = true;
        closeOthers(item);
        focus(first);
      });
    });
    nav.addEventListener("click", function (event) {
      var link = event.target.closest ? event.target.closest("a[href]") : null;
      if (!link || event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      close(false, true);
    });
    document.addEventListener("click", function (event) {
      if (!header.contains(event.target)) close(false);
    });
    document.addEventListener("focusin", function (event) {
      if (!header.contains(event.target) && (open || disclosures.some(function (item) { return item.open; }))) close(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      var active = disclosures.find(function (item) { return item.open; });
      if (active) {
        event.preventDefault();
        active.open = false;
        focus(active.querySelector("summary"));
      } else if (open) {
        event.preventDefault();
        close(true);
      }
    });
    function resetLayout() {
      var active = document.activeElement;
      var owner = active && typeof active.closest === "function" ? active.closest("[data-nav-dropdown]") : null;
      var wasToggle = active === toggle;
      close(false);
      if (desktop.matches && (wasToggle || (owner && nav.contains(active)))) {
        focus(owner ? owner.querySelector("summary") : nav.querySelector("summary, a[href]"));
      }
    }
    if (typeof desktop.addEventListener === "function") desktop.addEventListener("change", resetLayout);
    else if (typeof desktop.addListener === "function") desktop.addListener(resetLayout);
    window.addEventListener("pageshow", function (event) { if (event.persisted) resetLayout(); });
    nav.querySelectorAll('a[aria-current="page"]').forEach(function (link) {
      var owner = link.closest("[data-nav-dropdown]");
      if (owner) owner.classList.add("has-current-page");
    });
    nav.dataset.navigationReady = "true";
    document.documentElement.classList.add("js");
    sync();
  }
  window.AGANO = window.AGANO || {};
  window.AGANO.initNavigation = initNavigation;
  /* Deferred HTML delivery starts navigation before optional page scripts. */
  if (document.readyState === "interactive" || document.readyState === "complete") initNavigation();
})();
