// Flat, on-brand SVG illustration for the Home hero.
// All colors are from the WhatsApp-green palette used across the landing.
// No external images — keeps the bundle light and renders crisply at any size.

export default function MarketingArt() {
  return (
    <div className="ln-art-wrap" aria-hidden="true">
      <svg viewBox="20 40 520 480" xmlns="http://www.w3.org/2000/svg" className="ln-art">
        {/* Backdrop circles */}
        <circle cx="420" cy="140" r="80"  fill="#bbf7d0" opacity=".5" />
        <circle cx="120" cy="420" r="60"  fill="#fde047" opacity=".4" />
        <circle cx="480" cy="440" r="28"  fill="#22c55e" opacity=".6" />
        <circle cx="90"  cy="150" r="14"  fill="#06b6d4" opacity=".5" />

        {/* Floating tag — reply rate badge */}
        <g>
          <rect x="30" y="110" width="170" height="40" rx="20" fill="#fff" stroke="#e5e7eb" />
          <circle cx="53" cy="130" r="10" fill="#dcfce7" />
          <path d="M48 130 l4 4 l8 -8" stroke="#22c55e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <text x="72" y="135" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="700" fill="#166534">+384% replies</text>
        </g>

        {/* Main dashboard card */}
        <g transform="translate(70, 110)">
          {/* Card body */}
          <rect x="0" y="0" width="420" height="320" rx="20" fill="#fff" stroke="#e5e7eb" />

          {/* Browser chrome dots */}
          <circle cx="24"  cy="22" r="5" fill="#fca5a5" />
          <circle cx="42"  cy="22" r="5" fill="#fcd34d" />
          <circle cx="60"  cy="22" r="5" fill="#86efac" />
          <rect x="120" y="12" width="200" height="20" rx="10" fill="#f3f4f6" />

          {/* Section heading */}
          <rect x="24" y="54" width="140" height="10" rx="5" fill="#0f172a" />
          <rect x="24" y="72" width="90"  height="7"  rx="3.5" fill="#cbd5e1" />

          {/* Stat cards row */}
          {[
            { x: 24,  color: "#dcfce7", dot: "#22c55e" },
            { x: 124, color: "#fef3c7", dot: "#f59e0b" },
            { x: 224, color: "#dbeafe", dot: "#3b82f6" },
            { x: 324, color: "#fce7f3", dot: "#ec4899" },
          ].map((c, i) => (
            <g key={i} transform={`translate(${c.x}, 94)`}>
              <rect x="0" y="0" width="88" height="56" rx="10" fill={c.color} />
              <circle cx="14" cy="16" r="6" fill={c.dot} />
              <rect x="10" y="30" width="60" height="8"  rx="4" fill="#0f172a" opacity=".85" />
              <rect x="10" y="42" width="38" height="6"  rx="3" fill="#0f172a" opacity=".35" />
            </g>
          ))}

          {/* Bar chart */}
          <g transform="translate(24, 172)">
            <rect x="0" y="0" width="388" height="124" rx="12" fill="#f9fafb" stroke="#eef0f4" />
            {[36, 62, 30, 78, 54, 88, 44, 98, 66, 80, 58, 92].map((h, i) => {
              const x = 16 + i * 30;
              const y = 108 - h;
              return (
                <g key={i}>
                  <rect x={x} y={y} width="18" height={h} rx="4" fill="url(#barGrad)" />
                </g>
              );
            })}
          </g>
        </g>

        {/* WhatsApp bubble pill (floating lower-left) */}
        <g transform="translate(22, 330)">
          <rect x="0" y="0" width="180" height="74" rx="16" fill="#fff" stroke="#e5e7eb" />
          <circle cx="28" cy="37" r="18" fill="#25d366" />
          <path d="M23 33 a7 7 0 1 0 13 3 l3 3 l-1-4 a7 7 0 0 0 -15-2z" fill="#fff" />
          <rect x="56" y="24" width="110" height="10" rx="5" fill="#0f172a" />
          <rect x="56" y="42" width="76"  height="7"  rx="3.5" fill="#cbd5e1" />
          <rect x="56" y="55" width="54"  height="6"  rx="3" fill="#22c55e" opacity=".6" />
        </g>

        {/* Meta Ads + Email channel pills (floating right) */}
        <g transform="translate(395, 340)">
          <rect x="0" y="0" width="150" height="62" rx="14" fill="#fff" stroke="#e5e7eb" />
          <circle cx="26" cy="31" r="15" fill="#e0eaff" />
          <path d="M20 26 c4 -6 12 -6 16 0 c-6 6 -10 6 -16 0" fill="#1877f2" />
          <rect x="50" y="20" width="90" height="9" rx="4" fill="#0f172a" />
          <rect x="50" y="34" width="64" height="6" rx="3" fill="#cbd5e1" />
          <rect x="50" y="45" width="40" height="5" rx="2.5" fill="#1877f2" opacity=".6" />
        </g>

        {/* Email envelope floating */}
        <g transform="translate(420, 60)">
          <rect x="0" y="0" width="80" height="56" rx="10" fill="#fff" stroke="#e5e7eb" />
          <path d="M6 10 L40 32 L74 10" stroke="#ea4335" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 46 L30 28 M74 46 L50 28" stroke="#ea4335" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>

        {/* AI sparkles */}
        <g transform="translate(474, 240)">
          <path d="M0 10 L10 10 M5 5 L5 15" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M18 20 L24 20 M21 17 L21 23" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
          <path d="M-4 26 L2 26 M-1 23 L-1 29" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
        </g>
        <g transform="translate(36, 240)">
          <path d="M0 0 L8 0 M4 -4 L4 4" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
          <path d="M14 12 L20 12 M17 9 L17 15" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Growth arrow — upward trend */}
        <g transform="translate(260, 460)">
          <circle cx="0" cy="0" r="34" fill="#22c55e" />
          <path d="M-12 6 L-2 -4 L4 2 L14 -10 M8 -10 L14 -10 L14 -4"
                stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>

        {/* Decorative chat bubble bottom-right */}
        <g transform="translate(432, 470)">
          <path d="M0 0 h50 a10 10 0 0 1 10 10 v16 a10 10 0 0 1 -10 10 h-38 l-12 10 v-10 a10 10 0 0 1 -10 -10 v-16 a10 10 0 0 1 10 -10z"
                fill="#fde047" />
          <circle cx="18" cy="22" r="2.2" fill="#854d0e" />
          <circle cx="28" cy="22" r="2.2" fill="#854d0e" />
          <circle cx="38" cy="22" r="2.2" fill="#854d0e" />
        </g>

        {/* Gradients */}
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#4ade80" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
