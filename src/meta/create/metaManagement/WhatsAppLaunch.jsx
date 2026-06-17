import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { FiSend, FiCheckCircle, FiArrowLeft } from "react-icons/fi";
import metaApi from "../lcmMetaApi";

export default function WhatsAppLaunch() {
  const navigate = useNavigate();
  const location = useLocation();
  const previousData = location.state || {};
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [adId, setAdId] = useState(null);

  const handleLaunch = async () => {
    if (!previousData.adset_id || !previousData.creative_id) {
      alert("Ad Set ID or Creative ID is missing. Please complete previous steps.");
      return;
    }

    setLoading(true);
    try {
      const adPayload = {
        adset_id: previousData.adset_id,
        creative_id: previousData.creative_id,
        status: "ACTIVE",
      };

      const response = await metaApi.createWhatsAppAd(adPayload);

      setAdId(response.data.id);
      setSuccess(true);
    } catch (error) {
      alert(`Error launching ad: ${error.message}`);
      console.error("Ad creation error:", error);
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    navigate("/meta/create");
  };

  if (success) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <FiCheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ad Launched Successfully!</h1>
          <p className="text-gray-600 mb-6">Your WhatsApp ad has been created and is ready to go live.</p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
            <div className="space-y-2 text-sm">
              <div><strong>Campaign ID:</strong> {previousData.campaign_id || "N/A"}</div>
              <div><strong>Ad Set ID:</strong> {previousData.adset_id || "N/A"}</div>
              <div><strong>Creative ID:</strong> {previousData.creative_id || "N/A"}</div>
              <div className="text-purple-600 font-semibold"><strong>Ad ID:</strong> {adId || "N/A"}</div>
            </div>
          </div>

          <button
            onClick={handleGoHome}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
          >
            Go to Meta Management
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/meta/create/whatsapp/creative", { state: previousData })}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <FiArrowLeft /> Back
      </button>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <FiSend className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Launch Your WhatsApp Ad</h1>
            <p className="text-gray-600 mt-1">Ready to launch? Click the button below to create and activate your ad.</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">Campaign Summary</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div><strong>Campaign ID:</strong> {previousData.campaign_id || "N/A"}</div>
            <div><strong>Ad Set ID:</strong> {previousData.adset_id || "N/A"}</div>
            <div><strong>Creative ID:</strong> {previousData.creative_id || "N/A"}</div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Your ad is ready to be created. Once launched, it will be in <strong>ACTIVE</strong> status. 
            It will start running immediately.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleLaunch}
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Launching Ad...
              </>
            ) : (
              <>
                <FiSend /> Launch Ad
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

