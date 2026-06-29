import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiFileText } from "react-icons/fi";
import metaApi from "../lcmMetaApi";
import CampaignLayout from "./campaignUi";

export default function LeadFormCampaign() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    objective: "OUTCOME_LEADS", // Fixed to Leads for Lead Form campaigns
  });
  const [loading, setLoading] = useState(false);

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
    <CampaignLayout
      accent="blue"
      HeaderIcon={FiFileText}
      title="Create Lead Form Campaign"
      subtitle="Collect leads directly within the ad experience"
      name={formData.name}
      setName={(v) => setFormData((prev) => ({ ...prev, name: v }))}
      objectiveValues={["OUTCOME_LEADS"]}
      selected={formData.objective}
      fixed
      loading={loading}
      onBack={() => navigate("/meta/create")}
      onSubmit={handleNext}
      nextLabel="Next: Create Lead Form"
    />
  );
}

