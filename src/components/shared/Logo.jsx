import { LOGO_URL, DRIVER_LOGO_URL } from "@/lib/constants";

export default function Logo({ size = "md", className = "", variant = "rider" }) {
  const sizes = {
    sm: "h-10",
    md: "h-16",
    lg: "h-24",
    xl: "h-36"
  };

  const src = variant === "driver" ? DRIVER_LOGO_URL : LOGO_URL;
  const alt = variant === "driver" ? "HY3N Driver" : "HY3N";

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizes[size]} w-auto object-contain ${className}`}
    />
  );
}