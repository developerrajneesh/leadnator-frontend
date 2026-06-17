import { getToken } from "../../api/client";

const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/$/, "");
const API_BASE_URL = `${API_ROOT}/meta-ads`;
const getAuthHeader = () => { const t = getToken(); return t ? `Bearer ${t}` : ""; };

class MetaApiService {
  /**
   * Ad account id from localStorage (set by the Create launchpad). The FB token
   * is injected server-side, so we only need the account id here.
   */
  getAuthData() {
    const actAdAccountId = localStorage.getItem("fb_ad_account_id") || localStorage.getItem("act_ad_account_id");
    if (!actAdAccountId) {
      throw new Error("No Meta ad account selected. Connect your Meta account first.");
    }
    return {
      act_ad_account_id: actAdAccountId,
      fb_token: "server-injected",
    };
  }

  /**
   * Create a campaign (Click to Call)
   */
  async createCallCampaign(campaignData) {
    const authData = this.getAuthData();
    const response = await fetch(`${API_BASE_URL}/click-to-call/campaigns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", Authorization: getAuthHeader(),
      },
      body: JSON.stringify({ ...authData, ...campaignData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || "Failed to create campaign");
    }

    return await response.json();
  }

  /**
   * Create an ad set (Click to Call)
   */
  async createCallAdSet(adsetData) {
    const authData = this.getAuthData();
    const response = await fetch(`${API_BASE_URL}/click-to-call/adsets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", Authorization: getAuthHeader(),
      },
      body: JSON.stringify({ ...authData, ...adsetData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || "Failed to create ad set");
    }

    return await response.json();
  }

  /**
   * Create an ad creative (Click to Call)
   */
  async createCallAdCreative(creativeData) {
    const authData = this.getAuthData();
    const response = await fetch(`${API_BASE_URL}/click-to-call/adcreatives`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", Authorization: getAuthHeader(),
      },
      body: JSON.stringify({ ...authData, ...creativeData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || "Failed to create ad creative");
    }

    return await response.json();
  }

  /**
   * Create an ad (Click to Call)
   */
  async createCallAd(adData) {
    const authData = this.getAuthData();
    const response = await fetch(`${API_BASE_URL}/click-to-call/ads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", Authorization: getAuthHeader(),
      },
      body: JSON.stringify({ ...authData, ...adData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || "Failed to create ad");
    }

    return await response.json();
  }

  /**
   * Create a campaign (Click to WhatsApp)
   */
  async createWhatsAppCampaign(campaignData) {
    const authData = this.getAuthData();
    const response = await fetch(`${API_BASE_URL}/click-to-whatsapp/campaigns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", Authorization: getAuthHeader(),
      },
      body: JSON.stringify({ ...authData, ...campaignData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || "Failed to create campaign");
    }

    return await response.json();
  }

  /**
   * Create an ad set (Click to WhatsApp)
   */
  async createWhatsAppAdSet(adsetData) {
    const authData = this.getAuthData();
    const response = await fetch(`${API_BASE_URL}/click-to-whatsapp/adsets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", Authorization: getAuthHeader(),
      },
      body: JSON.stringify({ ...authData, ...adsetData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || "Failed to create ad set");
    }

    return await response.json();
  }

  /**
   * Create an ad creative (Click to WhatsApp)
   */
  async createWhatsAppAdCreative(creativeData) {
    const authData = this.getAuthData();
    const response = await fetch(`${API_BASE_URL}/click-to-whatsapp/adcreatives`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", Authorization: getAuthHeader(),
      },
      body: JSON.stringify({ ...authData, ...creativeData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || "Failed to create ad creative");
    }

    return await response.json();
  }

  /**
   * Create an ad (Click to WhatsApp)
   */
  async createWhatsAppAd(adData) {
    const authData = this.getAuthData();
    const response = await fetch(`${API_BASE_URL}/click-to-whatsapp/ads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", Authorization: getAuthHeader(),
      },
      body: JSON.stringify({ ...authData, ...adData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || "Failed to create ad");
    }

    return await response.json();
  }

  /**
   * Create a campaign (Click to Link)
   */
  async createLinkCampaign(campaignData) {
    const authData = this.getAuthData();
    const response = await fetch(`${API_BASE_URL}/click-to-link/campaigns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", Authorization: getAuthHeader(),
      },
      body: JSON.stringify({ ...authData, ...campaignData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || "Failed to create campaign");
    }

    return await response.json();
  }

  /**
   * Create an ad set (Click to Link)
   */
  async createLinkAdSet(adsetData) {
    const authData = this.getAuthData();
    const response = await fetch(`${API_BASE_URL}/click-to-link/adsets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", Authorization: getAuthHeader(),
      },
      body: JSON.stringify({ ...authData, ...adsetData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || "Failed to create ad set");
    }

    return await response.json();
  }

  /**
   * Create an ad creative (Click to Link)
   */
  async createLinkAdCreative(creativeData) {
    const authData = this.getAuthData();
    const response = await fetch(`${API_BASE_URL}/click-to-link/adcreatives`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", Authorization: getAuthHeader(),
      },
      body: JSON.stringify({ ...authData, ...creativeData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || "Failed to create ad creative");
    }

    return await response.json();
  }

  /**
   * Create an ad (Click to Link)
   */
  async createLinkAd(adData) {
    const authData = this.getAuthData();
    const response = await fetch(`${API_BASE_URL}/click-to-link/ads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", Authorization: getAuthHeader(),
      },
      body: JSON.stringify({ ...authData, ...adData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || "Failed to create ad");
    }

    return await response.json();
  }

  // Click to Lead Form API Methods
  /**
   * Create a Lead Form campaign
   */
  async createLeadFormCampaign(campaignData) {
    const authData = this.getAuthData();
    const response = await fetch(`${API_BASE_URL}/click-to-lead-form/campaigns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", Authorization: getAuthHeader(),
      },
      body: JSON.stringify({ ...authData, ...campaignData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || "Failed to create Lead Form campaign");
    }

    return await response.json();
  }

  /**
   * Create a lead form
   * @param {string} pageId - Facebook Page ID
   * @param {Object} formData - Lead form data
   */
  async createLeadForm(pageId, formData) {
    const authData = this.getAuthData();
    const response = await fetch(`${API_BASE_URL}/click-to-lead-form/leadforms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", Authorization: getAuthHeader(),
      },
      body: JSON.stringify({ 
        page_id: pageId,
        fb_token: authData.fb_token,
        ...formData 
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || "Failed to create lead form");
    }

    return await response.json();
  }

  /**
   * Get pages for current user (for Lead Forms)
   */
  async getLeadFormPages() {
    const authData = this.getAuthData();
    const params = new URLSearchParams({
      fb_token: authData.fb_token,
    });

    const response = await fetch(
      `${API_BASE_URL}/click-to-lead-form/pages?${params.toString()}`
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.error || error.message || "Failed to fetch pages"
      );
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Get lead forms for a specific page
   */
  async getLeadForms(pageId) {
    const authData = this.getAuthData();
    if (!pageId) {
      throw new Error("Page ID is required");
    }

    const params = new URLSearchParams({
      fb_token: authData.fb_token,
      page_id: pageId,
    });

    const response = await fetch(
      `${API_BASE_URL}/click-to-lead-form/leadforms?${params.toString()}`
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.error || error.message || "Failed to fetch lead forms"
      );
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Create a Lead Form ad set
   */
  async createLeadFormAdSet(adsetData) {
    const authData = this.getAuthData();
    const response = await fetch(`${API_BASE_URL}/click-to-lead-form/adsets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", Authorization: getAuthHeader(),
      },
      body: JSON.stringify({ ...authData, ...adsetData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || "Failed to create Lead Form ad set");
    }

    return await response.json();
  }

  /**
   * Create a Lead Form ad creative
   */
  async createLeadFormAdCreative(creativeData) {
    const authData = this.getAuthData();
    const response = await fetch(`${API_BASE_URL}/click-to-lead-form/adcreatives`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", Authorization: getAuthHeader(),
      },
      body: JSON.stringify({ ...authData, ...creativeData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || "Failed to create Lead Form ad creative");
    }

    return await response.json();
  }

  /**
   * Create a Lead Form ad
   */
  async createLeadFormAd(adData) {
    const authData = this.getAuthData();
    const response = await fetch(`${API_BASE_URL}/click-to-lead-form/ads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", Authorization: getAuthHeader(),
      },
      body: JSON.stringify({ ...authData, ...adData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || "Failed to create Lead Form ad");
    }

    return await response.json();
  }

  /**
   * Retrieve leads for a specific lead form
   * @param {string} leadFormId - Lead Form ID
   * @param {string} pageId - Facebook Page ID
   */
  async getLeadFormLeads(leadFormId, pageId) {
    const authData = this.getAuthData();

    if (!leadFormId) {
      throw new Error("Lead Form ID is required");
    }

    if (!pageId) {
      throw new Error("Page ID is required");
    }

    const params = new URLSearchParams({
      fb_token: authData.fb_token,
      page_id: pageId,
    });

    const response = await fetch(
      `${API_BASE_URL}/click-to-lead-form/leads/${encodeURIComponent(
        leadFormId
      )}?${params.toString()}`
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.error || error.message || "Failed to fetch lead form leads"
      );
    }

    const data = await response.json();
    // Normalize to always return an array of leads
    return data.data || [];
  }

  /**
   * Subscribe a page to webhooks
   * @param {string} pageId - Facebook Page ID
   */
  async subscribePageToWebhooks(pageId) {
    const authData = this.getAuthData();
    const response = await fetch(`${API_BASE_URL}/click-to-lead-form/subscribe-page`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", Authorization: getAuthHeader(),
      },
      body: JSON.stringify({
        page_id: pageId,
        fb_token: authData.fb_token,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || "Failed to subscribe page to webhooks");
    }

    return await response.json();
  }

  /**
   * Verify WhatsApp number for a page
   * @param {string} pageId - Facebook Page ID
   * @param {string} whatsappNumber - WhatsApp number to verify
   * @param {string} verificationCode - Optional verification code for OTP verification
   * @returns {Promise<Object>} Verification response
   */
  async verifyWhatsAppNumber(pageId, whatsappNumber, verificationCode = null) {
    const authData = this.getAuthData();
    const payload = {
      page_id: pageId,
      fb_token: authData.fb_token,
      whatsapp_number: whatsappNumber,
    };
    
    if (verificationCode) {
      payload.verification_code = verificationCode;
    }

    const response = await fetch(`${API_BASE_URL}/click-to-whatsapp/verify-whatsapp-number`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", Authorization: getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || "Failed to verify WhatsApp number");
    }

    return await response.json();
  }

  /**
   * Search Meta Marketing API for detailed targeting
   * @param {string} accessToken - Facebook access token
   * @param {string} type - Search type: 'adworkposition', 'adinterest', or 'adworkemployer'
   * @param {string} query - Search query
   * @param {string} version - API version (default: v24.0)
   * @returns {Promise<Object>} Search results
   */
  async searchDetailedTargeting(accessToken, type, query, version = 'v24.0') {
    try {
      if (!accessToken) {
        throw new Error('Access token is required');
      }

      if (!type || !query) {
        throw new Error('Type and query are required');
      }

      const validTypes = ['adworkposition', 'adinterest', 'adworkemployer'];
      if (!validTypes.includes(type)) {
        throw new Error(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
      }

      const url = `https://graph.facebook.com/${version}/search`;
      const params = new URLSearchParams({
        type: type,
        q: query,
        access_token: accessToken
      });

      const response = await fetch(`${url}?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to search Meta Marketing API');
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data || [],
        paging: data.paging || null
      };
    } catch (error) {
      console.error('Meta Marketing API Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to search Meta Marketing API',
        data: []
      };
    }
  }

  /**
   * Search Work Positions
   * @param {string} accessToken - Facebook access token
   * @param {string} query - Search query
   * @param {string} version - API version (default: v24.0)
   */
  async searchWorkPosition(accessToken, query, version = 'v24.0') {
    return this.searchDetailedTargeting(accessToken, 'adworkposition', query, version);
  }

  /**
   * Search Interests
   * @param {string} accessToken - Facebook access token
   * @param {string} query - Search query
   * @param {string} version - API version (default: v24.0)
   */
  async searchInterest(accessToken, query, version = 'v24.0') {
    return this.searchDetailedTargeting(accessToken, 'adinterest', query, version);
  }

  /**
   * Search Employers/Companies
   * @param {string} accessToken - Facebook access token
   * @param {string} query - Search query
   * @param {string} version - API version (default: v24.0)
   */
  async searchEmployer(accessToken, query, version = 'v24.0') {
    return this.searchDetailedTargeting(accessToken, 'adworkemployer', query, version);
  }
}

export default new MetaApiService();

