export default function Logo({ size = "md", className = "" }) {
  const sizes = {
    sm: "h-10",
    md: "h-16",
    lg: "h-24",
    xl: "h-36"
  };

  const height = sizes[size];

  return (
    <div className={`${height} w-auto ${className}`}>
      <svg viewBox="0 0 200 80" className="w-full h-full">
        <defs>
          <linearGradient id="ghanaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#CE1126" />
            <stop offset="33%" stopColor="#CE1126" />
            <stop offset="33%" stopColor="#FCD116" />
            <stop offset="66%" stopColor="#FCD116" />
            <stop offset="66%" stopColor="#006B3F" />
            <stop offset="100%" stopColor="#006B3F" />
          </linearGradient>
        </defs>
        <text x="0" y="50" fontFamily="Arial, sans-serif" fontSize="48" fontWeight="900">
          {/* HY in white */}
          <tspan x="0" fill="#FFFFFF">HY</tspan>
          {/* 3 with Ghana flag colors */}
          <tspan x="70" fill="url(#ghanaGradient)">3</tspan>
          {/* N in gold */}
          <tspan x="110" fill="#FCD116">N</tspan>
          {/* Black star above the 3 */}
          <tspan x="88" y="18" fontSize="20" fill="#000000">★</tspan>
        </text>
        {/* Decorative curved line with Ghana colors */}
        <path d="M 10,65 Q 50,72 100,72 Q 150,72 190,65" stroke="#CE1126" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 10,68 Q 50,75 100,75 Q 150,75 190,68" stroke="#FCD116" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 10,71 Q 50,78 100,78 Q 150,78 190,71" stroke="#006B3F" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}