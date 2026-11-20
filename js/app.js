/* KiraASB — vanilla JS, no dependencies */
(function () {
  'use strict';

  var I18N = window.KIRA_I18N;
  var STORE = 'kirasb_state';
  var DEFAULTS = { initial: 5000, monthly: 300, rate: 5.75, years: 10, reinvest: true };
  var LIMITS = { initial: [0, 1000000], monthly: [0, 50000], rate: [0.5, 15], years: [1, 30] };
  var PRESETS = [4.25, 5.25, 5.75, 6.5];
  var COLLAPSED_ROWS = 5;

  var $ = function (id) { return document.getElementById(id); };
  var state = Object.assign({ lang: 'ms', showAll: false }, DEFAULTS);
  var selectedYear = null;

  /* ---------- helpers ---------- */
  function clamp(v, min, max, fallback) {
    if (v === null || v === undefined || v === '') return fallback;
    var n = Number(v);
    return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback;
  }
  function sanitize(s) {
    s.initial = clamp(s.initial, LIMITS.initial[0], LIMITS.initial[1], DEFAULTS.initial);
    s.monthly = clamp(s.monthly, LIMITS.monthly[0], LIMITS.monthly[1], DEFAULTS.monthly);
    s.rate = clamp(s.rate, LIMITS.rate[0], LIMITS.rate[1], DEFAULTS.rate);
    s.years = Math.round(clamp(s.years, LIMITS.years[0], LIMITS.years[1], DEFAULTS.years));
    s.reinvest = Boolean(s.reinvest);
    if (s.lang !== 'ms' && s.lang !== 'en') s.lang = 'ms';
  }
  function t(key) { return (I18N[state.lang] && I18N[state.lang][key]) || I18N.ms[key] || key; }
  function fill(str, vars) {
    return str.replace(/\{(\w+)\}/g, function (_, k) { return vars[k]; });
  }
  var moneyFmt = new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function rm(v) { return moneyFmt.format(v || 0); }
  function compact(v) {
    if (v >= 1e6) return 'RM' + (v / 1e6).toFixed(v >= 1e7 ? 0 : 1).replace(/\.0$/, '') + (state.lang === 'ms' ? 'J' : 'M');
    if (v >= 1e3) return 'RM' + (v / 1e3).toFixed(v >= 1e4 ? 0 : 1).replace(/\.0$/, '') + 'k';
    return 'RM' + Math.round(v);
  }
  function fmtInput(n) {
    var parts = String(n).split('.');
    return Number(parts[0]).toLocaleString('en-US') + (parts[1] !== undefined ? '.' + parts[1] : '');
  }
  function parseInput(str, maxDecimals) {
    var cleaned = String(str).replace(/[^\d.]/g, '');
    var i = cleaned.indexOf('.');
    if (i !== -1) cleaned = cleaned.slice(0, i + 1) + cleaned.slice(i + 1).replace(/\./g, '').slice(0, maxDecimals);
    return cleaned === '' || cleaned === '.' ? 0 : parseFloat(cleaned);
  }

  /* ---------- calculation (monthly-minimum-balance model) ---------- */
  function calculate(s) {
    var rows = [];
    var balance = s.initial, principal = s.initial, cumDiv = 0, monthlyRate = s.rate / 100 / 12;
    for (var y = 1; y <= s.years; y++) {
      var yearDiv = 0;
      for (var m = 0; m < 12; m++) {
        balance += s.monthly;
        principal += s.monthly;
        yearDiv += balance * monthlyRate;
      }
      cumDiv += yearDiv;
      if (s.reinvest) balance += yearDiv;
      rows.push({
        year: y,
        principal: principal,
        annualDividend: yearDiv,
        cumDividend: cumDiv,
        balance: s.reinvest ? balance : principal + cumDiv
      });
    }
    return rows;
  }

  /* ---------- persistence ---------- */
  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify({
        lang: state.lang, initial: state.initial, monthly: state.monthly,
        rate: state.rate, years: state.years, reinvest: state.reinvest
      }));
    } catch (e) { /* storage unavailable */ }
  }
  function load() {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch (e) { saved = {}; }
    Object.assign(state, saved);
    var hash = location.hash.charAt(0) === '#' ? location.hash.slice(1) : '';
    var p = new URLSearchParams(hash || location.search);
    if (p.get('lang')) state.lang = p.get('lang');
    if (p.get('init') !== null && p.get('init') !== '') state.initial = p.get('init');
    if (p.get('monthly') !== null && p.get('monthly') !== '') state.monthly = p.get('monthly');
    if (p.get('rate') !== null && p.get('rate') !== '') state.rate = p.get('rate');
    if (p.get('years') !== null && p.get('years') !== '') state.years = p.get('years');
    if (p.has('reinvest')) state.reinvest = p.get('reinvest') !== '0';
    sanitize(state);
  }

  /* ---------- rendering ---------- */
  function applyI18n() {
    document.documentElement.lang = state.lang;
    document.title = t('pageTitle');
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    $('langBtn').textContent = state.lang === 'ms' ? 'EN' : 'BM';

    var faq = $('faq');
    faq.innerHTML = '';
    t('faq').forEach(function (qa) {
      var d = document.createElement('details');
      var s = document.createElement('summary');
      s.textContent = qa[0];
      var p = document.createElement('p');
      p.innerHTML = qa[1];
      d.appendChild(s); d.appendChild(p); faq.appendChild(d);
    });
  }

  function setRangeFill(el) {
    var min = Number(el.min), max = Number(el.max);
    el.style.setProperty('--p', ((Number(el.value) - min) / (max - min)) * 100 + '%');
  }

  function syncControls(skip) {
    if (skip !== 'initialInput') $('initialInput').value = fmtInput(state.initial);
    if (skip !== 'monthlyInput') $('monthlyInput').value = fmtInput(state.monthly);
    if (skip !== 'rateInput') $('rateInput').value = String(state.rate);
    $('initialRange').value = Math.min(state.initial, 200000);
    $('monthlyRange').value = Math.min(state.monthly, 5000);
    $('yearsRange').value = state.years;
    ['initialRange', 'monthlyRange', 'yearsRange'].forEach(function (id) { setRangeFill($(id)); });
    $('yearsOut').textContent = state.years + ' ' + t('yearUnit');
    $('reinvestSwitch').setAttribute('aria-checked', String(state.reinvest));
    document.querySelectorAll('#presets button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(Number(b.dataset.rate) === state.rate));
    });
  }

  function renderPresets() {
    var box = $('presets');
    box.innerHTML = '';
    PRESETS.forEach(function (r) {
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.rate = r;
      b.textContent = r.toFixed(2) + '%';
      b.addEventListener('click', function () { state.rate = r; update(); });
      box.appendChild(b);
    });
  }

  function renderChart(rows) {
    var W = 640, H = 280, L = 52, R = 8, T = 10, B = 28;
    var innerW = W - L - R, innerH = H - T - B;
    var max = rows[rows.length - 1].balance;
    var step = Math.pow(10, Math.floor(Math.log10(max / 4 || 1)));
    var niceStep = [1, 2, 2.5, 5, 10].map(function (m) { return m * step; }).find(function (s) { return s * 4 >= max; }) || step * 10;
    var top = niceStep * Math.ceil(max / niceStep || 1);
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + t('chartTitle') + '">';
    var ticks = Math.round(top / niceStep);
    for (var i = 0; i <= ticks; i++) {
      var v = i * niceStep, y = T + innerH - (v / top) * innerH;
      svg += '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '"/>';
      svg += '<text x="' + (L - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + compact(v) + '</text>';
    }
    var slot = innerW / rows.length, bw = Math.max(Math.min(slot * 0.68, 34), 3);
    var every = rows.length > 20 ? 5 : rows.length > 10 ? 2 : 1;
    svg += '<g class="bars">';
    rows.forEach(function (r, idx) {
      var x = L + idx * slot + (slot - bw) / 2;
      var hp = (r.principal / top) * innerH;
      var hd = r.balance > r.principal ? ((r.balance - r.principal) / top) * innerH : 0;
      var base = T + innerH;
      svg += '<g class="bar" tabindex="0" data-year="' + r.year + '" role="button" aria-label="' + t('colYear') + ' ' + r.year + ': ' + rm(r.balance) + '">' +
        '<rect class="hit" x="' + (L + idx * slot) + '" y="' + T + '" width="' + slot + '" height="' + innerH + '"/>' +
        '<rect class="rp" x="' + x + '" y="' + (base - hp) + '" width="' + bw + '" height="' + hp + '" rx="2"/>' +
        '<rect class="rd" x="' + x + '" y="' + (base - hp - hd) + '" width="' + bw + '" height="' + hd + '" rx="2"/>' +
        '</g>';
      if ((r.year % every === 0) || r.year === 1) {
        svg += '<text x="' + (x + bw / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + r.year + '</text>';
      }
    });
    svg += '</g></svg>';
    $('chart').innerHTML = svg;
  }

  function showReadout(rows, year) {
    selectedYear = year;
    var r = rows[year - 1] || rows[rows.length - 1];
    $('readout').innerHTML =
      '<strong>' + t('colYear') + ' ' + r.year + '</strong> · ' + t('colBalance') + ' <strong>' + rm(r.balance) + '</strong><br>' +
      t('legendPrincipal') + ' ' + rm(r.principal) + ' · ' + t('legendDividend') + ' ' + rm(r.cumDividend);
    document.querySelectorAll('#chart .bar').forEach(function (g) {
      g.classList.toggle('bar--on', Number(g.dataset.year) === r.year);
    });
  }

  function renderTable(rows) {
    var visible = state.showAll ? rows : rows.slice(0, COLLAPSED_ROWS);
    $('rows').innerHTML = visible.map(function (r) {
      return '<tr><td>' + r.year + '</td><td class="num">' + rm(r.principal) + '</td><td class="num d">' + rm(r.annualDividend) + '</td><td class="num b">' + rm(r.balance) + '</td></tr>';
    }).join('');
    var btn = $('toggleRows');
    btn.hidden = rows.length <= COLLAPSED_ROWS;
    btn.textContent = state.showAll ? t('showLess') : t('showAll');
  }

  function render(skip) {
    var rows = calculate(state);
    var last = rows[rows.length - 1];
    var totalDiv = last.cumDividend;
    $('finalBalance').textContent = rm(last.balance);
    $('afterYears').textContent = fill(t('afterYears'), { n: state.years });
    $('totalPrincipal').textContent = rm(last.principal);
    $('totalDividend').textContent = rm(totalDiv);
    $('firstYear').textContent = rm(rows[0].annualDividend);
    var growth = last.principal > 0 ? (totalDiv / last.principal) * 100 : 0;
    $('growthChip').textContent = '+' + growth.toFixed(growth >= 100 ? 0 : 1) + '%';
    var share = last.balance > 0 ? (last.principal / last.balance) * 100 : 100;
    $('splitP').style.width = share + '%';
    $('splitD').style.width = 100 - share + '%';
    $('splitBar').setAttribute('aria-label', t('legendPrincipal') + ' ' + share.toFixed(0) + '%, ' + t('legendDividend') + ' ' + (100 - share).toFixed(0) + '%');
    syncControls(skip);
    renderChart(rows);
    showReadout(rows, selectedYear && selectedYear <= rows.length ? selectedYear : rows.length);
    renderTable(rows);
    $('chart')._rows = rows;
  }

  function update(skip) { sanitize(state); save(); render(skip); }

  /* ---------- events ---------- */
  function bindMoney(inputId, key, decimals) {
    var el = $(inputId);
    el.addEventListener('input', function () {
      var v = parseInput(el.value, decimals);
      state[key] = v;
      var raw = el.value;
      var pos = el.selectionStart || 0;
      var digitsBefore = raw.slice(0, pos).replace(/[^\d.]/g, '').length;
      sanitize(state);
      var cleaned = String(state[key]);
      var hasTrailingDot = /\.$/.test(raw.replace(/[^\d.]/g, ''));
      var formatted = raw === '' ? '' : fmtInput(cleaned) + (hasTrailingDot && cleaned.indexOf('.') === -1 ? '.' : '');
      if (key !== 'rate') {
        el.value = formatted;
        var n = 0, c = 0;
        while (n < formatted.length && c < digitsBefore) { if (/[\d.]/.test(formatted[n])) c++; n++; }
        el.setSelectionRange(n, n);
      }
      save(); render(inputId);
    });
    el.addEventListener('blur', function () { syncControls(); });
    el.addEventListener('focus', function () { setTimeout(function () { el.select(); }, 0); });
  }

  function init() {
    load();
    renderPresets();
    applyI18n();
    $('rateInput').setAttribute('inputmode', 'decimal');
    bindMoney('initialInput', 'initial', 2);
    bindMoney('monthlyInput', 'monthly', 2);
    bindMoney('rateInput', 'rate', 2);

    [['initialRange', 'initial'], ['monthlyRange', 'monthly'], ['yearsRange', 'years']].forEach(function (p) {
      $(p[0]).addEventListener('input', function (e) { state[p[1]] = Number(e.target.value); update(); });
    });
    $('reinvestSwitch').addEventListener('click', function () { state.reinvest = !state.reinvest; update(); });
    $('toggleRows').addEventListener('click', function () { state.showAll = !state.showAll; renderTable($('chart')._rows); });
    $('resetBtn').addEventListener('click', function () {
      Object.assign(state, DEFAULTS);
      selectedYear = null;
      history.replaceState(null, '', location.pathname);
      update();
    });
    $('langBtn').addEventListener('click', function () { state.lang = state.lang === 'ms' ? 'en' : 'ms'; applyI18n(); update(); });
    $('shareBtn').addEventListener('click', share);

    var chart = $('chart');
    function pick(e) {
      var g = e.target.closest && e.target.closest('.bar');
      if (g) showReadout(chart._rows, Number(g.dataset.year));
    }
    chart.addEventListener('mouseover', pick);
    chart.addEventListener('click', pick);
    chart.addEventListener('focusin', pick);

    update();
  }

  function toast(msg) {
    var el = $('toast');
    el.textContent = msg; el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.hidden = true; }, 2200);
  }

  function share() {
    var p = new URLSearchParams({
      init: state.initial, monthly: state.monthly, rate: state.rate,
      years: state.years, reinvest: state.reinvest ? '1' : '0', lang: state.lang
    });
    var url = location.origin + location.pathname + '#' + p.toString();
    var rows = calculate(state);
    var data = {
      title: 'KiraASB',
      text: fill(t('shareText'), { n: state.years, v: rm(rows[rows.length - 1].balance) }),
      url: url
    };
    var copy = function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () { toast(t('copied')); }, function () {});
      }
    };
    if (navigator.share) navigator.share(data).catch(function (e) { if (e && e.name !== 'AbortError') copy(); });
    else copy();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function () {});
    });
  }
})();
