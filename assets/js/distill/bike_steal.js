(function () {
  'use strict';

  var COL = {
    dot:    '#c2410c',
    dotHov: '#9a3412',
    line:   '#f97316',
    ref:    'rgba(194,65,12,0.15)',
    tick:   '#92400e',
    bg:     'rgba(255,247,237,0.96)',
    border: 'rgba(194,65,12,0.25)',
  };

  function makeTooltip(container) {
    return d3.select(container)
      .append('div')
      .attr('class', 'viz-tooltip')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('background', COL.bg)
      .style('border', '1px solid ' + COL.border)
      .style('border-radius', '6px')
      .style('padding', '5px 10px')
      .style('font-size', '12px')
      .style('color', COL.tick)
      .style('line-height', '1.5')
      .style('opacity', 0)
      .style('transition', 'opacity .12s');
  }

  function moveTooltip(tip, event, container) {
    var r = container.getBoundingClientRect();
    tip.style('left', (event.clientX - r.left + 12) + 'px')
       .style('top',  (event.clientY - r.top  - 32) + 'px');
  }

  function drawCollection(el) {
    var csvPath = (typeof baseUrl !== 'undefined' ? baseUrl : '')
                + '/assets/data/LockDigits.csv';

    d3.csv(csvPath).then(function (raw) {

      var parseDMY = d3.timeParse('%d/%m/%Y');

      var rows = raw.map(function (r) {
        return { date: parseDMY(r.Date.trim()), code: r.Code.trim() };
      }).filter(function (r) { return r.date !== null; });

      rows.sort(function (a, b) { return a.date - b.date; });
      rows.forEach(function (r, i) { r.cumulative = i + 1; });

      var W  = Math.max(el.clientWidth || 680, 320);
      var H  = 280;
      var mg = { top: 16, right: 52, bottom: 40, left: 36 };
      var w  = W - mg.left - mg.right;
      var h  = H - mg.top  - mg.bottom;

      var svg = d3.select(el).append('svg')
        .attr('viewBox', '0 0 ' + W + ' ' + H)
        .attr('width', '100%')
        .attr('height', H)
        .style('overflow', 'visible');

      var g = svg.append('g')
        .attr('transform', 'translate(' + mg.left + ',' + mg.top + ')');

      var xDom = [rows[0].date, rows[rows.length - 1].date];
      var x    = d3.scaleTime().domain(xDom).range([0, w]);
      var yR   = d3.scaleLinear().domain([0, rows.length]).nice().range([h, 0]);

      // Ref lines
      var refVals = d3.range(
        Math.ceil(rows.length / 4),
        rows.length,
        Math.ceil(rows.length / 4)
      );
      refVals.forEach(function (v) {
        g.append('line')
          .attr('x1', 0).attr('x2', w)
          .attr('y1', yR(v)).attr('y2', yR(v))
          .attr('stroke', COL.ref).attr('stroke-width', 1)
          .attr('stroke-dasharray', '4,3');
      });

      // Cumulative step line
      g.append('path')
        .datum(rows)
        .attr('fill', 'none')
        .attr('stroke', COL.line)
        .attr('stroke-width', 2)
        .attr('opacity', 0.6)
        .attr('d', d3.line()
          .x(function (r) { return x(r.date); })
          .y(function (r) { return yR(r.cumulative); })
          .curve(d3.curveStepAfter));

      // Dots
      var rng = (function () {
        var s = 42;
        return function () { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
      })();

      var tip     = makeTooltip(el);
      var fmtDate = d3.timeFormat('%d %b %Y');

      g.selectAll('circle.obs').data(rows).join('circle')
        .attr('class', 'obs')
        .attr('cx', function (r) { return x(r.date); })
        .attr('cy', function (r) { return yR(r.cumulative) + (rng() - 0.5) * 5; })
        .attr('r', 5)
        .attr('fill', COL.dot)
        .attr('opacity', 0.75)
        .on('mouseover', function (event, r) {
          d3.select(this).attr('r', 8).attr('opacity', 1).attr('fill', COL.dotHov);
          tip.style('opacity', 1)
             .html('<strong>' + fmtDate(r.date) + '</strong><br>code: ' + r.code
                 + '<br>observation #' + r.cumulative);
          moveTooltip(tip, event, el);
        })
        .on('mousemove', function (event) { moveTooltip(tip, event, el); })
        .on('mouseout', function () {
          d3.select(this).attr('r', 5).attr('opacity', 0.75).attr('fill', COL.dot);
          tip.style('opacity', 0);
        });

      // X axis
      var allMonths  = d3.timeMonths(xDom[0], xDom[1]);
      var tickMonths = allMonths.filter(function (_, i) { return i % 2 === 0; });
      var fmtMonth   = d3.timeFormat("%b '%y");

      var xAxis = g.append('g').attr('transform', 'translate(0,' + h + ')');
      allMonths.forEach(function (m) {
        xAxis.append('line')
          .attr('x1', x(m)).attr('x2', x(m))
          .attr('y1', 0).attr('y2', 4)
          .attr('stroke', COL.ref);
      });
      tickMonths.forEach(function (m) {
        xAxis.append('text')
          .attr('x', x(m)).attr('y', 20)
          .attr('text-anchor', 'middle').attr('font-size', 13)
          .attr('fill', COL.tick)
          .text(fmtMonth(m));
      });

      // Y axis (right)
      g.append('g')
        .attr('transform', 'translate(' + w + ',0)')
        .call(d3.axisRight(yR).ticks(5).tickSize(3))
        .call(function (ax) { ax.select('.domain').remove(); })
        .call(function (ax) {
          ax.selectAll('text').attr('font-size', 13).attr('fill', COL.tick);
          ax.selectAll('.tick line').attr('stroke', COL.ref);
        });

    }).catch(function (err) {
      console.error('[bike_steal] Failed to load LockDigits.csv:', err);
      d3.select(el).append('p')
        .style('color', COL.tick).style('font-size', '13px')
        .text('Visualization data unavailable.');
    });
  }

  function drawWheels(el) {
    var csvPath = (typeof baseUrl !== 'undefined' ? baseUrl : '')
                + '/assets/data/LockDigits.csv';

    d3.csv(csvPath).then(function (raw) {

      var rows = raw.map(function (r) { return r.Code.trim(); })
                    .filter(function (c) { return c.length === 4; });

      var n = rows.length;

      // Count frequency of each digit (0-9) per position (0-3)
      var counts = [0, 1, 2, 3].map(function (pos) {
        var freq = d3.range(10).map(function () { return 0; });
        rows.forEach(function (code) { freq[+code[pos]]++; });
        return freq;
      });

      var R    = 72;   // outer radius of bars
      var r0   = 20;   // inner hole radius
      var pad  = 22;   // space outside R for digit labels
      var vbSz = (R + pad) * 2;  // viewBox size: chart centered at vbSz/2
      var cx   = vbSz / 2;
      var cy   = vbSz / 2;

      el.style.display    = 'flex';
      el.style.alignItems = 'flex-start';
      el.style.gap        = '8px';

      var digits    = d3.range(10);
      var angleStep = (2 * Math.PI) / 10;
      // d3.arc: angle 0 = 12 o'clock, clockwise — no offset needed
      function startAngle(d) { return d * angleStep - angleStep / 2; }
      function endAngle(d)   { return d * angleStep + angleStep / 2; }

      var arc = d3.arc().innerRadius(r0).cornerRadius(2);

      var colour = d3.scaleSequential()
        .interpolator(d3.interpolateRgb('#fde8d8', '#9a3412'));

      counts.forEach(function (freq, pos) {
        var localMax  = d3.max(freq);
        var modeDigit = freq.indexOf(localMax);
        var modePct   = Math.round(localMax / n * 100);
        var refRad    = r0 + (R - r0) * (n * 0.10) / localMax;

        // Outer wrapper: column, title on top, SVG in middle, mode below
        var wrap = document.createElement('div');
        wrap.style.cssText = 'flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;position:relative;gap:4px;';
        el.appendChild(wrap);

        // Title as HTML — stays outside SVG space
        var title = document.createElement('div');
        title.style.cssText = 'font-size:14px;font-weight:700;color:#78350f;letter-spacing:0.03em;text-align:center;';
        title.textContent = 'Position ' + (pos + 1);
        wrap.appendChild(title);

        var svg = d3.select(wrap).append('svg')
          .attr('viewBox', '0 0 ' + vbSz + ' ' + vbSz)
          .attr('width', '100%');

        var g = svg.append('g').attr('transform', 'translate(' + cx + ',' + cy + ')');

        // Soft background circle
        g.append('circle').attr('r', R + 3)
          .attr('fill', 'rgba(194,65,12,0.06)');

        // 10% uniform reference ring
        g.append('circle').attr('r', refRad)
          .attr('fill', 'none')
          .attr('stroke', 'rgba(194,65,12,0.40)')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,2');

        var tip = makeTooltip(wrap);

        colour.domain([0, localMax]);

        // Bars
        digits.forEach(function (d) {
          var outerR = r0 + (R - r0) * freq[d] / localMax;
          g.append('path')
            .attr('d', arc({ innerRadius: r0, outerRadius: outerR,
                             startAngle: startAngle(d), endAngle: endAngle(d) }))
            .attr('fill', colour(freq[d]))
            .attr('opacity', 0.85)
            .on('mouseover', function (event) {
              d3.select(this).attr('opacity', 1).attr('stroke', '#9a3412').attr('stroke-width', 1);
              tip.style('opacity', 1)
                 .html('<strong>digit ' + d + '</strong><br>'
                     + freq[d] + ' / ' + n + ' (' + Math.round(freq[d] / n * 100) + '%)');
              moveTooltip(tip, event, wrap);
            })
            .on('mousemove', function (event) { moveTooltip(tip, event, wrap); })
            .on('mouseout', function () {
              d3.select(this).attr('opacity', 0.85).attr('stroke', 'none');
              tip.style('opacity', 0);
            });
        });

        // Digit labels — Math.cos/sin use 0=3 o'clock so subtract π/2 for 0=top
        digits.forEach(function (d) {
          var angle = d * angleStep - Math.PI / 2;
          var lr    = R + 13;
          g.append('text')
            .attr('x', lr * Math.cos(angle))
            .attr('y', lr * Math.sin(angle) + 4)
            .attr('text-anchor', 'middle')
            .attr('font-size', 12)
            .attr('font-weight', d === modeDigit ? '700' : '400')
            .attr('fill', d === modeDigit ? '#9a3412' : '#92400e')
            .text(d);
        });

        // Mode as HTML below SVG
        var modeEl = document.createElement('div');
        modeEl.style.cssText = 'font-size:13px;font-weight:600;color:#92400e;text-align:center;';
        modeEl.textContent = 'Mode: ' + modeDigit + ' (' + modePct + '%)';
        wrap.appendChild(modeEl);
      });

    }).catch(function (err) {
      console.error('[bike_steal] Failed to load LockDigits.csv:', err);
      d3.select(el).append('p')
        .style('color', COL.tick).style('font-size', '13px')
        .text('Visualization data unavailable.');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.querySelectorAll('[data-viz="collection"]').forEach(function (el) {
          el.style.position = 'relative';
          drawCollection(el);
        });
        document.querySelectorAll('[data-viz="wheels"]').forEach(function (el) {
          el.style.position = 'relative';
          drawWheels(el);
        });
      });
    });
  });

}());
