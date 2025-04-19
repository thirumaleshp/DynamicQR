
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import QRCodeCard from "@/components/QRCodeCard";

function App() {
  const { toast } = useToast();
  const [qrCodes, setQrCodes] = useState([]);
  const [destinationUrl, setDestinationUrl] = useState("");
  const [selectedQr, setSelectedQr] = useState(null);

  useEffect(() => {
    try {
      const savedQrCodes = localStorage.getItem("qrCodes");
      if (savedQrCodes) {
        const parsed = JSON.parse(savedQrCodes);
        if (Array.isArray(parsed)) {
          setQrCodes(parsed);
        } else {
          setQrCodes([]);
          localStorage.setItem("qrCodes", JSON.stringify([]));
        }
      } else {
        localStorage.setItem("qrCodes", JSON.stringify([]));
      }
    } catch (error) {
      console.error("Error loading QR codes:", error);
      setQrCodes([]);
      localStorage.setItem("qrCodes", JSON.stringify([]));
    }
  }, []);

  const saveQrCodes = (newQrCodes) => {
    try {
      localStorage.setItem("qrCodes", JSON.stringify(newQrCodes));
      setQrCodes(newQrCodes);
    } catch (error) {
      console.error("Error saving QR codes:", error);
      toast({
        title: "Error",
        description: "Failed to save QR code. Please try again.",
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

  const generateQrCode = () => {
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
      const newQrCode = {
        id,
        destinationUrl: destinationUrl.trim(),
        createdAt: new Date().toISOString(),
      };

      const newQrCodes = [...qrCodes, newQrCode];
      saveQrCodes(newQrCodes);
      setDestinationUrl("");

      toast({
        title: "Success",
        description: "QR Code generated successfully!",
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateDestination = (qrCode) => {
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
      const updatedQrCodes = qrCodes.map((qr) =>
        qr.id === qrCode.id ? { ...qr, destinationUrl: destinationUrl.trim() } : qr
      );

      saveQrCodes(updatedQrCodes);
      setDestinationUrl("");
      setSelectedQr(null);

      toast({
        title: "Success",
        description: "Destination URL updated successfully!",
      });
    } catch (error) {
      console.error("Error updating destination:", error);
      toast({
        title: "Error",
        description: "Failed to update destination. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteQrCode = (id) => {
    try {
      const updatedQrCodes = qrCodes.filter(qr => qr.id !== id);
      saveQrCodes(updatedQrCodes);
      toast({
        title: "Success",
        description: "QR Code deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting QR code:", error);
      toast({
        title: "Error",
        description: "Failed to delete QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateQrId = (oldId, newId) => {
    if (qrCodes.some(qr => qr.id === newId)) {
      toast({
        title: "Error",
        description: "This ID already exists. Please choose a different one.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedQrCodes = qrCodes.map(qr =>
        qr.id === oldId ? { ...qr, id: newId } : qr
      );
      saveQrCodes(updatedQrCodes);
      toast({
        title: "Success",
        description: "QR Code ID updated successfully!",
      });
    } catch (error) {
      console.error("Error updating QR code ID:", error);
      toast({
        title: "Error",
        description: "Failed to update QR code ID. Please try again.",
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

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Success",
        description: "URL copied to clipboard!",
      });
    } catch (err) {
      console.error("Failed to copy:", err);
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      });
    }
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
            <QRCodeCard
              key={qrCode.id}
              qrCode={qrCode}
              onDelete={deleteQrCode}
              onUpdateDestination={(qr) => {
                setSelectedQr(qr);
                setDestinationUrl(qr.destinationUrl);
              }}
              onUpdateId={updateQrId}
              getRedirectUrl={getRedirectUrl}
              copyToClipboard={copyToClipboard}
            />
          ))}
        </motion.div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
