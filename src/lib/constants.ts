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
  NEW_DEAL: "/new-deal",
  DEALS: "/deals",
  BUY_COURSE: "/buy-course",
  STATIONERY: "/stationery",
  BLOG: "/blog",
  CHECKOUT: "/checkout",
  DELIVERY_METHOD: "/delivery-method",
  BRANCH_SELECTION: "/branch-selection",
  PAYMENT: "/payment",
  ORDER_SUCCESS: "/order-success",
  TRACK_ORDER: "/track-order",
  ACCOUNT: "/account",
  WISHLIST: "/wishlist",
} as const;

// Navigation menu structure
export interface NavMenuItem {
  label: string;
  href?: string;
  children?: NavMenuItem[];
}

export const NAV_MENU_ITEMS: NavMenuItem[] = [
  { label: "Home", href: ROUTES.HOME },
  { label: "Deals", href: ROUTES.DEALS },
  { label: "Course", href: ROUTES.BUY_COURSE },
  {
    label: "Book",
  },
  {
    label: "Other Items",
  },
  { label: "Blog", href: ROUTES.BLOG },
  { label: "Track Order", href: ROUTES.TRACK_ORDER },
];

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