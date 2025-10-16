"use client";

import { useEffect, useMemo, useState } from "react";
import { parsePrerequisite, extractCanonicalFromPlannerName, listUnmetGroups, parsePrerequisite as parseMatrix, canonicalCourse } from "@/lib/prerequisites";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import AddBox from "./AddBox";
import { AddCourseDialog } from "./AddCourseDialog";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, } from "./ui/dropdown-menu";
import { Pencil, ChevronDown, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type Course = { id: number | string; name: string; credits: number; prerequisite?: string | null; unmetPrereqs?: string[] };
type Semester = { id: string; title: string; term: string; year: number; courses: Course[] };

type BackendPlannedCourse = {
  id: string;
  subject: string;
  courseNumber: number;
  section: string;
  credits: number;
  prerequisite?: string | null;
};

type BackendSemester = {
  id: string;
  title: string;
  userId: string;
  plannedCourses: BackendPlannedCourse[];
};

export default function Planner() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [editingSemesterId, setEditingSemesterId] = useState<string | null>(null);
  const [draftTerm, setDraftTerm] = useState<string>("Fall");
  const [draftYear, setDraftYear] = useState<number>(new Date().getFullYear());
  const [showCreditWarning, setShowCreditWarning] = useState(false);
  const [pendingCourse, setPendingCourse] = useState<{ semesterId: string; courseName: string; credits: number; prerequisiteRaw?: string | null } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [hoveredCourseId, setHoveredCourseId] = useState<string | number | null>(null);

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
        setSemesters((prev) => sortSemestersByTermAndYear([
          ...prev,
          { id: data.id, title: data.title, term, year, courses: [] },
        ]));
        toast.success("Semester created");
      })
      .catch((e) => {
        console.error("Failed to create semester", e);
        toast.error("Failed to create semester");
      });
  }

  function addCourse(semesterId: string, courseName: string, credits: number, prerequisiteRaw?: string | null) {
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
      setPendingCourse({ semesterId, courseName, credits, prerequisiteRaw });
      setShowCreditWarning(true);
      return;
    }

    const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

    if (!userId) {
      toast.error("You must be signed in to add a course.");
      return;
    }

    // Expect courseName to be in the format 'SUBJ 101 001' (AddCourseDialog provides structured values)
    const match = courseName.match(/^([A-Z]+)\s+(\d+)\s+([^\s]+)\b/);
    let subject = "";
    let courseNumber = 0;
    let section = "";
    if (match) {
      subject = match[1];
      courseNumber = Number(match[2]);
      section = match[3];
    }

    fetch(`${apiBase}/api/semesters/${semesterId}/courses?subject=${encodeURIComponent(subject)}&courseNumber=${courseNumber}&section=${encodeURIComponent(section)}&credits=${encodeURIComponent(String(credits))}`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Add course failed: ${res.status}`);
        return res.json();
      })
          .then((createdCourse: BackendPlannedCourse) => {
        let unmetForNew: string[] | undefined;
        setSemesters((prev) => {
          const updated = prev.map((s) =>
            s.id === semesterId
              ? {
                  ...s,
                      courses: [
                        ...s.courses,
                        { id: createdCourse.id ?? `${s.courses.length + 1}`, name: courseName, credits, prerequisite: createdCourse.prerequisite ?? prerequisiteRaw ?? null },
                      ],
                }
              : s
          );
          const recomputed = recomputePrereqStatuses(updated);
          // find new course
            const sem = recomputed.find(s => s.id === semesterId);
            const c = sem?.courses.find(c => c.name === courseName);
            if (c?.unmetPrereqs) unmetForNew = c.unmetPrereqs;
          return recomputed;
        });
        if (unmetForNew && unmetForNew.length > 0) {
          toast.warning(`Added course, missing prerequisites: ${unmetForNew.join(' AND ')}`);
        } else {
          toast.success("Course added");
        }
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
            setSemesters((prev) => {
              const updated = prev.map((semester) =>
                semester.id === semesterId
                  ? { ...semester, courses: semester.courses.filter((course) => course.id !== courseId) }
                  : semester
              );
              return recomputePrereqStatuses(updated);
            });
            if (hoveredCourseId === courseId) setHoveredCourseId(null);
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
    setSemesters((prev) => {
      const updated = prev.map((semester) =>
        semester.id === semesterId
          ? {
              ...semester,
              courses: semester.courses.filter((course) => course.id !== courseId),
            }
          : semester
      );
      return recomputePrereqStatuses(updated);
    });
  }

  function calculateTotalCredits(semester: Semester): number {
    return semester.courses.reduce((total, course) => total + course.credits, 0);
  }

  // Load current user and semesters on mount
  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";
    fetch(`${apiBase}/auth/me`, { method: "GET", credentials: "include" })
      .then(async (res) => {
        let parsed = null;
  try { parsed = await res.json(); } catch { }
        if (!res.ok) throw new Error("not authenticated");
        return parsed;
      })
      .then((user) => {
        if (user && user.id) {
          setUserId(user.id);
          // fetch semesters
          fetch(`${apiBase}/api/semesters/user/${user.id}`, { method: "GET", credentials: "include" })
            .then((r) => r.json())
            .then(async (data: BackendSemester[]) => {
              const mapped: Semester[] = (data || []).map((s) => ({
                id: s.id,
                title: s.title,
                term: s.title.split(" ")[0] ?? "Fall",
                year: Number(s.title.split(" ")[1]) || new Date().getFullYear(),
                  courses: (s.plannedCourses || []).map((c) => ({
                    id: c.id,
                    name: `${c.subject} ${c.courseNumber} ${c.section}`,
                    credits: c.credits,
                    prerequisite: c.prerequisite === undefined || c.prerequisite === null ? null : (typeof c.prerequisite === 'string' ? c.prerequisite : JSON.stringify(c.prerequisite)),
                  })),
              }));

              // Augment mapped semesters by fetching missing prerequisites from the course catalog.
              // Collect unique canonical course keys for which prerequisite is null.
              const missingKeys = new Map<string, { subject: string; courseNumber: number }>();
              for (const sem of mapped) {
                for (const pc of sem.courses) {
                  if (!pc.prerequisite) {
                    const match = pc.name.match(/^([A-Za-z]+)\s+(\d{3,4})/);
                    if (match) {
                      const subj = match[1].toUpperCase();
                      const num = Number(match[2]);
                      const key = `${subj} ${num}`;
                      if (!missingKeys.has(key)) missingKeys.set(key, { subject: subj, courseNumber: num });
                    }
                  }
                }
              }

              if (missingKeys.size > 0) {
                try {
                  // Fetch the full catalog once and index it. This avoids requesting the full catalog multiple times.
                  const catalogResp = await fetch(`${apiBase}/api/courses`, { credentials: 'include' }).catch(() => null);
                  const catalog = catalogResp && catalogResp.ok ? await catalogResp.json().catch(() => null) : null;

                  type CatalogItem = { courseId?: { subject?: string; courseNumber?: number }; subject?: string; courseNumber?: number; name?: string; prerequisite?: string | null };
                  const catalogIndex = new Map<string, CatalogItem>();
                  if (Array.isArray(catalog)) {
                    for (const rawItem of catalog) {
                      const item = rawItem as CatalogItem;
                      // try to extract subject and courseNumber from different shapes
                      let subj: string | null = null;
                      let num: number | null = null;
                      if (item.courseId && (item.courseId.subject || item.courseId.courseNumber !== undefined)) {
                        subj = String(item.courseId.subject).toUpperCase();
                        num = Number(item.courseId.courseNumber);
                      } else if (item.subject || item.courseNumber !== undefined) {
                        subj = String(item.subject).toUpperCase();
                        num = Number(item.courseNumber);
                      } else if (typeof item.name === 'string') {
                        const m = item.name.match(/^([A-Za-z]+)\s+(\d{3,4})/);
                        if (m) { subj = m[1].toUpperCase(); num = Number(m[2]); }
                      }
                      if (subj && num !== null && !Number.isNaN(num)) {
                        catalogIndex.set(`${subj} ${num}`, item);
                      }
                    }
                  }

                  const prereqByKey = new Map<string, string | null>();
                  for (const key of missingKeys.keys()) {
                    const found = catalogIndex.get(key);
                    if (found) {
                      const val = found.prerequisite === null || found.prerequisite === undefined ? null : (typeof found.prerequisite === 'string' ? found.prerequisite : JSON.stringify(found.prerequisite));
                      prereqByKey.set(key, val);
                    } else {
                      prereqByKey.set(key, null);
                    }
                  }

                  // Merge prerequisites back into mapped semesters
                  const merged = mapped.map(sem => ({
                    ...sem,
                    courses: sem.courses.map(c => {
                      if (c.prerequisite) return c;
                      const m = c.name.match(/^([A-Za-z]+)\s+(\d{3,4})/);
                      if (!m) return c;
                      const key = `${m[1].toUpperCase()} ${Number(m[2])}`;
                      const prereq = prereqByKey.has(key) ? prereqByKey.get(key) ?? null : null;
                      
                      return { ...c, prerequisite: prereq };
                    })
                  }));

                  setSemesters(recomputePrereqStatuses(merged));
                } catch {
                  console.warn('Failed to fetch course prerequisites');
                  setSemesters(recomputePrereqStatuses(mapped));
                }
              } else {
                setSemesters(recomputePrereqStatuses(mapped));
              }
            })
            .catch(() => console.error("failed to load semesters"));
        }
      })
      .catch(() => {
        // not signed in or failed - keep local state
      });
  
  // NOTE: if auth fails and produces an error, log it so debugging can continue.
  // (we intentionally don't expose stack traces to users; this is developer-only console logging)
  }, []);

  function startRenamingSemester(semester: Semester) {
    setEditingSemesterId(semester.id);
    setDraftTerm(semester.term ?? "Fall");
    setDraftYear(semester.year ?? new Date().getFullYear());
  }

  // Helper function to sort semesters by term and year
  // Order within a year: Winter -> Spring -> Summer -> Fall
  function sortSemestersByTermAndYear(semesters: Semester[]): Semester[] {
    const termOrder: Record<string, number> = {
      "Winter": 0,
      "Spring": 1,
      "Summer": 2,
      "Fall": 3,
    };

    return [...semesters].sort((a: Semester, b: Semester) => {
      // First, sort by year
      if (a.year !== b.year) {
        return a.year - b.year;
      }
      // If years are equal, sort by term order
      const aTermOrder = termOrder[a.term] ?? 999;
      const bTermOrder = termOrder[b.term] ?? 999;
      return aTermOrder - bTermOrder;
    });
  }

  // Recompute unmetPrereqs for each course using chronological validation.
  // Only courses placed in earlier semesters satisfy prerequisites.
  // Same-semester or later-semester courses do not count, even if present.
  function recomputePrereqStatuses(current: Semester[]): Semester[] {
    const sorted = sortSemestersByTermAndYear(current);
    const takenBeforePerSemester: Map<string, Set<string>> = new Map();
    const cumulative = new Set<string>();
    for (const sem of sorted) {
      // snapshot of courses taken strictly before this semester
      takenBeforePerSemester.set(sem.id, new Set(cumulative));
      // then add this semester's courses to cumulative AFTER snapshot
      for (const c of sem.courses) {
        // normalize planner names to canonical form so they match codes from prerequisites
        cumulative.add(extractCanonicalFromPlannerName(c.name));
      }
    }
    // Now compute unmetPrereqs using snapshot sets and return sorted by term/year
    return sorted.map(sem => ({
      ...sem,
      courses: sem.courses.map(c => {
        const matrix = parsePrerequisite(c.prerequisite ?? null);
        const priorSet = takenBeforePerSemester.get(sem.id) ?? new Set<string>();
        const unmet = listUnmetGroups(matrix, priorSet);
        return {
          ...c,
            unmetPrereqs: unmet.length > 0 ? unmet.map(g => g.join(' OR ')) : undefined
        };
      })
    }));
  }

  // Hover derived sets
  const hoverSets = useMemo(() => {
    if (!hoveredCourseId) return { prereq: new Set<string>(), postreq: new Set<string>() };
    const allCourses: { id: string | number; canonical: string; raw: Course; semIndex: number }[] = [];
    semesters.forEach((sem, idx) => sem.courses.forEach(c => allCourses.push({ id: c.id, canonical: extractCanonicalFromPlannerName(c.name), raw: c, semIndex: idx })));
    const target = allCourses.find(c => c.id === hoveredCourseId);
    if (!target) return { prereq: new Set<string>(), postreq: new Set<string>() };
    const prereqSet = new Set<string>();
    const postSet = new Set<string>();
    const matrix = parseMatrix(target.raw.prerequisite ?? null);
    if (matrix) {
      matrix.flat().forEach(code => prereqSet.add(canonicalCourse(code)));
    }
    // postrequisites: courses that include this course in their prerequisite matrix
    for (const other of allCourses) {
      if (other.id === target.id) continue;
      const m = parseMatrix(other.raw.prerequisite ?? null);
      if (m && m.some(group => group.some(code => canonicalCourse(code) === target.canonical))) {
        postSet.add(other.id.toString());
      }
    }
    return { prereq: prereqSet, postreq: postSet };
  }, [hoveredCourseId, semesters]);

  function commitRenameSemester() {
    if (!editingSemesterId) return;

    const nextTerm = draftTerm;
    const nextYear = draftYear;
    const nextTitle = `${nextTerm} ${nextYear}`;
    const targetId = editingSemesterId;

    if (!userId) {
      toast.error("You must be signed in to rename a semester.");
      return;
    }

    const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

    fetch(`${apiBase}/api/semesters/${encodeURIComponent(targetId)}?title=${encodeURIComponent(nextTitle)}`, {
      method: "PATCH",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Rename semester failed: ${res.status}`);
        setSemesters((prev) => {
          const updated = prev.map((semester) =>
            semester.id === targetId
              ? { ...semester, term: nextTerm, year: nextYear, title: nextTitle }
              : semester
          );
          return recomputePrereqStatuses(updated);
        });
        setEditingSemesterId(null);
        setDraftTerm("Fall");
        setDraftYear(new Date().getFullYear());
        toast.success("Semester renamed");
      })
      .catch((err) => {
        console.error("Failed to rename semester", err);
        toast.error("Failed to rename semester");
      });
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
          setSemesters((prev) => sortSemestersByTermAndYear(prev.filter((s) => s.id !== semesterId)));
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

    const { semesterId, courseName, credits, prerequisiteRaw } = pendingCourse;

    addCourse(semesterId, courseName, credits, prerequisiteRaw);

    setShowCreditWarning(false);
    setPendingCourse(null);
  }

  function cancelAddCourse() {
    setShowCreditWarning(false);
    setPendingCourse(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-3 w-6 rounded bg-amber-400 inline-block" aria-hidden />
          <span>Prerequisite</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-6 rounded bg-emerald-400 inline-block" aria-hidden />
          <span>Postrequisite</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-6 rounded bg-red-500 inline-block" aria-hidden />
          <span>Missing prerequisites</span>
        </div>
      </div>
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
                {semester.courses.map((course) => {
                  const canonical = extractCanonicalFromPlannerName(course.name);
                  const isHovered = hoveredCourseId === course.id;
                  const isPrereqOfHover = hoverSets.postreq.has(course.id.toString());
                  const prereqSet = hoverSets.prereq;
                  const isPrereq = prereqSet.has(canonical);
                  const unmet = course.unmetPrereqs && course.unmetPrereqs.length > 0;
                  const classes = ["rounded-md border px-3 py-2 text-sm flex items-center justify-between transition-colors"];
                  if (unmet) classes.push("border-red-500 bg-red-50 dark:bg-red-950/30");
                  if (isHovered) classes.push("ring-2 ring-ring border-ring");
                  else if (isPrereq) classes.push("bg-amber-50 dark:bg-amber-900/30 border-amber-400");
                  else if (isPrereqOfHover) classes.push("bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400");
                  const content = (
                    <div
                      onMouseEnter={() => setHoveredCourseId(course.id)}
                      onMouseLeave={() => setHoveredCourseId(null)}
                      className={classes.join(" ")}
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
                  );
                  if (!unmet) {
                    return <div key={course.id}>{content}</div>;
                  }
                  return (
                    <HoverCard key={course.id} openDelay={50} closeDelay={50}>
                      <HoverCardTrigger asChild>
                        {content}
                      </HoverCardTrigger>
                      <HoverCardContent>
                        <div className="space-y-2">
                          <p className="font-semibold text-sm">Missing prerequisites</p>
                          <ul className="list-disc pl-4 text-xs space-y-1">
                            {course.unmetPrereqs?.map((g,i) => (
                              <li key={i}>{g}</li>
                            ))}
                          </ul>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  );
                })}
              </div>

              <AddCourseDialog onAddCourse={(subject: string, courseNumber: number, section: string, credits: number, prerequisiteRaw: string | null | undefined) => {
                const courseName = `${subject} ${courseNumber} ${section}`;
                addCourse(semester.id, courseName, credits, prerequisiteRaw ?? null);
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
