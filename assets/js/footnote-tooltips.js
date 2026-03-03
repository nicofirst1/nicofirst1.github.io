(function () {
  var tooltip = null;
  var hideTimer = null;

  function createTooltip() {
    var el = document.createElement('div');
    el.id = 'footnote-tooltip';
    el.setAttribute('role', 'tooltip');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
    return el;
  }

  function getTooltip() {
    if (!tooltip) {
      tooltip = createTooltip();
    }
    return tooltip;
  }

  function getFootnoteContent(href) {
    // href is like "#fn:home_bias" or "#fn:1"
    var id = href.replace(/^#/, '');
    var li = document.getElementById(id);
    if (!li) return null;

    // Clone the li content, strip the backref arrow link
    var clone = li.cloneNode(true);
    var backref = clone.querySelector('.reversefootnote');
    if (backref) backref.remove();

    return clone.innerHTML.trim();
  }

  function positionTooltip(tip, refEl) {
    // Start hidden to measure
    tip.style.visibility = 'hidden';
    tip.style.display = 'block';

    var refRect = refEl.getBoundingClientRect();
    var tipRect = tip.getBoundingClientRect();
    var scrollY = window.scrollY || window.pageYOffset;
    var scrollX = window.scrollX || window.pageXOffset;
    var viewportW = window.innerWidth || document.documentElement.clientWidth;

    var top = refRect.bottom + scrollY + 8;
    var left = refRect.left + scrollX + refRect.width / 2 - tipRect.width / 2;

    // Keep within viewport horizontally
    var margin = 12;
    if (left < margin) left = margin;
    if (left + tipRect.width > viewportW - margin) {
      left = viewportW - tipRect.width - margin;
    }

    tip.style.top = top + 'px';
    tip.style.left = left + 'px';
    tip.style.visibility = 'visible';
  }

  function showTooltip(refEl, content) {
    clearTimeout(hideTimer);
    var tip = getTooltip();
    tip.innerHTML = content;
    positionTooltip(tip, refEl);
    tip.classList.add('is-visible');
  }

  function hideTooltip() {
    hideTimer = setTimeout(function () {
      if (tooltip) {
        tooltip.classList.remove('is-visible');
      }
    }, 120);
  }

  function initFootnoteTooltips() {
    var content = document.querySelector('.page_content');
    if (!content) return;

    // Kramdown renders footnote refs as sup > a[href^="#fn:"]
    var refs = content.querySelectorAll('sup a[href^="#fn:"]');
    if (!refs.length) return;

    refs.forEach(function (ref) {
      var fnContent = getFootnoteContent(ref.getAttribute('href'));
      if (!fnContent) return;

      ref.addEventListener('mouseenter', function () {
        showTooltip(ref, fnContent);
      });

      ref.addEventListener('mouseleave', function () {
        hideTooltip();
      });

      ref.addEventListener('focus', function () {
        showTooltip(ref, fnContent);
      });

      ref.addEventListener('blur', function () {
        hideTooltip();
      });
    });

    // Keep tooltip open if mouse moves into it
    document.addEventListener('mouseover', function (e) {
      if (tooltip && tooltip.contains(e.target)) {
        clearTimeout(hideTimer);
      }
    });

    document.addEventListener('mouseout', function (e) {
      if (tooltip && tooltip.contains(e.target) && !tooltip.contains(e.relatedTarget)) {
        hideTooltip();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initFootnoteTooltips);
})();
