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

  // Extract ID from the path - only relevant for GET/PUT/DELETE on a specific ID
  const path = req.url.split('/');
  const idFromPath = path[path.length - 1];
  const id = (idFromPath === 'qrcodes' || idFromPath === '') ? null : idFromPath; // Treat '/qrcodes' or '/' as no ID

  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Extracted ID (from path):', id);
  console.log('Supabase URL defined:', !!supabaseUrl);
  console.log('Supabase Key defined:', !!supabaseKey);

  switch (req.method) {
    case 'GET':
      if (id) {
        // Get specific redirect
        console.log('Looking for redirect with ID:', id);
        const { data, error } = await supabase
          .from('redirects')
          .select('*')
          .eq('id', id)
          .single();

        console.log('Supabase GET result - data:', data);
        console.log('Supabase GET result - error:', error);

        if (error || !data) {
          console.log('Redirect not found or error fetching');
          return res.status(404).json({ error: 'Redirect not found' });
        }
        return res.json(data);
      } else {
        // Get all redirects
        console.log('Fetching all redirects');
        const { data, error } = await supabase.from('redirects').select('*');

        console.log('Supabase GET all result - data:', data);
        console.log('Supabase GET all result - error:', error);

        if (error) {
          console.error('Failed to fetch redirects from Supabase:', error);
          return res.status(500).json({ error: 'Failed to fetch redirects' });
        }
        return res.json(data);
      }

    case 'POST':
      // POST request for creating a new redirect - ID comes from the request body
      try {
        const { id: newId, destinationUrl } = req.body;
        console.log('Attempting to create redirect with ID:', newId, 'and URL:', destinationUrl);

        if (!newId || !destinationUrl) {
           console.error('Missing ID or destinationUrl in request body');
           return res.status(400).json({ error: 'Missing ID or destination URL in request body' });
        }

        const { data: created, error: createError } = await supabase
          .from('redirects')
          .insert([{ id: newId, destination_url: destinationUrl }])
          .select()
          .single();

        console.log('Supabase POST result - created:', created);
        console.log('Supabase POST result - createError:', createError);

        if (createError) {
          console.error('Failed to create redirect in Supabase:', createError);
          // More specific error message might be in createError.details or createError.message
          return res.status(500).json({ error: createError.message || 'Failed to create redirect' });
        }
        return res.status(201).json(created);
      } catch (parseError) {
         console.error('Error parsing request body:', parseError);
         return res.status(400).json({ error: 'Invalid request body' });
      }

    case 'PUT':
      if (!id) {
        return res.status(400).json({ error: 'ID is required for PUT' });
      }
      const { destinationUrl: newDest } = req.body;
      console.log('Attempting to update redirect with ID:', id, 'to URL:', newDest);
      const { data: updated, error: updateError } = await supabase
        .from('redirects')
        .update({ destination_url: newDest, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      console.log('Supabase PUT result - updated:', updated);
      console.log('Supabase PUT result - updateError:', updateError);

      if (updateError || !updated) {
        console.error('Failed to update redirect in Supabase:', updateError);
         return res.status(404).json({ error: updateError.message || 'Failed to update redirect' });
      }
      return res.json(updated);

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'OPTIONS']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 