import { cn } from "@/lib/utils";

type AddBoxProps = {
  label: string;
  onClick: () => void;
  className?: string;
};

export default function AddBox({ label, onClick, className }: Readonly<AddBoxProps>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        // Layout
        "w-full",
        "flex flex-col items-center justify-center",
        // Appearance
        "border-2 border-dashed rounded-xl",
        "text-muted-foreground",
        // Interactive states
        "hover:border-foreground/60 transition-colors",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none",
        "cursor-pointer",
        className
      )}
    >
      <span className="text-3xl leading-none">+</span>
      <span className="mt-1 text-sm">{label}</span>
    </button>
  );
}
