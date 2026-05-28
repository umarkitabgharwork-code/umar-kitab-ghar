import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";
import {
  SPECIAL_COURSE_BOARDS,
  PRICE_ON_CALL,
  buildSpecialCourseNote,
  getGroupsForBoard,
  getTracksForGroup,
  type BoardId,
  type SpecialCoursePackage,
} from "@/data/specialCourseTypes";

type CourseCondition = "new" | "old";

const chipClass =
  "rounded-full border border-[#E8DEC8] bg-[#DDE8D8]/50 px-3 py-1 text-xs font-medium text-[#071D36]";

const SelectionSummary = ({
  classLabel,
  boardLabel,
  group,
  track,
}: {
  classLabel: string;
  boardLabel?: string;
  group?: string;
  track?: string;
}) => (
  <div className="rounded-2xl border border-[#E8DEC8] bg-[#FFFDF8] px-5 py-4 shadow-sm">
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      <span className="text-[#5F7F64]">
        Class: <span className="font-medium text-[#071D36]">{classLabel}</span>
      </span>
      {boardLabel ? (
        <span className="text-[#5F7F64]">
          Board: <span className="font-medium text-[#071D36]">{boardLabel}</span>
        </span>
      ) : null}
      {group ? (
        <span className="text-[#5F7F64]">
          Group: <span className="font-medium text-[#071D36]">{group}</span>
        </span>
      ) : null}
      {track ? (
        <span className="text-[#5F7F64]">
          Track: <span className="font-medium text-[#071D36]">{track}</span>
        </span>
      ) : null}
    </div>
  </div>
);

const PackageDetailCard = ({
  pkg,
  condition,
  onConditionChange,
  onAddToCart,
  onProceedToCheckout,
  onBack,
}: {
  pkg: SpecialCoursePackage;
  condition: CourseCondition | null;
  onConditionChange: (c: CourseCondition) => void;
  onAddToCart: () => void;
  onProceedToCheckout: () => void;
  onBack: () => void;
}) => {
  const newLabel = pkg.newPriceRange;
  const oldLabel = pkg.oldPriceRange;
  const selectedRange =
    condition === "new" ? newLabel : condition === "old" ? oldLabel : null;

  return (
    <Card className="rounded-2xl border border-[#E8DEC8] bg-[#FFFDF8] shadow-sm">
      <CardContent className="space-y-5 p-6">
        <div>
          <h3 className="text-lg font-semibold text-[#071D36]">{pkg.packageName}</h3>
          <p className="mt-1 text-xs text-[#5F7F64]">
            {pkg.group} · {pkg.track}
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#5F7F64]">Subjects</p>
          <div className="flex flex-wrap gap-2">
            {pkg.subjects.map((s) => (
              <span key={s} className={chipClass}>
                {s}
              </span>
            ))}
          </div>
        </div>

        <p className="text-xs text-[#5F7F64]/90">{pkg.publishers}</p>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#5F7F64]">Course condition</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onConditionChange("new")}
              className={cn(
                "rounded-2xl border px-4 py-4 text-left transition-all",
                condition === "new"
                  ? "border-[#C9A44C] bg-[#DDE8D8]/80 shadow-md ring-2 ring-[#C9A44C]/40"
                  : "border-[#E8DEC8] bg-[#FFFDF8] hover:border-[#5F7F64]/40",
              )}
            >
              <span className="block text-sm font-semibold text-[#071D36]">New Course</span>
              <span className="mt-1 block text-sm text-[#5F7F64]">{newLabel}</span>
            </button>
            <button
              type="button"
              onClick={() => onConditionChange("old")}
              className={cn(
                "rounded-2xl border px-4 py-4 text-left transition-all",
                condition === "old"
                  ? "border-[#C9A44C] bg-[#DDE8D8]/80 shadow-md ring-2 ring-[#C9A44C]/40"
                  : "border-[#E8DEC8] bg-[#FFFDF8] hover:border-[#5F7F64]/40",
              )}
            >
              <span className="block text-sm font-semibold text-[#071D36]">Old Course</span>
              <span className="mt-1 block text-sm text-[#5F7F64]">{oldLabel}</span>
            </button>
          </div>
        </div>

        {selectedRange ? (
          <div className="rounded-xl border border-[#E8DEC8] bg-[#FBF7EF] px-4 py-3">
            <p className="text-xs text-[#5F7F64]">Estimated price</p>
            <p className="text-base font-semibold text-[#071D36]">{selectedRange}</p>
            <p className="mt-1 text-xs text-[#5F7F64]">
              Final confirmation will be done via call/WhatsApp.
            </p>
          </div>
        ) : null}

        {pkg.note ? <p className="text-xs text-[#5F7F64]">{pkg.note}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="border-[#5F7F64]/40 text-[#071D36]"
            onClick={onBack}
          >
            Back
          </Button>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="border-[#5F7F64]/40"
              disabled={!condition}
              onClick={onAddToCart}
            >
              Add to Cart
            </Button>
            <Button
              type="button"
              className="bg-[#5F7F64] hover:bg-[#4a6a4f] text-white"
              disabled={!condition}
              onClick={onProceedToCheckout}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export interface SpecialCoursePackageFlowProps {
  classSlug: "9th" | "10th" | "11th" | "12th";
  classLabel: string;
  packages: SpecialCoursePackage[];
}

const SpecialCoursePackageFlow = ({
  classSlug,
  classLabel,
  packages,
}: SpecialCoursePackageFlowProps) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [boardId, setBoardId] = useState<BoardId | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<SpecialCoursePackage | null>(null);
  const [condition, setCondition] = useState<CourseCondition | null>(null);
  const [otherBoardNote, setOtherBoardNote] = useState("");

  const boardLabel = SPECIAL_COURSE_BOARDS.find((b) => b.id === boardId)?.label;
  const groups = boardId && boardId !== "other" ? getGroupsForBoard(packages, boardId) : [];
  const trackPackages =
    boardId && boardId !== "other" && selectedGroup
      ? getTracksForGroup(packages, boardId, selectedGroup)
      : [];

  const resetFromBoard = () => {
    setBoardId(null);
    setSelectedGroup(null);
    setSelectedPackage(null);
    setCondition(null);
    setOtherBoardNote("");
  };

  const resetFromGroup = () => {
    setSelectedGroup(null);
    setSelectedPackage(null);
    setCondition(null);
  };

  const resetFromPackage = () => {
    setSelectedPackage(null);
    setCondition(null);
  };

  const addSpecialPackageToCart = (opts: {
    packageName: string;
    board: string;
    subjects: string[];
    publishers: string;
    newPriceRange: string;
    oldPriceRange: string;
    courseCondition: CourseCondition;
    extraNote?: string;
    cartIdSuffix: string;
  }) => {
    const conditionLabel = opts.courseCondition === "new" ? "New Course" : "Old Course";
    const estimatedPrice =
      opts.courseCondition === "new" ? opts.newPriceRange : opts.oldPriceRange;

    const courseNote = buildSpecialCourseNote({
      classLabel,
      boardLabel: opts.board,
      packageName: opts.packageName,
      condition: conditionLabel,
      estimatedPrice,
      subjects: opts.subjects,
      publishers: opts.publishers,
      extraNote: opts.extraNote,
    });

    addItem({
      id: `special-course-${classSlug}-${opts.cartIdSuffix}-${crypto.randomUUID()}`,
      name: opts.packageName,
      price: 0,
      category: `${opts.board} - ${classLabel}`,
      type: "course",
      schoolName: opts.board,
      className: classLabel,
      courseType: opts.courseCondition,
      courseNote,
      estimatedPriceLabel: estimatedPrice,
    });
  };

  const handleAddPackage = (goCheckout: boolean) => {
    if (!selectedPackage || !condition) {
      toast.error("Please select New Course or Old Course");
      return;
    }

    addSpecialPackageToCart({
      packageName: selectedPackage.packageName,
      board: selectedPackage.boardLabel,
      subjects: selectedPackage.subjects,
      publishers: selectedPackage.publishers,
      newPriceRange: selectedPackage.newPriceRange,
      oldPriceRange: selectedPackage.oldPriceRange,
      courseCondition: condition,
      cartIdSuffix: selectedPackage.id,
    });

    toast.success("Added to cart");
    if (goCheckout) {
      navigate(ROUTES.CHECKOUT);
    }
  };

  const handleOtherBoardAdd = (goCheckout: boolean) => {
    if (!condition) {
      toast.error("Please select New Course or Old Course");
      return;
    }

    addSpecialPackageToCart({
      packageName: "Other Board Course",
      board: "Other Board",
      subjects: ["As per customer requirement"],
      publishers: "To be confirmed",
      newPriceRange: PRICE_ON_CALL,
      oldPriceRange: PRICE_ON_CALL,
      courseCondition: condition,
      extraNote: otherBoardNote.trim() || undefined,
      cartIdSuffix: "other",
    });

    toast.success("Request added to cart");
    if (goCheckout) {
      navigate(ROUTES.CHECKOUT);
    }
  };

  if (!boardId) {
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
              onClick={() => setBoardId(board.id)}
              className={cn(
                "rounded-2xl border bg-[#DDE8D8] px-4 py-5 text-center shadow-sm transition-all duration-200",
                "border-[#5F7F64]/30 hover:-translate-y-0.5 hover:border-[#C9A44C] hover:shadow-md",
              )}
            >
              <span className="text-base font-semibold text-[#071D36]">{board.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (boardId === "other") {
    return (
      <div className="space-y-6 animate-fade-in">
        <SelectionSummary classLabel={classLabel} boardLabel={boardLabel} />
        <Card className="rounded-2xl border border-[#E8DEC8] bg-[#FFFDF8] shadow-sm">
          <CardContent className="space-y-5 p-6">
            <div>
              <h3 className="text-lg font-semibold text-[#071D36]">Other Board Course</h3>
              <p className="mt-2 text-sm text-[#5F7F64]">
                Please place request and our team will confirm availability and price on call.
              </p>
            </div>

            <Textarea
              placeholder="Write your board / school / course requirement"
              value={otherBoardNote}
              onChange={(e) => setOtherBoardNote(e.target.value)}
              rows={4}
              className="border-[#E8DEC8] bg-[#FBF7EF]"
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(["new", "old"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  className={cn(
                    "rounded-2xl border px-4 py-4 text-left transition-all",
                    condition === c
                      ? "border-[#C9A44C] bg-[#DDE8D8]/80 shadow-md ring-2 ring-[#C9A44C]/40"
                      : "border-[#E8DEC8] bg-[#FFFDF8] hover:border-[#5F7F64]/40",
                  )}
                >
                  <span className="block text-sm font-semibold text-[#071D36]">
                    {c === "new" ? "New Course" : "Old Course"}
                  </span>
                  <span className="mt-1 block text-sm text-[#5F7F64]">{PRICE_ON_CALL}</span>
                </button>
              ))}
            </div>

            <p className="text-xs text-[#5F7F64]">
              Final confirmation will be done via call/WhatsApp.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                className="border-[#5F7F64]/40"
                onClick={resetFromBoard}
              >
                Back to Boards
              </Button>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  disabled={!condition}
                  onClick={() => handleOtherBoardAdd(false)}
                >
                  Add to Cart
                </Button>
                <Button
                  type="button"
                  className="bg-[#5F7F64] hover:bg-[#4a6a4f] text-white"
                  disabled={!condition}
                  onClick={() => handleOtherBoardAdd(true)}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedPackage) {
    return (
      <div className="space-y-6 animate-fade-in">
        <SelectionSummary
          classLabel={classLabel}
          boardLabel={boardLabel}
          group={selectedPackage.group}
          track={selectedPackage.track}
        />
        <PackageDetailCard
          pkg={selectedPackage}
          condition={condition}
          onConditionChange={setCondition}
          onAddToCart={() => handleAddPackage(false)}
          onProceedToCheckout={() => handleAddPackage(true)}
          onBack={resetFromPackage}
        />
        <div className="flex justify-center">
          <Button type="button" variant="ghost" className="text-[#5F7F64]" onClick={resetFromBoard}>
            Change Board
          </Button>
        </div>
      </div>
    );
  }

  if (selectedGroup) {
    return (
      <div className="space-y-6 animate-fade-in">
        <SelectionSummary classLabel={classLabel} boardLabel={boardLabel} group={selectedGroup} />
        <h2 className="text-center text-lg font-semibold text-[#071D36]">Select Track</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {trackPackages.map((pkg) => (
            <button
              key={pkg.id}
              type="button"
              onClick={() => setSelectedPackage(pkg)}
              className={cn(
                "rounded-2xl border bg-[#FFFDF8] px-4 py-4 text-left shadow-sm transition-all",
                "border-[#E8DEC8] hover:border-[#C9A44C] hover:shadow-md",
              )}
            >
              <span className="block text-sm font-semibold text-[#071D36]">{pkg.track}</span>
              <span className="mt-1 block text-xs text-[#5F7F64] line-clamp-2">{pkg.packageName}</span>
            </button>
          ))}
        </div>
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="border-[#5F7F64]/40"
            onClick={resetFromGroup}
          >
            Back to Groups
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <SelectionSummary classLabel={classLabel} boardLabel={boardLabel} />
      <h2 className="text-center text-lg font-semibold text-[#071D36]">Select Group</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {groups.map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => setSelectedGroup(group)}
            className={cn(
              "rounded-2xl border bg-[#DDE8D8] px-4 py-5 text-center shadow-sm transition-all",
              "border-[#5F7F64]/30 hover:border-[#C9A44C] hover:shadow-md",
            )}
          >
            <span className="text-base font-semibold text-[#071D36]">{group}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          className="border-[#5F7F64]/40"
          onClick={resetFromBoard}
        >
          Back to Boards
        </Button>
      </div>
    </div>
  );
};

export default SpecialCoursePackageFlow;
