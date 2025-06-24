import { Button } from "@/components/ui/button";

interface CommunityDropdownProps {
  isActive?: boolean;
}

export function CommunityDropdown({
  isActive = false
}: CommunityDropdownProps) {
  return (
    <Button
      variant="ghost"
      className={`hidden md:flex relative ${
        isActive
          ? "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-0.5 after:bg-primary"
          : ""
      }`}
    >
      Community
    </Button>
  );
}
