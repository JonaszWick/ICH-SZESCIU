export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user, pass } = req.body || {};

  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASS = process.env.ADMIN_PASS;
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

  if (!ADMIN_USER || !ADMIN_PASS || !ADMIN_TOKEN) {
    return res.status(500).json({ error: 'Brak zmiennych środowiskowych w Vercel' });
  }

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    return res.status(200).json({ token: ADMIN_TOKEN });
  }

  return res.status(401).json({ error: 'Błędny login lub hasło' });
}
