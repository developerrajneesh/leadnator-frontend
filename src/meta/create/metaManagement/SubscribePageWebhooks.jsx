import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiBell, FiCheckCircle, FiAlertCircle, FiHome, FiArrowLeft } from "react-icons/fi";
import metaApi from "../lcmMetaApi";

export default function SubscribePageWebhooks() {
  const navigate = useNavigate();
  const location = useLocation();
  const previousData = location.state || {};
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubscribe = async () => {
    const pageId = previousData.page_id;

    if (!pageId) {
      setError("Page ID is missing. Please complete previous steps.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await metaApi.subscribePageToWebhooks(pageId);

      setSuccess(true);
      console.log("Page subscribed successfully:", response);
    } catch (error) {
      setError(error.message || "Failed to subscribe page to webhooks");
      console.error("Subscription error:", error);
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    navigate("/meta/create");
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg mb-4">
                <FiCheckCircle className="w-12 h-12 text-white" />
              </div>
              <div className="text-6xl mb-4">🎉</div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Subscribed Successfully!</h1>
            <p className="text-gray-600 mb-8">
              Your page has been subscribed to webhooks. You will now receive real-time notifications when leads are submitted.
            </p>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">Subscription Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Page ID:</span>
                  <span className="font-semibold text-gray-900">{previousData.page_id || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Webhook Endpoint:</span>
                  <span className="font-semibold text-gray-900 break-all">
                    {window.location.origin.replace(/:\d+$/, "")}:5000/api/v1/webhooks/lead-ads
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-6 text-left">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Next Steps:</strong> Configure this webhook URL in your Meta App settings to start receiving lead notifications in real-time.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleGoHome}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              <FiHome className="w-5 h-5" />
              Back to Meta Management
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/meta/create/lead-form/launch", { state: previousData })}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <FiBell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Subscribe Page to Webhooks</h1>
              <p className="text-gray-600 mt-1">Subscribe your Facebook Page to receive real-time lead notifications</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">What are Webhooks?</h3>
              <p className="text-sm text-gray-700 mb-4">
                Webhooks allow you to receive real-time notifications when users submit leads through your Lead Form ads.
                This enables instant processing, CRM integration, and automated follow-ups.
              </p>

              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Benefits:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Real-time lead notifications</li>
                  <li>Automatic lead data retrieval</li>
                  <li>CRM integration capabilities</li>
                  <li>Instant email/SMS notifications</li>
                </ul>
              </div>
            </div>

            {previousData.page_id && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Subscription Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-gray-500 text-xs mb-1">Page ID</div>
                    <div className="text-gray-900 font-semibold">{previousData.page_id}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-gray-500 text-xs mb-1">Webhook Endpoint</div>
                    <div className="text-gray-900 font-semibold break-all">
                      {window.location.origin.replace(/:\d+$/, "")}:5000/api/v1/webhooks/lead-ads
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <FiAlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700 font-medium">{error}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleSubscribe}
              disabled={loading || !previousData.page_id}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Subscribing...
                </>
              ) : (
                <>
                  <FiBell className="w-5 h-5" />
                  Subscribe Page to Webhooks
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

