import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileCartBar, useShowMobileCartBar } from "./MobileCartBar";

export function Layout() {
  const showMobileCartBar = useShowMobileCartBar();

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF7EF]">
      <Header />
      <main className={cn("flex-1 page-shell", showMobileCartBar && "pb-[4.5rem] md:pb-0")}>
        <Outlet />
      </main>
      <Footer />
      <MobileCartBar />
    </div>
  );
}
