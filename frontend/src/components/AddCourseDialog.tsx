"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";

interface Course {
  id: {
    subject: string;
    courseNumber: number;
    section: number;
  };
  name: string;
  credits: number;
  capacity: number;
  filled: number;
  remaining: number;
  term: number;
}

interface AddCourseDialogProps {
  onAddCourse: (courseName: string, credits: number) => void;
}

let coursesCache: Course[] | null = null;
let coursesPromise: Promise<Course[]> | null = null;

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
    const items: any[] = await res.json();

    const normalized = items.map((it: any) => {
      return {
        ...it,
        id: {
          subject: it.courseId.subject,
          courseNumber: Number(it.courseId.courseNumber),
          section: Number(it.courseId.section),
        },
      } as Course;
    });

    coursesCache = normalized;
    coursesPromise = null;
    return normalized;
  })();

  return coursesPromise;
}

export function AddCourseDialog({ onAddCourse }: AddCourseDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(
    null
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const normalized = await fetchCoursesOnce();
      if (cancelled) return;
      setCourses(normalized);
      setLoading(false);
    }

    if (courses.length === 0) load();
    return () => {
      cancelled = true;
    };
  }, []);

  type FlattenedCourse = {
    subject: string;
    number: string;
    section: string;
    name: string;
    credits: number;
    original: Course;
  };

  const flattenedCourses: FlattenedCourse[] = courses.map((c) => ({
    subject: c.id.subject,
    number: c.id.courseNumber.toString(),
    section: c.id.section.toString(),
    name: c.name,
    credits: c.credits,
    original: c,
  }));

  const filteredCourses = flattenedCourses.filter((course) =>
    `${course.subject} ${course.number} ${course.section} ${course.name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleAddCourse = () => {
    if (selectedCourse) {
      const courseName = `${selectedCourse.id.subject} ${selectedCourse.id.courseNumber} ${selectedCourse.id.section} - ${selectedCourse.name}`;
      onAddCourse(courseName, selectedCourse.credits);
      setSelectedCourse(null);
      setOpen(false);
    }
  };

  const handleCancel = () => {
    setSelectedCourse(null);
    setSearchQuery("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Add course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Course</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course, index) => {
                const isSelected = selectedCourse === course.original;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedCourse(course.original)}
                    className={cn(
                      "w-full px-4 py-3 text-left rounded-[var(--radius)] border transition-all",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm hover:bg-primary/90"
                        : "bg-card hover:bg-accent border-border hover:border-border"
                    )}
                  >
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          "text-sm",
                          isSelected
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        )}
                      >
                        {course.subject} {course.number} {course.section}
                      </span>
                      <span
                        className={cn(
                          "text-md font-medium",
                          isSelected ? "text-primary-foreground" : ""
                        )}
                      >
                        {course.name}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">
                No courses found
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleAddCourse} disabled={!selectedCourse}>
            Add course
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
