// In-memory storage (replace with a database in production)
let qrCodes = [];

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
        // Get specific QR code
        console.log('Looking for QR code with ID:', id);
        const qrCode = qrCodes.find(qr => qr.id === id);
        console.log('Found QR code:', qrCode);
        
        if (!qrCode) {
          console.log('QR code not found');
          return res.status(404).json({ error: 'QR code not found' });
        }
        return res.json(qrCode);
      } else {
        // Get all QR codes
        console.log('Returning all QR codes:', qrCodes);
        return res.json(qrCodes);
      }

    case 'POST':
      const { destinationUrl } = req.body;
      const newQrCode = {
        id: req.body.id,
        destinationUrl,
        createdAt: new Date().toISOString(),
      };
      console.log('Creating new QR code:', newQrCode);
      qrCodes.push(newQrCode);
      return res.status(201).json(newQrCode);

    case 'PUT':
      if (!id || id === 'qrcodes') {
        return res.status(400).json({ error: 'ID is required' });
      }
      const qrCodeIndex = qrCodes.findIndex(qr => qr.id === id);
      if (qrCodeIndex === -1) {
        return res.status(404).json({ error: 'QR code not found' });
      }
      qrCodes[qrCodeIndex] = {
        ...qrCodes[qrCodeIndex],
        destinationUrl: req.body.destinationUrl,
      };
      return res.json(qrCodes[qrCodeIndex]);

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'OPTIONS']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 