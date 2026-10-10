export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb', // Zwiększa limit rozmiaru dla plików MP3
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = 'JonasZwick'; // Twój login na GitHubie
  const REPO_NAME = 'ICH-SZESCIU';  // Nazwa repozytorium

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'Brak tokena GITHUB_TOKEN w zmiennych środowiskowych Vercela.' });
  }

  try {
    const { filename, content, message } = req.body;

    if (!filename || !content) {
      return res.status(400).json({ error: 'Brak nazwy pliku lub zawartości.' });
    }

    // Wysyłanie pliku przez GitHub REST API
    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filename}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Uploader'
      },
      body: JSON.stringify({
        message: message || `Dodano plik ${filename} przez panel admina`,
        content: content // Zawartość w formacie base64
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Błąd zapisu na GitHubie' });
    }

    return.status(200).json({ success: true, data });
  } catch (error) {
    return.status(500).json({ error: error.message });
  }
}
