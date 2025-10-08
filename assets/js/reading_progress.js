document.addEventListener("DOMContentLoaded", function () {
  const progressBar = document.getElementById("reading-progress");
  if (!progressBar) return;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const update = () => {
    const docEl = document.documentElement;
    const scrollTop = window.pageYOffset || docEl.scrollTop || 0;
    const docHeight = docEl.scrollHeight - docEl.clientHeight; // more robust than window.innerHeight
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = clamp(pct, 0, 100) + "%";
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update(); // set initial width
});
