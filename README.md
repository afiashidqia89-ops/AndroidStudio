# DroidForge Studio — APK via GitHub Actions

Repo ini sudah siap: cukup di-upload ke GitHub, dan **GitHub Actions**
otomatis membangun APK **DroidForge Studio** untuk Anda.

## Isi repo

| Lokasi | Fungsi |
| --- | --- |
| `.github/workflows/build-apk.yml` | build APK otomatis (Java 17 + Gradle 8.7 + AGP 8.5.2) |
| `.github/workflows/deploy-pages.yml` | opsional: tayangkan versi web di GitHub Pages |
| `android/` | proyek Android (shell WebView + aplikasi Studio di assets) |
| `android/app/src/main/assets/droidforge-studio.html` | **aplikasi DroidForge Studio** — edit file ini untuk mengubah aplikasi |

## Cara build APK (tanpa laptop)

1. Buat repo baru di [github.com/new](https://github.com/new) (Public), kosongan.
2. Klik link **uploading an existing file**, lalu seret **seluruh isi** folder ini
   — folder `.github` WAJIB ikut (aktifkan tampilan file tersembunyi di File Manager).
3. Commit changes → buka tab **Actions** → tunggu workflow **Build APK** (±3–5 menit).
4. Klik run teratas → bagian **Artifacts** → unduh `DroidForgeStudio-debug-APK`.
5. Ekstrak ZIP-nya → ketuk `app-debug.apk` → izinkan instal dari sumber tidak dikenal.

Jika Actions tidak jalan: **Settings → Actions → General → Allow all actions**.

## Bonus: versi web (GitHub Pages)

Setelah repo ter-upload: **Settings → Pages → Build and deployment → Source: GitHub Actions**,
lalu tab **Actions → Deploy Web (GitHub Pages) → Run workflow**.
Studio akan tayang di `https://USERNAME.github.io/NAMA-REPO/`.

## Mengubah aplikasi

| Yang diubah | Lokasi |
| --- | --- |
| Tampilan/fitur aplikasi | `android/app/src/main/assets/droidforge-studio.html` |
| Nomor versi | `android/app/build.gradle` → `versionCode` / `versionName` |
| Nama aplikasi | `android/app/src/main/res/values/strings.xml` |
| Nama paket | `namespace` + `applicationId` di `app/build.gradle` **dan** folder `java/com/droidforge/studio` |

Catatan: APK bertanda tangan debug — pas untuk dipasang sendiri/dibagikan langsung,
bukan untuk Play Store.
