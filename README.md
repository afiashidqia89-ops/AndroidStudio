# Retensi Pemanen KSA1G — APK Native (Capacitor + GitHub Actions)

Aplikasi **Dashboard Retensi Pemanen Estate KSA1G** yang dikemas menjadi **APK Android native**.
UI-nya dirancang ulang khusus untuk layar HP (bukan layout dashboard PC yang diperkecil):

- **Navigasi bawah 3 tab**: Ringkasan · Pemanen · Update — pola khas aplikasi Android.
- **Filter lewat bottom-sheet** (geser dari bawah), bukan bar filter panjang milik versi PC.
- **Daftar pemanen berbentuk kartu** — ketuk kartu untuk detail lengkap + tren 3 bulan.
- **Baris afdeling bisa diketuk** langsung untuk memfilter (di panel Kebutuhan vs Ketersediaan).
- Grafik bulanan & heatmap bergeser horizontal (khas ponsel), KPI dalam grid 2 kolom.

Seluruh fitur asli tetap utuh: **Update dari Excel** (template & format DB Query),
**Sync Google Spreadsheet**, **urungkan update / data awal**, unduh data (Excel/CSV),
dan penyimpanan otomatis di perangkat.

---

## Isi Proyek

```
retensi-ksa1g-apk/
├── www/                        ← aplikasi web (dikemas ke dalam APK)
│   ├── index.html              ← kerangka UI mobile (3 tab + sheet)
│   ├── css/app.css             ← gaya UI mobile
│   ├── js/data.js              ← data awal bawaan (D0)
│   ├── js/core.js              ← mesin data: parser Excel, sync sheet, penyimpanan
│   ├── js/ui.js                ← renderer tampilan mobile
│   └── vendor/xlsx.full.min.js ← pustaka Excel (lokal, tahan offline)
├── icons-android/              ← ikon launcher (legacy + adaptive)
├── scripts/install-icons.sh    ← pemasang ikon ke proyek Android saat build
├── .github/workflows/build-apk.yml ← otomatis membangun APK di GitHub
├── capacitor.config.json       ← konfigurasi Capacitor
└── package.json
```

---

## Cara Membuat APK (100% gratis, tanpa install apa pun di komputer)

### 1. Unggah proyek ke GitHub

1. Buat akun GitHub (jika belum punya) di https://github.com lalu login.
2. Klik **+** (kanan atas) → **New repository** → beri nama, misal `retensi-ksa1g-apk`
   → pilih **Private** (disarankan) → **Create repository**.
3. Di halaman repo, klik **uploading an existing file**.
4. **Upload seluruh isi folder ini** (file + subfolder `www`, `icons-android`,
   `scripts`, `.github`). Cara termudah: buka folder ini di komputer, pilih semua
   isinya, lalu seret ke area unggah GitHub. Pastikan struktur foldernya ikut
   terunggah (`.github/workflows/build-apk.yml` **wajib** ikun).
   > Catatan: GitHub web kadang tidak menerima folder `.github` lewat seret-lepas.
   > Bila itu terjadi, buat file manual: di repo → **Add file → Create new file** →
   > ketik `.github/workflows/build-apk.yml` → tempel isinya → Commit.
5. Klik **Commit changes**. Selesai — build pun berjalan otomatis.

### 2. Ambil hasil APK

1. Buka tab **Actions** di repo Anda.
2. Klik workflow **Build APK** pada commit terbaru.
3. Tunggu ± 5–10 menit (pekerjaan pertama paling lama).
4. Di bagian bawah halaman, unduh **Artifacts → Retensi-KSA1G-APK** (berisi `app-debug.apk`).
5. Kirim APK ke HP (WhatsApp/Drive/USB), buka, izinkan
   **"Install dari sumber tidak dikenal"** bila diminta → Install.

Setiap kali Anda mengubah file di repo (mis. teks judul), APK baru otomatis dibuat lagi.

### 3. (Opsional) Build via git di komputer

```bash
git init && git add . && git commit -m "APK Retensi KSA1G"
git branch -M main
git remote add origin https://github.com/USERNAME/retensi-ksa1g-apk.git
git push -u origin main
```

---

## Cara Pakai Aplikasi

| Tab | Isi |
|---|---|
| **Ringkasan** | KPI, grafik TO bulanan, kebutuhan vs ketersediaan (ketuk baris afdeling = filter), heatmap TO, dll. Tombol **Filter** di kanan atas membuka sheet filter (Afdeling / Kontrak / Status / Periode). |
| **Pemanen** | Cari nama/NIK, filter afdeling & kategori risiko; ketuk kartu → detail lengkap + tren Pendapatan/Output/HKE. |
| **Update** | Sync Google Spreadsheet, unggah Excel (template / DB Query), unduh template & data, urungkan / reset, simpan dashboard HTML. |

### Sync Google Spreadsheet
1. Salin tab template (`Pemanen`, `Bulanan`, `Tersedia_Afd`, dst.) ke Google Spreadsheet —
   **nama tab harus sama** dengan template.
2. Bagikan spreadsheet: **Siapa saja yang memiliki tautan — Pelihat**.
3. Di tab **Update**, tempel tautan → **Sync Sekarang**. Aktifkan
   **"Sync otomatis saat aplikasi dibuka"** agar data selalu segar setiap kali APK dibuka.
4. File Excel/CSV hasil unduhan di APK muncul lewat **layar berbagi Android**
   (simpan ke File/Drive, atau kirim via WhatsApp).

---

## Kustomisasi

| Yang diubah | File | Bagian |
|---|---|---|
| Nama aplikasi (di bawah ikon) | `capacitor.config.json` | `"appName"` |
| ID paket (uninstall dulu versi lama jika diganti) | `capacitor.config.json` | `"appId"` |
| Judul di bilah atas | `www/index.html` | `<h1>Retensi Pemanen</h1>` |
| Warna/tema | `www/css/app.css` | blok `:root` paling atas |
| Ikon | `icons-android/` | ganti PNG-nya (ukuran sama) |

Setelah mengubah apa pun, **push/commit** → GitHub otomatis membuat APK baru.

---

## Penyimpanan Data

- Data tersimpan di **penyimpanan internal aplikasi** (IndexedDB) — tetap ada meski
  aplikasi ditutup, dan hilang jika aplikasi **di-uninstall**.
- Rutinlah menyimpan cadangan: tab **Update → ⬇ Data (Excel)**, atau bagikan
  dashboard HTML lengkap via **💾 Simpan dashboard (HTML)**.
- Kehilangan data bukan masalah bila sumber kebenaran ada di Google Spreadsheet
  (cukup sync ulang).

## Pemecahan Masalah

| Gejala | Solusi |
|---|---|
| Workflow Actions gagal | Buka halaman workflow → cek langkah merah. Jalankan ulang lewat **Re-run jobs**. |
| Artifact tidak muncul | Pastikan build sukses (tanda centang hijau) di tab Actions. |
| Sync gagal di HP | Pastikan spreadsheet dibagikan *publik-pelihat*, nama tab sesuai template, dan internet aktif. Aplikasi otomatis mencoba jalur cadangan (proxy) bila koneksi langsung terblokir. |
| Excel ditolak | Unduh ulang **Template** dari aplikasi, isi sesuai petunjuk di sheet *Petunjuk*. File asli "Data Pendukung Retensi Panen – DB Query.xlsx" juga diterima. |
| Tombol unduh tidak bereaksi | Bila layar berbagi tidak muncul, cek aplikasi Files/Drive — atau gunakan versi browser (GitHub Pages) untuk mengunduh. |

---

*Versi web (PWA) aplikasi ini tetap kompatibel: folder `www/` bisa dipakai untuk
GitHub Pages seperti sebelumnya, karena seluruh logika datanya sama.*
