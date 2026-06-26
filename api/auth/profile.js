import { allowMethods, getSessionUser, readJson, safeUser, saveManagedUser, setSessionCookie } from '../_auth.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['PATCH'])) return;
  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const body = await readJson(req);
  try {
    const updated = await saveManagedUser({
      seedEmail: user.seedEmail || user.email,
      displayName: body.displayName ?? user.displayName,
      email: body.email ?? user.email,
      password: body.password || undefined,
      portfolioName: user.portfolioName,
    });
    setSessionCookie(res, updated);
    return res.status(200).json({ ok: true, user: safeUser(updated) });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Unable to update profile.' });
  }
}
