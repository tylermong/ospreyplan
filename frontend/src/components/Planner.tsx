"use client";

import { useMemo, useState } from "react";
import {
  parsePrerequisite as parseMatrix,
  canonicalCourse,
  extractCanonicalFromPlannerName,
} from "@/lib/prerequisites";
import AddBox from "./AddBox";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SemesterCard } from "./SemesterCard";
import { usePlannerApi } from "@/hooks/usePlannerApi";
import { calculateTotalCredits } from "@/lib/planner-utils";
import { Course } from "@/types/planner.types";
import { DegreeAudit } from "./DegreeAudit";

export default function Planner() {
  const {
    semesters,
    userId,
    showCreditWarning,
    pendingCourse,
    addSemester,
    addCourse,
    removeCourse,
    renameSemester,
    deleteSemester,
    confirmAddCourse,
    cancelAddCourse,
    setShowCreditWarning,
  } = usePlannerApi();
  const [editingSemesterId, setEditingSemesterId] = useState<string | null>(
    null
  );
  const [draftTerm, setDraftTerm] = useState<string>("Fall");
  const [draftYear, setDraftYear] = useState<number>(new Date().getFullYear());
  const [hoveredCourseId, setHoveredCourseId] = useState<
    string | number | null
  >(null);

  const TERMS = ["Summer", "Fall", "Winter", "Spring"];
  const YEAR_START = 2018;
  const YEAR_END = 2032;
  const years = Array.from(
    { length: YEAR_END - YEAR_START + 1 },
    (_, i) => YEAR_START + i
  ).reverse();

  const hoverSets = useMemo(() => {
    if (!hoveredCourseId)
      return { prereq: new Set<string>(), postreq: new Set<string>() };
    const allCourses: {
      id: string | number;
      canonical: string;
      raw: Course;
      semIndex: number;
    }[] = [];
    semesters.forEach((sem, idx) =>
      sem.courses.forEach((c) =>
        allCourses.push({
          id: c.id,
          canonical: extractCanonicalFromPlannerName(c.name),
          raw: c,
          semIndex: idx,
        })
      )
    );
    const target = allCourses.find((c) => c.id === hoveredCourseId);
    if (!target)
      return { prereq: new Set<string>(), postreq: new Set<string>() };
    const prereqSet = new Set<string>();
    const postSet = new Set<string>();
    const matrix = parseMatrix(target.raw.prerequisite ?? null);
    if (matrix) {
      matrix.flat().forEach((code) => prereqSet.add(canonicalCourse(code)));
    }
    for (const other of allCourses) {
      if (other.id === target.id) continue;
      const m = parseMatrix(other.raw.prerequisite ?? null);
      if (
        m &&
        m.some((group) =>
          group.some((code) => canonicalCourse(code) === target.canonical)
        )
      ) {
        postSet.add(other.id.toString());
      }
    }
    return { prereq: prereqSet, postreq: postSet };
  }, [hoveredCourseId, semesters]);

  function startRenamingSemester(
    semesterId: string,
    term: string,
    year: number
  ) {
    setEditingSemesterId(semesterId);
    setDraftTerm(term ?? "Fall");
    setDraftYear(year ?? new Date().getFullYear());
  }

  function commitRenameSemester() {
    if (!editingSemesterId) return;

    renameSemester(editingSemesterId, draftTerm, draftYear)
      .then(() => {
        setEditingSemesterId(null);
        setDraftTerm("Fall");
        setDraftYear(new Date().getFullYear());
      })
      .catch(() => {});
  }

  function cancelRenameSemester() {
    setEditingSemesterId(null);
    setDraftTerm("Fall");
    setDraftYear(new Date().getFullYear());
  }

  const refreshTrigger = semesters.reduce((acc, s) => acc + s.courses.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-6 rounded bg-amber-400 inline-block"
            aria-hidden
          />
          <span>Prerequisite</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-6 rounded bg-emerald-400 inline-block"
            aria-hidden
          />
          <span>Postrequisite</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-6 rounded bg-red-500 inline-block"
            aria-hidden
          />
          <span>Missing prerequisites</span>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {semesters.map((semester) => {
          const isEditing = editingSemesterId === semester.id;
          return (
            <SemesterCard
              key={semester.id}
              semester={semester}
              isEditing={isEditing}
              draftTerm={draftTerm}
              draftYear={draftYear}
              terms={TERMS}
              years={years}
              hoveredCourseId={hoveredCourseId}
              hoverSets={hoverSets}
              onStartRenaming={() =>
                startRenamingSemester(semester.id, semester.term, semester.year)
              }
              onCommitRename={commitRenameSemester}
              onCancelRename={cancelRenameSemester}
              onSetDraftTerm={setDraftTerm}
              onSetDraftYear={setDraftYear}
              onDelete={() => deleteSemester(semester.id)}
              onAddCourse={(
                subject,
                courseNumber,
                credits,
                prerequisiteRaw
              ) => {
                const courseName = `${subject} ${courseNumber}`;
                addCourse(
                  semester.id,
                  courseName,
                  credits,
                  prerequisiteRaw ?? null
                );
              }}
              onRemoveCourse={(courseId) => removeCourse(semester.id, courseId)}
              onSetHoveredCourseId={setHoveredCourseId}
              extractCanonical={extractCanonicalFromPlannerName}
            />
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
                {pendingCourse &&
                  (() => {
                    const semester = semesters.find(
                      (s) => s.id === pendingCourse.semesterId
                    );
                    return semester
                      ? calculateTotalCredits(semester) + pendingCourse.credits
                      : 0;
                  })()}{" "}
                credits, which exceeds Stockton&#39;s 21 credit per semester
                limit. See the{" "}
                <a
                  href="https://stockton.edu/academic-advising/academic-information/academic-overload.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "underline" }}
                >
                  Academic Overload
                </a>{" "}
                page for more information.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={cancelAddCourse}>
                Cancel
              </Button>
              <Button onClick={confirmAddCourse}>Add Course Anyway</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {userId && (
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-semibold mb-6">Degree Audit</h2>
          <DegreeAudit userId={userId} refreshTrigger={refreshTrigger} />
        </div>
      )}
    </div>
  );
}
