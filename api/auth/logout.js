import { allowMethods, clearSessionCookie } from '../_auth.js';

export default function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;
  clearSessionCookie(res);
  return res.status(200).json({ ok: true });
}
