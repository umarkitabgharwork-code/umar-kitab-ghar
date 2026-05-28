import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import NinthSpecialCourseFlow from "@/components/special-course/NinthSpecialCourseFlow";
import { SPECIAL_COURSE_BOARDS } from "@/data/specialCourse9thPackages";

const CLASS_CONFIG = {
  "9th": {
    title: "9th Course",
    subtitle: "Matric 9th class course books by board",
  },
  "10th": {
    title: "10th Course",
    subtitle: "Matric 10th class course books by board",
  },
  "11th": {
    title: "11th Course",
    subtitle: "Intermediate 1st year course books by board",
  },
  "12th": {
    title: "12th Course",
    subtitle: "Intermediate 2nd year course books by board",
  },
} as const;

type ClassKey = keyof typeof CLASS_CONFIG;

const isValidClass = (classKey: string | undefined): classKey is ClassKey =>
  classKey === "9th" || classKey === "10th" || classKey === "11th" || classKey === "12th";

function PlaceholderBoardFlow({ title, subtitle }: { title: string; subtitle: string }) {
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);

  if (!selectedBoard) {
    return (
      <div>
        <h2 className="mb-4 text-center text-xl font-semibold text-[#071D36] md:text-2xl">
          Select Your Board
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {SPECIAL_COURSE_BOARDS.map((board) => (
            <button
              key={board.id}
              type="button"
              onClick={() => setSelectedBoard(board.label)}
              className="rounded-2xl border border-[#5F7F64]/30 bg-[#DDE8D8] px-4 py-5 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C9A44C] hover:shadow-md"
            >
              <span className="text-base font-semibold text-[#071D36]">{board.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl border border-[#E8DEC8] bg-[#FFFDF8] px-5 py-4 text-center shadow-sm">
        <p className="text-sm font-medium text-[#5F7F64]">
          Selected Class: <span className="text-[#071D36]">{title}</span>
        </p>
        <p className="mt-1 text-sm font-medium text-[#5F7F64]">
          Selected Board: <span className="text-[#071D36]">{selectedBoard}</span>
        </p>
      </div>

      <Card className="rounded-2xl border border-[#E8DEC8] bg-[#FFFDF8] shadow-sm">
        <CardContent className="p-8 text-center md:p-10">
          <p className="text-lg font-medium text-[#071D36]">
            Courses for this class and board will be added here.
          </p>
          <p className="mt-2 text-sm text-[#5F7F64]">
            {title} · {selectedBoard}
          </p>
          <p className="mt-1 text-xs text-[#5F7F64]/80">{subtitle}</p>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          className="border-[#5F7F64]/40 text-[#071D36] hover:border-[#C9A44C] hover:bg-[#DDE8D8]/50"
          onClick={() => setSelectedBoard(null)}
        >
          Back to Boards
        </Button>
      </div>
    </div>
  );
}

const SpecialCoursePage = () => {
  const { group } = useParams<{ group: string }>();

  if (!isValidClass(group)) {
    return (
      <div className="page-section min-h-[50vh] bg-[#FBF7EF]">
        <div className="container max-w-3xl text-center">
          <h1 className="text-2xl font-semibold text-[#071D36]">Course not found</h1>
          <p className="mt-2 text-[#5F7F64]">This course shortcut link is invalid.</p>
          <Button asChild className="mt-6">
            <Link to={ROUTES.BUY_COURSE}>← Back to Course Page</Link>
          </Button>
        </div>
      </div>
    );
  }

  const config = CLASS_CONFIG[group];

  return (
    <div className="page-section min-h-[60vh] bg-[#FBF7EF]">
      <div className="container max-w-4xl">
        <Button
          asChild
          variant="ghost"
          className="mb-6 text-[#5F7F64] hover:text-[#071D36] hover:bg-[#DDE8D8]/60"
        >
          <Link to={ROUTES.BUY_COURSE}>← Back to Course Page</Link>
        </Button>

        <div className="mb-8 rounded-3xl border border-[#E8DEC8] bg-[#FFFDF8] p-6 shadow-sm md:p-8">
          <h1 className="font-serif text-2xl font-semibold text-[#071D36] md:text-3xl">{config.title}</h1>
          <p className="mt-2 text-sm text-[#5F7F64] md:text-base">{config.subtitle}</p>
        </div>

        {group === "9th" ? (
          <NinthSpecialCourseFlow />
        ) : (
          <PlaceholderBoardFlow title={config.title} subtitle={config.subtitle} />
        )}
      </div>
    </div>
  );
};

export default SpecialCoursePage;
