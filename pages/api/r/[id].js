import { redirects } from '../qrcodes';

export default function handler(req, res) {
  const { id } = req.query;
  const redirect = redirects.get(id);

  if (redirect) {
    res.redirect(redirect.destinationUrl);
  } else {
    res.status(404).send('Redirect not found');
  }
} 