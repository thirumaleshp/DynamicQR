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

// Add timing middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });
  next();
});

// Redirect endpoint
app.get('/r/:id', (req, res) => {
  const id = req.params.id;
  const redirect = redirects.get(id);

  if (redirect) {
    res.redirect(redirect.destinationUrl);
  } else {
    res.status(404).send('Redirect not found');
  }
});

// GET all redirects
app.get('/api/qrcodes', (req, res) => {
  res.json(Array.from(redirects.values()));
});

// GET a single redirect by ID
app.get('/api/qrcodes/:id', (req, res) => {
  const id = req.params.id;
  const redirect = redirects.get(id);

  if (redirect) {
    res.json(redirect);
  } else {
    res.status(404).json({ error: 'Redirect not found' });
  }
});

// POST a new redirect
app.post('/api/qrcodes', (req, res) => {
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
app.put('/api/qrcodes/:id', (req, res) => {
  const id = req.params.id;
  const { destinationUrl } = req.body;
  console.log(`Updating redirect - ID: ${id}, New URL: ${destinationUrl}`);

  if (!redirects.has(id)) {
    return res.status(404).json({ error: 'Redirect not found' });
  }

  if (!destinationUrl) {
    return res.status(400).json({ error: 'Destination URL is required' });
  }

  const updatedRedirect = { id, destinationUrl };
  redirects.set(id, updatedRedirect);
  console.log('Redirect updated successfully');
  res.json(updatedRedirect);
});

// DELETE a redirect by ID
app.delete('/api/qrcodes/:id', (req, res) => {
  const id = req.params.id;
  console.log(`Deleting redirect - ID: ${id}`);

  if (!redirects.has(id)) {
    return res.status(404).json({ error: 'Redirect not found' });
  }

  redirects.delete(id);
  console.log('Redirect deleted successfully');
  res.status(204).end();
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 