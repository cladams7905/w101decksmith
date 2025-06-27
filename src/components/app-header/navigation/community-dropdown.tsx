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
      className={`hidden md:flex ${
        isActive ? "bg-secondary hover:bg-secondary/60" : ""
      }`}
    >
      Community
    </Button>
  );
}
