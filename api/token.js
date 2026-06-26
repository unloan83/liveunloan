import { allowMethods, createHandoffToken, getSessionUser } from './_auth.js';

const appUrls = {
  'money-planner': process.env.MONEY_PLANNER_URL || 'https://unloanmoneyview.vercel.app',
  'stock-planner': process.env.STOCK_PLANNER_URL || 'https://unloanstockview.vercel.app',
};

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['POST'])) return;
  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  const appId = req.body?.appId || req.query?.appId;
  const baseUrl = appUrls[appId];
  if (!baseUrl) return res.status(400).json({ error: 'Unknown app.' });
  if (appId === 'stock-planner' && !user.portfolioName) {
    return res.status(409).json({ error: 'No portfolio is mapped to this profile. Please contact admin.' });
  }
  const token = createHandoffToken(user, appId);
  return res.status(200).json({ token, redirectTo: `${baseUrl}/?token=${encodeURIComponent(token)}` });
}
