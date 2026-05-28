import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import SpecialCoursePackageFlow from "@/components/special-course/SpecialCoursePackageFlow";
import { NINTH_CLASS_LABEL, NINTH_SPECIAL_PACKAGES } from "@/data/specialCourse9thPackages";
import { TENTH_CLASS_LABEL, TENTH_SPECIAL_PACKAGES } from "@/data/specialCourse10thPackages";
import { ELEVENTH_CLASS_LABEL, ELEVENTH_SPECIAL_PACKAGES } from "@/data/specialCourse11thPackages";
import { TWELFTH_CLASS_LABEL, TWELFTH_SPECIAL_PACKAGES } from "@/data/specialCourse12thPackages";
import type { SpecialCoursePackageFlowProps } from "@/components/special-course/SpecialCoursePackageFlow";

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

const CLASS_FLOW_CONFIG: Record<
  keyof typeof CLASS_CONFIG,
  Pick<SpecialCoursePackageFlowProps, "classSlug" | "classLabel" | "packages">
> = {
  "9th": { classSlug: "9th", classLabel: NINTH_CLASS_LABEL, packages: NINTH_SPECIAL_PACKAGES },
  "10th": { classSlug: "10th", classLabel: TENTH_CLASS_LABEL, packages: TENTH_SPECIAL_PACKAGES },
  "11th": { classSlug: "11th", classLabel: ELEVENTH_CLASS_LABEL, packages: ELEVENTH_SPECIAL_PACKAGES },
  "12th": { classSlug: "12th", classLabel: TWELFTH_CLASS_LABEL, packages: TWELFTH_SPECIAL_PACKAGES },
};

type ClassKey = keyof typeof CLASS_CONFIG;

const isValidClass = (classKey: string | undefined): classKey is ClassKey =>
  classKey === "9th" || classKey === "10th" || classKey === "11th" || classKey === "12th";

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
  const flowConfig = CLASS_FLOW_CONFIG[group];

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

        <SpecialCoursePackageFlow {...flowConfig} />
      </div>
    </div>
  );
};

export default SpecialCoursePage;
