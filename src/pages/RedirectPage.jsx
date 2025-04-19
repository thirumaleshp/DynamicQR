
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function RedirectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const redirectToDestination = async () => {
      try {
        const savedQrCodes = localStorage.getItem("qrCodes");
        if (!savedQrCodes) {
          console.error("No QR codes found in storage");
          setError(true);
          return;
        }

        const qrCodes = JSON.parse(savedQrCodes);
        if (!Array.isArray(qrCodes)) {
          console.error("Invalid QR codes data structure");
          setError(true);
          return;
        }

        const qrCode = qrCodes.find((qr) => qr.id === id);
        if (!qrCode || !qrCode.destinationUrl) {
          console.error("QR code not found or invalid destination");
          setError(true);
          return;
        }

        // Validate URL before redirecting
        try {
          new URL(qrCode.destinationUrl);
        } catch (urlError) {
          console.error("Invalid destination URL");
          setError(true);
          return;
        }

        // Use window.location.replace for a proper redirect
        window.location.replace(qrCode.destinationUrl);
      } catch (err) {
        console.error("Redirect error:", err);
        setError(true);
      }
    };

    // Add a small delay to ensure the animation shows
    const timeoutId = setTimeout(() => {
      redirectToDestination();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [id, navigate]);

  // Countdown effect for error state
  useEffect(() => {
    if (error && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (error && countdown === 0) {
      navigate("/");
    }
  }, [error, countdown, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-8 rounded-xl shadow-lg"
        >
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Invalid QR Code</h1>
          <p className="text-gray-600 mb-6">This QR code link appears to be invalid or expired.</p>
          <p className="text-sm text-gray-500 mb-4">
            Redirecting to home in {countdown} seconds...
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Go Home Now
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center bg-white p-8 rounded-xl shadow-lg"
      >
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h1 className="text-2xl font-semibold text-gray-900">Redirecting...</h1>
        <p className="text-gray-600 mt-2">Please wait while we redirect you to your destination.</p>
      </motion.div>
    </div>
  );
}

export default RedirectPage;
