
export default function BrandLogo({ className = "", decorative = false }) {
  return (
    <img
      src="/logo.png"
      alt={decorative ? "" : "Sri Jayam Furnitures"}
      aria-hidden={decorative ? "true" : undefined}
      className={`object-contain ${className}`}
    />
  );
}
