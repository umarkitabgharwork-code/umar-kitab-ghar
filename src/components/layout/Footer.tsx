import { Link } from "react-router-dom";
import { BookOpen, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  quickLinks: [
    { href: "/buy-course", label: "Buy Full Course" },
    { href: "/buy-book", label: "Buy Single Book" },
    { href: "/stationery", label: "Stationery" },
    { href: "/blog", label: "Blog" },
  ],
  categories: [
    { href: "/stationery/islamic-books", label: "Islamic Books" },
    { href: "/stationery/novels", label: "Novels" },
    { href: "/stationery/notebooks", label: "Notebooks" },
    { href: "/stationery/art-supplies", label: "Art Supplies" },
  ],
  legal: [
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-conditions", label: "Terms & Conditions" },
    { href: "/refund-policy", label: "Refund Policy" },
    { href: "/shipping-policy", label: "Shipping Policy" },
    { href: "/disclaimer", label: "Disclaimer" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-card">
      {/* Ad Placeholder */}
      <div className="border-b">
        <div className="container py-4">
          <div className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-muted-foreground/20 bg-secondary/50">
            <span className="text-sm text-muted-foreground">Ad Space</span>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold">Umar Kitab Ghar</span>
                <span className="text-xs text-muted-foreground">Your Book Store</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your one-stop shop for school books, stationery, and educational materials. Quality products at affordable prices.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>123 Book Street, City</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+92 300 1234567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@umerkitabghar.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} Umar Kitab Ghar. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with ❤️ for education
          </p>
        </div>
      </div>
    </footer>
  );
}
