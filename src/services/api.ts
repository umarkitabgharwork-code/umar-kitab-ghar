/**
 * API layer for the application
 * Product data from Supabase books table; categories and blog posts use mock data
 */

import { Product, ProductType, ProductCategory, Category, BlogPost, BlogPostRow, ApiResponse } from "@/types";
import { supabase } from "@/lib/supabase";

function handleError(error: unknown, context: string) {
  console.error(`[API ERROR] ${context}:`, error);
}

function baseBooksQuery() {
  return supabase
    .from("books")
    .select(
      `
      id,
      title,
      price,
      image_url,
      description,
      category_id,
      created_at,
      stock,
      is_active,
      product_images (
        image_url
      )
    `,
      { count: "exact" }
    )
    .eq("is_active", true);
}

async function getCategoryBySlug(slug: string) {
  const normalized = slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name")
    .in("slug", [slug, normalized])
    .maybeSingle();

  if (error && (error as { code?: string }).code !== "PGRST116") {
    handleError(error, "getCategoryBySlug");
    return null;
  }

  return data;
}

// Mock categories data
const mockCategories: Category[] = [
  {
    id: "1",
    name: "Islamic Books / Holy Quran",
    description: "Quran, Islamic literature, and religious texts",
    href: "/stationery/islamic-books",
    count: 150,
  },
  {
    id: "2",
    name: "Novels",
    description: "Fiction, non-fiction, and story books",
    href: "/stationery/novels",
    count: 200,
  },
  {
    id: "3",
    name: "Colors & Markers",
    description: "Crayons, markers, color pencils, and paints",
    href: "/stationery/colors-markers",
    count: 85,
  },
  {
    id: "4",
    name: "Files & Folders",
    description: "Document organizers, binders, and folders",
    href: "/stationery/files-folders",
    count: 60,
  },
  {
    id: "5",
    name: "Art Supplies",
    description: "Drawing materials, canvas, and craft supplies",
    href: "/stationery/art-supplies",
    count: 120,
  },
  {
    id: "6",
    name: "Notebooks",
    description: "Exercise books, registers, and journals",
    href: "/stationery/notebooks",
    count: 95,
  },
  {
    id: "7",
    name: "Loose Sheets",
    description: "Graph paper, lined sheets, and blank paper",
    href: "/stationery/loose-sheets",
    count: 40,
  },
  {
    id: "8",
    name: "General Stationery",
    description: "Pens, pencils, erasers, rulers, and more",
    href: "/stationery/general",
    count: 180,
  },
];

// Mock blog posts data
const mockBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "How to Choose the Right Stationery for Your Child",
    excerpt: "Discover the best stationery items that help improve your child's learning experience and creativity. We explore essential supplies every student needs.",
    category: "Tips & Guides",
    author: "Admin",
    date: "Dec 5, 2025",
    readTime: "5 min read",
    slug: "choose-stationery",
  },
  {
    id: "2",
    title: "The Importance of Quality School Books",
    excerpt: "Learn why investing in quality textbooks can make a significant difference in your child's education and academic performance.",
    category: "Education",
    author: "Admin",
    date: "Dec 3, 2025",
    readTime: "4 min read",
    slug: "quality-books",
  },
  {
    id: "3",
    title: "Top 10 Art Supplies for Beginners",
    excerpt: "A comprehensive guide to essential art supplies every beginner student should have in their collection.",
    category: "Art Supplies",
    author: "Admin",
    date: "Dec 1, 2025",
    readTime: "6 min read",
    slug: "art-supplies-beginners",
  },
  {
    id: "4",
    title: "Preparing for the New School Year: A Complete Checklist",
    excerpt: "Get ready for the new academic year with our comprehensive checklist of books, stationery, and supplies.",
    category: "School Books",
    author: "Admin",
    date: "Nov 28, 2025",
    readTime: "7 min read",
    slug: "school-year-checklist",
  },
  {
    id: "5",
    title: "Understanding Different Paper Types for Students",
    excerpt: "From graph paper to lined notebooks, learn which paper types work best for different subjects and purposes.",
    category: "Tips & Guides",
    author: "Admin",
    date: "Nov 25, 2025",
    readTime: "4 min read",
    slug: "paper-types",
  },
  {
    id: "6",
    title: "Best Islamic Books for Children",
    excerpt: "Explore our curated list of Islamic books perfect for introducing children to religious education.",
    category: "Islamic Books",
    author: "Admin",
    date: "Nov 22, 2025",
    readTime: "5 min read",
    slug: "islamic-books-children",
  },
];

type BookRow = {
  id: string;
  title: string | null;
  price: number | null;
  image_url: string | null;
  description?: string | null;
  category_id?: string | null;
  created_at?: string;
  stock?: number | null;
  is_active?: boolean | null;
  product_images?: {
    image_url: string | null;
  }[];
};

type CategoryRow = {
  id: string;
  slug: string | null;
  name?: string | null;
};

export type CategoryWithProducts = {
  category: CategoryRow | null;
  products: BookRow[];
  pagination: PaginationMeta;
};

export type PaginationMeta = {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
};

export type PaginatedProducts = {
  items: Product[];
  pagination: PaginationMeta;
};

/** Optional filters for `getProducts` — applied server-side on Supabase `books` */
export type ProductListFilters = {
  categoryId?: string;
  publisherId?: string;
  genreId?: string;
  subjectId?: string;
  classId?: string;
  sortOrder?: "low" | "high";
  /** Substring match on `language` (ilike) */
  language?: string;
  /** Substring match on book `title` (ilike) */
  titleSearch?: string;
};

/** Filters for category page — category is fixed by route slug (`category_id` resolved server-side). */
export type CategoryProductListFilters = Omit<ProductListFilters, "categoryId">;

function normalizeSlug(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // spaces to hyphens
    .replace(/[^a-z0-9-]/g, "") // remove special chars
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

export async function getCategoryWithProductsBySlug(
  slug: string,
  page = 1,
  limit = 12,
  filters?: CategoryProductListFilters
): Promise<ApiResponse<CategoryWithProducts>> {
  const normalizedInputSlug = normalizeSlug(slug);

  const pageSize = Math.max(1, Number.isFinite(limit) ? Number(limit) : 12);
  const currentPage = Math.max(1, Number.isFinite(page) ? Number(page) : 1);
  const emptyPagination: PaginationMeta = {
    total: 0,
    page: currentPage,
    totalPages: 1,
    limit: pageSize,
  };

  const category = await getCategoryBySlug(slug);
  const finalCategory = category as CategoryRow | null;

  if (!finalCategory) {
    console.warn(
      `Category not found for slug "${slug}". Tried normalized slug "${normalizedInputSlug}". Returning empty product list.`
    );
    return {
      data: { category: null, products: [], pagination: emptyPagination },
      success: true,
      message: `Category not found for slug: ${slug}`,
    };
  }

  const offset = (currentPage - 1) * pageSize;

  // Books are scoped to this category (slug resolved to category row above).
  // If your schema adds `books.category_slug`, you can switch to .eq("category_slug", slug) here.
  let booksQuery = baseBooksQuery().eq("category_id", finalCategory.id);

  if (filters?.publisherId) booksQuery = booksQuery.eq("publisher_id", filters.publisherId);
  if (filters?.genreId) booksQuery = booksQuery.eq("genre_id", filters.genreId);
  if (filters?.subjectId) booksQuery = booksQuery.eq("subject_id", filters.subjectId);
  if (filters?.classId) booksQuery = booksQuery.eq("class_id", filters.classId);
  const langTrim = filters?.language?.trim();
  if (langTrim) booksQuery = booksQuery.ilike("language", `%${langTrim}%`);
  const titleTrim = filters?.titleSearch?.trim();
  if (titleTrim) booksQuery = booksQuery.ilike("title", `%${titleTrim}%`);

  if (filters?.sortOrder === "low") {
    booksQuery = booksQuery.order("price", { ascending: true });
  } else if (filters?.sortOrder === "high") {
    booksQuery = booksQuery.order("price", { ascending: false });
  } else {
    booksQuery = booksQuery.order("created_at", { ascending: false });
  }

  const { data: books, error: booksError, count } = await booksQuery.range(
    offset,
    offset + pageSize - 1
  );

  if (booksError) {
    handleError(booksError, "getCategoryWithProductsBySlug");
    return {
      data: { category: finalCategory, products: [], pagination: emptyPagination },
      success: false,
      message: booksError.message,
    };
  }

  const totalCount = typeof count === "number" ? count : (books ?? []).length;

  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(totalCount / pageSize)) : 1;

  const pagination: PaginationMeta = {
    total: totalCount,
    page: currentPage,
    totalPages,
    limit: pageSize,
  };

  return {
    data: {
      category: finalCategory,
      products: (books ?? []) as BookRow[],
      pagination,
    },
    success: true,
  };
}

function mapBookToProduct(
  book: BookRow,
  overrides?: Partial<Pick<Product, "type" | "category">>
): Product {
  const primaryImage =
    book.product_images && book.product_images.length > 0
      ? book.product_images[0]?.image_url ?? null
      : null;

  return {
    id: book.id,
    name: book.title ?? "",
    price: book.price ?? 0,
    type: overrides?.type ?? "book",
    category: overrides?.category ?? "study",
    image: primaryImage ?? book.image_url ?? undefined,
    description: book.description ?? undefined,
    inStock: (book.stock ?? 0) > 0,
    stock: typeof book.stock === "number" ? Number(book.stock) : undefined,
  };
}

export async function getProductsByCategorySlug(
  slug: ProductCategory,
  type: ProductType
): Promise<ApiResponse<Product[]>> {
  const normalizedInputSlug = normalizeSlug(slug);

  const category = await getCategoryBySlug(slug);
  const finalCategory = category as CategoryRow | null;

  if (!finalCategory) {
    console.warn(
      `Category not found for slug "${slug}". Tried normalized slug "${normalizedInputSlug}". Returning empty product list.`
    );
    return {
      data: [],
      success: true,
      message: `Category not found for slug: ${slug}`,
    };
  }

  const categoryId = finalCategory.id;

  const { data: books, error: booksError } = await baseBooksQuery()
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false });

  if (booksError) {
    handleError(booksError, "getProductsByCategorySlug");
    return {
      data: [],
      success: false,
      message: booksError.message,
    };
  }

  const products: Product[] = (books ?? []).map((book) =>
    mapBookToProduct(book as BookRow, { type, category: slug })
  );

  return {
    data: products,
    success: true,
  };
}

/**
 * Get all products from Supabase books table
 * @param type - Optional product type filter (ignored for now; all books are type "book")
 * @param category - Optional product category filter (ignored for now; all use "study")
 */
export async function getProducts(
  page = 1,
  limit = 12,
  filters?: ProductListFilters
): Promise<ApiResponse<PaginatedProducts>> {
  const pageSize = Math.max(1, Number.isFinite(limit) ? Number(limit) : 12);
  const currentPage = Math.max(1, Number.isFinite(page) ? Number(page) : 1);
  const offset = (currentPage - 1) * pageSize;

  let query = baseBooksQuery();

  if (filters?.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters?.publisherId) query = query.eq("publisher_id", filters.publisherId);
  if (filters?.genreId) query = query.eq("genre_id", filters.genreId);
  if (filters?.subjectId) query = query.eq("subject_id", filters.subjectId);
  if (filters?.classId) query = query.eq("class_id", filters.classId);
  const langTrim = filters?.language?.trim();
  if (langTrim) query = query.ilike("language", `%${langTrim}%`);
  const titleTrim = filters?.titleSearch?.trim();
  if (titleTrim) query = query.ilike("title", `%${titleTrim}%`);

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    handleError(error, "getProducts");
    return {
      data: { items: [], pagination: { total: 0, page: currentPage, totalPages: 1, limit: pageSize } },
      success: false,
      message: error.message,
    };
  }

  const products: Product[] = (data ?? []).map((book) =>
    mapBookToProduct(book as BookRow)
  );

  const total = typeof count === "number" ? count : products.length;
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;

  return {
    data: {
      items: products,
      pagination: {
        total,
        page: currentPage,
        totalPages,
        limit: pageSize,
      },
    },
    success: true,
  };
}

/**
 * Get product by ID from Supabase books table
 */
export async function getProductById(id: string): Promise<ApiResponse<Product | null>> {
  const { data, error } = await baseBooksQuery().eq("id", id).maybeSingle();

  if (error) {
    handleError(error, "getProductById");
    return {
      data: null,
      success: false,
      message: error.message,
    };
  }

  const product = data ? mapBookToProduct(data as BookRow) : null;
  return {
    data: product,
    success: product !== null,
    message: product ? undefined : "Product not found",
  };
}

/**
 * Get related products for a product detail page.
 * Products are from the same category, active, and exclude the current product.
 * Limited to 4 results.
 */
export async function getRelatedProducts(
  categoryId: string | null,
  excludeProductId: string
): Promise<ApiResponse<Product[]>> {
  if (!categoryId) {
    return { data: [], success: true };
  }

  const { data, error } = await baseBooksQuery()
    .eq("category_id", categoryId)
    .neq("id", excludeProductId)
    .order("created_at", { ascending: false })
    .limit(4);

  if (error) {
    handleError(error, "getRelatedProducts");
    return {
      data: [],
      success: false,
      message: error.message,
    };
  }

  const products: Product[] = (data ?? []).map((book) =>
    mapBookToProduct(book as BookRow)
  );

  return {
    data: products,
    success: true,
  };
}

/** Product detail shape for single product page (books + product_images) */
export type ProductDetail = {
  id: string;
  title: string | null;
  price: number | null;
  description: string | null;
  stock: number;
  is_active: boolean | null;
  category_id: string | null;
  category_name?: string | null;
  image_url: string | null;
  product_images: { book_id?: string; image_url: string | null }[];
};

/**
 * Get full product detail by ID for product page (books + product_images)
 */
export async function getProductDetail(
  id: string
): Promise<ApiResponse<ProductDetail | null>> {
  const { data, error } = await supabase
    .from("books")
    .select(
      `
      id,
      title,
      price,
      description,
      stock,
      is_active,
      category_id,
      image_url,
      categories (
        name
      ),
      product_images (
        book_id,
        image_url
      )
    `
    )
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    return {
      data: null,
      success: false,
      message: error.message,
    };
  }

  if (!data) {
    return { data: null, success: false, message: "Product not found" };
  }

  const row = data as {
    id: string;
    title: string | null;
    price: number | null;
    description: string | null;
    stock: number | null;
    is_active: boolean | null;
    category_id: string | null;
    image_url?: string | null;
    categories?: { name: string | null } | null;
    product_images: { book_id?: string; image_url: string | null }[];
  };

  const product: ProductDetail = {
    id: row.id,
    title: row.title,
    price: row.price,
    description: row.description ?? null,
    stock: typeof row.stock === "number" ? row.stock : 0,
    is_active: row.is_active ?? null,
    category_id: row.category_id ?? null,
    category_name: row.categories?.name ?? null,
    image_url: row.image_url ?? null,
    product_images: row.product_images ?? [],
  };

  return { data: product, success: true };
}

// =========================
// Product reviews
// =========================

export type ProductReview = {
  id: string;
  book_id: string;
  user_id: string;
  reviewer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  verified_purchase: boolean;
};

export type ProductReviewsResponse = {
  reviews: ProductReview[];
  averageRating: number;
  totalCount: number;
};

/**
 * Get all reviews for a product.
 */
export async function getProductReviews(
  productId: string
): Promise<ApiResponse<ProductReviewsResponse>> {
  if (!productId) {
    return {
      data: { reviews: [], averageRating: 0, totalCount: 0 },
      success: false,
      message: "Missing product ID",
    };
  }

  const { data, error } = await supabase
    .from("product_reviews")
    .select("id, book_id, user_id, reviewer_name, rating, comment, created_at, verified_purchase")
    .eq("book_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      data: { reviews: [], averageRating: 0, totalCount: 0 },
      success: false,
      message: error.message,
    };
  }

  const rows = (data ?? []) as {
    id: string;
    book_id: string;
    user_id: string;
    reviewer_name: string | null;
    rating: number;
    comment: string | null;
    created_at: string;
    verified_purchase: boolean | null;
  }[];

  const reviews: ProductReview[] = rows.map((r) => ({
    id: r.id,
    book_id: r.book_id,
    user_id: r.user_id,
    reviewer_name: r.reviewer_name ?? "Anonymous",
    rating: r.rating,
    comment: r.comment ?? "",
    created_at: r.created_at,
    verified_purchase: r.verified_purchase ?? true,
  }));

  const totalCount = reviews.length;
  const averageRating =
    totalCount > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / totalCount) * 10) / 10
      : 0;

  return {
    data: { reviews, averageRating, totalCount },
    success: true,
  };
}

/**
 * Check if the current user has purchased the product (via phone matching orders).
 */
async function canUserReviewProduct(
  userId: string,
  productId: string,
  userPhone: string | null
): Promise<boolean> {
  if (!userPhone?.trim()) return false;

  const { data: orders } = await supabase
    .from("orders")
    .select("id")
    .eq("phone", userPhone.trim());

  const orderIds = (orders ?? []).map((o) => (o as { id: string }).id);
  if (orderIds.length === 0) return false;

  const { data: items } = await supabase
    .from("order_items")
    .select("order_id")
    .in("order_id", orderIds)
    .eq("book_id", productId)
    .limit(1);

  return (items ?? []).length > 0;
}

/**
 * Submit a review for a product.
 * Requires: logged-in user, purchased product.
 */
export async function submitReview(
  productId: string,
  rating: number,
  comment: string
): Promise<ApiResponse<ProductReview | null>> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return {
      data: null,
      success: false,
      message: "Please log in to submit a review.",
    };
  }
  const user = authData.user;
  if (!user?.id) {
    return {
      data: null,
      success: false,
      message: "Please log in to submit a review.",
    };
  }

  if (!productId) {
    return { data: null, success: false, message: "Invalid product." };
  }

  const r = Math.floor(rating);
  if (r < 1 || r > 5) {
    return { data: null, success: false, message: "Rating must be between 1 and 5." };
  }

  const profileRes = await getCustomerProfile(
    user.id,
    user.email,
    user.user_metadata ?? undefined
  );
  const userPhone = profileRes.success ? profileRes.data?.phone ?? null : null;

  const hasPurchased = await canUserReviewProduct(user.id, productId, userPhone);
  if (!hasPurchased) {
    return {
      data: null,
      success: false,
      message: "Only verified purchasers can leave a review.",
    };
  }

  const reviewerName =
    profileRes.success && profileRes.data?.name
      ? profileRes.data.name
      : user.email?.split("@")[0] ?? "Customer";

  const { data: existing } = await supabase
    .from("product_reviews")
    .select("id")
    .eq("book_id", productId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    const { data: updated, error: updateError } = await supabase
      .from("product_reviews")
      .update({
        rating: r,
        comment: comment.trim(),
        reviewer_name: reviewerName,
        updated_at: new Date().toISOString(),
      })
      .eq("book_id", productId)
      .eq("user_id", user.id)
      .select("id, book_id, user_id, reviewer_name, rating, comment, created_at, verified_purchase")
      .single();

    if (updateError) {
      return { data: null, success: false, message: updateError.message };
    }

    const row = updated as {
      id: string;
      book_id: string;
      user_id: string;
      reviewer_name: string | null;
      rating: number;
      comment: string | null;
      created_at: string;
      verified_purchase: boolean | null;
    };

    return {
      data: {
        id: row.id,
        book_id: row.book_id,
        user_id: row.user_id,
        reviewer_name: row.reviewer_name ?? "Anonymous",
        rating: row.rating,
        comment: row.comment ?? "",
        created_at: row.created_at,
        verified_purchase: row.verified_purchase ?? true,
      },
      success: true,
    };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("product_reviews")
    .insert({
      book_id: productId,
      user_id: user.id,
      reviewer_name: reviewerName,
      rating: r,
      comment: comment.trim(),
      verified_purchase: true,
    })
    .select("id, book_id, user_id, reviewer_name, rating, comment, created_at, verified_purchase")
    .single();

  if (insertError) {
    return { data: null, success: false, message: insertError.message };
  }

  const row = inserted as {
    id: string;
    book_id: string;
    user_id: string;
    reviewer_name: string | null;
    rating: number;
    comment: string | null;
    created_at: string;
    verified_purchase: boolean | null;
  };

  return {
    data: {
      id: row.id,
      book_id: row.book_id,
      user_id: row.user_id,
      reviewer_name: row.reviewer_name ?? "Anonymous",
      rating: row.rating,
      comment: row.comment ?? "",
      created_at: row.created_at,
      verified_purchase: row.verified_purchase ?? true,
    },
    success: true,
  };
}

/**
 * Check if the current user can review a product (logged in + purchased).
 */
export async function canCurrentUserReviewProduct(
  productId: string
): Promise<ApiResponse<{ canReview: boolean; reason?: string }>> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user?.id) {
    return {
      data: { canReview: false, reason: "Please log in to leave a review." },
      success: true,
    };
  }

  const profileRes = await getCustomerProfile(
    authData.user.id,
    authData.user.email,
    authData.user.user_metadata ?? undefined
  );
  const userPhone = profileRes.success ? profileRes.data?.phone ?? null : null;

  const hasPurchased = await canUserReviewProduct(
    authData.user.id,
    productId,
    userPhone
  );

  if (!hasPurchased) {
    return {
      data: { canReview: false, reason: "Only verified purchasers can leave a review. Add your phone to your account and ensure it matches the phone used at checkout." },
      success: true,
    };
  }

  return { data: { canReview: true }, success: true };
}

// =========================
// Wishlist
// =========================

export type WishlistItem = {
  id: string;
  book_id: string;
  product?: Product;
};

/**
 * Get wishlist for the current user.
 * Returns empty array if not logged in.
 */
export async function getWishlist(): Promise<ApiResponse<WishlistItem[]>> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user?.id) {
    return { data: [], success: true };
  }

  const { data, error } = await supabase
    .from("wishlists")
    .select("id, book_id")
    .eq("user_id", authData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], success: false, message: error.message };
  }

  const rows = (data ?? []) as { id: string; book_id: string }[];
  const bookIds = rows.map((r) => r.book_id).filter(Boolean);
  const items: WishlistItem[] = rows.map((r) => ({ id: r.id, book_id: r.book_id }));

  if (bookIds.length === 0) {
    return { data: items, success: true };
  }

  const { data: books } = await supabase
    .from("books")
    .select(
      `
      id,
      title,
      price,
      image_url,
      description,
      category_id,
      created_at,
      stock,
      is_active,
      product_images (
        image_url
      )
    `
    )
    .in("id", bookIds)
    .eq("is_active", true);

  const bookMap = new Map<string, BookRow>();
  (books ?? []).forEach((b) => bookMap.set((b as BookRow).id, b as BookRow));

  const enriched: WishlistItem[] = items.map((item) => {
    const book = bookMap.get(item.book_id);
    return {
      ...item,
      product: book ? mapBookToProduct(book) : undefined,
    };
  });

  return { data: enriched, success: true };
}

/**
 * Add product to wishlist.
 * Requires authenticated user.
 */
export async function addToWishlist(productId: string): Promise<ApiResponse<null>> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user?.id) {
    return { data: null, success: false, message: "Please log in to add to wishlist." };
  }

  const { error } = await supabase
    .from("wishlists")
    .insert({ user_id: authData.user.id, book_id: productId });

  if (error) {
    if ((error as { code?: string }).code === "23505") {
      return { data: null, success: true };
    }
    return { data: null, success: false, message: error.message };
  }
  return { data: null, success: true };
}

/**
 * Remove product from wishlist.
 * Requires authenticated user.
 */
export async function removeFromWishlist(productId: string): Promise<ApiResponse<null>> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user?.id) {
    return { data: null, success: false, message: "Please log in to modify wishlist." };
  }

  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", authData.user.id)
    .eq("book_id", productId);

  if (error) {
    return { data: null, success: false, message: error.message };
  }
  return { data: null, success: true };
}

/** Minimal product shape for search results */
export type SearchProduct = {
  id: string;
  title: string | null;
  price: number | null;
  image: string | null;
};

const SEARCH_RESULT_LIMIT = 5;

/**
 * Search products by title and category name (case-insensitive).
 * Returns up to SEARCH_RESULT_LIMIT results.
 */
export async function searchProducts(
  query: string
): Promise<ApiResponse<SearchProduct[]>> {
  const q = query.trim();
  if (!q) {
    return { data: [], success: true };
  }

  const pattern = `%${q}%`;

  const byId = new Map<string, SearchProduct>();

  const addBook = (row: {
    id: string;
    title: string | null;
    price: number | null;
    image_url?: string | null;
    product_images?: { image_url: string | null }[];
  }) => {
    const img = row.product_images?.[0]?.image_url ?? row.image_url ?? null;
    byId.set(row.id, {
      id: row.id,
      title: row.title ?? null,
      price: row.price ?? null,
      image: img ?? null,
    });
  };

  const { data: byTitle } = await supabase
    .from("books")
    .select("id, title, price, image_url, product_images(image_url)")
    .eq("is_active", true)
    .ilike("title", pattern)
    .limit(SEARCH_RESULT_LIMIT);

  type SearchBookRow = {
    id: string;
    title: string | null;
    price: number | null;
    image_url?: string | null;
    product_images?: { image_url: string | null }[];
  };

  (byTitle ?? []).forEach((row) => addBook(row as SearchBookRow));

  const { data: categoryRows } = await supabase
    .from("categories")
    .select("id")
    .ilike("name", pattern);

  const categoryIds = (categoryRows ?? []).map((c: { id: string }) => c.id);

  if (categoryIds.length > 0) {
    const { data: byCategory } = await supabase
      .from("books")
      .select("id, title, price, image_url, product_images(image_url)")
      .eq("is_active", true)
      .in("category_id", categoryIds)
      .limit(SEARCH_RESULT_LIMIT);

    (byCategory ?? []).forEach((row) => addBook(row as SearchBookRow));
  }

  const results = Array.from(byId.values()).slice(0, SEARCH_RESULT_LIMIT);

  return { data: results, success: true };
}

/**
 * Get latest stock for a product from Supabase books table
 */
export async function getProductStock(
  id: string
): Promise<ApiResponse<{ stock: number }>> {
  const { data, error } = await supabase
    .from("books")
    .select("stock, is_active")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return {
      data: { stock: 0 },
      success: false,
      message: error.message,
    };
  }

  const row = data as { stock: number | null; is_active: boolean | null } | null;

  if (!row || row.is_active !== true) {
    return {
      data: { stock: 0 },
      success: false,
      message: "Product is not available",
    };
  }

  const stockValue = typeof row.stock === "number" ? Number(row.stock) : 0;

  return {
    data: { stock: stockValue },
    success: true,
  };
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<ApiResponse<Category[]>> {
  return {
    data: mockCategories,
    success: true,
  };
}

/**
 * Get all blog posts
 */
export async function getBlogPosts(): Promise<ApiResponse<BlogPost[]>> {
  return {
    data: mockBlogPosts,
    success: true,
  };
}

/**
 * Get blog post by slug
 */
export async function getBlogPostBySlug(slug: string): Promise<ApiResponse<BlogPost | null>> {
  const post = mockBlogPosts.find((p) => p.slug === slug) || null;
  return {
    data: post,
    success: post !== null,
    message: post ? undefined : "Blog post not found",
  };
}

/**
 * Fetch published blog posts from Supabase (blog_posts table).
 * select id, title, slug, image_url, content, created_at
 * where is_published = true order by created_at desc
 */
export async function getPublishedBlogPosts(): Promise<ApiResponse<BlogPostRow[]>> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, image_url, content, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], success: false, message: error.message };
  }
  return { data: data ?? [], success: true };
}

/**
 * Fetch a single blog post by slug from Supabase.
 */
export async function getPublishedBlogPostBySlug(slug: string): Promise<ApiResponse<BlogPostRow | null>> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, image_url, content, created_at")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    return { data: null, success: false, message: error.message };
  }
  return { data, success: true, message: data ? undefined : "Blog post not found" };
}

// =========================
// Banners (Public + Admin)
// =========================

export type Banner = {
  id: string;
  title: string | null;
  subtitle: string | null;
  button_text: string | null;
  button_link: string | null;
  image_url: string | null;
  video_url: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  created_at?: string | null;
};

const demoBanners: Omit<Banner, "id">[] = [
  {
    title: "Islamic Books Collection",
    subtitle: "Explore Qur'an, Hadith, and authentic Islamic literature",
    button_text: "Shop Islamic Books",
    button_link: "/stationery/islamic-books",
    image_url: "https://picsum.photos/seed/islamic-books/1600/700",
    video_url: null,
    sort_order: 1,
    is_active: true,
  },
  {
    title: "Back to School Deals",
    subtitle: "Complete your child’s course with premium books & bundles",
    button_text: "Buy Course",
    button_link: "/buy-course",
    image_url: "https://picsum.photos/seed/back-to-school/1600/700",
    video_url: null,
    sort_order: 2,
    is_active: true,
  },
  {
    title: "Stationery Mega Sale",
    subtitle: "Notebooks, pens, art supplies and more — limited time",
    button_text: "Browse Stationery",
    button_link: "/stationery",
    image_url: "https://picsum.photos/seed/stationery-sale/1600/700",
    video_url: null,
    sort_order: 3,
    is_active: true,
  },
];

export async function getActiveBanners(): Promise<ApiResponse<Banner[]>> {
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return { data: [], success: false, message: error.message };
  }

  const rows = (data ?? []) as unknown[];

  if (rows.length > 0) {
    return { data: rows as Banner[], success: true };
  }

  // Demo banners: attempt to seed if table is empty (best effort).
  // If RLS prevents insert, we fall back to returning demo content client-side.
  const { error: seedError } = await supabase.from("banners").insert(demoBanners);
  if (!seedError) {
    const seeded = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (!seeded.error) {
      return { data: ((seeded.data ?? []) as unknown[]) as Banner[], success: true };
    }
  }

  return {
    data: demoBanners.map((b, i) => ({ ...b, id: `demo-${i + 1}` })),
    success: true,
  };
}

export type AdminCreateBannerParams = {
  imageFile: File;
  videoUrl?: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  sortOrder: number;
};

export async function adminCreateBanner(params: AdminCreateBannerParams): Promise<ApiResponse<{ bannerId: string }>> {
  const auth = await requireAdmin();
  if (!auth.success) return { data: { bannerId: "" }, success: false, message: auth.message };

  const title = params.title.trim();
  const subtitle = params.subtitle.trim();
  const buttonText = params.buttonText.trim();
  const buttonLink = params.buttonLink.trim();
  const videoUrl = (params.videoUrl ?? "").trim();
  const sortOrder = Number.isFinite(params.sortOrder) ? Number(params.sortOrder) : 0;

  if (!params.imageFile) {
    return { data: { bannerId: "" }, success: false, message: "Banner image is required." };
  }

  const file = params.imageFile;
  const ext = file.name.split(".").pop() || "jpg";
  const filePath = `banners/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, file);
  if (uploadError) {
    return { data: { bannerId: "" }, success: false, message: uploadError.message };
  }

  const { data: publicData } = supabase.storage.from("product-images").getPublicUrl(filePath);
  const imageUrl = publicData.publicUrl;

  const { data, error } = await supabase
    .from("banners")
    .insert([
      {
        title: title || null,
        subtitle: subtitle || null,
        button_text: buttonText || null,
        button_link: buttonLink || null,
        image_url: imageUrl,
        video_url: videoUrl || null,
        sort_order: sortOrder,
        is_active: true,
      },
    ])
    .select("id")
    .single();

  if (error) return { data: { bannerId: "" }, success: false, message: error.message };
  return { data: { bannerId: String((data as { id: unknown }).id) }, success: true };
}

export async function adminGetBanners(): Promise<ApiResponse<Banner[]>> {
  const auth = await requireAdmin();
  if (!auth.success) return { data: [], success: false, message: auth.message };

  const { data, error } = await supabase.from("banners").select("*").order("sort_order", { ascending: true });
  if (error) return { data: [], success: false, message: error.message };
  return { data: (data ?? []) as unknown as Banner[], success: true };
}

export async function adminSetBannerActive(bannerId: string, isActive: boolean): Promise<ApiResponse<true>> {
  const auth = await requireAdmin();
  if (!auth.success) return { data: true, success: false, message: auth.message };

  const { error } = await supabase.from("banners").update({ is_active: isActive }).eq("id", bannerId);
  if (error) return { data: true, success: false, message: error.message };
  return { data: true, success: true };
}

export async function adminDeleteBanner(bannerId: string): Promise<ApiResponse<true>> {
  const auth = await requireAdmin();
  if (!auth.success) return { data: true, success: false, message: auth.message };

  const { error } = await supabase.from("banners").delete().eq("id", bannerId);
  if (error) return { data: true, success: false, message: error.message };
  return { data: true, success: true };
}

// =========================
// Auth / Profiles helpers
// =========================

type ProfileRow = { role: string | null };

export async function getProfileRole(userId: string): Promise<ApiResponse<string | null>> {
  if (!userId) {
    return { data: null, success: false, message: "Missing user id" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return { data: null, success: false, message: error.message };
  }

  return { data: (data as ProfileRow | null)?.role ?? null, success: true };
}

export type CustomerProfile = {
  email: string;
  name: string | null;
  phone: string | null;
};

/**
 * Get customer profile for the account page.
 * Uses auth user email and user_metadata (full_name, name, phone).
 * Profiles full_name and phone are used when available.
 */
export async function getCustomerProfile(
  userId: string,
  userEmail: string | undefined,
  userMetadata: Record<string, unknown> | undefined
): Promise<ApiResponse<CustomerProfile>> {
  const name =
    (userMetadata?.full_name as string | undefined) ??
    (userMetadata?.name as string | undefined) ??
    null;
  const metadataPhone = (userMetadata?.phone as string | undefined) ?? null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, full_name, phone")
    .eq("id", userId)
    .maybeSingle();

  const row =
    !error && profile
      ? (profile as { full_name?: string | null; phone?: string | null })
      : null;

  return {
    data: {
      email: userEmail ?? "",
      name: row?.full_name ?? name ?? null,
      phone: row?.phone ?? metadataPhone ?? null,
    },
    success: true,
  };
}

export async function getMyRole(): Promise<ApiResponse<string | null>> {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return { data: null, success: false, message: error.message };
  }
  const userId = data.user?.id ?? null;
  if (!userId) {
    return { data: null, success: true };
  }
  return await getProfileRole(userId);
}

export async function isCurrentUserAdmin(): Promise<ApiResponse<boolean>> {
  const roleRes = await getMyRole();
  if (!roleRes.success) {
    return { data: false, success: false, message: roleRes.message };
  }
  return { data: roleRes.data === "admin", success: true };
}

async function requireAdmin(): Promise<ApiResponse<true>> {
  const res = await isCurrentUserAdmin();
  if (!res.success) {
    return { data: true as const, success: false, message: res.message || "Failed to verify permissions" };
  }
  if (!res.data) {
    return { data: true as const, success: false, message: "Unauthorized" };
  }
  return { data: true as const, success: true };
}

// =========================
// Navbar categories
// =========================

export type NavCategory = {
  id: string;
  name: string;
  slug: string;
  parent_group: string;
};

export async function getNavCategories(): Promise<ApiResponse<NavCategory[]>> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, parent_group")
    .order("name", { ascending: true });

  if (error) {
    return { data: [], success: false, message: error.message };
  }

  type NavCategoryRow = {
    id: string | number;
    name?: string | null;
    slug?: string | null;
    parent_group?: string | null;
  };

  const mapped: NavCategory[] =
    (data ?? [])
      .map((row) => {
        const r = row as NavCategoryRow;
        return {
          id: String(r.id),
          name: r.name ?? "",
          slug: r.slug ?? "",
          parent_group: r.parent_group ?? "",
        };
      })
      .filter((cat) => cat.slug);

  return { data: mapped, success: true };
}

// =========================
// Admin-only APIs
// =========================

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
};

export async function adminGetCategories(): Promise<ApiResponse<AdminCategory[]>> {
  const auth = await requireAdmin();
  if (!auth.success) return { data: [], success: false, message: auth.message };

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) return { data: [], success: false, message: error.message };

  type AdminCategoryRow = { id: string | number; name?: string | null; slug?: string | null };
  const mapped: AdminCategory[] =
    (data ?? []).map((row) => {
      const r = row as AdminCategoryRow;
      return { id: String(r.id), name: r.name ?? "", slug: r.slug ?? "" };
    });

  return { data: mapped, success: true };
}

export type AdminOrder = {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  total_amount: number;
  status: string;
  created_at: string;
  branch: string | null;
  address: string | null;
  google_maps_url: string | null;
  delivery_method?: string | null;
  payment_method?: string | null;
};

export async function adminGetOrders(): Promise<ApiResponse<AdminOrder[]>> {
  const auth = await requireAdmin();
  if (!auth.success) return { data: [], success: false, message: auth.message };

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_code, customer_name, phone, total_amount, status, created_at, branch, address, google_maps_url, delivery_method, payment_method"
    )
    .order("created_at", { ascending: false });

  if (error) return { data: [], success: false, message: error.message };

  type AdminOrderRow = {
    id: string | number;
    order_code?: string | null;
    customer_name?: string | null;
    phone?: string | null;
    total_amount?: number | null;
    status?: string | null;
    created_at: string;
    branch?: string | null;
    address?: string | null;
    google_maps_url?: string | null;
    delivery_method?: string | null;
    payment_method?: string | null;
  };

  const mapped: AdminOrder[] = (data ?? []).map((row) => {
    const r = row as AdminOrderRow;
    return {
      id: String(r.id),
      order_code: r.order_code ?? "",
      customer_name: r.customer_name ?? "",
      phone: r.phone ?? "",
      total_amount: Number(r.total_amount ?? 0),
      status: r.status ?? "",
      created_at: r.created_at,
      branch: r.branch ?? null,
      address: r.address ?? null,
      google_maps_url: r.google_maps_url ?? null,
      delivery_method: r.delivery_method ?? null,
      payment_method: r.payment_method ?? null,
    };
  });

  return { data: mapped, success: true };
}

export async function adminUpdateOrderStatus(
  orderId: string,
  newStatus: string
): Promise<ApiResponse<null>> {
  const auth = await requireAdmin();
  if (!auth.success) return { data: null, success: false, message: auth.message };
  if (!orderId) return { data: null, success: false, message: "Missing order id" };

  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) return { data: null, success: false, message: error.message };
  return { data: null, success: true };
}

export type AdminOrderItem = {
  quantity: number;
  price_at_time: number;
  books:
    | {
        title: string;
      }
    | {
        title: string;
      }[]
    | null;
};

export async function adminGetOrderItems(orderId: string): Promise<ApiResponse<AdminOrderItem[]>> {
  const auth = await requireAdmin();
  if (!auth.success) return { data: [], success: false, message: auth.message };
  if (!orderId) return { data: [], success: false, message: "Missing order id" };

  const { data, error } = await supabase
    .from("order_items")
    .select("quantity, price_at_time, books(title)")
    .eq("order_id", orderId);

  if (error) return { data: [], success: false, message: error.message };

  type AdminOrderItemRow = {
    quantity?: number | null;
    price_at_time?: number | null;
    books:
      | { title: string | null }
      | { title: string | null }[]
      | null;
  };

  const mapped: AdminOrderItem[] = (data ?? []).map((row) => {
    const r = row as AdminOrderItemRow;
    const rawBooks = r.books;
    const normalizedBooks: AdminOrderItem["books"] = Array.isArray(rawBooks)
      ? rawBooks.map((b) => ({ title: b.title ?? "Product" }))
      : rawBooks
        ? { title: rawBooks.title ?? "Product" }
        : null;

    return {
      quantity: Number(r.quantity ?? 0),
      price_at_time: Number(r.price_at_time ?? 0),
      books: normalizedBooks,
    };
  });

  return { data: mapped, success: true };
}

export type AdminBook = {
  id: string;
  title: string | null;
  price: number | null;
  stock: number | null;
  is_active: boolean | null;
  low_stock_threshold: number | null;
  category_id: string | null;
  description: string | null;
  publisher_id: string | null;
  genre_id: string | null;
  subject_id: string | null;
  class_id: string | null;
  language: string | null;
};

export async function adminGetBooks(): Promise<ApiResponse<AdminBook[]>> {
  const auth = await requireAdmin();
  if (!auth.success) return { data: [], success: false, message: auth.message };

  const { data, error } = await supabase
    .from("books")
    .select(
      "id, title, price, stock, is_active, low_stock_threshold, category_id, description, publisher_id, genre_id, subject_id, class_id, language"
    )
    .order("created_at", { ascending: false });

  if (error) return { data: [], success: false, message: error.message };
  return { data: (data as AdminBook[]) ?? [], success: true };
}

export async function adminUpdateBook(params: {
  id: string;
  title: string;
  price: number;
  description: string | null;
  stock: number;
  is_active: boolean;
}): Promise<ApiResponse<null>> {
  const auth = await requireAdmin();
  if (!auth.success) return { data: null, success: false, message: auth.message };
  if (!params.id) return { data: null, success: false, message: "Missing product id" };

  const { error } = await supabase
    .from("books")
    .update({
      title: params.title,
      price: params.price,
      description: params.description,
      stock: params.stock,
      is_active: params.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id);

  if (error) return { data: null, success: false, message: error.message };
  return { data: null, success: true };
}

export async function adminSetBookActive(params: {
  id: string;
  is_active: boolean;
}): Promise<ApiResponse<null>> {
  const auth = await requireAdmin();
  if (!auth.success) return { data: null, success: false, message: auth.message };
  if (!params.id) return { data: null, success: false, message: "Missing product id" };

  const { error } = await supabase
    .from("books")
    .update({ is_active: params.is_active, updated_at: new Date().toISOString() })
    .eq("id", params.id);

  if (error) return { data: null, success: false, message: error.message };
  return { data: null, success: true };
}

export async function adminCreateBookWithImages(params: {
  categoryId: string;
  title: string;
  price: number;
  description: string | null;
  images: File[];
  publisherId?: string | null;
  genreId?: string | null;
  subjectId?: string | null;
  classId?: string | null;
  language?: string | null;
}): Promise<ApiResponse<{ bookId: string; hadImageErrors: boolean }>> {
  const auth = await requireAdmin();
  if (!auth.success) {
    return { data: { bookId: "", hadImageErrors: false }, success: false, message: auth.message };
  }

  const { data: bookData, error: bookError } = await supabase
    .from("books")
    .insert([
      {
        title: params.title,
        price: params.price,
        description: params.description,
        category_id: params.categoryId,
        is_active: true,
        publisher_id: params.publisherId ?? null,
        genre_id: params.genreId ?? null,
        subject_id: params.subjectId ?? null,
        class_id: params.classId ?? null,
        language: params.language ?? null,
      },
    ])
    .select("id")
    .single();

  if (bookError || !bookData) {
    return {
      data: { bookId: "", hadImageErrors: false },
      success: false,
      message: bookError?.message || "Failed to create product",
    };
  }

  const bookId = String((bookData as { id: unknown }).id);

  const BUCKET = "product-images";
  let hadUploadError = false;
  let imageInsertError: unknown = null;

  if (params.images.length > 0) {
    const imageRows = await Promise.all(
      params.images.map(async (file) => {
        const fileExt = file.name.split(".").pop() || "jpg";
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, file);

        if (uploadError) {
          console.error(uploadError);
          hadUploadError = true;
          return null;
        }

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
        const imageUrl = data.publicUrl;

        return {
          book_id: bookId,
          image_url: imageUrl,
        };
      })
    );

    const validImageRows = imageRows.filter(
      (row): row is { book_id: string; image_url: string } => row !== null
    );

    if (validImageRows.length > 0) {
      const primaryUrl = validImageRows[0].image_url;

      const { error: updateBookError } = await supabase
        .from("books")
        .update({ image_url: primaryUrl })
        .eq("id", bookId);

      if (updateBookError) {
        console.error("Error updating books.image_url:", updateBookError);
        imageInsertError = updateBookError;
      }

      const { error } = await supabase.from("product_images").insert(validImageRows);
      if (error) {
        imageInsertError = error;
        console.error("Error inserting product_images rows:", error);
      }
    }
  }

  return {
    data: {
      bookId,
      hadImageErrors: Boolean(hadUploadError || imageInsertError),
    },
    success: true,
  };
}

// =========================
// Coupons
// =========================

export type CouponDiscountType = "percentage" | "fixed";

export interface ValidateCouponResult {
  couponId: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  discountAmount: number;
  finalAmount: number;
}

/**
 * Validate a coupon code and compute discount for a given subtotal.
 * Checks: code exists, not expired, usage count < max_usage.
 */
export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<ApiResponse<ValidateCouponResult>> {
  const trimmed = code.trim();
  if (!trimmed) {
    return { data: null as unknown as ValidateCouponResult, success: false, message: "Please enter a coupon code." };
  }
  if (subtotal <= 0) {
    return { data: null as unknown as ValidateCouponResult, success: false, message: "Cart total must be greater than 0." };
  }

  const { data: coupon, error: couponError } = await supabase
    .from("coupons")
    .select("id, code, discount_type, discount_value, expires_at, max_usage")
    .ilike("code", trimmed)
    .maybeSingle();

  if (couponError) {
    return { data: null as unknown as ValidateCouponResult, success: false, message: couponError.message };
  }
  if (!coupon) {
    return { data: null as unknown as ValidateCouponResult, success: false, message: "Invalid or expired coupon code." };
  }

  const row = coupon as {
    id: string;
    code: string | null;
    discount_type: string | null;
    discount_value: number | null;
    expires_at: string | null;
    max_usage: number | null;
  };

  const expiresAt = row.expires_at ? new Date(row.expires_at) : null;
  if (expiresAt && expiresAt.getTime() < Date.now()) {
    return { data: null as unknown as ValidateCouponResult, success: false, message: "This coupon has expired." };
  }

  const { count, error: usageError } = await supabase
    .from("coupon_usage")
    .select("id", { count: "exact", head: true })
    .eq("coupon_id", row.id);

  if (usageError) {
    return { data: null as unknown as ValidateCouponResult, success: false, message: usageError.message };
  }
  const maxUsage = Number(row.max_usage ?? 0);
  if (maxUsage > 0 && (count ?? 0) >= maxUsage) {
    return { data: null as unknown as ValidateCouponResult, success: false, message: "This coupon has reached its usage limit." };
  }

  const discountType = (row.discount_type === "fixed" ? "fixed" : "percentage") as CouponDiscountType;
  const discountValue = Number(row.discount_value ?? 0);
  let discountAmount: number;
  if (discountType === "percentage") {
    discountAmount = Math.round((subtotal * Math.min(100, Math.max(0, discountValue))) / 100);
  } else {
    discountAmount = Math.min(discountValue, subtotal);
  }
  const finalAmount = Math.max(0, subtotal - discountAmount);

  return {
    data: {
      couponId: row.id,
      code: row.code ?? trimmed,
      discountType,
      discountValue,
      discountAmount,
      finalAmount,
    },
    success: true,
  };
}

/**
 * Record that a coupon was used for an order. Called after order creation.
 */
export async function recordCouponUsage(
  couponId: string,
  orderId: string
): Promise<ApiResponse<null>> {
  const { error } = await supabase.from("coupon_usage").insert([
    { coupon_id: couponId, order_id: orderId },
  ]);
  if (error) {
    return { data: null, success: false, message: error.message };
  }
  return { data: null, success: true };
}

export interface AdminCreateCouponParams {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  expiresAt: string;
  maxUsage: number;
}

export async function adminCreateCoupon(
  params: AdminCreateCouponParams
): Promise<ApiResponse<{ couponId: string }>> {
  const auth = await requireAdmin();
  if (!auth.success) {
    return { data: { couponId: "" }, success: false, message: auth.message };
  }

  const code = params.code.trim();
  if (!code) {
    return { data: { couponId: "" }, success: false, message: "Coupon code is required." };
  }
  if (params.discountType !== "percentage" && params.discountType !== "fixed") {
    return { data: { couponId: "" }, success: false, message: "Invalid discount type." };
  }
  if (params.discountValue <= 0) {
    return { data: { couponId: "" }, success: false, message: "Discount value must be greater than 0." };
  }
  if (params.discountType === "percentage" && params.discountValue > 100) {
    return { data: { couponId: "" }, success: false, message: "Percentage discount cannot exceed 100." };
  }
  const expiresAt = new Date(params.expiresAt);
  if (Number.isNaN(expiresAt.getTime())) {
    return { data: { couponId: "" }, success: false, message: "Invalid expiry date." };
  }
  if (params.maxUsage < 1) {
    return { data: { couponId: "" }, success: false, message: "Max usage must be at least 1." };
  }

  const { data: inserted, error } = await supabase
    .from("coupons")
    .insert([
      {
        code,
        discount_type: params.discountType,
        discount_value: params.discountValue,
        expires_at: expiresAt.toISOString(),
        max_usage: params.maxUsage,
      },
    ])
    .select("id")
    .single();

  if (error) {
    if ((error as { code?: string })?.code === "23505") {
      return { data: { couponId: "" }, success: false, message: "A coupon with this code already exists." };
    }
    return { data: { couponId: "" }, success: false, message: error.message };
  }

  const couponId = (inserted as { id: string } | null)?.id ?? "";
  return { data: { couponId }, success: true };
}

// =========================
// Deals (Admin)
// =========================

export type AdminDeal = {
  id: string;
  title: string;
  book_id: string | null;
  deal_price: number | null;
  badge: string | null;
  section: string | null;
  is_active: boolean | null;
};

export interface AdminCreateDealParams {
  title: string;
  bookId: string | null;
  dealPrice: number;
  badge: string;
  section: string;
  isActive: boolean;
}

export async function adminCreateDeal(
  params: AdminCreateDealParams
): Promise<ApiResponse<{ dealId: string }>> {
  const auth = await requireAdmin();
  if (!auth.success) {
    return { data: { dealId: "" }, success: false, message: auth.message };
  }

  const title = params.title.trim();
  if (!title) {
    return { data: { dealId: "" }, success: false, message: "Deal title is required." };
  }

  if (!params.bookId) {
    return { data: { dealId: "" }, success: false, message: "Please select a book for this deal." };
  }

  if (params.dealPrice <= 0) {
    return { data: { dealId: "" }, success: false, message: "Deal price must be greater than 0." };
  }

  const badge = params.badge.trim();
  const section = params.section.trim() || "Deal";

  const { data, error } = await supabase
    .from("deals")
    .insert([
      {
        title,
        book_id: params.bookId,
        deal_price: params.dealPrice,
        badge: badge || null,
        section,
        is_active: params.isActive,
      },
    ])
    .select("id")
    .single();

  if (error) {
    return { data: { dealId: "" }, success: false, message: error.message };
  }

  const dealId = (data as { id: string } | null)?.id ?? "";
  return { data: { dealId }, success: true };
}

export async function adminGetDeals(): Promise<ApiResponse<AdminDeal[]>> {
  const auth = await requireAdmin();
  if (!auth.success) return { data: [], success: false, message: auth.message };

  const { data, error } = await supabase
    .from("deals")
    .select("id, title, book_id, deal_price, badge, section, is_active")
    .order("created_at", { ascending: false });

  if (error) return { data: [], success: false, message: error.message };

  type DealRow = {
    id: string | number;
    title?: string | null;
    book_id?: string | null;
    deal_price?: number | null;
    badge?: string | null;
    section?: string | null;
    is_active?: boolean | null;
  };

  const mapped: AdminDeal[] = (data ?? []).map((row) => {
    const r = row as DealRow;
    return {
      id: String(r.id),
      title: r.title ?? "",
      book_id: r.book_id ?? null,
      deal_price: typeof r.deal_price === "number" ? r.deal_price : null,
      badge: r.badge ?? null,
      section: r.section ?? null,
      is_active: r.is_active ?? null,
    };
  });

  return { data: mapped, success: true };
}

// =========================
// Deals (Public)
// =========================

export type PublicDeal = {
  id: string;
  title: string;
  book_id: string;
  deal_price: number;
  badge: string | null;
  section: string | null;
  book_title: string;
  original_price: number;
  book_image_url: string | null;
};

/**
 * Fetch active deals for homepage sections.
 *
 * Query (logical):
 * select deals.id, deals.title, deals.book_id, deals.deal_price, deals.badge, deals.section,
 *        books.title as book_title, books.price as original_price
 * from deals join books on deals.book_id = books.id
 * where deals.is_active = true
 */
export async function getActiveDeals(): Promise<ApiResponse<PublicDeal[]>> {
  const { data, error } = await supabase
    .from("deals")
    .select(
      `
      id,
      title,
      book_id,
      deal_price,
      badge,
      section,
      books:book_id (
        id,
        title,
        price,
        product_images(image_url)
      )
    `
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) return { data: [], success: false, message: error.message };

  type DealRow = {
    id: string | number;
    title?: string | null;
    book_id?: string | null;
    deal_price?: number | null;
    badge?: string | null;
    section?: string | null;
    books?: {
      id?: string | null;
      title?: string | null;
      price?: number | null;
      product_images?: { image_url: string | null }[] | null;
    } | null;
  };

  const mapped: PublicDeal[] = (data ?? []).flatMap((row) => {
    const r = row as DealRow;
    const book = r.books ?? null;
    const bookId = r.book_id ?? book?.id ?? null;
    const dealPrice = typeof r.deal_price === "number" ? r.deal_price : null;
    const originalPrice = typeof book?.price === "number" ? book.price : null;

    if (!bookId || !book?.title || dealPrice === null || originalPrice === null) return [];

    const bookImageUrl = book.product_images?.[0]?.image_url ?? null;

    return [
      {
        id: String(r.id),
        title: r.title ?? "",
        book_id: bookId,
        deal_price: dealPrice,
        badge: r.badge ?? null,
        section: r.section ?? null,
        book_title: book.title,
        original_price: originalPrice,
        book_image_url: bookImageUrl,
      },
    ];
  });

  return { data: mapped, success: true };
}

// =========================
// Homepage automation (Views)
// =========================

export type AutomatedHomeBook = {
  id: string;
  title: string;
  price: number;
  image_url: string | null;
  metric: number;
};

export async function getBestSellerBooks(): Promise<ApiResponse<AutomatedHomeBook[]>> {
  const { data, error } = await supabase
    .from("book_sales_summary")
    .select(
      `
      total_sold,
      books:book_id (
        id,
        title,
        price,
        image_url,
        product_images(image_url)
      )
    `
    )
    .order("total_sold", { ascending: false })
    .limit(10);

  if (error) return { data: [], success: false, message: error.message };

  type Row = {
    total_sold?: number | null;
    books?: {
      id?: string | null;
      title?: string | null;
      price?: number | null;
      image_url?: string | null;
      product_images?: { image_url: string | null }[] | null;
    } | null;
  };

  const mapped: AutomatedHomeBook[] = (data ?? []).flatMap((row) => {
    const r = row as Row;
    const b = r.books ?? null;
    if (!b?.id || !b.title || typeof b.price !== "number") return [];
    const img = b.product_images?.[0]?.image_url ?? b.image_url ?? null;
    return [
      {
        id: b.id,
        title: b.title,
        price: b.price,
        image_url: img,
        metric: typeof r.total_sold === "number" ? r.total_sold : 0,
      },
    ];
  });

  return { data: mapped, success: true };
}

export async function getTrendingBooks(): Promise<ApiResponse<AutomatedHomeBook[]>> {
  const { data, error } = await supabase
    .from("trending_books")
    .select(
      `
      recent_sales,
      books:book_id (
        id,
        title,
        price,
        image_url,
        product_images(image_url)
      )
    `
    )
    .order("recent_sales", { ascending: false })
    .limit(10);

  if (error) return { data: [], success: false, message: error.message };

  type Row = {
    recent_sales?: number | null;
    books?: {
      id?: string | null;
      title?: string | null;
      price?: number | null;
      image_url?: string | null;
      product_images?: { image_url: string | null }[] | null;
    } | null;
  };

  const mapped: AutomatedHomeBook[] = (data ?? []).flatMap((row) => {
    const r = row as Row;
    const b = r.books ?? null;
    if (!b?.id || !b.title || typeof b.price !== "number") return [];
    const img = b.product_images?.[0]?.image_url ?? b.image_url ?? null;
    return [
      {
        id: b.id,
        title: b.title,
        price: b.price,
        image_url: img,
        metric: typeof r.recent_sales === "number" ? r.recent_sales : 0,
      },
    ];
  });

  return { data: mapped, success: true };
}

export type LowStockAlertRow = {
  book_id: string;
  title: string;
  stock: number;
  threshold: number;
};

export async function adminGetLowStockBooks(): Promise<ApiResponse<LowStockAlertRow[]>> {
  const auth = await requireAdmin();
  if (!auth.success) return { data: [], success: false, message: auth.message };

  const { data, error } = await supabase.from("low_stock_books").select("*");
  if (error) return { data: [], success: false, message: error.message };

  type Row = {
    book_id?: string | null;
    id?: string | null;
    title?: string | null;
    book_title?: string | null;
    stock?: number | null;
    current_stock?: number | null;
    threshold?: number | null;
    low_stock_threshold?: number | null;
  };

  const mapped: LowStockAlertRow[] = (data ?? []).flatMap((row) => {
    const r = row as Row;
    const id = r.book_id ?? r.id ?? null;
    const title = r.title ?? r.book_title ?? null;
    const stock = typeof r.stock === "number" ? r.stock : typeof r.current_stock === "number" ? r.current_stock : null;
    const threshold =
      typeof r.threshold === "number" ? r.threshold : typeof r.low_stock_threshold === "number" ? r.low_stock_threshold : null;

    if (!id || !title || stock === null || threshold === null) return [];
    return [{ book_id: id, title, stock, threshold }];
  });

  return { data: mapped, success: true };
}

// =========================
// Blog posts (Admin)
// =========================

export interface AdminCreateBlogPostParams {
  title: string;
  slug: string;
  content: string;
  imageUrl: string;
  isPublished: boolean;
}

export async function adminCreateBlogPost(
  params: AdminCreateBlogPostParams
): Promise<ApiResponse<{ postId: string }>> {
  const auth = await requireAdmin();
  if (!auth.success) {
    return { data: { postId: "" }, success: false, message: auth.message };
  }

  const title = params.title.trim();
  const slug = params.slug.trim();
  const content = params.content.trim();
  const imageUrl = params.imageUrl.trim();

  if (!title) {
    return { data: { postId: "" }, success: false, message: "Blog title is required." };
  }
  if (!slug) {
    return { data: { postId: "" }, success: false, message: "Slug is required." };
  }
  if (!content) {
    return { data: { postId: "" }, success: false, message: "Content is required." };
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .insert([
      {
        title,
        slug,
        content,
        image_url: imageUrl || null,
        is_published: params.isPublished,
      },
    ])
    .select("id")
    .single();

  if (error) {
    return { data: { postId: "" }, success: false, message: error.message };
  }

  const postId = (data as { id: string } | null)?.id ?? "";
  return { data: { postId }, success: true };
}
