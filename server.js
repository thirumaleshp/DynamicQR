import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage (replace with a database in production)
let qrCodes = [];

// Get all QR codes
app.get('/api/qrcodes', (req, res) => {
  res.json(qrCodes);
});

// Create a new QR code
app.post('/api/qrcodes', (req, res) => {
  const { id, destinationUrl } = req.body;
  const newQrCode = {
    id,
    destinationUrl,
    createdAt: new Date().toISOString(),
  };
  qrCodes.push(newQrCode);
  res.status(201).json(newQrCode);
});

// Update a QR code
app.put('/api/qrcodes/:id', (req, res) => {
  const { id } = req.params;
  const { destinationUrl } = req.body;
  const qrCodeIndex = qrCodes.findIndex(qr => qr.id === id);
  
  if (qrCodeIndex === -1) {
    return res.status(404).json({ error: 'QR code not found' });
  }

  qrCodes[qrCodeIndex] = {
    ...qrCodes[qrCodeIndex],
    destinationUrl,
  };

  res.json(qrCodes[qrCodeIndex]);
});

// Get a specific QR code
app.get('/api/qrcodes/:id', (req, res) => {
  const { id } = req.params;
  const qrCode = qrCodes.find(qr => qr.id === id);
  
  if (!qrCode) {
    return res.status(404).json({ error: 'QR code not found' });
  }

  res.json(qrCode);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 