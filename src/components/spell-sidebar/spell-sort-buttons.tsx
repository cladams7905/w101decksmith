import { Button } from "@/components/ui/button";

interface SpellSortButtonsProps {
  schoolId: string;
  sortOptions:
    | {
        by: "pips" | "utility" | "none";
        order: "asc" | "desc";
      }
    | undefined;
  onSort: (schoolId: string, by: "pips" | "utility" | "none") => void;
}

export function SpellSortButtons({
  schoolId,
  sortOptions,
  onSort
}: SpellSortButtonsProps) {
  return (
    <div className="flex gap-2 py-2 bg-background z-10">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSort(schoolId, "pips")}
        className={sortOptions?.by === "pips" ? "bg-accent" : ""}
      >
        Sort by Pips{" "}
        {sortOptions?.by === "pips" &&
          (sortOptions.order === "asc" ? "↑" : "↓")}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSort(schoolId, "utility")}
        className={sortOptions?.by === "utility" ? "bg-accent" : ""}
      >
        Sort by Type{" "}
        {sortOptions?.by === "utility" &&
          (sortOptions.order === "asc" ? "↑" : "↓")}
      </Button>
    </div>
  );
}
