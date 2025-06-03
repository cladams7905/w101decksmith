import SwirlBackground from "@/components/ui/swirl-background";
import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <SwirlBackground />
      <h1 className="text-white text-4xl font-bold">Loading...</h1>
    </div>
  );
}
