import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiFileText, FiArrowLeft, FiPlus, FiX } from "react-icons/fi";
import metaApi from "../lcmMetaApi";
import { adAPI } from "../lcmApi";

export default function LeadFormForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const campaignData = location.state || {};
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    privacy_policy_url: "",
    follow_up_action_url: "",
    locale: "en_US",
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
        // Auto-select the first page
        if (pagesData.length > 0 && !selectedPageId) {
          setSelectedPageId(pagesData[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
      alert("Failed to fetch Facebook pages. Please try again.");
    } finally {
      setLoadingPages(false);
    }
  };

  // Questions state - start with default standard questions
  const [questions, setQuestions] = useState([
    { type: "FULL_NAME", label: "", isStandard: true },
    { type: "EMAIL", label: "", isStandard: true },
    { type: "PHONE", label: "", isStandard: true },
  ]);

  // Available question types
  const standardQuestionTypes = [
    { value: "FULL_NAME", label: "Full Name", isStandard: true },
    { value: "FIRST_NAME", label: "First Name", isStandard: true },
    { value: "LAST_NAME", label: "Last Name", isStandard: true },
    { value: "EMAIL", label: "Email", isStandard: true },
    { value: "PHONE", label: "Phone Number", isStandard: true },
    { value: "CITY", label: "City", isStandard: true },
    { value: "STATE", label: "State", isStandard: true },
    { value: "ZIP", label: "ZIP Code", isStandard: true },
    { value: "COUNTRY", label: "Country", isStandard: true },
    { value: "STREET_ADDRESS", label: "Street Address", isStandard: true },
    { value: "COMPANY_NAME", label: "Company Name", isStandard: true },
    { value: "JOB_TITLE", label: "Job Title", isStandard: true },
  ];

  const customQuestionTypes = [
    { value: "CUSTOM", label: "Short Answer (Text)", fieldType: "TEXT", isStandard: false },
    { value: "CUSTOM", label: "Long Answer (Textarea)", fieldType: "TEXTAREA", isStandard: false },
    { value: "CUSTOM", label: "Yes/No", fieldType: "YESNO", isStandard: false },
    { value: "CUSTOM", label: "Multiple Choice", fieldType: "MULTIPLE_CHOICE", isStandard: false },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddQuestion = (questionType, fieldType = null) => {
    const question = standardQuestionTypes.find((q) => q.value === questionType);
    const customQuestion = customQuestionTypes.find(
      (q) => q.value === questionType && q.fieldType === fieldType
    );

    if (question) {
      setQuestions((prev) => [
        ...prev,
        {
          type: question.value,
          label: "",
          isStandard: true,
          fieldType: null,
        },
      ]);
    } else if (customQuestion) {
      setQuestions((prev) => [
        ...prev,
        {
          type: "CUSTOM",
          label: "",
          isStandard: false,
          fieldType: customQuestion.fieldType,
          options: customQuestion.fieldType === "MULTIPLE_CHOICE" ? [] : undefined,
        },
      ]);
    }
  };

  const handleRemoveQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i === index) {
          return { ...q, [field]: value };
        }
        return q;
      })
    );
  };

  const handleAddOption = (questionIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i === questionIndex && q.type === "MULTIPLE_CHOICE") {
          return {
            ...q,
            options: [...(q.options || []), ""],
          };
        }
        return q;
      })
    );
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i === questionIndex && q.type === "MULTIPLE_CHOICE") {
          const newOptions = [...(q.options || [])];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const handleRemoveOption = (questionIndex, optionIndex) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i === questionIndex && q.type === "MULTIPLE_CHOICE") {
          return {
            ...q,
            options: (q.options || []).filter((_, oi) => oi !== optionIndex),
          };
        }
        return q;
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter lead form name");
      return;
    }
    if (!formData.privacy_policy_url.trim()) {
      alert("Please enter Privacy Policy URL");
      return;
    }

    if (!selectedPageId) {
      alert("Please select a Facebook Page");
      return;
    }

    if (questions.length === 0) {
      alert("Please add at least one question to the form");
      return;
    }

    setLoading(true);
    try {
      // Format questions for API
      const formattedQuestions = questions.map((q) => {
        const questionObj = { type: q.type };

        // For custom questions, add label and field_type
        if (q.type === "CUSTOM") {
          if (q.label) {
            questionObj.label = q.label;
          }
          if (q.fieldType) {
            questionObj.field_type = q.fieldType;
          }

          // Add options for MULTIPLE_CHOICE
          if (q.fieldType === "MULTIPLE_CHOICE" && q.options && q.options.length > 0) {
            questionObj.options = q.options.filter((opt) => opt && opt.trim() !== "");
          }
        }

        return questionObj;
      });

      const leadFormPayload = {
        name: formData.name,
        privacy_policy_url: formData.privacy_policy_url,
        follow_up_action_url: formData.follow_up_action_url || "",
        locale: formData.locale,
        questions: formattedQuestions,
      };

      const response = await metaApi.createLeadForm(selectedPageId, leadFormPayload);

      alert(`Lead Form created successfully! ID: ${response.data.id}`);
      console.log("Lead Form created:", response.data);

      // Navigate to create adset page
      navigate("/meta/create/lead-form/adset", {
        state: {
          ...campaignData,
          leadgen_form_id: response.data.id,
          page_id: selectedPageId,
        },
      });
    } catch (error) {
      alert(`Error creating lead form: ${error.message}`);
      console.error("Lead Form creation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/meta/create/lead-form/campaign", { state: campaignData })}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <FiFileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Lead Form</h1>
              <p className="text-gray-600 mt-1">Create a lead form to collect customer information</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Campaign Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-gray-500 text-xs mb-1">Campaign Name</div>
                <div className="text-gray-900 font-semibold">{campaignData.name || "N/A"}</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="text-gray-500 text-xs mb-1">Objective</div>
                <div className="text-gray-900 font-semibold">{campaignData.objective || "N/A"}</div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="page_id" className="block text-sm font-semibold text-gray-700">
                Facebook Page <span className="text-red-500">*</span>
              </label>
              {loadingPages ? (
                <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                  <span className="text-gray-500">Loading pages...</span>
                </div>
              ) : pages.length > 0 ? (
                <select
                  id="page_id"
                  value={selectedPageId}
                  onChange={(e) => setSelectedPageId(e.target.value)}
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
                    value={selectedPageId}
                    onChange={(e) => setSelectedPageId(e.target.value)}
                    placeholder="Enter Facebook Page ID manually"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              )}
              <p className="text-xs text-gray-500">Select the Facebook Page where the lead form will be created</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                Lead Form Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Enter lead form name"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="privacy_policy_url" className="block text-sm font-semibold text-gray-700">
                Privacy Policy URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="privacy_policy_url"
                name="privacy_policy_url"
                value={formData.privacy_policy_url}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="https://yourbusiness.com/privacy-policy"
                required
              />
              <p className="text-xs text-gray-500">URL to your privacy policy page</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="follow_up_action_url" className="block text-sm font-semibold text-gray-700">
                Follow-up Action URL
              </label>
              <input
                type="url"
                id="follow_up_action_url"
                name="follow_up_action_url"
                value={formData.follow_up_action_url}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="https://yourbusiness.com/thank-you"
              />
              <p className="text-xs text-gray-500">URL to redirect users after form submission (optional)</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="locale" className="block text-sm font-semibold text-gray-700">
                Locale
              </label>
              <select
                id="locale"
                name="locale"
                value={formData.locale}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="en_US">English (US)</option>
                <option value="en_GB">English (UK)</option>
                <option value="es_ES">Spanish</option>
                <option value="fr_FR">French</option>
                <option value="de_DE">German</option>
                <option value="hi_IN">Hindi</option>
              </select>
            </div>

            {/* Form Questions Section */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                Form Questions <span className="text-red-500">*</span>
              </label>
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700">Question {index + 1}</span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(index)}
                          className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm"
                        >
                          <FiX className="w-4 h-4" />
                          Remove
                        </button>
                      )}
                    </div>

                    {question.isStandard ? (
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                            Standard
                          </span>
                          <span className="text-gray-900 font-medium">
                            {standardQuestionTypes.find((q) => q.value === question.type)?.label || question.type}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            Custom
                          </span>
                          <span className="text-gray-900 font-medium">
                            {customQuestionTypes.find((t) => t.fieldType === question.fieldType)?.label ||
                              question.fieldType}
                          </span>
                        </div>
                        <select
                          value={question.fieldType || ""}
                          onChange={(e) => handleQuestionChange(index, "fieldType", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                          {customQuestionTypes.map((type) => (
                            <option key={`${type.value}-${type.fieldType}`} value={type.fieldType}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Enter question label"
                          value={question.label || ""}
                          onChange={(e) => handleQuestionChange(index, "label", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          required
                        />
                        {question.fieldType === "MULTIPLE_CHOICE" && (
                          <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-700">Options:</label>
                            {(question.options || []).map((option, optIndex) => (
                              <div key={optIndex} className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder={`Option ${optIndex + 1}`}
                                  value={option}
                                  onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(index, optIndex)}
                                  className="px-3 py-2 text-red-600 hover:text-red-700"
                                >
                                  <FiX className="w-5 h-5" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleAddOption(index)}
                              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              <FiPlus className="w-4 h-4" />
                              Add Option
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Question Buttons */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Add Standard Question:</label>
                  <div className="flex flex-wrap gap-2">
                    {standardQuestionTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleAddQuestion(type.value)}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <FiPlus className="w-4 h-4" />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Add Custom Question:</label>
                  <div className="flex flex-wrap gap-2">
                    {customQuestionTypes.map((type) => (
                      <button
                        key={`${type.value}-${type.fieldType}`}
                        type="button"
                        onClick={() => handleAddQuestion(type.value, type.fieldType)}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <FiPlus className="w-4 h-4" />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Creating...
                  </>
                ) : (
                  <>
                    Create Lead Form
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

