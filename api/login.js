import { Redis } from '@upstash/redis';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 hari

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};
  const uname = (username || '').trim().toLowerCase();

  if (!uname || !password) {
    return res.status(400).json({ error: 'Isi username dan password.' });
  }

  const userKey = `user:${uname}`;

  try {
    const raw = await redis.get(userKey);
    if (!raw) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }
    const user = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    const token = randomUUID();
    await redis.set(`session:${token}`, uname, { ex: SESSION_TTL_SECONDS });

    return res.status(200).json({ token, username: uname });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ error: 'Database belum terhubung dengan benar. Cek variabel lingkungan Upstash di Vercel.' });
  }
}
