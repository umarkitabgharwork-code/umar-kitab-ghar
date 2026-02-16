import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Layout } from "@/components/layout/Layout";
import HomePage from "./pages/HomePage";
import BuyCoursePage from "./pages/BuyCoursePage";
import BuyBookPage from "./pages/BuyBookPage";
import StationeryPage from "./pages/StationeryPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import CheckoutPage from "./pages/CheckoutPage";
import { 
  PrivacyPolicyPage, 
  TermsConditionsPage, 
  RefundPolicyPage, 
  ShippingPolicyPage, 
  DisclaimerPage 
} from "./pages/LegalPages";
import NotFound from "./pages/NotFound";
import PlaceholderPage from "./pages/PlaceholderPage";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/new-deal" element={<PlaceholderPage title="New Deal" description="Discover our latest deals and special offers." />} />
                <Route path="/buy-course" element={<BuyCoursePage />} />
                <Route path="/buy-book" element={<BuyBookPage />} />
                <Route path="/books/islamic" element={<PlaceholderPage title="Islamic Books" description="Browse our collection of Islamic books and literature." />} />
                <Route path="/books/study" element={<PlaceholderPage title="Study Books" description="Find the perfect study materials for your academic needs." />} />
                <Route path="/books/novel" element={<PlaceholderPage title="Novel Books" description="Explore our wide selection of novels and fiction." />} />
                <Route path="/other/gift" element={<PlaceholderPage title="Gift Items" description="Find the perfect gift for any occasion." />} />
                <Route path="/other/birthday" element={<PlaceholderPage title="Birthday Items" description="Celebrate birthdays with our special collection." />} />
                <Route path="/other/art-craft" element={<PlaceholderPage title="Art & Craft" description="Unleash your creativity with our art and craft supplies." />} />
                <Route path="/other/sketching" element={<PlaceholderPage title="Sketching" description="Professional sketching supplies for artists." />} />
                <Route path="/other/painting" element={<PlaceholderPage title="Painting & Canvas" description="Everything you need for painting and canvas work." />} />
                <Route path="/other/toys" element={<PlaceholderPage title="Toy Items" description="Fun and educational toys for all ages." />} />
                <Route path="/other/bags" element={<PlaceholderPage title="Bags" description="Stylish and functional bags for school and travel." />} />
                <Route path="/other/geometry-box" element={<PlaceholderPage title="Geometry Box" description="Complete geometry sets for students." />} />
                <Route path="/other/pencil-box" element={<PlaceholderPage title="Pencil Box" description="Organize your stationery with our pencil boxes." />} />
                <Route path="/other/diaries" element={<PlaceholderPage title="Diaries" description="Beautiful diaries and journals for your thoughts." />} />
                <Route path="/other/customize" element={<PlaceholderPage title="Customize Item" description="Create personalized items just for you." />} />
                <Route path="/stationery" element={<StationeryPage />} />
                <Route path="/stationery/:category" element={<StationeryPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-conditions" element={<TermsConditionsPage />} />
                <Route path="/refund-policy" element={<RefundPolicyPage />} />
                <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                <Route path="/disclaimer" element={<DisclaimerPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
