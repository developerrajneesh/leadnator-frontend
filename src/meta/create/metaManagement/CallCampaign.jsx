import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPhone } from "react-icons/fi";
import metaApi from "../lcmMetaApi";
import CampaignLayout, { OBJECTIVE_META } from "./campaignUi";

const CALL_OBJECTIVES = Object.keys(OBJECTIVE_META); // all 5 outcomes

export default function CallCampaign() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    objective: "OUTCOME_TRAFFIC",
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

      const response = await metaApi.createCallCampaign(campaignPayload);

      // Navigate to create adset page with campaign data
      navigate("/meta/create/call/adset", {
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
      accent="orange"
      HeaderIcon={FiPhone}
      title="Create Call Campaign"
      subtitle="Enable direct phone calls from your ads to connect with customers"
      name={formData.name}
      setName={(v) => setFormData((prev) => ({ ...prev, name: v }))}
      objectiveValues={CALL_OBJECTIVES}
      selected={formData.objective}
      onSelect={(v) => setFormData((prev) => ({ ...prev, objective: v }))}
      loading={loading}
      onBack={() => navigate("/meta/create")}
      onSubmit={handleNext}
    />
  );
}

