import { nanoid } from 'nanoid';

// In-memory storage (replace with a database in production)
const redirects = new Map();

export default function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    case 'PUT':
      return handlePut(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function handleGet(req, res) {
  const { id } = req.query;
  if (id) {
    const redirect = redirects.get(id);
    if (redirect) {
      res.json(redirect);
    } else {
      res.status(404).json({ error: 'Redirect not found' });
    }
  } else {
    res.json(Array.from(redirects.values()));
  }
}

function handlePost(req, res) {
  const { destinationUrl } = req.body;
  if (!destinationUrl) {
    return res.status(400).json({ error: 'Destination URL is required' });
  }

  const id = nanoid(6);
  const newRedirect = { id, destinationUrl };
  redirects.set(id, newRedirect);

  res.status(201).json(newRedirect);
}

function handlePut(req, res) {
  const { id } = req.query;
  const { destinationUrl } = req.body;

  if (!redirects.has(id)) {
    return res.status(404).json({ error: 'Redirect not found' });
  }

  if (!destinationUrl) {
    return res.status(400).json({ error: 'Destination URL is required' });
  }

  const updatedRedirect = { id, destinationUrl };
  redirects.set(id, updatedRedirect);

  res.json(updatedRedirect);
} 