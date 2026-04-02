import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const footerLinks = {
  quickLinks: [
    { href: "/", label: "Home" },
    { href: "/deals", label: "Deals" },
    { href: "/deals", label: "Books" },
    { href: "/buy-course", label: "Courses" },
    { href: "/trending", label: "Trending" },
    { href: "/best-sellers", label: "Best Sellers" },
    { href: "/reviews", label: "Reviews" },
  ],
  legal: [
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms & Conditions" },
    { href: "/refund-policy", label: "Refund Policy" },
    { href: "/shipping-policy", label: "Shipping Policy" },
    { href: "/disclaimer", label: "Disclaimer" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0b1a4a]">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* About + Branches */}
          <div className="md:col-span-2 lg:col-span-2 space-y-4 max-w-prose">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-transparent">
                <img
                  src={logo}
                  alt="Umar Kitab Ghar"
                  className="h-9 w-auto object-contain"
                  loading="lazy"
                />
              </div>
              <div className="flex min-w-0 flex-col text-left">
                <span className="text-base font-bold leading-tight text-white">Umar Kitab Ghar</span>
                <span className="text-xs text-gray-400">Serving since 1988</span>
              </div>
            </Link>

            <div className="space-y-3 text-sm text-gray-300">
              <h3 className="text-sm font-semibold text-white">Branches</h3>

              <div className="rounded-md border border-white/10 bg-white/5 p-2.5 space-y-1 text-gray-300">
                <div className="font-medium text-gray-300">Branch 1</div>
                <div>Landhi No 1</div>
                <div>Near Noor Manzil</div>
                <div>In front of Baldia School</div>
                <div className="text-yellow-400 font-medium">📞 03182166630</div>
              </div>

              <div className="rounded-md border border-white/10 bg-white/5 p-2.5 space-y-1 text-gray-300">
                <div className="font-medium text-gray-300">Branch 2</div>
                <div>Malir 15, Jamia Millia, Aswan Town</div>
                <div>Near Taj Masjid</div>
                <div className="text-yellow-400 font-medium">📞 03172108717</div>
              </div>

              <div className="rounded-md border border-white/10 bg-white/5 p-2.5 space-y-1 text-gray-300">
                <div className="font-medium text-gray-300">Branch 3</div>
                <div>Korangi 4, Zaman Town</div>
                <div>Near Abu Zar Bakery</div>
                <div className="text-yellow-400 font-medium">📞 03196275304</div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Quick Links</h3>
            <ul className="space-y-1.5">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-300 hover:text-white transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Legal</h3>
            <ul className="space-y-1.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-300 hover:text-white transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container py-4 flex flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Umar Kitab Ghar. All rights reserved.
          </p>
          <p className="text-sm text-gray-400">Made by Huzaifa Sheikh X Aina</p>
        </div>
      </div>
    </footer>
  );
}
