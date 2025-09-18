"use client";

import { useEffect, useState } from "react";
import AddBox from "./AddBox";
import { AddCourseDialog } from "./AddCourseDialog";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, } from "./ui/dropdown-menu";
import { Pencil, ChevronDown, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type Course = { id: number | string; name: string; credits: number };
type Semester = { id: string; title: string; term: string; year: number; courses: Course[] };

type BackendSemester = {
  id: string;
  title: string;
  userId: string;
  plannedCourses: Array<{ id: string; subject: string; courseNumber: number; section: string }>;
};

export default function Planner() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [editingSemesterId, setEditingSemesterId] = useState<string | null>(null);
  const [draftTerm, setDraftTerm] = useState<string>("Fall");
  const [draftYear, setDraftYear] = useState<number>(new Date().getFullYear());
  const [showCreditWarning, setShowCreditWarning] = useState(false);
  const [pendingCourse, setPendingCourse] = useState<{ semesterId: string; courseName: string; credits: number } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const TERMS = ["Summer", "Fall", "Winter", "Spring"];
  const YEAR_START = 2018;
  const YEAR_END = 2032;
  const years = Array.from(
    { length: YEAR_END - YEAR_START + 1 },
    (_, i) => YEAR_START + i
  ).reverse();

  function addSemester() {
    const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

    if (!userId) {
      toast.error("You must be signed in to create a semester.");
      return;
    }

    // compute next term/year based on last semester
    const currentYear = new Date().getFullYear();
    const last = semesters[semesters.length - 1];
    let term = "Fall";
    let year = currentYear;
    if (last) {
      const lastTerm = last.term;
      const lastYear = last.year ?? currentYear;
      if (lastTerm === "Summer") {
        term = "Fall";
        year = lastYear;
      } else if (lastTerm === "Fall") {
        term = "Spring";
        year = lastYear + 1;
      } else if (lastTerm === "Winter") {
        term = "Spring";
        year = lastYear;
      } else if (lastTerm === "Spring") {
        term = "Fall";
        year = lastYear;
      }
    }

    const title = `${term} ${year}`;
    fetch(`${apiBase}/api/semesters?userId=${userId}&title=${encodeURIComponent(title)}`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Create semester failed: ${res.status}`);
        return res.json();
      })
      .then((data: BackendSemester) => {
        setSemesters((prev) => [
          ...prev,
          { id: data.id, title: data.title, term, year, courses: [] },
        ]);
        toast.success("Semester created");
      })
      .catch((e) => {
        console.error("Failed to create semester", e);
        toast.error("Failed to create semester");
      });
  }

  function addCourse(semesterId: string, courseName: string, credits: number) {
    const semester = semesters.find(s => s.id === semesterId);
    if (!semester) return;

    const isDuplicate = semester.courses.some((course) => course.name === courseName);
    
    if (isDuplicate) {
      toast.error("This course already exists in the semester.", {position: 'top-center', style: { backgroundColor: 'var(--destructive)', color: 'var(--destructive-foreground)'}, closeButton: true});
      return;
    }

  const currentCredits = calculateTotalCredits(semester);
  const newTotalCredits = currentCredits + credits;

    if (newTotalCredits > 21) {
      setPendingCourse({ semesterId, courseName, credits });
      setShowCreditWarning(true);
      return;
    }

    const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

    if (!userId) {
      toast.error("You must be signed in to add a course.");
      return;
    }

    // Expect courseName to be in the format 'SUBJ 101 A' (AddCourseDialog provides structured values)
    const match = courseName.match(/^([A-Z]+)\s+(\d+)\s+([^\s]+)\b/);
    let subject = "";
    let courseNumber = 0;
    let section = "";
    if (match) {
      subject = match[1];
      courseNumber = Number(match[2]);
      section = match[3];
    }

    fetch(`${apiBase}/api/semesters/${semesterId}/courses?subject=${encodeURIComponent(subject)}&courseNumber=${courseNumber}&section=${encodeURIComponent(section)}`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Add course failed: ${res.status}`);
        return res.json();
      })
      .then((createdCourse) => {
        setSemesters((prev) =>
          prev.map((s) =>
            s.id === semesterId
              ? {
                  ...s,
                  courses: [
                    ...s.courses,
                    { id: createdCourse.id ?? `${s.courses.length + 1}`, name: courseName, credits },
                  ],
                }
              : s
          )
        );
        toast.success("Course added");
      })
      .catch((e) => {
        console.error("Failed to add course to semester", e);
        toast.error("Failed to add course");
      });
  }

  function removeCourse(semesterId: string, courseId: number | string) {
    const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

    // If authenticated and courseId looks like a backend id (string/uuid) call backend delete
    if (userId && typeof courseId === "string") {
      fetch(`${apiBase}/api/semesters/${semesterId}/courses/${encodeURIComponent(String(courseId))}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then((res) => {
          if (res.ok) {
            setSemesters((prev) =>
              prev.map((semester) =>
                semester.id === semesterId
                  ? { ...semester, courses: semester.courses.filter((course) => course.id !== courseId) }
                  : semester
              )
            );
            toast.success("Course removed");
          } else {
            toast.error("Failed to remove course");
            console.error("Failed to remove course", res.status, res.statusText);
          }
        })
        .catch((e) => {
          toast.error("Failed to remove course");
          console.error("Failed to remove course", e);
        });
      return;
    }

    // Local-only removal when not authenticated or course is local-only
    setSemesters((prev) =>
      prev.map((semester) =>
        semester.id === semesterId
          ? {
              ...semester,
              courses: semester.courses.filter((course) => course.id !== courseId),
            }
          : semester
      )
    );
  }

  function calculateTotalCredits(semester: Semester): number {
    return semester.courses.reduce((total, course) => total + course.credits, 0);
  }

  // Load current user and semesters on mount
  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";
    fetch(`${apiBase}/auth/me`, { method: "GET", credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("not authenticated");
        return res.json();
      })
      .then((user) => {
        if (user && user.id) {
          setUserId(user.id);
          // fetch semesters
          fetch(`${apiBase}/api/semesters/user/${user.id}`, { method: "GET", credentials: "include" })
            .then((r) => r.json())
            .then((data: BackendSemester[]) => {
              const mapped: Semester[] = (data || []).map((s) => ({
                id: s.id,
                title: s.title,
                term: s.title.split(" ")[0] ?? "Fall",
                year: Number(s.title.split(" ")[1]) || new Date().getFullYear(),
                courses: (s.plannedCourses || []).map((c) => ({ id: c.id, name: `${c.subject} ${c.courseNumber} ${c.section}`, credits: 0 })),
              }));
              setSemesters(mapped);
            })
            .catch((e) => console.error("failed to load semesters", e));
        }
      })
      .catch(() => {
        // not signed in or failed - keep local state
      });
  }, []);

  function startRenamingSemester(semester: Semester) {
    setEditingSemesterId(semester.id);
    setDraftTerm(semester.term ?? "Fall");
    setDraftYear(semester.year ?? new Date().getFullYear());
  }

  function commitRenameSemester() {
    if (editingSemesterId === null) return;

    const nextTerm = draftTerm || "Fall";
    const nextYear = draftYear || new Date().getFullYear();
    const nextTitle = `${nextTerm} ${nextYear}`;
    setSemesters((prev) =>
      prev.map((semester) =>
        semester.id === editingSemesterId
          ? { ...semester, term: nextTerm, year: nextYear, title: nextTitle }
          : semester
      )
    );
    setEditingSemesterId(null);
    setDraftTerm("Fall");
    setDraftYear(new Date().getFullYear());
  }

  function cancelRenameSemester() {
    setEditingSemesterId(null);
    setDraftTerm("Fall");
    setDraftYear(new Date().getFullYear());
  }

  function deleteSemester(semesterId: string) {
    const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";
    if (!userId) {
      toast.error("You must be signed in to delete a semester.");
      return;
    }

    fetch(`${apiBase}/api/semesters/${encodeURIComponent(semesterId)}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          setSemesters((prev) => prev.filter((s) => s.id !== semesterId));
          toast.success("Semester deleted");
        } else {
          toast.error("Failed to delete semester");
          console.error("Failed to delete semester", res.status, res.statusText);
        }
      })
      .catch((e) => {
        toast.error("Failed to delete semester");
        console.error("Failed to delete semester", e);
      });
  }

  function confirmAddCourse() {
    if (!pendingCourse) return;

    const { semesterId, courseName, credits } = pendingCourse;

  // reuse addCourse which will perform backend call if userId present
  addCourse(String(semesterId), courseName, credits);

    setShowCreditWarning(false);
    setPendingCourse(null);
  }

  function cancelAddCourse() {
    setShowCreditWarning(false);
    setPendingCourse(null);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {semesters.map((semester) => {
          const isEditing = editingSemesterId === semester.id;
          return (
            /* Semester cards */
            <Card key={semester.id}>
              <CardHeader className="items-center">
                <CardTitle>
                  {isEditing ? (
                    <div className="flex w-full items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="rounded-md px-2 py-1 text-sm flex items-center gap-2">
                            <span>{draftTerm}</span>
                            <ChevronDown className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="bottom" className="w-40">
                          {TERMS.map((t) => (
                            <DropdownMenuItem key={t} onSelect={() => setDraftTerm(t)}>
                              {t}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="rounded-md px-2 py-1 text-sm flex items-center gap-2">
                            <span>{draftYear}</span>
                            <ChevronDown className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="bottom" className="w-36 max-h-56 overflow-auto">
                          {years.map((y) => (
                            <DropdownMenuItem key={y} onSelect={() => setDraftYear(y)}>
                              {y}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    semester.title
                  )}
                </CardTitle>
                <CardAction className="row-span-1 self-center flex items-center gap-2">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={commitRenameSemester}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={cancelRenameSemester}>Cancel</Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startRenamingSemester(semester)}
                        aria-label="Rename semester"
                        title="Rename"
                      >
                        <Pencil />
                      </Button>

                      <Button size="icon" variant="ghost" onClick={() => deleteSemester(semester.id)} title="Delete semester" aria-label="Delete semester">
                        <X size={16} />
                      </Button>
                    </div>
                  )}
                </CardAction>
              </CardHeader>

              {/* Courses */}
              <CardContent className="space-y-3">
              <div className="space-y-2">
                {semester.courses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-md border px-3 py-2 text-sm flex items-center justify-between"
                  >
                    <span className="flex-1">{course.name}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeCourse(semester.id, course.id)}
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      aria-label="Remove course"
                      title="Remove course"
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
              </div>

              <AddCourseDialog onAddCourse={(subject: string, courseNumber: number, section: string, credits: number) => {
                const courseName = `${subject} ${courseNumber} ${section}`;
                addCourse(semester.id, courseName, credits);
              }} />
              </CardContent>
            </Card>
          );
        })}

        <AddBox
          label="Add semester"
          onClick={addSemester}
          className="h-60 col-span-1"
        />

        <Dialog open={showCreditWarning} onOpenChange={setShowCreditWarning}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Credit Limit Warning</DialogTitle>
              <DialogDescription>
                Adding this course will bring your total credits to{" "}
                {pendingCourse && (() => {
                  const semester = semesters.find(s => s.id === pendingCourse.semesterId);
                  return semester ? calculateTotalCredits(semester) + pendingCourse.credits : 0;
                })()}{" "}
                credits, which exceeds Stockton&#39;s 21 credit per semester limit. 
                See the{" "}
                <a href="https://stockton.edu/academic-advising/academic-information/academic-overload.html" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline'}}>Academic Overload</a>
                {" "}page for more information.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={cancelAddCourse}>
                Cancel
              </Button>
              <Button onClick={confirmAddCourse}>
                Add Course Anyway
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
