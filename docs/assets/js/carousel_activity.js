// carousel.js

document.addEventListener("DOMContentLoaded", function() {
    let currentPage = 0;
    let isAnimating = false;
    const animationDuration = 500;

    const totalPages = parseInt(document.querySelector('.activity').getAttribute('data-total-pages'), 10) || 1;
    const carouselItems = document.querySelectorAll(".carousel-item");
    
    // Initialize first page
    carouselItems[0].classList.add('active');

    function setInitialPosition(element, direction) {
        element.style.transition = 'none';
        element.style.transform = `translateX(${direction === 'next' ? '100%' : '-100%'})`;
        // Force reflow
        void element.offsetWidth;
        element.style.transition = 'transform 0.5s ease';
    }

    function animateSlide(currentItem, nextItem, direction) {
        // Set initial position of the next item
        nextItem.style.display = 'block';
        setInitialPosition(nextItem, direction);

        // Animate both items
        requestAnimationFrame(() => {
            currentItem.style.transform = `translateX(${direction === 'next' ? '-100%' : '100%'})`;
            nextItem.style.transform = 'translateX(0)';
        });
    }

    function showPage(page, direction) {
        if (isAnimating) return;
        isAnimating = true;

        const currentItem = document.querySelector(".carousel-item.active");
        const nextItem = carouselItems[page];

        animateSlide(currentItem, nextItem, direction);

        // Update classes and clean up
        currentItem.classList.remove('active');
        nextItem.classList.add('active');

        setTimeout(() => {
            currentItem.style.display = 'none';
            currentItem.style.transform = '';
            nextItem.style.transform = '';
            isAnimating = false;
        }, animationDuration);
    }

    function nextPage() {
        if (isAnimating) return;
        const nextPageIndex = (currentPage + 1) % totalPages;
        showPage(nextPageIndex, 'next');
        currentPage = nextPageIndex;
    }
    // Auto-slide every 10 seconds
    setInterval(nextPage, 10000);


    function prevPage() {
        if (isAnimating) return;
        const prevPageIndex = (currentPage - 1 + totalPages) % totalPages;
        showPage(prevPageIndex, 'prev');
        currentPage = prevPageIndex;
    }

    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;
    const carousel = document.querySelector('.carousel-inner');

    carousel.addEventListener('touchstart', e => {
        if (isAnimating) return;
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    carousel.addEventListener('touchend', e => {
        if (isAnimating) return;
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
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
});