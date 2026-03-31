import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, GraduationCap, Check } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { COURSE_TYPES, COURSE_STEPS, type CourseType, type CourseStep } from "@/lib/constants";
import { supabase } from "@/lib/supabase";

interface Book {
  id: string;
  title: string;
  newPrice: number;
  oldPrice: number;
  selected: boolean;
}

const BuyCoursePage = () => {
  const [step, setStep] = useState<CourseStep>(COURSE_STEPS.SCHOOL);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
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

  // When a school is selected, load its course and build classes list
  useEffect(() => {
    const loadCourseForSchool = async () => {
      if (!selectedSchool) return;
      const res = await supabase
        .from("courses")
        .select("*")
        .eq("school_name", selectedSchool)
        .single();
      if (res.error || !res.data) {
        console.error("Failed to load course for school:", res.error?.message);
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

    // Reset class and books when school changes
    setSelectedClass("");
    setClasses([]);
    setBooks([]);
    setCurrentCourseId(null);

    if (selectedSchool) {
      loadCourseForSchool();
    }
  }, [selectedSchool]);

  // When class is selected, load books for that course + class
  useEffect(() => {
    const loadBooks = async () => {
      if (!currentCourseId || !selectedClass) return;
      setBooksLoading(true);
      const res = await supabase
        .from("course_books")
        .select("*")
        .eq("course_id", currentCourseId)
        .eq("class_name", selectedClass);
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
    if (currentCourseId && selectedClass) {
      loadBooks();
    }
  }, [currentCourseId, selectedClass]);

  const filteredSchools = schools.filter(school =>
    school.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleBook = (id: string) => {
    setBooks(books.map(book =>
      book.id === id ? { ...book, selected: !book.selected } : book
    ));
  };

  const selectedBooks = books.filter(b => b.selected);

  const coursePrice = selectedBooks.reduce(
    (sum, b) => sum + (courseType === COURSE_TYPES.NEW ? b.newPrice : b.oldPrice),
    0,
  );

  const subtotal = coursePrice * courseQuantity;

  const renderStep = () => {
    switch (step) {
      case COURSE_STEPS.SCHOOL:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Select Your School</h2>
              <p className="text-muted-foreground">Choose your school to see available course books</p>
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
                  No schools found. Try another search or use the field below.
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
              <p className="text-center text-muted-foreground mb-4">Can't find your school?</p>
              <div className="max-w-md mx-auto space-y-3">
                <Input
                  placeholder="Enter school name..."
                  value={otherSchool}
                  onChange={(e) => setOtherSchool(e.target.value)}
                />
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={!otherSchool}
                  onClick={() => {
                    setSelectedSchool(otherSchool);
                    setStep(COURSE_STEPS.CLASS);
                  }}
                >
                  Continue with "{otherSchool || "Other School"}"
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

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-3xl mx-auto">
              {classes.length === 0 ? (
                <p className="col-span-5 text-center text-muted-foreground">
                  No classes configured for this school yet.
                </p>
              ) : (
                classes.map((cls) => (
                  <Button
                    key={cls}
                    variant={selectedClass === cls ? "default" : "outline"}
                    className="h-16"
                    onClick={() => {
                      setSelectedClass(cls);
                      setStep(COURSE_STEPS.COURSE);
                    }}
                  >
                    {cls}
                  </Button>
                ))
              )}
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
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Select Books</h2>
              <p className="text-muted-foreground">
                {selectedSchool} - {selectedClass}
              </p>
            </div>

            {/* Course Type Tabs */}
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

            <div className="grid md:grid-cols-3 gap-6">
              {/* Books List */}
              <div className="md:col-span-2 space-y-3">
                {booksLoading ? (
                  <p className="text-muted-foreground">Loading course books...</p>
                ) : books.length === 0 ? (
                  <p className="text-muted-foreground">
                    No books found for this class yet.
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
                          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                            book.selected ? "bg-primary border-primary" : "border-muted-foreground/30"
                          }`}>
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

              {/* Order Summary */}
              <div className="md:col-span-1">
                <Card variant="elevated" className="sticky top-24">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold">Order Summary</h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Selected Books</span>
                        <span>{selectedBooks.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Course Type</span>
                        <span className="capitalize">{courseType}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-muted-foreground">Course Quantity</span>
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
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Price per Course</span>
                        <span>Rs. {coursePrice}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Subtotal</span>
                        <span>Rs. {subtotal}</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => {
                        if (!selectedBooks.length || !selectedSchool || !selectedClass) {
                          return;
                        }

                        const booksForCourse = selectedBooks.map((b) => ({
                          bookId: b.id,
                          title: b.title,
                          price: courseType === COURSE_TYPES.NEW ? b.newPrice : b.oldPrice,
                        }));

                        addItem(
                          {
                            id: `course-${selectedSchool}-${selectedClass}-${courseType}`,
                            name: `${selectedSchool} - ${selectedClass} (${courseType === COURSE_TYPES.NEW ? "New" : "Old"} Course)`,
                            price: coursePrice,
                            category: `${selectedSchool} - ${selectedClass}`,
                            type: "course",
                            schoolName: selectedSchool,
                            className: selectedClass,
                            courseType,
                            books: booksForCourse,
                            pricePerCourse: coursePrice,
                          },
                          courseQuantity,
                        );

                        navigate("/checkout");
                      }}
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
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[COURSE_STEPS.SCHOOL, COURSE_STEPS.CLASS, COURSE_STEPS.COURSE].map((s, index) => {
            const stepIndex = [COURSE_STEPS.SCHOOL, COURSE_STEPS.CLASS, COURSE_STEPS.COURSE].indexOf(step);
            return (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s 
                    ? "bg-primary text-primary-foreground" 
                    : index < stepIndex
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary text-muted-foreground"
                }`}>
                  {index + 1}
                </div>
                {index < 2 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    index < stepIndex
                      ? "bg-primary"
                      : "bg-secondary"
                  }`} />
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
