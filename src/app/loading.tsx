import SwirlBackground from "@/components/ui/swirl-background";
import { LoadingProgress } from "@/components/ui/loading-progress";
import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen relative">
      {/* Animated Canvas Background */}
      <SwirlBackground />

      {/* Loading Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-white text-4xl font-bold mb-8">Loading...</h1>
        <LoadingProgress className="w-full max-w-md" />
      </div>
    </div>
  );
}
