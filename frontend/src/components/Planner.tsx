"use client";

import { useState } from "react";
import AddBox from "./AddBox";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type Course = { id: number; name: string };
type Semester = { id: number; title: string; courses: Course[] };

export default function Planner() {
  const [semesters, setSemesters] = useState<Semester[]>([]);

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

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {semesters.map((semester) => (
        <Card key={semester.id}>
          <CardHeader>
            <CardTitle>{semester.title}</CardTitle>
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
      ))}

      <AddBox
        label="Add semester"
        onClick={addSemester}
        className="h-48 col-span-1"
      />
    </div>
  );
}
