import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

type CourseRow = {
  id: string;
  school_name: string;
  manual_classes: string[] | null;
  class_range: string | null;
  created_at?: string;
};

type CourseBookRow = {
  id?: string;
  course_id: string;
  class_name: string;
  book_title: string;
  new_price: number;
  old_price: number;
};

type BuilderRow = {
  book_title: string;
  new_price: string;
  old_price: string;
};

export default function CourseManager() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courseBooksCount, setCourseBooksCount] = useState<Record<string, number>>({});
  const [courseClassesCount, setCourseClassesCount] = useState<Record<string, number>>({});

  const [saving, setSaving] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  const [schoolName, setSchoolName] = useState("");
  const [manualClasses, setManualClasses] = useState<string[]>([""]);
  const [classRange, setClassRange] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [classBooks, setClassBooks] = useState<Record<string, BuilderRow[]>>({});

  const loadCourses = async () => {
    setCoursesLoading(true);
    const res = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    setCoursesLoading(false);
    if (res.error) {
      console.error("Failed to load courses:", res.error.message);
      setCourses([]);
      setCourseBooksCount({});
      setCourseClassesCount({});
      return;
    }
    const rows = (res.data ?? []) as CourseRow[];
    setCourses(rows);

    if (rows.length === 0) {
      setCourseBooksCount({});
      setCourseClassesCount({});
      return;
    }
    const courseIds = rows.map((c) => c.id);
    const booksRes = await supabase
      .from("course_books")
      .select("course_id, class_name")
      .in("course_id", courseIds);
    if (booksRes.error) {
      console.error("Failed to load course book counts:", booksRes.error.message);
      setCourseBooksCount({});
      setCourseClassesCount({});
      return;
    }
    const counts: Record<string, number> = {};
    const classCounts: Record<string, Set<string>> = {};
    for (const r of (booksRes.data ?? []) as { course_id: string; class_name: string }[]) {
      counts[r.course_id] = (counts[r.course_id] ?? 0) + 1;
      if (!classCounts[r.course_id]) classCounts[r.course_id] = new Set();
      if (r.class_name) classCounts[r.course_id].add(r.class_name);
    }
    setCourseBooksCount(counts);
    const flattenedClassCounts: Record<string, number> = {};
    for (const [courseId, set] of Object.entries(classCounts)) {
      flattenedClassCounts[courseId] = set.size;
    }
    setCourseClassesCount(flattenedClassCounts);
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const updateManualClass = (index: number, value: string) => {
    setManualClasses((prev) => prev.map((c, i) => (i === index ? value : c)));
  };

  const addManualClass = () => {
    setManualClasses((prev) => [...prev, ""]);
  };

  const removeManualClass = (index: number) => {
    setManualClasses((prev) => prev.filter((_, i) => i !== index));
  };

  const numericClasses: string[] = (() => {
    if (!classRange) return [];
    const [startStr, endStr] = classRange.split("-").map((s) => s.trim());
    const start = Number(startStr);
    const end = Number(endStr);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start <= 0 || end < start) return [];
    const out: string[] = [];
    for (let i = start; i <= end; i++) out.push(String(i));
    return out;
  })();

  const combinedClasses: string[] = [
    ...manualClasses.map((c) => c.trim()).filter((c) => c.length > 0),
    ...numericClasses,
  ];

  const currentBuilderRows: BuilderRow[] =
    selectedClass && classBooks[selectedClass]
      ? classBooks[selectedClass]
      : [{ book_title: "", new_price: "", old_price: "" }];

  const setRowsForSelectedClass = (rows: BuilderRow[]) => {
    if (!selectedClass) return;
    setClassBooks((prev) => ({
      ...prev,
      [selectedClass]: rows,
    }));
  };

  const addBookRow = () => {
    if (!selectedClass) {
      toast({ variant: "destructive", description: "Select a class before adding books." });
      return;
    }
    const rows = classBooks[selectedClass] ?? [{ book_title: "", new_price: "", old_price: "" }];
    setRowsForSelectedClass([...rows, { book_title: "", new_price: "", old_price: "" }]);
  };

  const updateBookRow = (idx: number, patch: Partial<BuilderRow>) => {
    if (!selectedClass) return;
    const rows = currentBuilderRows.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    setRowsForSelectedClass(rows);
  };

  const removeBookRow = (idx: number) => {
    if (!selectedClass) return;
    const rows = currentBuilderRows.filter((_, i) => i !== idx);
    setRowsForSelectedClass(rows.length > 0 ? rows : [{ book_title: "", new_price: "", old_price: "" }]);
  };

  const parsePrice = (raw: string, label: string) => {
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) {
      toast({ variant: "destructive", description: `${label} must be a non-negative number.` });
      return null;
    }
    return n;
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedSchoolName = schoolName.trim();
    if (!trimmedSchoolName) {
      toast({ variant: "destructive", description: "Please enter a school name." });
      return;
    }

    const cleanedManualClasses = manualClasses
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (cleanedManualClasses.length === 0 && !classRange) {
      toast({
        variant: "destructive",
        description: "Add at least one manual class or choose a class range.",
      });
      return;
    }

    if (!combinedClasses.length) {
      toast({
        variant: "destructive",
        description: "There are no classes available to attach books to.",
      });
      return;
    }

    const allBooksToInsert: Omit<CourseBookRow, "course_id">[] = [];
    for (const className of combinedClasses) {
      const rowsForClass =
        classBooks[className] ??
        (selectedClass === className ? currentBuilderRows : []);

      const normalizedRows = rowsForClass
        .map((r) => ({
          book_title: r.book_title.trim(),
          new_price: r.new_price.trim(),
          old_price: r.old_price.trim(),
        }))
        .filter((r) => r.book_title.length > 0 || r.new_price.length > 0 || r.old_price.length > 0);

      for (const [i, r] of normalizedRows.entries()) {
        if (!r.book_title) {
          toast({
            variant: "destructive",
            description: `Book title is required (class "${className}", row ${i + 1}).`,
          });
          return;
        }
        const newP = parsePrice(r.new_price, `New Book Price (${className}, row ${i + 1})`);
        if (newP === null) return;
        const oldP = parsePrice(r.old_price, `Old Book Price (${className}, row ${i + 1})`);
        if (oldP === null) return;
        allBooksToInsert.push({
          class_name: className,
          book_title: r.book_title,
          new_price: newP,
          old_price: oldP,
        });
      }
    }

    if (allBooksToInsert.length === 0) {
      toast({ variant: "destructive", description: "Add at least one book for any class." });
      return;
    }

    setSaving(true);
    try {
      let courseId = editingCourseId;

      if (!courseId) {
        const insertRes = await supabase
          .from("courses")
          .insert({
            school_name: trimmedSchoolName,
            manual_classes: cleanedManualClasses,
            class_range: classRange || null,
          })
          .select("id")
          .single();

        if (insertRes.error || !insertRes.data?.id) {
          throw new Error(insertRes.error?.message || "Failed to create course.");
        }
        courseId = insertRes.data.id as string;
      } else {
        const updateRes = await supabase
          .from("courses")
          .update({
            school_name: trimmedSchoolName,
            manual_classes: cleanedManualClasses,
            class_range: classRange || null,
          })
          .eq("id", courseId);
        if (updateRes.error) throw new Error(updateRes.error.message || "Failed to update course.");

        const delRes = await supabase.from("course_books").delete().eq("course_id", courseId);
        if (delRes.error) throw new Error(delRes.error.message || "Failed to clear course books.");
      }

      const booksRes = await supabase.from("course_books").insert(
        allBooksToInsert.map((b) => ({
          course_id: courseId!,
          class_name: b.class_name,
          book_title: b.book_title,
          new_price: b.new_price,
          old_price: b.old_price,
        }))
      );
      if (booksRes.error) throw new Error(booksRes.error.message || "Failed to save course books.");

      toast({ description: editingCourseId ? "Course updated." : "Course created." });
      resetForm();
      await loadCourses();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save course.";
      console.error(message);
      toast({ variant: "destructive", description: message });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (course: CourseRow) => {
    setEditingCourseId(course.id);
    setSchoolName(course.school_name ?? "");
    const manualFromRow =
      Array.isArray(course.manual_classes) ? course.manual_classes : [];
    setManualClasses(manualFromRow.length > 0 ? manualFromRow : [""]);
    setClassRange(course.class_range ?? "");
    setSelectedClass("");
    setClassBooks({});

    const res = await supabase.from("course_books").select("*").eq("course_id", course.id);
    if (res.error) {
      toast({ variant: "destructive", description: "Failed to load course books for edit." });
      return;
    }
    const rows = (res.data ?? []) as CourseBookRow[];
    if (rows.length === 0) {
      setClassBooks({});
      return;
    }
    const grouped: Record<string, BuilderRow[]> = {};
    for (const r of rows) {
      const cls = r.class_name ?? "";
      if (!cls) continue;
      if (!grouped[cls]) grouped[cls] = [];
      grouped[cls].push({
        book_title: r.book_title ?? "",
        new_price: String(r.new_price ?? 0),
        old_price: String(r.old_price ?? 0),
      });
    }
    setClassBooks(grouped);
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm("Delete this course?")) return;
    setSaving(true);
    try {
      const delBooks = await supabase.from("course_books").delete().eq("course_id", courseId);
      if (delBooks.error) throw new Error(delBooks.error.message || "Failed to delete course books.");

      const delCourse = await supabase.from("courses").delete().eq("id", courseId);
      if (delCourse.error) throw new Error(delCourse.error.message || "Failed to delete course.");

      toast({ description: "Course deleted." });
      if (editingCourseId === courseId) resetForm();
      await loadCourses();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete course.";
      console.error(message);
      toast({ variant: "destructive", description: message });
    } finally {
      setSaving(false);
    }
  };

  const card = "rounded-lg border border-blue-800 bg-[#071235] p-4";
  const input =
    "w-full px-3 py-2 rounded-md bg-[#0b1a4a] border border-blue-800 text-white placeholder:text-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500/40";
  const select =
    "w-full px-3 py-2 rounded-md bg-[#0b1a4a] border border-blue-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40";
  const primaryBtn =
    "px-4 py-2 rounded-md bg-[#FFD700] text-[#050B2D] font-semibold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed";
  const ghostBtn =
    "px-3 py-2 rounded-md border border-blue-800 text-white hover:bg-white/5 disabled:opacity-60 disabled:cursor-not-allowed";

  const resetForm = () => {
    setEditingCourseId(null);
    setSchoolName("");
    setManualClasses([""]);
    setClassRange("");
    setSelectedClass("");
    setClassBooks({});
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSaveCourse} className={card}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-white font-semibold">
              {editingCourseId ? "Edit Course" : "Create Course"}
            </div>
            <div className="text-blue-200/80 text-sm">
              Define school, classes, and then add books for each class.
            </div>
          </div>
          {editingCourseId ? (
            <button type="button" className={ghostBtn} onClick={resetForm} disabled={saving}>
              Cancel Edit
            </button>
          ) : null}
        </div>

        {/* Step 1 — School Name */}
        <div className="mt-4">
          <label className="grid gap-1">
            <span className="text-sm text-blue-200/80">School Name</span>
            <input
              className={input}
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g. Umar Public School"
              disabled={saving}
            />
          </label>
        </div>

        {/* Step 2 — Manual Classes */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-white font-semibold">Manual Classes (before Class 1)</div>
            <button
              type="button"
              className={ghostBtn}
              onClick={addManualClass}
              disabled={saving}
            >
              Add Class
            </button>
          </div>
          <div className="space-y-2">
            {manualClasses.map((cls, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  className={input}
                  value={cls}
                  onChange={(e) => updateManualClass(idx, e.target.value)}
                  placeholder="e.g. Junior, Montessori, KG1"
                  disabled={saving}
                />
                <button
                  type="button"
                  className={ghostBtn}
                  onClick={() => removeManualClass(idx)}
                  disabled={saving || manualClasses.length <= 1}
                  title={manualClasses.length <= 1 ? "At least one row is required" : "Remove class"}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3 — Class Range */}
        <div className="mt-5">
          <label className="grid gap-1">
            <span className="text-sm text-blue-200/80">Class Range</span>
            <select
              className={select}
              value={classRange}
              onChange={(e) => setClassRange(e.target.value)}
              disabled={saving}
            >
              <option value="">No range</option>
              <option value="1-5">1–5</option>
              <option value="1-8">1–8</option>
              <option value="1-10">1–10</option>
              <option value="1-12">1–12</option>
            </select>
          </label>
        </div>

        {/* Step 4 — Class Selection */}
        <div className="mt-5">
          <label className="grid gap-1">
            <span className="text-sm text-blue-200/80">Select Class</span>
            <select
              className={select}
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={saving || combinedClasses.length === 0}
            >
              <option value="">{combinedClasses.length ? "Choose a class" : "No classes available"}</option>
              {combinedClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Step 5 — Add Books for Class */}
        {selectedClass && (
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-white font-semibold">
                Books for Class: <span className="text-[#FFD700]">{selectedClass}</span>
              </div>
              <button
                type="button"
                className={ghostBtn}
                onClick={addBookRow}
                disabled={saving}
              >
                Add Book
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {currentBuilderRows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_160px_160px_auto] gap-3">
                  <input
                    className={input}
                    value={row.book_title}
                    onChange={(e) => updateBookRow(idx, { book_title: e.target.value })}
                    placeholder="Book Title"
                    disabled={saving}
                  />
                  <input
                    className={input}
                    value={row.new_price}
                    onChange={(e) => updateBookRow(idx, { new_price: e.target.value })}
                    placeholder="New Book Price"
                    type="number"
                    min="0"
                    step="1"
                    disabled={saving}
                  />
                  <input
                    className={input}
                    value={row.old_price}
                    onChange={(e) => updateBookRow(idx, { old_price: e.target.value })}
                    placeholder="Old Book Price"
                    type="number"
                    min="0"
                    step="1"
                    disabled={saving}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={ghostBtn}
                      onClick={() => removeBookRow(idx)}
                      disabled={saving || currentBuilderRows.length <= 1}
                      title={
                        currentBuilderRows.length <= 1
                          ? "At least one row is required"
                          : "Remove row"
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 6 — Save */}
        <div className="flex items-center justify-end gap-2 mt-5">
          <button type="submit" className={primaryBtn} disabled={saving}>
            {saving ? "Saving..." : editingCourseId ? "Save Changes" : "Save Course"}
          </button>
        </div>
      </form>

      {/* Step 7 — Course List */}
      <div className={card}>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-white font-semibold">Course List</div>
            <div className="text-blue-200/80 text-sm">Existing courses in the database.</div>
          </div>
        </div>

        {coursesLoading ? (
          <div className="text-blue-200/80 mt-3">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="text-blue-200/80 mt-3">No courses found.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-blue-800 mt-3">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-blue-100">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">School Name</th>
                  <th className="text-left font-semibold px-4 py-3">Total Classes</th>
                  <th className="text-left font-semibold px-4 py-3">Total Books</th>
                  <th className="text-left font-semibold px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-800/60">
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 text-white">
                      {c.school_name ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-white">
                      {courseClassesCount[c.id] ?? 0}
                    </td>
                    <td className="px-4 py-3 text-white">{courseBooksCount[c.id] ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button className={ghostBtn} onClick={() => handleEdit(c)} disabled={saving}>
                          Edit
                        </button>
                        <button
                          className="px-3 py-2 rounded-md border border-red-500/40 text-red-200 hover:bg-red-500/10 font-semibold"
                          onClick={() => handleDelete(c.id)}
                          disabled={saving}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

