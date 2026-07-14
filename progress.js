import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

async function getUsernameFromRequest(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;
  const username = await redis.get(`session:${token}`);
  return username || null;
}

export default async function handler(req, res) {
  let username;
  try {
    username = await getUsernameFromRequest(req);
  } catch (err) {
    console.error('progress auth error', err);
    return res.status(500).json({ error: 'Database belum terhubung dengan benar.' });
  }

  if (!username) {
    return res.status(401).json({ error: 'Belum masuk, atau sesi sudah kedaluwarsa. Silakan masuk lagi.' });
  }

  const progressKey = `progress:${username}`;

  if (req.method === 'GET') {
    try {
      const raw = await redis.get(progressKey);
      const progress = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : {};
      return res.status(200).json({ progress });
    } catch (err) {
      console.error('progress get error', err);
      return res.status(500).json({ error: 'Gagal mengambil progres dari database.' });
    }
  }

  if (req.method === 'POST') {
    const { progress } = req.body || {};
    if (typeof progress !== 'object' || progress === null) {
      return res.status(400).json({ error: 'Data progres tidak valid.' });
    }
    try {
      await redis.set(progressKey, JSON.stringify(progress));
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('progress set error', err);
      return res.status(500).json({ error: 'Gagal menyimpan progres ke database.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
