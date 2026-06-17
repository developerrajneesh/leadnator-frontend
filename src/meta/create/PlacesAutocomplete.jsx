import React, { useState, useRef, useEffect } from "react";
import { FiMapPin, FiX } from "react-icons/fi";

const PlacesAutocomplete = ({ value, onChange, placeholder, className, onPlaceSelect, showPlaceDetails = true }) => {
  const [placeDetails, setPlaceDetails] = useState(null);
  const [inputValue, setInputValue] = useState(value || "");
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_PLACE_APIKEY;

  useEffect(() => {
    // Load Google Places API script
    if (!window.google && apiKey) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsScriptLoaded(true);
      };
      document.head.appendChild(script);

      return () => {
        // Cleanup script if component unmounts
        const existingScript = document.querySelector(
          `script[src*="maps.googleapis.com"]`
        );
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
      };
    } else if (window.google) {
      setIsScriptLoaded(true);
    }
  }, [apiKey]);

  useEffect(() => {
    if (isScriptLoaded && inputRef.current && window.google) {
      // Initialize autocomplete
      const autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["establishment", "geocode"],
          fields: [
            "formatted_address",
            "name",
            "place_id",
            "geometry",
            "formatted_phone_number",
            "website",
            "rating",
            "user_ratings_total",
            "opening_hours",
            "types",
            "address_components",
          ],
        }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        
        if (place && place.formatted_address) {
          // Set the formatted address as the URL (or website if available)
          const url = place.website || place.formatted_address;
          setInputValue(place.name || place.formatted_address);
          
          // Store place details
          const placeInfo = {
            name: place.name || "",
            address: place.formatted_address || "",
            placeId: place.place_id || "",
            phone: place.formatted_phone_number || "",
            website: place.website || "",
            rating: place.rating || null,
            totalRatings: place.user_ratings_total || 0,
            location: place.geometry?.location
              ? {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                }
              : null,
            types: place.types || [],
            openingHours: place.opening_hours?.weekday_text || [],
            addressComponents: place.address_components || [],
          };
          
          setPlaceDetails(placeInfo);
          
          // Call onChange with URL if provided
          if (onChange) {
            onChange(url);
          }
          
          // Call onPlaceSelect callback if provided (for AdSet targeting)
          if (onPlaceSelect) {
            onPlaceSelect(placeInfo);
          }
        }
      });

      autocompleteRef.current = autocomplete;
    }
  }, [isScriptLoaded, onChange]);

  useEffect(() => {
    // Update input value when value prop changes
    if (value !== inputValue) {
      setInputValue(value || "");
    }
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
    
    // Clear place details if input is cleared
    if (!newValue) {
      setPlaceDetails(null);
      if (onPlaceSelect) {
        onPlaceSelect(null);
      }
    }
  };

  const handleClear = () => {
    setInputValue("");
    setPlaceDetails(null);
    if (onChange) {
      onChange("");
    }
    if (onPlaceSelect) {
      onPlaceSelect(null);
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  if (!apiKey) {
    // Fallback to regular input if API key is not available
    return (
      <div>
        <input
          ref={inputRef}
          type="url"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder || "Enter destination URL"}
          className={className || "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <FiMapPin className="w-5 h-5" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder || "Search for a place or enter URL"}
          className={`${className || "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"} pl-10 pr-10`}
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Place Details Display */}
      {placeDetails && showPlaceDetails && (
        <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-gray-900 text-lg">
              {placeDetails.name}
            </h4>
            {placeDetails.rating && (
              <div className="flex items-center gap-1 text-yellow-500">
                <span className="text-sm font-medium">
                  ⭐ {placeDetails.rating.toFixed(1)}
                </span>
                {placeDetails.totalRatings > 0 && (
                  <span className="text-xs text-gray-500">
                    ({placeDetails.totalRatings} reviews)
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2 text-sm text-gray-700">
            {placeDetails.address && (
              <div className="flex items-start gap-2">
                <FiMapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <span>{placeDetails.address}</span>
              </div>
            )}

            {placeDetails.phone && (
              <div>
                <span className="font-medium">Phone: </span>
                <a
                  href={`tel:${placeDetails.phone}`}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {placeDetails.phone}
                </a>
              </div>
            )}

            {placeDetails.website && (
              <div>
                <span className="font-medium">Website: </span>
                <a
                  href={placeDetails.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 break-all"
                >
                  {placeDetails.website}
                </a>
              </div>
            )}

            {placeDetails.location && (
              <div className="text-xs text-gray-500">
                <span className="font-medium">Coordinates: </span>
                {placeDetails.location.lat.toFixed(6)},{" "}
                {placeDetails.location.lng.toFixed(6)}
              </div>
            )}

            {placeDetails.types && placeDetails.types.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {placeDetails.types
                  .filter(
                    (type) =>
                      !type.includes("point_of_interest") &&
                      !type.includes("establishment")
                  )
                  .slice(0, 3)
                  .map((type, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                    >
                      {type.replace(/_/g, " ")}
                    </span>
                  ))}
              </div>
            )}

            {placeDetails.openingHours && placeDetails.openingHours.length > 0 && (
              <div className="mt-2 pt-2 border-t border-blue-200">
                <div className="font-medium text-xs text-gray-600 mb-1">
                  Opening Hours:
                </div>
                <div className="text-xs text-gray-600 space-y-0.5">
                  {placeDetails.openingHours.slice(0, 3).map((hours, index) => (
                    <div key={index}>{hours}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacesAutocomplete;

