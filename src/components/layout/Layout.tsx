import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF7EF]">
      <Header />
      <main className="flex-1 page-shell">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
