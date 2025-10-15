(function () {
  function normalise(text) {
    return (text || '').toString().toLowerCase();
  }

  function defaultExtractor(card) {
    if (!card) return '';
    var fromAttr = card.getAttribute('data-search-text');
    if (fromAttr) return fromAttr;
    return card.textContent || '';
  }

  function setHidden(card, hiddenClass, hide) {
    if (!card) return;
    if (hide) {
      card.classList.add(hiddenClass);
      card.setAttribute('aria-hidden', 'true');
    } else {
      card.classList.remove(hiddenClass);
      card.removeAttribute('aria-hidden');
    }
  }

  function toggleEmpty(emptyEl, show) {
    if (!emptyEl) return;
    emptyEl.classList.toggle('is-visible', show);
  }

  function debounce(fn, delay) {
    var timer;
    return function () {
      var ctx = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(ctx, args);
      }, delay);
    };
  }

  window.initListingSearch = function initListingSearch(options) {
    var input = document.querySelector(options.inputSelector);
    var cards = Array.prototype.slice.call(document.querySelectorAll(options.cardsSelector));
    if (!input || !cards.length) return;

    var empty = document.querySelector(options.emptySelector);
    var hiddenClass = options.hiddenClass || 'is-hidden';
    var extractor = typeof options.extractor === 'function' ? options.extractor : defaultExtractor;

    var cache = cards.map(function (card) {
      return {
        card: card,
        text: normalise(extractor(card))
      };
    });

    function applyFilter(query) {
      var normalised = normalise(query.trim());
      if (!normalised) {
        cache.forEach(function (entry) {
          setHidden(entry.card, hiddenClass, false);
        });
        toggleEmpty(empty, false);
        return;
      }

      var parts = normalised.split(/\s+/).filter(Boolean);
      var matches = 0;

      cache.forEach(function (entry) {
        var isMatch = parts.every(function (token) {
          return entry.text.indexOf(token) !== -1;
        });
        setHidden(entry.card, hiddenClass, !isMatch);
        if (isMatch) matches += 1;
      });

      toggleEmpty(empty, matches === 0);
    }

    var handler = debounce(function () {
      applyFilter(input.value);
    }, options.debounce || 120);

    input.addEventListener('input', handler);

    input.addEventListener('change', function () {
      applyFilter(input.value);
    });

    input.addEventListener('search', function () {
      applyFilter(input.value);
    });
  };
})();
