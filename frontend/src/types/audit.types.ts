export interface CourseDTO {
  subject: string;
  courseNumber: number;
  section: string;
  credits: number;
  name?: string;
}

export interface DegreeAuditResult {
  name: string;
  category: string;
  requiredCount: number;
  satisfiedBy: CourseDTO[];
}

export interface DegreeAuditResponse {
  degreeCode: string | null;
  results: DegreeAuditResult[];
}
