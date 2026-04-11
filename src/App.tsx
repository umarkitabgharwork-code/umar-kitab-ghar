import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { CheckoutProvider } from "@/contexts/CheckoutContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Layout } from "@/components/layout/Layout";
import { PromoPopup } from "@/components/PromoPopup";
import ScrollToTop from "@/components/ScrollToTop";
import HomePage from "./pages/HomePage";
import DealsPage from "./pages/DealsPage";
import BuyCoursePage from "./pages/BuyCoursePage";
import UploadListPage from "./pages/UploadListPage";
import StationeryPage from "./pages/StationeryPage";
import Blog from "./pages/Blog";
import BlogDetails from "./pages/BlogDetails";
import CheckoutPage from "./pages/CheckoutPage";
import DeliveryMethodPage from "./pages/DeliveryMethodPage";
import BranchSelectionPage from "./pages/BranchSelectionPage";
import PaymentPage from "./pages/PaymentPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";
import ShippingPolicyPage from "./pages/ShippingPolicyPage";
import DisclaimerPage from "./pages/DisclaimerPage";
import NotFound from "./pages/NotFound";
import PlaceholderPage from "./pages/PlaceholderPage";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import AccountPage from "./pages/AccountPage";
import WishlistPage from "./pages/WishlistPage";
import CartPage from "./pages/CartPage";
import ReviewsPage from "./pages/ReviewsPage";
import TrendingPage from "./pages/TrendingPage";
import BestSellersPage from "./pages/BestSellersPage";
const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <CheckoutProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <PromoPopup />
              <Routes>
                {/* Public Website */}
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />

                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Login />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/cart" element={<CartPage />} />

                  <Route
                    path="/new-deal"
                    element={
                      <PlaceholderPage
                        title="New Deal"
                        description="Discover our latest deals and special offers."
                      />
                    }
                  />
                  <Route
                    path="/deals"
                    element={<DealsPage />}
                  />
                  <Route path="/buy-course" element={<BuyCoursePage />} />
                  <Route path="/upload-list" element={<UploadListPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/trending" element={<TrendingPage />} />
                  <Route path="/best-sellers" element={<BestSellersPage />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/stationery" element={<StationeryPage />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogDetails />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/delivery-method" element={<DeliveryMethodPage />} />
                  <Route path="/branch-selection" element={<BranchSelectionPage />} />
                  <Route path="/payment" element={<PaymentPage />} />
                  <Route path="/order-success" element={<OrderSuccessPage />} />
                  <Route path="/track-order" element={<TrackOrderPage />} />
                  <Route path="/reviews" element={<ReviewsPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/terms-conditions" element={<TermsPage />} />
                  <Route path="/refund-policy" element={<RefundPolicyPage />} />
                  <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                  <Route path="/disclaimer" element={<DisclaimerPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CheckoutProvider>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
