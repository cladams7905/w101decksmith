"use client";

import { useState, useEffect } from "react";
import { Progress } from "./progress";

interface LoadingProgressProps {
  text?: string;
  className?: string;
}

export function LoadingProgress({
  text = "Loading...",
  className = ""
}: LoadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        // Smooth progression that slows down as it approaches 100
        if (prev < 60) {
          return prev + Math.random() * 15 + 5; // Fast initial progress
        } else if (prev < 80) {
          return prev + Math.random() * 8 + 2; // Medium progress
        } else if (prev < 95) {
          return prev + Math.random() * 3 + 1; // Slow progress
        } else {
          return Math.min(98, prev + Math.random() * 1); // Very slow final progress
        }
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-4 p-8 ${className}`}
    >
      <div className="w-full max-w-xs space-y-2">
        <div className="text-sm text-muted-foreground text-center">{text}</div>
        <Progress value={progress} className="h-3" />
        <div className="text-xs text-muted-foreground text-center">
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
}
