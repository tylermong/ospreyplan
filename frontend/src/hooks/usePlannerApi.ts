import { useState, useEffect } from "react";
import { Semester, BackendSemester } from "@/types/planner.types";
import {
  sortSemestersByTermAndYear,
  recomputePrereqStatuses,
  calculateTotalCredits,
} from "@/lib/planner-utils";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

export function usePlannerApi() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [showCreditWarning, setShowCreditWarning] = useState(false);
  const [pendingCourse, setPendingCourse] = useState<{
    semesterId: string;
    courseName: string;
    credits: number;
    prerequisiteRaw?: string | null;
  } | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/auth/me`, { method: "GET", credentials: "include" })
      .then(async (res) => {
        let parsed = null;
        try {
          parsed = await res.json();
        } catch {}
        if (!res.ok) throw new Error("not authenticated");
        return parsed;
      })
      .then((user) => {
        if (user && user.id) {
          setUserId(user.id);
          fetch(`${API_BASE}/api/semesters/user/${user.id}`, {
            method: "GET",
            credentials: "include",
          })
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
                  prerequisite:
                    c.prerequisite === undefined || c.prerequisite === null
                      ? null
                      : typeof c.prerequisite === "string"
                      ? c.prerequisite
                      : JSON.stringify(c.prerequisite),
                })),
              }));

              const missingKeys = new Map<
                string,
                { subject: string; courseNumber: number }
              >();
              for (const sem of mapped) {
                for (const pc of sem.courses) {
                  if (!pc.prerequisite) {
                    const match = pc.name.match(/^([A-Za-z]+)\s+(\d{3,4})/);
                    if (match) {
                      const subj = match[1].toUpperCase();
                      const num = Number(match[2]);
                      const key = `${subj} ${num}`;
                      if (!missingKeys.has(key))
                        missingKeys.set(key, {
                          subject: subj,
                          courseNumber: num,
                        });
                    }
                  }
                }
              }

              if (missingKeys.size > 0) {
                try {
                  const catalogResp = await fetch(`${API_BASE}/api/courses`, {
                    credentials: "include",
                  }).catch(() => null);
                  const catalog =
                    catalogResp && catalogResp.ok
                      ? await catalogResp.json().catch(() => null)
                      : null;

                  type CatalogItem = {
                    courseId?: { subject?: string; courseNumber?: number };
                    subject?: string;
                    courseNumber?: number;
                    name?: string;
                    prerequisite?: string | null;
                  };
                  const catalogIndex = new Map<string, CatalogItem>();
                  if (Array.isArray(catalog)) {
                    for (const rawItem of catalog) {
                      const item = rawItem as CatalogItem;
                      let subj: string | null = null;
                      let num: number | null = null;
                      if (
                        item.courseId &&
                        (item.courseId.subject ||
                          item.courseId.courseNumber !== undefined)
                      ) {
                        subj = String(item.courseId.subject).toUpperCase();
                        num = Number(item.courseId.courseNumber);
                      } else if (
                        item.subject ||
                        item.courseNumber !== undefined
                      ) {
                        subj = String(item.subject).toUpperCase();
                        num = Number(item.courseNumber);
                      } else if (typeof item.name === "string") {
                        const m = item.name.match(/^([A-Za-z]+)\s+(\d{3,4})/);
                        if (m) {
                          subj = m[1].toUpperCase();
                          num = Number(m[2]);
                        }
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
                      const val =
                        found.prerequisite === null ||
                        found.prerequisite === undefined
                          ? null
                          : typeof found.prerequisite === "string"
                          ? found.prerequisite
                          : JSON.stringify(found.prerequisite);
                      prereqByKey.set(key, val);
                    } else {
                      prereqByKey.set(key, null);
                    }
                  }

                  const merged = mapped.map((sem) => ({
                    ...sem,
                    courses: sem.courses.map((c) => {
                      if (c.prerequisite) return c;
                      const m = c.name.match(/^([A-Za-z]+)\s+(\d{3,4})/);
                      if (!m) return c;
                      const key = `${m[1].toUpperCase()} ${Number(m[2])}`;
                      const prereq = prereqByKey.has(key)
                        ? prereqByKey.get(key) ?? null
                        : null;

                      return { ...c, prerequisite: prereq };
                    }),
                  }));

                  setSemesters(recomputePrereqStatuses(merged));
                } catch {
                  console.warn("Failed to fetch course prerequisites");
                  setSemesters(recomputePrereqStatuses(mapped));
                }
              } else {
                setSemesters(recomputePrereqStatuses(mapped));
              }
            })
            .catch(() => console.error("failed to load semesters"));
        }
      })
      .catch(() => {});
  }, []);

  function addSemester() {
    if (!userId) {
      toast.error("You must be signed in to create a semester.");
      return;
    }

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
    fetch(
      `${API_BASE}/api/semesters?userId=${userId}&title=${encodeURIComponent(
        title
      )}`,
      {
        method: "POST",
        credentials: "include",
      }
    )
      .then(async (res) => {
        if (!res.ok) throw new Error(`Create semester failed: ${res.status}`);
        return res.json();
      })
      .then((data: BackendSemester) => {
        setSemesters((prev) =>
          sortSemestersByTermAndYear([
            ...prev,
            { id: data.id, title: data.title, term, year, courses: [] },
          ])
        );
        toast.success("Semester created");
      })
      .catch((e) => {
        console.error("Failed to create semester", e);
        toast.error("Failed to create semester");
      });
  }

  function addCourse(
    semesterId: string,
    courseName: string,
    credits: number,
    prerequisiteRaw?: string | null
  ) {
    const semester = semesters.find((s) => s.id === semesterId);
    if (!semester) return;

    const isDuplicate = semester.courses.some(
      (course) => course.name === courseName
    );

    if (isDuplicate) {
      toast.error("This course already exists in the semester.", {
        position: "top-center",
        style: {
          backgroundColor: "var(--destructive)",
          color: "var(--destructive-foreground)",
        },
        closeButton: true,
      });
      return;
    }

    const currentCredits = calculateTotalCredits(semester);
    const newTotalCredits = currentCredits + credits;

    if (newTotalCredits > 21) {
      setPendingCourse({ semesterId, courseName, credits, prerequisiteRaw });
      setShowCreditWarning(true);
      return;
    }

    if (!userId) {
      toast.error("You must be signed in to add a course.");
      return;
    }

    const match = courseName.match(/^([A-Z]+)\s+(\d+)\s+([^\s]+)\b/);
    let subject = "";
    let courseNumber = 0;
    let section = "";
    if (match) {
      subject = match[1];
      courseNumber = Number(match[2]);
      section = match[3];
    }

    fetch(
      `${API_BASE}/api/semesters/${semesterId}/courses?subject=${encodeURIComponent(
        subject
      )}&courseNumber=${courseNumber}&section=${encodeURIComponent(
        section
      )}&credits=${encodeURIComponent(String(credits))}`,
      {
        method: "POST",
        credentials: "include",
      }
    )
      .then(async (res) => {
        if (!res.ok) throw new Error(`Add course failed: ${res.status}`);
        return res.json();
      })
      .then((createdCourse: any) => {
        let unmetForNew: string[] | undefined;
        setSemesters((prev) => {
          const updated = prev.map((s) =>
            s.id === semesterId
              ? {
                  ...s,
                  courses: [
                    ...s.courses,
                    {
                      id: createdCourse.id ?? `${s.courses.length + 1}`,
                      name: courseName,
                      credits,
                      prerequisite:
                        createdCourse.prerequisite ?? prerequisiteRaw ?? null,
                    },
                  ],
                }
              : s
          );
          const recomputed = recomputePrereqStatuses(updated);
          const sem = recomputed.find((s) => s.id === semesterId);
          const c = sem?.courses.find((c) => c.name === courseName);
          if (c?.unmetPrereqs) unmetForNew = c.unmetPrereqs;
          return recomputed;
        });
        if (unmetForNew && unmetForNew.length > 0) {
          toast.warning(
            `Added course, missing prerequisites: ${unmetForNew.join(" AND ")}`
          );
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
    if (userId && typeof courseId === "string") {
      fetch(
        `${API_BASE}/api/semesters/${semesterId}/courses/${encodeURIComponent(
          String(courseId)
        )}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      )
        .then((res) => {
          if (res.ok) {
            setSemesters((prev) => {
              const updated = prev.map((semester) =>
                semester.id === semesterId
                  ? {
                      ...semester,
                      courses: semester.courses.filter(
                        (course) => course.id !== courseId
                      ),
                    }
                  : semester
              );
              return recomputePrereqStatuses(updated);
            });
            toast.success("Course removed");
          } else {
            toast.error("Failed to remove course");
            console.error(
              "Failed to remove course",
              res.status,
              res.statusText
            );
          }
        })
        .catch((e) => {
          toast.error("Failed to remove course");
          console.error("Failed to remove course", e);
        });
      return;
    }

    setSemesters((prev) => {
      const updated = prev.map((semester) =>
        semester.id === semesterId
          ? {
              ...semester,
              courses: semester.courses.filter(
                (course) => course.id !== courseId
              ),
            }
          : semester
      );
      return recomputePrereqStatuses(updated);
    });
  }

  function renameSemester(
    semesterId: string,
    nextTerm: string,
    nextYear: number
  ) {
    if (!userId) {
      toast.error("You must be signed in to rename a semester.");
      return Promise.reject();
    }

    const nextTitle = `${nextTerm} ${nextYear}`;

    return fetch(
      `${API_BASE}/api/semesters/${encodeURIComponent(
        semesterId
      )}?title=${encodeURIComponent(nextTitle)}`,
      {
        method: "PATCH",
        credentials: "include",
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Rename semester failed: ${res.status}`);
        setSemesters((prev) => {
          const updated = prev.map((semester) =>
            semester.id === semesterId
              ? {
                  ...semester,
                  term: nextTerm,
                  year: nextYear,
                  title: nextTitle,
                }
              : semester
          );
          return recomputePrereqStatuses(updated);
        });
        toast.success("Semester renamed");
      })
      .catch((err) => {
        console.error("Failed to rename semester", err);
        toast.error("Failed to rename semester");
        throw err;
      });
  }

  function deleteSemester(semesterId: string) {
    if (!userId) {
      toast.error("You must be signed in to delete a semester.");
      return;
    }

    fetch(`${API_BASE}/api/semesters/${encodeURIComponent(semesterId)}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          setSemesters((prev) =>
            sortSemestersByTermAndYear(prev.filter((s) => s.id !== semesterId))
          );
          toast.success("Semester deleted");
        } else {
          toast.error("Failed to delete semester");
          console.error(
            "Failed to delete semester",
            res.status,
            res.statusText
          );
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

  return {
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
  };
}
