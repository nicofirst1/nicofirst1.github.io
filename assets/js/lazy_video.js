// Card videos ship with preload="none" and no autoplay, so nothing downloads until
// a card scrolls into view. They play while visible and pause when scrolled away.
(function () {
  var videos = document.querySelectorAll('video[data-lazy]');
  if (!videos.length) return;
  // Reduced motion: keep the poster still.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) {
    videos.forEach(function (v) { v.play().catch(function () {}); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) e.target.play().catch(function () {});
      else e.target.pause();
    });
  }, { rootMargin: '200px' });
  videos.forEach(function (v) { io.observe(v); });
})();
