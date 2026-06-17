import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiSend, FiCheckCircle, FiArrowLeft, FiFileText, FiHome } from "react-icons/fi";
import metaApi from "../lcmMetaApi";

export default function LeadFormLaunch() {
  const navigate = useNavigate();
  const location = useLocation();
  const previousData = location.state || {};
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [adId, setAdId] = useState(null);
  const [adName, setAdName] = useState("");

  const handleLaunch = async () => {
    if (!previousData.adset_id || !previousData.creative_id || !adName) {
      alert("Ad Name, Ad Set ID, or Creative ID is missing. Please complete all fields and previous steps.");
      return;
    }

    setLoading(true);
    try {
      const adPayload = {
        name: adName,
        adset_id: previousData.adset_id,
        creative_id: previousData.creative_id,
        leadgen_form_id: previousData.leadgen_form_id,
        status: "ACTIVE",
      };

      const response = await metaApi.createLeadFormAd(adPayload);

      setAdId(response.data.id);
      setSuccess(true);
      console.log("Ad created successfully:", response.data);
    } catch (error) {
      alert(`Error launching ad: ${error.message}`);
      console.error("Ad creation error:", error);
      setLoading(false);
    }
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Ad Launched Successfully!</h1>
            <p className="text-gray-600 mb-8">
              Your Lead Form ad has been created and is ready to go live.
            </p>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">Campaign Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Campaign ID:</span>
                  <span className="font-semibold text-gray-900">{previousData.campaign_id || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ad Set ID:</span>
                  <span className="font-semibold text-gray-900">{previousData.adset_id || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Creative ID:</span>
                  <span className="font-semibold text-gray-900">{previousData.creative_id || "N/A"}</span>
                </div>
                {previousData.leadgen_form_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lead Form ID:</span>
                    <span className="font-semibold text-gray-900">{previousData.leadgen_form_id}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-600 font-semibold">Ad ID:</span>
                  <span className="font-bold text-green-600 text-lg">{adId || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/meta/create/lead-form/subscribe-webhooks", {
                  state: {
                    ...previousData,
                    page_id: previousData.page_id,
                  }
                })}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                Subscribe to Webhooks
              </button>
              <button
                onClick={() => navigate("/meta/create")}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <FiHome className="w-5 h-5" />
                Back to Meta Management
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/meta/create/lead-form/creative", { state: previousData })}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <FiSend className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Launch Your Lead Form Ad</h1>
              <p className="text-gray-600 mt-1">Ready to launch? Complete the form below to create and activate your ad.</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Campaign Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-gray-500 text-xs mb-1">Campaign ID</div>
                <div className="text-gray-900 font-semibold">{previousData.campaign_id || "N/A"}</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-gray-500 text-xs mb-1">Ad Set ID</div>
                <div className="text-gray-900 font-semibold">{previousData.adset_id || "N/A"}</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-gray-500 text-xs mb-1">Creative ID</div>
                <div className="text-gray-900 font-semibold">{previousData.creative_id || "N/A"}</div>
              </div>
              {previousData.leadgen_form_id && (
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-500 text-xs mb-1">Lead Form ID</div>
                  <div className="text-gray-900 font-semibold">{previousData.leadgen_form_id}</div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="adName" className="block text-sm font-semibold text-gray-700">
                Ad Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="adName"
                value={adName}
                onChange={(e) => setAdName(e.target.value)}
                placeholder="Enter your ad name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Your ad will be created in <strong>ACTIVE</strong> status and will start running immediately.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLaunch}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Launching Ad...
                </>
              ) : (
                <>
                  <FiSend className="w-5 h-5" />
                  Launch Ad
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

