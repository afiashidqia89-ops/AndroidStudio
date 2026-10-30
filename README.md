# DroidForge — Toolkit Modifikasi Android

Toolkit modifikasi Android berbasis web (offline-first) yang dikemas siap build menjadi:

1. **Aplikasi Android (APK)** — di-build otomatis oleh GitHub Actions, **tanpa perlu Android Studio**
2. **Aplikasi Web** — bisa diakses lewat GitHub Pages dari browser mana pun

> Semua preferensi tersimpan di `localStorage` perangkat. Tidak ada data yang dikirim ke server mana pun.

---

## Struktur Proyek

```
droidforge/
├── .github/
│   └── workflows/
│       ├── build-apk.yml          → Workflow build APK otomatis
│       └── deploy-pages.yml       → Workflow deploy versi web (GitHub Pages)
├── android/                       → Proyek Android (WebView)
│   ├── settings.gradle
│   ├── build.gradle
│   ├── gradle.properties
│   └── app/
│       ├── build.gradle           → Nama paket, versi, target SDK
│       └── src/main/
│           ├── AndroidManifest.xml
│           ├── java/com/droidforge/app/MainActivity.java
│           ├── assets/index.html  ← APLIKASI UTAMA (edit file ini)
│           └── res/               → Ikon launcher & tema
├── .gitignore
└── README.md
```

---

## Cara Build APK di GitHub (Tanpa Android Studio)

### 1. Upload ke GitHub

1. Login ke [github.com](https://github.com) → klik **+** (kanan atas) → **New repository**
2. Beri nama repo, mis. `droidforge` → pilih **Public** (agar Actions & Pages gratis) → **Create repository**
3. Di halaman repo kosong, klik link **"uploading an existing file"**
4. **Drag semua isi folder `droidforge/` ini** ke area upload (termasuk folder `.github`!) → klik **Commit changes**

> **Penting:** Folder `.github` berisi workflow build. Jika tidak ikut ter-upload, APK tidak akan ter-build.
> Jika drag & drop folder bermasalah, gunakan [GitHub Desktop](https://desktop.github.com) atau perintah `git`.

### 2. Build APK

1. Buka tab **Actions** di repo Anda
2. Workflow **Build APK** berjalan otomatis setiap kali ada push (build pertama ± 4–6 menit)
3. Klik run yang selesai → gulir ke bawah ke bagian **Artifacts**
4. Unduh **DroidForge-debug-APK** (berbentuk file ZIP)

### 3. Install di HP

1. Ekstrak ZIP hasil unduhan → di dalamnya ada `app-debug.apk`
2. Kirim APK ke HP (WhatsApp / USB / Google Drive)
3. Buka file APK di HP → izinkan **"Install dari sumber tidak dikenal"** → **Install**
4. Selesai — DroidForge muncul di launcher dengan ikon robot hijau

---

## Mengaktifkan Versi Web (GitHub Pages)

1. Di repo: **Settings → Pages**
2. Pada **Build and deployment → Source**, pilih **GitHub Actions**
3. Buka tab **Actions → Deploy Web (GitHub Pages) → Run workflow**
4. Setelah selesai, buka: `https://USERNAME.github.io/droidforge/`

---

## Cara Mengubah Aplikasi

1. Edit file `android/app/src/main/assets/index.html` (di GitHub: buka file → ikon pensil)
2. Commit → APK dan versi web otomatis di-build ulang

## Mengubah Nama & Versi

| Yang diubah    | File                                                                    |
| -------------- | ----------------------------------------------------------------------- |
| Nama aplikasi  | `android/app/src/main/res/values/strings.xml`                            |
| Nomor versi    | `android/app/build.gradle` → `versionCode` (naikkan tiap rilis) & `versionName` |
| Nama paket     | `android/app/build.gradle` → `applicationId` + `namespace`               |
| Warna status bar | `android/app/src/main/res/values/themes.xml`                           |

---

## Catatan

- APK yang dihasilkan adalah **debug build** — cocok untuk pemakaian pribadi/internal. Untuk rilis publik (Play Store) diperlukan signing key release yang bisa ditambahkan belakangan.
- Aksi modifikasi sistem (uninstall bloat via ADB, dll.) tetap memerlukan perangkat yang terhubung Termux/PC — toolkit ini menyediakan perintah siap-salin, daftar paket, dan panduan langkah demi langkah.
