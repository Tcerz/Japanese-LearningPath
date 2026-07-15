# Hari Pertama Kana — Jalur 6 Bulan ke N5 & N4

Situs satu halaman: bootcamp 7 hari untuk melek hiragana/katakana, plus peta jalan 6 bulan
menuju target ganda JLPT N5 dan N4. Ada sistem akun supaya progresmu tersimpan dan bisa
dibuka dari perangkat lain.

**Semua cara belajarnya self-contained di situs ini** — tidak ada aplikasi eksternal:
- **Pelatih Kana** — kuis interaktif ketik-romaji, dibangun langsung dengan JavaScript di
  `index.html`, bukan tautan ke situs latihan lain.
- **Sistem Ulasan Bawaan** — pengganti Anki. Logika spaced-repetition (Leitner sederhana:
  benar → jadwal ulasan berikutnya makin panjang, salah → muncul lagi hari itu juga)
  berjalan langsung di browser, tersimpan di state yang sama dengan progres harian.
- Satu-satunya sumber luar yang masih diizinkan: **video YouTube**, sebagai pelengkap
  latihan mendengar — bukan bagian wajib dari kriteria kelulusan tiap hari.

## Kenapa bukan Edge Config?

Sempat diminta pakai Edge Config sebagai "database akun" — setelah dicek, itu bukan alat
yang cocok untuk kasus ini, dan saya tidak mau memasangnya lalu diam-diam gagal nanti.
Tiga alasannya:

1. **Edge Config dirancang untuk data yang jarang ditulis, sering dibaca** — cocok untuk
   feature flag atau aturan routing, bukan progres belajar yang berubah tiap kali kamu
   menekan satu tombol cap.
2. **Batas ukuran total hanya 64KB** untuk seluruh Edge Config, dan setiap perubahan butuh
   sekitar 10 detik untuk menyebar ke semua region — akun dengan banyak pengguna akan
   cepat mentok.
3. Dokumentasi Vercel sendiri secara eksplisit bilang: *"Do not store sensitive information
   or user-specific data in Edge Config"* — data per-pengguna memang bukan peruntukannya.

**Yang dipakai sebagai gantinya: Upstash Redis**, database key-value sungguhan yang
tersedia lewat Vercel Marketplace, dirancang untuk baca/tulis cepat dan sering — pas untuk
akun + histori progres. Cara pasangnya di bawah, dan prosesnya sama mudahnya dengan Edge
Config.

## Struktur proyek

```
hari-pertama-kana/
├── index.html          ← seluruh tampilan (HTML+CSS+JS jadi satu)
├── api/
│   ├── signup.js        ← buat akun baru
│   ├── login.js          ← masuk ke akun
│   └── progress.js       ← ambil & simpan progres (perlu login)
├── package.json          ← dependensi untuk fungsi di atas
└── README.md
```

## Langkah 1 — Deploy ke Vercel

**Lewat GitHub (disarankan, supaya gampang update nanti):**
1. Push folder ini ke repo GitHub baru.
2. Di https://vercel.com/new → Import repo tersebut → klik Deploy.
   Vercel otomatis mengenali `api/` sebagai Serverless Functions, tidak perlu konfigurasi
   tambahan.

**Lewat CLI:**
```bash
npm i -g vercel
cd hari-pertama-kana
vercel --prod
```

Situsnya akan langsung bisa dibuka di `nama-proyekmu.vercel.app`, tapi tombol Masuk/Buat
Akun belum berfungsi sampai langkah 2 selesai.

## Langkah 2 — Pasang database Upstash Redis

1. Buka proyekmu di dashboard Vercel → tab **Storage**.
2. Klik **Create Database** atau **Browse Marketplace** → cari **Upstash** → pilih
   **Redis**.
3. Ikuti alur pembuatannya (paket gratis Upstash cukup untuk penggunaan pribadi).
4. Setelah dibuat, hubungkan database itu ke proyekmu — Vercel otomatis menambahkan
   variabel lingkungan yang dibutuhkan (`KV_REST_API_URL`, `KV_REST_API_TOKEN`, dst.)
   ke proyek. `@upstash/redis` di kode ini (`Redis.fromEnv()`) langsung membacanya, tidak
   perlu kamu tempel manual.
5. **Redeploy** proyekmu sekali (Deployments → titik tiga di deployment terakhir →
   Redeploy) supaya variabel lingkungan baru terbaca oleh fungsi API.

Setelah ini, tombol **Buat Akun** dan **Masuk** di situs akan berfungsi, dan progres yang
kamu cap akan otomatis tersimpan ke akunmu — buka situs yang sama dari HP atau laptop
lain, masuk dengan akun yang sama, progresnya langsung muncul.

## Cara kerja akunnya (ringkas)

- Password disimpan sudah di-hash (bcrypt), bukan teks biasa.
- Setelah masuk, kamu dapat token sesi yang tersimpan di browser (localStorage) dan
  berlaku 90 hari.
- Progres tetap tersimpan juga secara lokal di perangkat sebagai cadangan, jadi situs
  tetap jalan walau sedang offline atau belum sempat masuk akun.

## File

- `index.html` — seluruh situs.
- `api/signup.js`, `api/login.js`, `api/progress.js` — fungsi backend akun & penyimpanan.
- `package.json` — dependensi (`@upstash/redis`, `bcryptjs`).
- `README.md` — berkas ini.
