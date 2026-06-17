import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { FiArrowLeft } from "react-icons/fi";
import metaApi from "../lcmMetaApi";

export default function WhatsAppCampaign() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    objective: "OUTCOME_ENGAGEMENT",
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

      const response = await metaApi.createWhatsAppCampaign(campaignPayload);

      navigate("/meta/create/whatsapp/adset", {
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
    <div className="space-y-6">
      <button
        onClick={() => navigate("/meta/create")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <FiArrowLeft /> Back
      </button>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <FaWhatsapp className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create WhatsApp Campaign</h1>
            <p className="text-gray-600 mt-1">Enable direct WhatsApp conversations from your ads</p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
          className="space-y-6"
        >
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter campaign name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objective <span className="text-red-500">*</span>
            </label>
            <div className="p-4 border-2 border-purple-500 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900">Engagement</span>
                  <span className="text-xs text-gray-500 ml-2">(OUTCOME_ENGAGEMENT)</span>
                </div>
                <span className="text-green-500">✓</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Next"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

