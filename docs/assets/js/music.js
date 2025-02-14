// music.js
document.addEventListener("DOMContentLoaded", function() {
  const albumWrappers = document.querySelectorAll("[class^='swiper swiper-album-']");
  albumWrappers.forEach((wrapper, index) => {
    new Swiper(".swiper-album-" + (index + 1), {
      slidesPerView: 1,
      loop: false,
      pagination: {
        el: ".swiper-album-" + (index + 1) + " .swiper-pagination",
        clickable: true
      },
      navigation: {
        nextEl: ".swiper-album-" + (index + 1) + " .swiper-button-next",
        prevEl: ".swiper-album-" + (index + 1) + " .swiper-button-prev"
      }
    });
  });

  // Click lyric lines -> show explanation
  const lyricLines = document.querySelectorAll(".lyric-line");
  lyricLines.forEach(line => {
    line.addEventListener("click", () => {
      const explanation = line.getAttribute("data-explanation") || "";
      const parentSlide = line.closest(".swiper-slide");
      if (!parentSlide) return;

      const explanationDiv = parentSlide.querySelector(".explanation-area");
      if (explanationDiv) {
        explanationDiv.innerHTML = `<p>${explanation}</p>`;
      }
    });
  });
});
