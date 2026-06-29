import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiImage, FiArrowLeft, FiArrowRight, FiFileText, FiUpload, FiX, FiGlobe, FiThumbsUp, FiMessageCircle, FiShare2, FiHeart, FiSend, FiBookmark, FiMoreHorizontal, FiClipboard } from "react-icons/fi";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import metaApi from "../lcmMetaApi";
import { adAPI } from "../lcmApi";

export default function LeadFormAdCreative() {
  const navigate = useNavigate();
  const location = useLocation();
  const previousData = location.state || {};
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    page_id: previousData.page_id || "",
    picture_url: "",
    business_page_url: "",
    primary_text: "",
    headline: "",
    description: "",
  });
  const [pages, setPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageHash, setImageHash] = useState(null);
  const [mediaType, setMediaType] = useState("image");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [videoThumbnail, setVideoThumbnail] = useState(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailImageHash, setThumbnailImageHash] = useState(null);
  const [activePlacement, setActivePlacement] = useState(0);

  useEffect(() => { fetchPages(); }, []);

  const fetchPages = async () => {
    try {
      setLoadingPages(true);
      const response = await adAPI.getPages();
      if (response.data.success && response.data.pages?.data) {
        const pagesData = response.data.pages.data;
        setPages(pagesData);
        setFormData((prev) => {
          if (prev.page_id || previousData.page_id) return { ...prev, page_id: prev.page_id || previousData.page_id };
          if (pagesData.length > 0) return { ...prev, page_id: pagesData[0].id };
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select an image file"); return; }
    if (file.size > 10 * 1024 * 1024) { alert("Image size should be less than 10MB"); return; }

    setSelectedImage(file);
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setImagePreview(base64String);
      try {
        const adAccountId = localStorage.getItem("fb_ad_account_id") || localStorage.getItem("act_ad_account_id");
        if (!adAccountId) throw new Error("No Meta ad account selected. Connect your Meta account first.");
        const uploadResponse = await adAPI.uploadImage({
          adAccountId,
          imageBase64: base64String,
          pageId: formData.page_id || previousData.page_id,
        });
        if (uploadResponse.data.success && uploadResponse.data.imageHash) {
          setImageHash(uploadResponse.data.imageHash);
        } else {
          throw new Error(uploadResponse.data.error || "Upload failed");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        alert(`Failed to upload image: ${error.response?.data?.error || error.message}`);
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
    setFormData((prev) => ({ ...prev, picture_url: "" }));
  };

  const handleVideoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) { alert("Please select a video file"); return; }
    if (file.size > 500 * 1024 * 1024) { alert("Video size should be less than 500MB"); return; }

    setSelectedVideo(file);
    setVideoId(null);
    const objectUrl = URL.createObjectURL(file);
    setVideoPreview(objectUrl);
    setUploadingVideo(true);

    const uploadVideo = async () => {
      try {
        const adAccountId = localStorage.getItem("fb_ad_account_id") || localStorage.getItem("act_ad_account_id");
        const accessToken = localStorage.getItem("fb_access_token") || localStorage.getItem("fb_token");
        if (!adAccountId || !accessToken) throw new Error("Missing ad account ID or access token");

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
        } else {
          throw new Error(uploadResponse.data.error || "Upload failed");
        }
      } catch (error) {
        console.error("Error uploading video:", error);
        alert(`Failed to upload video: ${error.response?.data?.error || error.message}`);
        setVideoId(null);
        if (videoPreview && videoPreview.startsWith("blob:")) URL.revokeObjectURL(videoPreview);
        setVideoPreview(null);
      } finally {
        setUploadingVideo(false);
      }
    };

    if (window.requestIdleCallback) requestIdleCallback(uploadVideo, { timeout: 1000 });
    else setTimeout(uploadVideo, 0);
  };

  const handleRemoveVideo = () => {
    if (videoPreview && videoPreview.startsWith("blob:")) URL.revokeObjectURL(videoPreview);
    setSelectedVideo(null);
    setVideoPreview(null);
    setVideoId(null);
    handleRemoveThumbnail();
  };

  const handleThumbnailSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select an image file for thumbnail"); return; }
    if (file.size > 10 * 1024 * 1024) { alert("Thumbnail image size should be less than 10MB"); return; }

    setVideoThumbnail(file);
    setUploadingThumbnail(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      try {
        const adAccountId = localStorage.getItem("fb_ad_account_id") || localStorage.getItem("act_ad_account_id");
        if (!adAccountId) throw new Error("Missing ad account ID");
        const uploadResponse = await adAPI.uploadImage({
          adAccountId,
          imageBase64: base64String,
          pageId: formData.page_id || previousData.page_id,
        });
        if (uploadResponse.data.success && uploadResponse.data.imageHash) {
          setThumbnailImageHash(uploadResponse.data.imageHash);
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
    if (type === "image") handleRemoveVideo();
    else handleRemoveImage();
  };

  useEffect(() => {
    return () => { if (videoPreview && videoPreview.startsWith("blob:")) URL.revokeObjectURL(videoPreview); };
  }, [videoPreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { alert("Please enter ad creative name"); return; }
    if (!formData.page_id.trim()) { alert("Please enter Page ID"); return; }
    if (mediaType === "image" && !imageHash && !formData.picture_url.trim()) { alert("Please upload an image or enter Picture URL"); return; }
    if (mediaType === "video" && !videoId) { alert("Please upload a video"); return; }
    if (mediaType === "video" && !thumbnailImageHash) { alert("Please upload a thumbnail image for the video. Meta requires a thumbnail for video ads."); return; }
    if (!formData.business_page_url.trim()) { alert("Please enter Business Page URL"); return; }
    if (!formData.primary_text.trim()) { alert("Please enter Primary Text"); return; }
    if (!formData.headline.trim()) { alert("Please enter Headline"); return; }
    if (formData.headline.length > 27) { alert("Headline must be 27 characters or less"); return; }

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
      if (mediaType === "image") {
        if (imageHash) creativePayload.image_hash = imageHash;
        else creativePayload.picture_url = formData.picture_url;
      } else if (mediaType === "video") {
        creativePayload.video_id = videoId;
        if (thumbnailImageHash) creativePayload.image_hash = thumbnailImageHash;
      }
      if (previousData.leadgen_form_id) creativePayload.leadgen_form_id = previousData.leadgen_form_id;

      const response = await metaApi.createLeadFormAdCreative(creativePayload);

      navigate("/meta/create/lead-form/launch", {
        state: { ...previousData, creative_id: response.data.id, page_id: formData.page_id },
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

  const pubPlatforms = previousData.publisher_platforms || [];
  const igPositions = previousData.instagram_positions || [];
  const hasPubData = pubPlatforms.length > 0;
  const wantFacebook = !hasPubData || pubPlatforms.includes("facebook");
  const wantInstagram = !hasPubData || pubPlatforms.includes("instagram");
  const igAllPositions = igPositions.length === 0;

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
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                  <FiClipboard className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Create Ad Creative — Lead Form</h1>
                  <p className="text-gray-500 text-sm mt-0.5">Design the ad that opens your instant lead form</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/meta/create/lead-form/adset", { state: previousData })}
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
                  {previousData.adset_id && <div><strong>Ad Set ID:</strong> {previousData.adset_id}</div>}
                  {previousData.leadgen_form_id && <div><strong>Lead Form ID:</strong> {previousData.leadgen_form_id}</div>}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ad Creative Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <FiFileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter ad creative name" required
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Facebook Page <span className="text-red-500">*</span></label>
                  {loadingPages ? (
                    <div className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/60"><span className="text-gray-500">Loading pages...</span></div>
                  ) : pages.length > 0 ? (
                    <select name="page_id" value={formData.page_id} onChange={handleInputChange} required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Select a Facebook Page</option>
                      {pages.map((page) => (<option key={page.id} value={page.id}>{page.name} ({page.id})</option>))}
                    </select>
                  ) : (
                    <input type="text" name="page_id" value={formData.page_id} onChange={handleInputChange} placeholder="Enter Facebook Page ID manually" required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  )}
                  <small className="text-gray-500 text-xs mt-1 block">Your Facebook Page where the ad will appear</small>
                </div>

                {/* Media */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><FiImage /> Media (Image or Video) <span className="text-red-500">*</span></label>
                  <div className="mb-4 flex gap-2">
                    <button type="button" onClick={() => handleMediaTypeChange("image")} className={`px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${mediaType === "image" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>Image</button>
                    <button type="button" onClick={() => handleMediaTypeChange("video")} className={`px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${mediaType === "video" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>Video</button>
                  </div>

                  {mediaType === "image" && (
                    <div className="space-y-3">
                      {!imagePreview && !imageHash && !formData.picture_url && (
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                          <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" id="image-upload" />
                          <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                            <FiUpload className="w-8 h-8 text-gray-400" />
                            <span className="text-sm text-gray-600">Click to upload an image</span>
                            <span className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</span>
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
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <span className="text-green-600 text-sm">✓ Image uploaded successfully</span>
                          <button type="button" onClick={handleRemoveImage} className="ml-auto text-red-500 hover:text-red-700"><FiX /></button>
                        </div>
                      )}
                      {!imagePreview && !imageHash && !formData.picture_url && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-2">Or enter image URL manually:</p>
                          <input type="url" name="picture_url" value={formData.picture_url} onChange={handleInputChange} placeholder="https://example.com/image.jpg"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                        </div>
                      )}
                    </div>
                  )}

                  {mediaType === "video" && (
                    <div className="space-y-3">
                      {!videoPreview && !videoId && (
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                          <input type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" id="video-upload" />
                          <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-2">
                            <FiUpload className="w-8 h-8 text-gray-400" />
                            <span className="text-sm text-gray-600">Click to upload a video</span>
                            <span className="text-xs text-gray-500">MP4, MOV, AVI up to 500MB</span>
                          </label>
                        </div>
                      )}
                      {videoId && !uploadingVideo && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <span className="text-green-600 text-sm">✓ Video uploaded successfully</span>
                          <button type="button" onClick={handleRemoveVideo} className="ml-auto text-red-500 hover:text-red-700"><FiX /></button>
                        </div>
                      )}
                      {uploadingVideo && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-blue-600 text-sm">Uploading video to Meta… This may take a few minutes.</span>
                        </div>
                      )}
                      {videoId && !uploadingVideo && (
                        <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                          <p className="text-sm font-medium text-yellow-800 mb-2">⚠️ Video Thumbnail Required</p>
                          {!thumbnailImageHash && !videoThumbnail && (
                            <div className="border-2 border-dashed border-yellow-300 rounded-lg p-4 text-center">
                              <input type="file" accept="image/*" onChange={handleThumbnailSelect} className="hidden" id="thumbnail-upload" />
                              <label htmlFor="thumbnail-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                <FiUpload className="w-6 h-6 text-yellow-600" />
                                <span className="text-sm text-yellow-700">Upload Thumbnail Image</span>
                              </label>
                            </div>
                          )}
                          {thumbnailImageHash && (
                            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                              <span className="text-green-600 text-sm">✓ Thumbnail uploaded</span>
                              <button type="button" onClick={handleRemoveThumbnail} className="ml-auto text-red-500 hover:text-red-700"><FiX /></button>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><FiGlobe /> Business Page URL <span className="text-red-500">*</span></label>
                  <input type="url" name="business_page_url" value={formData.business_page_url} onChange={handleInputChange} placeholder="https://yourbusiness.com" required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Text <span className="text-red-500">*</span></label>
                  <textarea name="primary_text" value={formData.primary_text} onChange={handleInputChange} placeholder="Enter primary text for your ad" rows={4} required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y" />
                  <p className="text-xs text-gray-500 mt-1">The main text that appears in your ad</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Headline <span className="text-red-500">*</span></label>
                  <input type="text" name="headline" value={formData.headline} onChange={handleInputChange} placeholder="Enter headline for your ad" maxLength={27} required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  <p className="text-xs text-gray-500 mt-1">Max 27 characters. {formData.headline.length > 0 && <span className={formData.headline.length > 27 ? "text-red-500" : ""}>{formData.headline.length}/27</span>}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Enter description for your ad (optional)" rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y" />
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={loading || uploadingVideo}
                    className="px-7 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                    {loading ? "Creating..." : uploadingVideo ? "Uploading Video..." : <>Create Ad Creative <FiArrowRight /></>}
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

            {placements.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {placements.map((p, i) => {
                  const PIcon = p.platform === "instagram" ? FaInstagram : FaFacebookF;
                  const on = i === Math.min(activePlacement, placements.length - 1);
                  return (
                    <button key={p.id} type="button" onClick={() => setActivePlacement(i)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${on ? "bg-blue-600 border-blue-600 text-white shadow shadow-blue-500/30" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                      <PIcon className="w-3.5 h-3.5" /> {p.label}
                    </button>
                  );
                })}
              </div>
            )}

            {placement.format === "feed" && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-2.5 p-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 grid place-items-center text-white font-bold flex-shrink-0">{pageInitial}</div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-gray-900 truncate flex items-center gap-1.5">{pageName}{placement.platform === "instagram" && <FaInstagram className="w-3.5 h-3.5 text-pink-500" />}</div>
                    <div className="text-[11px] text-gray-500 flex items-center gap-1">Sponsored · <FiGlobe className="w-3 h-3" /></div>
                  </div>
                  <FiMoreHorizontal className="ml-auto text-gray-400" />
                </div>
                <div className="px-3 pb-2.5 text-sm text-gray-800 whitespace-pre-wrap break-words">{formData.primary_text || <span className="text-gray-400">Your primary text will appear here…</span>}</div>
                <div className={`bg-gray-100 ${placement.platform === "instagram" ? "aspect-square" : "aspect-[1.91/1]"} flex items-center justify-center overflow-hidden`}>
                  {previewImage ? <img src={previewImage} alt="" className="w-full h-full object-cover" />
                    : previewVideo ? <video src={previewVideo} className="w-full h-full object-cover" muted />
                    : <div className="text-gray-400 flex flex-col items-center gap-1.5"><FiImage className="w-8 h-8" /><span className="text-xs">Your image / video preview</span></div>}
                </div>
                {placement.platform === "instagram" ? (
                  <>
                    <div className="flex items-center gap-4 px-3 pt-2.5 text-gray-800"><FiHeart className="w-5 h-5" /><FiMessageCircle className="w-5 h-5" /><FiSend className="w-5 h-5" /><FiBookmark className="w-5 h-5 ml-auto" /></div>
                    <div className="px-3 py-2">
                      <button type="button" className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold">Sign Up <FiArrowRight className="w-3.5 h-3.5" /></button>
                      <div className="text-sm mt-1.5 truncate"><span className="font-semibold">{(pageName || "").toLowerCase().replace(/\s+/g, "")}</span> <span className="text-gray-800">{formData.headline || "Your headline appears here"}</span></div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 bg-gray-50 border-y border-gray-100 px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] text-gray-500 uppercase truncate">Instant form</div>
                        <div className="font-semibold text-sm text-gray-900 truncate">{formData.headline || "Your headline appears here"}</div>
                        {formData.description && <div className="text-xs text-gray-500 truncate">{formData.description}</div>}
                      </div>
                      <button type="button" className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-semibold">Sign Up</button>
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

            {(placement.format === "story" || placement.format === "reels") && (
              <div className="relative mx-auto rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-gray-900" style={{ aspectRatio: "9 / 16", maxWidth: 300 }}>
                {previewImage ? <img src={previewImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  : previewVideo ? <video src={previewVideo} className="absolute inset-0 w-full h-full object-cover" muted />
                  : <div className="absolute inset-0 flex items-center justify-center text-gray-500"><div className="flex flex-col items-center gap-1.5"><FiImage className="w-10 h-10" /><span className="text-xs">Your image / video</span></div></div>}
                <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/50 to-transparent flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 grid place-items-center text-white text-xs font-bold ring-2 ring-white/70">{pageInitial}</div>
                  <span className="text-white text-xs font-semibold drop-shadow">{pageName}</span>
                  <span className="text-white/70 text-[10px]">Sponsored</span>
                  {placement.format === "reels" && <FaInstagram className="w-3.5 h-3.5 text-white ml-auto" />}
                </div>
                {formData.primary_text && (<div className="absolute left-0 right-0 bottom-24 px-3"><p className="text-white text-sm drop-shadow line-clamp-3">{formData.primary_text}</p></div>)}
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <button type="button" className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/95 text-gray-900 text-sm font-bold">Sign Up <FiArrowRight className="w-4 h-4" /></button>
                  {formData.headline && (<div className="text-center text-white/90 text-[11px] mt-1.5 drop-shadow truncate">{formData.headline}</div>)}
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
