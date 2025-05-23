import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const API_URL = '/api';

function App() {
  const { toast } = useToast();
  const [qrCodes, setQrCodes] = useState([]);
  const [destinationUrl, setDestinationUrl] = useState("");
  const [selectedQr, setSelectedQr] = useState(null);

  useEffect(() => {
    fetchQrCodes();
  }, []);

  const fetchQrCodes = async () => {
    try {
      const response = await fetch(`${API_URL}/qrcodes`);
      const data = await response.json();
      setQrCodes(data);
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch QR codes",
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

  const generateQrCode = async () => {
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
      const response = await fetch(`${API_URL}/qrcodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          destinationUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create QR code');
      }

      const newQrCode = await response.json();
      setQrCodes([...qrCodes, newQrCode]);
      setDestinationUrl("");

      toast({
        title: "Success",
        description: "QR Code generated successfully!",
      });
    } catch (error) {
      console.error('Error creating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const updateDestination = async (qrCode) => {
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
      const response = await fetch(`${API_URL}/qrcodes/${qrCode.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destinationUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update QR code');
      }

      const updatedQrCode = await response.json();
      setQrCodes(qrCodes.map((qr) =>
        qr.id === qrCode.id ? updatedQrCode : qr
      ));
      setDestinationUrl("");
      setSelectedQr(null);

      toast({
        title: "Success",
        description: "Destination URL updated successfully!",
      });
    } catch (error) {
      console.error('Error updating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to update destination URL",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (selectedQr) {
        updateDestination(selectedQr);
      } else {
        generateQrCode();
      }
    }
  };

  const getRedirectUrl = (id) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/r/${id}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Dynamic QR Code System</h1>
          <p className="text-lg text-gray-600">
            Generate QR codes with updatable destinations
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
              {selectedQr ? (
                <Button onClick={() => updateDestination(selectedQr)}>
                  Update Destination
                </Button>
              ) : (
                <Button onClick={generateQrCode}>Generate QR</Button>
              )}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {qrCodes.map((qrCode) => (
            <motion.div
              key={qrCode.id}
              layout
              className="rounded-xl bg-white p-6 shadow-lg"
            >
              <div className="mb-4 flex justify-center">
                <QRCode
                  value={getRedirectUrl(qrCode.id)}
                  size={160}
                  className="h-40 w-40"
                  level="H"
                />
              </div>
              <div className="text-center">
                <p className="mb-2 font-medium text-gray-900">ID: {qrCode.id}</p>
                <p className="mb-2 text-sm text-gray-500 break-all">
                  QR URL: {getRedirectUrl(qrCode.id)}
                </p>
                <p className="mb-4 text-sm text-gray-500 break-all">
                  Redirects to: {qrCode.destinationUrl}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedQr(qrCode);
                      setDestinationUrl(qrCode.destinationUrl);
                    }}
                  >
                    Change Destination
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.open(qrCode.destinationUrl, '_blank');
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
