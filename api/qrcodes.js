// In-memory storage (replace with a database in production)
let redirects = new Map();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Extract ID from the path
  const path = req.url.split('/');
  const id = path[path.length - 1];

  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Extracted ID:', id);

  switch (req.method) {
    case 'GET':
      if (id && id !== 'qrcodes') {
        // Get specific redirect
        console.log('Looking for redirect with ID:', id);
        const redirect = redirects.get(id);
        console.log('Found redirect:', redirect);
        
        if (!redirect) {
          console.log('Redirect not found');
          return res.status(404).json({ error: 'Redirect not found' });
        }
        return res.json(redirect);
      } else {
        // Get all redirects
        const allRedirects = Array.from(redirects.entries()).map(([id, data]) => ({
          id,
          ...data
        }));
        console.log('Returning all redirects:', allRedirects);
        return res.json(allRedirects);
      }

    case 'POST':
      const { destinationUrl } = req.body;
      const newRedirect = {
        id: req.body.id,
        destinationUrl,
        createdAt: new Date().toISOString(),
      };
      console.log('Creating new redirect:', newRedirect);
      redirects.set(newRedirect.id, newRedirect);
      return res.status(201).json(newRedirect);

    case 'PUT':
      if (!id || id === 'qrcodes') {
        return res.status(400).json({ error: 'ID is required' });
      }
      const existingRedirect = redirects.get(id);
      if (!existingRedirect) {
        return res.status(404).json({ error: 'Redirect not found' });
      }
      const updatedRedirect = {
        ...existingRedirect,
        destinationUrl: req.body.destinationUrl,
        updatedAt: new Date().toISOString(),
      };
      redirects.set(id, updatedRedirect);
      return res.json(updatedRedirect);

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'OPTIONS']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 