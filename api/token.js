const crypto = require('crypto');

module.exports = (req, res) => {
  // Allow CORS from localhost and our Vercel domains
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const username = req.query.username || req.body?.username || 'user';
  const secret = process.env.SHARED_SESSION_SECRET || 'fallback_secret_for_local_dev';
  
  const timestamp = Date.now().toString();
  const payload = `${username}:${timestamp}`;
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  const token = `${username}:${timestamp}:${signature}`;
  
  res.status(200).json({ token });
};
