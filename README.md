# KiraASB

**KiraASB** ialah kalkulator simpanan dan anggaran dividen **Amanah Saham Bumiputera (ASB)** yang ringan, mesra SEO, dan direka dengan pengalaman seakan aplikasi mudah alih (*mobile-app feel*).

## Ciri-ciri Utama
- **Pengiraan Masa Nyata:** Anggaran baki akhir, jumlah modal, jumlah dividen, dan dividen tahun pertama berdasarkan Baki Minimum Bulanan.
- **Format Nombor Langsung:** Input RM diformat secara langsung dengan tanda koma (cth: `250,000`) dan papan kekunci angka pada peranti mudah alih.
- **Pilihan Kompaun:** Togol untuk mengira kesan kompaun tahunan berbanding pengeluaran dividen setiap tahun.
- **Carta Interaktif & Jadual Tahunan:** Graf bar bertindih (*Chart.js*) dan pecahan tahun demi tahun.
- **Dwibahasa (BM / EN):** Tukar bahasa antara Bahasa Melayu dan English dengan simpanan automatik dalam `localStorage`.
- **Kongsi Pautan:** Pautan URL boleh kongsi yang mengekalkan nilai pengiraan anda.
- **Mesra SEO & PWA:** Dilengkapi meta Open Graph, JSON-LD (`WebApplication` + `FAQPage`), `robots.txt`, `sitemap.xml`, `manifest.json`, dan Service Worker (`sw.js`).

## Teknologi
- **HTML5 Semantik**
- **Alpine.js** (CDN)
- **Tailwind CSS** (Play CDN) + `css/styles.css`
- **Chart.js** (CDN)

## Struktur Fail
```text
kirasb/
├── index.html       # Halaman utama, SEO & komponen kalkulator
├── css/
│   └── styles.css   # Gaya slider, 100dvh, mobile safe-area & input
├── js/
│   └── app.js       # Logik pengiraan ASB, i18n (BM/EN), carta & format input
├── manifest.json    # Konfigurasi PWA
├── sw.js            # Service Worker untuk sokongan luar talian
├── robots.txt       # Arahan enjin carian
├── sitemap.xml      # Peta laman SEO
└── .gitignore       # Fail yang diabaikan oleh Git
```

## Cara Jalankan Secara Tempatan
Disebabkan projek ini menggunakan Service Worker (`sw.js`), buka melalui pelayan HTTP tempatan (bukan `file://`):

```bash
# Menggunakan Node.js
npx serve .

# Atau menggunakan Python
python -m http.server 8080
```

Kemudian buka `http://localhost:8080` (atau port yang dipaparkan) di pelayar anda.

## Penafian
KiraASB ialah kalkulator bebas dan tidak rasmi. Ia tidak mempunyai kaitan dengan **Amanah Saham Nasional Berhad (ASNB)** atau **Permodalan Nasional Berhad (PNB)**. Semua pengiraan adalah anggaran untuk tujuan pendidikan dan perancangan kewangan sahaja.
