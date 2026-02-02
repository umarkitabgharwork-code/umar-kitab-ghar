// Application constants

export const APP_NAME = "Umar Kitab Ghar";
export const APP_TAGLINE = "Your Book Store";

// Cart
export const CART_STORAGE_KEY = "umar-kitab-ghar-cart";

// Schools
export const SCHOOLS = [
  "Ali Fondation School",
  "The City School",
  "Lahore Grammar School",
  "Roots School System",
  "Allied Schools",
  "The Educators",
  "Dar-e-Arqam Schools",
  "Punjab Group of Colleges",
  "Foundation Public School",
  "Karachi Grammar School",
] as const;

// Classes
export const CLASSES = [
  "Nursery", "Prep", "KG", "Class 1", "Class 2", "Class 3",
  "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"
] as const;

// Routes
export const ROUTES = {
  HOME: "/",
  BUY_COURSE: "/buy-course",
  BUY_BOOK: "/buy-book",
  STATIONERY: "/stationery",
  BLOG: "/blog",
  CHECKOUT: "/checkout",
} as const;

// Course Types
export const COURSE_TYPES = {
  NEW: "new",
  OLD: "old",
} as const;

export type CourseType = typeof COURSE_TYPES.NEW | typeof COURSE_TYPES.OLD;

// Steps for course selection
export const COURSE_STEPS = {
  SCHOOL: "school",
  CLASS: "class",
  COURSE: "course",
} as const;

export type CourseStep = typeof COURSE_STEPS.SCHOOL | typeof COURSE_STEPS.CLASS | typeof COURSE_STEPS.COURSE;