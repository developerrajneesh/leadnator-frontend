import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiFileText, FiArrowLeft } from "react-icons/fi";
import metaApi from "../lcmMetaApi";

export default function LeadFormCampaign() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    objective: "OUTCOME_LEADS", // Fixed to Leads for Lead Form campaigns
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = async () => {
    if (formData.name.trim() === "") {
      alert("Please enter campaign name");
      return;
    }

    // Get credentials from localStorage - prioritize fb_access_token and fb_ad_account_id
    const fbToken = localStorage.getItem("fb_access_token") || localStorage.getItem("fb_token");
    const actAdAccountId = localStorage.getItem("fb_ad_account_id") || localStorage.getItem("act_ad_account_id");

    if (!actAdAccountId || !fbToken) {
      alert("Please connect your Facebook account first. Redirecting to Meta Management...");
      navigate("/meta/create");
      return;
    }

    setLoading(true);
    try {
      const campaignPayload = {
        name: formData.name,
        objective: formData.objective,
        special_ad_categories: ["NONE"],
        status: "ACTIVE",
      };

      const response = await metaApi.createLeadFormCampaign(campaignPayload);

      // Navigate to create lead form page with campaign data
      navigate("/meta/create/lead-form/form", {
        state: {
          ...formData,
          campaign_id: response.data.id,
        },
      });
    } catch (error) {
      alert(`Error creating campaign: ${error.message}`);
      console.error("Campaign creation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/meta/create")}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <FiFileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Lead Form Campaign</h1>
              <p className="text-gray-600 mt-1">Collect leads directly within the ad experience</p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                Campaign Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Enter campaign name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Campaign Objective
              </label>
              <div className="px-4 py-3 bg-green-50 border-2 border-green-500 rounded-lg">
                <span className="text-green-700 font-medium">Leads</span>
                <p className="text-sm text-green-600 mt-1">Lead Form campaigns collect leads directly within the ad experience</p>
              </div>
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
                    Lead Form campaigns collect leads directly within the ad experience. Users can submit their information without leaving Facebook or Instagram.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Creating...
                  </>
                ) : (
                  <>
                    Next: Create Lead Form
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

