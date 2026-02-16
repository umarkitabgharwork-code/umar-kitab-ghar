/**
 * TypeScript models for the application
 * Centralized type definitions for products, categories, blog posts, and cart items
 */

// Product type - represents books and stationery items
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
  inStock?: boolean;
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
