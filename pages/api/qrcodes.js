import { nanoid } from 'nanoid';
import { getAllRedirects, getRedirectById, createRedirect, updateRedirect } from '../../lib/db';

export default function handler(req, res) {
  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      if (id) {
        const redirect = getRedirectById(id);
        if (redirect) return res.json(redirect);
        return res.status(404).json({ error: 'Not found' });
      }
      return res.json(getAllRedirects());
    case 'POST':
      const { destinationUrl } = req.body;
      if (!destinationUrl) return res.status(400).json({ error: 'Destination URL is required' });
      const newRedirect = { id: nanoid(6), destinationUrl };
      createRedirect(newRedirect);
      return res.status(201).json(newRedirect);
    case 'PUT':
      if (!id) return res.status(400).json({ error: 'ID is required' });
      const { destinationUrl: newUrl } = req.body;
      if (!newUrl) return res.status(400).json({ error: 'Destination URL is required' });
      const updated = updateRedirect(id, { destinationUrl: newUrl });
      if (!updated) return res.status(404).json({ error: 'Not found' });
      return res.json(updated);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 