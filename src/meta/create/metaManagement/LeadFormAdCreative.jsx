import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiImage, FiArrowLeft, FiFileText, FiHash, FiType, FiAlignLeft, FiUpload, FiX } from "react-icons/fi";
import metaApi from "../lcmMetaApi";
import { adAPI } from "../lcmApi";
import axios from "axios";

// Get API base URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const API_BASE_URL = `${BACKEND_URL}/api/v1`;

export default function LeadFormAdCreative() {
  const navigate = useNavigate();
  const location = useLocation();
  const previousData = location.state || {};
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [mediaType, setMediaType] = useState("image"); // "image" or "video"
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [videoThumbnail, setVideoThumbnail] = useState(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailImageHash, setThumbnailImageHash] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    page_id: previousData.page_id || "",
    picture_url: "",
    business_page_url: "",
    headline: "",
    description: "",
  });

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
        // Auto-select the first page if no page_id is set
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
        // Upload to S3 automatically
        const response = await axios.post(
          `${API_BASE_URL}/ads/upload-image-s3`,
          {
            imageBase64: base64String,
          }
        );

        if (response.data.success && response.data.url) {
          setFormData((prev) => ({
            ...prev,
            picture_url: response.data.url,
          }));
        } else {
          throw new Error("Upload failed");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        alert(`Failed to upload image: ${error.response?.data?.error || error.message}`);
        // Reset on error
        setSelectedImage(null);
        setImagePreview(null);
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
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
    if (mediaType === "image" && !formData.picture_url.trim()) {
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
        primary_text: formData.primary_text,
        headline: formData.headline,
        description: formData.description || "",
      };

      // Add media based on type
      if (mediaType === "image") {
        creativePayload.picture_url = formData.picture_url;
      } else if (mediaType === "video") {
        creativePayload.video_id = videoId;
        if (thumbnailImageHash) {
          creativePayload.image_hash = thumbnailImageHash;
        }
      }

      // Add leadgen_form_id if available from previous step (campaign/form creation)
      if (previousData.leadgen_form_id) {
        creativePayload.leadgen_form_id = previousData.leadgen_form_id;
        console.log('✅ Adding leadgen_form_id to creative payload:', previousData.leadgen_form_id);
      } else {
        console.warn('⚠️ WARNING: leadgen_form_id not found in previousData:', previousData);
      }

      console.log('📤 Creative Payload:', creativePayload);
      const response = await metaApi.createLeadFormAdCreative(creativePayload);

      console.log("Ad Creative created:", response.data);

      navigate("/meta/create/lead-form/launch", {
        state: {
          ...previousData,
          creative_id: response.data.id,
          page_id: formData.page_id,
        },
      });
    } catch (error) {
      alert(`Error creating ad creative: ${error.message}`);
      console.error("Ad Creative creation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/meta/create/lead-form/adset", { state: previousData })}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <FiImage className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Ad Creative - Lead Form Campaign</h1>
              <p className="text-gray-600 mt-1">Create your ad creative with image and lead form call-to-action</p>
            </div>
          </div>

          {previousData.campaign_id && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Previous Steps Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="text-gray-500 text-xs mb-1">Campaign ID</div>
                  <div className="text-gray-900 font-semibold">{previousData.campaign_id || "N/A"}</div>
                </div>
                {previousData.adset_id && (
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-gray-500 text-xs mb-1">Ad Set ID</div>
                    <div className="text-gray-900 font-semibold">{previousData.adset_id || "N/A"}</div>
                  </div>
                )}
                {previousData.leadgen_form_id && (
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-gray-500 text-xs mb-1">Lead Form ID</div>
                    <div className="text-gray-900 font-semibold">{previousData.leadgen_form_id || "N/A"}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Two-column layout when image is uploaded, single column when not */}
            <div className={`grid gap-6 ${((mediaType === "image" && (imagePreview || formData.picture_url)) || 
              (mediaType === "video" && (videoPreview || videoId))) ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Form Fields Column */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                    Ad Creative Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter ad creative name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="page_id" className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiHash className="w-4 h-4" />
                    Facebook Page <span className="text-red-500">*</span>
                  </label>
                  {loadingPages ? (
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                      <span className="text-gray-500">Loading pages...</span>
                    </div>
                  ) : pages.length > 0 ? (
                    <select
                      id="page_id"
                      name="page_id"
                      value={formData.page_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                        id="page_id"
                        name="page_id"
                        value={formData.page_id}
                        onChange={handleInputChange}
                        placeholder="Enter Facebook Page ID manually"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        required
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500">Select the Facebook Page where the ad will appear</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="picture_url" className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiImage className="w-4 h-4" />
                    Media (Image or Video) <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Media Type Selection */}
                  <div className="mb-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleMediaTypeChange("image")}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        mediaType === "image"
                          ? "bg-blue-600 text-white"
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
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Video
                    </button>
                  </div>
                  
                  {/* Image Upload Section */}
                  {mediaType === "image" && (
                  <div className="space-y-3">
                    {!imagePreview && !formData.picture_url && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
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

                    {formData.picture_url && !uploadingImage && (
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
                    {!imagePreview && !formData.picture_url && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">Or enter image URL manually:</p>
                        <input
                          type="url"
                          id="picture_url"
                          name="picture_url"
                          value={formData.picture_url}
                          onChange={handleInputChange}
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    )}
                  </div>
                  )}

                  {/* Video Upload Section */}
                  {mediaType === "video" && (
                    <div className="space-y-3">
                      {!videoPreview && !videoId && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
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

                <div className="space-y-2">
                  <label htmlFor="primary_text" className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    Primary Text <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="primary_text"
                    name="primary_text"
                    value={formData.primary_text}
                    onChange={handleInputChange}
                    placeholder="Enter primary text for your ad"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
                    required
                  />
                  <p className="text-xs text-gray-500">The main text that appears in your ad</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="headline" className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiType className="w-4 h-4" />
                    Headline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="headline"
                    name="headline"
                    value={formData.headline}
                    onChange={handleInputChange}
                    maxLength={27}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter headline for your ad"
                    required
                  />
                  <p className="text-xs text-gray-500">Maximum 27 characters. Appears above the primary text</p>
                  {formData.headline.length > 0 && (
                    <p className={`text-xs mt-1 ${formData.headline.length > 27 ? 'text-red-500' : 'text-gray-500'}`}>
                      {formData.headline.length}/27 characters
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FiAlignLeft className="w-4 h-4" />
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
                    placeholder="Enter description for your ad (optional)"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500">Additional text that appears below the headline (optional)</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="business_page_url" className="block text-sm font-semibold text-gray-700">
                    Business Page URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    id="business_page_url"
                    name="business_page_url"
                    value={formData.business_page_url}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="https://yourbusiness.com"
                    required
                  />
                  <p className="text-xs text-gray-500">URL of your business page or website</p>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading || uploadingVideo}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Creating...
                      </>
                    ) : uploadingVideo ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Uploading Video...
                      </>
                    ) : (
                      <>
                        Create Ad Creative
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Media Preview Column - Only shown when media is uploaded */}
              {((mediaType === "image" && (imagePreview || formData.picture_url)) || 
                (mediaType === "video" && (videoPreview || videoId))) && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FiImage className="w-4 h-4" /> {mediaType === "image" ? "Image" : "Video"} Preview
                    </label>
                    <div className="relative flex items-center justify-center bg-gray-50 rounded-lg border border-gray-300 p-4 min-h-[300px]">
                      {mediaType === "image" ? (
                        <>
                          {imagePreview ? (
                            <>
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="max-w-full max-h-[400px] object-contain rounded-lg"
                              />
                              {uploadingImage && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                  <div className="text-white text-center">
                                    <div className="animate-spin mb-2">⏳</div>
                                    <div className="text-sm">Uploading to AWS...</div>
                                  </div>
                                </div>
                              )}
                              {!uploadingImage && (
                                <button
                                  type="button"
                                  onClick={handleRemoveImage}
                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                                >
                                  <FiX className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          ) : formData.picture_url ? (
                            <img
                              src={formData.picture_url}
                              alt="Preview"
                              className="max-w-full max-h-[400px] object-contain rounded-lg"
                            />
                          ) : null}
                        </>
                      ) : (
                        <>
                          {videoPreview ? (
                            <>
                              <video
                                src={videoPreview}
                                controls
                                className="max-w-full max-h-[400px] rounded-lg"
                              />
                              {uploadingVideo && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center z-10">
                                  <div className="text-white text-center bg-gray-800 p-4 rounded-lg">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                                    <div className="text-sm">Uploading to Meta...</div>
                                    <div className="text-xs text-gray-300 mt-1">This may take a few minutes</div>
                                  </div>
                                </div>
                              )}
                              {!uploadingVideo && videoId && (
                                <button
                                  type="button"
                                  onClick={handleRemoveVideo}
                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                                >
                                  <FiX className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          ) : videoId ? (
                            <div className="text-center">
                              <div className="text-green-600 mb-2">✓ Video uploaded</div>
                              <div className="text-sm text-gray-500">Video ID: {videoId}</div>
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

