/* Native dialog retains its own focus containment and image-link fallback. */
(function () {
  "use strict";
  function initGallery() {
    var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
    var dialog = document.querySelector("[data-lightbox-dialog]");
    if (!triggers.length || !dialog || dialog.dataset.galleryReady || typeof dialog.showModal !== "function") return;
    var img = dialog.querySelector("[data-lightbox-image]");
    var caption = dialog.querySelector("[data-lightbox-caption]");
    var stage = dialog.querySelector("[data-lightbox-stage]");
    var status = dialog.querySelector("[data-lightbox-status]");
    var position = dialog.querySelector("[data-lightbox-position]");
    var source = dialog.querySelector("[data-lightbox-source]");
    var closeButton = dialog.querySelector("[data-lightbox-close]");
    var prev = dialog.querySelector("[data-lightbox-prev]");
    var next = dialog.querySelector("[data-lightbox-next]");
    if (!img || !caption || !stage || !status || !position || !source || !closeButton || !prev || !next) return;
    dialog.dataset.galleryReady = "true";
    var index = 0, request = 0, opener = null, closing = false, loader = null;
    function animate(element, frames, options) {
      return window.AGANO.motion ? window.AGANO.motion.animate(element, frames, options) : null;
    }
    function detachLoader() {
      if (loader) { loader.onload = null; loader.onerror = null; loader = null; }
    }
    function show(n) {
      if (closing) return;
      index = (n + triggers.length) % triggers.length;
      var token = ++request;
      detachLoader();
      var trigger = triggers[index];
      img.hidden = true;
      img.alt = trigger.querySelector("img") ? trigger.querySelector("img").alt : "";
      caption.textContent = trigger.dataset.caption || "";
      position.textContent = "Image " + (index + 1) + " of " + triggers.length;
      source.href = trigger.href;
      stage.setAttribute("aria-busy", "true");
      status.removeAttribute("data-error");
      status.textContent = "Loading image " + (index + 1) + " of " + triggers.length + "…";
      var pending = new window.Image();
      loader = pending;
      pending.onload = function () {
        if (token !== request) return;
        img.src = trigger.href;
        img.hidden = false;
        stage.setAttribute("aria-busy", "false");
        status.textContent = position.textContent + ". " + caption.textContent;
        detachLoader();
        animate(img, [{ opacity: 0.75 }, { opacity: 1 }], { duration: 180, easing: "ease-out" });
      };
      pending.onerror = function () {
        if (token !== request) return;
        stage.setAttribute("aria-busy", "false");
        status.setAttribute("data-error", "true");
        status.textContent = "This image could not be loaded. Try the next image or use the direct image link.";
        detachLoader();
      };
      pending.src = trigger.href;
    }
    function finishClose() {
      if (dialog.open) dialog.close();
    }
    function close() {
      if (closing || !dialog.open) return;
      closing = true;
      /* Dismissal and focus return must not wait on a suspended animation. */
      finishClose();
    }
    triggers.forEach(function (trigger, n) {
      trigger.addEventListener("click", function (event) {
        if (event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (closing) return;
        opener = trigger;
        try {
          if (!dialog.open) dialog.showModal();
        } catch (_) {
          window.location.assign(trigger.href);
          return;
        }
        show(n);
        closeButton.focus({ preventScroll: true });
        animate(dialog, [{ opacity: 0.8, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 220, easing: "ease-out" });
      });
    });
    closeButton.addEventListener("click", close);
    prev.addEventListener("click", function () { show(index - 1); });
    next.addEventListener("click", function () { show(index + 1); });
    dialog.addEventListener("cancel", function (event) { event.preventDefault(); close(); });
    dialog.addEventListener("close", function () {
      ++request;
      detachLoader();
      closing = false;
      img.hidden = true;
      if (opener && opener.isConnected !== false) opener.focus({ preventScroll: true });
    });
    dialog.addEventListener("keydown", function (event) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.target === source) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        show(index + (event.key === "ArrowLeft" ? -1 : 1));
      }
    });
    dialog.addEventListener("click", function (event) {
      if (event.target !== dialog) return;
      var rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
    });
  }
  window.AGANO = window.AGANO || {};
  window.AGANO.initGallery = initGallery;
})();
