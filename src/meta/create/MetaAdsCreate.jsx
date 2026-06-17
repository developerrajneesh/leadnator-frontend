import React, { useState, useEffect } from "react";
import { 
  FiUpload, 
  FiX, 
  FiCheck, 
  FiArrowRight,
  FiPlus,
  FiTrash2,
  FiGlobe,
  FiThumbsUp,
  FiVolume2,
  FiUsers,
  FiFileText,
  FiVideo,
  FiMessageCircle,
  FiShoppingBag,
  FiPackage,
  FiTarget,
  FiTrendingUp
} from "react-icons/fi";
import { GetCountries, GetState, GetCity } from "react-country-state-city";
import { campaignAPI, adsetAPI, adAPI } from "./lcmApi";
import PlacesAutocomplete from "./PlacesAutocomplete";
import "../../tailwind.css";

const MetaAdsCreate = ({ accessToken, adAccountId, onCampaignCreated, preselectedCampaignId, preselectedCampaignName, preselectedAdSetId, preselectedAdSetName }) => {
  // Start at step 3 if AdSet is preselected, step 2 if campaign is preselected, otherwise step 1
  const [step, setStep] = useState(preselectedAdSetId ? 3 : (preselectedCampaignId ? 2 : 1));
  const [loading, setLoading] = useState(false);
  
  // Store created IDs
  const [createdCampaignId, setCreatedCampaignId] = useState(preselectedCampaignId || null);
  const [createdAdSetId, setCreatedAdSetId] = useState(preselectedAdSetId || null);
  
  // Campaign Details
  const [campaignName, setCampaignName] = useState("");
  const [objective, setObjective] = useState("OUTCOME_TRAFFIC");
  const [campaignObjective, setCampaignObjective] = useState(null); // For preselected campaigns
  
  // AdSet Details
  const [adSetName, setAdSetName] = useState(preselectedCampaignName ? `${preselectedCampaignName} - AdSet` : "");
  const [budget, setBudget] = useState("");
  const [optimizationGoal, setOptimizationGoal] = useState("LINK_CLICKS");
  const [allowedOptimizationGoals, setAllowedOptimizationGoals] = useState([]);
  const [bidStrategy, setBidStrategy] = useState("LOWEST_COST_WITHOUT_CAP");
  const [bidAmount, setBidAmount] = useState("");
  const [bidConstraints, setBidConstraints] = useState({ roas_average_floor: "" });
  const [publisherPlatforms, setPublisherPlatforms] = useState(["facebook", "instagram"]);
  
  // Time fields
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  
  // Enhanced targeting
  const [selectedRegions, setSelectedRegions] = useState([]); // Array of { key: "..." }
  const [selectedCities, setSelectedCities] = useState([]); // Array of { key: "...", radius: 10, distance_unit: "kilometer" }
  const [customLocations, setCustomLocations] = useState([]); // Array of { latitude: 26.8467, longitude: 80.9462, radius: 10, distance_unit: "kilometer", name: "...", address: "..." }
  const [excludedGeoLocations, setExcludedGeoLocations] = useState({ cities: [], regions: [] });
  const [genders, setGenders] = useState([]); // Array of numbers: 1=male, 2=female
  const [facebookPositions, setFacebookPositions] = useState(["feed", "video_feeds"]);
  const [instagramPositions, setInstagramPositions] = useState(["stream", "reels"]);
  const [devicePlatforms, setDevicePlatforms] = useState(["mobile", "desktop"]);
  const [selectedInterests, setSelectedInterests] = useState([]); // Array of { id: "...", name: "..." }
  
  // Promoted Object (for APP_INSTALLS/APP_ENGAGEMENT)
  const [appId, setAppId] = useState("");
  const [objectStoreUrl, setObjectStoreUrl] = useState("");
  
  // Conversion Tracking (for OFFSITE_CONVERSIONS)
  const [pixelId, setPixelId] = useState("");
  const [conversionEvent, setConversionEvent] = useState("PURCHASE");
  
  // Destination Type
  const [destinationType, setDestinationType] = useState("");
  
  // WhatsApp Number (for WHATSAPP destination type)
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [wabaAccounts, setWabaAccounts] = useState([]);
  const [selectedWabaId, setSelectedWabaId] = useState("");
  const [whatsappPhoneNumbers, setWhatsappPhoneNumbers] = useState([]);
  const [businesses, setBusinesses] = useState([]); // Store businesses list
  const [loadingWaba, setLoadingWaba] = useState(false);
  const [loadingPhoneNumbers, setLoadingPhoneNumbers] = useState(false);
  const [showConnectWhatsApp, setShowConnectWhatsApp] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [verifiedName, setVerifiedName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [verificationPin, setVerificationPin] = useState("");
  
  // Targeting Details
  const [targeting, setTargeting] = useState({
    country: "IN", // Default to India
    countryName: "India",
    state: null,
    stateName: null,
    stateKey: null, // Meta region key
    city: null,
    cityName: null,
    cityKey: null, // Meta city key
    cityRadius: 10,
    distanceUnit: "mile",
    ageMin: 18,
    ageMax: 45,
  });
  
  const [searchingRegions, setSearchingRegions] = useState(false);
  const [searchingCities, setSearchingCities] = useState(false);
  const [regionOptions, setRegionOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  
  // Ad Creative
  const [adName, setAdName] = useState("");
  const [pageId, setPageId] = useState("");
  const [imageHash, setImageHash] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [videoId, setVideoId] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [adSetOptimizationGoal, setAdSetOptimizationGoal] = useState(null); // For checking if video is required
  const [adSetDestinationType, setAdSetDestinationType] = useState(null); // For checking destination type from adset
  const [isCTAAutoSelected, setIsCTAAutoSelected] = useState(false);
  const [callToActionType, setCallToActionType] = useState("LEARN_MORE");
  const [allowedCTAs, setAllowedCTAs] = useState([]);
  const [destinationUrl, setDestinationUrl] = useState("");
  
  // CTA-specific required fields
  const [phoneNumber, setPhoneNumber] = useState(""); // For CALL_NOW
  const [address, setAddress] = useState(""); // For GET_DIRECTIONS
  const [pages, setPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [adCreative, setAdCreative] = useState({
    primaryText: "",
    headline: "",
    description: "",
    media: null,
    mediaUrl: null,
  });
  const [ogImageTag, setOgImageTag] = useState(""); // Store Open Graph tag for display
  const [selectedPlace, setSelectedPlace] = useState(null); // Store selected place from Google Places
  const [metaRegionKey, setMetaRegionKey] = useState(null); // Store Meta region key for selected place
  const [searchingMetaRegion, setSearchingMetaRegion] = useState(false); // Loading state for Meta region search

  // Handle place selection from Google Places
  const handlePlaceSelect = async (placeInfo) => {
    if (placeInfo) {
      setSelectedPlace(placeInfo);
      setMetaRegionKey(null); // Reset region key
      console.log("📍 Place selected:", placeInfo);
      
      // Automatically add to custom_locations if coordinates are available
      if (placeInfo.location && placeInfo.location.lat && placeInfo.location.lng) {
        const newCustomLocation = {
          latitude: placeInfo.location.lat,
          longitude: placeInfo.location.lng,
          radius: 5, // Default radius in kilometers (within 2-17 km range)
          distance_unit: "kilometer", // Always use kilometers (fixed unit)
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
            setMetaRegionKey(null);
          }, 2000);
        } else {
          console.log("ℹ️ Location already exists in custom_locations");
          // Show a brief message without alert
          setSelectedPlace(null);
          setMetaRegionKey(null);
        }
      }
      
      // Search for Meta region/city key based on place
      if (placeInfo.name || placeInfo.address) {
        setSearchingMetaRegion(true);
        try {
          // Extract city/region name from address or use place name
          // Try to extract from address first (e.g., "Noida, Uttar Pradesh, India" -> "Noida")
          let searchQuery = placeInfo.name;
          if (placeInfo.address) {
            // Split address by comma and take first part (usually city/region name)
            const addressParts = placeInfo.address.split(",");
            if (addressParts.length > 0) {
              searchQuery = addressParts[0].trim();
            }
          }
          
          // Always search for both region and city to get the most accurate results
          // Meta API can return both, and we'll use the most relevant one
          let locationTypes = ['region', 'city']; // Always search both
          
          console.log("📍 Place types from Google:", placeInfo.types);
          
          console.log("🔍 Searching Meta geolocation for:", searchQuery);
          console.log("📍 Location types (auto-detected):", locationTypes);
          console.log("📍 Coordinates:", placeInfo.location);
          
          // Build search parameters
          const searchParams = {
            q: searchQuery,
            location_types: locationTypes.join(','), // Pass as comma-separated string: "region,city"
          };
          
          // Add coordinates if available
          if (placeInfo.location && placeInfo.location.lat && placeInfo.location.lng) {
            searchParams.latitude = placeInfo.location.lat.toString();
            searchParams.longitude = placeInfo.location.lng.toString();
            searchParams.distance = "10000"; // 10km radius in meters
          }
          
          console.log("📤 Calling Meta geolocation API with params:", searchParams);
          
          const response = await adsetAPI.searchAdGeolocation(searchParams);
          
          console.log("📥 Meta geolocation API response:", response.data);
          
          if (response.data.success && response.data.results && response.data.results.length > 0) {
            // Meta returns results, we need to find the best match
            // Priority: city > region (city is more specific)
            let bestResult = null;
            
            console.log("📊 All Meta results:", response.data.results);
            
            // First, try to find a city result
            // Meta API might use different field names: type, location_class, class, or primary_type
            const cityResult = response.data.results.find(r => {
              const type = String(r.type || r.location_class || r.class || r.primary_type || '').toLowerCase();
              const name = String(r.name || '').toLowerCase();
              // Check if it's a city by type or by name pattern (cities often have specific naming)
              return type === 'city' || 
                     type.includes('city') || 
                     (type === 'locality' && !type.includes('region')) ||
                     (name && !name.includes('state') && !name.includes('province') && !name.includes('region'));
            });
            
            // If no city found, try region
            const regionResult = response.data.results.find(r => {
              const type = String(r.type || r.location_class || r.class || r.primary_type || '').toLowerCase();
              return type === 'region' || 
                     type.includes('region') || 
                     type.includes('administrative_area') ||
                     type === 'state' ||
                     type === 'province';
            });
            
            // Use city if available, otherwise use region, otherwise first result
            bestResult = cityResult || regionResult || response.data.results[0];
            
            const geoKey = bestResult.key || bestResult.id;
            const geoName = bestResult.name;
            const geoType = bestResult.type || bestResult.location_class || bestResult.class || 'unknown';
            
            console.log("✅ Found Meta geolocation:", { 
              key: geoKey, 
              name: geoName, 
              type: geoType,
              isCity: !!cityResult,
              isRegion: !!regionResult,
              allResults: response.data.results,
              selectedResult: bestResult 
            });
            
            setMetaRegionKey({ 
              key: geoKey, 
              name: geoName, 
              type: geoType,
              fullResult: bestResult 
            });
          } else {
            console.log("ℹ️ No Meta geolocation found for:", searchQuery);
            console.log("📊 Response data:", response.data);
            setMetaRegionKey(null);
          }
        } catch (error) {
          console.error("❌ Error searching Meta geolocation:", error);
          console.error("❌ Error response:", error.response?.data);
          console.error("❌ Error message:", error.message);
          
          // Show user-friendly error
          if (error.response?.data?.error) {
            const fbError = error.response.data.error;
            console.error("❌ Meta API Error:", fbError.message || fbError.error_user_msg);
          }
          
          setMetaRegionKey(null);
        } finally {
          setSearchingMetaRegion(false);
        }
      }
    } else {
      // Place was cleared
      setSelectedPlace(null);
      setMetaRegionKey(null);
    }
  };

  const campaignObjectivesV23 = [
    { id: "OUTCOME_AWARENESS", name: "Awareness", icon: FiVolume2, category: "Awareness" },
    { id: "OUTCOME_TRAFFIC", name: "Traffic", icon: FiGlobe, category: "Traffic" },
    { id: "OUTCOME_ENGAGEMENT", name: "Engagement", icon: FiThumbsUp, category: "Engagement" },
    { id: "OUTCOME_LEADS", name: "Leads", icon: FiFileText, category: "Leads" },
    { id: "OUTCOME_SALES", name: "Sales", icon: () => <span className="font-bold text-lg">₹</span>, category: "Sales" },
    { id: "OUTCOME_APP_PROMOTION", name: "App Promotion", icon: FiPackage, category: "App" },
  ];
  
  const objectives = campaignObjectivesV23;

  // Campaign → AdSet Optimization Goals Mapping (v23.0)
  // Updated according to new requirements
  const campaignAdsetMappingV23 = {
    "OUTCOME_AWARENESS": {
      adsetOptimizationGoals: ["AD_RECALL_LIFT", "REACH", "IMPRESSIONS", "THRUPLAY"],
      validCTAs: ["LEARN_MORE", "WATCH_MORE", "LISTEN_NOW", "GET_QUOTE", "SIGN_UP"],
      objectType: ["PAGE", "POST", "VIDEO"],
      destinationTypes: ["ON_AD", "WEBSITE", "INSTAGRAM_PROFILE", "FACEBOOK_PAGE"]
    },
    "OUTCOME_TRAFFIC": {
      adsetOptimizationGoals: ["LINK_CLICKS", "LANDING_PAGE_VIEWS", "IMPRESSIONS", "REACH"],
      validCTAs: ["LEARN_MORE", "BOOK_NOW", "CONTACT_US", "CALL_NOW", "SHOP_NOW", "GET_OFFER"],
      objectType: ["URL", "PAGE"],
      destinationTypes: ["WEBSITE", "MESSAGING_APPS", "PHONE_CALL", "INSTAGRAM_PROFILE"]
    },
    "OUTCOME_ENGAGEMENT": {
      adsetOptimizationGoals: ["CONVERSATIONS", "POST_ENGAGEMENT", "THRUPLAY", "PAGE_LIKES", "EVENT_RESPONSES"],
      validCTAs: ["SEND_MESSAGE", "WHATSAPP_MESSAGE", "LEARN_MORE", "CALL_NOW", "LIKE_PAGE", "EVENT_RSVP"],
      objectType: ["PAGE", "POST", "VIDEO", "EVENT"],
      destinationTypes: ["MESSAGING_APPS", "ON_AD", "WEBSITE", "PHONE_CALL"]
    },
    "OUTCOME_LEADS": {
      adsetOptimizationGoals: ["LEAD_GENERATION", "LINK_CLICKS"],
      validCTAs: ["SIGN_UP", "GET_QUOTE", "APPLY_NOW", "SUBSCRIBE", "LEARN_MORE", "CALL_NOW"],
      objectType: ["PAGE", "FORM", "URL"],
      destinationTypes: ["INSTANT_FORM", "CALLS", "MESSAGING_APPS", "WEBSITE"]
    },
    "OUTCOME_APP_PROMOTION": {
      adsetOptimizationGoals: ["APP_INSTALLS", "APP_ENGAGEMENT"],
      validCTAs: ["INSTALL_MOBILE_APP", "USE_APP", "PLAY_GAME", "SHOP_NOW", "LISTEN_NOW"],
      objectType: ["APP"],
      destinationTypes: ["APP_STORE", "APP_DEEP_LINK"]
    },
    "OUTCOME_SALES": {
      adsetOptimizationGoals: ["LANDING_PAGE_VIEWS", "LINK_CLICKS"],
      validCTAs: ["SHOP_NOW", "BUY_NOW", "ORDER_NOW", "BOOK_NOW", "GET_OFFER", "CALL_NOW"],
      objectType: ["URL", "PRODUCT_CATALOG"],
      destinationTypes: ["WEBSITE", "APP", "MESSAGING_APPS", "PHONE_CALL"]
    }
  };

  // Optimization Goal → Valid CTAs Mapping
  // This maps each optimization goal to its valid CTA types
  const optimizationGoalCTAMapping = {
    // Awareness goals
    "AD_RECALL_LIFT": ["LEARN_MORE", "WATCH_MORE", "LISTEN_NOW", "GET_QUOTE", "SIGN_UP"],
    "REACH": ["LEARN_MORE", "WATCH_MORE", "LISTEN_NOW", "GET_QUOTE", "SIGN_UP"],
    "IMPRESSIONS": ["LEARN_MORE", "WATCH_MORE", "LISTEN_NOW", "GET_QUOTE", "SIGN_UP", "SHOP_NOW", "BOOK_NOW", "CONTACT_US", "CALL_NOW"],
    "THRUPLAY": ["WATCH_MORE", "WATCH_VIDEO", "LEARN_MORE", "SEND_MESSAGE", "WHATSAPP_MESSAGE"],
    "TWO_SECOND_VIDEO_VIEWS": ["WATCH_MORE", "WATCH_VIDEO", "LEARN_MORE"],
    
    // Traffic goals
    "LINK_CLICKS": ["LEARN_MORE", "BOOK_NOW", "CONTACT_US", "CALL_NOW", "SHOP_NOW", "GET_OFFER", "SIGN_UP", "SUBSCRIBE"],
    "LANDING_PAGE_VIEWS": ["LEARN_MORE", "SHOP_NOW", "BOOK_NOW", "GET_OFFER", "SIGN_UP"],
    
    // Engagement goals
    "CONVERSATIONS": ["SEND_MESSAGE", "WHATSAPP_MESSAGE", "MESSAGE_PAGE", "MESSAGE_US"],
    "POST_ENGAGEMENT": ["LIKE_PAGE", "FOLLOW", "SHARE", "COMMENT", "LEARN_MORE"],
    "PAGE_LIKES": ["LIKE_PAGE", "FOLLOW", "LEARN_MORE"],
    "EVENT_RESPONSES": ["EVENT_RSVP", "INTERESTED", "LEARN_MORE"],
    
    // Lead generation goals
    "LEAD_GENERATION": ["SIGN_UP", "GET_QUOTE", "APPLY_NOW", "SUBSCRIBE", "LEARN_MORE", "CALL_NOW"],
    "QUALITY_CALL": ["CALL_NOW", "CONTACT_US", "GET_QUOTE"],
    
    // Conversion goals
    "OFFSITE_CONVERSIONS": ["SHOP_NOW", "BUY_NOW", "ORDER_NOW", "SIGN_UP", "LEARN_MORE", "CALL_NOW"],
    "VALUE": ["SHOP_NOW", "BUY_NOW", "ORDER_NOW", "BOOK_NOW", "GET_OFFER"],
    
    // App goals
    "APP_INSTALLS": ["INSTALL_MOBILE_APP", "INSTALL_APP", "USE_APP", "PLAY_GAME"],
    "APP_ENGAGEMENT": ["USE_APP", "PLAY_GAME", "INSTALL_MOBILE_APP"],
    
    // Other goals
    "VIDEO_VIEWS": ["WATCH_VIDEO", "WATCH_MORE", "WATCH", "LEARN_MORE"],
  };

  // Optimization goal display names
  const optimizationGoalNames = {
    "LINK_CLICKS": "Link Clicks",
    "CONVERSIONS": "Conversions",
    "VALUE": "Value",
    "BRAND_AWARENESS": "Brand Awareness",
    "AD_RECALL_LIFT": "Ad Recall Lift",
    "REACH": "Reach",
    "IMPRESSIONS": "Impressions",
    "THRUPLAY": "ThruPlay",
    "TWO_SECOND_VIDEO_VIEWS": "Two Second Video Views",
    "LANDING_PAGE_VIEWS": "Landing Page Views",
    "POST_ENGAGEMENT": "Post Engagement",
    "CONVERSATIONS": "Conversations",
    "PAGE_LIKES": "Page Likes",
    "EVENT_RESPONSES": "Event Responses",
    "LEAD_GENERATION": "Lead Generation",
    "QUALITY_CALL": "Quality Call",
    "OFFSITE_CONVERSIONS": "Offsite Conversions",
    "PRODUCT_CATALOG_SALES": "Product Catalog Sales",
    "APP_INSTALLS": "App Installs",
    "APP_ENGAGEMENT": "App Engagement",
    "VIDEO_VIEWS": "Video Views"
  };

  // CTA type display names
  const ctaTypeNames = {
    "LEARN_MORE": "Learn More",
    "SHOP_NOW": "Shop Now",
    "SIGN_UP": "Sign Up",
    "DOWNLOAD": "Download",
    "BOOK_TRAVEL": "Book Travel",
    "BOOK_NOW": "Book Now",
    "CONTACT_US": "Contact Us",
    "CALL_NOW": "Call Now",
    "GET_QUOTE": "Get Quote",
    "GET_OFFER": "Get Offer",
    "SUBSCRIBE": "Subscribe",
    "BUY_NOW": "Buy Now",
    "ORDER_NOW": "Order Now",
    "LIKE_PAGE": "Like Page",
    "FOLLOW": "Follow",
    "SHARE": "Share",
    "COMMENT": "Comment",
    "INSTALL_APP": "Install App",
    "INSTALL_MOBILE_APP": "Install Mobile App",
    "USE_APP": "Use App",
    "PLAY_GAME": "Play Game",
    "SEND_MESSAGE": "Send Message",
    "WHATSAPP_MESSAGE": "WhatsApp Message",
    "WATCH_MORE": "Watch More",
    "LISTEN_NOW": "Listen Now",
    "EVENT_RSVP": "Event RSVP",
    "APPLY_NOW": "Apply Now"
  };

  // Check if video optimization goal is required
  const videoOptimizationGoals = ["THRUPLAY", "TWO_SECOND_VIDEO_VIEWS", "VIDEO_VIEWS"];
  const requiresVideo = adSetOptimizationGoal && videoOptimizationGoals.includes(adSetOptimizationGoal);
  
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingVideo(true);
      try {
        // Read file as base64 for preview
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Video = reader.result;
          setAdCreative({
            ...adCreative,
            media: base64Video,
            mediaUrl: base64Video,
          });

          // Upload to Meta to get video ID
          try {
            const uploadResponse = await adAPI.uploadVideo({
              adAccountId,
              videoBase64: base64Video,
              pageId: pageId,
            });

            if (uploadResponse.data.success) {
              const uploadedVideoId = uploadResponse.data.videoId;
              setVideoId(uploadedVideoId);
              console.log("✅ Video uploaded successfully. Video ID:", uploadedVideoId);
            } else {
              console.error("❌ Video upload failed:", uploadResponse.data.error);
              alert("Failed to upload video to Meta: " + (uploadResponse.data.error || "Unknown error"));
            }
          } catch (uploadError) {
            console.error("Error uploading video to Meta:", uploadError);
            const errorMsg = uploadError.response?.data?.error || uploadError.response?.data?.message || uploadError.message || "Unknown error";
            alert("Failed to upload video: " + errorMsg);
          } finally {
            setUploadingVideo(false);
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error reading video:", error);
        setUploadingVideo(false);
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingImage(true);
      try {
        // Read file as base64 for preview
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Image = reader.result;
          setAdCreative({
            ...adCreative,
            media: base64Image,
            mediaUrl: base64Image,
          });

          // Upload to Meta to get image hash
          try {
            const uploadResponse = await adAPI.uploadImage({
              adAccountId,
              imageBase64: base64Image,
              pageId: pageId, // Pass pageId for alternative upload method
            });

            if (uploadResponse.data.success) {
              if (uploadResponse.data.imageHash) {
                // ✅ Perfect! We have image_hash - this is the preferred method
                setImageHash(uploadResponse.data.imageHash);
                console.log("✅ Image uploaded successfully with image_hash:", uploadResponse.data.imageHash);
                console.log("✅ Using image_hash (preferred method) - image will show in your ad");
              } else {
                // No hash returned - this is OK for Facebook/Instagram ads
                const message = uploadResponse.data.message || uploadResponse.data.warning;
                
                if (message) {
                  console.log("ℹ️", message);
                }
                
                // Only show alert for WhatsApp ads (which require hash)
                // For Facebook/Instagram ads, silently continue - image URL will be used
                if (callToActionType === "WHATSAPP_MESSAGE" && uploadResponse.data.requiresCapability !== false) {
                  alert(
                    "⚠️ Meta App Configuration Required\n\n" +
                    "Your Meta app doesn't have the 'adimages' capability enabled.\n\n" +
                    "For WhatsApp ads, image_hash is required. Please enable the 'adimages' capability in your Meta App Dashboard:\n" +
                    "1. Go to developers.facebook.com\n" +
                    "2. Select your app\n" +
                    "3. Go to Settings > Advanced > Capabilities\n" +
                    "4. Enable 'adimages' capability"
                  );
                } else {
                  // For Facebook/Instagram ads, we'll use redirect page fallback
                  console.log("ℹ️ No image_hash available. Will use redirect page method to show image.");
                  console.log("💡 Tip: Enable 'adimages' capability in Meta App Dashboard to use image_hash (preferred method)");
                }
                
                // Set the image URL if available
                if (uploadResponse.data.imageUrl) {
                  console.log("ℹ️ Image URL available:", uploadResponse.data.imageUrl);
                  // Store the image URL for use in ad creation
                  setAdCreative(prev => ({
                    ...prev,
                    mediaUrl: uploadResponse.data.imageUrl
                  }));
                  
                  // Store Open Graph tag if provided
                  if (uploadResponse.data.ogImageTag) {
                    setOgImageTag(uploadResponse.data.ogImageTag);
                  } else if (uploadResponse.data.imageUrl) {
                    // Generate Open Graph tag
                    setOgImageTag(`<meta property="og:image" content="${uploadResponse.data.imageUrl}">`);
                  }
                }
              }
            } else {
              console.error("❌ Upload failed:", uploadResponse.data.error);
              // Only alert for critical errors, not for capability issues on non-WhatsApp ads
              if (callToActionType === "WHATSAPP_MESSAGE") {
                alert("Failed to upload image to Meta: " + (uploadResponse.data.error || "Unknown error"));
              } else {
                console.warn("⚠️ Image upload had issues, but you can still create the ad:", uploadResponse.data.error);
              }
            }
          } catch (uploadError) {
            console.error("Error uploading image to Meta:", uploadError);
            const errorMsg = uploadError.response?.data?.message || uploadError.message || "Unknown error";
            
            if (errorMsg.includes("capability") || errorMsg.includes("#3")) {
              // Only show alert for WhatsApp ads
              if (callToActionType === "WHATSAPP_MESSAGE") {
                alert(
                  "⚠️ Meta App Configuration Required\n\n" +
                  "Your Meta app doesn't have the 'adimages' capability enabled.\n\n" +
                  "To fix this:\n" +
                  "1. Go to Meta App Dashboard (developers.facebook.com)\n" +
                  "2. Select your app\n" +
                  "3. Go to Settings > Advanced\n" +
                  "4. Enable 'adimages' capability\n\n" +
                  "For WhatsApp ads, image_hash is required."
                );
              } else {
                // For Facebook/Instagram ads, just log - not a blocker
                console.log("ℹ️ Image hash not available due to capability issue, but this is OK for Facebook/Instagram ads. You can still create ads without image hash.");
              }
            } else {
              // For non-capability errors, only alert if it's WhatsApp
              if (callToActionType === "WHATSAPP_MESSAGE") {
                alert("Image preview loaded, but failed to upload to Meta: " + errorMsg);
              } else {
                console.warn("⚠️ Image upload failed, but you can still create Facebook/Instagram ads without it: " + errorMsg);
              }
            }
          } finally {
            setUploadingImage(false);
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error reading image:", error);
        setUploadingImage(false);
      }
    }
  };

  // Load Facebook pages
  const loadPages = async () => {
    if (!accessToken) {
      console.warn("⚠️ No access token available for loading pages");
      return;
    }
    
    setLoadingPages(true);
    try {
      console.log("📥 Loading Facebook pages...");
      const response = await adAPI.getPages();
      console.log("📤 Pages API response:", response.data);
      
      if (response.data.success) {
        // Handle different response structures
        let pagesData = [];
        
        if (response.data.pages?.data) {
          // Standard structure: { success: true, pages: { data: [...] } }
          pagesData = response.data.pages.data;
        } else if (Array.isArray(response.data.pages)) {
          // Direct array: { success: true, pages: [...] }
          pagesData = response.data.pages;
        } else if (response.data.pages && typeof response.data.pages === 'object') {
          // Try to extract data from nested structure
          pagesData = response.data.pages.data || Object.values(response.data.pages).flat() || [];
        }
        
        console.log(`✅ Loaded ${pagesData.length} pages:`, pagesData);
        
        if (pagesData.length > 0) {
          setPages(pagesData);
          // Auto-select first page if available
          if (!pageId) {
            setPageId(pagesData[0].id);
            console.log("✅ Auto-selected first page:", pagesData[0].id, pagesData[0].name);
          }
        } else {
          console.warn("⚠️ No pages found. Make sure you have pages associated with your Facebook account.");
          setPages([]);
        }
      } else {
        console.error("❌ Pages API returned success: false", response.data);
        if (response.data.error) {
          alert(`Error loading pages: ${response.data.error}`);
        }
        setPages([]);
      }
    } catch (error) {
      console.error("❌ Error loading pages:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to load pages";
      alert(`Error loading Facebook pages: ${errorMessage}\n\nMake sure:\n1. You have pages associated with your Facebook account\n2. Your access token has the 'pages_read_engagement' permission`);
      setPages([]);
    } finally {
      setLoadingPages(false);
    }
  };

  // Search for regions using Meta API
  const searchRegions = async (stateName, countryCode) => {
    if (!stateName || stateName.length < 2) {
      setRegionOptions([]);
      return;
    }

    setSearchingRegions(true);
    try {
      const response = await adsetAPI.getTargetingSearch({
        q: stateName,
        type: "region",
        country_code: countryCode,
      });

      if (response.data.success && response.data.data) {
        setRegionOptions(response.data.data || []);
      }
    } catch (error) {
      console.error("Error searching regions:", error);
      setRegionOptions([]);
    } finally {
      setSearchingRegions(false);
    }
  };

  // Search for cities using Meta API
  const searchCities = async (cityName, countryCode) => {
    if (!cityName || cityName.length < 2) {
      setCityOptions([]);
      return;
    }

    setSearchingCities(true);
    try {
      const response = await adsetAPI.getTargetingSearch({
        q: cityName,
        type: "city",
        country_code: countryCode,
      });

      if (response.data.success && response.data.data) {
        setCityOptions(response.data.data || []);
      }
    } catch (error) {
      console.error("Error searching cities:", error);
      setCityOptions([]);
    } finally {
      setSearchingCities(false);
    }
  };

  // Handle country change
  const handleCountryChange = (countryCode) => {
    // Ensure we're using the ISO code, not the name
    if (!countryCode || countryCode.trim() === "") {
      return;
    }
    
    // Find country by ISO code
    const country = countries.find(c => c.isoCode === countryCode || c.isoCode === countryCode.toUpperCase());
    
    // If not found by ISO code, try to find by name (fallback)
    const countryByName = countries.find(c => c.name === countryCode);
    
    // Use the found country or default to the provided code
    const finalCountry = country || countryByName;
    const finalCountryCode = finalCountry?.isoCode || countryCode.toUpperCase().substring(0, 2);
    
    console.log("🌍 Country change:", { countryCode, finalCountryCode, country: finalCountry });
    
    setTargeting({
      ...targeting,
      country: finalCountryCode, // Always use ISO code
      countryName: finalCountry?.name || "",
      state: null,
      stateName: null,
      stateKey: null,
      city: null,
      cityName: null,
      cityKey: null,
    });
    setRegionOptions([]);
    setCityOptions([]);
    setStates([]);
    setCities([]);
  };

  // Handle state change
  const handleStateChange = async (stateId) => {
    if (!stateId) {
      setTargeting({
        ...targeting,
        state: null,
        stateName: null,
        stateKey: null,
        city: null,
        cityName: null,
        cityKey: null,
      });
      setRegionOptions([]);
      setCities([]);
      return;
    }

    const state = states.find(s => s.id === parseInt(stateId));
    if (state) {
      setTargeting({
        ...targeting,
        state: stateId,
        stateName: state.name,
        stateKey: null, // Will be set when user selects from Meta results
        city: null,
        cityName: null,
        cityKey: null,
      });
      setCityOptions([]);
      setCities([]);
      // Search for Meta region key
      await searchRegions(state.name, targeting.country);
    }
  };

  // Handle city change
  const handleCityChange = async (cityId) => {
    if (!cityId) {
      setTargeting({
        ...targeting,
        city: null,
        cityName: null,
        cityKey: null,
      });
      setCityOptions([]);
      return;
    }

    const city = cities.find(c => c.id === parseInt(cityId));
    if (city) {
      setTargeting({
        ...targeting,
        city: cityId,
        cityName: city.name,
        cityKey: null, // Will be set when user selects from Meta results
      });
      // Search for Meta city key
      await searchCities(city.name, targeting.country);
    }
  };

  // Step 1: Create Campaign
  const handleCreateCampaign = async () => {
    if (!campaignName.trim()) {
      alert("Please enter a campaign name");
      return;
    }

    setLoading(true);

    try {
      const campaignResponse = await campaignAPI.create({
        adAccountId,
        name: campaignName,
        objective: objective,
        status: "ACTIVE",
        // Don't send special_ad_categories if it's ["NONE"] - Facebook doesn't accept "NONE" as a valid value
        // Omit it entirely for regular campaigns
      });

      if (!campaignResponse.data.success) {
        throw new Error(campaignResponse.data.message || "Failed to create campaign");
      }

      const campaignId = campaignResponse.data.campaign?.id;
      
      if (!campaignId) {
        throw new Error("Campaign created but no ID returned");
      }

      console.log("Campaign created successfully:", campaignId);
      
      // Verify campaign exists
      try {
        await campaignAPI.getById(campaignId);
      } catch (verifyError) {
        console.warn("Campaign verification failed, waiting...");
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      setCreatedCampaignId(campaignId);
      setAdSetName(`${campaignName} - AdSet`);
      setStep(2);
    } catch (error) {
      console.error("Error creating campaign:", error);
      console.error("Full error response:", error.response?.data);
      
      // Get detailed error message
      const fbError = error.response?.data?.fb;
      let errorMessage = "Failed to create campaign.\n\n";
      
      if (fbError) {
        errorMessage += `Facebook Error: ${fbError.message || "Unknown error"}`;
        if (fbError.error_user_msg) {
          errorMessage += `\n\n${fbError.error_user_msg}`;
        }
        if (fbError.error_subcode) {
          errorMessage += `\n\nError Code: ${fbError.code || "Unknown"} (Subcode: ${fbError.error_subcode})`;
        }
        if (fbError.error_user_title) {
          errorMessage = `${fbError.error_user_title}\n\n${errorMessage}`;
        }
      } else {
        errorMessage += error.response?.data?.message || error.message || "Please try again.";
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Create AdSet
  const handleCreateAdSet = async () => {
    if (!adSetName.trim()) {
      alert("Please enter an ad set name");
      return;
    }
    if (!budget || parseFloat(budget) <= 0) {
      alert("Please enter a valid daily budget (minimum ₹225.00)");
      return;
    }

    setLoading(true);

    try {
      // Universal allowed billing events for new ad accounts
      const ALLOWED_BILLING_EVENTS = ["IMPRESSIONS", "CLICKS", "LINK_CLICKS"];
      
      // Default billing event - use IMPRESSIONS for maximum compatibility with new accounts
      // New accounts only support IMPRESSIONS, not LINK_CLICKS or CLICKS
      let billingEvent = "IMPRESSIONS";
      
      // Validate billing_event - ensure it's in allowed list
      // For safety, always default to IMPRESSIONS for new accounts
      if (!ALLOWED_BILLING_EVENTS.includes(billingEvent)) {
        console.warn("Unsupported billing_event for this ad account. Using IMPRESSIONS.");
        billingEvent = "IMPRESSIONS";
      }
      
      // Log the billing event being used
      console.log("📊 Using billing_event:", billingEvent, "(IMPRESSIONS is safest for new accounts)");

      // Build geo_locations object
      // Priority: Use custom_locations from Google Places (countries optional)
      const geoLocations = {};
      
      // If custom_locations exist from Google Places, use them (countries not required)
      if (customLocations.length > 0) {
        // Validate all custom locations have valid radius (2-17 km)
        const invalidLocations = customLocations.filter(loc => {
          const radius = parseInt(loc.radius);
          return isNaN(radius) || radius < 2 || radius > 17;
        });
        
        if (invalidLocations.length > 0) {
          alert("All custom locations must have a radius between 2 km and 17 km. Please adjust the radius values.");
          setLoading(false);
          return;
        }
        
        geoLocations.custom_locations = customLocations.map(loc => {
          const radius = parseInt(loc.radius);
          // Ensure radius is within valid range (2-17)
          const validRadius = Math.max(2, Math.min(17, isNaN(radius) ? 5 : radius));
          return {
            latitude: parseFloat(loc.latitude),
            longitude: parseFloat(loc.longitude),
            radius: validRadius,
            distance_unit: "kilometer" // Always use kilometer
          };
        });
        console.log("✅ Using custom_locations from Google Places:", geoLocations.custom_locations);
      } else {
        // No custom_locations - require Google Places selection
        alert("Please search for a location using Google Places to add custom_locations for targeting");
        setLoading(false);
        return;
      }
      
      console.log("🌍 Full targeting object:", targeting);
      
      // Add regions (from state selection and additional regions)
      const allRegions = [];
      if (targeting.stateKey) {
        allRegions.push({ key: String(targeting.stateKey) });
      }
      // Add additional selected regions
      selectedRegions.forEach(region => {
        if (region.key && !allRegions.find(r => r.key === region.key)) {
          allRegions.push({ key: String(region.key) });
        }
      });
      if (allRegions.length > 0) {
        geoLocations.regions = allRegions;
      }
      
      // Add cities (from city selection and additional cities)
      const allCities = [];
      if (targeting.cityKey) {
        allCities.push({
          key: String(targeting.cityKey),
          radius: parseInt(targeting.cityRadius) || 10,
          distance_unit: targeting.distanceUnit || "mile"
        });
      }
      // Add additional selected cities
      selectedCities.forEach(city => {
        if (city.key && !allCities.find(c => c.key === city.key)) {
          allCities.push({
            key: String(city.key),
            radius: parseInt(city.radius) || 10,
            distance_unit: city.distance_unit || "kilometer"
          });
        }
      });
      if (allCities.length > 0) {
        geoLocations.cities = allCities;
      }
      
      // Custom locations are already added above if they exist from Google Places
      
      // Build excluded geo locations
      const excludedGeo = {};
      if (excludedGeoLocations.cities.length > 0) {
        excludedGeo.cities = excludedGeoLocations.cities.map(city => ({ key: String(city.key) }));
      }
      if (excludedGeoLocations.regions.length > 0) {
        excludedGeo.regions = excludedGeoLocations.regions.map(region => ({ key: String(region.key) }));
      }
      
      // Build targeting data object - match exact payload format
      const targetingData = {
        geo_locations: geoLocations,
        age_min: parseInt(targeting.ageMin) || 18,
        age_max: parseInt(targeting.ageMax) || 45,
        publisher_platforms: publisherPlatforms,
      };
      
      // Add excluded geo locations if any
      if (Object.keys(excludedGeo).length > 0) {
        targetingData.excluded_geo_locations = excludedGeo;
      }
      
      // Add genders if selected
      if (genders.length > 0) {
        targetingData.genders = genders;
      }
      
      // Add positions
      if (facebookPositions.length > 0) {
        targetingData.facebook_positions = facebookPositions;
      }
      if (instagramPositions.length > 0) {
        targetingData.instagram_positions = instagramPositions;
      }
      
      // Add device platforms
      if (devicePlatforms.length > 0) {
        targetingData.device_platforms = devicePlatforms;
      }
      
      // Add interests
      if (selectedInterests.length > 0) {
        targetingData.interests = selectedInterests.map(interest => ({
          id: String(interest.id),
          name: interest.name
        }));
      }
      
      console.log("📦 Targeting data to send:", JSON.stringify(targetingData, null, 2));

      // Convert budget to paise (×100) - Meta uses paise for INR
      // Minimum is ₹225 = 22500 paise
      const dailyBudgetPaise = Math.round(parseFloat(budget) * 100);
      if (isNaN(dailyBudgetPaise) || dailyBudgetPaise < 22500) {
        throw new Error("Daily budget must be at least ₹225.00 (22500 paise)");
      }

      // Determine the active campaign objective (from preselected campaign or current selection)
      const activeObjective = campaignObjective || objective;

      // Build AdSet payload - match exact format from requirements
      const adSetPayload = {
        campaignId: createdCampaignId,
        adAccountId,
        name: adSetName,
        optimizationGoal: optimizationGoal,
        billingEvent: billingEvent, // Use validated billing event
        bidStrategy: bidStrategy,
        dailyBudget: dailyBudgetPaise, // Send in paise (integer)
        targeting: targetingData,
        status: "ACTIVE",
        autoFixBudget: false,
      };

      // Only include page_id if campaign objective is NOT OUTCOME_ENGAGEMENT
      // OUTCOME_ENGAGEMENT campaigns should not send page_id to backend
      if (activeObjective !== "OUTCOME_ENGAGEMENT") {
        adSetPayload.page_id = pageId || null; // Include page_id at root level (not in promoted_object)
      }
      
      // Add start_time and end_time if provided
      // Format: ISO 8601 with timezone (e.g., "2025-01-01T00:00:00+0530")
      if (startTime && startTime.trim()) {
        // datetime-local format is "YYYY-MM-DDTHH:mm"
        // Convert to ISO 8601 with timezone: "YYYY-MM-DDTHH:mm:ss+HHmm"
        const dateStr = startTime.trim();
        if (dateStr.includes('T')) {
          // Get timezone offset (in minutes)
          const now = new Date();
          const timezoneOffset = -now.getTimezoneOffset(); // Offset in minutes
          const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60).toString().padStart(2, '0');
          const offsetMinutes = (Math.abs(timezoneOffset) % 60).toString().padStart(2, '0');
          const offsetSign = timezoneOffset >= 0 ? '+' : '-';
          // Format: YYYY-MM-DDTHH:mm:ss+HHmm
          adSetPayload.startTime = `${dateStr}:00${offsetSign}${offsetHours}${offsetMinutes}`;
        } else {
          adSetPayload.startTime = dateStr;
        }
      }
      if (endTime && endTime.trim()) {
        // datetime-local format is "YYYY-MM-DDTHH:mm"
        // Convert to ISO 8601 with timezone: "YYYY-MM-DDTHH:mm:ss+HHmm"
        const dateStr = endTime.trim();
        if (dateStr.includes('T')) {
          // Get timezone offset (in minutes)
          const now = new Date();
          const timezoneOffset = -now.getTimezoneOffset(); // Offset in minutes
          const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60).toString().padStart(2, '0');
          const offsetMinutes = (Math.abs(timezoneOffset) % 60).toString().padStart(2, '0');
          const offsetSign = timezoneOffset >= 0 ? '+' : '-';
          // Format: YYYY-MM-DDTHH:mm:ss+HHmm
          adSetPayload.endTime = `${dateStr}:00${offsetSign}${offsetHours}${offsetMinutes}`;
        } else {
          adSetPayload.endTime = dateStr;
        }
      }

      // Validate COST_CAP compatibility with optimization goal
      // COST_CAP is not compatible with engagement-based optimization goals
      const engagementGoals = ["CONVERSATIONS", "POST_ENGAGEMENT", "PAGE_LIKES", "EVENT_RESPONSES", "THRUPLAY"];
      if (bidStrategy === "COST_CAP" && engagementGoals.includes(optimizationGoal)) {
        alert(
          `COST_CAP bid strategy is not compatible with ${optimizationGoal} optimization goal. Please select a different optimization goal (e.g., LINK_CLICKS, LANDING_PAGE_VIEWS, OFFSITE_CONVERSIONS) or use a different bid strategy.`
        );
        setLoading(false);
        return;
      }

      // Add bidAmount if required by bid strategy
      if (bidStrategy === "LOWEST_COST_WITH_BID_CAP" || bidStrategy === "COST_CAP") {
        if (!bidAmount || parseFloat(bidAmount) <= 0) {
          alert("Bid Amount is required for the selected bid strategy");
          setLoading(false);
          return;
        }
        adSetPayload.bidAmount = parseFloat(bidAmount);
      }

      // Add bidConstraints if required by bid strategy
      if (bidStrategy === "LOWEST_COST_WITH_MIN_ROAS") {
        if (!bidConstraints.roas_average_floor || parseFloat(bidConstraints.roas_average_floor) <= 0) {
          alert("ROAS Average Floor is required for ROAS Goal bid strategy");
          setLoading(false);
          return;
        }
        adSetPayload.bidConstraints = bidConstraints;
      }

      // Add promoted_object for APP_INSTALLS and APP_ENGAGEMENT
      if (optimizationGoal === "APP_INSTALLS" || optimizationGoal === "APP_ENGAGEMENT") {
        if (!appId) {
          alert("App ID (Facebook Application ID) is required for APP_INSTALLS or APP_ENGAGEMENT optimization goals. Please provide the App ID.");
          setLoading(false);
          return;
        }
        
        if (!objectStoreUrl || !objectStoreUrl.trim()) {
          alert("App Store URL is required for APP_INSTALLS or APP_ENGAGEMENT optimization goals. Please provide the App Store URL (Apple App Store or Google Play Store).");
          setLoading(false);
          return;
        }
        
        const promotedObject = {
          app_id: appId,
          object_store_url: objectStoreUrl.trim()
        };
        
        adSetPayload.promotedObject = promotedObject;
        console.log("📱 Adding promoted_object for app optimization:", promotedObject);
      }

      // Add pixel_id and conversion_event for OFFSITE_CONVERSIONS
      if (optimizationGoal === "OFFSITE_CONVERSIONS") {
        if (!pixelId) {
          alert("Facebook Pixel ID is required for OFFSITE_CONVERSIONS optimization goal. Please provide your Pixel ID.");
          setLoading(false);
          return;
        }
        
        if (!conversionEvent) {
          alert("Conversion Event is required for OFFSITE_CONVERSIONS optimization goal. Please select a conversion event.");
          setLoading(false);
          return;
        }
        
        adSetPayload.pixelId = pixelId.trim();
        adSetPayload.conversionEvent = conversionEvent;
        console.log("📊 Adding conversion tracking for OFFSITE_CONVERSIONS:", { pixelId, conversionEvent });
      }

      // Add destination type to payload
      // For OUTCOME_LEADS campaigns, always use LEAD_FORM
      // For OUTCOME_AWARENESS campaigns, don't send destination type
      if (activeObjective === "OUTCOME_LEADS") {
        adSetPayload.destinationType = "LEAD_FORM";
        console.log("📍 Adding destination type: LEAD_FORM (automatically set for OUTCOME_LEADS campaign)");
      } else if (activeObjective !== "OUTCOME_AWARENESS" && destinationType) {
        adSetPayload.destinationType = destinationType;
        console.log("📍 Adding destination type:", destinationType);
      }

      // Add WhatsApp number for WHATSAPP destination type
      if (destinationType === "WHATSAPP") {
        if (!whatsappNumber || !whatsappNumber.trim()) {
          alert("WhatsApp Business Number is required for WhatsApp destination type. Please provide your WhatsApp number.");
          setLoading(false);
          return;
        }
        
        // Format WhatsApp number (remove spaces, ensure it starts with + if not already)
        let formattedWhatsappNumber = whatsappNumber.trim().replace(/\s+/g, "");
        if (!formattedWhatsappNumber.startsWith("+")) {
          // If it doesn't start with +, add it
          formattedWhatsappNumber = `+${formattedWhatsappNumber}`;
        }
        
        // Validate WhatsApp number format (should be digits after +)
        const numberPattern = /^\+[1-9]\d{1,14}$/;
        if (!numberPattern.test(formattedWhatsappNumber)) {
          alert("Invalid WhatsApp number format. Please enter a valid international phone number (e.g., +1234567890).");
          setLoading(false);
          return;
        }
        
        adSetPayload.whatsappNumber = formattedWhatsappNumber;
        console.log("📱 Adding WhatsApp number for WHATSAPP destination:", formattedWhatsappNumber);
      }

      const adSetResponse = await adsetAPI.create(adSetPayload);

      if (!adSetResponse.data.success) {
        const errorMsg = adSetResponse.data.message || adSetResponse.data.fb?.message || "Failed to create ad set";
        throw new Error(errorMsg); // Show error message directly
      }
      
      const adSetId = adSetResponse.data.adset?.id;
      if (!adSetId) {
        throw new Error("AdSet created but no ID returned");
      }
      
      // Show warning if billing event was changed
      if (adSetResponse.data.warning) {
        console.warn("⚠️", adSetResponse.data.warning);
        // Optionally show a non-blocking notification to user
        // You can replace this with a toast notification if you have one
        setTimeout(() => {
          console.log("ℹ️", adSetResponse.data.warning);
        }, 100);
      }
      
      console.log("AdSet created successfully:", adSetId);
      setCreatedAdSetId(adSetId);
      setAdName(`${adSetName} - Ad`);
      
      // Immediately set destination type from form state (this is the source of truth)
      // This ensures we have the correct destination type before fetching from API
      // Note: activeObjective is already declared earlier in this function
      const finalDestinationType = activeObjective === "OUTCOME_LEADS" 
        ? "LEAD_FORM" 
        : (activeObjective === "OUTCOME_AWARENESS" ? null : destinationType);
      
      if (finalDestinationType) {
        console.log("📍 Setting destination type from form state:", finalDestinationType);
        setAdSetDestinationType(finalDestinationType);
      }
      
      // Fetch optimization goal from created AdSet
      try {
        const adsetResponse = await adsetAPI.getById(adSetId);
        if (adsetResponse.data?.adset?.optimization_goal) {
          setAdSetOptimizationGoal(adsetResponse.data.adset.optimization_goal);
          console.log("📋 AdSet optimization goal:", adsetResponse.data.adset.optimization_goal);
        }
        // Also fetch destination type from adset, but prioritize form state
        // API inference may not correctly handle PHONE_CALL
        const fetchedDestinationType = adsetResponse.data?.adset?.destination_type || adsetResponse.data?.adset?.destinationType;
        if (fetchedDestinationType && !finalDestinationType) {
          // Only use API value if form state is not available
          setAdSetDestinationType(fetchedDestinationType);
          console.log("📍 AdSet destination type from API:", fetchedDestinationType);
        } else if (finalDestinationType) {
          console.log("📍 Using destination type from form state (prioritized over API):", finalDestinationType);
        }
      } catch (error) {
        console.error("Error fetching optimization goal from created adset:", error);
      }
      
      setStep(3);
    } catch (error) {
      console.error("Error creating ad set:", error);
      console.error("Full error response:", error.response?.data);
      
      // Get detailed error message
      const fbError = error.response?.data?.fb;
      let errorMessage = "Failed to create ad set.\n\n";
      
      if (fbError) {
        errorMessage += `Facebook Error: ${fbError.message || "Unknown error"}`;
        if (fbError.error_user_msg) {
          errorMessage += `\n\n${fbError.error_user_msg}`;
        }
        if (fbError.error_subcode) {
          errorMessage += `\n\nError Code: ${fbError.code || "Unknown"} (Subcode: ${fbError.error_subcode})`;
        }
        if (fbError.error_user_title) {
          errorMessage = `${fbError.error_user_title}\n\n${errorMessage}`;
        }
      } else {
        errorMessage += error.response?.data?.message || error.message || "Please try again.";
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Create Ad
  const handleCreateAd = async () => {
    if (!adName.trim()) {
      alert("Please enter an ad name");
      return;
    }

    // Validate CTA-specific required fields
    if (callToActionType === "CALL_NOW") {
      if (!phoneNumber || !phoneNumber.trim()) {
        alert("Phone number is required for 'Call Now' call-to-action type. Please enter a valid phone number.");
        setLoading(false);
        return;
      }
    }
    
    // Validate phone number for CALL_NOW CTA
    if (callToActionType === "CALL_NOW" && (!phoneNumber || !phoneNumber.trim())) {
      alert("Phone number is required for Call Now CTA. Please enter a valid phone number.");
      setLoading(false);
      return;
    }
    
    if (callToActionType === "GET_DIRECTIONS") {
      if (!address || !address.trim()) {
        alert("Address is required for 'Get Directions' call-to-action type. Please enter a valid address.");
        setLoading(false);
        return;
      }
    }

    // Validate required fields based on call to action type
    if (callToActionType === "WHATSAPP_MESSAGE") {
      if (!imageHash) {
        alert("Image is required for WhatsApp ads. Please upload an image.");
        return;
      }
    } else {
      // For Facebook/Instagram ads, image is optional but recommended
      // If no image is uploaded, we'll proceed without it
      if (!adCreative.media && !imageHash) {
        const proceed = confirm("No image uploaded. Do you want to continue without an image?");
        if (!proceed) {
          return;
        }
      }
    }

    setLoading(true);

    try {
      // Build object_story_spec based on call to action type
      let objectStorySpec = {};

      // Check if it's a messaging CTA (link is optional)
      const isMessagingCTA = callToActionType === "WHATSAPP_MESSAGE" || 
                            callToActionType === "SEND_MESSAGE" || 
                            callToActionType === "MESSAGE_PAGE" || 
                            callToActionType === "MESSAGE_US";
      
      // Fetch destination type from AdSet if not already set
      if (!adSetDestinationType && (createdAdSetId || preselectedAdSetId) && accessToken) {
        try {
          const adSetIdToFetch = createdAdSetId || preselectedAdSetId;
          const adsetResponse = await adsetAPI.getById(adSetIdToFetch);
          if (adsetResponse.data?.adset?.destination_type) {
            setAdSetDestinationType(adsetResponse.data.adset.destination_type);
            console.log("📍 Using destination_type from AdSet:", adsetResponse.data.adset.destination_type);
          }
        } catch (error) {
          console.error("Error fetching destination_type from AdSet:", error);
        }
      }
      
      // Get pageId from AdSet if not already set (pageId should come from step 2)
      let finalPageId = pageId;
      if (!finalPageId && (createdAdSetId || preselectedAdSetId) && accessToken) {
        try {
          const adSetIdToFetch = createdAdSetId || preselectedAdSetId;
          const adsetResponse = await adsetAPI.getById(adSetIdToFetch);
          if (adsetResponse.data?.adset?.page_id) {
            finalPageId = adsetResponse.data.adset.page_id;
            setPageId(finalPageId);
            console.log("📋 Using page_id from AdSet:", finalPageId);
          }
        } catch (error) {
          console.error("Error fetching page_id from AdSet:", error);
        }
      }
      
      // page_id is REQUIRED for all ads - use the one from AdSet
      if (!finalPageId) {
        alert("Page ID is required for all ads. Please ensure the AdSet has a Facebook page selected.");
        setLoading(false);
        return;
      }

      // Build call_to_action structure according to Meta API v23
      const callToAction = {
        type: callToActionType || "LEARN_MORE",
      };
      
      // Handle CTAs that require value.link
      if (callToActionType === "CALL_NOW") {
        if (!phoneNumber || !phoneNumber.trim()) {
          alert("Phone number is required for Call Now CTA. Please enter a valid phone number.");
          setLoading(false);
          return;
        }
        // Format phone number as tel: URL and put it in call_to_action.value.link
        const cleanPhone = phoneNumber.trim().replace(/\s+/g, '').replace(/[^\d+]/g, '');
        callToAction.value = {
          link: `tel:${cleanPhone}`
        };
        console.log("📞 Phone number in call_to_action.value.link:", callToAction.value.link);
      } else if (callToActionType === "GET_DIRECTIONS") {
        if (!address || !address.trim()) {
          alert("Address is required for 'Get Directions' call-to-action type. Please enter a valid address.");
          setLoading(false);
          return;
        }
        // For GET_DIRECTIONS, address goes in call_to_action.value.link
        callToAction.value = {
          link: address.trim()
        };
        console.log("📍 Address in call_to_action.value.link:", callToAction.value.link);
      }
      
      // Build link_data according to Meta API v23 structure
      const linkData = {
        message: adCreative.primaryText || adCreative.message || "Check out our offer!",
        call_to_action: callToAction,
      };
      
      // For messaging CTAs, link is optional
      // For CALL_NOW CTA, use tel: link
      // For all other CTAs, link is required (must be a website URL)
      if (callToActionType === "CALL_NOW" && phoneNumber && phoneNumber.trim()) {
        const cleanPhone = phoneNumber.trim().replace(/\s+/g, '').replace(/[^\d+]/g, '');
        linkData.link = `tel:${cleanPhone}`;
      } else if (!isMessagingCTA) {
        if (!destinationUrl || !destinationUrl.trim()) {
          alert("Destination URL is required for this call-to-action type. Please enter a valid URL.");
          setLoading(false);
          return;
        }
        linkData.link = destinationUrl.trim();
      } else {
        // For messaging CTAs, link is optional but can be included
        if (destinationUrl && destinationUrl.trim()) {
          linkData.link = destinationUrl.trim();
        }
        // For WHATSAPP_MESSAGE, image_hash is typically required
        if (callToActionType === "WHATSAPP_MESSAGE" && imageHash) {
          linkData.image_hash = imageHash;
        }
      }
      
      // Add optional fields (only if they have values)
      if (adCreative.headline && adCreative.headline.trim()) {
        linkData.name = adCreative.headline.trim();
      } else if (adName && adName.trim()) {
        linkData.name = adName.trim();
      }
      
      if (adCreative.description && adCreative.description.trim()) {
        linkData.description = adCreative.description.trim();
      }
      
      // Add image_hash if available
      // For WHATSAPP_MESSAGE, image_hash is typically required
      // For other CTAs, image_hash is optional but recommended
      if (imageHash) {
        linkData.image_hash = imageHash;
        console.log("✅ Using image_hash:", imageHash);
      } else if (adCreative.mediaUrl && !isMessagingCTA) {
        // Fallback: No image_hash available, use redirect page with Open Graph tags
        const redirectPageUrl = adAPI.getRedirectPageUrl(
          adCreative.mediaUrl,
          destinationUrl || "https://www.example.com",
          adCreative.headline || adName,
          adCreative.description || ""
        );
        
        console.log("ℹ️ No image_hash available. Using redirect page method as fallback.");
        console.log("💡 To use image_hash (preferred method), enable 'adimages' capability in Meta App Dashboard");
        
        // Use the redirect page URL as the destination link
        linkData.link = redirectPageUrl;
      }

      // Build object_story_spec according to Meta API v23
      // If video is required and uploaded, use video_data (and link_data if destination URL is needed)
      if (requiresVideo && videoId) {
        // Meta requires image_hash or image_url in video_data for video ads (thumbnail)
        if (!imageHash) {
          alert(`Image thumbnail is required for video ads. Meta requires image_hash or image_url in video_data. Please upload an image.`);
          setLoading(false);
          return;
        }
        
        // For video ads with WEBSITE destination, Meta requires link_data with link (not link in video_data)
        // Check if CTA is a messaging type that doesn't require a link
        const isMessagingCTA = callToActionType === "WHATSAPP_MESSAGE" || 
                              callToActionType === "SEND_MESSAGE" || 
                              callToActionType === "MESSAGE_PAGE" || 
                              callToActionType === "MESSAGE_US";
        
        // For non-messaging CTAs, destination URL is required (will be in link_data, not video_data)
        if (!isMessagingCTA && (!destinationUrl || !destinationUrl.trim())) {
          alert("Destination URL is required for video ads. Please enter a valid website URL.");
          setLoading(false);
          return;
        }
        
        // For video ads, destination URL goes in call_to_action.value.link (not link_data.link)
        // Update call_to_action to include value.link if destination URL is provided
        if (!isMessagingCTA && destinationUrl && destinationUrl.trim()) {
          callToAction.value = {
            link: destinationUrl.trim()
          };
          console.log("📤 Destination URL in call_to_action.value.link for video ad:", destinationUrl.trim());
        }
        
        // Build video_data (Meta doesn't support link in video_data, use call_to_action.value.link instead)
        const videoData = {
          video_id: videoId,
          message: adCreative.primaryText || adCreative.message || "Check out our video!",
          call_to_action: callToAction,
          image_hash: imageHash, // Required by Meta for video ads
        };
        
        // Add optional fields for video_data
        if (adCreative.headline && adCreative.headline.trim()) {
          videoData.title = adCreative.headline.trim();
        }
        if (adCreative.description && adCreative.description.trim()) {
          videoData.description = adCreative.description.trim();
        }
        
        // Build object_story_spec with video_data only (no link_data needed for video ads)
        objectStorySpec = {
          page_id: finalPageId, // Required for all ads
          video_data: videoData,
        };
        
        console.log("📤 Final object_story_spec (video):", JSON.stringify(objectStorySpec, null, 2));
      } else if (requiresVideo && !videoId) {
        alert(`Video is required for ${optimizationGoalNames[adSetOptimizationGoal] || adSetOptimizationGoal} optimization goal. Please upload a video.`);
        setLoading(false);
        return;
      } else {
        objectStorySpec = {
          page_id: finalPageId, // Required for all ads
          link_data: linkData,
        };
        console.log("📤 Final object_story_spec (link):", JSON.stringify(objectStorySpec, null, 2));
      }

      const adResponse = await adAPI.create({
        adsetId: createdAdSetId,
        name: adName,
        creative: {
          object_story_spec: objectStorySpec,
        },
        status: "ACTIVE",
      });

      if (!adResponse.data.success) {
        const errorMsg = adResponse.data.message || adResponse.data.fb?.message || "Failed to create ad";
        throw new Error(`Ad creation failed: ${errorMsg}`);
      }

      console.log("Ad created successfully:", adResponse.data.ad?.id);
      
      alert("Campaign, AdSet, and Ad created successfully!");
      
      // Reset form
      setCampaignName("");
      setAdSetName("");
      setAdName("");
      setPageId("");
      setImageHash("");
      setCallToActionType("LEARN_MORE");
      setDestinationUrl("");
      setBudget("");
      setObjective("OUTCOME_TRAFFIC");
      setOptimizationGoal("LINK_CLICKS");
      setBidStrategy("LOWEST_COST_WITHOUT_CAP");
      setBidAmount("");
      setBidConstraints({ roas_average_floor: "" });
      setWhatsappNumber("");
      setWabaAccounts([]);
      setSelectedWabaId("");
      setWhatsappPhoneNumbers([]);
      setShowConnectWhatsApp(false);
      setNewPhoneNumber("");
      setVerifiedName("");
      setDisplayName("");
      setVerificationPin("");
      setPublisherPlatforms(["facebook", "instagram"]);
      setTargeting({
        country: "IN",
        countryName: "India",
        state: null,
        stateName: null,
        stateKey: null,
        city: null,
        cityName: null,
        cityKey: null,
        cityRadius: 10,
        distanceUnit: "mile",
        ageMin: 18,
        ageMax: 45,
      });
      setRegionOptions([]);
      setCityOptions([]);
      setAdCreative({
        primaryText: "",
        headline: "",
        description: "",
        media: null,
        mediaUrl: null,
      });
      setCreatedCampaignId(null);
      setCreatedAdSetId(null);
      setStep(1);
      
      if (onCampaignCreated) {
        onCampaignCreated();
      }
    } catch (error) {
      console.error("Error creating ad:", error);
      alert(
        error.response?.data?.fb?.message ||
        error.response?.data?.message ||
        error.message ||
        "Failed to create ad. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    // If preselected AdSet, go back to step 3, if preselected campaign go to step 2, otherwise step 1
    setStep(preselectedAdSetId ? 3 : (preselectedCampaignId ? 2 : 1));
    setCreatedCampaignId(preselectedCampaignId || null);
    setCreatedAdSetId(preselectedAdSetId || null);
    if (!preselectedCampaignId) {
      setCampaignName("");
    }
    setAdSetName(preselectedCampaignName ? `${preselectedCampaignName} - AdSet` : "");
    setAdName(preselectedAdSetName ? `${preselectedAdSetName} - Ad` : "");
    setPageId("");
    setImageHash("");
    setCallToActionType("LEARN_MORE");
    setDestinationUrl("");
    setBudget("");
    setObjective("OUTCOME_TRAFFIC");
    setOptimizationGoal("LINK_CLICKS");
    setBidStrategy("LOWEST_COST_WITHOUT_CAP");
    setBidAmount("");
    setBidConstraints({ roas_average_floor: "" });
    setPublisherPlatforms(["facebook", "instagram"]);
    setTargeting({
      country: "IN",
      countryName: "India",
      state: null,
      stateName: null,
      stateKey: null,
      city: null,
      cityName: null,
      cityKey: null,
      cityRadius: 10,
      distanceUnit: "mile",
      ageMin: 18,
      ageMax: 45,
    });
    setRegionOptions([]);
    setCityOptions([]);
    setAdCreative({
      primaryText: "",
      headline: "",
      description: "",
      media: null,
      mediaUrl: null,
    });
  };
  
  // Initialize adSetName when component mounts with preselected campaign
  useEffect(() => {
    if (preselectedCampaignName && preselectedCampaignId && step === 2 && !adSetName) {
      setAdSetName(`${preselectedCampaignName} - AdSet`);
    }
  }, [preselectedCampaignName, preselectedCampaignId, step, adSetName]);

  // Fetch campaign objective when preselected campaign or adset is used
  useEffect(() => {
    const fetchCampaignObjective = async () => {
      if (preselectedCampaignId && accessToken) {
        try {
          const response = await campaignAPI.getById(preselectedCampaignId);
          if (response.data?.campaign?.objective) {
            setCampaignObjective(response.data.campaign.objective);
          }
        } catch (error) {
          console.error("Error fetching campaign objective:", error);
        }
      } else if (preselectedAdSetId && accessToken) {
        // If adset is preselected, fetch the adset to get campaign info and optimization goal
        try {
          const adsetResponse = await adsetAPI.getById(preselectedAdSetId);
          // The adset response includes campaign{objective} in the fields
          if (adsetResponse.data?.adset?.campaign?.objective) {
            setCampaignObjective(adsetResponse.data.adset.campaign.objective);
          } else if (adsetResponse.data?.adset?.campaign_id) {
            // Fallback: fetch campaign if objective not in adset response
            const campaignResponse = await campaignAPI.getById(adsetResponse.data.adset.campaign_id);
            if (campaignResponse.data?.campaign?.objective) {
              setCampaignObjective(campaignResponse.data.campaign.objective);
            }
          }
          
          // Get optimization goal from preselected AdSet
          if (adsetResponse.data?.adset?.optimization_goal) {
            setAdSetOptimizationGoal(adsetResponse.data.adset.optimization_goal);
            console.log("📋 Preselected AdSet optimization goal:", adsetResponse.data.adset.optimization_goal);
          }
        } catch (error) {
          console.error("Error fetching campaign objective from adset:", error);
        }
      }
    };
    fetchCampaignObjective();
  }, [preselectedCampaignId, preselectedAdSetId, accessToken]);

  // Update allowed optimization goals when objective changes
  useEffect(() => {
    const activeObjective = campaignObjective || objective;
    if (activeObjective && campaignAdsetMappingV23[activeObjective]) {
      const mapping = campaignAdsetMappingV23[activeObjective];
      
      // Update allowed optimization goals
      const allowedGoals = mapping.adsetOptimizationGoals;
      setAllowedOptimizationGoals(allowedGoals);
      
      // Reset optimization goal if current one is not allowed (only when we have allowed goals)
      if (allowedGoals.length > 0 && !allowedGoals.includes(optimizationGoal)) {
        setOptimizationGoal(allowedGoals[0]);
      }
    } else {
      // Default to empty array - will show all options as fallback
      setAllowedOptimizationGoals([]);
    }
  }, [objective, campaignObjective, optimizationGoal]);

  // Auto-set destination type to LEAD_FORM when campaign is OUTCOME_LEADS
  useEffect(() => {
    const activeObjective = campaignObjective || objective;
    if (activeObjective === "OUTCOME_LEADS") {
      setDestinationType("LEAD_FORM");
    }
  }, [campaignObjective, objective]);


  // Update allowed CTAs based on AdSet optimization goal and destination type (only in step 3)
  useEffect(() => {
    if (step === 3) {
      // ALWAYS prioritize adSetOptimizationGoal (from actual AdSet) over optimizationGoal (from step 2)
      // This ensures we use the real AdSet value, not the form value
      const activeOptimizationGoal = adSetOptimizationGoal || optimizationGoal;
      // Use adSetDestinationType from API, or fallback to form state destinationType
      const activeDestinationType = adSetDestinationType || destinationType;
      let allowedCTATypes = [];
      let autoSelectedCTA = null;
      let shouldAutoSelect = false;

      // First, filter by destination type if available
      if (activeDestinationType) {
        if (activeDestinationType === "PHONE_CALL") {
          // For PHONE_CALL, only show WHATSAPP_MESSAGE, LEARN_MORE, CALL_NOW
          allowedCTATypes = ["WHATSAPP_MESSAGE", "LEARN_MORE", "CALL_NOW"];
          autoSelectedCTA = "CALL_NOW";
          shouldAutoSelect = true;
      } else if (activeDestinationType === "WHATSAPP") {
        // For WHATSAPP, auto-select WHATSAPP_MESSAGE
        allowedCTATypes = Object.keys(ctaTypeNames); // Show all CTAs but auto-select
        autoSelectedCTA = "WHATSAPP_MESSAGE";
        shouldAutoSelect = true;
      } else if (activeDestinationType === "WEBSITE") {
          // For WEBSITE, auto-select LEARN_MORE
          allowedCTATypes = Object.keys(ctaTypeNames); // Show all CTAs but auto-select
          autoSelectedCTA = "LEARN_MORE";
          shouldAutoSelect = true;
        }
      }

      // If destination type filtering didn't apply, use optimization goal mapping
      if (allowedCTATypes.length === 0 && activeOptimizationGoal && optimizationGoalCTAMapping[activeOptimizationGoal]) {
        allowedCTATypes = optimizationGoalCTAMapping[activeOptimizationGoal];
      }

      // If still no CTAs, show all
      if (allowedCTATypes.length === 0) {
        allowedCTATypes = Object.keys(ctaTypeNames);
      }

      // Apply optimization goal filter to destination-based CTAs if needed
      // BUT for PHONE_CALL, always prioritize CALL_NOW regardless of optimization goal
      if (activeDestinationType === "PHONE_CALL") {
        // For PHONE_CALL destination, CALL_NOW is ALWAYS the required CTA
        // Don't filter by optimization goal - destination type takes precedence
        // Ensure CALL_NOW is first in the list and always selected
        if (!allowedCTATypes.includes("CALL_NOW")) {
          allowedCTATypes.unshift("CALL_NOW");
        } else {
          // Move CALL_NOW to the front
          allowedCTATypes = allowedCTATypes.filter(cta => cta !== "CALL_NOW");
          allowedCTATypes.unshift("CALL_NOW");
        }
        // Always set CALL_NOW as auto-selected for PHONE_CALL, regardless of optimization goal
        autoSelectedCTA = "CALL_NOW";
        shouldAutoSelect = true;
      } else if (activeDestinationType && activeOptimizationGoal && optimizationGoalCTAMapping[activeOptimizationGoal]) {
        // For other destination types, apply normal optimization goal filter
        const goalCTAs = optimizationGoalCTAMapping[activeOptimizationGoal];
        allowedCTATypes = allowedCTATypes.filter(cta => goalCTAs.includes(cta));
      }

      setAllowedCTAs(allowedCTATypes);

      // Auto-select CTA if needed
      if (shouldAutoSelect && autoSelectedCTA) {
        setCallToActionType(autoSelectedCTA);
        setIsCTAAutoSelected(true);
      } else {
        // Reset CTA if current one is not allowed (only when we have allowed CTAs)
        if (allowedCTATypes.length > 0 && !allowedCTATypes.includes(callToActionType)) {
          setCallToActionType(allowedCTATypes[0] || "LEARN_MORE");
        }
        setIsCTAAutoSelected(false);
      }
    } else {
      // Clear allowed CTAs when not in step 3
      setAllowedCTAs([]);
      setIsCTAAutoSelected(false);
    }
  }, [step, adSetOptimizationGoal, optimizationGoal, callToActionType, adSetDestinationType, destinationType]);

  // Initialize adName when component mounts with preselected AdSet
  useEffect(() => {
    if (preselectedAdSetName && preselectedAdSetId && step === 3 && !adName) {
      setAdName(`${preselectedAdSetName} - Ad`);
    }
  }, [preselectedAdSetName, preselectedAdSetId, step, adName]);

  // ALWAYS fetch optimization goal from AdSet when entering step 3
  // This ensures we use the actual AdSet value from Meta, not the form value from step 2
  useEffect(() => {
    const fetchOptimizationGoal = async () => {
      if (step === 3 && (createdAdSetId || preselectedAdSetId) && accessToken) {
        const adSetIdToFetch = createdAdSetId || preselectedAdSetId;
        try {
          console.log("📋 Fetching optimization goal from AdSet:", adSetIdToFetch);
          const adsetResponse = await adsetAPI.getById(adSetIdToFetch);
          if (adsetResponse.data?.adset?.optimization_goal) {
            const fetchedOptimizationGoal = adsetResponse.data.adset.optimization_goal;
            setAdSetOptimizationGoal(fetchedOptimizationGoal);
            console.log("✅ AdSet optimization goal fetched:", fetchedOptimizationGoal);
            console.log("📋 Display name:", optimizationGoalNames[fetchedOptimizationGoal] || fetchedOptimizationGoal);
            
            // Also fetch destination type from adset
            // PRIORITIZE form state destinationType over API inference (API may not correctly infer PHONE_CALL)
            const activeObjective = campaignObjective || objective;
            const formStateDestinationType = activeObjective === "OUTCOME_LEADS" 
              ? "LEAD_FORM" 
              : (activeObjective === "OUTCOME_AWARENESS" ? null : destinationType);
            
            const fetchedDestinationType = adsetResponse.data?.adset?.destination_type || adsetResponse.data?.adset?.destinationType;
            
            // Prioritize form state over API inference
            const finalDestinationType = formStateDestinationType || fetchedDestinationType;
            
            if (finalDestinationType) {
              setAdSetDestinationType(finalDestinationType);
              console.log("📍 Using destination type:", finalDestinationType, formStateDestinationType ? "(from form state)" : "(from API)");
            } else {
              console.warn("⚠️ No destination type found in form state or API response");
            }
            
            // If the fetched value differs from the form value, log a warning
            if (optimizationGoal && optimizationGoal !== fetchedOptimizationGoal) {
              console.warn(`⚠️ Optimization goal mismatch: Form had "${optimizationGoal}" but AdSet has "${fetchedOptimizationGoal}". Using AdSet value.`);
            }
          } else {
            console.warn("⚠️ AdSet optimization goal not found in response");
          }
        } catch (error) {
          console.error("❌ Error fetching optimization goal in step 3:", error);
        }
      }
    };
    fetchOptimizationGoal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, createdAdSetId, preselectedAdSetId, accessToken]);

  // Load pages when step 2 or step 3 is shown
  useEffect(() => {
    if ((step === 2 || step === 3) && accessToken) {
      loadPages();
    }
  }, [step, accessToken]);

  // Ensure default country is set when step 2 is shown
  useEffect(() => {
    // Removed country default - now using Google Places custom_locations
    // if (step === 2 && (!targeting.country || targeting.country.trim() === "")) {
    //   setTargeting(prev => ({
    //     ...prev,
    //     country: "IN",
    //     countryName: "India"
    //   }));
    // }
  }, [step]);

  // Comprehensive country list (static, always available)
  const staticCountries = [
    { isoCode: "IN", name: "India" },
    { isoCode: "US", name: "United States" },
    { isoCode: "GB", name: "United Kingdom" },
    { isoCode: "CA", name: "Canada" },
    { isoCode: "AU", name: "Australia" },
    { isoCode: "DE", name: "Germany" },
    { isoCode: "FR", name: "France" },
    { isoCode: "IT", name: "Italy" },
    { isoCode: "ES", name: "Spain" },
    { isoCode: "NL", name: "Netherlands" },
    { isoCode: "BE", name: "Belgium" },
    { isoCode: "CH", name: "Switzerland" },
    { isoCode: "AT", name: "Austria" },
    { isoCode: "SE", name: "Sweden" },
    { isoCode: "NO", name: "Norway" },
    { isoCode: "DK", name: "Denmark" },
    { isoCode: "FI", name: "Finland" },
    { isoCode: "PL", name: "Poland" },
    { isoCode: "PT", name: "Portugal" },
    { isoCode: "GR", name: "Greece" },
    { isoCode: "IE", name: "Ireland" },
    { isoCode: "BR", name: "Brazil" },
    { isoCode: "MX", name: "Mexico" },
    { isoCode: "AR", name: "Argentina" },
    { isoCode: "CL", name: "Chile" },
    { isoCode: "CO", name: "Colombia" },
    { isoCode: "PE", name: "Peru" },
    { isoCode: "JP", name: "Japan" },
    { isoCode: "CN", name: "China" },
    { isoCode: "KR", name: "South Korea" },
    { isoCode: "SG", name: "Singapore" },
    { isoCode: "MY", name: "Malaysia" },
    { isoCode: "TH", name: "Thailand" },
    { isoCode: "ID", name: "Indonesia" },
    { isoCode: "PH", name: "Philippines" },
    { isoCode: "VN", name: "Vietnam" },
    { isoCode: "AE", name: "United Arab Emirates" },
    { isoCode: "SA", name: "Saudi Arabia" },
    { isoCode: "IL", name: "Israel" },
    { isoCode: "TR", name: "Turkey" },
    { isoCode: "ZA", name: "South Africa" },
    { isoCode: "EG", name: "Egypt" },
    { isoCode: "NG", name: "Nigeria" },
    { isoCode: "KE", name: "Kenya" },
    { isoCode: "NZ", name: "New Zealand" },
  ];

  // Load countries on mount - try API first, fallback to static list
  useEffect(() => {
    const loadCountries = async () => {
      setLoadingCountries(true);
      
      // First, set static countries immediately so dropdown works
      setCountries(staticCountries);
      setLoadingCountries(false);
      
      // Set default to India
      setTargeting(prev => ({
        ...prev,
        country: prev.country && prev.country.length === 2 ? prev.country : "IN",
        countryName: prev.country === "IN" ? "India" : (prev.countryName || "India")
      }));
      
      // Try to load from API in background (optional enhancement)
      try {
        console.log("🌍 Attempting to load countries from API...");
        const countriesData = await GetCountries();
        console.log("🌍 GetCountries response:", countriesData);
        
        // Handle different response formats
        let countriesList = [];
        if (Array.isArray(countriesData)) {
          countriesList = countriesData;
        } else if (countriesData && Array.isArray(countriesData.data)) {
          countriesList = countriesData.data;
        } else if (countriesData && countriesData.countries) {
          countriesList = countriesData.countries;
        }
        
        // Filter to only include countries with valid ISO codes
        const validCountries = countriesList.filter(c => 
          c && 
          c.isoCode && 
          typeof c.isoCode === 'string' && 
          c.isoCode.length === 2 &&
          c.name
        );
        
        // If we got valid countries from API, use them (they might have more countries)
        if (validCountries.length > 0) {
          console.log("✅ Loaded", validCountries.length, "countries from API");
          setCountries(validCountries);
        } else {
          console.log("⚠️ API returned no valid countries, using static list");
        }
      } catch (error) {
        console.warn("⚠️ Could not load countries from API, using static list:", error.message);
        // Static list is already set, so no action needed
      }
    };
    
    loadCountries();
  }, []);

  // Load states when country changes
  useEffect(() => {
    const loadStates = async () => {
      if (targeting.country) {
        try {
          // Find country ID from countries list
          const country = countries.find(c => c.isoCode === targeting.country);
          if (country) {
            const statesData = await GetState(country.id);
            setStates(statesData || []);
          }
        } catch (error) {
          console.error("Error loading states:", error);
          setStates([]);
        }
      } else {
        setStates([]);
      }
    };
    loadStates();
  }, [targeting.country, countries]);

  // Load cities when state changes
  useEffect(() => {
    const loadCities = async () => {
      if (targeting.country && targeting.state) {
        try {
          const country = countries.find(c => c.isoCode === targeting.country);
          if (country) {
            const citiesData = await GetCity(country.id, parseInt(targeting.state));
            setCities(citiesData || []);
          }
        } catch (error) {
          console.error("Error loading cities:", error);
          setCities([]);
        }
      } else {
        setCities([]);
      }
    };
    loadCities();
  }, [targeting.country, targeting.state, countries]);

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4 mb-6">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  step > s
                    ? "bg-green-500 text-white"
                    : step === s
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {step > s ? <FiCheck className="w-5 h-5" /> : s}
              </div>
              <span className="text-xs font-medium text-gray-700">
                {s === 1 ? "Campaign" : s === 2 ? "AdSet" : "Ad"}
              </span>
            </div>
            {s < 3 && (
              <div className={`w-16 h-0.5 ${step > s ? "bg-green-500" : "bg-gray-200"}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Create Campaign */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Create Campaign</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g., Summer Running Sale"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objective *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {objectives.map((obj) => (
                    <button
                      key={obj.id}
                      onClick={() => setObjective(obj.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        objective === obj.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {typeof obj.icon === 'function' ? (
                        <span className="w-6 h-6 mb-2 text-gray-700 inline-flex items-center justify-center">
                          {obj.icon()}
                        </span>
                      ) : (
                        <obj.icon className="w-6 h-6 mb-2 text-gray-700" />
                      )}
                      <span className="text-sm font-medium text-gray-900 block">{obj.name}</span>
                      <span className="text-xs text-gray-500 mt-1">{obj.category}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleCreateCampaign}
              disabled={loading || !campaignName.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? "Creating..." : "Create Campaign"}
              {!loading && <FiArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Create AdSet */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Create AdSet</h3>
            {preselectedCampaignName ? (
              <p className="text-sm text-gray-600 mb-4">
                Create an AdSet for campaign "{preselectedCampaignName}".
              </p>
            ) : (
              <p className="text-sm text-gray-600 mb-4">
                Campaign "{campaignName}" created successfully! Now create an AdSet for this campaign.
              </p>
            )}
            
            <div className="space-y-6">
              {/* AdSet Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AdSet Name *
                </label>
                <input
                  type="text"
                  value={adSetName}
                  onChange={(e) => setAdSetName(e.target.value)}
                  placeholder="e.g., My_AdSet_Gonda_UP"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Facebook Page Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook Page *
                </label>
                {loadingPages ? (
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <span className="text-sm text-gray-500">Loading pages...</span>
                  </div>
                ) : pages.length > 0 ? (
                  <select
                    value={pageId}
                    onChange={(e) => setPageId(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Facebook Page</option>
                    {pages.map((page) => (
                      <option key={page.id} value={page.id}>
                        {page.name} ({page.id})
                      </option>
                    ))}
                  </select>
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
                      value={pageId}
                      onChange={(e) => setPageId(e.target.value)}
                      placeholder="Enter Facebook Page ID manually"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Select the Facebook page for your ads. This page will be used in the AdSet's promoted_object.
                </p>
              </div>

              {/* Optimization Goal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Optimization Goal *
                  {allowedOptimizationGoals.length > 0 && (
                    <span className="text-xs text-gray-500 ml-2 font-normal">
                      (Based on: {campaignObjective || objective})
                    </span>
                  )}
                </label>
                <select
                  value={optimizationGoal}
                  onChange={(e) => setOptimizationGoal(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {allowedOptimizationGoals.length > 0 ? (
                    allowedOptimizationGoals.map((goal) => (
                      <option key={goal} value={goal}>
                        {optimizationGoalNames[goal] || goal}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="LINK_CLICKS">Link Clicks</option>
                      <option value="LANDING_PAGE_VIEWS">Landing Page Views</option>
                      <option value="CONVERSIONS">Conversions</option>
                      <option value="VALUE">Value</option>
                      <option value="AD_RECALL_LIFT">Ad Recall Lift</option>
                      <option value="BRAND_AWARENESS">Brand Awareness</option>
                      <option value="REACH">Reach</option>
                      <option value="IMPRESSIONS">Impressions</option>
                      <option value="THRUPLAY">ThruPlay</option>
                      <option value="TWO_SECOND_VIDEO_VIEWS">Two Second Video Views</option>
                      <option value="CONVERSATIONS">Conversations</option>
                      <option value="POST_ENGAGEMENT">Post Engagement</option>
                      <option value="PAGE_LIKES">Page Likes</option>
                      <option value="EVENT_RESPONSES">Event Responses</option>
                      <option value="LEAD_GENERATION">Lead Generation</option>
                      <option value="QUALITY_CALL">Quality Call</option>
                      <option value="OFFSITE_CONVERSIONS">Offsite Conversions</option>
                      <option value="PRODUCT_CATALOG_SALES">Product Catalog Sales</option>
                      <option value="APP_INSTALLS">App Installs</option>
                      <option value="APP_ENGAGEMENT">App Engagement</option>
                      <option value="VIDEO_VIEWS">Video Views</option>
                    </>
                  )}
                </select>
                {allowedOptimizationGoals.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Only optimization goals valid for {campaignObjective || objective} are shown.
                  </p>
                )}
              </div>

              {/* Destination Type - Hide for OUTCOME_LEADS and OUTCOME_AWARENESS campaigns */}
              {(campaignObjective || objective) !== "OUTCOME_LEADS" && (campaignObjective || objective) !== "OUTCOME_AWARENESS" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination Type *
                  </label>
                  <select
                    value={destinationType}
                    onChange={(e) => setDestinationType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select destination type</option>
                    {/* For OUTCOME_ENGAGEMENT, only show WEBSITE, PHONE_CALL, and WHATSAPP */}
                    {(campaignObjective || objective) === "OUTCOME_ENGAGEMENT" ? (
                      <>
                        <option value="WEBSITE">Website</option>
                        <option value="PHONE_CALL">Phone Call</option>
                        <option value="WHATSAPP">WhatsApp</option>
                      </>
                    ) : (
                      <>
                        <option value="WEBSITE">Website</option>
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="MESSAGING_APPS">Messaging Apps</option>
                        <option value="PHONE_CALL">Phone Call</option>
                        <option value="INSTAGRAM_PROFILE">Instagram Profile</option>
                        <option value="FACEBOOK_PAGE">Facebook Page</option>
                        <option value="ON_AD">On Ad</option>
                        <option value="INSTANT_FORM">Instant Form</option>
                        <option value="CALLS">Calls</option>
                        <option value="APP_STORE">App Store</option>
                        <option value="APP_DEEP_LINK">App Deep Link</option>
                        <option value="APP">App</option>
                      </>
                    )}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select where you want to send people when they click your ad
                  </p>
                </div>
              )}

              {/* Show read-only destination type for OUTCOME_LEADS campaigns */}
              {(campaignObjective || objective) === "OUTCOME_LEADS" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination Type *
                  </label>
                  <input
                    type="text"
                    value="Lead Form (Automatically set for Leads campaigns)"
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Destination type is automatically set to Lead Form for Leads campaigns
                  </p>
                </div>
              )}

              {/* WhatsApp Number - Show when destination type is WHATSAPP */}
              {destinationType === "WHATSAPP" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Number *
                    <span className="text-xs text-red-500 ml-1">(Required)</span>
                  </label>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="e.g., +1234567890"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your WhatsApp Business number in international format (e.g., +1234567890)
                  </p>
                </div>
              )}

              {/* Promoted Object - Show for APP_INSTALLS and APP_ENGAGEMENT */}
              {(optimizationGoal === "APP_INSTALLS" || optimizationGoal === "APP_ENGAGEMENT") && (
                <div className="border-t pt-6 space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                      App Information (Required for App Optimization Goals)
                    </h4>
                    <p className="text-xs text-blue-700 mb-4">
                      For APP_INSTALLS and APP_ENGAGEMENT optimization goals, you must provide both App ID (Facebook Application ID) and App Store URL. The App ID must match the app in the App Store URL.
                    </p>
                    
                    <div className="space-y-4">
                      {/* App ID - REQUIRED */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          App ID (Facebook Application ID) *
                          <span className="text-xs text-red-500 ml-1">(Required)</span>
                        </label>
                        <input
                          type="text"
                          value={appId}
                          onChange={(e) => setAppId(e.target.value)}
                          placeholder="e.g., 123456789"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Your app's Facebook App ID (application_id). This must match the app in the App Store URL.
                        </p>
                      </div>

                      {/* Object Store URL - REQUIRED */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          App Store URL *
                          <span className="text-xs text-red-500 ml-1">(Required)</span>
                        </label>
                        <input
                          type="url"
                          value={objectStoreUrl}
                          onChange={(e) => setObjectStoreUrl(e.target.value)}
                          placeholder="e.g., https://apps.apple.com/app/id123456789 or https://play.google.com/store/apps/details?id=com.example.app"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Apple App Store or Google Play Store URL. Must match the App ID provided above.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Conversion Tracking - Show for OFFSITE_CONVERSIONS */}
              {optimizationGoal === "OFFSITE_CONVERSIONS" && (
                <div className="border-t pt-6 space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                      Conversion Tracking (Required for Offsite Conversions)
                    </h4>
                    <p className="text-xs text-blue-700 mb-4">
                      For OFFSITE_CONVERSIONS optimization goal, you must provide Facebook Pixel ID and a conversion event.
                    </p>
                    
                    <div className="space-y-4">
                      {/* Pixel ID */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Facebook Pixel ID *
                          <span className="text-xs text-red-500 ml-1">(Required)</span>
                        </label>
                        <input
                          type="text"
                          value={pixelId}
                          onChange={(e) => setPixelId(e.target.value)}
                          placeholder="e.g., 123456789012345"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Your Facebook Pixel ID (found in Events Manager)
                        </p>
                      </div>

                      {/* Conversion Event */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Conversion Event *
                          <span className="text-xs text-red-500 ml-1">(Required)</span>
                        </label>
                        <select
                          value={conversionEvent}
                          onChange={(e) => setConversionEvent(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="PURCHASE">Purchase</option>
                          <option value="ADD_TO_CART">Add to Cart</option>
                          <option value="INITIATE_CHECKOUT">Initiate Checkout</option>
                          <option value="LEAD">Lead</option>
                          <option value="COMPLETE_REGISTRATION">Complete Registration</option>
                          <option value="CONTACT">Contact</option>
                          <option value="FIND_LOCATION">Find Location</option>
                          <option value="SCHEDULE">Schedule</option>
                          <option value="SEARCH">Search</option>
                          <option value="SIGN_UP">Sign Up</option>
                          <option value="SUBMIT_APPLICATION">Submit Application</option>
                          <option value="SUBSCRIBE">Subscribe</option>
                          <option value="VIEW_CONTENT">View Content</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          The conversion event you want to optimize for
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bid Strategy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bid Strategy *
                </label>
                <select
                  value={bidStrategy}
                  onChange={(e) => {
                    setBidStrategy(e.target.value);
                    // Reset related fields when strategy changes
                    if (e.target.value === "LOWEST_COST_WITHOUT_CAP") {
                      setBidAmount("");
                      setBidConstraints({ roas_average_floor: "" });
                    } else if (e.target.value === "LOWEST_COST_WITH_MIN_ROAS") {
                      setBidAmount("");
                      setOptimizationGoal("VALUE"); // ROAS requires VALUE optimization goal
                    } else {
                      setBidConstraints({ roas_average_floor: "" });
                    }
                    // Warn if COST_CAP is selected with incompatible optimization goal
                    const engagementGoals = ["CONVERSATIONS", "POST_ENGAGEMENT", "PAGE_LIKES", "EVENT_RESPONSES", "THRUPLAY"];
                    if (e.target.value === "COST_CAP" && engagementGoals.includes(optimizationGoal)) {
                      alert(
                        `COST_CAP bid strategy is not compatible with ${optimizationGoal} optimization goal. Please select a different optimization goal (e.g., LINK_CLICKS, LANDING_PAGE_VIEWS, OFFSITE_CONVERSIONS) or use a different bid strategy.`
                      );
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="LOWEST_COST_WITHOUT_CAP">Lowest Cost (No Cap)</option>
                  <option value="LOWEST_COST_WITH_BID_CAP">Lowest Cost with Bid Cap</option>
                  <option value="COST_CAP">Cost Cap</option>
                  <option value="LOWEST_COST_WITH_MIN_ROAS">Lowest Cost with ROAS Goal</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Note: Bid Cap and ROAS Goal require additional parameters
                </p>
                {/* Warning for incompatible COST_CAP */}
                {bidStrategy === "COST_CAP" && ["CONVERSATIONS", "POST_ENGAGEMENT", "PAGE_LIKES", "EVENT_RESPONSES", "THRUPLAY"].includes(optimizationGoal) && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      ⚠️ Warning: COST_CAP is not compatible with {optimizationGoal} optimization goal. Please select a different optimization goal (e.g., LINK_CLICKS, LANDING_PAGE_VIEWS, OFFSITE_CONVERSIONS) or use a different bid strategy.
                    </p>
                  </div>
                )}
              </div>

              {/* Bid Amount - shown when LOWEST_COST_WITH_BID_CAP or COST_CAP is selected */}
              {(bidStrategy === "LOWEST_COST_WITH_BID_CAP" || bidStrategy === "COST_CAP") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bid Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="e.g., 10.00"
                    min="0.01"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum amount you're willing to pay per action (in rupees)
                  </p>
                </div>
              )}

              {/* ROAS Average Floor - shown when LOWEST_COST_WITH_MIN_ROAS is selected */}
              {bidStrategy === "LOWEST_COST_WITH_MIN_ROAS" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ROAS Average Floor *
                  </label>
                  <input
                    type="number"
                    value={bidConstraints.roas_average_floor}
                    onChange={(e) => setBidConstraints({ roas_average_floor: e.target.value })}
                    placeholder="e.g., 2.5"
                    min="0.01"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum Return on Ad Spend (ROAS) you want to achieve. Optimization Goal will be set to "VALUE" automatically.
                  </p>
                </div>
              )}

              {/* Daily Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Budget (₹) *
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g., 500 (minimum ₹225.00)"
                  min="225"
                  step="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum: ₹225.00 per day</p>
              </div>

              {/* Targeting Section */}
              <div className="border-t pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Targeting</h4>
                
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
                          setMetaRegionKey(null);
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

                {/* Display All Custom Locations */}
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
                        }}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="space-y-3">
                      {customLocations.map((loc, idx) => (
                        <div key={idx} className="bg-white p-3 border border-blue-200 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              {loc.name && (
                                <div className="font-semibold text-gray-900 text-sm mb-1">
                                  {loc.name}
                                </div>
                              )}
                              {loc.address && (
                                <div className="text-xs text-gray-600 mb-1">
                                  {loc.address}
                                </div>
                              )}
                              <div className="text-xs text-gray-500">
                                <span className="font-mono">Lat: {loc.latitude.toFixed(6)}, Lng: {loc.longitude.toFixed(6)}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCustomLocations(customLocations.filter((_, i) => i !== idx));
                              }}
                              className="ml-2 text-gray-400 hover:text-red-600"
                              title="Remove location"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
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
                      ))}
                    </div>
                  </div>
                )}

                {/* Age Range */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Age *
                    </label>
                    <input
                      type="number"
                      value={targeting.ageMin}
                      onChange={(e) => setTargeting({ ...targeting, ageMin: parseInt(e.target.value) || 18 })}
                      min="13"
                      max="65"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Age *
                    </label>
                    <input
                      type="number"
                      value={targeting.ageMax}
                      onChange={(e) => setTargeting({ ...targeting, ageMax: parseInt(e.target.value) || 45 })}
                      min="13"
                      max="65"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Genders */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Genders (Optional)
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={genders.includes(1)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setGenders([...genders.filter(g => g !== 1), 1]);
                          } else {
                            setGenders(genders.filter(g => g !== 1));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Male</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={genders.includes(2)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setGenders([...genders.filter(g => g !== 2), 2]);
                          } else {
                            setGenders(genders.filter(g => g !== 2));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Female</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Leave empty to target all genders</p>
                </div>

                {/* Publisher Platforms */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publisher Platforms *
                  </label>
                  <div className="space-y-2">
                    {["facebook", "instagram", "messenger", "audience_network"].map((platform) => (
                      <label key={platform} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={publisherPlatforms.includes(platform)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPublisherPlatforms([...publisherPlatforms, platform]);
                            } else {
                              setPublisherPlatforms(publisherPlatforms.filter(p => p !== platform));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {platform.replace("_", " ")}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Facebook Positions */}
                {publisherPlatforms.includes("facebook") && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook Positions (Optional)
                    </label>
                    <div className="space-y-2">
                      {["feed", "video_feeds", "right_column", "instant_article", "instream_video", "rewarded_video"].map((position) => (
                        <label key={position} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={facebookPositions.includes(position)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFacebookPositions([...facebookPositions, position]);
                              } else {
                                setFacebookPositions(facebookPositions.filter(p => p !== position));
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700 capitalize">
                            {position.replace("_", " ")}
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Leave empty to use all positions</p>
                  </div>
                )}

                {/* Instagram Positions */}
                {publisherPlatforms.includes("instagram") && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram Positions (Optional)
                    </label>
                    <div className="space-y-2">
                      {["stream", "reels", "story", "explore"].map((position) => (
                        <label key={position} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={instagramPositions.includes(position)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setInstagramPositions([...instagramPositions, position]);
                              } else {
                                setInstagramPositions(instagramPositions.filter(p => p !== position));
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700 capitalize">
                            {position}
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Leave empty to use all positions</p>
                  </div>
                )}

                {/* Device Platforms */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device Platforms (Optional)
                  </label>
                  <div className="space-y-2">
                    {["mobile", "desktop"].map((platform) => (
                      <label key={platform} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={devicePlatforms.includes(platform)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDevicePlatforms([...devicePlatforms, platform]);
                            } else {
                              setDevicePlatforms(devicePlatforms.filter(p => p !== platform));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {platform}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Leave empty to target all devices</p>
                </div>

                {/* Interests */}
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Interests (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const interestId = prompt("Enter Interest ID:");
                        const interestName = prompt("Enter Interest Name:");
                        if (interestId && interestName) {
                          setSelectedInterests([...selectedInterests, {
                            id: interestId.trim(),
                            name: interestName.trim()
                          }]);
                        }
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <FiPlus className="w-4 h-4" />
                      Add Interest
                    </button>
                  </div>
                  {selectedInterests.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {selectedInterests.map((interest, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                          <span className="text-sm text-gray-700">
                            {interest.name} (ID: {interest.id})
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedInterests(selectedInterests.filter((_, i) => i !== index))}
                            className="text-red-600 hover:text-red-700"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Add interests to target specific audiences. You can find interest IDs in Meta's Audience Insights.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={resetFlow}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Start Over
            </button>
            <button
              onClick={handleCreateAdSet}
              disabled={
                loading || 
                !adSetName.trim() || 
                !budget || 
                parseFloat(budget) < 225 || 
                customLocations.length === 0 ||
                publisherPlatforms.length === 0 ||
                ((campaignObjective || objective) !== "OUTCOME_ENGAGEMENT" && (!pageId || !pageId.trim())) ||
                (bidStrategy === "LOWEST_COST_WITH_BID_CAP" && (!bidAmount || parseFloat(bidAmount) <= 0)) ||
                (bidStrategy === "COST_CAP" && (!bidAmount || parseFloat(bidAmount) <= 0)) ||
                (bidStrategy === "LOWEST_COST_WITH_MIN_ROAS" && (!bidConstraints.roas_average_floor || parseFloat(bidConstraints.roas_average_floor) <= 0)) ||
                ((optimizationGoal === "APP_INSTALLS" || optimizationGoal === "APP_ENGAGEMENT") && (!appId || !objectStoreUrl)) ||
                (optimizationGoal === "OFFSITE_CONVERSIONS" && (!pixelId || !conversionEvent)) ||
                ((campaignObjective || objective) !== "OUTCOME_LEADS" && (campaignObjective || objective) !== "OUTCOME_AWARENESS" && !destinationType) ||
                (destinationType === "WHATSAPP" && !whatsappNumber)
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? "Creating..." : "Create AdSet"}
              {!loading && <FiArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Create Ad */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 3: Create Ad</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                {preselectedAdSetId 
                  ? `Create an Ad for AdSet "${preselectedAdSetName || adSetName}".`
                  : `AdSet "${adSetName}" created successfully! Now create an Ad for this AdSet.`
                }
              </p>
              {(adSetOptimizationGoal || optimizationGoal) && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">AdSet Optimization Goal:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {optimizationGoalNames[adSetOptimizationGoal || optimizationGoal] || (adSetOptimizationGoal || optimizationGoal)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Name *
                </label>
                <input
                  type="text"
                  value={adName}
                  onChange={(e) => setAdName(e.target.value)}
                  placeholder="e.g., WhatsApp Creative"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Call to Action Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call to Action Type *
                  {isCTAAutoSelected ? (
                    <span className="text-xs text-gray-500 ml-2 font-normal">
                      (Auto-selected based on destination type)
                    </span>
                  ) : allowedCTAs.length > 0 && (adSetOptimizationGoal || optimizationGoal) && (
                    <span className="text-xs text-gray-500 ml-2 font-normal">
                      (Based on: {optimizationGoalNames[adSetOptimizationGoal || optimizationGoal] || (adSetOptimizationGoal || optimizationGoal)})
                    </span>
                  )}
                </label>
                <select
                  value={callToActionType}
                  onChange={(e) => {
                    setCallToActionType(e.target.value);
                    // If user changes from auto-selected CTA, mark as no longer auto-selected
                    if (isCTAAutoSelected) {
                      setIsCTAAutoSelected(false);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {allowedCTAs.length > 0 ? (
                    allowedCTAs.map((cta) => (
                      <option key={cta} value={cta}>
                        {ctaTypeNames[cta] || cta}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="LEARN_MORE">Learn More</option>
                      <option value="SHOP_NOW">Shop Now</option>
                      <option value="SIGN_UP">Sign Up</option>
                      <option value="BOOK_NOW">Book Now</option>
                      <option value="CONTACT_US">Contact Us</option>
                      <option value="CALL_NOW">Call Now</option>
                      <option value="GET_QUOTE">Get Quote</option>
                      <option value="GET_OFFER">Get Offer</option>
                      <option value="SUBSCRIBE">Subscribe</option>
                      <option value="BUY_NOW">Buy Now</option>
                      <option value="ORDER_NOW">Order Now</option>
                      <option value="LIKE_PAGE">Like Page</option>
                      <option value="SEND_MESSAGE">Send Message</option>
                      <option value="WHATSAPP_MESSAGE">WhatsApp Message</option>
                      <option value="WATCH_MORE">Watch More</option>
                      <option value="LISTEN_NOW">Listen Now</option>
                      <option value="EVENT_RSVP">Event RSVP</option>
                      <option value="APPLY_NOW">Apply Now</option>
                      <option value="INSTALL_MOBILE_APP">Install Mobile App</option>
                      <option value="USE_APP">Use App</option>
                      <option value="PLAY_GAME">Play Game</option>
                    </>
                  )}
                </select>
                {isCTAAutoSelected ? (
                  <p className="text-xs text-gray-500 mt-1">
                    CTA is automatically set based on destination type ({adSetDestinationType}). You can change it if needed.
                  </p>
                ) : allowedCTAs.length > 0 ? (
                  <p className="text-xs text-gray-500 mt-1">
                    Only CTA types valid for {optimizationGoalNames[adSetOptimizationGoal || optimizationGoal] || (adSetOptimizationGoal || optimizationGoal)} optimization goal are shown.
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Select "WhatsApp Message" for WhatsApp ads
                  </p>
                )}
              </div>

              {/* CTA-Specific Required Fields */}
              {/* Phone Number for CALL_NOW */}
              {callToActionType === "CALL_NOW" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                    <span className="text-xs text-red-500 ml-1">(Required for Call Now CTA)</span>
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g., +1234567890 or (123) 456-7890"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a valid phone number with country code (e.g., +1 234 567 8900)
                  </p>
                </div>
              )}

              {/* Address for GET_DIRECTIONS */}
              {callToActionType === "GET_DIRECTIONS" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                    <span className="text-xs text-red-500 ml-1">(Required for Get Directions)</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g., 123 Main St, City, State, ZIP"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the full address for directions
                  </p>
                </div>
              )}


              {/* Video Upload (for video optimization goals like THRUPLAY) */}
              {requiresVideo ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video *
                    <span className="text-xs text-red-500 ml-1">
                      (Required for {optimizationGoalNames[adSetOptimizationGoal] || adSetOptimizationGoal})
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Video is required for {optimizationGoalNames[adSetOptimizationGoal] || adSetOptimizationGoal} optimization goal. 
                    The ad will not be created without a video.
                  </p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {uploadingVideo ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                        <p className="text-sm text-gray-600">Uploading video to Meta...</p>
                        <p className="text-xs text-gray-500 mt-1">This may take a few moments</p>
                      </div>
                    ) : videoId ? (
                      <div className="relative">
                        {adCreative.media ? (
                          <video
                            src={adCreative.media}
                            controls
                            className="max-h-64 mx-auto rounded-lg"
                          />
                        ) : (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-green-700 font-medium">✓ Video uploaded successfully</p>
                            <p className="text-xs text-green-600 mt-1">Video ID: {videoId}</p>
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setAdCreative({ ...adCreative, media: null, mediaUrl: null });
                            setVideoId("");
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700 font-medium">
                            Click to upload video
                          </span>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-sm text-gray-500 mt-2">
                          Supported formats: MP4, MOV, AVI (Max 4GB)
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Recommended: MP4, H.264 codec, 1080p or 720p
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Image Thumbnail Upload for Video Ads (Required by Meta) */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image Thumbnail *
                      <span className="text-xs text-red-500 ml-1">
                        (Required for video ads)
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Meta requires an image thumbnail for video ads. This image will be used as a preview/thumbnail for your video ad.
                    </p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {uploadingImage ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                          <p className="text-xs text-gray-600">Uploading thumbnail to Meta...</p>
                        </div>
                      ) : imageHash ? (
                        <div className="relative">
                          {adCreative.media && adCreative.media.startsWith('data:image') ? (
                            <img
                              src={adCreative.media}
                              alt="Thumbnail Preview"
                              className="max-h-32 mx-auto rounded-lg"
                            />
                          ) : (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <p className="text-xs text-green-700 font-medium">✓ Thumbnail uploaded</p>
                              <p className="text-xs text-green-600 mt-1">Hash: {imageHash.substring(0, 20)}...</p>
                            </div>
                          )}
                          <button
                            onClick={() => {
                              setAdCreative({ ...adCreative, media: null, mediaUrl: null });
                              setImageHash("");
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <label className="cursor-pointer">
                            <span className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                              Click to upload thumbnail
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            Recommended size: 1200×628px
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Image Upload (for non-video optimization goals) */
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image {callToActionType === "WHATSAPP_MESSAGE" ? "*" : "(Recommended)"}
                  </label>
                  {callToActionType !== "WHATSAPP_MESSAGE" && (
                    <p className="text-xs text-gray-500 mb-2">
                      Image is recommended for better ad performance. If upload fails, you can still create the ad without an image.
                    </p>
                  )}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {uploadingImage ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                        <p className="text-sm text-gray-600">Uploading image to Meta...</p>
                      </div>
                    ) : adCreative.media ? (
                      <div className="relative">
                        <img
                          src={adCreative.media}
                          alt="Preview"
                          className="max-h-64 mx-auto rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setAdCreative({ ...adCreative, media: null, mediaUrl: null });
                            setImageHash("");
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                        {imageHash && (
                          <div className="mt-2 text-xs text-green-600">
                            ✓ Image uploaded (Hash: {imageHash.substring(0, 20)}...)
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <label className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700 font-medium">
                            Click to upload
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-sm text-gray-500 mt-2">
                          Recommended size: 1200×628px (Required for WhatsApp ads)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Message/Primary Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message {callToActionType === "WHATSAPP_MESSAGE" ? "*" : "(Optional)"}
                </label>
                <textarea
                  value={adCreative.primaryText}
                  onChange={(e) => setAdCreative({ ...adCreative, primaryText: e.target.value })}
                  placeholder={
                    callToActionType === "WHATSAPP_MESSAGE"
                      ? "Chat with us on WhatsApp to get instant details"
                      : "The main text of your ad"
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Destination URL - Required for non-messaging CTAs, optional for messaging CTAs */}
              {(() => {
                const isMessagingCTA = callToActionType === "WHATSAPP_MESSAGE" || 
                                      callToActionType === "SEND_MESSAGE" || 
                                      callToActionType === "MESSAGE_PAGE" || 
                                      callToActionType === "MESSAGE_US";
                return (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destination URL {isMessagingCTA ? "(Optional)" : "*"}
                    </label>
                    <input
                      type="url"
                      value={destinationUrl}
                      onChange={(e) => setDestinationUrl(e.target.value)}
                      placeholder={
                        isMessagingCTA 
                          ? "https://wa.me/1234567890 or https://m.me/yourpage (optional)"
                          : "https://www.example.com"
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {isMessagingCTA && (
                      <p className="text-xs text-gray-500 mt-1">
                        Link is optional for messaging CTAs. You can leave this empty.
                      </p>
                    )}
                  </div>
                );
              })()}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Headline (Optional)
                </label>
                <input
                  type="text"
                  value={adCreative.headline}
                  onChange={(e) => setAdCreative({ ...adCreative, headline: e.target.value })}
                  placeholder="Short headline"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={adCreative.description}
                  onChange={(e) => setAdCreative({ ...adCreative, description: e.target.value })}
                  placeholder="Details about the offer"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleCreateAd}
              disabled={
                loading || 
                !adName.trim() ||
                (callToActionType === "WHATSAPP_MESSAGE" && !imageHash) ||
                (() => {
                  const isMessagingCTA = callToActionType === "WHATSAPP_MESSAGE" || 
                                        callToActionType === "SEND_MESSAGE" || 
                                        callToActionType === "MESSAGE_PAGE" || 
                                        callToActionType === "MESSAGE_US";
                  // For messaging CTAs: pageId comes from AdSet, destinationUrl is optional
                  // For other CTAs: pageId comes from AdSet, destinationUrl is required
                  if (isMessagingCTA) {
                    return callToActionType === "WHATSAPP_MESSAGE" && !imageHash;
                  } else {
                    return !destinationUrl;
                  }
                })()
              }
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title={
                callToActionType === "WHATSAPP_MESSAGE" && !imageHash
                  ? "Image is required for WhatsApp ads"
                  : callToActionType !== "WHATSAPP_MESSAGE" && !destinationUrl
                  ? "Destination URL is required"
                  : ""
              }
            >
              {loading ? "Creating..." : "Complete & Create Ad"}
              {!loading && <FiCheck className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaAdsCreate;
