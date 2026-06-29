import {
  FiArrowRight, FiFileText, FiInfo, FiUsers, FiShoppingCart,
  FiMousePointer, FiMessageCircle, FiCheck,
} from "react-icons/fi";
import { HiSpeakerphone } from "react-icons/hi";

// Per-objective presentation (icon + colour + one-line description).
export const OBJECTIVE_META = {
  OUTCOME_AWARENESS:  { label: "Awareness",  desc: "Increase brand awareness",        Icon: HiSpeakerphone, color: "#8b5cf6" },
  OUTCOME_ENGAGEMENT: { label: "Engagement", desc: "Get more engagement on your ad",  Icon: FiMessageCircle, color: "#3b82f6" },
  OUTCOME_LEADS:      { label: "Leads",      desc: "Collect leads and build pipeline", Icon: FiUsers,        color: "#22c55e" },
  OUTCOME_SALES:      { label: "Sales",      desc: "Drive sales and conversions",      Icon: FiShoppingCart, color: "#ec4899" },
  OUTCOME_TRAFFIC:    { label: "Traffic",    desc: "Send more people to your destination", Icon: FiMousePointer, color: "#f97316" },
};

// Accent themes — full literal class strings so Tailwind keeps them at build time.
const THEME = {
  green:  { iconGrad: "from-green-400 to-green-600",  iconShadow: "shadow-green-500/30",  ring: "focus:ring-green-500/40 focus:border-green-500",  selBorder: "border-green-500",  selBg: "bg-green-50",  hover: "hover:border-green-200 hover:bg-green-50/40",  check: "bg-green-500",  btn: "from-green-500 to-green-600",  btnShadow: "shadow-green-500/30" },
  orange: { iconGrad: "from-orange-400 to-orange-600", iconShadow: "shadow-orange-500/30", ring: "focus:ring-orange-500/40 focus:border-orange-500", selBorder: "border-orange-500", selBg: "bg-orange-50", hover: "hover:border-orange-200 hover:bg-orange-50/40", check: "bg-orange-500", btn: "from-orange-500 to-orange-600", btnShadow: "shadow-orange-500/30" },
  pink:   { iconGrad: "from-pink-400 to-pink-600",   iconShadow: "shadow-pink-500/30",   ring: "focus:ring-pink-500/40 focus:border-pink-500",   selBorder: "border-pink-500",   selBg: "bg-pink-50",   hover: "hover:border-pink-200 hover:bg-pink-50/40",   check: "bg-pink-500",   btn: "from-pink-500 to-pink-600",   btnShadow: "shadow-pink-500/30" },
  blue:   { iconGrad: "from-blue-400 to-blue-600",   iconShadow: "shadow-blue-500/30",   ring: "focus:ring-blue-500/40 focus:border-blue-500",   selBorder: "border-blue-500",   selBg: "bg-blue-50",   hover: "hover:border-blue-200 hover:bg-blue-50/40",   check: "bg-blue-500",   btn: "from-blue-500 to-blue-600",   btnShadow: "shadow-blue-500/30" },
};
export const getTheme = (a) => THEME[a] || THEME.orange;

/**
 * Shared "Create … Campaign" step-1 layout used by all four ad-goal flows.
 */
export default function CampaignLayout({
  accent, HeaderIcon, title, subtitle,
  name, setName, objectiveValues, selected, onSelect, fixed = false,
  loading, onBack, onSubmit, nextLabel = "Next",
}) {
  const t = getTheme(accent);

  return (
    <div className="py-4 px-4">
      <div className="max-w-3xl mx-auto">
        <form
          onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-7"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.iconGrad} flex items-center justify-center shadow-lg ${t.iconShadow} flex-shrink-0`}>
              <HeaderIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>
            </div>
          </div>

          {/* Campaign name */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Campaign Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FiFileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter campaign name"
                className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/60 focus:bg-white focus:ring-4 outline-none transition-all ${t.ring}`}
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Give your campaign a name to easily identify it later.</p>
          </div>

          {/* Objective */}
          <div className="mb-6">
            <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2.5">
              Objective <span className="text-red-500">*</span>
              <FiInfo className="text-gray-400 w-3.5 h-3.5" />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {objectiveValues.map((val, idx) => {
                const meta = OBJECTIVE_META[val];
                if (!meta) return null;
                const isSel = selected === val;
                const fullWidth = objectiveValues.length % 2 === 1 && idx === objectiveValues.length - 1;
                return (
                  <button
                    type="button"
                    key={val}
                    onClick={() => !fixed && onSelect?.(val)}
                    className={`text-left p-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${fullWidth ? "sm:col-span-2" : ""} ${isSel ? `${t.selBorder} ${t.selBg}` : `border-gray-200 bg-white ${t.hover}`} ${fixed ? "cursor-default" : ""}`}
                  >
                    <span className="w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ background: meta.color }}>
                      <meta.Icon size={17} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold text-gray-900 text-sm">{meta.label}</span>
                      <span className="block text-xs text-gray-500 truncate">{meta.desc}</span>
                      <span className="block text-[10px] tracking-wide text-gray-400 mt-0.5">{val}</span>
                    </span>
                    {isSel && (
                      <span className={`w-6 h-6 rounded-full ${t.check} text-white flex items-center justify-center flex-shrink-0`}>
                        <FiCheck className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 rounded-xl bg-gradient-to-r ${t.btn} text-white font-semibold text-sm shadow-lg ${t.btnShadow} hover:-translate-y-0.5 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
            >
              {loading ? "Creating..." : <>{nextLabel} <FiArrowRight /></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
