/**
 * GSAP Scroll Animations for Homepage
 * High-performance scroll-driven animations using ScrollTrigger
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Only run on homepage
    if (!document.querySelector('.site_main--home')) {
        return;
    }

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Mark body as GSAP loaded
    document.body.classList.add('gsap-loaded');

    // ===========================================
    // HERO SECTION ANIMATIONS
    // ===========================================

    // Hero content fade in and slide up
    gsap.from('.hero_greeting', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        delay: 0.1
    });

    // Hero title - staggered word reveal
    const heroTitle = document.querySelector('.hero_title');
    if (heroTitle) {
        // Split title into words for stagger effect
        const words = heroTitle.textContent.trim().split(' ');
        heroTitle.innerHTML = words.map(word => `<span class="hero-word" style="display: inline-block; opacity: 0;">${word}</span>`).join(' ');

        gsap.to('.hero-word', {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.07,
            ease: 'power3.out',
            delay: 0.25
        });
    }

    // Hero subtitle
    gsap.from('.hero_subtitle', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.5
    });

    // Hero description
    gsap.from('.hero_description', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.65
    });

    // Hero highlights list - staggered items
    gsap.from('.hero_list ul li', {
        x: -20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.07,
        ease: 'power2.out',
        delay: 0.8
    });

    // Hero actions (buttons)
    gsap.from('.hero_actions .btn', {
        y: 20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.95
    });

    // Hero social links
    gsap.from('.hero_social', {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        delay: 1.1
    });

    // Hero portrait - scale and fade in
    gsap.from('.hero_portrait_frame', {
        scale: 0.9,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.3
    });

    // Hero background scribbles - parallax effect
    gsap.to('.hero_scribble--one', {
        y: 100,
        rotation: 10,
        scrollTrigger: {
            trigger: '.hero_section',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5
        }
    });

    gsap.to('.hero_scribble--two', {
        y: -80,
        rotation: -8,
        scrollTrigger: {
            trigger: '.hero_section',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2
        }
    });

    // ===========================================
    // ACTIVITY SECTION ANIMATIONS
    // ===========================================

    // Section header fade in
    const activityHeader = document.querySelector('.activity_section .section_header');
    if (activityHeader) {
        gsap.from(activityHeader, {
            y: 50,
            opacity: 0,
            duration: 1,
            scrollTrigger: {
                trigger: activityHeader,
                start: 'top 85%',
                end: 'top 50%',
                scrub: 1
            }
        });
    }

    // Activity cards - staggered entrance
    const activityCards = document.querySelectorAll('.activity_card');
    activityCards.forEach((card, index) => {
        gsap.from(card, {
            y: 80,
            opacity: 0,
            duration: 1,
            scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                end: 'top 60%',
                scrub: 1
            },
            delay: index * 0.1
        });

        // Subtle parallax on scroll
        gsap.to(card, {
            y: -20,
            scrollTrigger: {
                trigger: '.activity_section',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 2
            }
        });
    });

    // Activity backdrop parallax
    const activityBackdrop = document.querySelector('.activity_backdrop');
    if (activityBackdrop) {
        gsap.to(activityBackdrop, {
            y: 150,
            scrollTrigger: {
                trigger: '.activity_section',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.5
            }
        });
    }

    // ===========================================
    // EXPERIENCE SECTION ANIMATIONS
    // ===========================================

    // Experience section header
    const experienceHeaders = document.querySelectorAll('.experience_section .section_header');
    experienceHeaders.forEach(header => {
        gsap.from(header, {
            y: 50,
            opacity: 0,
            duration: 1,
            scrollTrigger: {
                trigger: header,
                start: 'top 85%',
                end: 'top 55%',
                scrub: 1
            }
        });
    });

    // Experience cards - staggered entrance with scale
    const experienceCards = document.querySelectorAll('.experience_card');
    experienceCards.forEach((card, index) => {
        // Initial entrance animation
        gsap.from(card, {
            y: 60,
            opacity: 0,
            scale: 0.95,
            duration: 1,
            scrollTrigger: {
                trigger: card,
                start: 'top 88%',
                end: 'top 55%',
                scrub: 1
            }
        });

        // Logo subtle animation
        const logo = card.querySelector('.experience_logo');
        if (logo) {
            gsap.from(logo, {
                scale: 0.8,
                opacity: 0,
                duration: 0.8,
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    end: 'top 60%',
                    scrub: 1
                }
            });
        }
    });

    // ===========================================
    // SMOOTH TEXT BRIGHTENING EFFECT
    // ===========================================

    // Apply to specific text elements that should brighten on scroll
    const textElements = document.querySelectorAll('.hero_description, .section_header p, .activity_summary');
    textElements.forEach(element => {
        gsap.fromTo(element,
            {
                opacity: 0.6
            },
            {
                opacity: 1,
                scrollTrigger: {
                    trigger: element,
                    start: 'top 75%',
                    end: 'center 50%',
                    scrub: 1
                }
            }
        );

        // Fade back as it leaves viewport
        gsap.to(element, {
            opacity: 0.7,
            scrollTrigger: {
                trigger: element,
                start: 'center 40%',
                end: 'bottom 30%',
                scrub: 1
            }
        });
    });

    // ===========================================
    // SECTION KICKERS (Small labels)
    // ===========================================

    const sectionKickers = document.querySelectorAll('.section_kicker');
    sectionKickers.forEach(kicker => {
        gsap.from(kicker, {
            opacity: 0,
            letterSpacing: '0.2em',
            duration: 0.8,
            scrollTrigger: {
                trigger: kicker,
                start: 'top 80%',
                end: 'top 60%',
                scrub: 1
            }
        });
    });

    // ===========================================
    // LISTING PAGES - Blog, News, Projects
    // ===========================================

    // Page intro section animations (used on listing pages)
    const pageIntro = document.querySelector('.page_intro');
    if (pageIntro) {
        // Background fade in
        const pageIntroBg = pageIntro.querySelector('.page_intro_bg');
        if (pageIntroBg) {
            gsap.from(pageIntroBg, {
                opacity: 0,
                duration: 0.8,
                ease: 'power2.out'
            });
        }

        // Title slide in from left
        const pageIntroTitle = pageIntro.querySelector('.page_intro_title');
        if (pageIntroTitle) {
            gsap.from(pageIntroTitle, {
                x: -50,
                opacity: 0,
                duration: 0.7,
                delay: 0.15,
                ease: 'power3.out'
            });
        }

        // Text fade in
        const pageIntroText = pageIntro.querySelector('.page_intro_text');
        if (pageIntroText) {
            gsap.from(pageIntroText, {
                opacity: 0,
                duration: 0.6,
                delay: 0.35,
                ease: 'power2.out'
            });
        }
    }

    // Search bar fade in
    const listingSearch = document.querySelector('.listing_search');
    if (listingSearch) {
        gsap.from(listingSearch, {
            y: 20,
            opacity: 0,
            duration: 0.8,
            delay: 0.7,
            ease: 'power2.out'
        });
    }

    // Article/News cards stagger animation
    const articleCards = document.querySelectorAll('.article_card, .news_list_item');
    if (articleCards.length > 0) {
        articleCards.forEach((card, index) => {
            gsap.from(card, {
                y: 60,
                opacity: 0,
                duration: 0.8,
                delay: 0.8 + (index * 0.1),
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 90%',
                    end: 'top 60%',
                    toggleActions: 'play none none reverse'
                }
            });
        });
    }

    // Project cards stagger animation
    const projectCards = document.querySelectorAll('.project_card');
    if (projectCards.length > 0) {
        projectCards.forEach((card, index) => {
            gsap.from(card, {
                y: 60,
                scale: 0.95,
                opacity: 0,
                duration: 0.8,
                scrollTrigger: {
                    trigger: card,
                    start: 'top 90%',
                    end: 'top 60%',
                    scrub: 1
                }
            });
        });
    }

    // Projects group headers
    const projectsGroupHeaders = document.querySelectorAll('.projects_group_header');
    projectsGroupHeaders.forEach(header => {
        gsap.from(header, {
            x: -30,
            opacity: 0,
            duration: 1,
            scrollTrigger: {
                trigger: header,
                start: 'top 85%',
                end: 'top 60%',
                scrub: 1
            }
        });
    });

    // ===========================================
    // DETAIL PAGES - Blog Posts, News, Projects
    // ===========================================

    const detailPage = document.querySelector('[data-gsap-section="detail-page"]');
    if (detailPage) {
        // Title animation
        const detailTitle = detailPage.querySelector('h1');
        if (detailTitle) {
            gsap.from(detailTitle, {
                y: 30,
                opacity: 0,
                duration: 0.7,
                delay: 0.15,
                ease: 'power3.out'
            });
        }

        // Tag and date fade in
        const detailMeta = detailPage.querySelectorAll('b, .text-sm');
        detailMeta.forEach((meta, index) => {
            gsap.from(meta, {
                opacity: 0,
                duration: 0.6,
                delay: 0.5 + (index * 0.1),
                ease: 'power2.out'
            });
        });

        // Post metrics (blogs only)
        const postMetrics = detailPage.querySelector('.post_metrics');
        if (postMetrics) {
            gsap.from(postMetrics, {
                y: 20,
                opacity: 0,
                duration: 0.8,
                delay: 0.8,
                ease: 'power2.out'
            });
        }

        // Hero image reveal
        const postImage = detailPage.querySelector('.post-image, .project-image');
        if (postImage) {
            gsap.from(postImage, {
                scale: 0.95,
                opacity: 0,
                duration: 1,
                delay: 1,
                ease: 'power3.out'
            });
        }

        // Content fade in on scroll
        const pageContent = detailPage.querySelector('.page_content');
        if (pageContent) {
            // Animate paragraphs and headings within content
            const contentElements = pageContent.querySelectorAll('p, h2, h3, h4, ul, ol, blockquote, pre, img');
            contentElements.forEach((element, index) => {
                gsap.from(element, {
                    y: 30,
                    opacity: 0,
                    duration: 0.8,
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 85%',
                        end: 'top 60%',
                        toggleActions: 'play none none reverse'
                    }
                });
            });
        }

        // Prev/Next navigation
        const prevNext = document.querySelector('.prev_next');
        if (prevNext) {
            gsap.from(prevNext.querySelectorAll('a'), {
                y: 20,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                scrollTrigger: {
                    trigger: prevNext,
                    start: 'top 90%',
                    toggleActions: 'play none none reverse'
                }
            });
        }
    }

    // ===========================================
    // PERFORMANCE OPTIMIZATION
    // ===========================================

    // Debounced refresh on window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 250);
    });

    // Reduce motion for users who prefer it
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        // Reduced motion preference — kill scroll triggers and reset elements
        ScrollTrigger.getAll().forEach(trigger => {
            trigger.kill();
        });
        // Reset all elements to visible state
        gsap.set('.hero_greeting, .hero-word, .hero_subtitle, .hero_description, .hero_list ul li, .hero_actions .btn, .hero_social, .hero_portrait_frame, .activity_card, .experience_card, .article_card, .news_list_item, .project_card, .page_intro_title, .page_intro_text', {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1
        });
    }
});
