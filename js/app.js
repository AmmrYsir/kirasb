const I18N = {
  ms: {
    appTagline: 'Kalkulator Simpanan & Dividen ASB',
    projectedBalance: 'Anggaran Baki Akhir',
    totalPrincipal: 'Jumlah Modal',
    totalDividend: 'Jumlah Dividen',
    firstYearDividend: 'Dividen Tahun Pertama',
    initialSavings: 'Simpanan Awal (RM)',
    monthlyDeposit: 'Simpanan Bulanan (RM)',
    dividendRate: 'Anggaran Kadar Dividen + Bonus (%)',
    durationYears: 'Tempoh Simpanan (Tahun)',
    reinvestLabel: 'Kompaun Dividen Setiap Tahun',
    reinvestHint: 'Dividen kekal dalam akaun untuk menjana pulangan berganda.',
    reset: 'Set Semula',
    share: 'Kongsi',
    copied: 'Pautan disalin!',
    chartTitle: 'Unjuran Pertumbuhan Simpanan',
    breakdownTitle: 'Jadual Pecahan Tahunan',
    year: 'Tahun',
    principal: 'Modal',
    annualDiv: 'Dividen Tahunan',
    endingBalance: 'Baki Akhir',
    showAll: 'Lihat Semua Tahun',
    showLess: 'Tunjuk Ringkas',
    navCalc: 'Kalkulator',
    navChart: 'Carta',
    navTable: 'Jadual',
    navFaq: 'Soalan',
    assumeNote: 'Andaian: Simpanan bulanan dibuat sebelum atau pada 1 haribulan setiap bulan supaya layak dikira dalam Baki Minimum Bulanan.'
  },
  en: {
    appTagline: 'ASB Savings & Dividend Calculator',
    projectedBalance: 'Projected Final Balance',
    totalPrincipal: 'Total Principal',
    totalDividend: 'Total Dividends',
    firstYearDividend: 'Year 1 Dividend',
    initialSavings: 'Initial Savings (RM)',
    monthlyDeposit: 'Monthly Top-up (RM)',
    dividendRate: 'Expected Dividend + Bonus Rate (%)',
    durationYears: 'Savings Duration (Years)',
    reinvestLabel: 'Reinvest Dividends Annually',
    reinvestHint: 'Keep dividends in ASB to earn compounded returns.',
    reset: 'Reset',
    share: 'Share',
    copied: 'Link copied!',
    chartTitle: 'Projected Savings Growth',
    breakdownTitle: 'Year-by-Year Breakdown',
    year: 'Year',
    principal: 'Principal',
    annualDiv: 'Annual Dividend',
    endingBalance: 'Ending Balance',
    showAll: 'Show All Years',
    showLess: 'Show Less',
    navCalc: 'Calculator',
    navChart: 'Chart',
    navTable: 'Table',
    navFaq: 'FAQ',
    assumeNote: 'Assumption: Monthly deposits are made on or before the 1st of each month to count toward the Monthly Minimum Balance.'
  }
};

let asbChartInstance = null;

function kiraAsbApp() {
  return {
    lang: 'ms',
    initialSavings: 5000,
    monthlyDeposit: 300,
    rate: 5.75,
    years: 10,
    reinvest: true,
    showAllYears: false,
    copiedToast: false,
    activeFaq: 0,

    init() {
      this.loadState();
      this.$nextTick(() => {
        this.renderChart();
      });

      this.$watch('initialSavings', () => this.onInputChange());
      this.$watch('monthlyDeposit', () => this.onInputChange());
      this.$watch('rate', () => this.onInputChange());
      this.$watch('years', () => this.onInputChange());
      this.$watch('reinvest', () => this.onInputChange());
      this.$watch('lang', () => {
        this.saveState();
        this.renderChart();
      });
    },

    t(key) {
      return I18N[this.lang]?.[key] || I18N.ms[key] || key;
    },

    toggleLang() {
      this.lang = this.lang === 'ms' ? 'en' : 'ms';
    },

    onInputChange() {
      this.saveState();
      this.renderChart();
    },

    loadState() {
      const params = new URLSearchParams(window.location.search);
      const saved = JSON.parse(localStorage.getItem('kirasb_state') || '{}');

      this.lang = params.get('lang') || saved.lang || 'ms';
      this.initialSavings = this.clampNum(params.get('init') ?? saved.initialSavings ?? 5000, 0, 1000000);
      this.monthlyDeposit = this.clampNum(params.get('monthly') ?? saved.monthlyDeposit ?? 300, 0, 50000);
      this.rate = this.clampNum(params.get('rate') ?? saved.rate ?? 5.75, 0.5, 15);
      this.years = this.clampNum(params.get('years') ?? saved.years ?? 10, 1, 35);
      if (params.has('reinvest')) {
        this.reinvest = params.get('reinvest') !== '0';
      } else if (typeof saved.reinvest === 'boolean') {
        this.reinvest = saved.reinvest;
      }
    },

    saveState() {
      localStorage.setItem(
        'kirasb_state',
        JSON.stringify({
          lang: this.lang,
          initialSavings: Number(this.initialSavings) || 0,
          monthlyDeposit: Number(this.monthlyDeposit) || 0,
          rate: Number(this.rate) || 0,
          years: Number(this.years) || 1,
          reinvest: Boolean(this.reinvest)
        })
      );
    },

    resetDefaults() {
      this.initialSavings = 5000;
      this.monthlyDeposit = 300;
      this.rate = 5.75;
      this.years = 10;
      this.reinvest = true;
      window.history.replaceState({}, '', window.location.pathname);
    },

    async shareCalculation() {
      const url = new URL(window.location.href);
      url.searchParams.set('init', this.initialSavings);
      url.searchParams.set('monthly', this.monthlyDeposit);
      url.searchParams.set('rate', this.rate);
      url.searchParams.set('years', this.years);
      url.searchParams.set('reinvest', this.reinvest ? '1' : '0');
      url.searchParams.set('lang', this.lang);

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'KiraASB — Unjuran Simpanan ASB',
            text: `Anggaran baki ASB selepas ${this.years} tahun: ${this.formatRM(this.summary.finalBalance)}`,
            url: url.toString()
          });
          return;
        } catch (_) {
          // Fallback to clipboard
        }
      }

      await navigator.clipboard.writeText(url.toString());
      this.copiedToast = true;
      setTimeout(() => (this.copiedToast = false), 2200);
    },

    clampNum(val, min, max) {
      const n = Number(val);
      if (Number.isNaN(n)) return min;
      return Math.min(Math.max(n, min), max);
    },

    formatInputNumber(val) {
      const num = Number(val);
      if (Number.isNaN(num)) return '0';
      const [intPart, decPart] = String(num).split('.');
      const formattedInt = Number(intPart).toLocaleString('en-US');
      return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
    },

    handleCurrencyInput(field, event, maxVal) {
      const input = event.target;
      const raw = input.value;
      const cursorPos = input.selectionStart || 0;

      // Count valid characters (digits and first dot) before the cursor
      let validBeforeCursor = 0;
      let seenDotBefore = false;
      for (let i = 0; i < cursorPos; i++) {
        const ch = raw[i];
        if (/\d/.test(ch)) {
          validBeforeCursor++;
        } else if (ch === '.' && !seenDotBefore) {
          validBeforeCursor++;
          seenDotBefore = true;
        }
      }

      // Strip everything except digits and a single decimal point
      let cleaned = raw.replace(/[^\d.]/g, '');
      const firstDot = cleaned.indexOf('.');
      if (firstDot !== -1) {
        cleaned =
          cleaned.slice(0, firstDot + 1) +
          cleaned.slice(firstDot + 1).replace(/\./g, '').slice(0, 2);
      }

      if (cleaned === '') {
        this[field] = 0;
        input.value = '';
        return;
      }

      let numericVal = parseFloat(cleaned);
      if (Number.isNaN(numericVal)) numericVal = 0;
      if (numericVal > maxVal) {
        numericVal = maxVal;
        cleaned = String(maxVal);
      }

      this[field] = numericVal;

      const [intPart, decPart] = cleaned.split('.');
      const formattedInt = intPart ? Number(intPart).toLocaleString('en-US') : '0';
      const formatted = decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
      input.value = formatted;

      // Restore cursor position relative to digits/dot
      let newPos = 0;
      let counted = 0;
      while (newPos < formatted.length && counted < validBeforeCursor) {
        if (/[\d.]/.test(formatted[newPos])) {
          counted++;
        }
        newPos++;
      }
      input.setSelectionRange(newPos, newPos);
    },

    handleCurrencyBlur(field, event) {
      event.target.value = this.formatInputNumber(this[field]);
    },

    get breakdown() {
      const init = Math.max(0, Number(this.initialSavings) || 0);
      const monthly = Math.max(0, Number(this.monthlyDeposit) || 0);
      const annualRate = Math.max(0, Number(this.rate) || 0) / 100;
      const totalYears = Math.max(1, Math.min(35, Math.round(Number(this.years) || 1)));

      const rows = [];
      let accountBalance = init;
      let cumulativePrincipal = init;
      let cumulativeDividend = 0;

      for (let y = 1; y <= totalYears; y++) {
        let yearlyDividend = 0;

        for (let m = 1; m <= 12; m++) {
          accountBalance += monthly;
          cumulativePrincipal += monthly;
          yearlyDividend += accountBalance * (annualRate / 12);
        }

        cumulativeDividend += yearlyDividend;
        if (this.reinvest) {
          accountBalance += yearlyDividend;
        }

        rows.push({
          year: y,
          principal: cumulativePrincipal,
          annualDividend: yearlyDividend,
          cumulativeDividend: cumulativeDividend,
          endingBalance: this.reinvest ? accountBalance : cumulativePrincipal + cumulativeDividend
        });
      }

      return rows;
    },

    get visibleRows() {
      const rows = this.breakdown;
      return this.showAllYears ? rows : rows.slice(0, 5);
    },

    get summary() {
      const rows = this.breakdown;
      const last = rows[rows.length - 1] || {
        principal: 0,
        cumulativeDividend: 0,
        endingBalance: 0
      };
      return {
        finalBalance: last.endingBalance,
        totalPrincipal: last.principal,
        totalDividend: last.cumulativeDividend,
        firstYearDividend: rows[0]?.annualDividend || 0
      };
    },

    formatRM(value) {
      return new Intl.NumberFormat('ms-MY', {
        style: 'currency',
        currency: 'MYR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value || 0);
    },

    formatCompactRM(value) {
      if (value >= 1000000) return `RM ${(value / 1000000).toFixed(2)}J`;
      if (value >= 1000) return `RM ${(value / 1000).toFixed(1)}k`;
      return `RM ${Math.round(value)}`;
    },

    renderChart() {
      const canvas = document.getElementById('asbChart');
      if (!canvas || typeof Chart === 'undefined') return;

      const rows = this.breakdown;
      const labels = rows.map((r) => `${this.t('year')} ${r.year}`);
      const principals = rows.map((r) => Math.round(r.principal));
      const dividends = rows.map((r) => Math.round(r.cumulativeDividend));

      if (asbChartInstance) {
        asbChartInstance.destroy();
        asbChartInstance = null;
      }

      asbChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: this.t('principal'),
              data: principals,
              backgroundColor: '#94a3b8',
              borderRadius: 4
            },
            {
              label: this.t('totalDividend'),
              data: dividends,
              backgroundColor: '#059669',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                boxWidth: 8
              }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${this.formatRM(ctx.raw)}`
              }
            }
          },
          scales: {
            x: {
              stacked: true,
              grid: { display: false }
            },
            y: {
              stacked: true,
              ticks: {
                callback: (val) => this.formatCompactRM(val)
              }
            }
          }
        }
      });
    }
  };
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
