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

const branches = [
  {
    name: "Branch 1",
    lines: ["Landhi No 1", "Near Noor Manzil", "In front of Baldia School"],
    phone: "03182166630",
  },
  {
    name: "Branch 2",
    lines: ["Malir 15, Jamia Millia, Aswan Town", "Near Taj Masjid"],
    phone: "03172108717",
  },
  {
    name: "Branch 3",
    lines: ["Korangi 4, Zaman Town", "Near Abu Zar Bakery"],
    phone: "03196275304",
  },
];

const linkClass =
  "inline-block text-sm leading-snug text-[#FBF7EF] hover:text-[#C9A44C] transition-colors duration-200";

const sectionHeadingClass =
  "text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C9A44C]";

export function Footer() {
  return (
    <footer className="border-t border-[rgba(232,222,200,0.18)] bg-[#071D36] text-[#FBF7EF]">
      <div className="container px-4 py-10 sm:px-6 md:py-12 lg:py-14">
        {/* Premium brand strip */}
        <div className="rounded-3xl border border-[rgba(232,222,200,0.18)] bg-[rgba(255,253,248,0.06)] px-5 py-6 sm:px-7 sm:py-7 md:flex md:items-center md:gap-8">
          <Link
            to="/"
            className="mb-5 inline-flex shrink-0 items-center justify-center rounded-2xl border border-[rgba(232,222,200,0.18)] bg-[#102A45] p-3 md:mb-0"
          >
            <img
              src={logo}
              alt="Umar Kitab Ghar"
              className="brand-logo-gold h-12 w-auto object-contain sm:h-14"
              loading="lazy"
            />
          </Link>
          <div className="min-w-0 space-y-1.5 md:flex-1">
            <p className="font-serif text-xl font-semibold tracking-tight text-[#FBF7EF] sm:text-2xl">
              Umar Kitab Ghar
            </p>
            <p className="text-sm font-medium tracking-wide text-[#5F7F64]">
              Books • Stationery • Courses
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#C9A44C]">
              Serving Karachi since 1988
            </p>
          </div>
        </div>

        {/* Main footer grid */}
        <div className="mt-8 grid grid-cols-1 gap-8 sm:gap-9 lg:mt-10 lg:grid-cols-4 lg:gap-8 xl:gap-10">
          {/* Column 1 — Brand */}
          <div className="space-y-4 lg:pr-2">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(232,222,200,0.14)] bg-[#102A45]">
                <img
                  src={logo}
                  alt=""
                  aria-hidden
                  className="brand-logo-gold h-10 w-auto object-contain"
                  loading="lazy"
                />
              </div>
              <span className="text-base font-semibold text-[#FBF7EF] group-hover:text-[#C9A44C] transition-colors">
                Umar Kitab Ghar
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-[#C9D2D8]">
              A calm, trusted bookstore experience for students, readers, and families across
              Karachi — quality books, stationery, and courses under one roof.
            </p>
            <p className="text-xs text-[#5F7F64]">Est. 1988 · Three branches</p>
          </div>

          {/* Column 2 — Branches */}
          <div className="space-y-3">
            <h3 className={sectionHeadingClass}>Branches</h3>
            <ul className="flex flex-col gap-2.5">
              {branches.map((branch) => (
                <li
                  key={branch.name}
                  className="rounded-2xl border border-[rgba(232,222,200,0.14)] bg-[#102A45] px-3.5 py-3"
                >
                  <p className="text-xs font-semibold text-[#FBF7EF]">{branch.name}</p>
                  <div className="mt-1 space-y-0.5 text-[11px] leading-snug text-[#C9D2D8]">
                    {branch.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[11px] font-medium text-[#C9A44C]">
                    📞 {branch.phone}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Quick Links */}
          <div className="space-y-3 lg:pl-1">
            <h3 className={sectionHeadingClass}>Quick Links</h3>
            <ul className="flex flex-col gap-2">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link to={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Legal */}
          <div className="space-y-3 lg:pl-1">
            <h3 className={sectionHeadingClass}>Legal</h3>
            <ul className="flex flex-col gap-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Divider + copyright */}
      <div className="border-t border-[rgba(232,222,200,0.18)]">
        <div className="container px-4 py-5 sm:px-6">
          <div
            className="mx-auto mb-4 h-px max-w-3xl bg-[rgba(232,222,200,0.18)]"
            aria-hidden
          />
          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <p className="text-xs text-[#C9D2D8]">
              © {new Date().getFullYear()} Umar Kitab Ghar. All rights reserved.
            </p>
            <p className="text-[11px] text-[#C9D2D8]/65">
              Made by Huzaifa Sheikh X Aina
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
