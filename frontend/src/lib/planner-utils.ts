import { Semester } from "@/types/planner.types";
import {
  parsePrerequisite,
  extractCanonicalFromPlannerName,
  listUnmetGroups,
} from "./prerequisites";

export function sortSemestersByTermAndYear(semesters: Semester[]): Semester[] {
  const termOrder: Record<string, number> = {
    Winter: 0,
    Spring: 1,
    Summer: 2,
    Fall: 3,
  };

  return [...semesters].sort((a: Semester, b: Semester) => {
    if (a.year !== b.year) {
      return a.year - b.year;
    }
    const aTermOrder = termOrder[a.term] ?? 999;
    const bTermOrder = termOrder[b.term] ?? 999;
    return aTermOrder - bTermOrder;
  });
}

export function recomputePrereqStatuses(current: Semester[]): Semester[] {
  const sorted = sortSemestersByTermAndYear(current);
  const takenBeforePerSemester: Map<string, Set<string>> = new Map();
  const cumulative = new Set<string>();
  for (const sem of sorted) {
    takenBeforePerSemester.set(sem.id, new Set(cumulative));
    for (const c of sem.courses) {
      cumulative.add(extractCanonicalFromPlannerName(c.name));
    }
  }
  return sorted.map((sem) => ({
    ...sem,
    courses: sem.courses.map((c) => {
      const matrix = parsePrerequisite(c.prerequisite ?? null);
      const priorSet = takenBeforePerSemester.get(sem.id) ?? new Set<string>();
      const unmet = listUnmetGroups(matrix, priorSet);
      return {
        ...c,
        unmetPrereqs: unmet.length > 0 ? unmet.map((g) => g.join(" OR ")) : undefined,
      };
    }),
  }));
}

export function calculateTotalCredits(semester: Semester): number {
  return semester.courses.reduce((total, course) => total + course.credits, 0);
}
