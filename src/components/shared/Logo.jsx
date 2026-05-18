import { LOGO_URL } from "@/lib/constants";

export default function Logo({ size = "md", className = "" }) {
  const sizes = {
    sm: "h-10",
    md: "h-16",
    lg: "h-24",
    xl: "h-36"
  };

  return (
    <img
      src={LOGO_URL}
      alt="HY3N"
      className={`${sizes[size]} w-auto object-contain ${className}`}
    />
  );
}