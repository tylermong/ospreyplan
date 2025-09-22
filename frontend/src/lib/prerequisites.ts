// Utility for parsing and evaluating course prerequisites.
// Format: JSON string representing an array of AND groups each containing an array of OR options.
// Example: [["ACCT 2120"],["BSNS 2120","BUSA 2120"]]
// Means: (ACCT 2120) AND (BSNS 2120 OR BUSA 2120)

export type PrerequisiteMatrix = string[][]; // AND over outer, OR over inner

export function parsePrerequisite(raw?: string | null): PrerequisiteMatrix | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const matrix: string[][] = [];
    for (const group of parsed) {
      if (Array.isArray(group) && group.every(x => typeof x === 'string')) {
        matrix.push(group as string[]);
      } else {
        return null; // invalid shape
      }
    }
    return matrix;
  } catch {
    return null;
  }
}

// courseCode expected format: SUBJECT NUMBER (ignore section) e.g., "ACCT 2120"
export function canonicalCourse(code: string): string {
  const parts = code.trim().split(/\s+/);
  if (parts.length < 2) return code.trim().toUpperCase();
  return `${parts[0].toUpperCase()} ${parts[1]}`;
}

export function extractCanonicalFromPlannerName(name: string): string {
  // Planner stores like: "ACCT 2120 001"; we only care subject+number
  const match = name.match(/^([A-Za-z]+)\s+(\d{4})/);
  if (!match) return canonicalCourse(name);
  return `${match[1].toUpperCase()} ${match[2]}`;
}

export function isPrerequisiteSatisfied(matrix: PrerequisiteMatrix | null, takenCanonical: Set<string>): boolean {
  if (!matrix || matrix.length === 0) return true;
  return matrix.every(group => group.some(opt => takenCanonical.has(canonicalCourse(opt))));
}

export function listUnmetGroups(matrix: PrerequisiteMatrix | null, takenCanonical: Set<string>): string[][] {
  if (!matrix) return [];
  return matrix.filter(group => !group.some(opt => takenCanonical.has(canonicalCourse(opt))));
}

export function formatGroup(group: string[]): string {
  if (group.length === 1) return group[0];
  return '(' + group.join(' OR ') + ')';
}

export function formatMissing(matrix: string[][]): string {
  return matrix.map(formatGroup).join(' AND ');
}
