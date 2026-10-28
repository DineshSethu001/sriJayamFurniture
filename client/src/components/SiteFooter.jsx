
export default function SiteFooter() {
  return (
    <footer
      id="contact"
      className="bg-[#241911] px-5 py-12 text-[#f8eee1] sm:px-8 sm:py-16"
    >
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <img
            src="/logo.png"
            alt="Sri Jayam Furnitures"
            className="mb-4 h-16 w-16 object-contain"
          />
          <h2 className="text-xl font-semibold">Sri Jayam Furnitures</h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/60">
            Traditional craftsmanship and furniture for the home.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4ae7b]">
            Explore
          </h3>
          <div className="mt-4 flex flex-col items-start gap-3 text-sm text-white/70">
            <a href="#collection" className="hover:text-white">Our Collection</a>
            <a href="#about" className="hover:text-white">About Us</a>
            <a href="#contact" className="hover:text-white">Contact</a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#d4ae7b]">
            Enquiries
          </h3>
          <p className="mt-4 text-sm leading-6 text-white/70">
            Interested in a piece? Contact our furniture team to ask about
            availability and customisation.
          </p>
          <p className="mt-4 text-xs text-white/45">
            Add your official phone number, WhatsApp link, and showroom
            address before publishing.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-5 text-xs text-white/45">
        © {new Date().getFullYear()} Sri Jayam Furnitures. All rights reserved.
      </div>
    </footer>
  );
}
