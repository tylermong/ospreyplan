"use client";

import { Course } from "@/types/planner.types";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { X } from "lucide-react";

interface CourseItemProps {
  course: Course;
  isHovered: boolean;
  isPrereq: boolean;
  isPrereqOfHover: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onRemove: () => void;
}

export function CourseItem({
  course,
  isHovered,
  isPrereq,
  isPrereqOfHover,
  onMouseEnter,
  onMouseLeave,
  onRemove,
}: CourseItemProps) {
  const unmet = course.unmetPrereqs && course.unmetPrereqs.length > 0;
  const classes = [
    "rounded-md border px-3 py-2 text-sm flex items-center justify-between transition-colors",
  ];
  if (unmet) classes.push("border-red-500 bg-red-50 dark:bg-red-950/30");
  if (isHovered) classes.push("ring-2 ring-ring border-ring");
  else if (isPrereq)
    classes.push("bg-amber-50 dark:bg-amber-900/30 border-amber-400");
  else if (isPrereqOfHover)
    classes.push("bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400");

  const content = (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={classes.join(" ")}
    >
      <span className="flex-1">{course.name}</span>
      <Button
        size="icon"
        variant="ghost"
        onClick={onRemove}
        className="h-6 w-6 text-muted-foreground hover:text-destructive cursor-pointer"
        aria-label="Remove course"
        title="Remove course"
      >
        <X size={14} />
      </Button>
    </div>
  );

  if (!unmet) {
    return <div key={course.id}>{content}</div>;
  }

  return (
    <HoverCard key={course.id} openDelay={50} closeDelay={50}>
      <HoverCardTrigger asChild>{content}</HoverCardTrigger>
      <HoverCardContent>
        <div className="space-y-2">
          <p className="font-semibold text-sm">Missing prerequisites</p>
          <ul className="list-disc pl-4 text-xs space-y-1">
            {course.unmetPrereqs?.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
