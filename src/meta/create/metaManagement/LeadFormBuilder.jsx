import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiArrowLeft, FiPlus, FiX, FiCheck, FiFileText, FiType, FiAlignLeft,
  FiList, FiToggleLeft, FiShield, FiGlobe, FiChevronRight, FiEye, FiInfo,
} from "react-icons/fi";
import metaApi from "../lcmMetaApi";
import { adAPI } from "../lcmApi";

const STANDARD_TYPES = [
  { value: "FULL_NAME", label: "Full Name" },
  { value: "FIRST_NAME", label: "First Name" },
  { value: "LAST_NAME", label: "Last Name" },
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Phone Number" },
  { value: "CITY", label: "City" },
  { value: "STATE", label: "State" },
  { value: "ZIP", label: "ZIP Code" },
  { value: "COUNTRY", label: "Country" },
  { value: "STREET_ADDRESS", label: "Street Address" },
  { value: "COMPANY_NAME", label: "Company Name" },
  { value: "JOB_TITLE", label: "Job Title" },
];

const CUSTOM_TYPES = [
  { fieldType: "TEXT", label: "Short Answer", icon: FiType },
  { fieldType: "TEXTAREA", label: "Long Answer", icon: FiAlignLeft },
  { fieldType: "YESNO", label: "Yes / No", icon: FiToggleLeft },
  { fieldType: "MULTIPLE_CHOICE", label: "Multiple Choice", icon: FiList },
];

const LOCALES = [
  { value: "en_US", label: "English (US)" },
  { value: "en_GB", label: "English (UK)" },
  { value: "es_ES", label: "Spanish" },
  { value: "fr_FR", label: "French" },
  { value: "de_DE", label: "German" },
  { value: "hi_IN", label: "Hindi" },
];

const PLACEHOLDERS = {
  FULL_NAME: "John Doe",
  FIRST_NAME: "John",
  LAST_NAME: "Doe",
  EMAIL: "you@example.com",
  PHONE: "+1 555 000 0000",
  CITY: "New York",
  STATE: "California",
  ZIP: "10001",
  COUNTRY: "United States",
  STREET_ADDRESS: "123 Main St",
  COMPANY_NAME: "Acme Inc.",
  JOB_TITLE: "Marketing Manager",
};

function labelFor(q) {
  if (q.type === "CUSTOM") {
    return q.label?.trim() || CUSTOM_TYPES.find((t) => t.fieldType === q.fieldType)?.label || "Custom question";
  }
  return STANDARD_TYPES.find((t) => t.value === q.type)?.label || q.type;
}

export default function LeadFormBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const campaignData = location.state || {};

  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState(campaignData.page_id || "");

  const [formData, setFormData] = useState({
    name: campaignData.formNameDraft || "",
    privacy_policy_url: "",
    follow_up_action_url: "",
    locale: "en_US",
  });

  const [questions, setQuestions] = useState([
    { type: "FULL_NAME", isStandard: true },
    { type: "EMAIL", isStandard: true },
    { type: "PHONE", isStandard: true },
  ]);

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
      } catch (e) {
        console.error("Error fetching pages:", e);
      } finally {
        setLoadingPages(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedPage = useMemo(
    () => pages.find((p) => p.id === selectedPageId),
    [pages, selectedPageId]
  );
  const pageName = selectedPage?.name || "Your Page";
  const pageInitial = (pageName[0] || "P").toUpperCase();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addStandard = (value) =>
    setQuestions((prev) => [...prev, { type: value, isStandard: true }]);

  const addCustom = (fieldType) =>
    setQuestions((prev) => [
      ...prev,
      { type: "CUSTOM", label: "", isStandard: false, fieldType, options: fieldType === "MULTIPLE_CHOICE" ? ["", ""] : undefined },
    ]);

  const removeQuestion = (index) =>
    setQuestions((prev) => prev.filter((_, i) => i !== index));

  const changeQuestion = (index, field, value) =>
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)));

  const addOption = (qi) =>
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, options: [...(q.options || []), ""] } : q)));

  const changeOption = (qi, oi, value) =>
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi) return q;
        const options = [...(q.options || [])];
        options[oi] = value;
        return { ...q, options };
      })
    );

  const removeOption = (qi, oi) =>
    setQuestions((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, options: (q.options || []).filter((_, x) => x !== oi) } : q))
    );

  const isStandardUsed = (value) => questions.some((q) => q.type === value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Please enter a lead form name");
    if (!formData.privacy_policy_url.trim()) return alert("Please enter a Privacy Policy URL");
    if (!selectedPageId) return alert("Please select a Facebook Page");
    if (questions.length === 0) return alert("Please add at least one question");

    setLoading(true);
    try {
      const formattedQuestions = questions.map((q) => {
        const obj = { type: q.type };
        if (q.type === "CUSTOM") {
          if (q.label) obj.label = q.label;
          if (q.fieldType) obj.field_type = q.fieldType;
          if (q.fieldType === "MULTIPLE_CHOICE" && q.options?.length) {
            obj.options = q.options.filter((o) => o && o.trim() !== "");
          }
        }
        return obj;
      });

      const payload = {
        name: formData.name,
        privacy_policy_url: formData.privacy_policy_url,
        follow_up_action_url: formData.follow_up_action_url || "",
        locale: formData.locale,
        questions: formattedQuestions,
      };

      const response = await metaApi.createLeadForm(selectedPageId, payload);
      navigate("/meta/create/lead-form/adset", {
        state: { ...campaignData, leadgen_form_id: response.data.id, page_id: selectedPageId },
      });
    } catch (error) {
      alert(`Error creating lead form: ${error.message}`);
      console.error("Lead Form creation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none transition-all";

  return (
    <div className="py-4 px-4 sm:px-6 max-w-7xl mx-auto">
      <button
        onClick={() => navigate("/meta/create/lead-form/form", { state: campaignData })}
        className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-white border border-gray-200 text-gray-700 text-sm font-medium shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
      >
        <FiArrowLeft className="w-4 h-4" /> Back to forms
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ───────────── Builder (left) ───────────── */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-5">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 grid place-items-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                <FiFileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Build your lead form</h1>
                <p className="text-sm text-gray-500">Design the instant form people see when they tap your ad.</p>
              </div>
            </div>

            {/* Page */}
            <div className="space-y-1.5 mb-5">
              <label className="block text-sm font-semibold text-gray-700">Facebook Page <span className="text-red-500">*</span></label>
              {loadingPages ? (
                <div className={`${inputCls} text-gray-400`}>Loading pages…</div>
              ) : pages.length > 0 ? (
                <select value={selectedPageId} onChange={(e) => setSelectedPageId(e.target.value)} className={inputCls} required>
                  <option value="">Select a Facebook Page</option>
                  {pages.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              ) : (
                <input type="text" value={selectedPageId} onChange={(e) => setSelectedPageId(e.target.value)} placeholder="Enter Facebook Page ID" className={inputCls} required />
              )}
            </div>

            {/* Name */}
            <div className="space-y-1.5 mb-5">
              <label className="block text-sm font-semibold text-gray-700">Form Name <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={inputCls} placeholder="e.g. Summer Sale — Get a Quote" required />
            </div>

            {/* Locale */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1.5"><FiGlobe className="w-4 h-4 text-gray-400" /> Form Language</label>
              <select name="locale" value={formData.locale} onChange={handleInputChange} className={inputCls}>
                {LOCALES.map((l) => (<option key={l.value} value={l.value}>{l.label}</option>))}
              </select>
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 grid place-items-center"><FiList className="w-4 h-4" /></span>
                <h2 className="font-bold text-gray-900">Questions</h2>
              </div>
              <span className="text-xs font-semibold text-gray-400">{questions.length} field{questions.length === 1 ? "" : "s"}</span>
            </div>

            <div className="space-y-2.5">
              {questions.map((q, index) => {
                const custom = q.type === "CUSTOM";
                return (
                  <div key={index} className="rounded-xl border border-gray-200 bg-gray-50/60 p-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md flex-shrink-0 ${custom ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {custom ? "CUSTOM" : "STANDARD"}
                      </span>
                      <span className="flex-1 min-w-0 font-semibold text-gray-900 text-sm truncate">{labelFor(q)}</span>
                      <button type="button" onClick={() => removeQuestion(index)} className="w-7 h-7 rounded-lg grid place-items-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0">
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>

                    {custom && (
                      <div className="mt-3 space-y-2.5">
                        <input
                          type="text" placeholder="Question label (e.g. What's your budget?)"
                          value={q.label || ""} onChange={(e) => changeQuestion(index, "label", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none" required
                        />
                        {q.fieldType === "MULTIPLE_CHOICE" && (
                          <div className="space-y-2 pl-1">
                            {(q.options || []).map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2">
                                <span className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                <input
                                  type="text" placeholder={`Option ${oi + 1}`} value={opt}
                                  onChange={(e) => changeOption(index, oi, e.target.value)}
                                  className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none"
                                />
                                <button type="button" onClick={() => removeOption(index, oi)} className="text-gray-400 hover:text-red-600"><FiX className="w-4 h-4" /></button>
                              </div>
                            ))}
                            <button type="button" onClick={() => addOption(index)} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                              <FiPlus className="w-3.5 h-3.5" /> Add option
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add standard */}
            <div className="mt-5">
              <div className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Prefill fields</div>
              <div className="flex flex-wrap gap-2">
                {STANDARD_TYPES.map((t) => {
                  const used = isStandardUsed(t.value);
                  return (
                    <button
                      key={t.value} type="button" disabled={used} onClick={() => addStandard(t.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all inline-flex items-center gap-1 ${used ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed" : "border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:text-blue-600"}`}
                    >
                      {used ? <FiCheck className="w-3.5 h-3.5" /> : <FiPlus className="w-3.5 h-3.5" />} {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add custom */}
            <div className="mt-5">
              <div className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Custom questions</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CUSTOM_TYPES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.fieldType} type="button" onClick={() => addCustom(t.fieldType)}
                      className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50/40 transition-all"
                    >
                      <Icon className="w-5 h-5 text-blue-600" />
                      <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Privacy + follow up */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 grid place-items-center"><FiShield className="w-4 h-4" /></span>
              <h2 className="font-bold text-gray-900">Privacy & follow-up</h2>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Privacy Policy URL <span className="text-red-500">*</span></label>
              <input type="url" name="privacy_policy_url" value={formData.privacy_policy_url} onChange={handleInputChange} className={inputCls} placeholder="https://yourbusiness.com/privacy-policy" required />
              <p className="text-xs text-gray-400">Meta requires a link to your privacy policy.</p>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Follow-up Action URL</label>
              <input type="url" name="follow_up_action_url" value={formData.follow_up_action_url} onChange={handleInputChange} className={inputCls} placeholder="https://yourbusiness.com/thank-you" />
              <p className="text-xs text-gray-400">Where to send people after they submit (optional).</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit" disabled={loading}
              className="px-7 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {loading ? (<><span className="animate-spin">⏳</span> Creating…</>) : (<>Create form & continue <FiChevronRight className="w-4 h-4" /></>)}
            </button>
          </div>
        </form>

        {/* ───────────── Live preview (right) ───────────── */}
        <div className="lg:col-span-5 lg:sticky lg:top-4">
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-500">
            <FiEye className="w-4 h-4" /> Live preview
          </div>

          {/* Phone frame */}
          <div className="mx-auto w-full max-w-[340px] rounded-[2.2rem] bg-gray-900 p-2.5 shadow-2xl">
            <div className="rounded-[1.7rem] overflow-hidden bg-white">
              {/* notch */}
              <div className="bg-gray-900 h-6 flex justify-center items-start">
                <div className="w-24 h-1.5 bg-gray-700 rounded-full mt-1.5" />
              </div>

              <div className="max-h-[560px] overflow-y-auto">
                {/* Page header */}
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 grid place-items-center text-white text-sm font-bold flex-shrink-0">{pageInitial}</div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate leading-tight">{pageName}</div>
                    <div className="text-[10px] text-gray-400">Sponsored · Lead form</div>
                  </div>
                </div>

                {/* Intro */}
                <div className="px-4 pt-4 pb-3">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-blue-600 mb-1">Contact form</div>
                  <h3 className="text-lg font-bold text-gray-900 leading-snug break-words">
                    {formData.name?.trim() || "Tell us a bit about yourself"}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Fill out the form below and we'll be in touch shortly.</p>
                </div>

                {/* Fields */}
                <div className="px-4 pb-4 space-y-3">
                  {questions.length === 0 && (
                    <div className="text-center text-xs text-gray-400 py-6 border border-dashed border-gray-200 rounded-xl flex flex-col items-center gap-1.5">
                      <FiInfo className="w-4 h-4" /> Add a question to see it here
                    </div>
                  )}
                  {questions.map((q, i) => {
                    const label = labelFor(q);
                    if (q.type === "CUSTOM" && q.fieldType === "MULTIPLE_CHOICE") {
                      return (
                        <div key={i}>
                          <div className="text-xs font-semibold text-gray-700 mb-1.5">{label}</div>
                          <div className="space-y-1.5">
                            {(q.options?.length ? q.options : ["Option 1", "Option 2"]).map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200">
                                <span className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                <span className="text-xs text-gray-600 truncate">{opt?.trim() || `Option ${oi + 1}`}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    if (q.type === "CUSTOM" && q.fieldType === "YESNO") {
                      return (
                        <div key={i}>
                          <div className="text-xs font-semibold text-gray-700 mb-1.5">{label}</div>
                          <div className="flex gap-2">
                            {["Yes", "No"].map((v) => (
                              <div key={v} className="flex-1 text-center px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-600">{v}</div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    const multiline = q.type === "CUSTOM" && q.fieldType === "TEXTAREA";
                    return (
                      <div key={i}>
                        <div className="text-xs font-semibold text-gray-700 mb-1.5">{label}</div>
                        <div className={`w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-400 ${multiline ? "h-14" : ""}`}>
                          {!multiline && (PLACEHOLDERS[q.type] || "Your answer")}
                        </div>
                      </div>
                    );
                  })}

                  {/* Privacy */}
                  <div className="flex items-start gap-2 pt-1">
                    <span className="w-3.5 h-3.5 rounded border-2 border-gray-300 mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      By submitting, you agree to {pageName}'s{" "}
                      {formData.privacy_policy_url?.trim() ? (
                        <span className="text-blue-600 underline">privacy policy</span>
                      ) : (
                        <span className="text-gray-400 italic">privacy policy</span>
                      )}.
                    </p>
                  </div>

                  {/* Submit */}
                  <button type="button" disabled className="w-full mt-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-sm">
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] text-gray-400 mt-3">This is how your form appears on Facebook & Instagram.</p>
        </div>
      </div>
    </div>
  );
}
