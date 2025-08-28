"use client";

import { useState } from "react";
import AddBox from "./AddBox";
import { AddCourseDialog } from "./AddCourseDialog";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, } from "./ui/dropdown-menu";
import { Pencil, ChevronDown, X } from "lucide-react";

type Course = { id: number; name: string };
type Semester = { id: number; title: string; term: string; year: number; courses: Course[] };

export default function Planner() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [editingSemesterId, setEditingSemesterId] = useState<number | null>(null);
  const [draftTerm, setDraftTerm] = useState<string>("Fall");
  const [draftYear, setDraftYear] = useState<number>(new Date().getFullYear());

  const TERMS = ["Summer", "Fall", "Winter", "Spring"];
  const YEAR_START = 2018;
  const YEAR_END = 2032;
  const years = Array.from(
    { length: YEAR_END - YEAR_START + 1 },
    (_, i) => YEAR_START + i
  ).reverse();

  function addSemester() {
    setSemesters((prev) => {
      const currentYear = new Date().getFullYear();
      const last = prev[prev.length - 1];

      // Default values
      let term = "Fall";
      let year = currentYear; // TODO: Set this to user's start year (implement new user procedure)

      // Compute next term/year based on last semester
      if (last) {
        const lastTerm = last.term;
        const lastYear = last.year ?? currentYear;

        if (lastTerm === "Summer") {
          term = "Fall";
          year = lastYear;
        }
        else if (lastTerm === "Fall") {
          term = "Spring";
          year = lastYear + 1;
        }
        else if (lastTerm === "Winter") {
          term = "Spring";
          year = lastYear;
        }
        else if (lastTerm === "Spring") {
          term = "Fall";
          year = lastYear;
        }
        else {
          term = "Fall";
          year = lastYear;
        }
      }

      return [
        ...prev,
        {
          id: prev.length + 1,
          term,
          year,
          title: `${term} ${year}`,
          courses: [],
        },
      ];
    });
  }

  function addCourse(semesterId: number, courseName: string = "Untitled Course") {
    setSemesters((prev) =>
      prev.map((semester) =>
        semester.id === semesterId
          ? {
              ...semester,
              courses: [
                ...semester.courses,
                {
                  id: semester.courses.length + 1,
                  name: courseName,
                },
              ],
            }
          : semester
      )
    );
  }

  function removeCourse(semesterId: number, courseId: number) {
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

  return (
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
              <CardAction className="row-span-1 self-center">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={commitRenameSemester}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={cancelRenameSemester}>Cancel</Button>
                  </div>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => startRenamingSemester(semester)}
                    aria-label="Rename semester"
                    title="Rename"
                  >
                    <Pencil />
                  </Button>
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

            <AddCourseDialog onAddCourse={(courseName: string) => addCourse(semester.id, courseName)} />
            </CardContent>
          </Card>
        );
      })}

      <AddBox
        label="Add semester"
        onClick={addSemester}
        className="h-60 col-span-1"
      />
    </div>
  );
}
