"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface Course {
  id: {
    subject: string;
    courseNumber: number;
    section: string;
  };
  name: string;
  credits: number;
  capacity: number;
  filled: number;
  remaining: number;
  term: number;
}

interface AddCourseDialogProps {
  readonly onAddCourse: (courseName: string, credits: number) => void;
}

let coursesCache: Course[] | null = null;
let coursesPromise: Promise<Course[]> | null = null;

type FlattenedCourse = {
  key: string;
  subject: string;
  number: string;
  section: string;
  name: string;
  credits: number;
  searchIndex: string;
  original: Course;
};
let flattenedCache: FlattenedCourse[] | null = null;

async function fetchCoursesOnce(): Promise<Course[]> {
  if (coursesCache) return coursesCache;
  if (coursesPromise) return coursesPromise;

  coursesPromise = (async () => {
    const apiBaseUrl =
      process.env.NODE_ENV === "production"
        ? "https://ospreyplan.app"
        : "http://localhost:8080";

    const res = await fetch(`${apiBaseUrl}/api/courses`, {
      method: "GET",
      credentials: "include",
    });
    const items: unknown[] = await res.json();

    type RawCourse = {
      courseId: { subject: string; courseNumber: number; section: string };
      credits?: number;
      name?: string;
      [k: string]: unknown;
    };

    const normalized = (items as RawCourse[]).map((it) => {
      const extra = it as unknown as Record<string, unknown>;
      const course: Course = {
        id: {
          subject: it.courseId.subject,
          courseNumber: Number(it.courseId.courseNumber),
          section: it.courseId.section,
        },
        name: it.name ?? "",
        credits: Number(it.credits ?? 0),
        capacity: Number((extra["capacity"] as number) ?? 0),
        filled: Number((extra["filled"] as number) ?? 0),
        remaining: Number((extra["remaining"] as number) ?? 0),
        term: Number((extra["term"] as number) ?? 0),
      };
      return course;
    });

    coursesCache = normalized;
    coursesPromise = null;
    return normalized;
  })();

  return coursesPromise;
}

function getCourseKey(c: Course): string {
  return `${c.id.subject}-${c.id.courseNumber}-${c.id.section}`;
}

async function ensureFlattenedCourses(): Promise<FlattenedCourse[]> {
  if (flattenedCache) return flattenedCache;
  const normalized = await fetchCoursesOnce();

  const sorted = [...normalized].sort((a, b) => {
    const subjectCmp = a.id.subject.localeCompare(b.id.subject);
    if (subjectCmp !== 0) return subjectCmp;
    const numberCmp = Number(a.id.courseNumber) - Number(b.id.courseNumber);
    if (numberCmp !== 0) return numberCmp;
    return String(a.id.section).localeCompare(String(b.id.section));
  });

  flattenedCache = sorted.map((c) => {
    const subject = c.id.subject;
    const number = String(c.id.courseNumber);
    const section = c.id.section;
    const name = c.name;
    const searchIndex = `${subject} ${number} ${section} ${name}`.toLowerCase();
    return {
      key: getCourseKey(c),
      subject,
      number,
      section,
      name,
      credits: c.credits,
      searchIndex,
      original: c,
    } as FlattenedCourse;
  });
  return flattenedCache;
}

export function AddCourseDialog({ onAddCourse }: Readonly<AddCourseDialogProps>) {
  const [open, setOpen] = React.useState(false);
  const [allFlattened, setAllFlattened] = React.useState<FlattenedCourse[] | null>(null);
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const deferredSearch = React.useDeferredValue(searchQuery);
  const [loading, setLoading] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    let cancelled = false;
    async function prefetch() {
      try {
        setLoading(true);
        const data = await ensureFlattenedCourses();
        if (cancelled) return;
        setAllFlattened(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    prefetch();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSelectedKey(null);
    }
  }, [open]);

  const filteredCourses = React.useMemo(() => {
    if (!allFlattened) return [] as FlattenedCourse[];
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return allFlattened;
    return allFlattened.filter((c) => c.searchIndex.includes(q));
  }, [allFlattened, deferredSearch]);

  const selectedCourse = React.useMemo(() => {
    if (!selectedKey || !allFlattened) return null;
    return allFlattened.find((c) => c.key === selectedKey) ?? null;
  }, [selectedKey, allFlattened]);

  const formatCourseName = React.useCallback((c: FlattenedCourse) => {
    return `${c.subject} ${c.number} ${c.section} - ${c.name}`;
  }, []);

  const handleAddCourse = React.useCallback(() => {
    if (!selectedCourse) return;
    const courseName = formatCourseName(selectedCourse);
    onAddCourse(courseName, selectedCourse.credits);
    setSelectedKey(null);
    setOpen(false);
  }, [onAddCourse, selectedCourse, formatCourseName]);

  const handleCancel = React.useCallback(() => {
    setSelectedKey(null);
    setSearchQuery("");
    setOpen(false);
  }, []);

  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    startTransition(() => setSearchQuery(value));
  }, [startTransition]);

  const handleSelect = React.useCallback((key: string) => {
    setSelectedKey(key);
  }, []);

  const MAX_SHOWN = 250;
  const shownCourses = React.useMemo(() => {
    return filteredCourses.slice(0, MAX_SHOWN);
  }, [filteredCourses]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Add course
        </Button>
      </DialogTrigger>
      {open && (
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full"
            />
            <div className="max-h-96 overflow-y-auto">
              {loading && (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              )}
              {!loading && filteredCourses.length > 0 && (
                <div>
                  {shownCourses.map((course) => (
                    <CourseRow
                      key={course.key}
                      course={course}
                      isSelected={selectedKey === course.key}
                      onSelect={handleSelect}
                    />
                  ))}

                  {filteredCourses.length > MAX_SHOWN && (
                    <p className="text-muted-foreground text-sm text-center py-2">
                      Showing {MAX_SHOWN} of {filteredCourses.length} courses. Try searching to narrow results.
                    </p>
                  )}
                </div>
              )}
              {!loading && filteredCourses.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No courses found
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
                  {/* ...existing code... */}
              Cancel
            </Button>
            <Button onClick={handleAddCourse} disabled={!selectedCourse || isPending}>
              Add course
            </Button>
          </DialogFooter>
        </DialogContent>
      )}

    </Dialog>
  );
}

const CourseRow = React.memo(React.forwardRef<HTMLDivElement, {
  course: FlattenedCourse;
  isSelected: boolean;
  onSelect: (key: string) => void;
}>(function CourseRow({ course, isSelected, onSelect }, ref) {
  return (
  <div ref={ref} className="px-4 py-2">
      <button
        onClick={() => onSelect(course.key)}
        className={(() => {
          const visual = isSelected
            ? "bg-primary text-primary-foreground border-primary shadow-sm hover:bg-primary/90"
            : "bg-card hover:bg-accent border-border hover:border-border";
          return cn(
            "w-full text-left rounded-[var(--radius)] border transition-all",
            visual
          );
        })()}
        aria-pressed={isSelected}
      >
        <div className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">{course.subject} {course.number} {course.section}</p>
            <p className="font-medium text-card-foreground">{course.name}</p>
          </div>
        </div>
      </button>
    </div>
  );
}));
