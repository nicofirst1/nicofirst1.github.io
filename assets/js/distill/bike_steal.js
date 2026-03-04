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

  function drawResampler(el) {
    var csvPath = (typeof baseUrl !== 'undefined' ? baseUrl : '')
                + '/assets/data/LockDigits.csv';

    d3.csv(csvPath).then(function (raw) {

      var codes = raw.map(function (r) { return r.Code.trim(); })
                     .filter(function (c) { return c.length === 4; });

      var posDigits = [0, 1, 2, 3].map(function (pos) {
        return codes.map(function (c) { return +c[pos]; });
      });

      el.style.cssText += 'display:flex;flex-direction:column;align-items:center;gap:16px;';

      var row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:12px;justify-content:center;flex-wrap:wrap;width:100%;';
      el.appendChild(row);

      // Bootstrap: resample with replacement, return mode (ties broken randomly)
      function resampleMode(digits) {
        var freq = [0,0,0,0,0,0,0,0,0,0];
        for (var i = 0; i < digits.length; i++) {
          freq[digits[Math.floor(Math.random() * digits.length)]]++;
        }
        var maxVal = 0;
        for (var d = 0; d < 10; d++) { if (freq[d] > maxVal) maxVal = freq[d]; }
        var winners = [];
        for (var d = 0; d < 10; d++) { if (freq[d] === maxVal) winners.push(d); }
        return winners[Math.floor(Math.random() * winners.length)];
      }

      function stabilityColor(pct) {
        if (pct >= 80) return '#16a34a';  // green
        if (pct >= 50) return '#d97706';  // amber
        return '#dc2626';                 // red
      }

      var BAR_W = 140;  // px, bar chart width

      var panels = posDigits.map(function (digits, pos) {
        var wrap = document.createElement('div');
        wrap.style.cssText = 'flex:1;min-width:130px;display:flex;flex-direction:column;align-items:center;gap:6px;';
        row.appendChild(wrap);

        // Title
        var title = document.createElement('div');
        title.style.cssText = 'font-size:15px;font-weight:700;color:#78350f;';
        title.textContent = 'Position ' + (pos + 1);
        wrap.appendChild(title);

        // Drum window
        var window_ = document.createElement('div');
        window_.style.cssText = [
          'width:60px;height:74px;border-radius:8px;overflow:hidden;position:relative;',
          'background:#1c1917;border:2px solid #44403c;',
          'box-shadow:0 2px 8px rgba(0,0,0,0.35);',
        ].join('');
        wrap.appendChild(window_);

        var drum = document.createElement('div');
        drum.style.cssText = 'position:absolute;top:0;left:0;right:0;display:flex;flex-direction:column;';
        window_.appendChild(drum);

        for (var d = 0; d < 10; d++) {
          var cell = document.createElement('div');
          cell.style.cssText = [
            'width:60px;height:74px;flex-shrink:0;',
            'display:flex;align-items:center;justify-content:center;',
            'font-size:38px;font-weight:700;font-family:monospace;',
            'color:#fbbf24;user-select:none;',
          ].join('');
          cell.textContent = d;
          drum.appendChild(cell);
        }

        var rawFreq = [0,0,0,0,0,0,0,0,0,0];
        digits.forEach(function (d) { rawFreq[d]++; });
        var rawMode = rawFreq.indexOf(Math.max.apply(null, rawFreq));
        drum.style.transform = 'translateY(' + (-rawMode * 74) + 'px)';

        // Stability label under drum
        var stabilityEl = document.createElement('div');
        stabilityEl.style.cssText = 'font-size:12px;font-weight:600;color:#92400e;text-align:center;min-height:16px;font-variant-numeric:tabular-nums;';
        wrap.appendChild(stabilityEl);

        // Bar chart — dynamic sorted list, re-rendered on each update
        var chartWrap = document.createElement('div');
        chartWrap.style.cssText = 'width:' + (BAR_W + 48) + 'px;display:flex;flex-direction:column;gap:2px;position:relative;';
        wrap.appendChild(chartWrap);

        return {
          window_: window_, drum: drum, stabilityEl: stabilityEl, chartWrap: chartWrap,
          digits: digits, wins: [0,0,0,0,0,0,0,0,0,0], total: 0, spinning: false,
          cellH: 74,
        };
      });

      var BAR_ROW_H = 13;  // px per bar row

      function updateChart(p) {
        if (p.total === 0) return;

        // Sort digits by win count descending
        var order = d3.range(10).sort(function (a, b) { return p.wins[b] - p.wins[a]; });
        var first  = p.wins[order[0]];
        var second = p.wins[order[1]];
        var stability = Math.round(first / p.total * 100);
        var ratioNum  = second > 0 ? first / second : Infinity;
        var ratio     = second > 0 ? ratioNum.toFixed(1) : '∞';
        var topColor  = stabilityColor(stability);

        p.stabilityEl.textContent = stability + '% stable';
        p.stabilityEl.style.color = topColor;

        // Clear and re-render rows
        p.chartWrap.innerHTML = '';

        order.forEach(function (d, rank) {
          var isTop    = rank === 0;
          var isSecond = rank === 1;
          var barPct   = first > 0 ? p.wins[d] / first * 100 : 0;
          var count    = p.wins[d];

          var barRow = document.createElement('div');
          barRow.style.cssText = 'display:flex;align-items:center;gap:4px;position:relative;';

          var lbl = document.createElement('span');
          lbl.style.cssText = 'font-size:12px;color:#92400e;width:12px;text-align:right;font-variant-numeric:tabular-nums;' + (isTop ? 'font-weight:700;' : '');
          lbl.textContent = d;

          var track = document.createElement('div');
          track.style.cssText = 'flex:1;height:' + BAR_ROW_H + 'px;background:rgba(194,65,12,0.10);border-radius:3px;overflow:hidden;';

          var fill = document.createElement('div');
          fill.style.cssText = 'height:100%;border-radius:3px;' +
            'background:' + (isTop ? topColor : 'rgba(194,65,12,0.35)') + ';' +
            'width:' + barPct + '%;';
          track.appendChild(fill);

          var countLbl = document.createElement('span');
          countLbl.style.cssText = 'font-size:11px;color:#92400e;width:28px;text-align:right;font-variant-numeric:tabular-nums;' + (isTop ? 'font-weight:700;' : '');
          countLbl.textContent = count > 0 ? count : '';

          // Bracket arm: right edge of countLbl, only for rank 0 and 1
          var bracketEl = document.createElement('span');
          bracketEl.style.cssText = 'width:16px;font-size:11px;color:#92400e;text-align:center;flex-shrink:0;';
          if (isTop)    bracketEl.textContent = '─┐';
          if (isSecond) bracketEl.textContent = '─┘';

          barRow.appendChild(lbl);
          barRow.appendChild(track);
          barRow.appendChild(countLbl);
          barRow.appendChild(bracketEl);
          p.chartWrap.appendChild(barRow);

          // Ratio label floated beside the bracket, between rows 0 and 1
          if (isTop) {
            var ratioRow = document.createElement('div');
            ratioRow.style.cssText = 'display:flex;justify-content:flex-end;align-items:center;height:6px;';
            var ratioLbl = document.createElement('span');
            ratioLbl.style.cssText = 'font-size:11px;font-weight:700;font-variant-numeric:tabular-nums;' +
              'color:' + topColor + ';width:16px;text-align:center;';
            ratioLbl.textContent = ratio + 'x';
            ratioRow.appendChild(ratioLbl);
            p.chartWrap.appendChild(ratioRow);
          }
        });
      }

      function animateSpin(p, pi, result, onDone) {
        p.spinning = true;
        var spinSteps = 8 + pi * 2;
        var stepMs    = 60;

        function spinStep(step) {
          if (step >= spinSteps) {
            p.drum.style.transition = 'transform .35s cubic-bezier(.2,.8,.4,1)';
            p.drum.style.transform  = 'translateY(' + (-result * p.cellH) + 'px)';
            setTimeout(function () {
              p.wins[result]++;
              p.total++;
              updateChart(p);
              p.spinning = false;
              if (onDone) onDone();
            }, 380);
            return;
          }
          var fake = Math.floor(Math.random() * 10);
          p.drum.style.transition = 'transform ' + stepMs + 'ms linear';
          p.drum.style.transform  = 'translateY(' + (-fake * p.cellH) + 'px)';
          setTimeout(function () { spinStep(step + 1); }, stepMs + 10);
        }

        setTimeout(function () { spinStep(0); }, pi * 80);
      }

      // ── Buttons ─────────────────────────────────────────────────────────────
      var btnRow = document.createElement('div');
      btnRow.style.cssText = 'display:flex;gap:10px;';
      el.appendChild(btnRow);

      var btnStyle = [
        'padding:8px 20px;border-radius:6px;border:none;cursor:pointer;',
        'background:#b91c1c;color:#fff;font-size:14px;font-weight:600;',
        'transition:background .15s;',
      ].join('');

      function makeBtn(label) {
        var b = document.createElement('button');
        b.textContent = label;
        b.style.cssText = btnStyle;
        b.onmouseover = function () { b.style.background = '#991b1b'; };
        b.onmouseout  = function () { b.style.background = '#b91c1c'; };
        btnRow.appendChild(b);
        return b;
      }

      var btn1     = makeBtn('Resample');
      var btn10    = makeBtn('× 10');
      var btn1k    = makeBtn('× 1000');
      var btn10k   = makeBtn('× 10000');

      btn10.style.display  = 'none';
      btn1k.style.display  = 'none';
      btn10k.style.display = 'none';

      var clicks1 = 0, clicks10 = 0, clicks1k = 0;

      function batchResample(n) {
        if (panels.some(function (p) { return p.spinning; })) return;
        panels.forEach(function (p, pi) {
          for (var k = 0; k < n - 1; k++) {
            p.wins[resampleMode(p.digits)]++;
            p.total++;
          }
          animateSpin(p, pi, resampleMode(p.digits), null);
        });
      }

      btn1.addEventListener('click', function () {
        if (panels.some(function (p) { return p.spinning; })) return;
        panels.forEach(function (p, pi) {
          animateSpin(p, pi, resampleMode(p.digits), null);
        });
        clicks1++;
        if (clicks1 >= 3) btn10.style.display = '';
      });

      btn10.addEventListener('click', function () {
        batchResample(10);
        clicks10++;
        if (clicks10 >= 3) btn1k.style.display = '';
      });

      btn1k.addEventListener('click', function () {
        batchResample(1000);
        clicks1k++;
        if (clicks1k >= 3) btn10k.style.display = '';
      });

      btn10k.addEventListener('click', function () { batchResample(10000); });

    }).catch(function (err) {
      console.error('[bike_steal] Failed to load LockDigits.csv:', err);
      d3.select(el).append('p')
        .style('color', COL.tick).style('font-size', '13px')
        .text('Visualization data unavailable.');
    });
  }

  function drawGuess(el) {
    var guessed = [4, 4, 4, 7];
    var truth   = [4, 7, 4, 7];

    el.style.cssText += 'display:flex;flex-direction:column;align-items:center;gap:16px;';

    // ── Wheels row ────────────────────────────────────────────────────────────
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:12px;justify-content:center;';
    el.appendChild(row);

    var wheels = guessed.map(function (g, i) {
      var match = (g === truth[i]);

      var wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;';
      row.appendChild(wrap);

      var outer = document.createElement('div');
      outer.style.cssText = [
        'width:72px;height:90px;border-radius:10px;overflow:hidden;position:relative;',
        'background:#1c1917;border:2px solid #44403c;',
        'box-shadow:0 2px 8px rgba(0,0,0,0.4);',
        'transition:border-color .3s, box-shadow .3s;',
      ].join('');
      wrap.appendChild(outer);

      // Drum: three cells stacked vertically — starts showing middle cell (guessed)
      var drum = document.createElement('div');
      drum.style.cssText = 'position:absolute;top:0;left:0;right:0;display:flex;flex-direction:column;transform:translateY(-90px);transition:transform .5s cubic-bezier(.4,0,.2,1);';
      outer.appendChild(drum);

      // Cells: [prev (hidden above), guessed (visible), truth (hidden below)]
      var prev = (g - 1 + 10) % 10;
      [prev, g, truth[i]].forEach(function (digit, ci) {
        var cell = document.createElement('div');
        cell.style.cssText = [
          'width:72px;height:90px;flex-shrink:0;',
          'display:flex;align-items:center;justify-content:center;',
          'font-size:48px;font-weight:700;font-family:monospace;',
          'color:', (ci === 1 ? '#fbbf24' : '#a8a29e'), ';',
          'user-select:none;',
        ].join('');
        cell.textContent = digit;
        drum.appendChild(cell);
      });


      return { outer: outer, drum: drum, match: match };
    });

    // ── Reveal button ─────────────────────────────────────────────────────────
    var btn = document.createElement('button');
    btn.textContent = 'Reveal true code';
    btn.style.cssText = [
      'padding:8px 20px;border-radius:6px;border:none;cursor:pointer;',
      'background:#b91c1c;color:#fff;font-size:14px;font-weight:600;',
      'transition:background .15s;',
    ].join('');
    btn.onmouseover = function () { btn.style.background = '#991b1b'; };
    btn.onmouseout  = function () { btn.style.background = '#b91c1c'; };
    el.appendChild(btn);

    // ── Result line ───────────────────────────────────────────────────────────
    var result = document.createElement('div');
    result.style.cssText = 'font-size:13px;color:#92400e;min-height:18px;text-align:center;opacity:0;transition:opacity .3s;';
    el.appendChild(result);

    var revealed = false;
    btn.addEventListener('click', function () {
      if (revealed) return;
      revealed = true;
      btn.disabled = true;
      btn.style.opacity = '0.5';

      wheels.forEach(function (w, i) {
        setTimeout(function () {
          // Scroll drum up one more cell (was -90px showing guessed, now -180px showing truth)
          w.drum.style.transform = 'translateY(-180px)';

          setTimeout(function () {
            if (w.match) {
              w.outer.style.borderColor = '#16a34a';
              w.outer.style.boxShadow   = '0 0 12px rgba(22,163,74,0.6)';
            } else {
              w.outer.style.borderColor = '#dc2626';
              w.outer.style.boxShadow   = '0 0 12px rgba(220,38,38,0.6)';
            }
            // Update digit colour to gold
            w.drum.children[2].style.color = '#fbbf24';
          }, 520);

          if (i === wheels.length - 1) {
            setTimeout(function () {
              var correct = wheels.filter(function (w) { return w.match; }).length;
              result.textContent = correct + ' / 4 correct';
              result.style.opacity = '1';
            }, 900);
          }
        }, i * 120);
      });
    });
  }

  function drawSearchSpace(el) {
    var csvPath = (typeof baseUrl !== 'undefined' ? baseUrl : '')
                + '/assets/data/LockDigits.csv';

    d3.csv(csvPath).then(function (raw) {

      var codes = raw.map(function (r) { return r.Code.trim(); })
                     .filter(function (c) { return c.length === 4; });

      // Per-position frequency tables
      var freq = [0,1,2,3].map(function (pos) {
        var f = d3.range(10).map(function () { return 0; });
        codes.forEach(function (c) { f[+c[pos]]++; });
        return f;
      });

      var TRUE_CODE = [4, 7, 4, 7];

      // Score every 4-digit code: product of per-position observed frequencies
      var allCodes = [];
      for (var a = 0; a < 10; a++)
        for (var b = 0; b < 10; b++)
          for (var c = 0; c < 10; c++)
            for (var d = 0; d < 10; d++) {
              var score = freq[0][a] * freq[1][b] * freq[2][c] * freq[3][d];
              allCodes.push({ digits: [a,b,c,d], score: score, inZone: (a===TRUE_CODE[0] && d===TRUE_CODE[3]) });
            }

      allCodes.sort(function (x, y) { return y.score - x.score; });
      allCodes.forEach(function (e, i) { e.rank = i + 1; });

      var maxScore   = allCodes[0].score;
      var totalScore = d3.sum(allCodes, function (e) { return e.score; });
      var trueEntry = allCodes.find(function (e) {
        return e.digits.every(function (v, i) { return v === TRUE_CODE[i]; });
      });

      el.style.cssText += 'display:flex;flex-direction:column;gap:16px;';

      // ── Two-panel row ─────────────────────────────────────────────────────────
      var panels = document.createElement('div');
      panels.style.cssText = 'display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start;';
      el.appendChild(panels);

      // ── Panel A: Ranked drop-off chart ────────────────────────────────────────
      var WA = 500, HA = 300;
      var mgA = { top: 12, right: 16, bottom: 42, left: 48 };

      var chartA = document.createElement('div');
      chartA.style.cssText = 'flex:2;min-width:260px;position:relative;';
      panels.appendChild(chartA);

      var titleA = document.createElement('div');
      titleA.style.cssText = 'font-size:16px;font-weight:700;color:#78350f;margin-bottom:6px;text-align:center;padding-left:' + mgA.left + 'px;padding-right:' + mgA.right + 'px;';
      titleA.textContent = 'All 10,000 codes ranked by likelihood';
      chartA.appendChild(titleA);

      var svgA = d3.select(chartA).append('svg')
        .attr('viewBox', '0 0 ' + WA + ' ' + HA)
        .attr('width', '100%').attr('height', HA)
        .style('overflow', 'visible');

      var gA = svgA.append('g').attr('transform', 'translate(' + mgA.left + ',' + mgA.top + ')');
      var wA = WA - mgA.left - mgA.right;
      var hA = HA - mgA.top  - mgA.bottom;

      // Zoom state — default to top 100
      var zoomStart = 0, zoomEnd = 99;

      var xA = d3.scaleLinear().domain([0, 9999]).range([0, wA]);
      var yA = d3.scaleLinear().domain([0, maxScore]).range([hA, 0]);

      // Clip path
      svgA.append('defs').append('clipPath').attr('id', 'clip-a')
        .append('rect').attr('width', wA).attr('height', hA);

      var chartBody = gA.append('g').attr('clip-path', 'url(#clip-a)');

      function renderArea() {
        chartBody.selectAll('*').remove();
        var vis = allCodes.slice(zoomStart, zoomEnd + 1);
        xA.domain([zoomStart, zoomEnd]);

        // Attack zone bars
        var zoneData = vis.filter(function (e) { return e.inZone; });
        chartBody.selectAll('rect.zone').data(zoneData).join('rect')
          .attr('class', 'zone')
          .attr('x', function (e) { return xA(e.rank - 1) - 0.5; })
          .attr('y', function (e) { return yA(e.score); })
          .attr('width', Math.max(1, wA / vis.length * 1.2))
          .attr('height', function (e) { return hA - yA(e.score); })
          .attr('fill', 'rgba(20,184,166,0.55)');

        // All bars (behind zone)
        chartBody.selectAll('rect.bar').data(vis).join('rect')
          .attr('class', 'bar')
          .attr('x', function (e) { return xA(e.rank - 1); })
          .attr('y', function (e) { return yA(e.score); })
          .attr('width', Math.max(0.5, wA / vis.length - 0.3))
          .attr('height', function (e) { return hA - yA(e.score); })
          .attr('fill', function (e) { return e.inZone ? 'rgba(20,184,166,0.55)' : 'rgba(30,58,95,0.55)'; });

        // True code marker
        chartBody.selectAll('line.true').data([trueEntry]).join('line')
          .attr('class', 'true')
          .attr('x1', function (e) { return xA(e.rank - 1) + 0.5; })
          .attr('x2', function (e) { return xA(e.rank - 1) + 0.5; })
          .attr('y1', -6).attr('y2', hA)
          .attr('stroke', '#f97316').attr('stroke-width', 1.5);

        chartBody.selectAll('circle.true').data([trueEntry]).join('circle')
          .attr('class', 'true')
          .attr('cx', function (e) { return xA(e.rank - 1) + 0.5; })
          .attr('cy', function (e) { return yA(e.score) - 4; })
          .attr('r', 3).attr('fill', '#f97316');

        // Top-100 bracket
        if (zoomStart === 0) {
          var x100 = xA(99);
          chartBody.append('rect')
            .attr('x', 0).attr('y', 0).attr('width', x100).attr('height', hA)
            .attr('fill', 'rgba(249,115,22,0.06)').attr('stroke', 'rgba(249,115,22,0.3)')
            .attr('stroke-width', 1).attr('stroke-dasharray', '3,2');
          chartBody.append('text')
            .attr('x', x100 / 2).attr('y', 10)
            .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#c2410c')
            .text('top 100');
        }

        // X axis
        gA.selectAll('.x-axis').remove();
        gA.append('g').attr('class', 'x-axis')
          .attr('transform', 'translate(0,' + hA + ')')
          .call(d3.axisBottom(xA).ticks(5).tickFormat(d3.format('d')))
          .call(function (ax) { ax.select('.domain').remove(); ax.selectAll('line').attr('stroke', COL.ref); ax.selectAll('text').attr('fill', COL.tick).attr('font-size', 13); });

        gA.selectAll('.x-label').remove();
        gA.append('text').attr('class', 'x-label')
          .attr('x', wA / 2).attr('y', hA + 36)
          .attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', COL.tick)
          .text('rank');
      }

      // Y axis (static)
      gA.append('g')
        .call(d3.axisLeft(yA).ticks(4).tickFormat(d3.format('.0s')))
        .call(function (ax) { ax.select('.domain').remove(); ax.selectAll('line').attr('stroke', COL.ref); ax.selectAll('text').attr('fill', COL.tick).attr('font-size', 13); });

      renderArea();

      // Zoom buttons
      var zoomRow = document.createElement('div');
      zoomRow.style.cssText = 'display:flex;gap:6px;margin-top:4px;justify-content:center;padding-left:' + mgA.left + 'px;padding-right:' + mgA.right + 'px;';
      chartA.appendChild(zoomRow);

      function makeSmBtn(label, active) {
        var b = document.createElement('button');
        b.textContent = label;
        b.style.cssText = 'padding:6px 16px;border-radius:4px;border:1px solid rgba(194,65,12,0.4);cursor:pointer;font-size:13px;transition:background .1s;';
        b.style.background = active ? '#b91c1c' : 'transparent';
        b.style.color      = active ? '#fff'    : '#92400e';
        zoomRow.appendChild(b);
        return b;
      }

      var btn100  = makeSmBtn('top 100', true);
      var btnAll  = makeSmBtn('all 10k', false);
      var tipA    = makeTooltip(chartA);

      btnAll.addEventListener('click', function () {
        zoomStart = 0; zoomEnd = 9999; renderArea();
        btnAll.style.background = '#b91c1c'; btnAll.style.color = '#fff';
        btn100.style.background = 'transparent'; btn100.style.color = '#92400e';
      });
      btn100.addEventListener('click', function () {
        zoomStart = 0; zoomEnd = 99; renderArea();
        btn100.style.background = '#b91c1c'; btn100.style.color = '#fff';
        btnAll.style.background = 'transparent'; btnAll.style.color = '#92400e';
      });

      // Hover on chart A
      svgA.on('mousemove', function (event) {
        var pt  = d3.pointer(event, gA.node());
        var rank0 = Math.round(xA.invert(pt[0]));
        if (rank0 < zoomStart || rank0 > zoomEnd) { tipA.style('opacity', 0); return; }
        var e = allCodes[rank0];
        if (!e) { tipA.style('opacity', 0); return; }
        var zoneStr = e.inZone ? ' <span style="color:#14b8a6">✓ zone</span>' : '';
        var ePct    = totalScore > 0 ? (e.score / totalScore * 100).toFixed(2) : '0';
        tipA.style('opacity', 1)
           .html('<strong>' + e.digits.join('-') + '</strong>' + zoneStr + '<br>rank #' + e.rank + '<br>' + ePct + '% of mass');
        moveTooltip(tipA, event, chartA);
      }).on('mouseleave', function () { tipA.style('opacity', 0); });

      // ── Panel B: 10×10 attack zone heatmap ───────────────────────────────────
      var CELL = 32, HM_PAD = 42;

      var chartB = document.createElement('div');
      chartB.style.cssText = 'flex:1;min-width:180px;position:relative;';
      panels.appendChild(chartB);

      var titleB = document.createElement('div');
      titleB.style.cssText = 'font-size:16px;font-weight:700;color:#78350f;margin-bottom:6px;text-align:center;padding-left:' + HM_PAD + 'px;';
      titleB.textContent = 'Attack zone: 4-?-?-7';
      chartB.appendChild(titleB);
      var WB   = CELL * 10 + HM_PAD;
      var HB   = CELL * 10 + HM_PAD + 16;

      var svgB = d3.select(chartB).append('svg')
        .attr('viewBox', '0 0 ' + WB + ' ' + HB)
        .attr('width', WB).attr('height', HB)
        .style('overflow', 'visible');

      var gB = svgB.append('g').attr('transform', 'translate(' + HM_PAD + ',0)');

      // Only codes matching 4-?-?-7; row = pos2 digit, col = pos3 digit
      var zoneScores = [];
      for (var r2 = 0; r2 < 10; r2++)
        for (var c2 = 0; c2 < 10; c2++)
          zoneScores.push({ r: r2, c: c2, score: freq[0][TRUE_CODE[0]] * freq[1][r2] * freq[2][c2] * freq[3][TRUE_CODE[3]] });

      var maxZone = d3.max(zoneScores, function (e) { return e.score; });
      var heatColor = d3.scaleSequential()
        .domain([0, maxZone])
        .interpolator(d3.interpolateRgb('#f0f9ff', '#1e3a5f'));

      var tipB = makeTooltip(chartB);

      gB.selectAll('rect.cell').data(zoneScores).join('rect')
        .attr('class', 'cell')
        .attr('x', function (e) { return e.c * CELL; })
        .attr('y', function (e) { return e.r * CELL; })
        .attr('width', CELL - 1).attr('height', CELL - 1)
        .attr('rx', 2)
        .attr('fill', function (e) { return heatColor(e.score); })
        .on('mouseover', function (event, e) {
          d3.select(this).attr('stroke', '#f97316').attr('stroke-width', 1.5);
          var code = [TRUE_CODE[0], e.r, e.c, TRUE_CODE[3]];
          var pct  = totalScore > 0 ? (e.score / totalScore * 100).toFixed(2) : '0';
          tipB.style('opacity', 1)
             .html('<strong>' + code.join('-') + '</strong><br>' + pct + '% of mass');
          moveTooltip(tipB, event, chartB);
        })
        .on('mousemove', function (event) { moveTooltip(tipB, event, chartB); })
        .on('mouseout',  function () { d3.select(this).attr('stroke', 'none'); tipB.style('opacity', 0); });

      // True code marker (pos2=7, pos3=4 → row=7, col=4)
      var trueR = TRUE_CODE[1], trueC = TRUE_CODE[2];
      gB.append('rect')
        .attr('x', trueC * CELL).attr('y', trueR * CELL)
        .attr('width', CELL - 1).attr('height', CELL - 1)
        .attr('rx', 2).attr('fill', 'none')
        .attr('stroke', '#f97316').attr('stroke-width', 2);

      // Axis labels (digits 0–9)
      for (var ii = 0; ii < 10; ii++) {
        gB.append('text')
          .attr('x', ii * CELL + CELL / 2).attr('y', 10 * CELL + 14)
          .attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', COL.tick)
          .text(ii);
        gB.append('text')
          .attr('x', -7).attr('y', ii * CELL + CELL / 2 + 4)
          .attr('text-anchor', 'end').attr('font-size', 13).attr('fill', COL.tick)
          .text(ii);
      }
      gB.append('text')
        .attr('x', 5 * CELL).attr('y', 10 * CELL + 32)
        .attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', COL.tick)
        .text('position 3 digit');
      gB.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -(5 * CELL)).attr('y', -28)
        .attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', COL.tick)
        .text('position 2 digit');

    }).catch(function (err) {
      console.error('[bike_steal] Failed to load LockDigits.csv:', err);
      d3.select(el).append('p')
        .style('color', COL.tick).style('font-size', '13px')
        .text('Visualization data unavailable.');
    });
  }

  function drawDivergence(el) {
    var csvPath = (typeof baseUrl !== 'undefined' ? baseUrl : '')
                + '/assets/data/LockDigits.csv';

    d3.csv(csvPath).then(function (raw) {

      // Phase 1: Data
      var codes   = raw.map(function (r) { return r.Code.trim(); })
                       .filter(function (c) { return c.length === 4; });
      var actualN = codes.length;
      var freq2   = d3.range(10).map(function () { return 0; });
      codes.forEach(function (c) { freq2[+c[1]]++; });
      var p4 = freq2[4] / actualN;
      var p7 = freq2[7] / actualN;

      // Phase 2: Layout
      var W  = 660, H = 380;
      var mg = { top: 20, right: 160, bottom: 50, left: 56 };
      var w  = W - mg.left - mg.right;
      var h  = H - mg.top  - mg.bottom;

      var outerWrap = document.createElement('div');
      outerWrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:8px;width:100%;';
      el.appendChild(outerWrap);

      var svg = d3.select(outerWrap).append('svg')
        .attr('viewBox', '0 0 ' + W + ' ' + H)
        .attr('width', '100%').attr('height', H)
        .style('overflow', 'visible');

      var g = svg.append('g')
        .attr('transform', 'translate(' + mg.left + ',' + mg.top + ')');

      // Phase 3: Scales + band data
      var xScale = d3.scaleLog().base(10).domain([10, 5000]).range([0, w]);
      var yScale = d3.scaleLinear().domain([0, 0.45]).range([h, 0]);

      // 80 logarithmically-spaced N values for smooth paths
      var nValues = [];
      for (var i = 0; i <= 80; i++) {
        nValues.push(Math.pow(10, Math.log10(10) + (Math.log10(5000) - Math.log10(10)) * i / 80));
      }

      function buildBandData(p) {
        return nValues.map(function (N) {
          var se = Math.sqrt(p * (1 - p) / N);
          return { N: N, lo: Math.max(0, p - 1.96 * se), hi: Math.min(1, p + 1.96 * se), mu: p };
        });
      }

      var band4 = buildBandData(p4);
      var band7 = buildBandData(p7);

      var areaGen = d3.area()
        .x(function (d) { return xScale(d.N); })
        .y0(function (d) { return yScale(d.lo); })
        .y1(function (d) { return yScale(d.hi); })
        .curve(d3.curveCatmullRom);

      var lineGen = d3.line()
        .x(function (d) { return xScale(d.N); })
        .y(function (d) { return yScale(d.mu); })
        .curve(d3.curveCatmullRom);

      // Phase 4: Static chart elements
      // CI bands (digit 7 first = behind)
      g.append('path').datum(band7).attr('fill', '#3b82f6').attr('opacity', 0.15).attr('d', areaGen);
      g.append('path').datum(band4).attr('fill', '#c2410c').attr('opacity', 0.15).attr('d', areaGen);

      // Mean lines
      g.append('path').datum(band7).attr('fill', 'none').attr('stroke', '#3b82f6').attr('stroke-width', 2).attr('opacity', 0.9).attr('d', lineGen);
      g.append('path').datum(band4).attr('fill', 'none').attr('stroke', '#c2410c').attr('stroke-width', 2).attr('opacity', 0.9).attr('d', lineGen);

      // 10% reference line
      g.append('line')
        .attr('x1', 0).attr('x2', w).attr('y1', yScale(0.10)).attr('y2', yScale(0.10))
        .attr('stroke', COL.ref).attr('stroke-width', 1).attr('stroke-dasharray', '5,3');
      g.append('text')
        .attr('x', w + 4).attr('y', yScale(0.10) + 4)
        .attr('font-size', 11).attr('fill', COL.tick).text('10%');

      // Axes
      g.append('g')
        .attr('transform', 'translate(0,' + h + ')')
        .call(d3.axisBottom(xScale)
          .tickValues([10, 25, 50, 100, 200, 500, 1000, 5000])
          .tickFormat(d3.format('d')))
        .call(function (ax) {
          ax.select('.domain').remove();
          ax.selectAll('line').attr('stroke', COL.ref);
          ax.selectAll('text').attr('font-size', 13).attr('fill', COL.tick);
        });
      g.append('text')
        .attr('x', w / 2).attr('y', h + 38)
        .attr('text-anchor', 'middle').attr('font-size', 13).attr('fill', COL.tick)
        .text('N (observations)');
      g.append('g')
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(function (v) { return Math.round(v * 100) + '%'; }))
        .call(function (ax) {
          ax.select('.domain').remove();
          ax.selectAll('line').attr('stroke', COL.ref);
          ax.selectAll('text').attr('font-size', 13).attr('fill', COL.tick);
        });

      // Annotation (right margin)
      var aX = w + 12;
      var aT = g.append('text').attr('font-size', 11).attr('fill', '#c2410c').attr('font-style', 'italic');
      aT.append('tspan').attr('x', aX).attr('dy', 20).text('At N=5,000,');
      aT.append('tspan').attr('x', aX).attr('dy', 14).text('99.99% certain');
      aT.append('tspan').attr('x', aX).attr('dy', 14).text('digit 4 wins.');
      aT.append('tspan').attr('x', aX).attr('dy', 14).attr('font-weight', '700').text('And wrong.');

      // Legend
      g.append('rect').attr('x', 4).attr('y', 6).attr('width', 14).attr('height', 4).attr('fill', '#c2410c');
      g.append('text').attr('x', 22).attr('y', 10).attr('font-size', 12).attr('fill', COL.tick).text('digit 4 (mode)');
      g.append('rect').attr('x', 4).attr('y', 20).attr('width', 14).attr('height', 4).attr('fill', '#3b82f6');
      g.append('text').attr('x', 22).attr('y', 24).attr('font-size', 12).attr('fill', COL.tick).text('digit 7 (true)');

      // Phase 5: Cursor line (on top)
      var cursorLine = g.append('line')
        .attr('y1', 0).attr('y2', h)
        .attr('stroke', COL.tick).attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,3').attr('opacity', 0.7);

      // Phase 6: Controls DOM
      var sliderRow = document.createElement('div');
      sliderRow.style.cssText = 'display:flex;align-items:center;gap:10px;width:100%;max-width:' + W + 'px;padding-left:' + mg.left + 'px;';
      outerWrap.appendChild(sliderRow);

      var sliderLabel = document.createElement('span');
      sliderLabel.style.cssText = 'font-size:13px;font-weight:600;color:' + COL.tick + ';font-variant-numeric:tabular-nums;min-width:60px;';
      sliderRow.appendChild(sliderLabel);

      var slider = document.createElement('input');
      slider.type  = 'range';
      slider.min   = '10';
      slider.max   = '5000';
      slider.value = String(actualN);
      slider.style.cssText = 'flex:1;accent-color:' + COL.dot + ';cursor:pointer;';
      sliderRow.appendChild(slider);

      var ciRow = document.createElement('div');
      ciRow.style.cssText = 'display:flex;gap:16px;font-size:13px;font-variant-numeric:tabular-nums;padding-left:' + mg.left + 'px;';
      outerWrap.appendChild(ciRow);

      var ciLabel4 = document.createElement('span');
      ciLabel4.style.cssText = 'color:#c2410c;font-weight:600;';
      ciRow.appendChild(ciLabel4);

      var ciLabel7 = document.createElement('span');
      ciLabel7.style.cssText = 'color:#3b82f6;font-weight:600;';
      ciRow.appendChild(ciLabel7);

      // Phase 7: Cursor update + init
      function updateCursor(N) {
        var cx  = xScale(Math.max(10, Math.min(5000, N)));
        var se4 = Math.sqrt(p4 * (1 - p4) / N);
        var se7 = Math.sqrt(p7 * (1 - p7) / N);
        cursorLine.attr('x1', cx).attr('x2', cx);
        sliderLabel.textContent = 'N\u00a0=\u00a0' + Math.round(N);
        ciLabel4.textContent = 'Digit 4: ' + Math.round(Math.max(0, p4 - 1.96 * se4) * 100) + '% \u2013 ' + Math.round(Math.min(1, p4 + 1.96 * se4) * 100) + '%';
        ciLabel7.textContent = 'Digit 7: ' + Math.round(Math.max(0, p7 - 1.96 * se7) * 100) + '% \u2013 ' + Math.round(Math.min(1, p7 + 1.96 * se7) * 100) + '%';
      }

      slider.addEventListener('input', function () { updateCursor(+this.value); });
      updateCursor(actualN);

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
        document.querySelectorAll('[data-viz="guess"]').forEach(function (el) {
          el.style.position = 'relative';
          drawGuess(el);
        });
        document.querySelectorAll('[data-viz="resampler"]').forEach(function (el) {
          el.style.position = 'relative';
          drawResampler(el);
        });
        document.querySelectorAll('[data-viz="searchspace"]').forEach(function (el) {
          el.style.position = 'relative';
          drawSearchSpace(el);
        });
        document.querySelectorAll('[data-viz="divergence"]').forEach(function (el) {
          el.style.position = 'relative';
          drawDivergence(el);
        });
      });
    });
  });

}());
