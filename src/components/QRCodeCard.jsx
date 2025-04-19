
import React, { useState } from "react";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Trash2, Edit2, ExternalLink } from "lucide-react";

function QRCodeCard({ 
  qrCode, 
  onDelete, 
  onUpdateDestination, 
  onUpdateId, 
  getRedirectUrl, 
  copyToClipboard 
}) {
  const [isEditingId, setIsEditingId] = useState(false);
  const [newId, setNewId] = useState(qrCode.id);

  const handleIdUpdate = () => {
    if (newId && newId !== qrCode.id) {
      onUpdateId(qrCode.id, newId);
    }
    setIsEditingId(false);
  };

  return (
    <motion.div
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
        <div className="mb-2 font-medium text-gray-900 flex items-center justify-center gap-2">
          {isEditingId ? (
            <div className="flex items-center gap-2">
              <Input
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                className="w-24 h-8 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleIdUpdate()}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleIdUpdate}
                className="h-8"
              >
                Save
              </Button>
            </div>
          ) : (
            <>
              <span>ID: {qrCode.id}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingId(true)}
                className="h-6 w-6 p-0"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        <div className="mb-2 text-sm text-gray-500 break-all flex items-center justify-center gap-2">
          <span>QR URL: {getRedirectUrl(qrCode.id)}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(getRedirectUrl(qrCode.id))}
            className="h-6 w-6 p-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="mb-4 text-sm text-gray-500 break-all">
          Redirects to: {qrCode.destinationUrl}
        </p>
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            onClick={() => onUpdateDestination(qrCode)}
          >
            Change Destination
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(qrCode.destinationUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Test URL
          </Button>
          <Button
            variant="destructive"
            onClick={() => onDelete(qrCode.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default QRCodeCard;
