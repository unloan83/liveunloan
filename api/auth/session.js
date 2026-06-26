import { allowMethods, getSessionUser, safeUser } from '../_auth.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return;
  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ user: null });
  return res.status(200).json({ user: safeUser(user) });
}
