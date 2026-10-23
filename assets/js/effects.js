/* Progressive motion: content is never hidden pending JavaScript or an observer. */
(function () {
  "use strict";
  var app = window.AGANO = window.AGANO || {};
  var running = new Map();
  function reduced() {
    return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  function stopMotion() {
    running.forEach(function (_, animation) { animation.cancel(); });
    running.clear();
  }
  function animate(element, frames, options) {
    if (!element || typeof element.animate !== "function" || reduced() || document.hidden) return null;
    try {
      var animation = element.animate(frames, options);
      running.set(animation, element);
      function done() { running.delete(animation); }
      if (animation.finished) animation.finished.then(done, done);
      return animation;
    } catch (_) { return null; }
  }
  function readingProgress(scroll, start, end) {
    if (end <= start) return scroll >= start ? 1 : 0;
    return Math.max(0, Math.min(1, (scroll - start) / (end - start)));
  }
  app.motion = Object.freeze({ animate: animate, reduced: reduced, stop: stopMotion });
  app.readingProgress = readingProgress;

  function initEffects() {
    var header = document.querySelector(".site-header");
    if (!header || header.dataset.effectsReady) return;
    header.dataset.effectsReady = "true";
    var dock = document.querySelector("[data-utility-dock]");
    var topLink = document.querySelector("[data-utility-top]");
    var article = document.querySelector("article.reading");
    var progress = null;
    var frame = 0, needsMeasure = true, start = 0, end = 1;
    var protectedAreas = new Set();
    var primaryNav = document.querySelector("#primary-nav");
    var navOpen = Boolean(primaryNav && primaryNav.classList.contains("is-open"));
    var suspended = false;
    var revealObserver = null, utilityObserver = null, resizeObserver = null;
    var candidates = new Set(document.querySelectorAll("[data-reveal], main .section-intro, main .section-head, main .full-media, main .portfolio-banner, main .grid-3 > .card, main .grid-4 > .card"));
    var motionPreference = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    if (article) {
      progress = document.createElement("progress");
      progress.className = "reading-progress";
      progress.max = 1;
      progress.value = 0;
      progress.setAttribute("aria-hidden", "true");
      header.append(progress);
    }
    function scrollPosition() { return window.scrollY || 0; }
    function measure(y) {
      if (article) {
        var rect = article.getBoundingClientRect();
        var headerHeight = header.getBoundingClientRect().height;
        start = rect.top + y - headerHeight;
        end = rect.bottom + y - window.innerHeight;
      }
      needsMeasure = false;
    }
    function updateDock(y) {
      if (!dock) return;
      var focused = dock.contains(document.activeElement);
      dock.hidden = (protectedAreas.size > 0 || navOpen) && !focused;
      if (topLink) topLink.hidden = y < Math.max(600, window.innerHeight * 1.2) && document.activeElement !== topLink;
    }
    function render() {
      frame = 0;
      if (suspended) return;
      var y = scrollPosition();
      if (needsMeasure) measure(y);
      header.classList.toggle("is-scrolled", y > 16);
      if (progress) progress.value = readingProgress(y, start, end);
      updateDock(y);
    }
    function schedule() {
      if (!frame && !suspended) frame = window.requestAnimationFrame(render);
    }
    function remeasure() { needsMeasure = true; schedule(); }
    function reveal(entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var element = entry.target;
        revealObserver.unobserve(element);
        candidates.delete(element);
        if (element.hidden || element.contains(document.activeElement)) return;
        var stagger = 0;
        if (element.classList.contains("card") && element.parentElement) {
          stagger = Math.min(3, Array.prototype.indexOf.call(element.parentElement.children, element)) * 55;
        }
        animate(element, [{ opacity: 0.72, transform: "translateY(12px)" }, { opacity: 1, transform: "none" }], {
          duration: 480, delay: stagger, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards"
        });
      });
    }
    function observeReveals() {
      if (revealObserver) revealObserver.disconnect();
      if (reduced() || suspended || typeof window.IntersectionObserver !== "function") return;
      revealObserver = new window.IntersectionObserver(reveal, { threshold: 0.08 });
      candidates.forEach(function (element) { revealObserver.observe(element); });
    }
    var utilityTargets = Array.prototype.slice.call(document.querySelectorAll("[data-enquiry-form], .site-footer"));
    function observeUtilities() {
      if (!dock || typeof window.IntersectionObserver !== "function") return;
      if (utilityObserver) utilityObserver.disconnect();
      utilityObserver = new window.IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) protectedAreas.add(entry.target);
          else protectedAreas.delete(entry.target);
        });
        schedule();
      }, { rootMargin: "32px 0px 64px 0px", threshold: 0 });
      utilityTargets.forEach(function (element) { utilityObserver.observe(element); });
      dock.classList.add("is-floating");
    }
    function preferenceChanged() {
      stopMotion();
      observeReveals();
      schedule();
    }
    function focusChanged(event) {
      running.forEach(function (element, animation) {
        if (element === event.target || element.contains(event.target)) animation.cancel();
      });
      schedule();
    }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure, { passive: true });
    window.addEventListener("load", remeasure, { once: true });
    window.addEventListener("beforeprint", stopMotion);
    window.addEventListener("pagehide", function () {
      suspended = true;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      if (revealObserver) revealObserver.disconnect();
      if (utilityObserver) utilityObserver.disconnect();
      if (resizeObserver) resizeObserver.disconnect();
      stopMotion();
    });
    window.addEventListener("pageshow", function (event) {
      if (!event.persisted) return;
      suspended = false;
      protectedAreas.clear();
      if (dock) dock.hidden = false;
      observeReveals();
      observeUtilities();
      if (resizeObserver) { resizeObserver.observe(article); resizeObserver.observe(header); }
      remeasure();
    });
    document.addEventListener("focusin", focusChanged);
    document.addEventListener("focusout", schedule);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopMotion();
      else remeasure();
    });
    document.addEventListener("agano:navigation", function (event) {
      navOpen = Boolean(event.detail && event.detail.open);
      remeasure();
    });
    if (motionPreference) {
      if (typeof motionPreference.addEventListener === "function") motionPreference.addEventListener("change", preferenceChanged);
      else if (typeof motionPreference.addListener === "function") motionPreference.addListener(preferenceChanged);
    }
    if (article && typeof window.ResizeObserver === "function") {
      resizeObserver = new window.ResizeObserver(remeasure);
      resizeObserver.observe(article);
      resizeObserver.observe(header);
    }
    observeReveals();
    observeUtilities();
    render();
  }
  app.initEffects = initEffects;
})();
