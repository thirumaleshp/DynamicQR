import { getRedirectById } from '../../../lib/db';

export default function handler(req, res) {
  const { id } = req.query;
  const redirect = getRedirectById(id);

  if (redirect) {
    res.writeHead(302, { Location: redirect.destinationUrl });
    res.end();
  } else {
    res.status(404).send('Redirect not found');
  }
} 