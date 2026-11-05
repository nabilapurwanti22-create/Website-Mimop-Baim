# Deploy Takaran ke Netlify

Isi folder ini:

- `index.html` — aplikasi Takaran
- `netlify/edge-functions/claude.js` — penghubung ke Claude API untuk fitur AI
- `netlify.toml` — pengaturan Netlify

## 1. Siapkan kunci Claude API

Buat API key di https://console.anthropic.com (Settings → API Keys). Pemakaiannya ditagih ke akun Anthropic-mu.

## 2. Deploy (pilih salah satu)

**A. Lewat GitHub (disarankan)**
1. Unggah isi folder ini ke repository GitHub baru.
2. Di Netlify: Add new site → Import an existing project → pilih repository itu. Biarkan build command kosong.

**B. Lewat Netlify CLI**
1. Pasang Node.js, lalu jalankan `npm install -g netlify-cli`.
2. Di folder ini jalankan `netlify deploy --prod` dan ikuti petunjuknya.

Drag & drop folder ke Netlify Drop hanya mengunggah `index.html`. Aplikasi tetap jalan, tetapi fitur AI tidak aktif.

## 3. Isi environment variables

Netlify → Site configuration → Environment variables:

| Nama | Isi |
| --- | --- |
| `ANTHROPIC_API_KEY` | API key dari langkah 1 (wajib) |
| `APP_PASSCODE` | Kode bebas, mis. `takaran2026` (disarankan, supaya orang lain tidak memakai kreditmu) |
| `ANTHROPIC_MODEL` | Opsional, default `claude-sonnet-5-5` |

Setelah mengisi, lakukan deploy ulang (Deploys → Trigger deploy).
Kalau memakai `APP_PASSCODE`, isi kode yang sama di aplikasi: Profil → Kode akses AI.

## Catatan

- Data (profil, catatan makan, laporan tubuh) tersimpan di browser masing-masing pengguna, bukan di server.
- Sinkron otomatis Strava/Hevy tidak tersedia di versi web; aktivitas dicatat manual.
