(() => {
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 document.querySelectorAll('video').forEach(video => {
  const target = video.id === 'mine-video' ? video.parentElement : video;
  let visible = false;
  video.muted = true;
  video.playsInline = true;
  video.autoplay = false;
  const sync = () => {
   if (visible && !document.hidden && !reduced.matches) {
    if(video.ended) video.currentTime = 0;
    video.play().catch(() => {});
   } else video.pause();
  };
  const observer = new IntersectionObserver(entries => {
   visible = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.2;
   sync();
  }, {threshold: [0, 0.2]});
  observer.observe(target);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
 });
})();
