import { allowMethods, readJson, safeUser, setSessionCookie, validateCredentials } from '../_auth.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  const body = await readJson(req);
  const user = await validateCredentials(body.email, body.password || '');
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
  setSessionCookie(res, user);
  return res.status(200).json({ ok: true, user: safeUser(user) });
}
