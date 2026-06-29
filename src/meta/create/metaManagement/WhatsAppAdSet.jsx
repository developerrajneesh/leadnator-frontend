import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaWhatsapp, FaBriefcase, FaHeart, FaBuilding, FaSearch } from "react-icons/fa";
import { FiArrowLeft, FiArrowRight, FiGlobe, FiSmartphone, FiMonitor, FiFacebook, FiFileText, FiX, FiCheck, FiChevronDown, FiChevronUp, FiInfo, FiUsers, FiTarget, FiMapPin, FiCalendar, FiLayout, FiGrid, FiVideo, FiCircle, FiCompass, FiFlag, FiShield } from "react-icons/fi";
import { FaInstagram, FaFacebookMessenger, FaFacebookF, FaBullhorn } from "react-icons/fa";
import metaApi from "../lcmMetaApi";
import { adAPI } from "../lcmApi";
import PlacesAutocomplete from "../PlacesAutocomplete";
import CountryCodeSelect from "./CountryCodeSelect";
import { findCountry } from "./countryCodes";
import "./adset.css";

export default function WhatsAppAdSet() {
  const navigate = useNavigate();
  const location = useLocation();
  const campaignData = location.state || {};
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 Details · 2 Targeting · 3 Platforms · 4 Detailed

  const STEPS = [
    { n: 1, label: "Ad Set Details", desc: "Provide the basic information for your ad set" },
    { n: 2, label: "Targeting", desc: "Define who should see your ad" },
    { n: 3, label: "Publisher Platforms", desc: "Choose where your ads appear" },
    { n: 4, label: "Detailed Targeting", desc: "Refine your audience (optional)" },
  ];

  const [formData, setFormData] = useState({
    name: "",
    daily_budget: "",
    page_id: "",
    min_age: "18",
    max_age: "45",
    genders: [],
    targeting: {
      geo_locations: { countries: [] },
      device_platforms: [],
      publisher_platforms: [],
      facebook_positions: [],
      instagram_positions: [],
    },
  });
  const [pages, setPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [customLocations, setCustomLocations] = useState([]); // Array of { latitude, longitude, radius, distance_unit, name, address }
  const [selectedPlace, setSelectedPlace] = useState(null); // Store selected place from Google Places
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [waCountry, setWaCountry] = useState("in"); // ISO-2 of chosen dial code
  // Full E.164-ish number = dial code + local part (avoid double-prefixing).
  const fullWhatsapp = () => {
    const dial = findCountry(waCountry).code;
    const local = whatsappNumber.replace(/\D/g, "").replace(/^0+/, "");
    return local.startsWith(dial) ? local : `${dial}${local}`;
  };
  const [verificationStatus, setVerificationStatus] = useState(null); // null, "VERIFIED", "VERIFICATION_CODE_SEND_SUCCESS"
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [expandedLocations, setExpandedLocations] = useState(new Set()); // Track which location cards are expanded

  // Detailed Targeting States
  const [workPositionQuery, setWorkPositionQuery] = useState("");
  const [interestQuery, setInterestQuery] = useState("");
  const [employerQuery, setEmployerQuery] = useState("");
  const [workPositionResults, setWorkPositionResults] = useState([]);
  const [interestResults, setInterestResults] = useState([]);
  const [employerResults, setEmployerResults] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedWorkPositions, setSelectedWorkPositions] = useState([]);
  const [selectedEmployers, setSelectedEmployers] = useState([]);
  const [loadingWorkPosition, setLoadingWorkPosition] = useState(false);
  const [loadingInterest, setLoadingInterest] = useState(false);
  const [loadingEmployer, setLoadingEmployer] = useState(false);
  
  // Refs for dropdowns
  const workPositionRef = useRef(null);
  const interestRef = useRef(null);
  const employerRef = useRef(null);

  useEffect(() => {
    fetchPages();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (workPositionRef.current && !workPositionRef.current.contains(event.target)) {
        setWorkPositionResults([]);
      }
      if (interestRef.current && !interestRef.current.contains(event.target)) {
        setInterestResults([]);
      }
      if (employerRef.current && !employerRef.current.contains(event.target)) {
        setEmployerResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchPages = async () => {
    try {
      setLoadingPages(true);
      const response = await adAPI.getPages();
      if (response.data.success && response.data.pages?.data) {
        const pagesData = response.data.pages.data;
        setPages(pagesData);
        // Auto-select the first page
        if (pagesData.length > 0 && !formData.page_id) {
          setFormData((prev) => ({
            ...prev,
            page_id: pagesData[0].id,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
      alert("Failed to fetch Facebook pages. Please try again.");
    } finally {
      setLoadingPages(false);
    }
  };

  const countries = [
    { code: "US", name: "United States", flag: "🇺🇸" },
    { code: "CA", name: "Canada", flag: "🇨🇦" },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
    { code: "AU", name: "Australia", flag: "🇦🇺" },
    { code: "IN", name: "India", flag: "🇮🇳" },
    { code: "DE", name: "Germany", flag: "🇩🇪" },
  ];

  const devicePlatforms = [
    { value: "mobile", label: "Mobile", icon: FiSmartphone, color: "#3b82f6" },
    { value: "desktop", label: "Desktop", icon: FiMonitor, color: "#8b5cf6" },
  ];

  const publisherPlatforms = [
    { value: "facebook", label: "Facebook", icon: FaFacebookF, color: "#1877f2" },
    { value: "instagram", label: "Instagram", icon: FaInstagram, color: "#e1306c" },
    { value: "messenger", label: "Messenger", icon: FaFacebookMessenger, color: "#a334fa" },
    { value: "audience_network", label: "Audience Network", icon: FiGlobe, color: "#22c55e" },
  ];

  const genders = [
    { value: 1, label: "Male" },
    { value: 2, label: "Female" },
  ];

  const facebookPositions = [
    { value: "feed", label: "Feed", icon: FiLayout, color: "#1877f2" },
    { value: "instant_article", label: "Instant Article", icon: FiFileText, color: "#0ea5e9" },
  ];

  const instagramPositions = [
    { value: "stream", label: "Feed", icon: FiGrid, color: "#e1306c" },
    { value: "reels", label: "Reels", icon: FiVideo, color: "#c026d3" },
    { value: "story", label: "Story", icon: FiCircle, color: "#f59e0b" },
    { value: "explore", label: "Explore", icon: FiCompass, color: "#8b5cf6" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCountryToggle = (countryCode) => {
    setFormData((prev) => {
      const countries = [...prev.targeting.geo_locations.countries];
      const index = countries.indexOf(countryCode);
      if (index > -1) {
        countries.splice(index, 1);
      } else {
        countries.push(countryCode);
      }
      return {
        ...prev,
        targeting: {
          ...prev.targeting,
          geo_locations: { countries },
        },
      };
    });
  };

  const handleDeviceToggle = (device) => {
    setFormData((prev) => {
      const devices = [...prev.targeting.device_platforms];
      const index = devices.indexOf(device);
      if (index > -1) {
        devices.splice(index, 1);
      } else {
        devices.push(device);
      }
      return {
        ...prev,
        targeting: {
          ...prev.targeting,
          device_platforms: devices,
        },
      };
    });
  };

  const handlePublisherToggle = (publisher) => {
    setFormData((prev) => {
      const publishers = [...prev.targeting.publisher_platforms];
      const index = publishers.indexOf(publisher);
      if (index > -1) {
        publishers.splice(index, 1);
      } else {
        publishers.push(publisher);
      }
      return {
        ...prev,
        targeting: {
          ...prev.targeting,
          publisher_platforms: publishers,
        },
      };
    });
  };

  const handleGenderToggle = (genderValue) => {
    setFormData((prev) => {
      const genders = [...prev.genders];
      const index = genders.indexOf(genderValue);
      if (index > -1) {
        genders.splice(index, 1);
      } else {
        genders.push(genderValue);
      }
      return {
        ...prev,
        genders,
      };
    });
  };

  const handleFacebookPositionToggle = (position) => {
    setFormData((prev) => {
      const positions = [...prev.targeting.facebook_positions];
      const index = positions.indexOf(position);
      if (index > -1) {
        positions.splice(index, 1);
      } else {
        positions.push(position);
      }
      return {
        ...prev,
        targeting: {
          ...prev.targeting,
          facebook_positions: positions,
        },
      };
    });
  };

  const handleInstagramPositionToggle = (position) => {
    setFormData((prev) => {
      const positions = [...prev.targeting.instagram_positions];
      const index = positions.indexOf(position);
      if (index > -1) {
        positions.splice(index, 1);
        // If removing explore, we can optionally remove stream too (but not required)
        // If removing stream and explore is still selected, keep explore but warn
        if (position === 'stream' && positions.includes('explore')) {
          // If stream is removed but explore is still there, remove explore too
          // because explore requires stream
          const exploreIndex = positions.indexOf('explore');
          if (exploreIndex > -1) {
            positions.splice(exploreIndex, 1);
          }
        }
      } else {
        positions.push(position);
        // If selecting explore, automatically add stream (feed) as it's required
        if (position === 'explore' && !positions.includes('stream')) {
          positions.push('stream');
        }
      }
      return {
        ...prev,
        targeting: {
          ...prev.targeting,
          instagram_positions: positions,
        },
      };
    });
  };

  // Detailed Targeting Functions
  const searchWorkPosition = async (query) => {
    if (!query || query.trim().length < 2) {
      setWorkPositionResults([]);
      return;
    }

    try {
      setLoadingWorkPosition(true);
      const fbToken = localStorage.getItem("fb_access_token") || localStorage.getItem("fb_token");
      if (!fbToken) {
        alert("Please connect your Meta account first");
        return;
      }

      const response = await metaApi.searchWorkPosition(fbToken, query.trim());
      if (response.success) {
        setWorkPositionResults(response.data || []);
      } else {
        setWorkPositionResults([]);
        if (response.error) {
          console.error("Work position search error:", response.error);
        }
      }
    } catch (error) {
      console.error("Error searching work positions:", error);
      setWorkPositionResults([]);
    } finally {
      setLoadingWorkPosition(false);
    }
  };

  const searchInterest = async (query) => {
    if (!query || query.trim().length < 2) {
      setInterestResults([]);
      return;
    }

    try {
      setLoadingInterest(true);
      const fbToken = localStorage.getItem("fb_access_token") || localStorage.getItem("fb_token");
      if (!fbToken) {
        alert("Please connect your Meta account first");
        return;
      }

      const response = await metaApi.searchInterest(fbToken, query.trim());
      if (response.success) {
        setInterestResults(response.data || []);
      } else {
        setInterestResults([]);
        if (response.error) {
          console.error("Interest search error:", response.error);
        }
      }
    } catch (error) {
      console.error("Error searching interests:", error);
      setInterestResults([]);
    } finally {
      setLoadingInterest(false);
    }
  };

  const searchEmployer = async (query) => {
    if (!query || query.trim().length < 2) {
      setEmployerResults([]);
      return;
    }

    try {
      setLoadingEmployer(true);
      const fbToken = localStorage.getItem("fb_access_token") || localStorage.getItem("fb_token");
      if (!fbToken) {
        alert("Please connect your Meta account first");
        return;
      }

      const response = await metaApi.searchEmployer(fbToken, query.trim());
      if (response.success) {
        setEmployerResults(response.data || []);
      } else {
        setEmployerResults([]);
        if (response.error) {
          console.error("Employer search error:", response.error);
        }
      }
    } catch (error) {
      console.error("Error searching employers:", error);
      setEmployerResults([]);
    } finally {
      setLoadingEmployer(false);
    }
  };

  // Debounced search effects
  useEffect(() => {
    const timer = setTimeout(() => {
      if (workPositionQuery && workPositionQuery.trim().length >= 2) {
        searchWorkPosition(workPositionQuery);
      } else {
        setWorkPositionResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [workPositionQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (interestQuery && interestQuery.trim().length >= 2) {
        searchInterest(interestQuery);
      } else {
        setInterestResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [interestQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (employerQuery && employerQuery.trim().length >= 2) {
        searchEmployer(employerQuery);
      } else {
        setEmployerResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [employerQuery]);

  const handleSelectWorkPosition = (item) => {
    if (!selectedWorkPositions.find(pos => pos.id === item.id)) {
      setSelectedWorkPositions([...selectedWorkPositions, item]);
    }
    setWorkPositionQuery("");
    setWorkPositionResults([]);
  };

  const handleSelectInterest = (item) => {
    if (!selectedInterests.find(int => int.id === item.id)) {
      setSelectedInterests([...selectedInterests, item]);
    }
    setInterestQuery("");
    setInterestResults([]);
  };

  const handleSelectEmployer = (item) => {
    if (!selectedEmployers.find(emp => emp.id === item.id)) {
      setSelectedEmployers([...selectedEmployers, item]);
    }
    setEmployerQuery("");
    setEmployerResults([]);
  };

  const removeWorkPosition = (id) => {
    setSelectedWorkPositions(selectedWorkPositions.filter(pos => pos.id !== id));
  };

  const removeInterest = (id) => {
    setSelectedInterests(selectedInterests.filter(int => int.id !== id));
  };

  const removeEmployer = (id) => {
    setSelectedEmployers(selectedEmployers.filter(emp => emp.id !== id));
  };

  const formatCoverage = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleVerifyWhatsAppNumber = async () => {
    if (!whatsappNumber.trim()) {
      alert("Please enter WhatsApp number");
      return;
    }
    if (!formData.page_id) {
      alert("Please select a Page ID first");
      return;
    }

    setVerifying(true);
    try {
      const response = await metaApi.verifyWhatsAppNumber(
        formData.page_id,
        fullWhatsapp(),
        verificationCode || null
      );

      if (response.data?.verification_status === "VERIFIED") {
        setVerificationStatus("VERIFIED");
        setVerificationCode("");
        alert("WhatsApp number verified successfully!");
      } else if (response.data?.verification_status === "VERIFICATION_CODE_SEND_SUCCESS") {
        setVerificationStatus("VERIFICATION_CODE_SEND_SUCCESS");
        alert("Verification code sent successfully! Please check your WhatsApp and enter the code.");
      } else {
        alert(`Verification status: ${response.data?.verification_status || "Unknown"}`);
      }
    } catch (error) {
      alert(`Error verifying WhatsApp number: ${error.message}`);
      console.error("WhatsApp verification error:", error);
    } finally {
      setVerifying(false);
    }
  };

  // Handle place selection from Google Places
  const handlePlaceSelect = (placeInfo) => {
    if (placeInfo) {
      setSelectedPlace(placeInfo);
      console.log("📍 Place selected:", placeInfo);
      
      // Automatically add to custom_locations if coordinates are available
      if (placeInfo.location && placeInfo.location.lat && placeInfo.location.lng) {
        const newCustomLocation = {
          latitude: placeInfo.location.lat,
          longitude: placeInfo.location.lng,
          radius: 5, // Default radius in kilometers (within 2-17 km range)
          distance_unit: "kilometer", // Always use kilometers
          name: placeInfo.name || "",
          address: placeInfo.address || "",
          placeId: placeInfo.placeId || ""
        };
        
        // Ensure radius is within valid range (2-17 km)
        if (newCustomLocation.radius < 2) {
          newCustomLocation.radius = 2;
        } else if (newCustomLocation.radius > 17) {
          newCustomLocation.radius = 17;
        }
        
        // Check if this location already exists (avoid duplicates)
        const exists = customLocations.some(loc => 
          Math.abs(loc.latitude - newCustomLocation.latitude) < 0.0001 &&
          Math.abs(loc.longitude - newCustomLocation.longitude) < 0.0001
        );
        
        if (!exists) {
          setCustomLocations([...customLocations, newCustomLocation]);
          console.log("✅ Added to custom_locations:", newCustomLocation);
          // Clear selected place after adding so user can add more
          setTimeout(() => {
            setSelectedPlace(null);
          }, 2000);
        } else {
          console.log("ℹ️ Location already exists in custom_locations");
          setSelectedPlace(null);
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("Please enter ad set name");
      return;
    }
    if (!formData.daily_budget) {
      alert("Please enter daily budget");
      return;
    }
    const budgetAmount = parseFloat(formData.daily_budget);
    if (isNaN(budgetAmount) || budgetAmount <= 0) {
      alert("Please enter a valid daily budget amount");
      return;
    }
    if (!formData.page_id.trim()) {
      alert("Please enter Page ID");
      return;
    }
    if (!formData.min_age || !formData.max_age) {
      alert("Please enter Min Age and Max Age");
      return;
    }
    if (parseInt(formData.min_age) < 13 || parseInt(formData.min_age) > 65) {
      alert("Min Age must be between 13 and 65");
      return;
    }
    if (parseInt(formData.max_age) < 13 || parseInt(formData.max_age) > 65) {
      alert("Max Age must be between 13 and 65");
      return;
    }
    if (parseInt(formData.min_age) > parseInt(formData.max_age)) {
      alert("Min Age cannot be greater than Max Age");
      return;
    }
    // Validate: Either countries or custom_locations must be provided
    if (
      formData.targeting.geo_locations.countries.length === 0 &&
      customLocations.length === 0
    ) {
      alert("Please select at least one country or add a custom location using Google Places");
      return;
    }
    
    // Validate all custom locations have valid radius (2-17 km)
    if (customLocations.length > 0) {
      const invalidLocations = customLocations.filter(loc => 
        !loc.radius || loc.radius < 2 || loc.radius > 17
      );
      if (invalidLocations.length > 0) {
        alert("All custom locations must have a radius between 2 km and 17 km. Please adjust the radius values.");
        return;
      }
    }
    if (formData.targeting.publisher_platforms.length === 0) {
      alert("Please select at least one publisher platform");
      return;
    }
    if (!campaignData.campaign_id) {
      alert("Campaign ID is missing. Please create campaign first.");
      return;
    }
    // Validate WhatsApp number verification
    if (!whatsappNumber.trim()) {
      alert("Please enter WhatsApp number and verify it before creating the ad set");
      return;
    }
    if (verificationStatus !== "VERIFIED") {
      alert("Please verify your WhatsApp number before creating the ad set. Click the 'Verify' button to verify your number.");
      return;
    }

    setLoading(true);
    try {
      // Build geo_locations object
      const geoLocations = {};
      
      // Priority: Use custom_locations from Google Places
      // Note: Meta API doesn't allow both custom_locations and countries together (causes overlap error)
      if (customLocations.length > 0) {
        geoLocations.custom_locations = customLocations.map(loc => ({
          latitude: loc.latitude,
          longitude: loc.longitude,
          radius: loc.radius,
          distance_unit: loc.distance_unit || "kilometer"
        }));
        
        // Don't include countries when using custom_locations to avoid overlap error
        console.log("✅ Using custom_locations from Google Places (countries excluded to avoid overlap):", geoLocations.custom_locations);
      } else {
        // No custom_locations - use countries
        geoLocations.countries = formData.targeting.geo_locations.countries;
      }

      // Build targeting object with all fields
      const targeting = {
        geo_locations: geoLocations,
        device_platforms: formData.targeting.device_platforms,
        publisher_platforms: formData.targeting.publisher_platforms,
        age_min: parseInt(formData.min_age),
        age_max: parseInt(formData.max_age),
      };

      // Add genders only if selected (empty array means all genders)
      if (formData.genders.length > 0) {
        targeting.genders = formData.genders;
      }

      // Add positions only if selected
      if (formData.targeting.facebook_positions.length > 0) {
        targeting.facebook_positions = formData.targeting.facebook_positions;
      }
      if (formData.targeting.instagram_positions.length > 0) {
        targeting.instagram_positions = formData.targeting.instagram_positions;
      }

      // Add detailed targeting if selected
      if (selectedInterests.length > 0) {
        targeting.interests = selectedInterests.map(int => int.id);
      }
      if (selectedWorkPositions.length > 0) {
        targeting.work_positions = selectedWorkPositions.map(pos => pos.id);
      }
      if (selectedEmployers.length > 0) {
        targeting.work_employers = selectedEmployers.map(emp => emp.id);
      }

      const adsetPayload = {
        name: formData.name,
        campaign_id: campaignData.campaign_id,
        daily_budget: (parseFloat(formData.daily_budget) * 100).toString(), // Convert rupees to paise (×100)
        page_id: formData.page_id,
        destination_type: "WHATSAPP",
        optimization_goal: "CONVERSATIONS",
        billing_event: "IMPRESSIONS",
        status: "ACTIVE",
        targeting,
      };

      const response = await metaApi.createWhatsAppAdSet(adsetPayload);

      navigate("/meta/create/whatsapp/creative", {
        state: {
          ...campaignData,
          adset_id: response.data.id,
          page_id: formData.page_id,
          credentials: campaignData.credentials,
        },
      });
    } catch (error) {
      alert(`Error creating ad set: ${error.message}`);
      console.error("Ad Set creation error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Per-step validation before advancing.
  const validateStep = (s) => {
    if (s === 1) {
      if (!formData.name.trim()) { alert("Please enter ad set name"); return false; }
      if (!formData.daily_budget || parseFloat(formData.daily_budget) <= 0) { alert("Please enter a valid daily budget"); return false; }
      if (!formData.page_id) { alert("Please select a Page ID"); return false; }
      if (verificationStatus !== "VERIFIED") { alert("Please verify your WhatsApp number to continue"); return false; }
    }
    if (s === 2) {
      if (formData.targeting.geo_locations.countries.length === 0 && customLocations.length === 0) {
        alert("Select at least one country or add a custom location"); return false;
      }
      if (!formData.min_age || !formData.max_age) { alert("Please enter Min and Max age"); return false; }
    }
    if (s === 3) {
      if (formData.targeting.publisher_platforms.length === 0) { alert("Select at least one publisher platform"); return false; }
    }
    return true;
  };
  const goNext = () => { if (validateStep(step)) setStep((s) => Math.min(4, s + 1)); };
  const goBack = () => setStep((s) => Math.max(1, s - 1));
  const goToStep = (s) => { if (s <= step) setStep(s); else if (validateStep(step)) setStep(Math.min(s, step + 1)); };

  return (
    <div className="py-4 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30 flex-shrink-0">
              <FaWhatsapp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Ad Set — WhatsApp Campaign</h1>
              <p className="text-gray-500 text-sm mt-0.5">Configure your ad set settings for the WhatsApp campaign</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/meta/create/whatsapp/campaign")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-100 hover:text-gray-900 transition-all flex-shrink-0"
          >
            <FiArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        {campaignData.campaign_id && (
          <div className="flex items-center gap-3 bg-gradient-to-br from-green-50 to-emerald-50/40 border border-green-100 rounded-xl p-4 mb-6">
            <div className="w-9 h-9 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
              <FiFileText className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-800 text-sm mb-1.5">Campaign Summary</div>
              <div className="flex flex-wrap gap-x-12 gap-y-1 text-sm">
                <div><div className="text-[11px] text-gray-400">Name</div><div className="text-gray-800 font-semibold">{campaignData.name || "N/A"}</div></div>
                <div><div className="text-[11px] text-gray-400">Objective</div><div className="text-gray-800 font-semibold">{campaignData.objective || "N/A"}</div></div>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
              <FiCheck className="w-5 h-5" />
            </div>
          </div>
        )}

        {/* Stepper — pill style */}
        <div className="flex items-center mb-5 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center flex-1 last:flex-none min-w-0">
              <button
                type="button"
                onClick={() => goToStep(s.n)}
                className={`flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full transition-all whitespace-nowrap ${step === s.n ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"}`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step >= s.n ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                  {step > s.n ? <FiCheck className="w-3.5 h-3.5" /> : s.n}
                </span>
                <span className={`text-sm font-semibold ${step === s.n ? "text-green-600" : "text-gray-500"}`}>{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <span className="flex-1 border-t-2 border-dashed border-gray-200 mx-2 min-w-[16px]" />}
            </div>
          ))}
        </div>

        {/* Step description */}
        <p className="text-sm text-gray-500 mb-6 pb-5 border-b border-gray-100">{STEPS[step - 1].desc}</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 4) goNext(); else handleSubmit();
          }}
          className="space-y-6"
        >
          {step === 1 && (<>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ad Set Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiFileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter ad set name"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Page ID <span className="text-red-500">*</span>
              </label>
              {loadingPages ? (
                <div className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/60">
                  <span className="text-gray-500">Loading pages...</span>
                </div>
              ) : pages.length > 0 ? (
                <div className="relative">
                  <FiFlag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 w-4 h-4 pointer-events-none" />
                  <select
                    name="page_id"
                    value={formData.page_id}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                    required
                  >
                    {pages.map((page) => (
                      <option key={page.id} value={page.id}>
                        {page.name} ({page.id})
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 text-center">
                    No Facebook pages found
                  </p>
                  <a
                    href="https://www.facebook.com/pages/create"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Facebook Page
                  </a>
                  <p className="text-xs text-gray-400 text-center uppercase">OR</p>
                  <input
                    type="text"
                    name="page_id"
                    value={formData.page_id}
                    onChange={handleInputChange}
                    placeholder="Enter Facebook Page ID manually"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Daily Budget (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                <input
                  type="number"
                  name="daily_budget"
                  value={formData.daily_budget}
                  onChange={handleInputChange}
                  placeholder="Enter daily budget (e.g., 500)"
                  min="1"
                  step="1"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Amount will be converted to paise (×100) when submitting</p>
            </div>
          </div>

          {/* WhatsApp Number Verification */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {/* Searchable country-code selector (all countries) */}
              <CountryCodeSelect
                value={waCountry}
                onChange={(cc) => { setWaCountry(cc); if (verificationStatus) { setVerificationStatus(null); setVerificationCode(""); } }}
                disabled={verificationStatus === "VERIFIED"}
              />

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => {
                    setWhatsappNumber(e.target.value);
                    if (verificationStatus) {
                      setVerificationStatus(null);
                      setVerificationCode("");
                    }
                  }}
                  placeholder="Enter WhatsApp number (e.g., 9565347000)"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                  disabled={verificationStatus === "VERIFIED"}
                />
                {verificationStatus === "VERIFIED" && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FiCheck className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleVerifyWhatsAppNumber}
                disabled={verifying || !whatsappNumber.trim() || !formData.page_id || verificationStatus === "VERIFIED"}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all disabled:opacity-50 disabled:cursor-not-allowed border ${verificationStatus === "VERIFIED" ? "border-green-500 bg-green-50 text-green-600" : "border-green-500 text-green-600 hover:bg-green-50"}`}
              >
                {verificationStatus === "VERIFIED" ? <FiCheck className="w-4 h-4" /> : <FiShield className="w-4 h-4" />}
                {verifying ? "Verifying..." : verificationStatus === "VERIFIED" ? "Verified" : "Verify"}
              </button>
            </div>
            
            {/* OTP Input Field - Show when verification code is sent */}
            {verificationStatus === "VERIFICATION_CODE_SEND_SUCCESS" && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Verification Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter OTP code"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyWhatsAppNumber}
                    disabled={verifying || !verificationCode.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {verifying ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  A verification code has been sent to your WhatsApp number. Please enter it above.
                </p>
              </div>
            )}

            {/* Success Message */}
            {verificationStatus === "VERIFIED" && (
              <>
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <FiCheck className="w-5 h-5" />
                    <span className="text-sm font-medium">WhatsApp number verified successfully!</span>
                  </div>
                </div>
                {/* Change Primary WhatsApp Number Button */}
                <a
                  href="https://www.facebook.com/settings/?tab=linked_whatsapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 w-full px-4 py-2 bg-green-50 border border-green-300 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Change Primary WhatsApp Number
                </a>
              </>
            )}

            {/* Helper Text */}
            {verificationStatus !== "VERIFIED" && (
              <p className="text-xs text-gray-600 mt-2">
                <span className="text-red-500">*</span> WhatsApp number verification is required to create the ad set.
              </p>
            )}
          </div>

          </>)}

          {step === 2 && (<>
            {/* Google Places Autocomplete - Location Search */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                <FiMapPin className="w-4 h-4 text-gray-400" /> Search Location <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2.5">
                Search via Google Places — add multiple locations for precise targeting.
              </p>
              <PlacesAutocomplete
                key={`places-${customLocations.length}`}
                value=""
                onChange={() => {}}
                onPlaceSelect={handlePlaceSelect}
                showPlaceDetails={false}
                placeholder="Search for a location (e.g., city, address, landmark)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>

            {/* Display All Custom Locations - Each card is an accordion */}
            {customLocations.length > 0 && (
              <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50/60">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-gray-900 text-sm">
                    Custom Locations ({customLocations.length})
                  </h5>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomLocations([]);
                      setSelectedPlace(null);
                      setExpandedLocations(new Set());
                    }}
                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-3">
                  {customLocations.map((loc, idx) => {
                    const isExpanded = expandedLocations.has(idx);
                    return (
                      <div key={idx} className="bg-white border border-blue-200 rounded-lg overflow-hidden">
                        {/* Accordion Header for each location card */}
                        <button
                          type="button"
                          onClick={() => {
                            const newExpanded = new Set(expandedLocations);
                            if (isExpanded) {
                              newExpanded.delete(idx);
                            } else {
                              newExpanded.add(idx);
                            }
                            setExpandedLocations(newExpanded);
                          }}
                          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1 text-left">
                            {loc.name && (
                              <div className="font-semibold text-gray-900 text-sm mb-1">
                                {loc.name}
                              </div>
                            )}
                            {loc.address && (
                              <div className="text-xs text-gray-600">
                                {loc.address}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCustomLocations(customLocations.filter((_, i) => i !== idx));
                                const newExpanded = new Set(expandedLocations);
                                newExpanded.delete(idx);
                                // Adjust indices for remaining items
                                const adjustedExpanded = new Set();
                                newExpanded.forEach((expandedIdx) => {
                                  if (expandedIdx > idx) {
                                    adjustedExpanded.add(expandedIdx - 1);
                                  } else if (expandedIdx < idx) {
                                    adjustedExpanded.add(expandedIdx);
                                  }
                                });
                                setExpandedLocations(adjustedExpanded);
                              }}
                              className="text-gray-400 hover:text-red-600"
                              title="Remove location"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                            {isExpanded ? (
                              <FiChevronUp className="w-5 h-5 text-gray-600" />
                            ) : (
                              <FiChevronDown className="w-5 h-5 text-gray-600" />
                            )}
                          </div>
                        </button>
                        {/* Accordion Content - Details and Radius */}
                        {isExpanded && (
                          <div className="px-3 pb-3 border-t border-gray-200">
                            <div className="pt-3 space-y-2">
                              <div className="text-xs text-gray-500">
                                <span className="font-mono">Lat: {loc.latitude.toFixed(6)}, Lng: {loc.longitude.toFixed(6)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-700 whitespace-nowrap">
                                  Radius:
                                </label>
                                <input
                                  type="number"
                                  min="2"
                                  max="17"
                                  value={loc.radius}
                                  onChange={(e) => {
                                    const newLocations = [...customLocations];
                                    const newRadius = parseInt(e.target.value);
                                    // Validate and clamp radius between 2 and 17
                                    if (!isNaN(newRadius)) {
                                      if (newRadius < 2) {
                                        newLocations[idx].radius = 2;
                                      } else if (newRadius > 17) {
                                        newLocations[idx].radius = 17;
                                      } else {
                                        newLocations[idx].radius = newRadius;
                                      }
                                    } else {
                                      newLocations[idx].radius = 5; // Default if invalid
                                    }
                                    setCustomLocations(newLocations);
                                  }}
                                  onBlur={(e) => {
                                    // Ensure value is within range on blur
                                    const newLocations = [...customLocations];
                                    const radius = parseInt(e.target.value);
                                    if (isNaN(radius) || radius < 2) {
                                      newLocations[idx].radius = 2;
                                    } else if (radius > 17) {
                                      newLocations[idx].radius = 17;
                                    }
                                    setCustomLocations(newLocations);
                                  }}
                                  className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                />
                                <span className="text-xs text-gray-600">km</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Age Range */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Min Age <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    name="min_age"
                    value={formData.min_age}
                    onChange={handleInputChange}
                    min="13"
                    max="65"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Age <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiUsers className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    name="max_age"
                    value={formData.max_age}
                    onChange={handleInputChange}
                    min="13"
                    max="65"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Genders */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Genders (Optional)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {genders.map((gender) => {
                  const sel = formData.genders.includes(gender.value);
                  return (
                    <button
                      type="button"
                      key={gender.value}
                      onClick={() => handleGenderToggle(gender.value)}
                      className={`flex items-center justify-between gap-2 p-3.5 rounded-xl border-2 transition-all ${sel ? "border-green-500 bg-green-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm" style={{ background: gender.value === 1 ? "#3b82f6" : "#ec4899" }}>
                          {gender.value === 1 ? "♂" : "♀"}
                        </span>
                        <span className="text-sm font-semibold text-gray-800">{gender.label}</span>
                      </span>
                      <span className={`w-5 h-5 rounded-md border flex items-center justify-center ${sel ? "bg-green-500 border-green-500 text-white" : "border-gray-300 text-transparent"}`}>
                        <FiCheck className="w-3 h-3" />
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1.5">Leave empty to target all genders</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Countries <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {countries.map((country) => {
                  const sel = formData.targeting.geo_locations.countries.includes(country.code);
                  return (
                    <div
                      key={country.code}
                      onClick={() => handleCountryToggle(country.code)}
                      className={`p-3.5 border-2 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                        sel ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={`https://flagcdn.com/24x18/${country.code.toLowerCase()}.png`}
                          srcSet={`https://flagcdn.com/48x36/${country.code.toLowerCase()}.png 2x`}
                          width="24" height="18" alt={country.code}
                          className="rounded-sm shadow-sm flex-shrink-0"
                        />
                        <span className="text-sm font-semibold text-gray-800 truncate">{country.name}</span>
                      </div>
                      <span className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${sel ? "bg-green-500 border-green-500 text-white" : "border-gray-300 text-transparent"}`}>
                        <FiCheck className="w-3 h-3" />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </>)}

          {step === 3 && (<>
            {/* Publisher Platforms */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Publisher Platforms <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {publisherPlatforms.map((publisher) => {
                  const Icon = publisher.icon;
                  const sel = formData.targeting.publisher_platforms.includes(publisher.value);
                  return (
                    <label
                      key={publisher.value}
                      className={`p-3.5 border-2 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                        sel ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ background: publisher.color }}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="font-semibold text-sm text-gray-800 truncate">{publisher.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={sel}
                        onChange={() => handlePublisherToggle(publisher.value)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 flex-shrink-0"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Facebook Positions */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Facebook Positions <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {facebookPositions.map((position) => {
                  const Icon = position.icon;
                  const sel = formData.targeting.facebook_positions.includes(position.value);
                  return (
                    <label
                      key={position.value}
                      className={`p-3.5 border-2 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                        sel ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: position.color }}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="text-sm font-semibold text-gray-800">{position.label}</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={sel}
                        onChange={() => handleFacebookPositionToggle(position.value)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1">Leave empty to use all positions</p>
            </div>

            {/* Instagram Positions */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Instagram Positions <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {instagramPositions.map((position) => {
                  const Icon = position.icon;
                  const sel = formData.targeting.instagram_positions.includes(position.value);
                  return (
                    <label
                      key={position.value}
                      className={`p-3.5 border-2 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                        sel ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ background: position.color }}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="text-sm font-semibold text-gray-800 truncate">{position.label}</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={sel}
                        onChange={() => handleInstagramPositionToggle(position.value)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 flex-shrink-0"
                      />
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1">Leave empty to use all positions</p>
            </div>

            {/* Device Platforms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device Platforms (Optional)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {devicePlatforms.map((device) => {
                  const Icon = device.icon;
                  const sel = formData.targeting.device_platforms.includes(device.value);
                  return (
                    <label
                      key={device.value}
                      className={`p-3.5 border-2 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                        sel ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: device.color }}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="font-semibold text-sm text-gray-800">{device.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={sel}
                        onChange={() => handleDeviceToggle(device.value)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1">Leave empty to target all devices</p>
            </div>

          </>)}

          {step === 4 && (<>
            {/* Detailed Targeting Section */}
            <div>
              <div className="space-y-3">

              {/* Interests */}
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <label className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-pink-100 text-pink-500 flex items-center justify-center"><FaHeart className="w-3.5 h-3.5" /></span>
                  <span><span className="block">Interests</span><span className="block text-[11px] font-normal text-gray-400">Add people based on their interests</span></span>
                </label>
                <div className="relative" ref={interestRef}>
                  <input
                    type="text"
                    value={interestQuery}
                    onChange={(e) => setInterestQuery(e.target.value)}
                    placeholder="Search interests (e.g., gaming, sports)"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loadingInterest}
                  />
                  {loadingInterest && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    </div>
                  )}
                  {interestResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {interestResults.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectInterest(item)}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-sm text-gray-900">{item.name}</div>
                          {item.audience_size && (
                            <div className="text-xs text-gray-500 mt-1">
                              Audience: {formatCoverage(item.audience_size)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedInterests.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedInterests.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm"
                      >
                        <span>{item.name}</span>
                        <button
                          type="button"
                          onClick={() => removeInterest(item.id)}
                          className="text-pink-600 hover:text-pink-800"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Work Positions */}
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <label className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-500 flex items-center justify-center"><FaBriefcase className="w-3.5 h-3.5" /></span>
                  <span><span className="block">Work Positions</span><span className="block text-[11px] font-normal text-gray-400">Add people based on their job roles</span></span>
                </label>
                <div className="relative" ref={workPositionRef}>
                  <input
                    type="text"
                    value={workPositionQuery}
                    onChange={(e) => setWorkPositionQuery(e.target.value)}
                    placeholder="Search work positions (e.g., doctor, engineer)"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loadingWorkPosition}
                  />
                  {loadingWorkPosition && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    </div>
                  )}
                  {workPositionResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {workPositionResults.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectWorkPosition(item)}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-sm text-gray-900">{item.name}</div>
                          {item.coverage_lower_bound && item.coverage_upper_bound && (
                            <div className="text-xs text-gray-500 mt-1">
                              Coverage: {formatCoverage(item.coverage_lower_bound)} - {formatCoverage(item.coverage_upper_bound)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedWorkPositions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedWorkPositions.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        <span>{item.name}</span>
                        <button
                          type="button"
                          onClick={() => removeWorkPosition(item.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Employers */}
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <label className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-500 flex items-center justify-center"><FaBuilding className="w-3.5 h-3.5" /></span>
                  <span><span className="block">Employers (Companies)</span><span className="block text-[11px] font-normal text-gray-400">Add people based on the companies they work for</span></span>
                </label>
                <div className="relative" ref={employerRef}>
                  <input
                    type="text"
                    value={employerQuery}
                    onChange={(e) => setEmployerQuery(e.target.value)}
                    placeholder="Search employers/companies (e.g., hospital, tech company)"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={loadingEmployer}
                  />
                  {loadingEmployer && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    </div>
                  )}
                  {employerResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {employerResults.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectEmployer(item)}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-sm text-gray-900">{item.name}</div>
                          {item.coverage_lower_bound && item.coverage_upper_bound && (
                            <div className="text-xs text-gray-500 mt-1">
                              Coverage: {formatCoverage(item.coverage_lower_bound)} - {formatCoverage(item.coverage_upper_bound)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedEmployers.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedEmployers.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                      >
                        <span>{item.name}</span>
                        <button
                          type="button"
                          onClick={() => removeEmployer(item.id)}
                          className="text-orange-600 hover:text-orange-800"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              </div>
            </div>
          </>)}

          {/* Footer navigation */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t">
            {step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <span />}
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold text-sm shadow-lg shadow-green-500/30 hover:-translate-y-0.5 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {step < 4 ? <>Next <FiArrowRight /></> : (loading ? "Creating..." : <>Create Ad Set <FiArrowRight /></>)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

