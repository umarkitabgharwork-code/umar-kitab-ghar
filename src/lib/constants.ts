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
  BUY_COURSE: "/buy-course",
  BUY_BOOK: "/buy-book",
  BOOKS_ISLAMIC: "/books/islamic",
  BOOKS_STUDY: "/books/study",
  BOOKS_NOVEL: "/books/novel",
  OTHER_GIFT: "/other/gift",
  OTHER_BIRTHDAY: "/other/birthday",
  OTHER_ART_CRAFT: "/other/art-craft",
  OTHER_SKETCHING: "/other/sketching",
  OTHER_PAINTING: "/other/painting",
  OTHER_TOYS: "/other/toys",
  OTHER_BAGS: "/other/bags",
  OTHER_GEOMETRY_BOX: "/other/geometry-box",
  OTHER_PENCIL_BOX: "/other/pencil-box",
  OTHER_DIARIES: "/other/diaries",
  OTHER_CUSTOMIZE: "/other/customize",
  STATIONERY: "/stationery",
  BLOG: "/blog",
  CHECKOUT: "/checkout",
} as const;

// Navigation menu structure
export interface NavMenuItem {
  label: string;
  href?: string;
  children?: NavMenuItem[];
}

export const NAV_MENU_ITEMS: NavMenuItem[] = [
  { label: "Home", href: ROUTES.HOME },
  { label: "New Deal", href: ROUTES.NEW_DEAL },
  { label: "Buy Course", href: ROUTES.BUY_COURSE },
  {
    label: "Buy Book",
    children: [
      { label: "Islamic Books", href: ROUTES.BOOKS_ISLAMIC },
      { label: "Study Books", href: ROUTES.BOOKS_STUDY },
      { label: "Novel Books", href: ROUTES.BOOKS_NOVEL },
    ],
  },
  {
    label: "Other Items",
    children: [
      { label: "Gift Items", href: ROUTES.OTHER_GIFT },
      { label: "Birthday Items", href: ROUTES.OTHER_BIRTHDAY },
      { label: "Art & Craft", href: ROUTES.OTHER_ART_CRAFT },
      { label: "Sketching", href: ROUTES.OTHER_SKETCHING },
      { label: "Painting & Canvas", href: ROUTES.OTHER_PAINTING },
      { label: "Toy Items", href: ROUTES.OTHER_TOYS },
      { label: "Bags", href: ROUTES.OTHER_BAGS },
      { label: "Geometry Box", href: ROUTES.OTHER_GEOMETRY_BOX },
      { label: "Pencil Box", href: ROUTES.OTHER_PENCIL_BOX },
      { label: "Diaries", href: ROUTES.OTHER_DIARIES },
      { label: "Customize Item", href: ROUTES.OTHER_CUSTOMIZE },
    ],
  },
  { label: "Blog", href: ROUTES.BLOG },
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