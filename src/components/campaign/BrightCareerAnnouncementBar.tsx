import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BRIGHT_CAREER_COURSE_PATH } from "@/lib/brightCareerCampaign";

export function BrightCareerAnnouncementBar() {
  return (
    <div className="border-b border-[#E8DEC8] bg-[#DDE8D8]/60">
      <div className="container max-w-[1400px] px-4 py-2.5 md:py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
          <p className="text-center text-xs sm:text-sm font-medium text-[#071D36] leading-snug sm:leading-normal">
            🎓 Bright Career School Course 2026 Started | New Books 10% OFF | Old Books 50% OFF | Free
            Lamination + Special Gift
          </p>
          <Button
            asChild
            size="sm"
            variant="hero"
            className="shrink-0 rounded-full px-5 text-xs sm:text-sm mx-auto sm:mx-0"
          >
            <Link to={BRIGHT_CAREER_COURSE_PATH}>Order Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
