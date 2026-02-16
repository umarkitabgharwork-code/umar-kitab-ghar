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
import CategoryPage from "./pages/CategoryPage";

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
                <Route path="/books/:category" element={<CategoryPage />} />
                <Route path="/other/:category" element={<CategoryPage />} />
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
