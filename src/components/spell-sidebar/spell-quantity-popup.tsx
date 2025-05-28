import { X, GripHorizontal } from "lucide-react";
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
  const popupRef = useRef<HTMLDivElement>(null);
  const maxQuantity = Math.min(4, availableSlots);

  // Drag functionality state
  const [currentPosition, setCurrentPosition] = useState({ top: 0, left: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasBeenDragged, setHasBeenDragged] = useState(false);

  // Update position when trigger element moves, but only if it hasn't been dragged yet
  useEffect(() => {
    const updatePosition = () => {
      if (triggerRef.current && !hasBeenDragged) {
        const rect = triggerRef.current.getBoundingClientRect();
        const newPosition = {
          top: rect.top,
          left: rect.right + 10
        };
        setCurrentPosition(newPosition);
      }
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [triggerRef, hasBeenDragged]);

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
      setHasBeenDragged(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPosition = {
          left: e.clientX - dragOffset.x,
          top: e.clientY - dragOffset.y
        };

        // Keep popup within viewport bounds
        const popup = popupRef.current;
        if (popup) {
          const rect = popup.getBoundingClientRect();
          const maxLeft = window.innerWidth - rect.width;
          const maxTop = window.innerHeight - rect.height;

          newPosition.left = Math.max(0, Math.min(maxLeft, newPosition.left));
          newPosition.top = Math.max(0, Math.min(maxTop, newPosition.top));
        }

        setCurrentPosition(newPosition);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, dragOffset]);

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
      className="fixed z-50 bg-background border rounded-md shadow-xl w-64"
      style={{
        top: `${currentPosition.top}px`,
        left: `${currentPosition.left}px`,
        transform: hasBeenDragged ? "none" : "translateY(-50%)"
      }}
    >
      {/* Draggable Header */}
      <div
        className="flex justify-between items-center p-4 pb-3 cursor-grab active:cursor-grabbing border-b border-border/50"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">{spell.name}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 pt-3 space-y-4">
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
