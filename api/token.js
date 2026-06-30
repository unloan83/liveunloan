import { allowMethods, createHandoffToken, getSessionUser } from './_auth.js';

const appUrls = {
  'money-planner': process.env.MONEY_PLANNER_URL || 'https://unloanmoneyview.vercel.app',
  'stock-planner': process.env.STOCK_PLANNER_URL || 'https://unloanstockview.vercel.app',
};

const adminPaths = {
  'stock-planner': '/admin',
};

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;
  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const appId = req.body?.appId || req.query?.appId;
  const baseUrl = appUrls[appId];
  if (!baseUrl) return res.status(400).json({ error: 'Unknown app.' });
  const adminView = req.body?.adminView === true || req.query?.adminView === 'true';
  if (adminView && user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access is required.' });
  }
  if (adminView && !adminPaths[appId]) {
    return res.status(409).json({ error: 'This planner does not expose a separate admin view.' });
  }
  if (appId === 'stock-planner' && user.role !== 'admin' && !user.portfolioName) {
    return res.status(409).json({ error: 'No portfolio is mapped to this profile. Please contact admin.' });
  }
  const token = createHandoffToken(user, appId);
  const path = adminView ? adminPaths[appId] : '/';
  return res.status(200).json({
    token,
    redirectTo: `${baseUrl.replace(/\/$/, '')}${path}?token=${encodeURIComponent(token)}`,
  });
}
