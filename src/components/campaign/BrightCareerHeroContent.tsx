import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import {
  BRIGHT_CAREER_COURSE_PATH,
  BRIGHT_CAREER_HERO_OFFER_POINTS,
} from "@/lib/brightCareerCampaign";

export function BrightCareerHeroContent() {
  return (
    <div className="w-full max-w-[720px]">
      <span className="inline-flex items-center rounded-full border border-[#E8DEC8] bg-white/80 px-4 py-1.5 text-xs font-medium text-[#5F7F64] mb-4">
        Bright Career School Course 2026
      </span>

      <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#071D36] leading-[1.15] tracking-tight">
        Complete School Courses Available Now
      </h1>

      <p className="mt-2 text-lg sm:text-xl font-semibold text-[#071D36]">
        <span className="home-serif-accent text-[#C9A44C]">Bright Career School</span>
      </p>

      <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-[680px] mx-auto leading-relaxed">
        Get your complete course books with special seasonal offers.
      </p>

      <ul className="mt-4 flex flex-wrap items-center justify-center gap-2 max-w-[640px] mx-auto">
        {BRIGHT_CAREER_HERO_OFFER_POINTS.map((point) => (
          <li
            key={point}
            className="rounded-full border border-[#E8DEC8] bg-[#DDE8D8]/40 px-3 py-1 text-xs font-medium text-[#071D36] sm:text-sm"
          >
            {point}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg" variant="hero" className="rounded-full px-8 gap-2">
          <Link to={BRIGHT_CAREER_COURSE_PATH}>
            Order Your Course Now
          </Link>
        </Button>
        <Button asChild size="lg" variant="hero-outline" className="rounded-full px-8 gap-2 bg-white">
          <Link to={ROUTES.UPLOAD_LIST}>
            <Upload className="h-4 w-4" />
            Upload Your List
          </Link>
        </Button>
      </div>
    </div>
  );
}
