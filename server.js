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

// GET all redirects
app.get('/api/qrcodes', (req, res) => {
  console.log('Fetching all redirects...');
  const data = Array.from(redirects.values());
  console.log(`Found ${data.length} redirects`);
  res.json(data);
});

// GET a single redirect by ID
app.get('/api/qrcodes/:id', (req, res) => {
  const id = req.params.id;
  console.log(`Fetching redirect for ID: ${id}`);
  const redirect = redirects.get(id);

  if (redirect) {
    res.json(redirect);
  } else {
    res.status(404).json({ error: 'Redirect not found' });
  }
});

// POST a new redirect
app.post('/api/qrcodes/:id', (req, res) => {
  const id = req.params.id;
  const { destinationUrl } = req.body;
  console.log(`Creating new redirect - ID: ${id}, URL: ${destinationUrl}`);
  
  if (!destinationUrl) {
    return res.status(400).json({ error: 'Destination URL is required' });
  }

  const newRedirect = { id, destinationUrl };
  redirects.set(id, newRedirect);
  console.log('Redirect created successfully');
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