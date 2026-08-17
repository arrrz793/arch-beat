# ArchBeat

Pemutar musik web (Next.js 14 + TypeScript + Tailwind) yang memakai data dari
YouTube Music (tidak resmi), siap di-deploy ke Vercel dan dibungkus jadi APK
Android (Trusted Web Activity) tanpa address bar browser.

Tampilannya sepenuhnya **monokrom** (grayscale), meniru alur UI dari video
contoh (mood chip → playlist trending → grid genre → mini player → player
penuh dengan lirik karaoke), memakai logo yang kamu berikan sebagai ikon
aplikasi.

## Fitur

- **Beranda**: mood/genre chip, playlist trending, grid lagu — tanpa 4 ikon
  bulat di pojok kanan atas (sudah dihilangkan sesuai permintaan).
- **Cari**: pencarian lagu real-time ke YouTube Music.
- **Pustaka**: lagu disukai + riwayat pemutaran (tersimpan lokal di perangkat).
- **Mini player** + **Player penuh** dengan art, kontrol lengkap (shuffle,
  repeat, seek, volume), antrean lagu, dan **lirik tersinkron** bergaya
  karaoke (baris aktif tebal & terang, baris lain memudar, auto-scroll,
  ketuk baris untuk lompat ke waktu itu) — sama seperti video contoh.
- **Pemutaran latar belakang**: musik tetap berjalan saat aplikasi
  diminimalkan maupun saat layar mati, lewat Media Session API + elemen
  `<audio>` tunggal yang tidak pernah di-unmount (lihat
  `components/player/AudioEngine.tsx`).
- PWA installable, `display: standalone`, siap dibungkus TWA (Trusted Web
  Activity) agar saat dibuka sebagai APK **tidak muncul address bar/nama
  web**.

## 1. Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

> Proyek ini butuh koneksi internet saat runtime (server memanggil endpoint
> internal YouTube Music untuk pencarian, beranda, lirik, dan streaming
> audio) — jadi jalankan `npm install` & `npm run dev`/`next build` di mesin
> yang punya akses internet.

## 2. Deploy ke Vercel

1. Push folder ini ke repo GitHub/GitLab kamu.
2. Buka [vercel.com](https://vercel.com) → **New Project** → pilih repo ini.
3. Framework preset otomatis terdeteksi sebagai **Next.js** — biarkan default,
   klik **Deploy**.
4. Setelah selesai kamu akan dapat URL seperti `https://archbeat.vercel.app`.

Tidak ada environment variable wajib — `ytmusic-api` dan endpoint lirik/stream
tidak butuh API key (memakai endpoint publik YouTube Music yang sama dengan
yang dipakai web client resminya).

### Catatan tentang route streaming audio

`app/api/stream/[videoId]/route.ts` memakai `@distube/ytdl-core` dan diset
`runtime = "nodejs"` (bukan Edge) karena butuh Node `https`/stream. Di Vercel
ini otomatis jalan sebagai Serverless Function biasa — tidak perlu
konfigurasi tambahan.

## 3. Build jadi APK (tanpa address bar)

Yang membuat address bar muncul (seperti di foto contoh kamu) adalah karena
**Digital Asset Links belum diverifikasi** antara APK dan domain Vercel-mu.
Kalau verifikasi ini lolos, Chrome akan menampilkan halaman sebagai Trusted
Web Activity **tanpa UI browser sama sekali** (persis app native).

Langkah paling gampang: pakai [PWABuilder](https://www.pwabuilder.com).

1. Deploy dulu ke Vercel (langkah 2), catat URL produksinya.
2. Buka pwabuilder.com → masukkan URL Vercel kamu → klik **Start**.
3. PWABuilder akan membaca `manifest.json` (nama ArchBeat, ikon, warna, dll
   sudah diisi di `public/manifest.json`) → pastikan skor "Manifest" hijau.
4. Klik **Package for Stores** → pilih **Android** → biarkan opsi default
   (Package ID misalnya `com.archbeat.app`, cocokkan dengan yang ada di
   `public/.well-known/assetlinks.json`).
5. Download paket Android-nya (berisi `.apk`/`.aab` + `signing.keystore` +
   `assetlinks.json` yang sudah dibuatkan otomatis).
6. **Penting**: salin isi `assetlinks.json` hasil generate itu ke
   `public/.well-known/assetlinks.json` di proyek ini (menimpa placeholder
   yang ada), lalu commit & redeploy ke Vercel — assetlinks harus bisa
   diakses publik di `https://domainmu.vercel.app/.well-known/assetlinks.json`
   **sebelum** kamu install APK-nya.
7. Install `.apk` di HP → sekarang akan terbuka full-screen tanpa address
   bar, dengan splash & ikon dari logo kamu.

### Alternatif: Bubblewrap CLI (lebih manual, kontrol penuh)

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest="https://domainmu.vercel.app/manifest.json"
bubblewrap build
```

Setelah build, ambil SHA-256 fingerprint dari keystore yang dihasilkan:

```bash
keytool -list -v -keystore android.keystore -alias android -storepass android -keypass android
```

Tempel fingerprint itu ke `public/.well-known/assetlinks.json`
(`sha256_cert_fingerprints`), redeploy, baru install APK.

### Kenapa musik tetap jalan di background / layar mati?

- Playback pakai satu elemen `<audio>` asli yang hidup terus selama aplikasi
  terbuka (tidak pernah dibongkar-pasang antar halaman) — browser Chrome
  (termasuk mesin Chrome yang dipakai TWA/APK) sengaja tidak menghentikan
  audio yang sedang main walau tab/app di-minimize.
- `navigator.mediaSession` didaftarkan dengan metadata lagu + handler
  play/pause/next/prev/seek, yang memunculkan kartu "Now Playing" di layar
  kunci & notification shade Android, sekaligus jadi sinyal ke OS bahwa ini
  sesi media aktif yang tidak boleh disuspend saat layar mati.
- Saat pertama kali membuka APK, terima permintaan izin **notifikasi** kalau
  muncul — Android butuh ini untuk menampilkan kontrol media di layar kunci.

## Struktur proyek

```
app/
  page.tsx              Beranda
  search/page.tsx        Cari
  library/page.tsx       Pustaka
  api/
    home/                 Feed beranda (kompilasi pencarian mood)
    search/                Pencarian YT Music
    lyrics/[videoId]/      Lirik tersinkron (internal API YT Music)
    stream/[videoId]/      Proxy audio (mendukung Range utk seek)
    related/[videoId]/     Lagu terkait (auto-queue radio)
components/
  player/                AudioEngine, MiniPlayer, PlayerSheet, LyricsView, QueueSheet
  home/                  MoodChips, TrendingCard, TrackTile, HomeSectionBlock
  shared/                TopBar, BottomNav, ServiceWorkerRegister
store/
  player.ts              Zustand: antrean, status putar, shuffle/repeat
  library.ts              Zustand + persist: lagu disukai & riwayat
lib/
  ytmusic.ts              Wrapper ytmusic-api (search, home, related)
  lyrics.ts                Fetch lirik langsung ke endpoint internal YT Music
  stream.ts                Resolusi format audio via @distube/ytdl-core
public/
  manifest.json            PWA manifest (display: standalone)
  sw.js                     Service worker (cache shell, bukan API/audio)
  icons/                    Ikon dari logo kamu (192/512/maskable/apple)
  .well-known/assetlinks.json   Placeholder — ganti sesuai langkah APK di atas
```

## Batasan & catatan jujur

- `ytmusic-api` dan `@distube/ytdl-core` adalah **klien tidak resmi** yang
  meniru perilaku web client YouTube Music — bukan API resmi berbayar/
  berizin dari Google. Endpoint internal ini bisa berubah sewaktu-waktu
  sehingga pencarian/streaming/lirik bisa berhenti bekerja sampai
  dependensinya di-update; pantau repo GitHub masing-masing paket kalau
  itu terjadi.
- Bagian lirik memakai `timedLyricsRenderer` (lirik tersinkron per baris)
  kalau tersedia untuk lagu tsb; kalau tidak ada, otomatis fallback ke
  lirik polos tanpa sinkronisasi waktu.
- "Beranda" di sini disusun dari beberapa query pencarian bertema
  mood/genre (karena `ytmusic-api` tidak mengekspos feed personalisasi asli
  YouTube Music) — bukan feed personalisasi akun Google seseorang.
