import { ROUTES } from "@/lib/constants";

/** Set to false to disable the entire Bright Career School campaign. */
export const BRIGHT_CAREER_CAMPAIGN_ACTIVE = true;

export const BRIGHT_CAREER_CAMPAIGN_SESSION_KEY = "bright-career-campaign-2026-shown";

export const BRIGHT_CAREER_SCHOOL_SLUG = "bright-career-school";
export const BRIGHT_CAREER_SCHOOL_NAME = "Bright Career School";

export const BRIGHT_CAREER_COURSE_PATH = `${ROUTES.BUY_COURSE}?school=${BRIGHT_CAREER_SCHOOL_SLUG}`;

export function resolvePreselectedSchool(slug: string | null, schools: string[]): string | null {
  if (slug !== BRIGHT_CAREER_SCHOOL_SLUG) return null;

  const exact = schools.find((s) => s.toLowerCase() === BRIGHT_CAREER_SCHOOL_NAME.toLowerCase());
  if (exact) return exact;

  const partial = schools.find((s) => s.toLowerCase().includes("bright career"));
  return partial ?? BRIGHT_CAREER_SCHOOL_NAME;
}

export const BRIGHT_CAREER_OFFERS = [
  { highlight: "10% OFF", label: "New Course Books" },
  { highlight: "50% OFF", label: "Old Course Books" },
  { highlight: "FREE", label: "Premium Lamination" },
  { highlight: "Gift", label: "Special Gift With Every Order" },
] as const;

export const BRIGHT_CAREER_HERO_OFFER_POINTS = [
  "New Course Books 10% OFF",
  "Old Course Books 50% OFF",
  "Free Premium Lamination",
  "Special Gift With Every Course Order",
] as const;
