import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiSend, FiArrowLeft, FiTag, FiLayout, FiShield, FiLock, FiExternalLink, FiFileText, FiBell, FiHome } from "react-icons/fi";
import { FaBullhorn } from "react-icons/fa";
import Confetti from "react-confetti";
import metaApi from "../lcmMetaApi";

function RocketClouds() {
  return (
    <div className="pointer-events-none select-none absolute right-3 bottom-0 w-40 h-24">
      <svg viewBox="0 0 48 60" className="absolute right-16 bottom-7 w-11 h-14 drop-shadow-md" style={{ animation: "ln-float 3s ease-in-out infinite" }}>
        <path d="M24 50c-3 6-9 6-9 6s3-7 6-9z" fill="#fdba74" />
        <path d="M24 3c8 7 11 22 8 38H16C13 25 16 10 24 3z" fill="#e0e7ff" />
        <path d="M24 3c4 4 6 9 6.5 13H17.5C18 12 20 7 24 3z" fill="#6366f1" />
        <circle cx="24" cy="22" r="4.5" fill="#38bdf8" stroke="#fff" strokeWidth="1.6" />
        <path d="M16 36l-6 11 6-5z" fill="#3b82f6" />
        <path d="M32 36l6 11-6-5z" fill="#3b82f6" />
        <path d="M21 47c1.5 5 4.5 5 6 0-1-2.5-5-2.5-6 0z" fill="#fbbf24" />
      </svg>
      <span className="absolute bottom-0 right-2 w-24 h-9 bg-white rounded-full shadow-sm" />
      <span className="absolute bottom-0 right-16 w-16 h-8 bg-white/95 rounded-full" />
      <span className="absolute bottom-1 right-0 w-14 h-7 bg-white/80 rounded-full" />
      <span className="absolute bottom-2 right-24 w-12 h-6 bg-white/70 rounded-full" />
    </div>
  );
}

function SummaryCard({ icon, color, label, value }) {
  return (
    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm">
      <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}1a`, color }}>{icon}</span>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</div>
        <div className="text-sm font-bold text-gray-900 truncate">{value || "N/A"}</div>
      </div>
    </div>
  );
}

export default function LeadFormLaunch() {
  const navigate = useNavigate();
  const location = useLocation();
  const previousData = location.state || {};
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [adId, setAdId] = useState(null);
  const [adName, setAdName] = useState("");
  const [webhookOk, setWebhookOk] = useState(null); // null = unknown, true/false after attempt
  const [showConfetti, setShowConfetti] = useState(false);
  const [winSize, setWinSize] = useState({ w: typeof window !== "undefined" ? window.innerWidth : 1200, h: typeof window !== "undefined" ? window.innerHeight : 800 });

  useEffect(() => {
    const onResize = () => setWinSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLaunch = async () => {
    if (!adName.trim()) { alert("Please enter an ad name."); return; }
    if (!previousData.adset_id || !previousData.creative_id) {
      alert("Ad Set ID or Creative ID is missing. Please complete previous steps.");
      return;
    }
    setLoading(true);
    try {
      const adPayload = {
        name: adName,
        adset_id: previousData.adset_id,
        creative_id: previousData.creative_id,
        leadgen_form_id: previousData.leadgen_form_id,
        status: "ACTIVE",
      };
      const response = await metaApi.createLeadFormAd(adPayload);
      setAdId(response.data.id);

      // Auto-subscribe the page to lead webhooks so leads flow straight into the app —
      // no extra screen needed. A failure here shouldn't block the success state.
      const pageId = previousData.page_id;
      if (pageId) {
        try {
          await metaApi.subscribePageToWebhooks(pageId);
          setWebhookOk(true);
        } catch (e) {
          console.error("Auto webhook subscription failed:", e);
          setWebhookOk(false);
        }
      }

      setSuccess(true);
      setShowConfetti(true);
    } catch (error) {
      alert(`Error launching ad: ${error.message}`);
      console.error("Ad creation error:", error);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-4 px-4 sm:px-6 max-w-2xl mx-auto">
        <style>{`
          @keyframes ln-pop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
          @keyframes ln-draw{to{stroke-dashoffset:0}}
          @keyframes ln-ring{0%{transform:scale(.75);opacity:.6}100%{transform:scale(1.7);opacity:0}}
          @keyframes ln-rise{0%{transform:translateY(10px);opacity:0}100%{transform:translateY(0);opacity:1}}
        `}</style>
        {showConfetti && (
          <Confetti width={winSize.w} height={winSize.h} numberOfPieces={400} recycle={false} gravity={0.22} tweenDuration={6500}
            onConfettiComplete={() => setShowConfetti(false)} style={{ position: "fixed", inset: 0, zIndex: 60, pointerEvents: "none" }} />
        )}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="relative w-28 h-28 mx-auto mb-5">
            <span className="absolute inset-2 rounded-full bg-blue-300" style={{ animation: "ln-ring 1.6s ease-out .3s infinite" }} />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 to-indigo-50" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 grid place-items-center shadow-lg shadow-blue-500/40" style={{ animation: "ln-pop .55s cubic-bezier(.18,1.25,.4,1) both" }}>
                <svg viewBox="0 0 52 52" className="w-9 h-9">
                  <path fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" d="M14 27l8 8 16-16"
                    style={{ strokeDasharray: 48, strokeDashoffset: 48, animation: "ln-draw .45s ease-out .5s forwards" }} />
                </svg>
              </div>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5" style={{ animation: "ln-rise .5s ease-out .35s both" }}>Ad Launched Successfully! 🎉</h1>
          <p className="text-gray-500 mb-6" style={{ animation: "ln-rise .5s ease-out .45s both" }}>Your lead form ad is live and will start collecting leads shortly.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-6">
            <SummaryCard icon={<FaBullhorn className="w-4 h-4" />} color="#8b5cf6" label="Campaign ID" value={previousData.campaign_id} />
            <SummaryCard icon={<FiTag className="w-4 h-4" />} color="#22c55e" label="Ad Set ID" value={previousData.adset_id} />
            <SummaryCard icon={<FiLayout className="w-4 h-4" />} color="#3b82f6" label="Creative ID" value={previousData.creative_id} />
            <SummaryCard icon={<FiFileText className="w-4 h-4" />} color="#0ea5e9" label="Lead Form ID" value={previousData.leadgen_form_id} />
            <SummaryCard icon={<FiSend className="w-4 h-4" />} color="#3b82f6" label="Ad ID" value={adId} />
          </div>

          {webhookOk !== false ? (
            <div className="flex items-center justify-center gap-2 mb-6 px-4 py-2.5 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm font-medium">
              <FiBell className="w-4 h-4" /> Lead delivery is set up — new leads will arrive in your app automatically.
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 mb-6 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-sm font-medium">
              <FiBell className="w-4 h-4" /> Ad is live, but webhook setup needs attention. Leads may not sync automatically.
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={() => navigate("/meta/create")}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-xl transition-all inline-flex items-center justify-center gap-2">
              <FiHome className="w-4 h-4" /> Go to Meta Management
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 px-4 sm:px-6 max-w-4xl mx-auto">
      <style>{`@keyframes ln-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>

      <button onClick={() => navigate("/meta/create/lead-form/creative", { state: previousData })}
        className="inline-flex items-center gap-2 px-4 py-2 mb-3 rounded-full bg-white border border-gray-200 text-gray-700 text-sm font-medium shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all">
        <FiArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
        <div className="flex items-center gap-5 mb-7">
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-50/60 grid place-items-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 grid place-items-center shadow-lg shadow-blue-500/30 -rotate-[18deg]">
                <FiSend className="w-7 h-7 text-white" />
              </div>
            </div>
            <span className="absolute -top-0.5 left-1 text-purple-400 text-lg">✦</span>
            <span className="absolute bottom-1 -right-0.5 text-blue-400 text-sm">✦</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Launch Your Lead Form Ad</h1>
            <p className="text-gray-500 mt-1">You're all set! Name your ad, review the summary and launch.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 p-5 mb-5">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 grid place-items-center"><FiLayout className="w-4 h-4" /></span>
            <span className="font-bold text-gray-900">Campaign Summary</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SummaryCard icon={<FaBullhorn className="w-4 h-4" />} color="#8b5cf6" label="Campaign ID" value={previousData.campaign_id} />
            <SummaryCard icon={<FiTag className="w-4 h-4" />} color="#22c55e" label="Ad Set ID" value={previousData.adset_id} />
            <SummaryCard icon={<FiLayout className="w-4 h-4" />} color="#3b82f6" label="Creative ID" value={previousData.creative_id} />
            {previousData.leadgen_form_id && <SummaryCard icon={<FiFileText className="w-4 h-4" />} color="#0ea5e9" label="Lead Form ID" value={previousData.leadgen_form_id} />}
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="adName" className="block text-sm font-semibold text-gray-700 mb-2">Ad Name <span className="text-red-500">*</span></label>
          <input
            type="text" id="adName" value={adName} onChange={(e) => setAdName(e.target.value)} placeholder="Enter your ad name" required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50/40 p-5 mb-6">
          <div className="relative z-10 flex items-start gap-3 sm:max-w-[68%]">
            <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 grid place-items-center flex-shrink-0"><FiShield className="w-5 h-5" /></span>
            <div>
              <div className="font-bold text-blue-700">Your ad is ready to be created.</div>
              <div className="text-sm text-gray-600 mt-0.5">Once launched, it will be in <strong className="text-blue-700">ACTIVE</strong> status and start running immediately.</div>
            </div>
          </div>
          <RocketClouds />
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-400 grid place-items-center flex-shrink-0"><FiLock className="w-3.5 h-3.5" /></span>
            <span>By launching this ad, you agree to our <a href="https://www.facebook.com/policies/ads" target="_blank" rel="noopener noreferrer" className="text-purple-600 font-semibold inline-flex items-center gap-1 hover:underline">Advertising Policies <FiExternalLink className="w-3 h-3" /></a></span>
          </div>
          <button onClick={handleLaunch} disabled={loading}
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2">
            {loading ? (<><span className="animate-spin">⏳</span> Launching Ad…</>) : (<><FiSend className="w-4 h-4" /> Launch Ad</>)}
          </button>
        </div>
      </div>
    </div>
  );
}
