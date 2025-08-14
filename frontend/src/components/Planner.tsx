"use client";

import { useState } from "react";
import AddBox from "./AddBox";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Pencil } from "lucide-react";

type Course = { id: number; name: string };
type Semester = { id: number; title: string; courses: Course[] };

export default function Planner() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [editingSemesterId, setEditingSemesterId] = useState<number | null>(null);
  const [draftTitle, setDraftTitle] = useState<string>("");

  function addSemester() {
    setSemesters((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        title: "Untitled Semester",
        courses: [],
      },
    ]);
  }

  function addCourse(semesterId: number) {
    setSemesters((prev) =>
      prev.map((semester) =>
        semester.id === semesterId
          ? {
              ...semester,
              courses: [
                ...semester.courses,
                {
                  id: prev.length + 1,
                  name: "Untitled Course",
                },
              ],
            }
          : semester
      )
    );
  }

  function startRenamingSemester(semester: Semester) {
    setEditingSemesterId(semester.id);
    setDraftTitle(semester.title);
  }

  function commitRenameSemester() {
    if (editingSemesterId === null) return;

    const nextTitle = draftTitle.trim() || "Untitled Semester";
    setSemesters((prev) =>
      prev.map((semester) =>
        semester.id === editingSemesterId ? { ...semester, title: nextTitle } : semester
      )
    );
    setEditingSemesterId(null);
    setDraftTitle("");
  }

  function cancelRenameSemester() {
    setEditingSemesterId(null);
    setDraftTitle("");
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {semesters.map((semester) => {
        const isEditing = editingSemesterId === semester.id;
        return (
          <Card key={semester.id}>
            <CardHeader className="items-center">
              <CardTitle>
                {isEditing ? (
                  <input
                    type="text"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onBlur={commitRenameSemester}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRenameSemester();
                      if (e.key === "Escape") cancelRenameSemester();
                    }}
                    autoFocus
                    onFocus={(e) => e.currentTarget.select()}
                    className="w-full rounded-md border px-2 py-1 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
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
            <CardContent className="space-y-3">
            <div className="space-y-2">
              {semester.courses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-md border px-3 py-2 text-sm"
                >
                  {course.name}
                </div>
              ))}
            </div>

            <AddBox
              label="Add course"
              onClick={() => addCourse(semester.id)}
              className="h-28"
            />
            </CardContent>
          </Card>
        );
      })}

      <AddBox
        label="Add semester"
        onClick={addSemester}
        className="h-48 col-span-1"
      />
    </div>
  );
}
