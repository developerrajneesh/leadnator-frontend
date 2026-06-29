import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiImage, FiArrowLeft, FiPhone, FiLink, FiFileText, FiUpload, FiX, FiGlobe, FiThumbsUp, FiMessageCircle, FiShare2, FiMoreHorizontal, FiHeart, FiSend, FiBookmark } from "react-icons/fi";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import metaApi from "../lcmMetaApi";
import { adAPI } from "../lcmApi";
import axios from "axios";

// Get API base URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const API_BASE_URL = `${BACKEND_URL}/api/v1`;

export default function CallAdCreative() {
  const navigate = useNavigate();
  const location = useLocation();
  const previousData = location.state || {};
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    page_id: previousData.page_id || "",
    picture_url: "",
    business_page_url: "",
    phone_number: "",
    primary_text: "",
    headline: "",
    description: "",
  });
  const [pages, setPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageHash, setImageHash] = useState(null); // Meta image hash for the creative
  const [mediaType, setMediaType] = useState("image"); // "image" or "video"
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [videoThumbnail, setVideoThumbnail] = useState(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailImageHash, setThumbnailImageHash] = useState(null);
  const [activePlacement, setActivePlacement] = useState(0); // index into placements[]

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoadingPages(true);
      const response = await adAPI.getPages();
      if (response.data.success && response.data.pages?.data) {
        const pagesData = response.data.pages.data;
        setPages(pagesData);
        // Auto-select the first page if no page_id is set (and previousData doesn't have one)
        setFormData((prev) => {
          if (prev.page_id || previousData.page_id) {
            // Keep existing page_id or use previousData.page_id
            return {
              ...prev,
              page_id: prev.page_id || previousData.page_id,
            };
          } else if (pagesData.length > 0) {
            // Auto-select first page
            return {
              ...prev,
              page_id: pagesData[0].id,
            };
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
      alert("Failed to fetch Facebook pages. Please try again.");
    } finally {
      setLoadingPages(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image size should be less than 10MB");
      return;
    }

    setSelectedImage(file);
    setUploadingImage(true);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setImagePreview(base64String);

      try {
        // Upload the image to Meta (returns an image_hash to use in the creative).
        const adAccountId = localStorage.getItem("fb_ad_account_id") || localStorage.getItem("act_ad_account_id");
        if (!adAccountId) throw new Error("No Meta ad account selected. Connect your Meta account first.");

        const uploadResponse = await adAPI.uploadImage({
          adAccountId,
          imageBase64: base64String,
          pageId: formData.page_id || previousData.page_id,
        });

        if (uploadResponse.data.success && uploadResponse.data.imageHash) {
          setImageHash(uploadResponse.data.imageHash);
          console.log("✅ Image uploaded to Meta. Image Hash:", uploadResponse.data.imageHash);
        } else {
          throw new Error(uploadResponse.data.error || "Upload failed");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        alert(`Failed to upload image: ${error.response?.data?.error || error.message}`);
        // Reset on error
        setSelectedImage(null);
        setImagePreview(null);
        setImageHash(null);
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageHash(null);
    setFormData((prev) => ({
      ...prev,
      picture_url: "",
    }));
  };

  const handleVideoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Please select a video file");
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      alert("Video size should be less than 500MB");
      return;
    }

    setSelectedVideo(file);
    setVideoId(null);
    const objectUrl = URL.createObjectURL(file);
    setVideoPreview(objectUrl);
    setUploadingVideo(true);

    const uploadVideo = async () => {
      try {
        const adAccountId = localStorage.getItem("fb_ad_account_id") || localStorage.getItem("act_ad_account_id");
        const accessToken = localStorage.getItem("fb_access_token") || localStorage.getItem("fb_token");

        if (!adAccountId || !accessToken) {
          throw new Error("Missing ad account ID or access token");
        }

        const base64String = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const uploadResponse = await adAPI.uploadVideo({
          adAccountId,
          videoBase64: base64String,
          pageId: formData.page_id || previousData.page_id,
        });

        if (uploadResponse.data.success && uploadResponse.data.videoId) {
          setVideoId(uploadResponse.data.videoId);
          console.log("✅ Video uploaded successfully. Video ID:", uploadResponse.data.videoId);
        } else {
          throw new Error(uploadResponse.data.error || "Upload failed");
        }
      } catch (error) {
        console.error("Error uploading video:", error);
        alert(`Failed to upload video: ${error.response?.data?.error || error.message}`);
        setVideoId(null);
        if (videoPreview && videoPreview.startsWith('blob:')) {
          URL.revokeObjectURL(videoPreview);
        }
        setVideoPreview(null);
      } finally {
        setUploadingVideo(false);
      }
    };

    if (window.requestIdleCallback) {
      requestIdleCallback(uploadVideo, { timeout: 1000 });
    } else {
      setTimeout(uploadVideo, 0);
    }
  };

  const handleRemoveVideo = () => {
    if (videoPreview && videoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(videoPreview);
    }
    setSelectedVideo(null);
    setVideoPreview(null);
    setVideoId(null);
    handleRemoveThumbnail();
  };

  const handleThumbnailSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file for thumbnail");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Thumbnail image size should be less than 10MB");
      return;
    }

    setVideoThumbnail(file);
    setUploadingThumbnail(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;

      try {
        const adAccountId = localStorage.getItem("fb_ad_account_id") || localStorage.getItem("act_ad_account_id");
        const accessToken = localStorage.getItem("fb_access_token") || localStorage.getItem("fb_token");

        if (!adAccountId || !accessToken) {
          throw new Error("Missing ad account ID or access token");
        }

        const uploadResponse = await adAPI.uploadImage({
          adAccountId,
          imageBase64: base64String,
          pageId: formData.page_id || previousData.page_id,
        });

        if (uploadResponse.data.success && uploadResponse.data.imageHash) {
          setThumbnailImageHash(uploadResponse.data.imageHash);
          console.log("✅ Thumbnail uploaded successfully. Image Hash:", uploadResponse.data.imageHash);
        } else {
          throw new Error(uploadResponse.data.error || "Upload failed");
        }
      } catch (error) {
        console.error("Error uploading thumbnail:", error);
        alert(`Failed to upload thumbnail: ${error.response?.data?.error || error.message}`);
        setVideoThumbnail(null);
        setThumbnailImageHash(null);
      } finally {
        setUploadingThumbnail(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveThumbnail = () => {
    setVideoThumbnail(null);
    setThumbnailImageHash(null);
  };

  const handleMediaTypeChange = (type) => {
    setMediaType(type);
    if (type === "image") {
      handleRemoveVideo();
    } else {
      handleRemoveImage();
    }
  };

  useEffect(() => {
    return () => {
      if (videoPreview && videoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter ad creative name");
      return;
    }
    if (!formData.page_id.trim()) {
      alert("Please enter Page ID");
      return;
    }
    // Validate media based on type
    if (mediaType === "image" && !imageHash && !formData.picture_url.trim()) {
      alert("Please upload an image or enter Picture URL");
      return;
    }
    if (mediaType === "video" && !videoId) {
      alert("Please upload a video");
      return;
    }
    if (mediaType === "video" && !thumbnailImageHash) {
      alert("Please upload a thumbnail image for the video. Meta requires a thumbnail for video ads.");
      return;
    }
    if (!formData.business_page_url.trim()) {
      alert("Please enter Business Page URL");
      return;
    }
    if (!formData.phone_number.trim()) {
      alert("Please enter Phone Number");
      return;
    }
    if (!formData.primary_text.trim()) {
      alert("Please enter Primary Text");
      return;
    }
    if (!formData.headline.trim()) {
      alert("Please enter Headline");
      return;
    }
    if (formData.headline.length > 27) {
      alert("Headline must be 27 characters or less");
      return;
    }

    setLoading(true);
    try {
      const creativePayload = {
        name: formData.name,
        page_id: formData.page_id,
        business_page_url: formData.business_page_url,
        phone_number: formData.phone_number,
        primary_text: formData.primary_text,
        headline: formData.headline,
        description: formData.description || "",
      };

      // Add media based on type
      if (mediaType === "image") {
        if (imageHash) creativePayload.image_hash = imageHash;
        else creativePayload.picture_url = formData.picture_url;
      } else if (mediaType === "video") {
        creativePayload.video_id = videoId;
        if (thumbnailImageHash) {
          creativePayload.image_hash = thumbnailImageHash;
        }
      }

      const response = await metaApi.createCallAdCreative(creativePayload);

      navigate("/meta/create/call/launch", {
        state: {
          ...previousData,
          creative_id: response.data.id,
          credentials: previousData.credentials,
        },
      });
    } catch (error) {
      alert(`Error creating ad creative: ${error.message}`);
      console.error("Ad Creative creation error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ---- Live ad-preview helpers ----
  const selectedPage = pages.find((p) => p.id === formData.page_id);
  const pageName = selectedPage?.name || "Your Page";
  const pageInitial = (pageName.trim()[0] || "P").toUpperCase();
  const previewImage = mediaType === "image" ? (imagePreview || formData.picture_url) : null;
  const previewVideo = mediaType === "video" ? videoPreview : null;
  let previewDomain = "";
  try { previewDomain = formData.business_page_url ? new URL(formData.business_page_url).hostname.replace(/^www\./, "") : ""; } catch { previewDomain = formData.business_page_url; }

  // Build the placement tabs from what was selected in the Ad Set step.
  const pubPlatforms = previousData.publisher_platforms || [];
  const igPositions = previousData.instagram_positions || [];
  const hasPubData = pubPlatforms.length > 0;
  const wantFacebook = !hasPubData || pubPlatforms.includes("facebook");
  const wantInstagram = !hasPubData || pubPlatforms.includes("instagram");
  const igAllPositions = igPositions.length === 0; // none selected = all positions

  const placements = [];
  if (wantFacebook) placements.push({ id: "fb_feed", label: "Facebook Feed", platform: "facebook", format: "feed" });
  if (wantInstagram) {
    if (igAllPositions || igPositions.includes("stream") || igPositions.includes("explore")) placements.push({ id: "ig_feed", label: "Instagram Feed", platform: "instagram", format: "feed" });
    if (igAllPositions || igPositions.includes("story")) placements.push({ id: "ig_story", label: "Story", platform: "instagram", format: "story" });
    if (igAllPositions || igPositions.includes("reels")) placements.push({ id: "ig_reels", label: "Reels", platform: "instagram", format: "reels" });
  }
  if (placements.length === 0) placements.push({ id: "fb_feed", label: "Facebook Feed", platform: "facebook", format: "feed" });
  const placement = placements[Math.min(activePlacement, placements.length - 1)] || placements[0];

  return (
    <div className="py-4 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT — form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 flex-shrink-0">
                  <FiImage className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Create Ad Creative — Call Campaign</h1>
                  <p className="text-gray-500 text-sm mt-0.5">Create your ad creative with image and call-to-action</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/meta/create/call/adset", { state: previousData })}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-100 hover:text-gray-900 transition-all flex-shrink-0"
              >
                <FiArrowLeft className="w-4 h-4" /> Back
              </button>
            </div>

            {previousData.campaign_id && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6">
                <h3 className="font-semibold mb-2 text-gray-800 text-sm">Previous Steps Summary</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>Campaign ID:</strong> {previousData.campaign_id || "N/A"}</div>
                  {previousData.adset_id && (
                    <div><strong>Ad Set ID:</strong> {previousData.adset_id || "N/A"}</div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad Creative Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter ad creative name"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FiFileText /> Page ID <span className="text-red-500">*</span>
                </label>
                {loadingPages ? (
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <span className="text-gray-500">Loading pages...</span>
                  </div>
                ) : pages.length > 0 ? (
                  <select
                    name="page_id"
                    value={formData.page_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a Facebook Page</option>
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
                      name="page_id"
                      value={formData.page_id}
                      onChange={handleInputChange}
                      placeholder="Enter Facebook Page ID manually"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}
                <small className="text-gray-500 text-sm mt-1 block">Your Facebook Page ID where the ad will appear</small>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FiImage /> Media (Image or Video) <span className="text-red-500">*</span>
                </label>
                
                {/* Media Type Selection */}
                <div className="mb-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleMediaTypeChange("image")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      mediaType === "image"
                        ? "bg-orange-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Image
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMediaTypeChange("video")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      mediaType === "video"
                        ? "bg-orange-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Video
                  </button>
                </div>

                {/* Image Upload Section */}
                {mediaType === "image" && (
                <div className="space-y-3">
                  {!imagePreview && !imageHash && !formData.picture_url && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <FiUpload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Click to upload an image
                        </span>
                        <span className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 10MB
                        </span>
                      </label>
                    </div>
                  )}

                  {uploadingImage && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-blue-600 text-sm">Uploading image to Meta…</span>
                    </div>
                  )}

                  {(imageHash || formData.picture_url) && !uploadingImage && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <span className="text-green-600 text-sm">✓ Image uploaded successfully</span>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="ml-auto text-red-500 hover:text-red-700"
                        >
                          <FiX />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Manual URL input as fallback */}
                  {!imagePreview && !imageHash && !formData.picture_url && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">Or enter image URL manually:</p>
                      <input
                        type="url"
                        name="picture_url"
                        value={formData.picture_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
                )}

                {/* Video Upload Section */}
                {mediaType === "video" && (
                  <div className="space-y-3">
                    {!videoPreview && !videoId && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoSelect}
                          className="hidden"
                          id="video-upload"
                        />
                        <label
                          htmlFor="video-upload"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <FiUpload className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Click to upload a video
                          </span>
                          <span className="text-xs text-gray-500">
                            MP4, MOV, AVI up to 500MB
                          </span>
                        </label>
                      </div>
                    )}

                    {videoId && !uploadingVideo && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <span className="text-green-600 text-sm">✓ Video uploaded successfully (ID: {videoId})</span>
                          <button
                            type="button"
                            onClick={handleRemoveVideo}
                            className="ml-auto text-red-500 hover:text-red-700"
                          >
                            <FiX />
                          </button>
                        </div>
                      </div>
                    )}

                    {uploadingVideo && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-blue-600 text-sm">Uploading video to Meta... This may take a few minutes.</span>
                        </div>
                        <p className="text-xs text-blue-500 mt-1">Please wait, the page will remain responsive...</p>
                      </div>
                    )}

                    {/* Video Thumbnail Upload - Required by Meta API */}
                    {videoId && !uploadingVideo && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800 mb-2">
                          ⚠️ Video Thumbnail Required
                        </p>
                        <p className="text-xs text-yellow-700 mb-3">
                          Meta requires a thumbnail image for video ads. Please upload an image.
                        </p>
                        {!thumbnailImageHash && !videoThumbnail && (
                          <div className="border-2 border-dashed border-yellow-300 rounded-lg p-4 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleThumbnailSelect}
                              className="hidden"
                              id="thumbnail-upload"
                            />
                            <label
                              htmlFor="thumbnail-upload"
                              className="cursor-pointer flex flex-col items-center gap-2"
                            >
                              <FiUpload className="w-6 h-6 text-yellow-600" />
                              <span className="text-sm text-yellow-700">
                                Upload Thumbnail Image
                              </span>
                              <span className="text-xs text-yellow-600">
                                PNG, JPG up to 10MB
                              </span>
                            </label>
                          </div>
                        )}
                        {thumbnailImageHash && (
                          <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                            <span className="text-green-600 text-sm">✓ Thumbnail uploaded</span>
                            <button
                              type="button"
                              onClick={handleRemoveThumbnail}
                              className="ml-auto text-red-500 hover:text-red-700"
                            >
                              <FiX />
                            </button>
                          </div>
                        )}
                        {uploadingThumbnail && (
                          <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                            <span className="text-blue-600 text-xs">Uploading thumbnail...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Primary Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="primary_text"
                  value={formData.primary_text}
                  onChange={handleInputChange}
                  placeholder="Enter primary text for your ad"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-y"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">The main text that appears in your ad</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Headline <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="headline"
                  value={formData.headline}
                  onChange={handleInputChange}
                  placeholder="Enter headline for your ad"
                  maxLength={27}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Maximum 27 characters. Appears above the primary text</p>
                {formData.headline.length > 0 && (
                  <p className={`text-xs mt-1 ${formData.headline.length > 27 ? 'text-red-500' : 'text-gray-500'}`}>
                    {formData.headline.length}/27 characters
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description for your ad (optional)"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-y"
                />
                <p className="text-xs text-gray-500 mt-1">Additional text that appears below the headline (optional)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FiLink /> Business Page URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="business_page_url"
                  value={formData.business_page_url}
                  onChange={handleInputChange}
                  placeholder="https://yourbusiness.com"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
                <small className="text-gray-500 text-sm mt-1 block">URL of your business page or website</small>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FiPhone /> Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
                <small className="text-gray-500 text-sm mt-1 block">Phone number with country code (e.g., +1234567890)</small>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading || uploadingVideo}
                  className="px-7 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-sm shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? "Creating..." : uploadingVideo ? "Uploading Video..." : "Create Ad Creative"}
                </button>
              </div>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT — live ad preview */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <FiImage className="w-3.5 h-3.5" /> Ad Preview
            </div>

            {/* Placement tabs — based on Ad Set selection */}
            {placements.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {placements.map((p, i) => {
                  const PIcon = p.platform === "instagram" ? FaInstagram : FaFacebook;
                  const on = i === Math.min(activePlacement, placements.length - 1);
                  return (
                    <button key={p.id} type="button" onClick={() => setActivePlacement(i)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${on ? "bg-orange-500 border-orange-500 text-white shadow shadow-orange-500/30" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                      <PIcon className="w-3.5 h-3.5" /> {p.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* FEED preview (Facebook / Instagram) */}
            {placement.format === "feed" && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-2.5 p-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 grid place-items-center text-white font-bold flex-shrink-0">{pageInitial}</div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-gray-900 truncate flex items-center gap-1.5">
                      {pageName}
                      {placement.platform === "instagram" && <FaInstagram className="w-3.5 h-3.5 text-pink-500" />}
                    </div>
                    <div className="text-[11px] text-gray-500 flex items-center gap-1">Sponsored · <FiGlobe className="w-3 h-3" /></div>
                  </div>
                  <FiMoreHorizontal className="ml-auto text-gray-400" />
                </div>
                <div className="px-3 pb-2.5 text-sm text-gray-800 whitespace-pre-wrap break-words">
                  {formData.primary_text || <span className="text-gray-400">Your primary text will appear here…</span>}
                </div>
                <div className={`bg-gray-100 ${placement.platform === "instagram" ? "aspect-square" : "aspect-[1.91/1]"} flex items-center justify-center overflow-hidden`}>
                  {previewImage ? <img src={previewImage} alt="" className="w-full h-full object-cover" />
                    : previewVideo ? <video src={previewVideo} className="w-full h-full object-cover" muted />
                    : <div className="text-gray-400 flex flex-col items-center gap-1.5"><FiImage className="w-8 h-8" /><span className="text-xs">Your image / video preview</span></div>}
                </div>
                {placement.platform === "instagram" ? (
                  <>
                    <div className="flex items-center gap-4 px-3 pt-2.5 text-gray-800">
                      <FiHeart className="w-5 h-5" /><FiMessageCircle className="w-5 h-5" /><FiSend className="w-5 h-5" /><FiBookmark className="w-5 h-5 ml-auto" />
                    </div>
                    <div className="px-3 py-2">
                      <button type="button" className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-100 text-gray-800 text-sm font-semibold"><FiPhone className="w-3.5 h-3.5" /> Call Now</button>
                      <div className="text-sm mt-1.5 truncate"><span className="font-semibold">{(pageName || "").toLowerCase().replace(/\s+/g, "")}</span> <span className="text-gray-800">{formData.headline || "Your headline appears here"}</span></div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 bg-gray-50 border-y border-gray-100 px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] text-gray-500 uppercase truncate">{previewDomain || "yourbusiness.com"}</div>
                        <div className="font-semibold text-sm text-gray-900 truncate">{formData.headline || "Your headline appears here"}</div>
                        {formData.description && <div className="text-xs text-gray-500 truncate">{formData.description}</div>}
                      </div>
                      <button type="button" className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-200 text-gray-800 text-sm font-semibold"><FiPhone className="w-3.5 h-3.5" /> Call Now</button>
                    </div>
                    <div className="flex items-center justify-around px-3 py-2 text-gray-500 text-sm">
                      <span className="flex items-center gap-1.5"><FiThumbsUp className="w-4 h-4" /> Like</span>
                      <span className="flex items-center gap-1.5"><FiMessageCircle className="w-4 h-4" /> Comment</span>
                      <span className="flex items-center gap-1.5"><FiShare2 className="w-4 h-4" /> Share</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STORY / REELS preview (vertical 9:16) */}
            {(placement.format === "story" || placement.format === "reels") && (
              <div className="relative mx-auto rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-gray-900" style={{ aspectRatio: "9 / 16", maxWidth: 300 }}>
                {previewImage ? <img src={previewImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  : previewVideo ? <video src={previewVideo} className="absolute inset-0 w-full h-full object-cover" muted />
                  : <div className="absolute inset-0 flex items-center justify-center text-gray-500"><div className="flex flex-col items-center gap-1.5"><FiImage className="w-10 h-10" /><span className="text-xs">Your image / video</span></div></div>}
                <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/50 to-transparent flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 grid place-items-center text-white text-xs font-bold ring-2 ring-white/70">{pageInitial}</div>
                  <span className="text-white text-xs font-semibold drop-shadow">{pageName}</span>
                  <span className="text-white/70 text-[10px]">Sponsored</span>
                  {placement.format === "reels" && <FaInstagram className="w-3.5 h-3.5 text-white ml-auto" />}
                </div>
                {formData.primary_text && (
                  <div className="absolute left-0 right-0 bottom-24 px-3">
                    <p className="text-white text-sm drop-shadow line-clamp-3">{formData.primary_text}</p>
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <button type="button" className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/95 text-gray-900 text-sm font-bold">
                    <FiPhone className="w-4 h-4" /> Call Now
                  </button>
                  {(formData.headline || previewDomain) && (
                    <div className="text-center text-white/90 text-[11px] mt-1.5 drop-shadow truncate">{formData.headline || previewDomain}</div>
                  )}
                </div>
              </div>
            )}

            <p className="text-[11px] text-gray-400 mt-2 text-center">Representative preview — actual placement may vary.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

