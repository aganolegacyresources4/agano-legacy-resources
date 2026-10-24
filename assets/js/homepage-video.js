/* A pre-edited loop, with the full portrait frame retained at every width. */
(function () {
  'use strict';
  var canvas = document.getElementById('mine-canvas');
  var video = document.getElementById('mine-video');
  var toggle = document.getElementById('play-toggle');
  if (!canvas || !video || !toggle) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var raf = 0;
  var ready = false;
  function update() {
    toggle.textContent = video.paused ? 'Play video' : 'Pause video';
    toggle.setAttribute('aria-label', video.paused ? 'Play background video' : 'Pause background video');
  }
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
  function play() { video.play().catch(update); }
  video.addEventListener('loadeddata', function () { ready = true; resize(); toggle.hidden = false; if (!motion.matches) play(); });
  video.addEventListener('play', function () { update(); if (!raf) raf = requestAnimationFrame(tick); });
  video.addEventListener('pause', function () { update(); if (raf) cancelAnimationFrame(raf); raf = 0; draw(); });
  video.addEventListener('error', function () { canvas.hidden = true; toggle.hidden = true; });
  toggle.addEventListener('click', function () { if (video.paused) play(); else video.pause(); });
  if (motion.addEventListener) motion.addEventListener('change', function () { if (motion.matches) video.pause(); });
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas.parentElement);
  else window.addEventListener('resize', resize);
  video.muted = true; video.loop = true;
  if (video.readyState >= 2) { ready = true; resize(); toggle.hidden = false; if (!motion.matches) play(); }
  update();
}());
