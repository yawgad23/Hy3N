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
        <text x="0" y="45" fontFamily="Arial, sans-serif" fontSize="48" fontWeight="900">
          {/* HY */}
          <tspan x="0" fill="#0A0A0A">HY</tspan>
          {/* 3 in Ghana flag colors */}
          <tspan x="75" fill="#CE1126">3</tspan>
          {/* N with black star */}
          <tspan x="115" fill="#0A0A0A">N</tspan>
          {/* Black star above the 3 */}
          <tspan x="92" y="20" fontSize="24" fill="#000000">★</tspan>
        </text>
      </svg>
    </div>
  );
}