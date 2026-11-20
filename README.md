# KiraASB

**KiraASB** ialah kalkulator simpanan dan anggaran dividen **Amanah Saham Bumiputera (ASB)** — ringan, pantas, dwibahasa (BM/EN) dan berasa seperti aplikasi mudah alih.

## Ciri-ciri
- Anggaran baki akhir, jumlah modal, jumlah dividen dan dividen tahun pertama (berdasarkan Baki Minimum Bulanan).
- Input RM berformat langsung + slider + kadar pantas (4.25 / 5.25 / 5.75 / 6.50%).
- Togol kompaun dividen tahunan.
- Carta bar bertindih (SVG sendiri) dan jadual pecahan tahunan.
- Tema cerah / gelap (ikut sistem, boleh ditukar).
- BM / EN, tetapan disimpan dalam `localStorage`.
- Pautan kongsi yang mengekalkan nilai pengiraan.
- PWA + Service Worker (luar talian), SEO (Open Graph, JSON-LD).

## Teknologi
HTML, CSS dan JavaScript biasa — **tiada framework, tiada CDN, tiada langkah build**. Semua fail dihidangkan terus dari domain anda.

## Struktur
```text
kirasb/
├── index.html
├── css/styles.css
├── js/i18n.js        # Terjemahan BM/EN
├── js/app.js         # Logik, carta & UI
├── icons/icon.svg
├── manifest.json     # PWA
├── sw.js             # Service Worker
├── _headers          # Header keselamatan & cache (Cloudflare Pages / Netlify)
├── robots.txt
└── sitemap.xml
```

## Jalankan secara tempatan
```bash
npx serve .
# atau
python -m http.server 8080
```

## Deploy ke Cloudflare Pages
- Framework preset: `None`
- Build command: *(kosong)*
- Build output directory: `.`

Selepas dapat domain: gantikan `https://kirasb.example.com/` dalam `robots.txt` dan `sitemap.xml`, dan tambah `<link rel="canonical">` dalam `index.html`.

## Penafian
KiraASB ialah kalkulator bebas dan tidak rasmi, tiada kaitan dengan ASNB atau PNB. Semua pengiraan hanyalah anggaran untuk tujuan pendidikan.
