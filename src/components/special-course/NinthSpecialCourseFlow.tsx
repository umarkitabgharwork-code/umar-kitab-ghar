import SpecialCoursePackageFlow from "@/components/special-course/SpecialCoursePackageFlow";
import { NINTH_CLASS_LABEL, NINTH_SPECIAL_PACKAGES } from "@/data/specialCourse9thPackages";

const NinthSpecialCourseFlow = () => (
  <SpecialCoursePackageFlow
    classSlug="9th"
    classLabel={NINTH_CLASS_LABEL}
    packages={NINTH_SPECIAL_PACKAGES}
  />
);

export default NinthSpecialCourseFlow;
