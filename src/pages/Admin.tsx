import { useEffect, useState, useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import {
  adminCreateBookWithImages,
  adminCreateCoupon,
  adminCreateBlogPost,
  adminGetBooks,
  adminGetCategories,
  adminGetOrderItems,
  adminGetOrders,
  adminSetBookActive,
  adminUpdateBook,
  adminUpdateOrderStatus,
  adminCreateBanner,
  adminDeleteBanner,
  adminGetBanners,
  adminSetBannerActive,
  isCurrentUserAdmin,
  type AdminBook,
  type AdminCategory,
  type AdminOrder,
  type AdminOrderItem,
  type Banner,
} from "@/services/api";
import { supabase } from "@/lib/supabase";
import CourseManager from "../components/CourseManager";

export default function Admin() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [orderItems, setOrderItems] = useState<AdminOrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [products, setProducts] = useState<AdminBook[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const [editingProduct, setEditingProduct] = useState<AdminBook | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSetStock, setEditSetStock] = useState("");
  const [editIncreaseStock, setEditIncreaseStock] = useState("");
  const [editDecreaseStock, setEditDecreaseStock] = useState("");
  const [editIsActive, setEditIsActive] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [bookPrice, setBookPrice] = useState("");
  const [bookDescription, setBookDescription] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [creatingBook, setCreatingBook] = useState(false);

  const [publishers, setPublishers] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedPublisher, setSelectedPublisher] = useState("");
  const [newPublisherName, setNewPublisherName] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [language, setLanguage] = useState("");

  const [selectedBookForMeta, setSelectedBookForMeta] = useState<AdminBook | null>(null);
  const [metaPublisher, setMetaPublisher] = useState("");
  const [metaGenre, setMetaGenre] = useState("");
  const [metaSubject, setMetaSubject] = useState("");
  const [metaClass, setMetaClass] = useState("");
  const [metaLanguage, setMetaLanguage] = useState("");
  const [savingBookMeta, setSavingBookMeta] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscountType, setCouponDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [couponDiscountValue, setCouponDiscountValue] = useState("");
  const [couponExpiresAt, setCouponExpiresAt] = useState("");
  const [couponMaxUsage, setCouponMaxUsage] = useState("");
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  const [dealTitle, setDealTitle] = useState("");
  const [dealBookId, setDealBookId] = useState<string>("");
  const [dealPrice, setDealPrice] = useState("");
  const [dealBadge, setDealBadge] = useState("");
  const [dealSection, setDealSection] = useState<"Deal" | "Trending" | "Best Seller">("Deal");
  const [dealType, setDealType] = useState<"product" | "custom">("product");
  const [customDealImage, setCustomDealImage] = useState<File | null>(null);
  const [creatingDeal, setCreatingDeal] = useState(false);

  const [blogTitle, setBlogTitle] = useState("");
  const [blogSlug, setBlogSlug] = useState("");
  const [blogImageUrl, setBlogImageUrl] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogPublished, setBlogPublished] = useState(true);
  const [creatingBlogPost, setCreatingBlogPost] = useState(false);

  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerVideoUrl, setBannerVideoUrl] = useState("");
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerButtonText, setBannerButtonText] = useState("");
  const [bannerButtonLink, setBannerButtonLink] = useState("");
  const [bannerSortOrder, setBannerSortOrder] = useState("1");
  const [creatingBanner, setCreatingBanner] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannersLoading, setBannersLoading] = useState(false);

  type AdminReviewRow = {
    id: string;
    user_name: string | null;
    phone: string | null;
    product_id: string | null;
    rating: number;
    comment: string | null;
    is_approved: boolean;
    is_deleted: boolean;
    created_at: string;
    review_type: string | null;
  };

  const [reviews, setReviews] = useState<AdminReviewRow[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<"all" | "pending" | "approved">("all");

  // ===== Manage Products: pagination + category filter =====
  const [productPage, setProductPage] = useState(1);
  const PRODUCTS_PER_PAGE = 10;
  const [categoriesForFilter, setCategoriesForFilter] = useState<{ id: string; name: string }[]>([]);
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>("");

  // ===== Dashboard Stats =====
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const completedOrders = orders.filter(o => o.status === "completed").length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  const todayOrders = orders.filter(o =>
    new Date(o.created_at).toDateString() === new Date().toDateString()
  ).length;

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch =
        order.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        order.phone?.includes(search);

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const pendingReviewCount = useMemo(
    () =>
      reviews.filter((r) => r.is_approved === false && r.is_deleted === false).length,
    [reviews]
  );

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (reviewFilter === "pending") return r.is_approved === false && r.is_deleted === false;
      if (reviewFilter === "approved") return r.is_approved === true && r.is_deleted === false;
      return true;
    });
  }, [reviews, reviewFilter]);

  // ===== Admin Auth =====
  useEffect(() => {
    const checkAccess = async () => {
      const res = await isCurrentUserAdmin();
      if (!res.success) {
        console.error("Failed to verify admin access:", res.message);
        setAuthorized(false);
        return;
      }
      setAuthorized(res.data);
    };
    checkAccess();
  }, []);

  useEffect(() => {
    if (authorized !== true) return;
    const loadCategoriesForProducts = async () => {
      const res = await supabase.from("categories").select("*");
      if (res.error) {
        console.error("Failed to load categories for product filter:", res.error.message);
        setCategoriesForFilter([]);
        return;
      }
      const rows = (res.data ?? []) as { id: string; name: string }[];
      setCategoriesForFilter(rows);
    };
    loadCategoriesForProducts();
  }, [authorized]);

  useEffect(() => {
    if (authorized !== true) return;
    const load = async () => {
      setBannersLoading(true);
      const res = await adminGetBanners();
      setBannersLoading(false);
      if (!res.success) {
        console.error("Failed to load banners:", res.message);
        setBanners([]);
        return;
      }
      setBanners(res.data);
    };
    load();
  }, [authorized]);

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerImage) {
      toast({ variant: "destructive", description: "Please select a banner image." });
      return;
    }

    const sortOrder = Number(bannerSortOrder);
    setCreatingBanner(true);
    const res = await adminCreateBanner({
      imageFile: bannerImage,
      videoUrl: bannerVideoUrl.trim() || undefined,
      title: bannerTitle,
      subtitle: bannerSubtitle,
      buttonText: bannerButtonText,
      buttonLink: bannerButtonLink,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 1,
    });
    setCreatingBanner(false);

    if (!res.success) {
      toast({ variant: "destructive", description: res.message || "Failed to create banner." });
      return;
    }

    toast({ description: "Banner created successfully." });
    setBannerImage(null);
    setBannerVideoUrl("");
    setBannerTitle("");
    setBannerSubtitle("");
    setBannerButtonText("");
    setBannerButtonLink("");
    setBannerSortOrder("1");

    const refreshed = await adminGetBanners();
    if (refreshed.success) setBanners(refreshed.data);
  };

  const toggleBannerActive = async (bannerId: string, nextActive: boolean) => {
    const res = await adminSetBannerActive(bannerId, nextActive);
    if (!res.success) {
      toast({ variant: "destructive", description: res.message || "Failed to update banner." });
      return;
    }
    const refreshed = await adminGetBanners();
    if (refreshed.success) setBanners(refreshed.data);
  };

  const deleteBanner = async (bannerId: string) => {
    const res = await adminDeleteBanner(bannerId);
    if (!res.success) {
      toast({ variant: "destructive", description: res.message || "Failed to delete banner." });
      return;
    }
    toast({ description: "Banner deleted." });
    setBanners((prev) => prev.filter((b) => b.id !== bannerId));
  };

  useEffect(() => {
    if (authorized === false) navigate("/", { replace: true });
  }, [authorized, navigate]);

  // ===== Fetch Categories (for Add New Book) =====
  useEffect(() => {
    const fetchMeta = async () => {
      const [pub, gen, sub, cls] = await Promise.all([
        supabase.from("publishers").select("*"),
        supabase.from("genres").select("*"),
        supabase.from("subjects").select("*"),
        supabase.from("classes").select("*"),
      ]);
      if (pub.data) setPublishers(pub.data);
      if (gen.data) setGenres(gen.data);
      if (sub.data) setSubjects(sub.data);
      if (cls.data) setClasses(cls.data);
    };

    const fetchCategories = async () => {
      if (!authorized) return;
      const res = await adminGetCategories();
      if (!res.success) {
        console.error("Failed to load categories:", res.message);
        toast({
          variant: "destructive",
          description: "Failed to load categories.",
        });
        return;
      }
      setCategories(res.data || []);
      await fetchMeta();
    };

    fetchCategories();
  }, [authorized]);

  // ===== Fetch Orders =====
  const fetchOrders = async () => {
    setOrdersLoading(true);
    const res = await adminGetOrders();
    if (!res.success) {
      console.error("Failed to load orders:", res.message);
      toast({
        variant: "destructive",
        description: "Failed to load orders. Please try again.",
      });
      setOrders([]);
      setOrdersLoading(false);
      return;
    }
    setOrders(res.data || []);
    setOrdersLoading(false);
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    setReviewsLoading(false);
    if (error) {
      console.error("Failed to load reviews:", error.message);
      toast({
        variant: "destructive",
        description: "Failed to load reviews. Check Supabase reviews table and moderation columns.",
      });
      setReviews([]);
      return;
    }
    setReviews((data ?? []) as AdminReviewRow[]);
  };

  const approveReview = async (reviewId: string) => {
    const { error } = await supabase
      .from("reviews")
      .update({ is_approved: true })
      .eq("id", reviewId);
    if (error) {
      toast({ variant: "destructive", description: error.message || "Failed to approve review." });
      return;
    }
    toast({ description: "Review approved." });
    fetchReviews();
  };

  const softDeleteReview = async (reviewId: string) => {
    const { error } = await supabase
      .from("reviews")
      .update({ is_deleted: true })
      .eq("id", reviewId);
    if (error) {
      toast({ variant: "destructive", description: error.message || "Failed to delete review." });
      return;
    }
    toast({ description: "Review removed." });
    fetchReviews();
  };

  // ===== Fetch Products (Books) =====
  const fetchProducts = async () => {
    setProductsLoading(true);
    const res = await adminGetBooks();
    if (!res.success) {
      console.error("Failed to load products:", res.message);
      toast({
        variant: "destructive",
        description: "Failed to load products. Please try again.",
      });
      setProducts([]);
      setProductsLoading(false);
      return;
    }

    setProducts(res.data || []);
    setProductsLoading(false);
  };

  useEffect(() => {
    if (!selectedBookForMeta) return;
    setMetaPublisher(selectedBookForMeta.publisher_id ?? "");
    setMetaGenre(selectedBookForMeta.genre_id ?? "");
    setMetaSubject(selectedBookForMeta.subject_id ?? "");
    setMetaClass(selectedBookForMeta.class_id ?? "");
    setMetaLanguage(selectedBookForMeta.language ?? "");
  }, [selectedBookForMeta]);

  const updateBookMeta = async () => {
    if (!selectedBookForMeta) return;
    setSavingBookMeta(true);
    const { error } = await supabase
      .from("books")
      .update({
        publisher_id: metaPublisher || null,
        genre_id: metaGenre || null,
        subject_id: metaSubject || null,
        class_id: metaClass || null,
        language: metaLanguage || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedBookForMeta.id);
    setSavingBookMeta(false);

    if (error) {
      toast({ variant: "destructive", description: error.message });
      return;
    }

    toast({ description: "Book details saved." });
    setSelectedBookForMeta(null);
    fetchProducts();
  };

  const openEditProduct = (product: AdminBook) => {
    setEditingProduct(product);
    setEditTitle(product.title ?? "");
    setEditPrice(product.price != null ? String(product.price) : "");
    setEditDescription(product.description ?? "");
    setEditSetStock("");
    setEditIncreaseStock("");
    setEditDecreaseStock("");
    setEditIsActive(!!product.is_active);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!authorized) {
      toast({
        variant: "destructive",
        description: "You do not have permission to update products.",
      });
      return;
    }

    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      toast({
        variant: "destructive",
        description: "Title is required.",
      });
      return;
    }

    const priceNumber = Number(editPrice);
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      toast({
        variant: "destructive",
        description: "Please enter a valid price.",
      });
      return;
    }

    const parseNonNegative = (value: string, label: string): number | null => {
      const num = Number(value);
      if (Number.isNaN(num) || num < 0) {
        toast({
          variant: "destructive",
          description: `${label} must be a non-negative number.`,
        });
        return null;
      }
      return Math.floor(num);
    };

    const currentStock = editingProduct.stock ?? 0;
    let newStock = currentStock;

    if (editSetStock.trim() !== "") {
      const val = parseNonNegative(editSetStock.trim(), "Set Stock");
      if (val === null) return;
      newStock = val;
    } else if (editIncreaseStock.trim() !== "") {
      const val = parseNonNegative(editIncreaseStock.trim(), "Increase Stock");
      if (val === null) return;
      newStock = currentStock + val;
    } else if (editDecreaseStock.trim() !== "") {
      const val = parseNonNegative(editDecreaseStock.trim(), "Decrease Stock");
      if (val === null) return;
      if (val > currentStock) {
        toast({
          variant: "destructive",
          description: "Cannot decrease stock below 0.",
        });
        return;
      }
      newStock = currentStock - val;
    }

    if (newStock < 0) {
      toast({
        variant: "destructive",
        description: "Stock cannot be negative.",
      });
      return;
    }

    setSavingProduct(true);
    const res = await adminUpdateBook({
      id: editingProduct.id,
      title: trimmedTitle,
      price: priceNumber,
      description: editDescription.trim() || null,
      stock: newStock,
      is_active: editIsActive,
    });

    setSavingProduct(false);

    if (!res.success) {
      console.error("Failed to update product:", res.message);
      toast({
        variant: "destructive",
        description: "Failed to update product. Please try again.",
      });
      return;
    }

    setEditingProduct(null);
    setEditTitle("");
    setEditPrice("");
    setEditDescription("");
    setEditSetStock("");
    setEditIncreaseStock("");
    setEditDecreaseStock("");
    fetchProducts();
  };

  useEffect(() => {
    if (authorized) {
      fetchOrders();
      fetchProducts();
      fetchReviews();
    }
  }, [authorized]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const res = await adminUpdateOrderStatus(orderId, newStatus);
    if (!res.success) {
      toast({
        variant: "destructive",
        description: "Failed to update order status.",
      });
      return;
    }
    fetchOrders();
  };

  const openOrderDetails = async (order: AdminOrder) => {
    setSelectedOrder(order);
    setLoadingItems(true);
    const res = await adminGetOrderItems(order.id);
    if (!res.success) {
      console.error("Failed to load order items:", res.message);
      toast({
        variant: "destructive",
        description: "Failed to load order items.",
      });
      setOrderItems([]);
      setLoadingItems(false);
      return;
    }
    setOrderItems(res.data || []);
    setLoadingItems(false);
  };

  const handlePrintInvoice = () => {
    const printContents = document.getElementById("invoice-print-area")?.innerHTML;
    const newWindow = window.open("", "", "width=800,height=600");

    if (newWindow && printContents) {
      newWindow.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h2 { margin-bottom: 10px; }
            hr { margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
            th { text-align: left; background: #f5f5f5; }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
      newWindow.document.close();
      newWindow.print();
    }
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authorized) {
      toast({
        variant: "destructive",
        description: "You do not have permission to create products.",
      });
      return;
    }

    if (!selectedCategory) {
      toast({
        variant: "destructive",
        description: "Please select a category.",
      });
      return;
    }

    if (!bookTitle.trim()) {
      toast({
        variant: "destructive",
        description: "Please enter a book title.",
      });
      return;
    }

    const priceNumber = Number(bookPrice);
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      toast({
        variant: "destructive",
        description: "Please enter a valid price.",
      });
      return;
    }

    let publisherIdToUse = selectedPublisher;

    if (selectedPublisher === "other") {
      if (!newPublisherName.trim()) {
        alert("Please enter publisher name");
        return;
      }

      const { data: newPublisher, error: pubError } = await supabase
        .from("publishers")
        .insert([{ name: newPublisherName.trim() }])
        .select()
        .single();

      if (pubError) {
        console.error(pubError);
        alert("Failed to add publisher");
        return;
      }

      publisherIdToUse = String((newPublisher as { id: string }).id);

      const { data: updatedPublishers } = await supabase.from("publishers").select("*");
      if (updatedPublishers) setPublishers(updatedPublishers);
    }

    setCreatingBook(true);

    const res = await adminCreateBookWithImages({
      categoryId: selectedCategory,
      title: bookTitle.trim(),
      price: priceNumber,
      description: bookDescription.trim() || null,
      images: selectedImages,
      publisherId: publisherIdToUse && publisherIdToUse !== "other" ? publisherIdToUse : null,
      genreId: selectedGenre || null,
      subjectId: selectedSubject || null,
      classId: selectedClass || null,
      language: language || null,
    });

    if (!res.success || !res.data?.bookId) {
      console.error("Failed to create book:", res.message);
      toast({
        variant: "destructive",
        description: "Failed to create book. Please try again.",
      });
      setCreatingBook(false);
      return;
    }

    setCreatingBook(false);

    setSelectedCategory("");
    setBookTitle("");
    setBookPrice("");
    setBookDescription("");
    setSelectedImages([]);
    setSelectedPublisher("");
    setNewPublisherName("");
    setSelectedGenre("");
    setSelectedSubject("");
    setSelectedClass("");
    setLanguage("");
    if (res.data.hadImageErrors) {
      toast({
        variant: "destructive",
        description: "Book created, but there was a problem uploading one or more images.",
      });
    } else {
      toast({
        description: "Book created successfully.",
      });
    }
    fetchProducts();
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorized) {
      toast({
        variant: "destructive",
        description: "You do not have permission to create coupons.",
      });
      return;
    }
    const code = couponCode.trim();
    if (!code) {
      toast({ variant: "destructive", description: "Please enter a coupon code." });
      return;
    }
    const value = Number(couponDiscountValue);
    if (Number.isNaN(value) || value <= 0) {
      toast({ variant: "destructive", description: "Please enter a valid discount value." });
      return;
    }
    if (couponDiscountType === "percentage" && value > 100) {
      toast({ variant: "destructive", description: "Percentage discount cannot exceed 100." });
      return;
    }
    if (!couponExpiresAt.trim()) {
      toast({ variant: "destructive", description: "Please set an expiry date." });
      return;
    }
    const maxUsage = Math.floor(Number(couponMaxUsage));
    if (Number.isNaN(maxUsage) || maxUsage < 1) {
      toast({ variant: "destructive", description: "Max usage must be at least 1." });
      return;
    }
    setCreatingCoupon(true);
    const res = await adminCreateCoupon({
      code,
      discountType: couponDiscountType,
      discountValue: value,
      expiresAt: new Date(couponExpiresAt).toISOString(),
      maxUsage,
    });
    setCreatingCoupon(false);
    if (!res.success) {
      toast({ variant: "destructive", description: res.message });
      return;
    }
    toast({ description: "Coupon created successfully." });
    setCouponCode("");
    setCouponDiscountValue("");
    setCouponExpiresAt("");
    setCouponMaxUsage("");
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorized) {
      toast({
        variant: "destructive",
        description: "You do not have permission to create deals.",
      });
      return;
    }

    const priceNumber = Number(dealPrice);
    if (Number.isNaN(priceNumber) || priceNumber <= 0) {
      toast({ variant: "destructive", description: "Please enter a valid deal price." });
      return;
    }

    setCreatingDeal(true);

    try {
      if (dealType === "product") {
        if (!dealBookId) {
          toast({ variant: "destructive", description: "Please select a book for this deal." });
          return;
        }

        const selectedBook = products.find((p) => p.id === dealBookId);
        const title = selectedBook?.title ?? "Deal";

        const res = await supabase.from("deals").insert([
          {
            title,
            book_id: dealBookId,
            deal_price: priceNumber,
            badge: dealBadge.trim() || null,
            section: dealSection,
            is_active: true,
          },
        ]);

        if (res.error) {
          toast({ variant: "destructive", description: res.error.message || "Failed to create deal." });
          return;
        }
      } else {
        const customTitle = dealTitle.trim();
        if (!customTitle) {
          toast({ variant: "destructive", description: "Please enter a custom deal title." });
          return;
        }
        if (!customDealImage) {
          toast({ variant: "destructive", description: "Please upload a custom deal image." });
          return;
        }

        const ext = customDealImage.name.split(".").pop() || "jpg";
        const filePath = `deals/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, customDealImage);
        if (uploadError) {
          toast({ variant: "destructive", description: uploadError.message || "Image upload failed." });
          return;
        }

        const { data: publicData } = supabase.storage.from("product-images").getPublicUrl(filePath);
        const imageUrl = publicData.publicUrl;

        const res = await supabase.from("deals").insert([
          {
            title: customTitle,
            custom_title: customTitle,
            custom_image: imageUrl,
            custom_price: priceNumber,
            badge: dealBadge.trim() || null,
            section: dealSection,
            is_custom: true,
            is_active: true,
          },
        ]);

        if (res.error) {
          toast({
            variant: "destructive",
            description: res.error.message || "Failed to create custom deal.",
          });
          return;
        }
      }

      toast({ description: "Deal created successfully." });
      setDealType("product");
      setDealTitle("");
      setDealBookId("");
      setDealPrice("");
      setDealBadge("");
      setDealSection("Deal");
      setCustomDealImage(null);
    } finally {
      setCreatingDeal(false);
    }
  };

  const handleCreateBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorized) {
      toast({
        variant: "destructive",
        description: "You do not have permission to create blog posts.",
      });
      return;
    }

    const title = blogTitle.trim();
    const slug = blogSlug.trim();
    const content = blogContent.trim();

    if (!title) {
      toast({ variant: "destructive", description: "Please enter a blog title." });
      return;
    }
    if (!slug) {
      toast({ variant: "destructive", description: "Please enter a slug." });
      return;
    }
    if (!content) {
      toast({ variant: "destructive", description: "Please enter blog content." });
      return;
    }

    setCreatingBlogPost(true);
    const res = await adminCreateBlogPost({
      title,
      slug,
      content,
      imageUrl: blogImageUrl.trim(),
      isPublished: blogPublished,
    });
    setCreatingBlogPost(false);

    if (!res.success) {
      toast({ variant: "destructive", description: res.message || "Failed to publish blog post." });
      return;
    }

    toast({ description: "Blog post created successfully." });
    setBlogTitle("");
    setBlogSlug("");
    setBlogImageUrl("");
    setBlogContent("");
    setBlogPublished(true);
  };

  if (authorized === null) return <div style={{ padding: 40 }}>Checking access...</div>;
  if (authorized === false) return null;

  const sectionCardClass =
    "bg-[#0b1a4a] rounded-xl p-6 border border-blue-800 space-y-4";

  const inputClass =
    "w-full px-3 py-2 rounded-md bg-[#071235] border border-blue-800 text-white placeholder:text-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500/40";

  const selectClass =
    "w-full px-3 py-2 rounded-md bg-[#071235] border border-blue-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40";

  const buttonClass =
    "px-4 py-2 rounded-md bg-[#FFD700] text-[#050B2D] font-semibold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed";

  const ghostButtonClass =
    "px-3 py-2 rounded-md border border-blue-800 text-white hover:bg-white/5 disabled:opacity-60 disabled:cursor-not-allowed";

  const badgeBase =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border";

  const filteredProducts = products
    .filter((p) =>
      (p.title ?? "").toLowerCase().includes(productSearch.toLowerCase())
    )
    .filter((p) =>
      productCategoryFilter ? (p.category_id ?? "") === productCategoryFilter : true
    );

  const productsTotalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  );
  const safeProductPage = Math.min(
    Math.max(1, productPage),
    productsTotalPages
  );
  const productPageStart = (safeProductPage - 1) * PRODUCTS_PER_PAGE;
  const pagedProducts = filteredProducts.slice(
    productPageStart,
    productPageStart + PRODUCTS_PER_PAGE
  );

  const getCategoryType = () => {
    const cat = categories.find((c) => c.id === selectedCategory)?.name?.toLowerCase() || "";

    if (cat.includes("islamic")) return "islamic";
    if (cat.includes("novel")) return "novel";
    if (cat.includes("study")) return "study";

    return "other";
  };

  const categoryType = getCategoryType();

  const getCategoryTypeForBook = (categoryId: string | null) => {
    const cat = categories.find((c) => c.id === categoryId)?.name?.toLowerCase() || "";
    if (cat.includes("islamic")) return "islamic";
    if (cat.includes("novel")) return "novel";
    if (cat.includes("study")) return "study";
    return "other";
  };

  const metaBookCategoryType = selectedBookForMeta
    ? getCategoryTypeForBook(selectedBookForMeta.category_id)
    : "other";

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-8 py-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Admin Dashboard</h2>
          <p className="text-blue-200/80 text-sm mt-1">Manage products, deals, banners, blogs, courses, and orders.</p>
        </div>
        {pendingReviewCount > 0 ? (
          <span className="inline-flex items-center rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-200 text-sm font-semibold px-3 py-1.5">
            New Reviews ({pendingReviewCount})
          </span>
        ) : null}
      </div>

      {/* ===== Create Coupon ===== */}
      <section className={sectionCardClass}>
        <h3 className="text-lg font-semibold text-white">Create Coupon</h3>
        <form onSubmit={handleCreateCoupon} className="grid gap-3 max-w-lg">
          <input
            placeholder="Coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className={inputClass}
          />
          <select
            value={couponDiscountType}
            onChange={(e) => setCouponDiscountType(e.target.value as "percentage" | "fixed")}
            className={selectClass}
          >
            <option value="percentage">Percentage discount</option>
            <option value="fixed">Fixed amount discount</option>
          </select>
          <input
            type="number"
            min="0"
            step={couponDiscountType === "percentage" ? 1 : 0.01}
            placeholder={couponDiscountType === "percentage" ? "e.g. 10 for 10%" : "e.g. 50 for Rs. 50"}
            value={couponDiscountValue}
            onChange={(e) => setCouponDiscountValue(e.target.value)}
            className={inputClass}
          />
          <label className="grid gap-1">
            <span className="text-sm text-blue-200/80">Expiry date</span>
            <input
              type="datetime-local"
              value={couponExpiresAt}
              onChange={(e) => setCouponExpiresAt(e.target.value)}
              className={inputClass}
            />
          </label>
          <input
            type="number"
            min="1"
            placeholder="Max usage (e.g. 100)"
            value={couponMaxUsage}
            onChange={(e) => setCouponMaxUsage(e.target.value)}
            className={inputClass}
          />
          <button type="submit" disabled={creatingCoupon} className={buttonClass}>
            {creatingCoupon ? "Creating..." : "Create Coupon"}
          </button>
        </form>
      </section>

      {/* ===== Add New Book ===== */}
      <section className={sectionCardClass}>
        <h3 className="text-lg font-semibold text-white">Add Book</h3>
        <form onSubmit={handleCreateBook} className="grid gap-3 max-w-lg">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={selectClass}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={selectedPublisher}
            onChange={(e) => setSelectedPublisher(e.target.value)}
            className={selectClass}
          >
            <option value="">Select Publisher</option>
            {publishers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
            <option value="other">Other</option>
          </select>
          {selectedPublisher === "other" && (
            <input
              type="text"
              placeholder="Enter publisher name"
              value={newPublisherName}
              onChange={(e) => setNewPublisherName(e.target.value)}
              className="w-full mt-2 px-3 py-2 rounded-md bg-[#0b1a4a] border border-white/20 text-white"
            />
          )}

          <input
            placeholder="Language (e.g. English / Urdu)"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={inputClass}
          />

          {(categoryType === "novel" || categoryType === "islamic") && (
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className={selectClass}
            >
              <option value="">Select Genre</option>
              {genres
                .filter((g) => g.type === categoryType)
                .map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
            </select>
          )}

          {categoryType === "study" && (
            <>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className={selectClass}
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className={selectClass}
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </>
          )}

          <input
            placeholder="Title"
            value={bookTitle}
            onChange={(e) => setBookTitle(e.target.value)}
            className={inputClass}
          />

          <input
            placeholder="Price"
            type="number"
            min="0"
            step="1"
            value={bookPrice}
            onChange={(e) => setBookPrice(e.target.value)}
            className={inputClass}
          />

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              const files = e.target.files ? Array.from(e.target.files) : [];
              setSelectedImages(files);
            }}
            className="text-sm text-blue-200/80 file:mr-4 file:rounded-md file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white hover:file:bg-white/15"
          />

          <textarea
            placeholder="Description (optional)"
            value={bookDescription}
            onChange={(e) => setBookDescription(e.target.value)}
            rows={3}
            className={`${inputClass} min-h-[90px]`}
          />

          <button type="submit" disabled={creatingBook} className={buttonClass}>
            {creatingBook ? "Creating..." : "Add Book"}
          </button>
        </form>
      </section>

      {/* ===== Manage Products ===== */}
      <section className={sectionCardClass}>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-lg font-semibold text-white">Manage Products</h3>
            <p className="text-blue-200/80 text-sm">10 products per page • Search + Category filter</p>
          </div>
          <div className="text-sm text-blue-200/80">
            Showing <span className="font-semibold text-white">{filteredProducts.length}</span> product(s)
          </div>
        </div>
        {productsLoading ? (
          <p className="text-blue-200/80">Loading products...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="grid gap-1">
                  <span className="text-sm text-blue-200/80">Search</span>
                  <input
                    placeholder="Search product title..."
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setProductPage(1);
                    }}
                    className={inputClass}
                  />
                </label>
              </div>
              <div>
                <label className="grid gap-1">
                  <span className="text-sm text-blue-200/80">Category</span>
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => {
                      setProductCategoryFilter(e.target.value);
                      setProductPage(1);
                    }}
                    className={selectClass}
                  >
                    <option value="">All categories</option>
                    {categoriesForFilter.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-blue-800">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-blue-100">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3">Title</th>
                    <th className="text-left font-semibold px-4 py-3">Price</th>
                    <th className="text-left font-semibold px-4 py-3">Stock</th>
                    <th className="text-left font-semibold px-4 py-3">Status</th>
                    <th className="text-left font-semibold px-4 py-3">Stock Badge</th>
                    <th className="text-left font-semibold px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-800/60">
                {pagedProducts.map((product) => {
                const isActive = !!product.is_active;
                const hasLowStock =
                  product.stock !== null &&
                  product.low_stock_threshold !== null &&
                  product.stock <= product.low_stock_threshold;
                const outOfStock = (product.stock ?? 0) === 0;

                const handleToggleActive = async () => {
                  if (!authorized) {
                    toast({
                      variant: "destructive",
                      description: "You do not have permission to change product status.",
                    });
                    return;
                  }

                  const newStatus = !isActive;
                  const res = await adminSetBookActive({ id: product.id, is_active: newStatus });
                  if (!res.success) {
                    console.error("Failed to update product status:", res.message);
                    toast({
                      variant: "destructive",
                      description: "Failed to update product status. Please try again.",
                    });
                    return;
                  }

                  fetchProducts();
                };

                return (
                  <tr
                    key={product.id}
                    className={hasLowStock ? "bg-orange-500/10" : ""}
                  >
                    <td className="px-4 py-3 text-white">
                      <div className="font-medium">{product.title ?? "Untitled"}</div>
                      <div className="text-xs text-blue-200/70">ID: {product.id}</div>
                    </td>
                    <td className="px-4 py-3 text-white">Rs. {product.price ?? 0}</td>
                    <td className="px-4 py-3 text-white">{product.stock ?? 0}</td>
                    <td className="px-4 py-3 text-white">{isActive ? "Active" : "Inactive"}</td>
                    <td className="px-4 py-3">
                      {outOfStock ? (
                        <span className={`${badgeBase} bg-red-500/15 border-red-500/30 text-red-200`}>
                          Out of Stock
                        </span>
                      ) : hasLowStock ? (
                        <span className={`${badgeBase} bg-orange-500/15 border-orange-500/30 text-orange-200`}>
                          Low Stock
                        </span>
                      ) : (
                        <span className={`${badgeBase} bg-emerald-500/15 border-emerald-500/30 text-emerald-200`}>
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={handleToggleActive}
                          className={ghostButtonClass}
                        >
                          {isActive ? "Set Inactive" : "Set Active"}
                        </button>
                        <button
                          onClick={() => openEditProduct(product)}
                          className={ghostButtonClass}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedBookForMeta(product)}
                          className={ghostButtonClass}
                        >
                          Manage Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <button
                className={ghostButtonClass}
                onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                disabled={safeProductPage <= 1}
              >
                Previous
              </button>
              <div className="flex items-center gap-2 flex-wrap">
                {Array.from({ length: productsTotalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    className={
                      n === safeProductPage
                        ? "px-3 py-2 rounded-md bg-white/10 border border-blue-700 text-white font-semibold"
                        : "px-3 py-2 rounded-md border border-blue-800 text-blue-100 hover:bg-white/5"
                    }
                    onClick={() => setProductPage(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button
                className={ghostButtonClass}
                onClick={() => setProductPage((p) => Math.min(productsTotalPages, p + 1))}
                disabled={safeProductPage >= productsTotalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>

      {/* ===== Manage Book Details (use table action) ===== */}
      <section className={sectionCardClass}>
        <h3 className="text-lg font-semibold text-white">Manage Book Details</h3>
        <p className="text-blue-200/80 text-sm max-w-2xl">
          Update publisher, language, and category-specific fields (genre or subject/class) for an existing book.
          In <span className="text-white font-medium">Manage Products</span> above, click{" "}
          <span className="text-white font-medium">Manage Details</span> on a row to open the editor.
        </p>
      </section>

      {/* ===== Manage Reviews ===== */}
      <section className={sectionCardClass}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between flex-wrap">
          <div>
            <h3 className="text-lg font-semibold text-white">Manage Reviews</h3>
            <p className="text-blue-200/80 text-sm">Approve or remove product and store reviews.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "approved"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setReviewFilter(f)}
                className={
                  reviewFilter === f
                    ? "px-3 py-2 rounded-md bg-white/10 border border-blue-700 text-white font-semibold text-sm"
                    : `${ghostButtonClass} text-sm`
                }
              >
                {f === "all" ? "All" : f === "pending" ? "Pending" : "Approved"}
              </button>
            ))}
          </div>
        </div>

        {reviewsLoading ? (
          <p className="text-blue-200/80">Loading reviews...</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-blue-800">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-blue-100">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">User Name</th>
                  <th className="text-left font-semibold px-4 py-3">Phone</th>
                  <th className="text-left font-semibold px-4 py-3">Product ID</th>
                  <th className="text-left font-semibold px-4 py-3">Rating</th>
                  <th className="text-left font-semibold px-4 py-3">Review Text</th>
                  <th className="text-left font-semibold px-4 py-3">Status</th>
                  <th className="text-left font-semibold px-4 py-3">Date</th>
                  <th className="text-left font-semibold px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-800/60">
                {filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-blue-200/80">
                      No reviews in this filter.
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map((rev) => {
                    const pendingRow = rev.is_approved === false && rev.is_deleted === false;
                    const statusLabel = rev.is_deleted
                      ? "Deleted"
                      : rev.is_approved === false
                        ? "Pending"
                        : "Approved";
                    return (
                      <tr
                        key={rev.id}
                        className={pendingRow ? "bg-yellow-500/10" : ""}
                      >
                        <td className="px-4 py-3 text-white align-top max-w-[140px]">
                          {rev.user_name?.trim() || "—"}
                        </td>
                        <td className="px-4 py-3 text-white align-top whitespace-nowrap">
                          {rev.phone?.trim() || "—"}
                        </td>
                        <td className="px-4 py-3 text-white align-top font-mono text-xs max-w-[120px] break-all">
                          {rev.product_id ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-white align-top">{rev.rating}</td>
                        <td className="px-4 py-3 text-white align-top max-w-[220px]">
                          <span className="line-clamp-3">{rev.comment?.trim() || "—"}</span>
                        </td>
                        <td className="px-4 py-3 text-white align-top whitespace-nowrap">{statusLabel}</td>
                        <td className="px-4 py-3 text-white align-top whitespace-nowrap text-xs">
                          {new Date(rev.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex flex-col gap-2 min-w-[100px]">
                            <button
                              type="button"
                              disabled={rev.is_approved === true || rev.is_deleted === true}
                              onClick={() => approveReview(rev.id)}
                              className={ghostButtonClass}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={rev.is_deleted === true}
                              onClick={() => softDeleteReview(rev.id)}
                              className="px-3 py-2 rounded-md border border-red-500/40 text-red-200 hover:bg-red-500/10 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ===== Deals Manager ===== */}
      <section className={sectionCardClass}>
        <h3 className="text-lg font-semibold text-white">Deals Manager</h3>
        <form onSubmit={handleCreateDeal} className="grid gap-3 max-w-2xl">
          <label className="grid gap-1">
            <span className="text-sm text-blue-200/80">Deal Type</span>
            <select
              value={dealType}
              onChange={(e) => setDealType(e.target.value as "product" | "custom")}
              className={selectClass}
            >
              <option value="product">Product Deal</option>
              <option value="custom">Custom Deal</option>
            </select>
          </label>

          {dealType === "product" ? (
            <select
              value={dealBookId}
              onChange={(e) => setDealBookId(e.target.value)}
              className={selectClass}
            >
              <option value="">Select Book</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title ?? "Untitled"} {typeof p.price === "number" ? `- Rs ${p.price}` : ""}
                </option>
              ))}
            </select>
          ) : (
            <input
              placeholder="Title (Custom Deal)"
              value={dealTitle}
              onChange={(e) => setDealTitle(e.target.value)}
              className={inputClass}
            />
          )}
          <input
            type="number"
            min="0"
            step="1"
            placeholder="Deal Price"
            value={dealPrice}
            onChange={(e) => setDealPrice(e.target.value)}
            className={inputClass}
          />

          {dealType === "custom" ? (
            <label className="grid gap-1">
              <span className="text-sm text-blue-200/80">Image Upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCustomDealImage(e.target.files?.[0] ?? null)}
                className="text-sm text-blue-200/80 file:mr-4 file:rounded-md file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white hover:file:bg-white/15"
              />
            </label>
          ) : null}

          <input
            placeholder="Badge (e.g. Limited, Hot, Save 20%)"
            value={dealBadge}
            onChange={(e) => setDealBadge(e.target.value)}
            className={inputClass}
          />
          <select
            value={dealSection}
            onChange={(e) => setDealSection(e.target.value as typeof dealSection)}
            className={selectClass}
          >
            <option value="Deal">New Deal Section</option>
            <option value="Trending">Trending Books</option>
            <option value="Best Seller">Best Sellers</option>
          </select>
          <button type="submit" disabled={creatingDeal} className={buttonClass}>
            {creatingDeal ? "Adding Deal..." : "Add Deal"}
          </button>
        </form>
      </section>

      {/* ===== Blog Manager ===== */}
      <section className={sectionCardClass}>
        <h3 className="text-lg font-semibold text-white">Blog Manager</h3>
        <form onSubmit={handleCreateBlogPost} className="grid gap-3 max-w-3xl">
          <input
            placeholder="Blog Title"
            value={blogTitle}
            onChange={(e) => setBlogTitle(e.target.value)}
            className={inputClass}
          />
          <input
            placeholder="Slug (e.g. back-to-school-deals)"
            value={blogSlug}
            onChange={(e) => setBlogSlug(e.target.value)}
            className={inputClass}
          />
          <input
            placeholder="Featured Image URL"
            value={blogImageUrl}
            onChange={(e) => setBlogImageUrl(e.target.value)}
            className={inputClass}
          />
          <textarea
            placeholder="Content"
            value={blogContent}
            onChange={(e) => setBlogContent(e.target.value)}
            rows={6}
            className={`${inputClass} min-h-[140px]`}
          />
          <label className="flex items-center gap-2 text-sm text-blue-200/90">
            <input
              type="checkbox"
              checked={blogPublished}
              onChange={(e) => setBlogPublished(e.target.checked)}
            />
            <span>Publish immediately</span>
          </label>
          <button type="submit" disabled={creatingBlogPost} className={buttonClass}>
            {creatingBlogPost ? "Publishing..." : "Publish Blog"}
          </button>
        </form>
      </section>

      {/* ===== Manage Courses ===== */}

<section className={sectionCardClass}>
  <div className="flex flex-col gap-4">
    <h3 className="text-lg font-semibold text-white">
      Manage Courses
    </h3>

    <div>
      <CourseManager />
    </div>
  </div>
</section>

{/* ===== Banner Manager ===== */}
      {/* ===== Banner Manager ===== */}
      <section className={sectionCardClass}>
        <h3 className="text-lg font-semibold text-white">Banner Manager</h3>
        <form onSubmit={handleCreateBanner} className="grid gap-3 max-w-3xl">
          <label className="grid gap-1">
            <span className="text-sm text-blue-200/80">Image upload</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBannerImage(e.target.files?.[0] ?? null)}
              className="text-sm text-blue-200/80 file:mr-4 file:rounded-md file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white hover:file:bg-white/15"
            />
          </label>
          <input
            placeholder="Video URL (optional)"
            value={bannerVideoUrl}
            onChange={(e) => setBannerVideoUrl(e.target.value)}
            className={inputClass}
          />
          <input
            placeholder="Title"
            value={bannerTitle}
            onChange={(e) => setBannerTitle(e.target.value)}
            className={inputClass}
          />
          <input
            placeholder="Subtitle"
            value={bannerSubtitle}
            onChange={(e) => setBannerSubtitle(e.target.value)}
            className={inputClass}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              placeholder="Button Text"
              value={bannerButtonText}
              onChange={(e) => setBannerButtonText(e.target.value)}
              className={inputClass}
            />
            <input
              placeholder="Button Link (e.g. /deals)"
              value={bannerButtonLink}
              onChange={(e) => setBannerButtonLink(e.target.value)}
              className={inputClass}
            />
          </div>
          <input
            type="number"
            placeholder="Sort Order"
            value={bannerSortOrder}
            onChange={(e) => setBannerSortOrder(e.target.value)}
            className={inputClass}
          />
          <button type="submit" disabled={creatingBanner} className={buttonClass}>
            {creatingBanner ? "Creating..." : "Create Banner"}
          </button>
        </form>

        <div className="pt-2">
          <h4 className="text-white font-semibold mb-2">All Banners</h4>
          {bannersLoading ? (
            <p className="text-blue-200/80">Loading banners…</p>
          ) : banners.length === 0 ? (
            <p className="text-blue-200/80">No banners found.</p>
          ) : (
            <div className="grid gap-3">
              {banners.map((b) => (
                <div
                  key={b.id}
                  className="grid md:grid-cols-[160px_1fr] gap-3 p-3 rounded-lg border border-blue-800 bg-[#071235]"
                >
                  <div className="w-full h-24 rounded-lg overflow-hidden border border-blue-800 bg-[#0b1a4a] flex items-center justify-center">
                    {b.image_url ? (
                      <img src={b.image_url} alt={b.title ?? "Banner"} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-blue-200/80 text-xs">{b.video_url ? "Video banner" : "No preview"}</span>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="font-bold text-white">{b.title ?? "(Untitled)"}</div>
                        <div className="text-blue-200/70 text-xs">
                          Sort: {b.sort_order ?? 0} • {b.is_active ? "Active" : "Inactive"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleBannerActive(b.id, !(b.is_active === true))}
                          className={ghostButtonClass}
                        >
                          {b.is_active ? "Set Inactive" : "Set Active"}
                        </button>
                        <button
                          onClick={() => deleteBanner(b.id)}
                          className="px-3 py-2 rounded-md border border-red-500/40 text-red-200 hover:bg-red-500/10 font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {b.subtitle ? (
                      <div className="text-blue-200/80 text-sm">{b.subtitle}</div>
                    ) : null}
                    {b.button_text && b.button_link ? (
                      <div className="text-blue-200/70 text-xs">
                        CTA: {b.button_text} → {b.button_link}
                      </div>
                    ) : null}
                    {b.video_url ? (
                      <div className="text-blue-200/70 text-xs">Video: {b.video_url}</div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== Orders Table ===== */}
      <section className={sectionCardClass}>
        <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Orders Table</h3>
            <p className="text-blue-200/80 text-sm">Key metrics and recent orders.</p>
          </div>
        </div>

        {/* Dashboard Stats inline with Orders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard label="Total Orders" value={totalOrders} />
          <StatCard label="Pending" value={pendingOrders} />
          <StatCard label="Completed" value={completedOrders} />
          <StatCard label="Today's Orders" value={todayOrders} />
          <StatCard label="Revenue" value={`Rs ${totalRevenue}`} />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="md:col-span-2">
            <input
              placeholder="Search by name or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={selectClass}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {ordersLoading ? (
          <p className="text-blue-200/80">Loading orders...</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-blue-800">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-blue-100">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">Order Code</th>
                  <th className="text-left font-semibold px-4 py-3">Name</th>
                  <th className="text-left font-semibold px-4 py-3">Total</th>
                  <th className="text-left font-semibold px-4 py-3">Status</th>
                  <th className="text-left font-semibold px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-800/60">
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 text-white">{order.order_code}</td>
                    <td className="px-4 py-3 text-white">{order.customer_name}</td>
                    <td className="px-4 py-3 text-white">{order.total_amount}</td>
                    <td className="px-4 py-3 text-white">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={selectClass}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openOrderDetails(order)} className={ghostButtonClass}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ===== FULL PROFESSIONAL MODAL ===== */}
      {selectedOrder && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2>Order Details</h2>

            {/* Customer */}
            <section style={sectionStyle}>
              <h3>Customer Info</h3>
              <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
              <p><strong>Primary Phone:</strong> {selectedOrder.phone}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p><strong>Order Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
            </section>

            {/* Delivery */}
            <section style={sectionStyle}>
              <h3>Delivery Info</h3>
              <p><strong>Delivery Method:</strong> {selectedOrder.delivery_method || "-"}</p>
              {selectedOrder.delivery_method === "pickup" && (
                <p><strong>Pickup Branch:</strong> {selectedOrder.branch || "-"}</p>
              )}
            </section>

            {(selectedOrder.address || selectedOrder.google_maps_url) && (
              <section style={sectionStyle}>
                <h3>Location Info</h3>
                {selectedOrder.address && (
                  <p><strong>Address:</strong> {selectedOrder.address}</p>
                )}
                {selectedOrder.google_maps_url && (
                  <p>
                    <a href={selectedOrder.google_maps_url} target="_blank" rel="noreferrer">
                      Open in Google Maps
                    </a>
                  </p>
                )}
              </section>
            )}

            {/* Payment */}
            <section style={sectionStyle}>
              <h3>Payment Info</h3>
              <p><strong>Payment Method:</strong> {selectedOrder.payment_method || "-"}</p>
            </section>

            {/* Items */}
            <section style={sectionStyle}>
              <h3>Ordered Items</h3>
              {loadingItems ? (
                <p>Loading...</p>
              ) : (
                <table border={1} cellPadding={6} style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th>Book</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item, index) => (
                      <tr key={index}>
                        <td>
                          {Array.isArray(item.books)
                            ? item.books[0]?.title
                            : item.books?.title}
                        </td>
                        <td>{item.quantity}</td>
                        <td>{item.price_at_time}</td>
                        <td>{item.quantity * item.price_at_time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section style={sectionStyle}>
              <h3>Summary</h3>
              <p><strong>Total Items:</strong> {orderItems.reduce((sum, i) => sum + i.quantity, 0)}</p>
              <p><strong>Grand Total:</strong> Rs {selectedOrder.total_amount}</p>
            </section>

            {/* Printable Invoice (Hidden) */}
            <div id="invoice-print-area" style={{ display: "none" }}>
              <h2 style={{ margin: 0 }}>Umar Kitab Ghar</h2>
              <div style={{ fontSize: 12, marginTop: 6 }}>
                <div><strong>Order Code:</strong> {selectedOrder.order_code}</div>
                <div><strong>Order Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</div>
              </div>
              <hr />

              <div style={{ fontSize: 12 }}>
                <div><strong>Customer:</strong> {selectedOrder.customer_name}</div>
                <div><strong>Phone:</strong> {selectedOrder.phone}</div>
                {selectedOrder.address && (
                  <div><strong>Address:</strong> {selectedOrder.address}</div>
                )}
                {selectedOrder.google_maps_url && (
                  <div><strong>Map:</strong> {selectedOrder.google_maps_url}</div>
                )}
                <div><strong>Delivery Method:</strong> {selectedOrder.delivery_method || "-"}</div>
                <div><strong>Payment Method:</strong> {selectedOrder.payment_method || "-"}</div>
              </div>

              <hr />

              <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Items</h3>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => (
                    <tr key={`inv-${index}`}>
                      <td>
                        {Array.isArray(item.books)
                          ? item.books[0]?.title
                          : item.books?.title}
                      </td>
                      <td>{item.quantity}</td>
                      <td>{item.quantity * item.price_at_time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <hr />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <strong>Grand Total</strong>
                <strong>Rs {selectedOrder.total_amount}</strong>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <button onClick={handlePrintInvoice} style={{ marginRight: 10 }}>
                Print Invoice
              </button>
              <button onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Manage Book Details Modal ===== */}
      {selectedBookForMeta && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ marginTop: 0 }}>Manage Book Details</h2>
            <p style={{ opacity: 0.85, marginBottom: 16 }}>
              {selectedBookForMeta.title ?? "Untitled"}{" "}
              <span style={{ fontSize: 12, opacity: 0.75 }}>(ID: {selectedBookForMeta.id})</span>
            </p>

            <div style={{ display: "grid", gap: 12 }}>
              <select
                value={metaPublisher}
                onChange={(e) => setMetaPublisher(e.target.value)}
                className={selectClass}
              >
                <option value="">Select Publisher</option>
                {publishers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <input
                placeholder="Language"
                value={metaLanguage}
                onChange={(e) => setMetaLanguage(e.target.value)}
                className={inputClass}
              />

              {(metaBookCategoryType === "novel" || metaBookCategoryType === "islamic") && (
                <select
                  value={metaGenre}
                  onChange={(e) => setMetaGenre(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select Genre</option>
                  {genres
                    .filter((g) => g.type === metaBookCategoryType)
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                </select>
              )}

              {metaBookCategoryType === "study" && (
                <>
                  <select
                    value={metaSubject}
                    onChange={(e) => setMetaSubject(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={metaClass}
                    onChange={(e) => setMetaClass(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setSelectedBookForMeta(null)}
                  className={ghostButtonClass}
                  disabled={savingBookMeta}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={updateBookMeta}
                  className={buttonClass}
                  disabled={savingBookMeta}
                >
                  {savingBookMeta ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Edit Product Modal ===== */}
      {editingProduct && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2>Edit Product</h2>
            <form onSubmit={handleSaveProduct} style={{ display: "grid", gap: 12, marginTop: 10 }}>
              <div>
                <label>
                  <div>Title</div>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 10,
                      boxSizing: "border-box",
                      background: "hsl(var(--background))",
                      color: "hsl(var(--foreground))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 6,
                    }}
                  />
                </label>
              </div>

              <div>
                <label>
                  <div>Price</div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 10,
                      boxSizing: "border-box",
                      background: "hsl(var(--background))",
                      color: "hsl(var(--foreground))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 6,
                    }}
                  />
                </label>
              </div>

              <div>
                <label>
                  <div>Description</div>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 10,
                      resize: "vertical",
                      boxSizing: "border-box",
                      background: "hsl(var(--background))",
                      color: "hsl(var(--foreground))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 6,
                    }}
                  />
                </label>
              </div>

              <div>
                <strong>Current Stock:</strong> {editingProduct.stock ?? 0}
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label>
                  <div>Set Stock (absolute value)</div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={editSetStock}
                    onChange={(e) => setEditSetStock(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 10,
                      boxSizing: "border-box",
                      background: "hsl(var(--background))",
                      color: "hsl(var(--foreground))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 6,
                    }}
                  />
                </label>

                <label>
                  <div>Increase Stock (add quantity)</div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={editIncreaseStock}
                    onChange={(e) => setEditIncreaseStock(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 10,
                      boxSizing: "border-box",
                      background: "hsl(var(--background))",
                      color: "hsl(var(--foreground))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 6,
                    }}
                  />
                </label>

                <label>
                  <div>Decrease Stock (subtract quantity)</div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={editDecreaseStock}
                    onChange={(e) => setEditDecreaseStock(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 10,
                      boxSizing: "border-box",
                      background: "hsl(var(--background))",
                      color: "hsl(var(--foreground))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 6,
                    }}
                  />
                </label>
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                />
                <span>Active</span>
              </label>

              <div style={{ textAlign: "right", marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  style={{ marginRight: 10 }}
                  disabled={savingProduct}
                >
                  Cancel
                </button>
                <button type="submit" disabled={savingProduct}>
                  {savingProduct ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-blue-800 bg-[#071235] p-4 text-center">
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-sm text-blue-200/80 mt-1">{label}</div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modalStyle: React.CSSProperties = {
  background: "hsl(var(--card))",
  padding: 30,
  width: 700,
  maxHeight: "85vh",
  overflowY: "auto",
  borderRadius: 8,
  border: "1px solid hsl(var(--border))",
  color: "hsl(var(--foreground))"
};

const sectionStyle: React.CSSProperties = {
  marginBottom: 25,
  paddingBottom: 15,
  borderBottom: "1px solid hsl(var(--border))"
};