"use client";

import { useEffect, useState, useRef } from "react";
import { DegreeAuditResponse, DegreeAuditResult } from "@/types/audit.types";
import { AuditProgress } from "./AuditProgress";
import { AuditRequirementCard } from "./AuditRequirementCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DegreeAuditProps {
  userId: string;
  refreshTrigger?: number;
  totalCredits: number;
}

export function DegreeAudit({ userId, refreshTrigger, totalCredits }: DegreeAuditProps) {
  const [data, setData] = useState<DegreeAuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const loadedUserId = useRef<string | null>(null);

  useEffect(() => {
    const fetchAudit = async () => {
      const isFirstLoad = loadedUserId.current !== userId;

      if (isFirstLoad) {
        setLoading(true);
      } else {
        setIsUpdating(true);
      }

      try {
        const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
        const res = await fetch(`${apiBase}/api/audit/${userId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const body = await res.json();
          setData(body);
          loadedUserId.current = userId;
        } else {
          console.error("Audit fetch failed", res.status, res.statusText);
          if (res.status === 401) {
             console.warn("User unauthorized for audit. Token might be expired.");
          }
        }
      } catch (error) {
        console.error("Failed to fetch audit", error);
      } finally {
        setLoading(false);
        setIsUpdating(false);
      }
    };

    if (userId) {
      fetchAudit();
    }
  }, [userId, refreshTrigger]);

  if (loading) {
    return <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
        </div>
    </div>;
  }

  if (!data || !data.results) return null;

  const results = data.results;
  const degreeName = data.degreeCode 
    ? (data.degreeCode === 'bs-computer-science' ? 'B.S. in Computer Science' : 
       data.degreeCode === 'bs-computer-information-systems' ? 'B.S. in Computer Information Systems' : 
       data.degreeCode)
    : 'No Degree Selected';

  // Group by category
  const groupedResults: Record<string, DegreeAuditResult[]> = {};
  
  results.forEach(r => {
      const cat = r.category;
      if (!groupedResults[cat]) groupedResults[cat] = [];
      groupedResults[cat].push(r);
  });

  return (
    <div className={`space-y-6 transition-opacity duration-200 ${isUpdating ? 'opacity-70' : 'opacity-100'}`}>
      <div className="flex justify-between items-end">
          <h3 className="text-lg font-medium text-muted-foreground">
            Audit for:{" "}
            {degreeName === "No Degree Selected" ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-foreground font-semibold decoration-dotted underline decoration-muted-foreground/50 hover:decoration-foreground cursor-help underline-offset-4">
                    {degreeName}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select a degree in settings</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <span className="text-foreground font-semibold">{degreeName}</span>
            )}
            {isUpdating && <span className="ml-2 text-xs animate-pulse">Updating...</span>}
          </h3>
      </div>
      <AuditProgress totalCredits={totalCredits} />
      
      {Object.entries(groupedResults).map(([category, items]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-lg font-semibold tracking-tight">{category}</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((req, idx) => (
              <AuditRequirementCard key={idx} requirement={req} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
