# Invoice Builder

Pembuat faktur 100% client-side (React + Vite + TailwindCSS). Tanpa backend/database.
Data tersimpan otomatis di LocalStorage browser.

## Membuat project dari nol (jika ingin mengulang manual)
```bash
npm create vite@latest invoice-builder -- --template react
cd invoice-builder
npm install
npm install tailwindcss @tailwindcss/vite
```
Lalu tambahkan plugin `tailwindcss()` di `vite.config.js` dan `@import "tailwindcss";` di `src/index.css`
(sudah dilakukan di zip ini).

## Menjalankan
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # hasil di folder dist/
```

## Deploy ke Netlify
Push ke GitHub lalu import di Netlify, atau drag-and-drop folder `dist`.
`netlify.toml` sudah mengatur build command, publish directory, dan redirect SPA.

## Struktur
```
invoice-builder/
├── netlify.toml
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx                  # state, kalkulasi, layout
    ├── index.css                # Tailwind + gaya cetak
    ├── hooks/useLocalStorage.js
    ├── utils/format.js          # format mata uang, tanggal, id
    └── components/
        ├── Field.jsx
        ├── PartyForm.jsx        # form perusahaan & klien
        ├── ItemsTable.jsx       # tabel item dinamis
        └── InvoicePreview.jsx   # tampilan faktur (yang dicetak)
```

## Menu dashboard
Documents: Invoices, Quotes · Data: Banks, Items, Currencies, Units, Categories, Clients, Businesses ·
Style Profiles · Reports · Settings (default, ekspor/impor backup JSON).
Kode: `src/data/schema.js` (definisi menu & field), `src/pages/*`, `src/components/Sidebar.jsx`.

## Fitur (versi mengikuti referensi, client-side)
Snapshot bank/bisnis/klien/item/style per dokumen · diskon % / tetap · ongkir · pajak inklusif/eksklusif, per item/total, pajak dipotong ·
pembayaran sebagian & status otomatis (unpaid/partial/paid/closed) · bahasa per dokumen (EN/ID/FR/DE) · style profile (font, warna, kertas A4/Letter,
watermark, kolom) · logo & tanda tangan · UBL 2.1 / Peppol BIS 3.0 / XRechnung (XML) · XLSX import/ekspor · arsip, cari, sort persisten ·
penomoran prefix/suffix · format angka/tanggal · mode gelap · backup JSON.

## Mode cloud (login + multi-pengguna) dengan Supabase
1. Buat project di supabase.com, lalu jalankan `supabase/schema.sql` di SQL Editor (tabel `user_data`, `subscriptions`, RLS, trigger paket free).
2. Salin `.env.example` ke `.env.local`, isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` (Project Settings > API). Isi variabel yang sama di Netlify.
3. Supabase > Authentication > URL Configuration: isi Site URL dengan domain Netlify Anda.
4. `npm install && npm run dev`. Tanpa variabel di atas, aplikasi tetap jalan mode lokal (tanpa login).

Batasan saat ini: data disimpan sebagai satu dokumen JSON per pengguna (last-write-wins jika dibuka di dua perangkat);
batas paket free (10 dokumen) hanya dicek di frontend; kolom `subscriptions` diisi manual/webhook pembayaran (belum ada);
belum ada halaman ganti password setelah tautan reset.
