"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";

interface Course {
  subject: string;
  number: string;
  section: string;
  name: string;
}

const courses: Course[] = [
  {
    subject: "CSCI",
    number: "2101",
    section: "001",
    name: "Introduction to Computer Science",
  },
  {
    subject: "MATH",
    number: "1201",
    section: "002",
    name: "Calculus I",
  },
  {
    subject: "ENGL",
    number: "1101",
    section: "003",
    name: "English Composition",
  },
  {
    subject: "PHYS",
    number: "1301",
    section: "001",
    name: "Physics I",
  },
  {
    subject: "HIST",
    number: "1401",
    section: "002",
    name: "World History",
  },
  {
    subject: "CSCI",
    number: "3301",
    section: "001",
    name: "Computer Organization",
  },
  {
    subject: "CIST",
    number: "3550",
    section: "002",
    name: "Foundations of Cybersecurity",
  },
];

interface AddCourseDialogProps {
  onAddCourse: (courseName: string) => void;
}

export function AddCourseDialog({ onAddCourse }: AddCourseDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(
    null
  );
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredCourses = courses.filter((course) =>
    `${course.subject} ${course.number} ${course.section} ${course.name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleAddCourse = () => {
    if (selectedCourse) {
      const courseName = `${selectedCourse.subject} ${selectedCourse.number} ${selectedCourse.section} - ${selectedCourse.name}`;
      onAddCourse(courseName);
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
                const isSelected = selectedCourse === course;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedCourse(course)}
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
