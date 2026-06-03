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

  function cardUrl(card) {
    var link = card.querySelector('a[href]');
    return link ? link.getAttribute('href') : null;
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
        url: cardUrl(card),
        text: normalise(extractor(card))
      };
    });

    // Lazy full-text index: cards only carry title + summary; the full post
    // bodies live in a JSON index fetched the first time the user searches.
    var fullTextByUrl = null;   // null = not loaded yet
    var indexPromise = null;

    function ensureIndex() {
      if (!options.indexUrl) return Promise.resolve();
      if (indexPromise) return indexPromise;
      indexPromise = fetch(options.indexUrl)
        .then(function (res) { return res.ok ? res.json() : []; })
        .then(function (list) {
          fullTextByUrl = {};
          (list || []).forEach(function (item) {
            if (item && item.url) fullTextByUrl[item.url] = normalise(item.text);
          });
        })
        .catch(function () { fullTextByUrl = {}; });   // degrade to title+summary
      return indexPromise;
    }

    function haystackFor(entry) {
      if (fullTextByUrl && entry.url && fullTextByUrl[entry.url]) {
        return entry.text + ' ' + fullTextByUrl[entry.url];
      }
      return entry.text;
    }

    function applyFilter(query) {
      var normalised = normalise(query.trim());
      if (!normalised) {
        cache.forEach(function (entry) {
          setHidden(entry.card, hiddenClass, false);
        });
        toggleEmpty(empty, false);
        return;
      }

      // Pull in the full-text index on first real query, then re-run.
      if (options.indexUrl && !fullTextByUrl) {
        ensureIndex().then(function () { applyFilter(input.value); });
      }

      var parts = normalised.split(/\s+/).filter(Boolean);
      var matches = 0;

      cache.forEach(function (entry) {
        var haystack = haystackFor(entry);
        var isMatch = parts.every(function (token) {
          return haystack.indexOf(token) !== -1;
        });
        setHidden(entry.card, hiddenClass, !isMatch);
        if (isMatch) matches += 1;
      });

      toggleEmpty(empty, matches === 0);
    }

    // Warm the index as soon as the user focuses the box, so the body is
    // usually ready by the time they finish typing.
    input.addEventListener('focus', ensureIndex);

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
