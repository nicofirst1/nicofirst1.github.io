if ("ontouchstart" in document.documentElement)
{

}
else
{

    /**
     * demo.js
     * http://www.codrops.com
     *
     * Licensed under the MIT license.
     * http://www.opensource.org/licenses/mit-license.php
     *
     * Copyright 2018, Codrops
     * http://www.codrops.com
     */
    {
        const mapNumber = (X,A,B,C,D) => (X-A)*(D-C)/(B-A)+C;
        // from http://www.quirksmode.org/js/events_properties.html#position
        const getMousePos = (e) => {
            let posx = 0;
            let posy = 0;
            if (!e) e = window.event;
            if (e.pageX || e.pageY) {
                posx = e.pageX;
                posy = e.pageY;
            }
            else if (e.clientX || e.clientY) 	{
                posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }
            return { x : posx, y : posy}
        }
        // Generate a random float.
        const getRandomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);

        /**
         * One class per effect.
         * Lots of code is repeated, so that single effects can be easily used.
         */

            // Effect 5
        class HoverImgFx5 {
            constructor(el) {
                this.DOM = {el: el};

                this.DOM.reveal = document.createElement('div');
                this.DOM.reveal.className = 'hover-reveal';
                this.DOM.reveal.innerHTML = `<div class="hover-reveal__deco"></div><div class="hover-reveal__inner"><div class="hover-reveal__img" style="background-image:url(${this.DOM.el.dataset.img})"></div></div>`;
                this.DOM.el.appendChild(this.DOM.reveal);
                this.DOM.revealInner = this.DOM.reveal.querySelector('.hover-reveal__inner');
                this.DOM.revealInner.style.overflow = 'hidden';
                this.DOM.revealDeco = this.DOM.reveal.querySelector('.hover-reveal__deco');
                this.DOM.revealImg = this.DOM.revealInner.querySelector('.hover-reveal__img');
                //charming(this.DOM.el);
                this.initEvents();
            }
            initEvents() {
                this.positionElement = (ev) => {
                    const mousePos = getMousePos(ev);
                    const docScrolls = {
                        left : document.body.scrollLeft + document.documentElement.scrollLeft,
                        top : document.body.scrollTop + document.documentElement.scrollTop
                    };
                    this.DOM.reveal.style.top = `${mousePos.y+0-docScrolls.top}px`;
                    this.DOM.reveal.style.left = `${mousePos.x+0-docScrolls.left}px`;
                };
                this.mouseenterFn = (ev) => {
                    this.positionElement(ev);
                    this.showImage();
                };
                this.mousemoveFn = ev => requestAnimationFrame(() => {
                    this.positionElement(ev);
                });
                this.mouseleaveFn = () => {
                    this.hideImage();
                };

                this.DOM.el.addEventListener('mouseenter', this.mouseenterFn);
                this.DOM.el.addEventListener('mousemove', this.mousemoveFn);
                this.DOM.el.addEventListener('mouseleave', this.mouseleaveFn);
            }
            showImage() {
                TweenMax.killTweensOf(this.DOM.revealInner);
                TweenMax.killTweensOf(this.DOM.revealImg);
                TweenMax.killTweensOf(this.DOM.revealDeco);

                this.tl = new TimelineMax({
                    onStart: () => {
                        this.DOM.reveal.style.opacity = 1;
                        TweenMax.set(this.DOM.el, {zIndex: 1000});
                    }
                })
                    .set(this.DOM.revealInner, {opacity: 0})
                    .add('begin')
                    .add(new TweenMax(this.DOM.revealDeco, 1.5, {
                        ease: Expo.easeOut,
                        startAt: {opacity: 0, scale: 0, rotation: 35},
                        opacity: 1,
                        scale: 1,
                        rotation: 0
                    }), 'begin')
                    .add(new TweenMax(this.DOM.revealInner, 1.0, {
                        ease: Expo.easeOut,
                        startAt: {scale: 0, rotation: 35},
                        rotation: 0,
                        scale: 1,
                        opacity: 1
                    }), 'begin+=0.25')
                    .add(new TweenMax(this.DOM.revealImg, 1.0, {
                        ease: Expo.easeOut,
                        startAt: {rotation: -35, scale: 2},
                        rotation: 0,
                        scale: 1
                    }), 'begin+=0.15')
            }
            hideImage() {
                TweenMax.killTweensOf(this.DOM.revealInner);
                TweenMax.killTweensOf(this.DOM.revealImg);
                TweenMax.killTweensOf(this.DOM.revealDeco);

                this.tl = new TimelineMax({
                    onStart: () => {
                        TweenMax.set(this.DOM.el, {zIndex: 999});
                    },
                    onComplete: () => {
                        TweenMax.set(this.DOM.el, {zIndex: ''});
                        TweenMax.set(this.DOM.reveal, {opacity: 0});
                    }
                })
                    .add('begin')
                    .add(new TweenMax([this.DOM.revealDeco, this.DOM.revealInner], 0.2, {
                        ease: Expo.easeOut,
                        opacity: 0,
                        scale: 0.9
                    }), 'begin')
            }
        }

        [...document.querySelectorAll('[data-fx="5"] > a, a[data-fx="5"]')].forEach(link => new HoverImgFx5(link));

        // Demo purspose only: Preload all the images in the page..
        const contentel = document.querySelector('.content');
        [...document.querySelectorAll('.block__title, .block__link, .content__text-link')].forEach((el) => {
            const imgsArr = el.dataset.img.split(',');
            for (let i = 0, len = imgsArr.length; i <= len-1; ++i ) {
                const imgel = document.createElement('img');
                imgel.style.visibility = 'hidden';
                imgel.style.width = 0;
                imgel.src = imgsArr[i];
                imgel.className = 'preload';
                contentel.appendChild(imgel);
            }
        });
        imagesLoaded(document.querySelectorAll('.preload'), () => document.body.classList.remove('loading'));
    }
}

$(document).ready(function () {

    /** Mouse **/
    var circle = document.querySelector(".circle");

    TweenLite.set(circle, {
        xPercent: -50,
        yPercent: -50
    });

    window.addEventListener("mousemove", moveCircle);

    function moveCircle(e) {
        TweenLite.to(circle, 0.2, {
            x: e.clientX,
            y: e.clientY
        });
    }

    /** Mouse hover **/
    $( "a, .image-wrapper" ).mouseover(function() {
        $( ".circle" ).addClass( "circle-hover" );
    }).mouseleave(function() {
        $( ".circle" ).removeClass( "circle-hover" );
    });

    /** Random margin **/
    $(".work .item").each(function() {
        var numRand = Math.floor(Math.random()*40)+ 2 ;
        $(this).css({'padding-left': numRand+"vw"});
    });

    /** Parallax **/
    $(window).scroll(function(e){
        parallaxScroll();
    });

    if (parseInt($(window).width()) < 1024) {
        function parallaxScroll(){
            var scrolled = $(window).scrollTop();
            $('#parallax-bg-1').css('top',(15-(scrolled*.01))+'vw');
            $('#kitchen-image-1').css('top',(15-(scrolled*.01))+'vw');
        }
    }

        function parallaxScroll(){
            var scrolled = $(window).scrollTop();
            $('#parallax-bg-1').css('top',(15-(scrolled*.01))+'vw');
            $('#kitchen-image-1').css('top',(-10-(scrolled*.01))+'vw');
            $('#kitchen-image-3').css('top',(0-(scrolled*.25))+'px');
            $('#kitchen-image-4').css('top',(400-(scrolled*.15))+'px');
        }

    /** Transition trigger **/
    $(".work .item a, .back-link a, .cv-link").click(function() {
        $("main").css("opacity","0");
        $(".circle").css("opacity","0");
        $(".back-link").css("opacity","0");

        var href = $(this).attr('href');

        setTimeout(function() {window.location = href}, 2000);
        return false;
    });

    /** cv hover trigger **/
    $(".cv-category-content").mouseenter(function() {
        $(this).children( ".what, .where" ).css( "background-color", "var(--lime)" );
    });
    $(".cv-category-content").mouseleave(function() {
        $(this).children( ".what, .where" ).css( "background-color", "transparent" );
    });
});