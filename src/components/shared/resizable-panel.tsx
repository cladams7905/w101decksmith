"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ResizablePanelProps {
  children: React.ReactNode
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  side: "left" | "right"
  className?: string
  onWidthChange?: (width: number) => void
}

export function ResizablePanel({
  children,
  defaultWidth = 320,
  minWidth = 240,
  maxWidth = 600,
  side,
  className,
  onWidthChange,
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isDragging, setIsDragging] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const dragHandleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !panelRef.current) return

      let newWidth: number
      if (side === "left") {
        newWidth = e.clientX
      } else {
        newWidth = window.innerWidth - e.clientX
      }

      // Constrain width between min and max
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))

      setWidth(newWidth)
      if (onWidthChange) onWidthChange(newWidth)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = side === "left" ? "e-resize" : "w-resize"
      document.body.style.userSelect = "none"
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, minWidth, maxWidth, side, onWidthChange])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  return (
    <div ref={panelRef} className={cn("relative flex h-full", className)} style={{ width: `${width}px` }}>
      {children}
      <div
        ref={dragHandleRef}
        className={cn(
          "absolute top-0 bottom-0 w-1 cursor-col-resize hover:bg-purple-500/50 transition-colors z-50",
          side === "left" ? "right-0" : "left-0",
        )}
        onMouseDown={handleMouseDown}
      />
    </div>
  )
}
