import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Search, GraduationCap, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { COURSE_TYPES, COURSE_STEPS, CLASSES, type CourseType, type CourseStep } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Book {
  id: string;
  title: string;
  newPrice: number;
  oldPrice: number;
  selected: boolean;
}

const OTHER_CLASS_VALUE = "__other__";

const BuyCoursePage = () => {
  const [step, setStep] = useState<CourseStep>(COURSE_STEPS.SCHOOL);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [classSelectValue, setClassSelectValue] = useState("");
  const [otherClassName, setOtherClassName] = useState("");
  const [confirmedClass, setConfirmedClass] = useState("");
  const [courseType, setCourseType] = useState<CourseType>(COURSE_TYPES.NEW);
  const [books, setBooks] = useState<Book[]>([]);
  const [courseQuantity, setCourseQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [otherSchool, setOtherSchool] = useState("");
  const [schools, setSchools] = useState<string[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [classes, setClasses] = useState<string[]>([]);
  const [currentCourseId, setCurrentCourseId] = useState<string | null>(null);
  const [booksLoading, setBooksLoading] = useState(false);
  const [courseNote, setCourseNote] = useState("");
  const [bookListFileUrl, setBookListFileUrl] = useState<string | null>(null);
  const [bookListUploading, setBookListUploading] = useState(false);
  const { addItem } = useCart();
  const navigate = useNavigate();

  // Load distinct school names from courses
  useEffect(() => {
    const loadSchools = async () => {
      setSchoolsLoading(true);
      const res = await supabase
        .from("courses")
        .select("school_name")
        .order("school_name", { ascending: true });
      setSchoolsLoading(false);
      if (res.error) {
        console.error("Failed to load schools:", res.error.message);
        setSchools([]);
        return;
      }
      const names = (res.data ?? [])
        .map((row) => (row as { school_name: string | null }).school_name)
        .filter((name): name is string => !!name && name.trim().length > 0);
      const uniqueSorted = Array.from(new Set(names));
      setSchools(uniqueSorted);
    };
    loadSchools();
  }, []);

  // When a school is selected, load its course and build classes list (optional)
  useEffect(() => {
    const loadCourseForSchool = async () => {
      if (!selectedSchool) return;
      const res = await supabase
        .from("courses")
        .select("*")
        .eq("school_name", selectedSchool)
        .maybeSingle();
      if (res.error || !res.data) {
        if (res.error) console.error("Failed to load course for school:", res.error.message);
        setClasses([]);
        setCurrentCourseId(null);
        return;
      }
      const course = res.data as {
        id: string;
        manual_classes: string[] | null;
        class_range: string | null;
      };
      setCurrentCourseId(course.id);

      const manual = Array.isArray(course.manual_classes)
        ? course.manual_classes.filter((c) => typeof c === "string" && c.trim().length > 0)
        : [];

      let numeric: string[] = [];
      if (course.class_range) {
        const [startStr, endStr] = course.class_range.split("-").map((s) => s.trim());
        const start = Number(startStr);
        const end = Number(endStr);
        if (Number.isFinite(start) && Number.isFinite(end) && start > 0 && end >= start) {
          for (let i = start; i <= end; i++) numeric.push(String(i));
        }
      }

      setClasses([...manual, ...numeric]);
    };

    setClassSelectValue("");
    setOtherClassName("");
    setConfirmedClass("");
    setClasses([]);
    setBooks([]);
    setCurrentCourseId(null);
    setCourseNote("");
    setBookListFileUrl(null);

    if (selectedSchool) {
      void loadCourseForSchool();
    }
  }, [selectedSchool]);

  // When class is confirmed and we have a DB course, load optional course_books
  useEffect(() => {
    const loadBooks = async () => {
      if (!currentCourseId || !confirmedClass) return;
      setBooksLoading(true);
      const res = await supabase
        .from("course_books")
        .select("*")
        .eq("course_id", currentCourseId)
        .eq("class_name", confirmedClass);
      setBooksLoading(false);
      if (res.error) {
        console.error("Failed to load course books:", res.error.message);
        setBooks([]);
        return;
      }
      const rows = (res.data ?? []) as {
        id: string;
        book_title: string | null;
        new_price: number | null;
        old_price: number | null;
      }[];
      const mapped: Book[] = rows.map((row) => ({
        id: row.id,
        title: row.book_title ?? "Untitled Book",
        newPrice: Number(row.new_price ?? 0),
        oldPrice: Number(row.old_price ?? 0),
        selected: true,
      }));
      setBooks(mapped);
    };

    setBooks([]);
    if (currentCourseId && confirmedClass) {
      void loadBooks();
    }
  }, [currentCourseId, confirmedClass]);

  const classOptions = useMemo(() => {
    if (classes.length > 0) return classes;
    return [...CLASSES];
  }, [classes]);

  const filteredSchools = schools.filter((school) =>
    school.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleBook = (id: string) => {
    setBooks((prev) =>
      prev.map((book) => (book.id === id ? { ...book, selected: !book.selected } : book)),
    );
  };

  const selectedBooks = books.filter((b) => b.selected);

  const coursePrice = selectedBooks.reduce(
    (sum, b) => sum + (courseType === COURSE_TYPES.NEW ? b.newPrice : b.oldPrice),
    0,
  );

  const resolvedClassFromSelect =
    classSelectValue === OTHER_CLASS_VALUE ? otherClassName.trim() : classSelectValue;

  const canContinueClass =
    Boolean(classSelectValue) &&
    (classSelectValue !== OTHER_CLASS_VALUE || otherClassName.trim().length > 0);

  const handleContinueClass = () => {
    if (!canContinueClass) return;
    setConfirmedClass(resolvedClassFromSelect);
    setStep(COURSE_STEPS.COURSE);
  };

  const handleBookListUpload = async (file: File) => {
    const okType =
      file.type.startsWith("image/") ||
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!okType) {
      toast.error("Please upload an image or PDF file.");
      return;
    }
    setBookListUploading(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const filePath = `course-book-lists/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, file);
      if (uploadError) {
        toast.error(uploadError.message);
        return;
      }
      const { data: publicData } = supabase.storage.from("product-images").getPublicUrl(filePath);
      setBookListFileUrl(publicData.publicUrl);
      toast.success("Book list uploaded.");
    } finally {
      setBookListUploading(false);
    }
  };

  const hasBookListUploaded = bookListFileUrl != null && bookListFileUrl.length > 0;

  const handleProceedToCheckout = () => {
    if (!bookListFileUrl) {
      toast.error("Please upload your book list to continue");
      return;
    }
    if (!selectedSchool.trim() || !confirmedClass.trim()) return;

    const booksForCourse =
      selectedBooks.length > 0
        ? selectedBooks.map((b) => ({
            bookId: b.id,
            title: b.title,
            price: courseType === COURSE_TYPES.NEW ? b.newPrice : b.oldPrice,
          }))
        : undefined;

    addItem(
      {
        id: `course-${crypto.randomUUID()}`,
        name: `${selectedSchool} - ${confirmedClass} (${courseType === COURSE_TYPES.NEW ? "New" : "Old"} Course)`,
        price: coursePrice,
        category: `${selectedSchool} - ${confirmedClass}`,
        type: "course",
        schoolName: selectedSchool.trim(),
        className: confirmedClass.trim(),
        courseType,
        books: booksForCourse,
        pricePerCourse: coursePrice,
        courseNote: courseNote.trim() || undefined,
        courseBookListUrl: bookListFileUrl,
      },
      courseQuantity,
    );

    navigate("/checkout");
  };

  const renderStep = () => {
    switch (step) {
      case COURSE_STEPS.SCHOOL:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Select Your School</h2>
              <p className="text-muted-foreground">
                Choose your school or enter it manually. You will upload your book list before checkout.
              </p>
            </div>

            <div className="relative max-w-md mx-auto mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search school..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {schoolsLoading ? (
                <p className="col-span-2 text-center text-muted-foreground">Loading schools...</p>
              ) : filteredSchools.length === 0 ? (
                <p className="col-span-2 text-center text-muted-foreground">
                  No schools found in the list. Use the field below to enter your school.
                </p>
              ) : (
                filteredSchools.map((school) => (
                  <Button
                    key={school}
                    variant={selectedSchool === school ? "default" : "outline"}
                    className="justify-start h-auto py-4 px-5"
                    onClick={() => {
                      setSelectedSchool(school);
                      setStep(COURSE_STEPS.CLASS);
                    }}
                  >
                    <GraduationCap className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className="text-left">{school}</span>
                  </Button>
                ))
              )}
            </div>

            <div className="border-t pt-6 mt-6">
              <p className="text-center text-muted-foreground mb-4 font-medium">
                Can&apos;t find your school? Enter manually
              </p>
              <div className="max-w-md mx-auto space-y-3">
                <Input
                  placeholder="Enter school name..."
                  value={otherSchool}
                  onChange={(e) => setOtherSchool(e.target.value)}
                />
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={!otherSchool.trim()}
                  onClick={() => {
                    setSelectedSchool(otherSchool.trim());
                    setStep(COURSE_STEPS.CLASS);
                  }}
                >
                  Continue with &quot;{otherSchool.trim() || "your school"}&quot;
                </Button>
              </div>
            </div>
          </div>
        );

      case COURSE_STEPS.CLASS:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <Button variant="ghost" onClick={() => setStep(COURSE_STEPS.SCHOOL)} className="mb-4">
                ← Back to School Selection
              </Button>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Select Class</h2>
              <p className="text-muted-foreground">
                School: <span className="font-medium text-foreground">{selectedSchool}</span>
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              <Label htmlFor="class-select">Class</Label>
              <Select value={classSelectValue} onValueChange={setClassSelectValue}>
                <SelectTrigger id="class-select">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                  <SelectItem value={OTHER_CLASS_VALUE}>Other</SelectItem>
                </SelectContent>
              </Select>

              {classSelectValue === OTHER_CLASS_VALUE && (
                <div className="space-y-2">
                  <Label htmlFor="other-class">Enter class</Label>
                  <Input
                    id="other-class"
                    placeholder="e.g. Class 6, O Levels, etc."
                    value={otherClassName}
                    onChange={(e) => setOtherClassName(e.target.value)}
                  />
                </div>
              )}

              <Button className="w-full" size="lg" disabled={!canContinueClass} onClick={handleContinueClass}>
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case COURSE_STEPS.COURSE:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <Button variant="ghost" onClick={() => setStep(COURSE_STEPS.CLASS)} className="mb-4">
                ← Back to Class Selection
              </Button>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Course details</h2>
              <p className="text-muted-foreground">
                {selectedSchool} — {confirmedClass}
              </p>
            </div>

            <div className="flex justify-center gap-2 mb-6">
              <Button
                variant={courseType === COURSE_TYPES.NEW ? "default" : "outline"}
                onClick={() => setCourseType(COURSE_TYPES.NEW)}
                className="min-w-32"
              >
                New Course
              </Button>
              <Button
                variant={courseType === COURSE_TYPES.OLD ? "default" : "outline"}
                onClick={() => setCourseType(COURSE_TYPES.OLD)}
                className="min-w-32"
              >
                Old Course
              </Button>
            </div>

            <div className="max-w-xl mx-auto space-y-6 mb-8">
              <div className="space-y-2">
                <Label htmlFor="book-list-file">Upload your book list (required)</Label>
                <input
                  id="book-list-file"
                  type="file"
                  accept="image/*,.pdf,application/pdf"
                  disabled={bookListUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleBookListUpload(file);
                    e.target.value = "";
                  }}
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-accent file:text-accent-foreground hover:file:bg-accent/90"
                />
                {bookListFileUrl ? (
                  <a
                    href={bookListFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-accent underline"
                  >
                    View uploaded file
                  </a>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-note">Special instructions</Label>
                <Textarea
                  id="course-note"
                  placeholder="Write any special instructions or missing books..."
                  value={courseNote}
                  onChange={(e) => setCourseNote(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            {books.length > 0 && (
              <p className="text-center text-sm text-muted-foreground max-w-2xl mx-auto mb-4">
                If we have a book list for your class, you can adjust selections below. Uploading your book list file is
                required before checkout.
              </p>
            )}

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-3">
                {booksLoading ? (
                  <p className="text-muted-foreground">Loading optional course books...</p>
                ) : books.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No preset book list for this school/class. Upload your book list file (required), add any notes, and
                    proceed—final price will be confirmed with you.
                  </p>
                ) : (
                  books.map((book) => (
                    <Card
                      key={book.id}
                      variant={book.selected ? "outline" : "default"}
                      className={`cursor-pointer transition-all ${
                        book.selected ? "border-primary bg-primary/5" : ""
                      }`}
                      onClick={() => toggleBook(book.id)}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                              book.selected ? "bg-primary border-primary" : "border-muted-foreground/30"
                            }`}
                          >
                            {book.selected && <Check className="h-4 w-4 text-primary-foreground" />}
                          </div>
                          <span className="font-medium">{book.title}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">
                            Rs. {courseType === COURSE_TYPES.NEW ? book.newPrice : book.oldPrice}
                          </span>
                          {courseType === COURSE_TYPES.OLD && (
                            <span className="text-xs text-muted-foreground line-through ml-2">
                              Rs. {book.newPrice}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <div className="md:col-span-1">
                <Card variant="elevated" className="sticky top-24">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold">Order Summary</h3>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">School: </span>
                        <span className="font-medium text-foreground">{selectedSchool}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Class: </span>
                        <span className="font-medium text-foreground">{confirmedClass}</span>
                      </div>
                      {courseNote.trim() ? (
                        <div>
                          <span className="text-muted-foreground">Instructions: </span>
                          <span className="text-foreground whitespace-pre-wrap">{courseNote.trim()}</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-2 text-sm border-t pt-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Books in cart (optional)</span>
                        <span>{selectedBooks.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Course type</span>
                        <span className="capitalize">{courseType}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-muted-foreground">Quantity</span>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => setCourseQuantity((q) => Math.max(1, q - 1))}
                          >
                            -
                          </Button>
                          <span className="min-w-[5rem] text-center font-medium">
                            {courseQuantity} Course{courseQuantity > 1 ? "s" : ""}
                          </span>
                          <Button
                            type="button"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setCourseQuantity((q) => q + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Price will be confirmed via call or WhatsApp after order.
                      </p>
                      {!hasBookListUploaded ? (
                        <p className="text-sm text-destructive">Please upload your book list to continue</p>
                      ) : null}
                    </div>

                    <Button
                      className={cn("w-full", !hasBookListUploaded && "opacity-50 cursor-not-allowed")}
                      size="lg"
                      disabled={!hasBookListUploaded}
                      onClick={handleProceedToCheckout}
                    >
                      Proceed to Checkout <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="py-8 md:py-12">
      <div className="container">
        <div className="flex items-center justify-center gap-2 mb-8">
          {[COURSE_STEPS.SCHOOL, COURSE_STEPS.CLASS, COURSE_STEPS.COURSE].map((s, index) => {
            const stepIndex = [COURSE_STEPS.SCHOOL, COURSE_STEPS.CLASS, COURSE_STEPS.COURSE].indexOf(step);
            return (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === s
                      ? "bg-primary text-primary-foreground"
                      : index < stepIndex
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                {index < 2 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${index < stepIndex ? "bg-primary" : "bg-secondary"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {renderStep()}
      </div>
    </div>
  );
};

export default BuyCoursePage;
