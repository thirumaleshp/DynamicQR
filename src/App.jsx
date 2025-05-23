import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const API_URL = 'https://dynamicscan.vercel.app/api/qrcodes';

function App() {
  const { toast } = useToast();
  const [redirects, setRedirects] = useState([]);
  const [destinationUrl, setDestinationUrl] = useState("");
  const [selectedRedirect, setSelectedRedirect] = useState(null);

  useEffect(() => {
    fetchRedirects();
  }, []);

  const fetchRedirects = async () => {
    try {
      const response = await fetch(`${API_URL}`);
      const data = await response.json();
      setRedirects(data);
    } catch (error) {
      console.error('Error fetching redirects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch redirects",
        variant: "destructive",
      });
    }
  };

  const isValidUrl = (urlString) => {
    try {
      const url = new URL(urlString);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const generateRedirect = async () => {
    console.log('Attempting to generate redirect (Client-Side)');
    if (!destinationUrl) {
      toast({
        title: "Error",
        description: "Please enter a destination URL",
        variant: "destructive",
      });
      return;
    }

    if (!isValidUrl(destinationUrl)) {
      toast({
        title: "Error",
        description: "Please enter a valid URL (starting with http:// or https://)",
        variant: "destructive",
      });
      return;
    }

    try {
      const id = nanoid(6);
      console.log('Generated ID:', id);

      const { data: created, error: createError } = await supabase
        .from('redirects')
        .insert([{ id: id, destination_url: destinationUrl }])
        .select()
        .single();

      console.log('Supabase Client POST result - created:', created);
      console.log('Supabase Client POST result - createError:', createError);

      if (createError) {
        console.error('Failed to create redirect in Supabase (Client-Side):', createError);
        toast({
          title: "Error",
          description: createError.message || "Failed to generate QR code (DB error)",
          variant: "destructive",
        });
        return;
      }

      setRedirects([...redirects, created]);
      setDestinationUrl("");

      toast({
        title: "Success",
        description: "Redirect created successfully!",
      });
    } catch (error) {
      console.error('Error creating redirect (Client-Side Catch):', error);
      toast({
        title: "Error",
        description: "Failed to create redirect",
        variant: "destructive",
      });
    }
  };

  const updateDestination = async (redirect) => {
    if (!destinationUrl) {
      toast({
        title: "Error",
        description: "Please enter a new destination URL",
        variant: "destructive",
      });
      return;
    }

    if (!isValidUrl(destinationUrl)) {
      toast({
        title: "Error",
        description: "Please enter a valid URL (starting with http:// or https://)",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${redirect.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destinationUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update redirect');
      }

      const updatedRedirect = await response.json();
      setRedirects(redirects.map((r) =>
        r.id === redirect.id ? updatedRedirect : r
      ));
      setDestinationUrl("");
      setSelectedRedirect(null);

      toast({
        title: "Success",
        description: "Destination URL updated successfully!",
      });
    } catch (error) {
      console.error('Error updating redirect:', error);
      toast({
        title: "Error",
        description: "Failed to update destination URL",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (selectedRedirect) {
        updateDestination(selectedRedirect);
      } else {
        generateRedirect();
      }
    }
  };

  const getRedirectUrl = (id) => {
    return `https://dynamicscan.vercel.app/r/${id}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Dynamic Redirect System</h1>
          <p className="text-lg text-gray-600">
            Create QR codes with updatable destinations
          </p>
        </motion.div>

        <div className="mb-8 rounded-xl bg-white p-6 shadow-lg">
          <div className="mb-4">
            <Label htmlFor="destinationUrl">Destination URL</Label>
            <div className="mt-1.5 flex gap-2">
              <Input
                id="destinationUrl"
                type="url"
                placeholder="Enter destination URL (e.g., https://example.com)"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              {selectedRedirect ? (
                <Button onClick={() => updateDestination(selectedRedirect)}>
                  Update Destination
                </Button>
              ) : (
                <Button onClick={generateRedirect}>Create Redirect</Button>
              )}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {redirects.map((redirect) => (
            <motion.div
              key={redirect.id}
              layout
              className="rounded-xl bg-white p-6 shadow-lg"
            >
              <div className="mb-4 flex justify-center">
                <QRCode
                  value={getRedirectUrl(redirect.id)}
                  size={160}
                  className="h-40 w-40"
                  level="H"
                />
              </div>
              <div className="text-center">
                <p className="mb-2 font-medium text-gray-900">ID: {redirect.id}</p>
                <p className="mb-2 text-sm text-gray-500 break-all">
                  Redirect URL: {getRedirectUrl(redirect.id)}
                </p>
                <p className="mb-4 text-sm text-gray-500 break-all">
                  Points to: {redirect.destinationUrl}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedRedirect(redirect);
                      setDestinationUrl(redirect.destinationUrl);
                    }}
                  >
                    Change Destination
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.open(redirect.destinationUrl, '_blank');
                    }}
                  >
                    Test URL
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      <footer className="mt-20 text-center text-sm text-gray-900">
        Profile{" "}
        <a
          href="https://thirumalesh.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-indigo-600 hover:underline"
        >
          @thirumalesh
        </a>
      </footer>
      <Toaster />
    </div>
  );
}

export default App;
