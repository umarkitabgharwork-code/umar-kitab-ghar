export type BoardId = "sindh" | "federal" | "technical" | "other";

export interface SpecialCoursePackage {
  id: string;
  boardId: BoardId;
  boardLabel: string;
  group: string;
  track: string;
  packageName: string;
  subjects: string[];
  publishers: string;
  newPriceRange: string;
  oldPriceRange: string;
  note: string;
}

export const SPECIAL_COURSE_BOARDS: { id: BoardId; label: string }[] = [
  { id: "sindh", label: "Sindh Board (STB)" },
  { id: "federal", label: "Federal Board" },
  { id: "technical", label: "Technical Board" },
  { id: "other", label: "Other Board" },
];

export const PRICE_ON_CALL = "Price confirmation on call";

export function getPackagesForBoard(
  packages: SpecialCoursePackage[],
  boardId: BoardId,
): SpecialCoursePackage[] {
  return packages.filter((p) => p.boardId === boardId);
}

export function getGroupsForBoard(packages: SpecialCoursePackage[], boardId: BoardId): string[] {
  const groups = getPackagesForBoard(packages, boardId).map((p) => p.group);
  return [...new Set(groups)];
}

export function getTracksForGroup(
  packages: SpecialCoursePackage[],
  boardId: BoardId,
  group: string,
): SpecialCoursePackage[] {
  return getPackagesForBoard(packages, boardId).filter((p) => p.group === group);
}

export function buildSpecialCourseNote(params: {
  classLabel: string;
  boardLabel: string;
  packageName: string;
  condition: "New Course" | "Old Course";
  estimatedPrice: string;
  subjects: string[];
  publishers: string;
  /** Optional customer notes (Additional Notes field or Other Board requirements) */
  customerNotes?: string;
}): string {
  const lines = [
    "Special Course Package:",
    `Class: ${params.classLabel}`,
    `Board: ${params.boardLabel}`,
    `Package: ${params.packageName}`,
    `Condition: ${params.condition}`,
    `Estimated Price: ${params.estimatedPrice}`,
    `Subjects: ${params.subjects.join(", ")}`,
    `Publisher: ${params.publishers}`,
  ];
  if (params.customerNotes?.trim()) {
    lines.push(`Customer Notes: ${params.customerNotes.trim()}`);
  }
  lines.push("Final confirmation will be done via call/WhatsApp.");
  return lines.join("\n");
}
