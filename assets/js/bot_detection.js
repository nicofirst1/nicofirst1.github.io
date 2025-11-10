(function () {
    const detection = {
        humanDetected: false,
        botFlagged: false,
        signals: [],
        startTime: Date.now()
    };
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    
    // Check for common bot indicators
    function checkBotIndicators() {
        const indicators = [];

        // Check for headless browser indicators
        if (navigator.webdriver) {
            indicators.push('webdriver_detected');
        }

        // Check for common automation frameworks
        if (window.navigator.languages && window.navigator.languages.length === 0) {
            indicators.push('no_languages');
        }

        // Check for missing plugins (unusual for real browsers)
        if (navigator.plugins && navigator.plugins.length === 0) {
            indicators.push('no_plugins');
        }

        // Check for Chrome headless
        if (/HeadlessChrome/.test(navigator.userAgent)) {
            indicators.push('headless_chrome');
        }

        // Check for PhantomJS
        if (window._phantom || window.callPhantom) {
            indicators.push('phantomjs');
        }

        // Check for suspicious window dimensions
        if (window.outerWidth === 0 || window.outerHeight === 0) {
            indicators.push('zero_dimensions');
        }

        // Check for automation properties
        if (window.document.documentElement.getAttribute('webdriver')) {
            indicators.push('webdriver_attribute');
        }

        return indicators;
    }

    // Record human-like behavior signals
    function recordSignal(type, data = {}) {
        detection.signals.push({
            type,
            timestamp: Date.now() - detection.startTime,
            ...data
        });
    }

    // Calculate human probability score
    function calculateHumanScore() {
        let score = 50; // Start neutral

        // Positive signals (human-like)
        const hasMouseMove = detection.signals.some(s => s.type === 'mousemove');
        const hasScroll = detection.signals.some(s => s.type === 'scroll');
        const hasClick = detection.signals.some(s => s.type === 'click');
        const hasKeyboard = detection.signals.some(s => s.type === 'keydown');
        const hasTouch = detection.signals.some(s => s.type === 'touchstart');

        if (hasMouseMove) score += 20;
        if (hasScroll) score += 15;
        if (hasClick) score += 25;
        if (hasKeyboard) score += 20;
        if (hasTouch) score += 20;

        // Check for natural mouse movement patterns
        const mouseMoves = detection.signals.filter(s => s.type === 'mousemove');
        if (mouseMoves.length > 3) {
            score += 10; // Multiple mouse movements
        }

        // Negative signals (bot-like)
        const botIndicators = checkBotIndicators();
        score -= botIndicators.length * 15;

        // Time-based: too fast actions might be bot
        if (detection.signals.length > 0 && detection.signals[0].timestamp < 100) {
            score -= 10; // Suspiciously fast
        }

        return Math.max(0, Math.min(100, score));
    }

    // Mark as confirmed human
    function markHuman(reason) {
        if (detection.humanDetected || detection.botFlagged) return;

        detection.humanDetected = true;
        const score = calculateHumanScore();

        gtag('event', 'confirmed_human', {
            event_category: 'bot_detection',
            event_label: reason,
            value: score,
            human_score: score,
            time_to_interaction: Date.now() - detection.startTime,
            signal_count: detection.signals.length,
            non_interaction: false
        });

        console.log('Human detected:', reason, 'Score:', score);
    }

    // Mark as likely bot
    function markBot(reason) {
        if (detection.botFlagged || detection.humanDetected) return;

        detection.botFlagged = true;
        const score = calculateHumanScore();
        const botIndicators = checkBotIndicators();

        gtag('event', 'likely_bot', {
            event_category: 'bot_detection',
            event_label: reason,
            value: score,
            human_score: score,
            bot_indicators: botIndicators.join(','),
            time_on_page: Date.now() - detection.startTime,
            non_interaction: true
        });

        console.log('Bot detected:', reason, 'Score:', score, 'Indicators:', botIndicators);
    }

    // Mouse movement tracking
    let mouseMoveCount = 0;
    let lastMouseTime = 0;

    function handleMouseMove(e) {
        const now = Date.now();
        if (now - lastMouseTime > 50) { // Throttle
            mouseMoveCount++;
            lastMouseTime = now;
            recordSignal('mousemove', {
                x: e.clientX,
                y: e.clientY
            });

            if (mouseMoveCount >= 3) {
                markHuman('natural mouse movement');
            }
        }
    }

    // Scroll tracking
    let scrollCount = 0;

    function handleScroll() {
        scrollCount++;
        recordSignal('scroll', {
            position: window.scrollY
        });

        if (scrollCount >= 2) {
            markHuman('scroll interaction');
        }
    }

    // Click tracking
    function handleClick(e) {
        recordSignal('click', {
            x: e.clientX,
            y: e.clientY
        });
        markHuman('click interaction');
    }

    // Keyboard tracking
    function handleKeydown(e) {
        recordSignal('keydown', {
            key: e.key
        });
        markHuman('keyboard interaction');
    }

    // Touch tracking
    function handleTouch(e) {
        recordSignal('touchstart');
        markHuman('touch interaction');
    }

    // Event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('touchstart', handleTouch);

    // Page visibility change (early exit detection)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && !detection.humanDetected) {
            markBot('page hidden before interaction');
        }
    });

    // Initial bot check
    const initialBotIndicators = checkBotIndicators();
    if (initialBotIndicators.length >= 3) {
        // Multiple bot indicators present
        setTimeout(() => {
            if (!detection.humanDetected) {
                markBot('multiple bot indicators: ' + initialBotIndicators.join(','));
            }
        }, 2000);
    }

    // Timeout fallback
    setTimeout(() => {
        if (!detection.humanDetected && !detection.botFlagged) {
            const score = calculateHumanScore();
            if (score < 40) {
                markBot('no interaction after 8s, low score');
            } else {
                // Uncertain - user might just be reading
                gtag('event', 'uncertain_visitor', {
                    event_category: 'bot_detection',
                    event_label: 'passive behavior',
                    human_score: score,
                    non_interaction: true
                });
            }
        }
    }, 8000);

    // Expose for debugging
    window.botDetection = detection;
})();