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
  };
  name: string;
  minCredits: number;
  maxCredits: number;
  prerequisite?: string | null;
  attributes?: string[];
}

interface AddCourseDialogProps {
  readonly onAddCourse: (subject: string, courseNumber: number, credits: number, prerequisiteRaw: string | null | undefined) => void;
}

let coursesCache: Course[] | null = null;
let coursesPromise: Promise<Course[]> | null = null;

type FlattenedCourse = {
  key: string;
  subject: string;
  number: string;
  name: string;
  minCredits: number;
  maxCredits: number;
  searchIndex: string;
  original: Course;
};
let flattenedCache: FlattenedCourse[] | null = null;

async function fetchCoursesOnce(): Promise<Course[]> {
  if (coursesCache) return coursesCache;
  if (coursesPromise) return coursesPromise;

  coursesPromise = (async () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? (process.env.NODE_ENV === "production" ? "https://ospreyplan.app" : "http://localhost:8080");

    const res = await fetch(`${apiBaseUrl}/api/courses`, {
      method: "GET",
      credentials: "include",
    });
    const items: unknown[] = await res.json();

    type RawCourse = {
      courseId: { subject: string; courseNumber: number };
      minCredits?: number;
      maxCredits?: number;
      name?: string;
      prerequisite?: string | null;
      attributes?: string[];
      [k: string]: unknown;
    };

    const normalized = (items as RawCourse[]).map((it) => {
      const course: Course = {
        id: {
          subject: it.courseId.subject,
          courseNumber: Number(it.courseId.courseNumber),
        },
        name: it.name ?? "",
        minCredits: Number(it.minCredits ?? 0),
        maxCredits: Number(it.maxCredits ?? 0),
        prerequisite: it.prerequisite ?? null,
        attributes: it.attributes ?? [],
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
  return `${c.id.subject}-${c.id.courseNumber}`;
}

async function ensureFlattenedCourses(): Promise<FlattenedCourse[]> {
  if (flattenedCache) return flattenedCache;
  const normalized = await fetchCoursesOnce();

  const sorted = [...normalized].sort((a, b) => {
    const subjectCmp = a.id.subject.localeCompare(b.id.subject);
    if (subjectCmp !== 0) return subjectCmp;
    return Number(a.id.courseNumber) - Number(b.id.courseNumber);
  });

  flattenedCache = sorted.map((c) => {
    const subject = c.id.subject;
    const number = String(c.id.courseNumber);
    const name = c.name;
    const searchIndex = `${subject} ${number} ${name}`.toLowerCase();
    return {
      key: getCourseKey(c),
      subject,
      number,
      name,
      minCredits: c.minCredits,
      maxCredits: c.maxCredits,
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
  const [credits, setCredits] = React.useState<string>("");

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

  React.useEffect(() => {
    if (selectedCourse) {
      setCredits(String(selectedCourse.minCredits));
    }
  }, [selectedCourse]);

  const isCreditsValid = React.useMemo(() => {
    if (!selectedCourse) return true;
    if (selectedCourse.minCredits === selectedCourse.maxCredits) return true;
    if (credits === "") return false;
    
    // Ensure it's a valid integer string (no decimals, no scientific notation)
    if (!/^\d+$/.test(credits)) return false;

    const val = Number(credits);
    return val >= selectedCourse.minCredits && val <= selectedCourse.maxCredits;
  }, [selectedCourse, credits]);

  const handleAddCourse = React.useCallback(() => {
    if (!selectedCourse) return;
    onAddCourse(
      selectedCourse.subject,
      Number(selectedCourse.number),
      Number(credits),
      selectedCourse.original.prerequisite ?? null
    );
    setSelectedKey(null);
    setOpen(false);
  }, [onAddCourse, selectedCourse, credits]);

  const handleCancel = React.useCallback(() => {
    setSelectedKey(null);
    setSearchQuery("");
    setOpen(false);
  }, []);

  const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSelect = React.useCallback((key: string) => {
    setSelectedKey(key);
  }, []);

  const MAX_SHOWN = 50;
  const shownCourses = React.useMemo(() => {
    return filteredCourses.slice(0, MAX_SHOWN);
  }, [filteredCourses]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full cursor-pointer">
          Add course
        </Button>
      </DialogTrigger>
        <DialogContent
          className="sm:max-w-[600px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && selectedCourse && isCreditsValid) {
              const target = e.target as HTMLElement;
              // If focusing a button...
              if (target.tagName === "BUTTON") {
                // ...only intercept if it's the already-selected course row
                if (target.getAttribute("aria-pressed") === "true") {
                   e.preventDefault();
                   handleAddCourse();
                }
                return;
              }
              // For inputs (search, credits), always add
              e.preventDefault();
              handleAddCourse();
            }
          }}
        >
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
            {selectedCourse && selectedCourse.minCredits !== selectedCourse.maxCredits && (
              <div className="pt-4">
                <label className="text-sm font-medium mb-1.5 block">
                  Credits ({selectedCourse.minCredits}-{selectedCourse.maxCredits})
                </label>
                <Input
                  type="number"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  min={selectedCourse.minCredits}
                  max={selectedCourse.maxCredits}
                  step={1}
                  className={!isCreditsValid ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} className="cursor-pointer">
              Cancel
            </Button>
            <Button onClick={handleAddCourse} disabled={!selectedCourse || !isCreditsValid} className="cursor-pointer">
              Add course
            </Button>
          </DialogFooter>
        </DialogContent>

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
            "w-full text-left rounded-[var(--radius)] border transform transition duration-300 ease-in-out will-change-transform cursor-pointer",
            visual
          );
        })()}
        aria-pressed={isSelected}
      >
        <div className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-inherit">{course.subject} {course.number}</p>
            <p className="font-medium text-inherit">{course.name}</p>
          </div>
          <div className="text-sm text-inherit">
             {course.minCredits === course.maxCredits ? `${course.minCredits} Credits` : `${course.minCredits}-${course.maxCredits} Credits`}
          </div>
        </div>
      </button>
    </div>
  );
}));
