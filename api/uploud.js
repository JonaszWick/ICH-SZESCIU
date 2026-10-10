export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = 'JonaszWick'; 
  const REPO_NAME = 'ICH-SZESCIU';  

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'Brak tokena GITHUB_TOKEN w zmiennych środowiskowych Vercela.' });
  }

  try {
    const { filename, content, message } = req.body;

    if (!filename || !content) {
      return res.status(400).json({ error: 'Brak nazwy pliku lub zawartości.' });
    }

    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filename}`;

    // Sprawdź czy plik już istnieje (potrzebne do 'sha' przy aktualizacji np. albums.json)
    let sha = undefined;
    const getResponse = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'Vercel-Uploader'
      }
    });

    if (getResponse.ok) {
      const fileData = await getResponse.json();
      sha = fileData.sha;
    }

    // Wyślij lub zaktualizuj plik przez GitHub REST API
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Uploader'
      },
      body: JSON.stringify({
        message: message || `Aktualizacja pliku ${filename} przez panel admina`,
        content: content,
        sha: sha
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Błąd zapisu na GitHubie' });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
