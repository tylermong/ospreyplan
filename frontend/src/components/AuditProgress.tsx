import { Progress } from "@/components/ui/progress";

interface AuditProgressProps {
  totalCredits: number;
}

export function AuditProgress({ totalCredits }: AuditProgressProps) {
  const percentage = Math.min(100, (totalCredits / 128) * 100);
  
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        <span>Degree Progress</span>
        <span>{totalCredits} / 128 Credits</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
