import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileCartBar, useShowMobileCartBar } from "./MobileCartBar";
import { BRIGHT_CAREER_CAMPAIGN_ACTIVE } from "@/lib/brightCareerCampaign";
import { BrightCareerAnnouncementBar } from "@/components/campaign/BrightCareerAnnouncementBar";

export function Layout() {
  const showMobileCartBar = useShowMobileCartBar();

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF7EF]">
      <Header />
      {BRIGHT_CAREER_CAMPAIGN_ACTIVE ? <BrightCareerAnnouncementBar /> : null}
      <main className={cn("flex-1 page-shell", showMobileCartBar && "pb-[4.5rem] md:pb-0")}>
        <Outlet />
      </main>
      <Footer />
      <MobileCartBar />
    </div>
  );
}
