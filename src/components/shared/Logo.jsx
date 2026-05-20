export default function Logo({ size = "md", className = "", variant = "rider" }) {
  const sizes = {
    sm: "h-10",
    md: "h-16",
    lg: "h-24",
    xl: "h-36"
  };

  const height = sizes[size];

  return (
    <div className={`${height} w-auto ${className}`} viewBox="0 0 200 60">
      <svg viewBox="0 0 200 60" className="w-full h-full">
        <defs>
          {/* Ghana flag gradient for the 3 */}
          <linearGradient id="ghanaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#CE1126" />
            <stop offset="33%" stopColor="#CE1126" />
            <stop offset="33%" stopColor="#FCD116" />
            <stop offset="66%" stopColor="#FCD116" />
            <stop offset="66%" stopColor="#006B3F" />
            <stop offset="100%" stopColor="#006B3F" />
          </linearGradient>
        </defs>
        <text x="0" y="45" fontFamily="Arial, sans-serif" fontSize="48" fontWeight="900">
          {/* HY */}
          <tspan x="0" fill="#0A0A0A">HY</tspan>
          {/* 3 with Ghana flag colors */}
          <tspan x="75" fill="url(#ghanaGradient)">3</tspan>
          {/* N */}
          <tspan x="115" fill="#0A0A0A">N</tspan>
          {/* Black star above the 3 */}
          <tspan x="92" y="20" fontSize="24" fill="#000000">★</tspan>
        </text>
      </svg>
    </div>
  );
}