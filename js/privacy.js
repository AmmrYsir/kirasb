/* KiraASB Privacy Policy — bilingual toggle (EN / BM) */
(function () {
  'use strict';

  var STORE = 'kirasb_state';
  var langBtn = document.getElementById('langBtn');
  var backLabel = document.getElementById('backLabel');
  var skipLink = document.getElementById('skipLink');
  var footerNote = document.getElementById('footerNote');
  var footerHome = document.getElementById('footerHome');
  var blocks = document.querySelectorAll('[data-lang]');

  var UI = {
    en: {
      title: 'KiraASB — Privacy Policy (Web & Android)',
      btn: 'BM',
      btnAria: 'Tukar ke Bahasa Melayu',
      skip: 'Skip to content',
      back: 'Calculator',
      footer: 'KiraASB \u00b7 Independent ASB savings & dividend estimator by AMMR TECH.',
      home: 'Back to Calculator'
    },
    ms: {
      title: 'KiraASB \u2014 Dasar Privasi (Web & Android)',
      btn: 'EN',
      btnAria: 'Switch to English',
      skip: 'Terus ke kandungan',
      back: 'Kalkulator',
      footer: 'KiraASB \u00b7 Penganggar simpanan & dividen ASB bebas oleh AMMR TECH.',
      home: 'Kembali ke Kalkulator'
    }
  };

  function getInitialLang() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'ms' || q === 'en') return q;
    try {
      var saved = JSON.parse(localStorage.getItem(STORE) || '{}');
      if (saved.lang === 'ms' || saved.lang === 'en') return saved.lang;
    } catch (_) {}
    return 'en';
  }

  function applyLang(lang) {
    var l = lang === 'ms' ? 'ms' : 'en';
    var copy = UI[l];
    document.documentElement.lang = l;
    document.title = copy.title;
    langBtn.textContent = copy.btn;
    langBtn.setAttribute('aria-label', copy.btnAria);
    skipLink.textContent = copy.skip;
    backLabel.textContent = copy.back;
    footerNote.textContent = copy.footer;
    footerHome.textContent = copy.home;

    blocks.forEach(function (el) {
      el.hidden = el.getAttribute('data-lang') !== l;
    });
  }

  var current = getInitialLang();
  applyLang(current);

  langBtn.addEventListener('click', function () {
    current = current === 'en' ? 'ms' : 'en';
    applyLang(current);
    try {
      var saved = JSON.parse(localStorage.getItem(STORE) || '{}');
      saved.lang = current;
      localStorage.setItem(STORE, JSON.stringify(saved));
    } catch (_) {}
  });
})();
