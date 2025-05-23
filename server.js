import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { nanoid } from 'nanoid';

const app = express();
const port = 3001;

// In-memory storage (replace with a database in production)
let redirects = new Map();

app.use(cors());
app.use(bodyParser.json());

// GET all redirects
app.get('/api/redirects', (req, res) => {
  res.json(Array.from(redirects.values()));
});

// GET a single redirect by ID
app.get('/api/redirects/:id', (req, res) => {
  const id = req.params.id;
  const redirect = redirects.get(id);

  if (redirect) {
    res.json(redirect);
  } else {
    res.status(404).json({ error: 'Redirect not found' });
  }
});

// POST a new redirect
app.post('/api/redirects', (req, res) => {
  const { destinationUrl } = req.body;
  if (!destinationUrl) {
    return res.status(400).json({ error: 'Destination URL is required' });
  }

  const id = nanoid(6);
  const newRedirect = { id, destinationUrl };
  redirects.set(id, newRedirect);

  res.status(201).json(newRedirect);
});

// PUT update a redirect by ID
app.put('/api/redirects/:id', (req, res) => {
  const id = req.params.id;
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
});

// DELETE a redirect by ID
app.delete('/api/redirects/:id', (req, res) => {
  const id = req.params.id;

  if (!redirects.has(id)) {
    return res.status(404).json({ error: 'Redirect not found' });
  }

  redirects.delete(id);
  res.status(204).end();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 