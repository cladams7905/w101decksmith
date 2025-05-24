import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { Spell } from "@/lib/types";
import { useState, useRef, useEffect } from "react";

interface SpellQuantityPopupProps {
  spell: Spell;
  triggerRef: React.RefObject<HTMLElement>;
  onClose: () => void;
  onAddSpell: (spell: Spell, quantity: number) => void;
  availableSlots: number;
}

export function SpellQuantityPopup({
  spell,
  triggerRef,
  onClose,
  onAddSpell,
  availableSlots
}: SpellQuantityPopupProps) {
  const [quantity, setQuantity] = useState(1);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const popupRef = useRef<HTMLDivElement>(null);
  const maxQuantity = Math.min(4, availableSlots);

  // Update position when trigger element moves
  useEffect(() => {
    const updatePosition = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.top,
          left: rect.right + 10
        });
      }
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [triggerRef]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, triggerRef]);

  const handleAdd = () => {
    onAddSpell(spell, quantity);
    onClose();
  };

  return (
    <div
      ref={popupRef}
      className="fixed z-50 gradient border rounded-md shadow-xl p-4 w-64"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateY(-50%)"
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">{spell.name}</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="spell-quantity">Quantity</Label>
            <span className="text-sm font-medium">{quantity}</span>
          </div>
          <Slider
            id="spell-quantity"
            min={1}
            max={maxQuantity}
            step={1}
            value={[quantity]}
            onValueChange={(value) => setQuantity(value[0])}
            className="w-full"
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {availableSlots} slots available
          </div>
          <Button onClick={handleAdd} disabled={quantity > availableSlots}>
            Add to Deck
          </Button>
        </div>
      </div>
    </div>
  );
}
