/**
 * Mock API layer for the application
 * Simulates async API calls with setTimeout and Promise
 * Returns typed data matching the TypeScript models
 */

import { Product, ProductType, ProductCategory, Category, BlogPost, ApiResponse } from "@/types";

// Simulate network delay (500-1500ms)
const delay = (ms: number = 800): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Mock products data
const mockProducts: Product[] = [
  // Book type - Study category
  { id: "1", name: "English Grammar Book", price: 350, type: "book", category: "study", inStock: true },
  { id: "2", name: "Mathematics Workbook", price: 280, type: "book", category: "study", inStock: true },
  { id: "3", name: "Science Lab Manual", price: 420, type: "book", category: "study", inStock: true },
  { id: "4", name: "Urdu Composition", price: 320, type: "book", category: "study", inStock: true },
  { id: "5", name: "Oxford Dictionary", price: 550, type: "book", category: "study", inStock: true },
  { id: "6", name: "Atlas & Maps", price: 480, type: "book", category: "study", inStock: true },
  // Book type - Islamic category
  { id: "11", name: "Islamic Studies Book", price: 300, type: "book", category: "islamic", inStock: true },
  { id: "12", name: "Quran with Translation", price: 1200, type: "book", category: "islamic", inStock: true },
  { id: "13", name: "Hadith Collection", price: 450, type: "book", category: "islamic", inStock: true },
  // Book type - Novel category
  { id: "14", name: "Classic Novel Collection", price: 600, type: "book", category: "novel", inStock: true },
  { id: "15", name: "Mystery Novel", price: 400, type: "book", category: "novel", inStock: true },
  // Other type - Art & Craft category
  { id: "7", name: "Drawing Book A4", price: 120, type: "other", category: "art-craft", inStock: true },
  { id: "8", name: "Color Pencil Set (24)", price: 380, type: "other", category: "art-craft", inStock: true },
  { id: "9", name: "Geometry Set", price: 250, type: "other", category: "art-craft", inStock: true },
  // Other type - Sketching category
  { id: "16", name: "Sketching Pencil Set", price: 320, type: "other", category: "sketching", inStock: true },
  { id: "17", name: "Sketch Pad A4", price: 180, type: "other", category: "sketching", inStock: true },
  // Other type - Painting category
  { id: "18", name: "Watercolor Paint Set", price: 550, type: "other", category: "painting", inStock: true },
  { id: "19", name: "Canvas Board Set", price: 450, type: "other", category: "painting", inStock: true },
  // Other type - Diaries category
  { id: "10", name: "Notebook A4 (100 pages)", price: 150, type: "other", category: "diaries", inStock: true },
  { id: "20", name: "Personal Diary", price: 200, type: "other", category: "diaries", inStock: true },
  // Other type - Gift category
  { id: "21", name: "Gift Box Set", price: 500, type: "other", category: "gift", inStock: true },
  { id: "22", name: "Premium Gift Wrapping", price: 150, type: "other", category: "gift", inStock: true },
  // Other type - Birthday category
  { id: "23", name: "Birthday Card Set", price: 120, type: "other", category: "birthday", inStock: true },
  { id: "24", name: "Party Decorations", price: 300, type: "other", category: "birthday", inStock: true },
  // Other type - Toys category
  { id: "25", name: "Educational Toy Set", price: 800, type: "other", category: "toys", inStock: true },
  { id: "26", name: "Building Blocks", price: 600, type: "other", category: "toys", inStock: true },
  // Other type - Bags category
  { id: "27", name: "School Backpack", price: 1200, type: "other", category: "bags", inStock: true },
  { id: "28", name: "Laptop Bag", price: 1500, type: "other", category: "bags", inStock: true },
  // Other type - Geometry Box category
  { id: "29", name: "Professional Geometry Box", price: 350, type: "other", category: "geometry-box", inStock: true },
  // Other type - Pencil Box category
  { id: "30", name: "Premium Pencil Box", price: 250, type: "other", category: "pencil-box", inStock: true },
  // Other type - Customize category
  { id: "31", name: "Custom Printed Notebook", price: 400, type: "other", category: "customize", inStock: true },
];

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

/**
 * Get all products with optional filtering
 * Simulates fetching products from API
 * @param type - Optional product type filter ("book" | "other")
 * @param category - Optional product category filter
 */
export async function getProducts(
  type?: ProductType,
  category?: ProductCategory
): Promise<ApiResponse<Product[]>> {
  await delay(600);
  
  let filteredProducts = [...mockProducts];
  
  // Apply type filter if provided
  if (type) {
    filteredProducts = filteredProducts.filter((product) => product.type === type);
  }
  
  // Apply category filter if provided
  if (category) {
    filteredProducts = filteredProducts.filter((product) => product.category === category);
  }
  
  return {
    data: filteredProducts,
    success: true,
  };
}

/**
 * Get product by ID
 * Simulates fetching a single product from API
 */
export async function getProductById(id: string): Promise<ApiResponse<Product | null>> {
  await delay(400);
  const product = mockProducts.find((p) => p.id === id) || null;
  return {
    data: product,
    success: product !== null,
    message: product ? undefined : "Product not found",
  };
}

/**
 * Get all categories
 * Simulates fetching categories from API
 */
export async function getCategories(): Promise<ApiResponse<Category[]>> {
  await delay(500);
  return {
    data: mockCategories,
    success: true,
  };
}

/**
 * Get all blog posts
 * Simulates fetching blog posts from API
 */
export async function getBlogPosts(): Promise<ApiResponse<BlogPost[]>> {
  await delay(700);
  return {
    data: mockBlogPosts,
    success: true,
  };
}

/**
 * Get blog post by slug
 * Simulates fetching a single blog post from API
 */
export async function getBlogPostBySlug(slug: string): Promise<ApiResponse<BlogPost | null>> {
  await delay(400);
  const post = mockBlogPosts.find((p) => p.slug === slug) || null;
  return {
    data: post,
    success: post !== null,
    message: post ? undefined : "Blog post not found",
  };
}
