import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BRIGHT_CAREER_CAMPAIGN_SESSION_KEY,
  BRIGHT_CAREER_COURSE_PATH,
  BRIGHT_CAREER_OFFERS,
} from "@/lib/brightCareerCampaign";
import { X } from "lucide-react";

export function BrightCareerCampaignPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem(BRIGHT_CAREER_CAMPAIGN_SESSION_KEY);
      if (!seen) {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    try {
      sessionStorage.setItem(BRIGHT_CAREER_CAMPAIGN_SESSION_KEY, "1");
    } catch {
      // ignore storage errors
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071D36]/40 p-4 backdrop-blur-sm">
      <Card className="relative w-full max-w-md rounded-3xl border border-[#E8DEC8] bg-[#FFFDF8] shadow-xl">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-[#E8DEC8] bg-white text-[#5F7F64] hover:bg-[#DDE8D8]/50"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <CardContent className="space-y-5 p-6 pt-8 md:p-8">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center rounded-full border border-[#E8DEC8] bg-[#DDE8D8]/50 px-3 py-1 text-xs font-medium text-[#5F7F64]">
              Season 2026
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-[#071D36] font-serif">
              Bright Career School Course 2026
            </h2>
            <p className="text-sm text-[#5F7F64]">
              Season is here! Complete courses available with amazing offers.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {BRIGHT_CAREER_OFFERS.map((offer) => (
              <div
                key={offer.label}
                className="rounded-2xl border border-[#E8DEC8] bg-[#FBF7EF] px-3 py-3 text-center"
              >
                <p className="text-sm font-bold text-[#C9A44C]">{offer.highlight}</p>
                <p className="mt-0.5 text-xs font-medium text-[#071D36] leading-snug">{offer.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="hero" className="flex-1 rounded-full">
              <Link to={BRIGHT_CAREER_COURSE_PATH} onClick={handleClose}>
                Order Now
              </Link>
            </Button>
            <Button
              type="button"
              variant="hero-outline"
              className="flex-1 rounded-full bg-white"
              onClick={handleClose}
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
