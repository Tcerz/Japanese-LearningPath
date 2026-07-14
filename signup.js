import { Redis } from '@upstash/redis';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const redis = Redis.fromEnv();
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 hari

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};
  const uname = (username || '').trim().toLowerCase();

  if (!uname || uname.length < 3) {
    return res.status(400).json({ error: 'Username minimal 3 karakter.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter.' });
  }
  if (!/^[a-z0-9_]+$/.test(uname)) {
    return res.status(400).json({ error: 'Username hanya boleh huruf kecil, angka, dan garis bawah.' });
  }

  const userKey = `user:${uname}`;

  try {
    const existing = await redis.get(userKey);
    if (existing) {
      return res.status(409).json({ error: 'Username sudah dipakai, coba yang lain.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await redis.set(userKey, JSON.stringify({ passwordHash, createdAt: Date.now() }));

    const token = randomUUID();
    await redis.set(`session:${token}`, uname, { ex: SESSION_TTL_SECONDS });

    return res.status(200).json({ token, username: uname });
  } catch (err) {
    console.error('signup error', err);
    return res.status(500).json({ error: 'Database belum terhubung dengan benar. Cek variabel lingkungan Upstash di Vercel.' });
  }
}
