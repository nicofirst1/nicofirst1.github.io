// carousel.js

document.addEventListener("DOMContentLoaded", function() {
    let currentPage = 0;
    let isAnimating = false;
    const animationDuration = 700;
    let autoSlideTimer = null;

    const activitySection = document.querySelector('.activity');
    if (!activitySection) return;

    const totalPages = parseInt(activitySection.getAttribute('data-total-pages'), 10) || 1;
    const carouselItems = document.querySelectorAll(".carousel-item");
    const carousel = document.querySelector('.carousel-inner');
    if (!carousel || carouselItems.length === 0) return;

    const setCarouselHeight = (item) => {
        if (!item) return;
        const targetHeight = item.offsetHeight;
        if (targetHeight) {
            carousel.style.height = `${targetHeight}px`;
        }
    };

    function prepareSlide(item, state) {
        item.style.display = 'block';
        item.style.transition = 'none';
        item.style.opacity = state === 'active' ? '1' : '0';
        item.style.transform = state === 'active' ? 'translateX(0)' : `translateX(${state === 'next' ? '8%' : '-8%'})`;
        item.style.filter = state === 'active' ? 'blur(0)' : 'blur(14px)';
        void item.offsetWidth;
        item.style.transition = 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.7s ease, filter 0.7s ease';
    }

    function animateSlide(currentItem, nextItem, direction) {
        const isNext = direction === 'next';
        prepareSlide(nextItem, 'next');
        prepareSlide(currentItem, 'active');
        setCarouselHeight(nextItem);

        requestAnimationFrame(() => {
            currentItem.style.transform = `translateX(${isNext ? '-8%' : '8%'})`;
            currentItem.style.opacity = '0';
            currentItem.style.filter = 'blur(16px)';
            nextItem.style.transform = 'translateX(0)';
            nextItem.style.opacity = '1';
            nextItem.style.filter = 'blur(0)';
        });
    }

    function showPage(page, direction) {
        if (isAnimating) return;
        isAnimating = true;

        const currentItem = document.querySelector(".carousel-item.active");
        const nextItem = carouselItems[page];

        animateSlide(currentItem, nextItem, direction);

        setTimeout(() => {
            currentItem.style.display = 'none';
            currentItem.style.transition = '';
            currentItem.style.transform = '';
            currentItem.style.opacity = '';
            currentItem.style.filter = '';
            currentItem.classList.remove('active');

            nextItem.style.transition = '';
            nextItem.style.transform = '';
            nextItem.style.opacity = '';
            nextItem.style.filter = '';
            nextItem.style.display = '';
            nextItem.classList.add('active');
            setCarouselHeight(nextItem);
            isAnimating = false;
        }, animationDuration);
    }

    function scheduleAutoSlide() {
        if (autoSlideTimer) clearInterval(autoSlideTimer);
        autoSlideTimer = setInterval(() => nextPage(true), 9000);
    }

    function nextPage(fromAuto = false) {
        if (isAnimating) return;
        const nextPageIndex = (currentPage + 1) % totalPages;
        showPage(nextPageIndex, 'next');
        currentPage = nextPageIndex;
        if (!fromAuto) scheduleAutoSlide();
    }

    function prevPage() {
        if (isAnimating) return;
        const prevPageIndex = (currentPage - 1 + totalPages) % totalPages;
        showPage(prevPageIndex, 'prev');
        currentPage = prevPageIndex;
        scheduleAutoSlide();
    }

    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;
    carousel.addEventListener('touchstart', e => {
        if (isAnimating) return;
        if (autoSlideTimer) clearInterval(autoSlideTimer);
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    carousel.addEventListener('touchend', e => {
        if (isAnimating) return;
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        scheduleAutoSlide();
    }, false);

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextPage();
            } else {
                prevPage();
            }
        }
    }

    // Attach next/prev functions to global scope for buttons
    window.nextPage = nextPage;
    window.prevPage = prevPage;

    carouselItems[0].classList.add('active');
    carouselItems[0].style.display = 'block';
    setCarouselHeight(carouselItems[0]);
    window.addEventListener('resize', () => {
        const activeItem = document.querySelector('.carousel-item.active');
        setCarouselHeight(activeItem);
    });
    scheduleAutoSlide();
});
