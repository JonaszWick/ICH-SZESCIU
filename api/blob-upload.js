import { handleUpload } from '@vercel/blob/client';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,

      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (clientPayload !== process.env.ADMIN_TOKEN) {
          throw new Error('Brak autoryzacji');
        }

        return {
          allowedContentTypes: [
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/ogg',
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
          ],
          maximumSizeInBytes: 500 * 1024 * 1024,
          addRandomSuffix: false,
        };
      },

      onUploadCompleted: async ({ blob }) => {
        console.log('Upload zakończony:', blob.url);
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
