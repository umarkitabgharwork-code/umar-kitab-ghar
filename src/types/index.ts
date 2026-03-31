/**
 * TypeScript models for the application
 * Centralized type definitions for products, categories, blog posts, and cart items
 */

// Product type union - represents the main product categories
export type ProductType = "book" | "other";

// Product category union - represents all available product categories
export type ProductCategory =
  // Book categories
  | "islamic"
  | "study"
  | "novel"
  // Other item categories
  | "gift"
  | "birthday"
  | "art-craft"
  | "sketching"
  | "painting"
  | "toys"
  | "bags"
  | "geometry-box"
  | "pencil-box"
  | "diaries"
  | "customize";

// Product type - represents books and stationery items
export interface Product {
  id: string;
  name: string;
  price: number;
  type: ProductType;
  category: ProductCategory;
  image?: string;
  description?: string;
  inStock?: boolean;
  stock?: number;
}

// Category type - represents product categories
export interface Category {
  id: string;
  name: string;
  description: string;
  href: string;
  icon?: string;
  count: number;
}

// Blog post type - represents blog articles
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  slug: string;
  content?: string;
}

// Blog post from Supabase (blog_posts table)
export interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  image_url: string | null;
  content: string | null;
  created_at: string;
}

// Cart item type - matches CartContext but exported here for API layer
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  image?: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
