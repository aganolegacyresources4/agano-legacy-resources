/* A slow, uninterrupted take, with the full portrait frame retained at every width. */
(function () {
  'use strict';
  var canvas = document.getElementById('mine-canvas');
  var video = document.getElementById('mine-video');
  if (!canvas || !video) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var raf = 0;
  var ready = false;
  function draw() {
    if (!ready || video.readyState < 2) return;
    var w = canvas.width, h = canvas.height;
    var fill = Math.max(w / video.videoWidth, h / video.videoHeight) * 1.06;
    ctx.fillStyle = '#182126'; ctx.fillRect(0, 0, w, h);
    ctx.save(); ctx.filter = 'blur(24px)'; ctx.globalAlpha = 0.6;
    ctx.drawImage(video, (w - video.videoWidth * fill) / 2, (h - video.videoHeight * fill) / 2, video.videoWidth * fill, video.videoHeight * fill);
    ctx.restore();
    var fit = Math.min(w / video.videoWidth, h / video.videoHeight);
    ctx.drawImage(video, (w - video.videoWidth * fit) / 2, (h - video.videoHeight * fit) / 2, video.videoWidth * fit, video.videoHeight * fit);
    canvas.hidden = false;
  }
  function resize() {
    var box = canvas.parentElement.getBoundingClientRect();
    var ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(box.width * ratio); canvas.height = Math.round(box.height * ratio);
    draw();
  }
  function tick() { raf = 0; draw(); if (!video.paused && !video.ended) raf = requestAnimationFrame(tick); }
  video.addEventListener('loadeddata', function () { ready = true; resize(); });
  video.addEventListener('play', function () { if (!raf) raf = requestAnimationFrame(tick); });
  video.addEventListener('pause', function () { if (raf) cancelAnimationFrame(raf); raf = 0; draw(); });
  video.addEventListener('ended', draw);
  video.addEventListener('error', function () { canvas.hidden = true; });
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas.parentElement);
  else window.addEventListener('resize', resize);
  video.muted = true; video.loop = false;
  if (video.readyState >= 2) { ready = true; resize(); }
}());
