import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiFileText, FiArrowLeft, FiPlus, FiCheck, FiClipboard,
  FiChevronRight, FiList, FiLayers,
} from "react-icons/fi";
import { adAPI } from "../lcmApi";
import { metaApi as leadnatorMeta } from "../../../api/meta";

export default function LeadFormForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const campaignData = location.state || {};

  const [pages, setPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState(campaignData.page_id || "");
  const [existingForms, setExistingForms] = useState([]);
  const [loadingForms, setLoadingForms] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [tab, setTab] = useState("existing"); // "existing" | (create new navigates away)

  useEffect(() => {
    (async () => {
      try {
        setLoadingPages(true);
        const response = await adAPI.getPages();
        if (response.data.success && response.data.pages?.data) {
          const pagesData = response.data.pages.data;
          setPages(pagesData);
          if (pagesData.length > 0 && !selectedPageId) setSelectedPageId(pagesData[0].id);
        }
      } catch (error) {
        console.error("Error fetching pages:", error);
      } finally {
        setLoadingPages(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load this page's saved lead forms so the user can reuse one.
  useEffect(() => {
    if (!selectedPageId) { setExistingForms([]); return; }
    let cancelled = false;
    (async () => {
      setLoadingForms(true);
      setSelectedFormId("");
      try {
        const res = await leadnatorMeta.leadFormsByPage(selectedPageId);
        const forms = res?.forms || res?.data || [];
        forms.sort((a, b) => (a.status === "ACTIVE" ? -1 : 1) - (b.status === "ACTIVE" ? -1 : 1));
        if (!cancelled) setExistingForms(Array.isArray(forms) ? forms : []);
      } catch (e) {
        console.error("leadFormsByPage:", e);
        if (!cancelled) setExistingForms([]);
      } finally {
        if (!cancelled) setLoadingForms(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedPageId]);

  const goToBuilder = () => {
    navigate("/meta/create/lead-form/builder", {
      state: { ...campaignData, page_id: selectedPageId },
    });
  };

  const handleUseExisting = () => {
    if (!selectedPageId) return alert("Please select a Facebook Page");
    if (!selectedFormId) return alert("Please select a lead form to continue.");
    navigate("/meta/create/lead-form/adset", {
      state: { ...campaignData, leadgen_form_id: selectedFormId, page_id: selectedPageId },
    });
  };

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all";

  return (
    <div className="py-4 px-4 sm:px-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate("/meta/create/lead-form/campaign", { state: campaignData })}
        className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-white border border-gray-200 text-gray-700 text-sm font-medium shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
      >
        <FiArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-7">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 grid place-items-center shadow-lg shadow-blue-500/30 flex-shrink-0">
            <FiFileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Choose a lead form</h1>
            <p className="text-sm text-gray-500">Reuse one you've already built, or create a new one.</p>
          </div>
        </div>

        {/* Page selector */}
        <div className="space-y-1.5 mb-6">
          <label className="block text-sm font-semibold text-gray-700">Facebook Page</label>
          {loadingPages ? (
            <div className={`${inputCls} text-gray-400`}>Loading pages…</div>
          ) : pages.length > 0 ? (
            <select value={selectedPageId} onChange={(e) => setSelectedPageId(e.target.value)} className={inputCls}>
              <option value="">Select a Facebook Page</option>
              {pages.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>
          ) : (
            <input type="text" value={selectedPageId} onChange={(e) => setSelectedPageId(e.target.value)} placeholder="Enter Facebook Page ID" className={inputCls} />
          )}
        </div>

        {/* Two options: pick a saved form OR create a new one */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <button
            type="button" onClick={() => setTab("existing")}
            className={`text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${tab === "existing" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
          >
            <span className={`w-11 h-11 rounded-xl grid place-items-center flex-shrink-0 ${tab === "existing" ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30" : "bg-blue-100 text-blue-600"}`}>
              <FiLayers className="w-5 h-5" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-bold text-gray-900 text-sm">Select existing form</span>
              <span className="block text-xs text-gray-500">Reuse a form you already built</span>
            </span>
            {tab === "existing" && <FiCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />}
          </button>

          <button
            type="button" onClick={goToBuilder}
            className="group text-left p-4 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-400 transition-all flex items-center gap-3"
          >
            <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white grid place-items-center flex-shrink-0 shadow-md shadow-blue-500/30">
              <FiPlus className="w-5 h-5" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-bold text-gray-900 text-sm">Create a new form</span>
              <span className="block text-xs text-gray-500">Open builder with live preview</span>
            </span>
            <FiChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
          </button>
        </div>

        {/* Existing forms (only when "Select existing form" is active) */}
        {tab === "existing" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <FiLayers className="w-4 h-4 text-gray-400" /> Your saved forms
          </div>

          {loadingForms ? (
            <div className="p-4 text-sm text-gray-500 border border-gray-200 rounded-xl flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" /> Loading your lead forms…
            </div>
          ) : existingForms.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
              <FiFileText className="w-9 h-9 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-600 font-medium">No saved forms on this page yet.</p>
              <button type="button" onClick={goToBuilder} className="mt-2 text-blue-600 font-semibold text-sm inline-flex items-center gap-1">
                <FiPlus className="w-4 h-4" /> Create your first form
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                {existingForms.map((f) => {
                  const sel = selectedFormId === f.id;
                  const qCount = Array.isArray(f.questions) ? f.questions.length : (f.questions?.data?.length ?? null);
                  return (
                    <button
                      type="button" key={f.id} onClick={() => setSelectedFormId(f.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${sel ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white grid place-items-center flex-shrink-0 shadow-sm"><FiClipboard className="w-5 h-5" /></span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 text-sm truncate">{f.name || "Untitled form"}</span>
                          {f.status && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${f.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{f.status}</span>}
                        </span>
                        <span className="block text-[11px] text-gray-400 font-mono truncate mt-0.5">{f.id}</span>
                        <span className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          {qCount != null && <span className="inline-flex items-center gap-1"><FiList className="w-3 h-3" /> {qCount} question{qCount === 1 ? "" : "s"}</span>}
                          {f.leads_count != null && <span className="inline-flex items-center gap-1"><FiFileText className="w-3 h-3" /> {f.leads_count} leads</span>}
                        </span>
                      </span>
                      <span className={`w-6 h-6 rounded-full border-2 grid place-items-center flex-shrink-0 ${sel ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300 text-transparent"}`}><FiCheck className="w-3.5 h-3.5" /></span>
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="button" onClick={handleUseExisting} disabled={!selectedFormId}
                  className="px-7 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  Continue with this form <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
