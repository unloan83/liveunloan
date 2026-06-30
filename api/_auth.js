import crypto from 'crypto';

const sessionCookieName = 'unloan_portal_session';
const oneWeekSeconds = 60 * 60 * 24 * 7;
const authUsersSheet = 'Auth Users';
const sheetsScope = 'https://www.googleapis.com/auth/spreadsheets';

const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');
const adminLoginAlias = 'admin';
const configuredAdminUsername = process.env.DASHBOARD_USERNAME?.trim();
const configuredAdminPassword = process.env.DASHBOARD_PASSWORD;

const seedAccounts = [
  { email: 'live.unloan@gmail.com', displayName: 'Admin', role: 'admin', salt: '8c39534f9012a9cc324980ee76347bcc', passwordHash: 'f2304cf6a142c8cecf66c0702a2289dc4ddf60400e9d0cdff0c3bcf6161e8de3' },
  { email: 'ragz_25hv@yahoo.co.in', displayName: 'Raghu', role: 'user', portfolioName: 'Raghu', salt: 'a37f91b45b77ac4e30dd140f9b81d81e', passwordHash: '6ea592709104d656119b9fc1e98d3556efca33da3c3157be4f28f59e1c0b62f6' },
  { email: 'igsudhakar@gmail.com', displayName: 'Sudhakar', role: 'user', portfolioName: 'Sudhakar', salt: '360ec5fee6101092e346470347075039', passwordHash: '7aa5afc054ddc1b12f2e6cf9584f0502f36eff06a786afbf0d29e537542d7fa7' },
  { email: 'indra_siddhi@yahoo.co.in', displayName: 'Suchi_icici', role: 'user', portfolioName: 'Suchi_icici', salt: '01186483c17daacdd7067dc62d15428d', passwordHash: '89f32511181424b40de823a87a0d777f1c98d2586873749b09d3b79085da0d33' },
  { email: 'ravi.king3@gmail.com', displayName: 'RS', role: 'user', portfolioName: 'RS', salt: '4612ddba47c968e02bb5c8ecdc88fb0f', passwordHash: '60eb17c3130200eeef283c6bd7567ec1f4216924e15b6e4a131ca969709c04b4' },
  { email: 'visuras123@gmail.com', displayName: 'Surendra', role: 'user', portfolioName: 'Surendra', salt: 'cfe65dd244370846ddbda213504c5f0d', passwordHash: '41b1b6ca861210cf836b4f22f600bc84631fba7bb4951affdabcaeb7123a736a' },
  { email: 'rohini2810@gmail.com', displayName: 'RJ', role: 'user', portfolioName: 'RJ', salt: '99a569db57018e2b9c411fdd7ddda229', passwordHash: 'acc8a2734702f5322cdfb7a96e172853dcc5c5f4b33cbc0e02fee94a23d7dde7' },
];

export function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

export function safeUser(profile) {
  if (!profile) return null;
  return {
    displayName: profile.displayName,
    email: profile.email,
    portfolioName: profile.portfolioName,
    role: profile.role,
    seedEmail: profile.seedEmail,
  };
}

export async function getSessionUser(req) {
  return verifySessionValue(getCookie(req, sessionCookieName));
}

export function setSessionCookie(res, profile) {
  setCookie(res, sessionCookieName, createSessionValue(profile), oneWeekSeconds);
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
}

export async function validateCredentials(email, password) {
  const normalizedEmail = normalizeEmail(email);
  if (verifyConfiguredAdminCredentials(normalizedEmail, password)) {
    return toPublicProfile(seedAccounts.find((account) => account.role === 'admin'));
  }

  const overrides = await readAuthOverridesSafely();
  const adminSeed = seedAccounts.find((account) => account.role === 'admin');
  const isAdminAlias = normalizedEmail === adminLoginAlias;
  const override = isAdminAlias
    ? overrides.find((item) => item.seedEmail === adminSeed?.email)
    : overrides.find((item) => normalizeEmail(item.email) === normalizedEmail);

  if (override) return verifyOverrideCredentials(override, password);

  const seed = isAdminAlias
    ? adminSeed
    : seedAccounts.find((account) => account.email === normalizedEmail);
  if (!seed) return null;
  if (overrides.some((item) => item.seedEmail === seed.email)) return null;
  if (!verifyPassword(password, seed.salt, seed.passwordHash)) return null;

  return toPublicProfile(seed);
}

function verifyConfiguredAdminCredentials(identifier, password) {
  if (!configuredAdminUsername || !configuredAdminPassword) return false;
  if (identifier !== normalizeEmail(configuredAdminUsername)) return false;

  const supplied = Buffer.from(String(password), 'utf8');
  const expected = Buffer.from(configuredAdminPassword, 'utf8');
  return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
}

export async function listManagedUsers() {
  const overrides = await readAuthOverridesSafely();
  return seedAccounts.map((seed) => {
    const override = overrides.find((item) => item.seedEmail === seed.email);
    return safeUser({
      displayName: override?.displayName ?? seed.displayName,
      email: override?.email ?? seed.email,
      portfolioName: override?.portfolioName ?? seed.portfolioName,
      role: seed.role,
      seedEmail: seed.email,
    });
  });
}

export async function saveManagedUser({ seedEmail, displayName, email, password, portfolioName }) {
  const seed = seedAccounts.find((account) => account.email === normalizeEmail(seedEmail));
  if (!seed) throw new Error('Account profile was not found.');

  const cleanName = String(displayName ?? '').trim();
  const cleanEmail = normalizeEmail(email);
  if (!cleanName) throw new Error('Display name is required.');
  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) throw new Error('Enter a valid email address.');
  if (password && password.length < 8) throw new Error('Password must be at least 8 characters.');

  const existing = (await readAuthOverridesSafely()).find((item) => item.seedEmail === seed.email);
  const passwordRecord = password
    ? createPasswordRecord(password)
    : existing
      ? { passwordHash: existing.passwordHash, salt: existing.salt }
      : { passwordHash: seed.passwordHash, salt: seed.salt };

  const updated = {
    displayName: cleanName,
    email: cleanEmail,
    passwordHash: passwordRecord.passwordHash,
    portfolioName: String(portfolioName ?? '').trim() || undefined,
    salt: passwordRecord.salt,
    seedEmail: seed.email,
    updatedAt: new Date().toISOString(),
  };

  await saveAuthUserOverride(updated);
  return { displayName: cleanName, email: cleanEmail, portfolioName: updated.portfolioName, role: seed.role, seedEmail: seed.email };
}

export async function resetManagedUser(seedEmail) {
  await deleteAuthUserOverride(seedEmail);
}

export function createHandoffToken(profile, appId) {
  const payload = encodePayload({ ...profile, appId, issuedAt: Date.now() });
  return `v1.${payload}.${sign(payload, getTransitionSecret())}`;
}

export function allowMethods(req, res, methods = ['GET', 'POST', 'PATCH']) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', [...methods, 'OPTIONS'].join(','));
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return false;
  }
  return true;
}

export async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function verifyOverrideCredentials(override, password) {
  if (!verifyPassword(password, override.salt, override.passwordHash)) return null;
  const seed = seedAccounts.find((account) => account.email === override.seedEmail);
  if (!seed) return null;
  return { displayName: override.displayName, email: override.email, portfolioName: override.portfolioName ?? seed.portfolioName, role: seed.role, seedEmail: seed.email };
}

function toPublicProfile(seed) {
  return { displayName: seed.displayName, email: seed.email, portfolioName: seed.portfolioName, role: seed.role, seedEmail: seed.email };
}

function createSessionValue(profile) {
  const payload = encodePayload({ ...profile, issuedAt: Date.now() });
  return `${payload}.${sign(payload, getSessionSecret())}`;
}

function verifySessionValue(value) {
  if (!value) return null;
  const [payload, signature] = value.split('.');
  if (!payload || !signature || signature !== sign(payload, getSessionSecret())) return null;
  const decoded = decodePayload(payload);
  const age = Date.now() - Number(decoded?.issuedAt);
  if (!decoded || !Number.isFinite(age) || age < 0 || age > oneWeekSeconds * 1000) return null;
  return { displayName: decoded.displayName, email: normalizeEmail(decoded.email), portfolioName: decoded.portfolioName, role: decoded.role, seedEmail: normalizeEmail(decoded.seedEmail ?? decoded.email) };
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex');
}

function createPasswordRecord(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return { passwordHash: hashPassword(password, salt), salt };
}

function verifyPassword(password, salt, passwordHash) {
  const value = Buffer.from(hashPassword(password, salt), 'hex');
  const expected = Buffer.from(passwordHash, 'hex');
  return value.length === expected.length && crypto.timingSafeEqual(value, expected);
}

async function readAuthOverridesSafely() {
  try {
    return await readAuthUserOverrides();
  } catch (error) {
    if (isGoogleSheetsConfigured()) console.error('Auth Users sheet read failed:', error);
    return [];
  }
}

function isGoogleSheetsConfigured() {
  return Boolean(spreadsheetId && clientEmail && privateKey);
}

async function readAuthUserOverrides() {
  if (!isGoogleSheetsConfigured()) return [];
  await ensureAuthUsersSheet();
  const response = await sheetsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(rangeFor(authUsersSheet, 'A2:G'))}`);
  const payload = await response.json();
  return (payload.values ?? [])
    .map((row) => ({
      seedEmail: String(row[0] ?? '').trim().toLowerCase(),
      email: String(row[1] ?? '').trim().toLowerCase(),
      displayName: String(row[2] ?? '').trim(),
      passwordHash: String(row[3] ?? '').trim(),
      salt: String(row[4] ?? '').trim(),
      portfolioName: String(row[5] ?? '').trim() || undefined,
      updatedAt: String(row[6] ?? '').trim(),
    }))
    .filter((row) => row.seedEmail && row.email && row.displayName && row.passwordHash && row.salt);
}

async function saveAuthUserOverride(row) {
  if (!isGoogleSheetsConfigured()) throw new Error('Google Sheets is not configured.');
  const existing = await readAuthUserOverrides();
  await writeAuthUserOverrides([...existing.filter((item) => item.seedEmail !== row.seedEmail), row]);
}

async function deleteAuthUserOverride(seedEmail) {
  if (!isGoogleSheetsConfigured()) throw new Error('Google Sheets is not configured.');
  const existing = await readAuthUserOverrides();
  await writeAuthUserOverrides(existing.filter((item) => item.seedEmail !== normalizeEmail(seedEmail)));
}

async function writeAuthUserOverrides(rows) {
  await ensureAuthUsersSheet();
  await sheetsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`, {
    method: 'POST',
    body: JSON.stringify({ ranges: [rangeFor(authUsersSheet, 'A2:G')] }),
  });
  if (rows.length === 0) return;
  await sheetsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(rangeFor(authUsersSheet, 'A2:G'))}?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({ values: rows.map((row) => [row.seedEmail, row.email, row.displayName, row.passwordHash, row.salt, row.portfolioName ?? '', row.updatedAt]) }),
  });
}

async function ensureAuthUsersSheet() {
  const metadata = await (await sheetsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`)).json();
  const hasSheet = metadata.sheets?.some((sheet) => sheet.properties?.title === authUsersSheet);
  if (!hasSheet) {
    await sheetsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({ requests: [{ addSheet: { properties: { title: authUsersSheet } } }] }),
    });
  }
  await sheetsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(rangeFor(authUsersSheet, 'A1:G1'))}?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({ values: [['seed_email', 'email', 'display_name', 'password_hash', 'salt', 'portfolio_name', 'updated_at']] }),
  });
}

async function sheetsFetch(url, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${await getAccessToken()}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  if (!response.ok) throw new Error(`Google Sheets request failed: ${response.status} ${await response.text()}`);
  return response;
}

let cachedToken = null;

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) return cachedToken.token;
  if (!clientEmail || !privateKey) throw new Error('Google Sheets credentials are incomplete.');
  const now = Math.floor(Date.now() / 1000);
  const assertion = signJwt({ alg: 'RS256', typ: 'JWT' }, { aud: 'https://oauth2.googleapis.com/token', exp: now + 3600, iat: now, iss: clientEmail, scope: sheetsScope });
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ assertion, grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer' }),
  });
  if (!response.ok) throw new Error(`Google auth failed: ${response.status} ${await response.text()}`);
  const payload = await response.json();
  cachedToken = { token: payload.access_token, expiresAt: Date.now() + payload.expires_in * 1000 };
  return cachedToken.token;
}

function signJwt(header, claim) {
  const payload = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claim))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(payload);
  signer.end();
  return `${payload}.${signer.sign(privateKey, 'base64url')}`;
}

function encodePayload(payload) {
  return base64Url(JSON.stringify(payload));
}

function decodePayload(value) {
  try {
    return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function base64Url(value) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function sign(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function getSessionSecret() {
  const secret = process.env.LIVEUNLOAN_SESSION_SECRET || process.env.SHARED_SESSION_SECRET;
  if (!secret) throw new Error('LIVEUNLOAN_SESSION_SECRET or SHARED_SESSION_SECRET must be configured.');
  return secret;
}

function getTransitionSecret() {
  const secret = process.env.SHARED_SESSION_SECRET;
  if (!secret) throw new Error('SHARED_SESSION_SECRET must be configured.');
  return secret;
}

function getCookie(req, name) {
  const cookieHeader = req.headers.cookie || '';
  return cookieHeader.split(';').map((item) => item.trim()).find((item) => item.startsWith(`${name}=`))?.slice(name.length + 1);
}

function setCookie(res, name, value, maxAge) {
  res.setHeader('Set-Cookie', `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
}

function rangeFor(sheet, range) {
  return `'${sheet.replace(/'/g, "''")}'!${range}`;
}
