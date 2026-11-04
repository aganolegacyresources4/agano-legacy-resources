(function () {
  "use strict";
  var dialog = document.querySelector(".portrait-dialog");
  if (!dialog || typeof dialog.showModal !== "function") return;
  var lastTrigger = null;
  document.querySelectorAll(".portrait-open").forEach(function (button) {
    button.addEventListener("click", function () {
      var card = button.closest("article"), original = button.querySelector("img");
      lastTrigger = button;
      var image = dialog.querySelector(".portrait-large");
      image.src = original.currentSrc || original.src;
      image.alt = original.alt;
      dialog.querySelector("#portrait-dialog-name").textContent = card.querySelector("h3").textContent;
      dialog.querySelector(".portrait-dialog-role").textContent = card.querySelector(".founder-details p, .team-portrait-details p").textContent;
      dialog.showModal();
    });
  });
  dialog.querySelector(".portrait-close").addEventListener("click", function () { dialog.close(); });
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) {
      var bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    }
  });
  dialog.addEventListener("close", function () { if (lastTrigger) lastTrigger.focus(); });
})();
