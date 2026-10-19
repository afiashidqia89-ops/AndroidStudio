#!/usr/bin/env bash
# Menyalin ikon launcher ke proyek Android hasil `npx cap add android`.
set -e
cd "$(dirname "$0")/.."
if [ ! -d android/app/src/main/res ]; then
  echo "Folder android belum ada; lewati pemasangan ikon."
  exit 0
fi
cp -r icons-android/. android/app/src/main/res/
echo "Ikon aplikasi terpasang."
