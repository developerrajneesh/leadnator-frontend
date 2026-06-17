import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLink, FiArrowLeft } from "react-icons/fi";
import metaApi from "../lcmMetaApi";

export default function LinkCampaign() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    objective: "OUTCOME_TRAFFIC",
  });
  const [loading, setLoading] = useState(false);

  const objectives = [
    { value: "OUTCOME_AWARENESS", label: "Awareness", color: "purple" },
    { value: "OUTCOME_ENGAGEMENT", label: "Engagement", color: "blue" },
    { value: "OUTCOME_LEADS", label: "Leads", color: "green" },
    { value: "OUTCOME_SALES", label: "Sales", color: "red" },
    { value: "OUTCOME_TRAFFIC", label: "Traffic", color: "orange" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleObjectiveSelect = (value) => {
    setFormData((prev) => ({
      ...prev,
      objective: value,
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

      const response = await metaApi.createLinkCampaign(campaignPayload);

      navigate("/meta/create/link/adset", {
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
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
            <FiLink className="w-8 h-8 text-pink-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Website Campaign</h1>
            <p className="text-gray-600 mt-1">Drive traffic to your website with website ads</p>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objective <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {objectives.map((obj) => (
                <div
                  key={obj.value}
                  onClick={() => handleObjectiveSelect(obj.value)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.objective === obj.value
                      ? `border-pink-500 bg-pink-50`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">{obj.label}</span>
                      <span className="text-xs text-gray-500 ml-2">({obj.value})</span>
                    </div>
                    {formData.objective === obj.value && (
                      <span className="text-green-500">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Next"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

