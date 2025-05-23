import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
        const { data, error } = await supabase
          .from('redirects')
          .select('*')
          .eq('id', id)
          .single();
        if (error || !data) {
          return res.status(404).json({ error: 'Redirect not found' });
        }
        return res.json(data);
      } else {
        // Get all redirects
        const { data, error } = await supabase.from('redirects').select('*');
        if (error) {
          return res.status(500).json({ error: 'Failed to fetch redirects' });
        }
        return res.json(data);
      }

    case 'POST':
      const { id: newId, destinationUrl } = req.body;
      const { data: created, error: createError } = await supabase
        .from('redirects')
        .insert([{ id: newId, destination_url: destinationUrl }])
        .select()
        .single();
      if (createError) {
        return res.status(500).json({ error: 'Failed to create redirect' });
      }
      return res.status(201).json(created);

    case 'PUT':
      if (!id || id === 'qrcodes') {
        return res.status(400).json({ error: 'ID is required' });
      }
      const { destinationUrl: newDest } = req.body;
      const { data: updated, error: updateError } = await supabase
        .from('redirects')
        .update({ destination_url: newDest, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (updateError || !updated) {
        return res.status(404).json({ error: 'Failed to update redirect' });
      }
      return res.json(updated);

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'OPTIONS']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 