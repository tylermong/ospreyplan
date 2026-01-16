export type Course = {
  id: number | string;
  name: string;
  credits: number;
  prerequisite?: string | null;
  unmetPrereqs?: string[];
};

export type Semester = {
  id: string;
  title: string;
  term: string;
  year: number;
  courses: Course[];
};

export type BackendPlannedCourse = {
  id: string;
  subject: string;
  courseNumber: number;
  credits: number;
  prerequisite?: string | null;
};

export type BackendSemester = {
  id: string;
  title: string;
  userId: string;
  plannedCourses: BackendPlannedCourse[];
};
