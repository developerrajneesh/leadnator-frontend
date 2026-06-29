import { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiSearch } from "react-icons/fi";
import { COUNTRY_CODES, findCountry } from "./countryCodes";

/**
 * Searchable country dial-code picker.
 * value/onChange use the ISO-2 country code (e.g. "in"); the dial code is
 * derived from it. Search by country name or dial code.
 */
export default function CountryCodeSelect({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQ(""); } };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => { if (open && inputRef.current) inputRef.current.focus(); }, [open]);

  const sel = findCountry(value);
  const s = q.trim().toLowerCase();
  const list = !s
    ? COUNTRY_CODES
    : COUNTRY_CODES.filter((c) =>
        c.name.toLowerCase().includes(s) || c.code.includes(s.replace("+", "")) || c.cc.includes(s)
      );

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 pl-3 pr-2.5 py-2.5 border border-gray-200 rounded-xl bg-gray-50/60 hover:bg-white focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <img src={`https://flagcdn.com/24x18/${sel.cc}.png`} width="22" height="16" alt="" className="rounded-sm" />
        <span className="font-medium text-gray-800 text-sm whitespace-nowrap">+{sel.code}</span>
        <FiChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-gray-100 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search country or code…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {list.map((c) => (
              <button
                type="button"
                key={c.cc}
                onClick={() => { onChange(c.cc); setOpen(false); setQ(""); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-green-50 transition-colors ${c.cc === sel.cc ? "bg-green-50" : ""}`}
              >
                <img src={`https://flagcdn.com/24x18/${c.cc}.png`} width="22" height="16" alt="" className="rounded-sm flex-shrink-0" />
                <span className="flex-1 truncate text-gray-700">{c.name}</span>
                <span className="text-gray-400 whitespace-nowrap">+{c.code}</span>
              </button>
            ))}
            {list.length === 0 && (
              <div className="px-3 py-5 text-sm text-gray-400 text-center">No country found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
