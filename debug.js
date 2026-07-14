import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  const hasUrl = !!process.env.KV_REST_API_URL;
  const hasToken = !!process.env.KV_REST_API_TOKEN;

  if (!hasUrl || !hasToken) {
    return res.status(500).json({
      ok: false,
      hasUrl,
      hasToken,
      message: 'Variabel lingkungan KV_REST_API_URL / KV_REST_API_TOKEN tidak ditemukan di deployment ini. Pastikan database sudah di-connect ke proyek ini di tab Storage, lalu redeploy.'
    });
  }

  try {
    const redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
    const testKey = '__debug_ping__';
    await redis.set(testKey, Date.now());
    const value = await redis.get(testKey);
    return res.status(200).json({ ok: true, hasUrl, hasToken, pingValue: value, message: 'Koneksi ke Upstash Redis berhasil.' });
  } catch (err) {
    return res.status(500).json({ ok: false, hasUrl, hasToken, error: String(err), message: 'Env var ada, tapi koneksi ke Redis gagal. Cek apakah URL/token masih valid.' });
  }
}
