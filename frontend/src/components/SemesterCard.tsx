"use client";

import { Semester } from "@/types/planner.types";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Pencil, ChevronDown, X } from "lucide-react";
import { AddCourseDialog } from "./AddCourseDialog";
import { CourseItem } from "./CourseItem";

interface SemesterCardProps {
  semester: Semester;
  isEditing: boolean;
  draftTerm: string;
  draftYear: number;
  terms: string[];
  years: number[];
  hoveredCourseId: string | number | null;
  hoverSets: {
    prereq: Set<string>;
    postreq: Set<string>;
  };
  onStartRenaming: () => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onSetDraftTerm: (term: string) => void;
  onSetDraftYear: (year: number) => void;
  onDelete: () => void;
  onAddCourse: (
    subject: string,
    courseNumber: number,
    section: string,
    credits: number,
    prerequisiteRaw: string | null | undefined
  ) => void;
  onRemoveCourse: (courseId: number | string) => void;
  onSetHoveredCourseId: (id: string | number | null) => void;
  extractCanonical: (name: string) => string;
}

export function SemesterCard({
  semester,
  isEditing,
  draftTerm,
  draftYear,
  terms,
  years,
  hoveredCourseId,
  hoverSets,
  onStartRenaming,
  onCommitRename,
  onCancelRename,
  onSetDraftTerm,
  onSetDraftYear,
  onDelete,
  onAddCourse,
  onRemoveCourse,
  onSetHoveredCourseId,
  extractCanonical,
}: SemesterCardProps) {
  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle>
          {isEditing ? (
            <div className="flex w-full items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-md px-2 py-1 text-sm flex items-center gap-2"
                  >
                    <span>{draftTerm}</span>
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" className="w-40">
                  {terms.map((t) => (
                    <DropdownMenuItem key={t} onSelect={() => onSetDraftTerm(t)}>
                      {t}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-md px-2 py-1 text-sm flex items-center gap-2"
                  >
                    <span>{draftYear}</span>
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="bottom"
                  className="w-36 max-h-56 overflow-auto"
                >
                  {years.map((y) => (
                    <DropdownMenuItem key={y} onSelect={() => onSetDraftYear(y)}>
                      {y}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            semester.title
          )}
        </CardTitle>
        <CardAction className="row-span-1 self-center flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={onCommitRename}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancelRename}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={onStartRenaming}
                aria-label="Rename semester"
                title="Rename"
              >
                <Pencil />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={onDelete}
                title="Delete semester"
                aria-label="Delete semester"
              >
                <X size={16} />
              </Button>
            </div>
          )}
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          {semester.courses.map((course) => {
            const canonical = extractCanonical(course.name);
            const isHovered = hoveredCourseId === course.id;
            const isPrereqOfHover = hoverSets.postreq.has(course.id.toString());
            const prereqSet = hoverSets.prereq;
            const isPrereq = prereqSet.has(canonical);

            return (
              <CourseItem
                key={course.id}
                course={course}
                isHovered={isHovered}
                isPrereq={isPrereq}
                isPrereqOfHover={isPrereqOfHover}
                onMouseEnter={() => onSetHoveredCourseId(course.id)}
                onMouseLeave={() => onSetHoveredCourseId(null)}
                onRemove={() => onRemoveCourse(course.id)}
              />
            );
          })}
        </div>

        <AddCourseDialog
          onAddCourse={(
            subject: string,
            courseNumber: number,
            section: string,
            credits: number,
            prerequisiteRaw: string | null | undefined
          ) => {
            onAddCourse(subject, courseNumber, section, credits, prerequisiteRaw);
          }}
        />
      </CardContent>
    </Card>
  );
}
