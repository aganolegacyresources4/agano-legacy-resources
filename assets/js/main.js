/* Classic deferred script: works on static hosting and when index.html is opened locally. */
(function () {
  "use strict";
  var app = window.AGANO || {};
  ["initNavigation", "initContact", "initFilters", "initGallery", "initForms", "initMaps", "initEffects"].forEach(function (name) {
    if (typeof app[name] !== "function") return;
    try { app[name](); }
    catch (_) { console.warn("An optional page enhancement is unavailable."); }
  });
})();
