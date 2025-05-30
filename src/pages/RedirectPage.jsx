import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const API_URL = 'https://dynamicscan.vercel.app/api/qrcodes';

function RedirectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirectToDestination = async () => {
      try {
        console.log('Fetching redirect for ID:', id);
        const response = await fetch(`${API_URL}/${id}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          console.error('Response not OK:', response.status);
          setError(true);
          setLoading(false);
          return;
        }

        const redirect = await response.json();
        console.log('Redirect data:', redirect);

        if (!redirect || !redirect.destinationUrl) {
          console.error('Invalid redirect data:', redirect);
          setError(true);
          setLoading(false);
          return;
        }

        // Optional: Check if URL is valid
        const isValidUrl = /^https?:\/\//i.test(redirect.destinationUrl);
        if (!isValidUrl) {
          console.error('Invalid destination URL:', redirect.destinationUrl);
          setError(true);
          setLoading(false);
          return;
        }

        console.log('Redirecting to:', redirect.destinationUrl);
        // Redirect to the destination URL
        window.location.replace(redirect.destinationUrl);
      } catch (err) {
        console.error("Redirect error:", err);
        setError(true);
        setLoading(false);
      }
    };

      redirectToDestination();
  }, [id]);

  // If there's an error, show error screen
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
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Invalid Redirect
          </h1>
          <p className="text-gray-600 mb-6">
            This redirect link appears to be invalid or expired.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Go Home
          </button>
        </motion.div>
      </div>
    );
  }

  // While redirecting, show spinner
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center bg-white p-8 rounded-xl shadow-lg"
      >
        <div
          className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          role="status"
          aria-label="Loading"
        ></div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Redirecting...
        </h1>
        <p className="text-gray-600 mt-2">
          Please wait while we redirect you to your destination.
        </p>
      </motion.div>
    </div>
  );
}

export default RedirectPage;
