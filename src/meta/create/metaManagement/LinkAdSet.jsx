import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiLink, FiArrowLeft, FiSmartphone, FiFacebook, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { FaBriefcase, FaHeart, FaBuilding, FaSearch } from "react-icons/fa";
import metaApi from "../lcmMetaApi";
import PlacesAutocomplete from "../PlacesAutocomplete";

export default function LinkAdSet() {
  const navigate = useNavigate();
  const location = useLocation();
  const campaignData = location.state || {};
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    daily_budget: "",
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
  const [customLocations, setCustomLocations] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
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

  const countries = [
    { code: "US", name: "United States", flag: "🇺🇸" },
    { code: "CA", name: "Canada", flag: "🇨🇦" },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
    { code: "AU", name: "Australia", flag: "🇦🇺" },
    { code: "IN", name: "India", flag: "🇮🇳" },
    { code: "DE", name: "Germany", flag: "🇩🇪" },
  ];

  const devicePlatforms = [
    { value: "mobile", label: "Mobile", icon: FiSmartphone, color: "blue" },
    { value: "desktop", label: "Desktop", icon: FiSmartphone, color: "purple" },
  ];

  const publisherPlatforms = [
    { value: "facebook", label: "Facebook", icon: FiFacebook, color: "blue" },
    { value: "instagram", label: "Instagram", icon: FiFacebook, color: "pink" },
    { value: "messenger", label: "Messenger", icon: FiFacebook, color: "blue" },
    { value: "audience_network", label: "Audience Network", icon: FiFacebook, color: "green" },
  ];

  const genders = [
    { value: 1, label: "Male" },
    { value: 2, label: "Female" },
  ];

  const facebookPositions = [
    { value: "feed", label: "Feed" },
    { value: "instant_article", label: "Instant Article" },
  ];

  const instagramPositions = [
    { value: "stream", label: "Feed" },
    { value: "reels", label: "Reels" },
    { value: "story", label: "Story" },
    { value: "explore", label: "Explore" },
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

  const handleGenderToggle = (gender) => {
    setFormData((prev) => {
      const genders = [...prev.genders];
      const index = genders.indexOf(gender);
      if (index > -1) {
        genders.splice(index, 1);
      } else {
        genders.push(gender);
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
        // If removing stream and explore is still selected, remove explore too
        if (position === 'stream' && positions.includes('explore')) {
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

  // Handle place selection from Google Places
  const handlePlaceSelect = (placeInfo) => {
    if (placeInfo) {
      setSelectedPlace(placeInfo);
      console.log("📍 Place selected:", placeInfo);
      
      if (placeInfo.location && placeInfo.location.lat && placeInfo.location.lng) {
        const newCustomLocation = {
          latitude: placeInfo.location.lat,
          longitude: placeInfo.location.lng,
          radius: 5,
          distance_unit: "kilometer",
          name: placeInfo.name || "",
          address: placeInfo.address || "",
          placeId: placeInfo.placeId || ""
        };
        
        if (newCustomLocation.radius < 2) {
          newCustomLocation.radius = 2;
        } else if (newCustomLocation.radius > 17) {
          newCustomLocation.radius = 17;
        }
        
        const exists = customLocations.some(loc => 
          Math.abs(loc.latitude - newCustomLocation.latitude) < 0.0001 &&
          Math.abs(loc.longitude - newCustomLocation.longitude) < 0.0001
        );
        
        if (!exists) {
          setCustomLocations([...customLocations, newCustomLocation]);
          setTimeout(() => {
            setSelectedPlace(null);
          }, 2000);
        } else {
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

    setLoading(true);
    try {
      // Build geo_locations object
      const geoLocations = {};
      
      // Priority: Use custom_locations from Google Places
      if (customLocations.length > 0) {
        geoLocations.custom_locations = customLocations.map(loc => ({
          latitude: loc.latitude,
          longitude: loc.longitude,
          radius: loc.radius,
          distance_unit: loc.distance_unit || "kilometer"
        }));
        
        // Countries are optional when using custom_locations
        if (formData.targeting.geo_locations.countries.length > 0) {
          geoLocations.countries = formData.targeting.geo_locations.countries;
        }
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

      // Add genders only if selected
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
        destination_type: "WEBSITE",
        optimization_goal: "REACH",
        billing_event: "IMPRESSIONS",
        status: "ACTIVE",
        targeting,
      };

      const response = await metaApi.createLinkAdSet(adsetPayload);

      navigate("/meta/create/link/creative", {
        state: {
          ...campaignData,
          adset_id: response.data.id,
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

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/meta/create/link/campaign")}
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
            <h1 className="text-3xl font-bold text-gray-900">Create Ad Set - Website Campaign</h1>
            <p className="text-gray-600 mt-1">Configure your ad set settings for the website campaign</p>
          </div>
        </div>

        {campaignData.campaign_id && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">Campaign Summary</h3>
            <div className="text-sm text-gray-600">
              <div><strong>Name:</strong> {campaignData.name || "N/A"}</div>
              <div><strong>Objective:</strong> {campaignData.objective || "N/A"}</div>
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ad Set Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter ad set name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Budget (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="daily_budget"
              value={formData.daily_budget}
              onChange={handleInputChange}
              placeholder="Enter daily budget in rupees (e.g., 500)"
              min="1"
              step="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Amount will be converted to paise (×100) when submitting</p>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Targeting</h3>

            {/* Google Places Autocomplete - Location Search */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Location *
              </label>
              <p className="text-xs text-gray-600 mb-3">
                Search for a location using Google Places. You can add multiple locations - each will be automatically added to custom_locations for targeting.
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

            {/* Display Selected Place Details (temporary preview) */}
            {selectedPlace && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-semibold text-gray-900 text-sm">
                    Preview:
                  </h5>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlace(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1 text-sm text-gray-700">
                  {selectedPlace.name && (
                    <div><strong>Name:</strong> {selectedPlace.name}</div>
                  )}
                  {selectedPlace.address && (
                    <div><strong>Address:</strong> {selectedPlace.address}</div>
                  )}
                  {selectedPlace.location && (
                    <div className="text-xs text-gray-500">
                      <strong>Coordinates:</strong> {selectedPlace.location.lat.toFixed(6)}, {selectedPlace.location.lng.toFixed(6)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Display All Custom Locations - Each card is an accordion */}
            {customLocations.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
                                    if (!isNaN(newRadius)) {
                                      if (newRadius < 2) {
                                        newLocations[idx].radius = 2;
                                      } else if (newRadius > 17) {
                                        newLocations[idx].radius = 17;
                                      } else {
                                        newLocations[idx].radius = newRadius;
                                      }
                                    } else {
                                      newLocations[idx].radius = 5;
                                    }
                                    setCustomLocations(newLocations);
                                  }}
                                  onBlur={(e) => {
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="min_age"
                  value={formData.min_age}
                  onChange={handleInputChange}
                  min="13"
                  max="65"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="max_age"
                  value={formData.max_age}
                  onChange={handleInputChange}
                  min="13"
                  max="65"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Genders */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genders (Optional)
              </label>
              <div className="flex gap-4">
                {genders.map((gender) => (
                  <label key={gender.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.genders.includes(gender.value)}
                      onChange={() => handleGenderToggle(gender.value)}
                      className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">{gender.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Leave empty to target all genders</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Countries <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {countries.map((country) => (
                  <div
                    key={country.code}
                    onClick={() => handleCountryToggle(country.code)}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.targeting.geo_locations.countries.includes(country.code)
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span className="text-sm font-medium">{country.name}</span>
                      </div>
                      {formData.targeting.geo_locations.countries.includes(country.code) && (
                        <span className="text-green-500">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device Platforms <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {devicePlatforms.map((device) => {
                  const Icon = device.icon;
                  return (
                    <div
                      key={device.value}
                      onClick={() => handleDeviceToggle(device.value)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.targeting.device_platforms.includes(device.value)
                          ? "border-pink-500 bg-pink-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{device.label}</span>
                        </div>
                        {formData.targeting.device_platforms.includes(device.value) && (
                          <span className="text-green-500">✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Publisher Platforms */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publisher Platforms <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {publisherPlatforms.map((publisher) => {
                  const Icon = publisher.icon;
                  return (
                    <label
                      key={publisher.value}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                        formData.targeting.publisher_platforms.includes(publisher.value)
                          ? "border-pink-500 bg-pink-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium text-sm">{publisher.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.targeting.publisher_platforms.includes(publisher.value)}
                        onChange={() => handlePublisherToggle(publisher.value)}
                        className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Facebook Positions */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook Positions (Optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {facebookPositions.map((position) => (
                  <label
                    key={position.value}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                      formData.targeting.facebook_positions.includes(position.value)
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-sm font-medium">{position.label}</span>
                    <input
                      type="checkbox"
                      checked={formData.targeting.facebook_positions.includes(position.value)}
                      onChange={() => handleFacebookPositionToggle(position.value)}
                      className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Leave empty to use all positions</p>
            </div>

            {/* Instagram Positions */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram Positions (Optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {instagramPositions.map((position) => (
                  <label
                    key={position.value}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                      formData.targeting.instagram_positions.includes(position.value)
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-sm font-medium">{position.label}</span>
                    <input
                      type="checkbox"
                      checked={formData.targeting.instagram_positions.includes(position.value)}
                      onChange={() => handleInstagramPositionToggle(position.value)}
                      className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                    />
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Leave empty to use all positions</p>
            </div>

            {/* Device Platforms */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device Platforms <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {devicePlatforms.map((device) => {
                  const Icon = device.icon;
                  return (
                    <div
                      key={device.value}
                      onClick={() => handleDeviceToggle(device.value)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.targeting.device_platforms.includes(device.value)
                          ? "border-pink-500 bg-pink-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{device.label}</span>
                        </div>
                        {formData.targeting.device_platforms.includes(device.value) && (
                          <span className="text-green-500">✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Targeting Section */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaSearch className="text-pink-600" /> Detailed Targeting (Optional)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Add interests, work positions, or employers to refine your audience targeting.
              </p>

              {/* Interests */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaHeart className="text-pink-500" /> Interests
                </label>
                <div className="relative" ref={interestRef}>
                  <input
                    type="text"
                    value={interestQuery}
                    onChange={(e) => setInterestQuery(e.target.value)}
                    placeholder="Search interests (e.g., gaming, sports)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    disabled={loadingInterest}
                  />
                  {loadingInterest && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600"></div>
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
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaBriefcase className="text-blue-500" /> Work Positions
                </label>
                <div className="relative" ref={workPositionRef}>
                  <input
                    type="text"
                    value={workPositionQuery}
                    onChange={(e) => setWorkPositionQuery(e.target.value)}
                    placeholder="Search work positions (e.g., doctor, engineer)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    disabled={loadingWorkPosition}
                  />
                  {loadingWorkPosition && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600"></div>
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
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FaBuilding className="text-orange-500" /> Employers (Companies)
                </label>
                <div className="relative" ref={employerRef}>
                  <input
                    type="text"
                    value={employerQuery}
                    onChange={(e) => setEmployerQuery(e.target.value)}
                    placeholder="Search employers/companies (e.g., hospital, tech company)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    disabled={loadingEmployer}
                  />
                  {loadingEmployer && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600"></div>
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

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Ad Set"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

