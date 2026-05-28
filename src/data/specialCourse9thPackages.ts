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

export const NINTH_CLASS_LABEL = "9th Course";

export const SPECIAL_COURSE_BOARDS: { id: BoardId; label: string }[] = [
  { id: "sindh", label: "Sindh Board (STB)" },
  { id: "federal", label: "Federal Board" },
  { id: "technical", label: "Technical Board" },
  { id: "other", label: "Other Board" },
];

export const NINTH_SPECIAL_PACKAGES: SpecialCoursePackage[] = [
  {
    id: "stb-sci-bio",
    boardId: "sindh",
    boardLabel: "Sindh Board (STB)",
    group: "Science",
    track: "Biology",
    packageName: "9th Science Biology Course - Sindh Board",
    subjects: [
      "English",
      "Urdu / Sindhi",
      "Islamiat / Ethics",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Biology",
    ],
    publishers: "STBB",
    newPriceRange: "Rs. 2,400 – Rs. 2,600",
    oldPriceRange: "Rs. 1,440 – Rs. 1,560",
    note: "Final availability and condition confirmed on call.",
  },
  {
    id: "stb-sci-comp",
    boardId: "sindh",
    boardLabel: "Sindh Board (STB)",
    group: "Science",
    track: "Computer Studies",
    packageName: "9th Science Computer Course - Sindh Board",
    subjects: [
      "English",
      "Urdu / Sindhi",
      "Islamiat / Ethics",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Computer Science",
    ],
    publishers: "STBB",
    newPriceRange: "Rs. 2,400 – Rs. 2,600",
    oldPriceRange: "Rs. 1,440 – Rs. 1,560",
    note: "Final availability and condition confirmed on call.",
  },
  {
    id: "stb-arts",
    boardId: "sindh",
    boardLabel: "Sindh Board (STB)",
    group: "Humanities / Arts",
    track: "General Arts",
    packageName: "9th Humanities / Arts Course - Sindh Board",
    subjects: [
      "English",
      "Urdu / Sindhi",
      "Islamiat / Ethics",
      "General Mathematics",
      "General Science",
      "Elective Subjects",
    ],
    publishers: "STBB / Kifayat Academy depending on subject",
    newPriceRange: "Rs. 1,700 – Rs. 2,100",
    oldPriceRange: "Rs. 1,020 – Rs. 1,260",
    note: "Elective subjects and final availability confirmed on call.",
  },
  {
    id: "fed-sci-bio",
    boardId: "federal",
    boardLabel: "Federal Board",
    group: "Science",
    track: "Biology",
    packageName: "9th Science Biology Course - Federal Board",
    subjects: ["English", "Urdu", "Islamiyat", "Mathematics", "Physics", "Chemistry", "Biology"],
    publishers: "National Book Foundation / Federal Board Authorized / PTB",
    newPriceRange: "Rs. 5,500 – Rs. 6,500",
    oldPriceRange: "Rs. 3,300 – Rs. 3,900",
    note: "Final availability and condition confirmed on call.",
  },
  {
    id: "fed-sci-comp",
    boardId: "federal",
    boardLabel: "Federal Board",
    group: "Science",
    track: "Computer Science",
    packageName: "9th Science Computer Course - Federal Board",
    subjects: [
      "English",
      "Urdu",
      "Islamiyat",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Computer Science",
    ],
    publishers: "National Book Foundation / Federal Board Authorized / PTB",
    newPriceRange: "Rs. 5,500 – Rs. 6,500",
    oldPriceRange: "Rs. 3,300 – Rs. 3,900",
    note: "Final availability and condition confirmed on call.",
  },
  {
    id: "fed-arts",
    boardId: "federal",
    boardLabel: "Federal Board",
    group: "Humanities / Arts",
    track: "General Arts",
    packageName: "9th Humanities / Arts Course - Federal Board",
    subjects: [
      "English",
      "Urdu",
      "Islamiyat",
      "General Mathematics",
      "General Science",
      "Elective Subjects",
    ],
    publishers: "NBF / Federal Board Authorized",
    newPriceRange: "Price confirmation on call",
    oldPriceRange: "Price confirmation on call",
    note: "Elective subjects and final price confirmed on call.",
  },
  {
    id: "fed-voc",
    boardId: "federal",
    boardLabel: "Federal Board",
    group: "Matric-Tech / Vocational",
    track: "Vocational",
    packageName: "9th Matric-Tech Course - Federal Board",
    subjects: ["Core compulsory subjects", "Selected vocational trade subject"],
    publishers: "NBF / Federal Board Authorized / Trade manuals",
    newPriceRange: "Price confirmation on call",
    oldPriceRange: "Price confirmation on call",
    note: "Trade selection and final price confirmed on call.",
  },
  {
    id: "tech-electrician",
    boardId: "technical",
    boardLabel: "Technical Board",
    group: "Technical School Certificate / Matric Tech",
    track: "Applied Electrician / Industrial Installation",
    packageName: "9th TSC Applied Electrician Course - Technical Board",
    subjects: [
      "English",
      "Urdu / Sindhi",
      "Islamiat",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Applied Electrician / Industrial Installation",
    ],
    publishers: "STBB core books + SBTE trade manuals",
    newPriceRange: "Core books + Rs. 400 – Rs. 800 trade booklet",
    oldPriceRange: "Final old price confirmed on call",
    note: "Final package price depends on selected trade manual availability.",
  },
  {
    id: "tech-hvacr",
    boardId: "technical",
    boardLabel: "Technical Board",
    group: "Technical School Certificate / Matric Tech",
    track: "HVACR",
    packageName: "9th TSC HVACR Course - Technical Board",
    subjects: [
      "English",
      "Urdu / Sindhi",
      "Islamiat",
      "Mathematics",
      "Physics",
      "Chemistry",
      "HVACR / Refrigeration & Air Conditioning",
    ],
    publishers: "STBB core books + SBTE trade manuals",
    newPriceRange: "Core books + Rs. 400 – Rs. 800 trade booklet",
    oldPriceRange: "Final old price confirmed on call",
    note: "Final package price depends on selected trade manual availability.",
  },
  {
    id: "tech-cs",
    boardId: "technical",
    boardLabel: "Technical Board",
    group: "Technical School Certificate / Matric Tech",
    track: "Computer Science & Data Coding",
    packageName: "9th TSC Computer Science & Data Coding Course - Technical Board",
    subjects: [
      "English",
      "Urdu / Sindhi",
      "Islamiat",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Computer Science & Data Coding",
    ],
    publishers: "STBB core books + SBTE trade manuals",
    newPriceRange: "Core books + Rs. 400 – Rs. 800 trade booklet",
    oldPriceRange: "Final old price confirmed on call",
    note: "Final package price depends on selected trade manual availability.",
  },
  {
    id: "tech-drafting",
    boardId: "technical",
    boardLabel: "Technical Board",
    group: "Technical School Certificate / Matric Tech",
    track: "Mechanical Drafting",
    packageName: "9th TSC Mechanical Drafting Course - Technical Board",
    subjects: [
      "English",
      "Urdu / Sindhi",
      "Islamiat",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Mechanical Drafting",
    ],
    publishers: "STBB core books + SBTE trade manuals",
    newPriceRange: "Core books + Rs. 400 – Rs. 800 trade booklet",
    oldPriceRange: "Final old price confirmed on call",
    note: "Final package price depends on selected trade manual availability.",
  },
  {
    id: "tech-welding",
    boardId: "technical",
    boardLabel: "Technical Board",
    group: "Technical School Certificate / Matric Tech",
    track: "Welding",
    packageName: "9th TSC Welding Course - Technical Board",
    subjects: [
      "English",
      "Urdu / Sindhi",
      "Islamiat",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Welding",
    ],
    publishers: "STBB core books + SBTE trade manuals",
    newPriceRange: "Core books + Rs. 400 – Rs. 800 trade booklet",
    oldPriceRange: "Final old price confirmed on call",
    note: "Final package price depends on selected trade manual availability.",
  },
  {
    id: "tech-fashion",
    boardId: "technical",
    boardLabel: "Technical Board",
    group: "Technical School Certificate / Matric Tech",
    track: "Fashion Designing",
    packageName: "9th TSC Fashion Designing Course - Technical Board",
    subjects: [
      "English",
      "Urdu / Sindhi",
      "Islamiat",
      "Mathematics",
      "Physics",
      "Chemistry",
      "Fashion Designing",
    ],
    publishers: "STBB core books + SBTE trade manuals",
    newPriceRange: "Core books + Rs. 400 – Rs. 800 trade booklet",
    oldPriceRange: "Final old price confirmed on call",
    note: "Final package price depends on selected trade manual availability.",
  },
];

export const PRICE_ON_CALL = "Price confirmation on call";

export function getPackagesForBoard(boardId: BoardId): SpecialCoursePackage[] {
  return NINTH_SPECIAL_PACKAGES.filter((p) => p.boardId === boardId);
}

export function getGroupsForBoard(boardId: BoardId): string[] {
  const groups = getPackagesForBoard(boardId).map((p) => p.group);
  return [...new Set(groups)];
}

export function getTracksForGroup(boardId: BoardId, group: string): SpecialCoursePackage[] {
  return getPackagesForBoard(boardId).filter((p) => p.group === group);
}

export function buildSpecialCourseNote(params: {
  boardLabel: string;
  packageName: string;
  condition: "New Course" | "Old Course";
  estimatedPrice: string;
  subjects: string[];
  publishers: string;
  extraNote?: string;
}): string {
  const lines = [
    "Special Course Package:",
    `Class: ${NINTH_CLASS_LABEL}`,
    `Board: ${params.boardLabel}`,
    `Package: ${params.packageName}`,
    `Condition: ${params.condition}`,
    `Estimated Price: ${params.estimatedPrice}`,
    `Subjects: ${params.subjects.join(", ")}`,
    `Publisher: ${params.publishers}`,
    "Final confirmation will be done via call/WhatsApp.",
  ];
  if (params.extraNote?.trim()) {
    lines.push(`Customer note: ${params.extraNote.trim()}`);
  }
  return lines.join("\n");
}
