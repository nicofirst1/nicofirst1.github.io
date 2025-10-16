(function () {
  function getTextNodesContent(root) {
    if (!root) return '';
    return root.textContent || '';
  }

  function tokenizeWords(text) {
    if (!text) return [];
    var matches = text.toLowerCase().match(/[a-z0-9']+/g);
    return matches || [];
  }

  function countSentences(text) {
    if (!text) return 0;
    var cleaned = text.replace(/[\r\n]+/g, ' ').trim();
    if (!cleaned) return 0;
    var matches = cleaned.match(/[.!?]+/g);
    return matches ? matches.length : 1;
  }

  function countSyllables(word) {
    if (!word) return 0;
    var cleaned = word
      .toLowerCase()
      .replace(/[^a-z]/g, '');
    if (!cleaned) return 0;
    if (cleaned.length <= 3) return 1;
    cleaned = cleaned
      .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
      .replace(/^y/, '');
    var matches = cleaned.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  function readabilityLabel(score) {
    if (score >= 90) return 'Very easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly difficult';
    if (score >= 30) return 'Difficult';
    return 'Very confusing';
  }

  function computeMetrics(text) {
    var words = tokenizeWords(text);
    var wordCount = words.length;
    var sentenceCount = Math.max(1, countSentences(text));
    var syllableCount = 0;

    for (var i = 0; i < words.length; i += 1) {
      syllableCount += countSyllables(words[i]);
    }

    var readingEase = wordCount > 0
      ? 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount)
      : 0;

    var readingTimeMinutes = wordCount > 0
      ? Math.max(1, Math.round(wordCount / 200))
      : 0;

    return {
      wordCount: wordCount,
      sentenceCount: sentenceCount,
      syllableCount: syllableCount,
      readingEase: readingEase,
      readingTimeMinutes: readingTimeMinutes
    };
  }

  function initPostMetrics() {
    var metricsContainer = document.querySelector('[data-post-metrics]');
    if (!metricsContainer) return;

    var contentEl = document.querySelector('.page_content');
    if (!contentEl) return;

    var text = getTextNodesContent(contentEl);
    var metrics = computeMetrics(text);

    var easeEl = metricsContainer.querySelector('[data-reading-ease]');
    if (easeEl) {
      var strong = easeEl.querySelector('strong');
      var summary = Math.round(metrics.readingEase) + ' (' + readabilityLabel(metrics.readingEase) + ')';
      if (strong) {
        strong.textContent = summary;
      } else {
        easeEl.textContent = 'Reading ease: ' + summary;
      }
    }

    // Keep the numbers in sync if the Liquid approximation differs notably.
    if (metrics.wordCount > 0) {
      var wordEl = metricsContainer.querySelector('[data-word-count-text] strong');
      if (wordEl && wordEl.textContent) {
        var liquidCount = parseInt(metricsContainer.getAttribute('data-word-count'), 10);
        if (!liquidCount || Math.abs(liquidCount - metrics.wordCount) > Math.ceil(liquidCount * 0.05)) {
          wordEl.textContent = metrics.wordCount;
          metricsContainer.setAttribute('data-word-count', metrics.wordCount);
        }
      }
    }

    if (metrics.readingTimeMinutes > 0) {
      metricsContainer.setAttribute('data-reading-time', metrics.readingTimeMinutes);
      var timeEl = metricsContainer.querySelector('[data-reading-time-text] strong');
      if (timeEl) {
        timeEl.textContent = metrics.readingTimeMinutes;
      }
    }
  }

  function slugify(text) {
    if (!text) return '';
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  function initHeadingAnchors() {
    var contentEl = document.querySelector('.page_content');
    if (!contentEl) return;

    var headings = contentEl.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (!headings.length) return;

    var used = {};

    for (var i = 0; i < headings.length; i += 1) {
      var existingId = headings[i].id;
      if (existingId) {
        used[existingId] = true;
      }
    }

    for (var j = 0; j < headings.length; j += 1) {
      var heading = headings[j];
      var id = heading.id;

      if (!id) {
        var base = slugify(heading.textContent);
        if (!base) continue;

        var unique = base;
        var counter = 2;
        while (used[unique]) {
          unique = base + '-' + counter;
          counter += 1;
        }

        id = unique;
        heading.id = id;
      }

      used[id] = true;

      if (heading.classList.contains('has-anchor')) continue;
      if (heading.querySelector('.heading_anchor_link')) continue;

      var anchor = document.createElement('a');
      anchor.className = 'heading_anchor_link';
      anchor.href = '#' + id;

      var label = heading.textContent ? heading.textContent.trim() : '';
      anchor.setAttribute('aria-label', label ? label + ' (section link)' : 'Section link');

      anchor.innerHTML = heading.innerHTML;
      heading.innerHTML = '';
      heading.appendChild(anchor);

      var icon = document.createElement('span');
      icon.className = 'heading_anchor_icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '#';

      anchor.appendChild(icon);
      heading.classList.add('has-anchor');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initPostMetrics();
    initHeadingAnchors();
  });
})();
