import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle } from "lucide-react";
import { DegreeAuditResult } from "@/types/audit.types";

interface AuditRequirementCardProps {
  requirement: DegreeAuditResult;
}

export function AuditRequirementCard({ requirement }: AuditRequirementCardProps) {
  const isSatisfied = requirement.satisfiedBy.length >= requirement.requiredCount;
  
  // Create slots
  const slots = [];
  for (let i = 0; i < requirement.requiredCount; i++) {
    if (i < requirement.satisfiedBy.length) {
      const course = requirement.satisfiedBy[i];
      slots.push(
        <div key={`filled-${i}`} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium">{course.subject} {course.courseNumber}</span>
          <span className="text-xs text-muted-foreground ml-auto">{course.credits} cr</span>
        </div>
      );
    } else {
      slots.push(
        <div key={`empty-${i}`} className="flex items-center gap-2 p-2 bg-muted/50 rounded border border-dashed">
          <Circle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Empty Slot</span>
        </div>
      );
    }
  }

  // If there are more courses than required (e.g. catch-all), show them too
  for (let i = requirement.requiredCount; i < requirement.satisfiedBy.length; i++) {
      const course = requirement.satisfiedBy[i];
      slots.push(
        <div key={`extra-${i}`} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium">{course.subject} {course.courseNumber}</span>
          <span className="text-xs text-muted-foreground ml-auto">{course.credits} cr</span>
        </div>
      );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-semibold">{requirement.name}</CardTitle>
          {isSatisfied && <Badge variant="default" className="bg-green-600 hover:bg-green-700">Complete</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {slots}
      </CardContent>
    </Card>
  );
}
