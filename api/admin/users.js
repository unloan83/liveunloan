import { allowMethods, getSessionUser, listManagedUsers, readJson, resetManagedUser, safeUser, saveManagedUser } from '../_auth.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'PATCH', 'POST'])) return;
  const user = await getSessionUser(req);
  if (user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'GET') return res.status(200).json({ users: await listManagedUsers() });

  const body = await readJson(req);
  try {
    if (req.method === 'PATCH') {
      const updated = await saveManagedUser(body);
      return res.status(200).json({ ok: true, user: safeUser(updated) });
    }
    if (req.method === 'POST' && body.action === 'reset') {
      await resetManagedUser(body.seedEmail);
      return res.status(200).json({ ok: true, users: await listManagedUsers() });
    }
    return res.status(400).json({ error: 'Unsupported action.' });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Unable to update user.' });
  }
}
