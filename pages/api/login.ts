import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method not allowed');
  }
  const { username, password } = req.body || {};
  const envUser = process.env.AUTH_USERNAME || 'admin';
  const envPass = process.env.AUTH_PASSWORD || 'password';
  if (username === envUser && password === envPass) {
    const cookie = serialize('auth', '1', {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7
    });
    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({ ok: true });
  }
  return res.status(401).json({ ok: false, error: 'Invalid credentials' });
}

