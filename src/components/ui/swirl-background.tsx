"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

// Type declarations for the global objects added by our scripts
declare global {
  interface Window {
    SwirlAnimation?: new (canvas: HTMLCanvasElement) => {
      updateConfig: (config: Record<string, unknown>) => void;
      start: () => void;
      destroy: () => void;
    };
    noise?: {
      perlin3: (x: number, y: number, z: number) => number;
      perlin2: (x: number, y: number) => number;
      seed: (seed: number) => void;
    };
    MathUtils?: Record<string, unknown>;
    Vector2D?: Record<string, unknown>;
    CanvasUtils?: Record<string, unknown>;
    ColorUtils?: Record<string, unknown>;
    requestAnimFrame?: (callback: FrameRequestCallback) => number;
    SimplexNoise?: new () => {
      noise3D: (x: number, y: number, z: number) => number;
    };
    // Functions from util.js
    rand?: (max: number) => number;
    randRange?: (range: number) => number;
    fadeInOut?: (t: number, m: number) => number;
    lerp?: (a: number, b: number, amt: number) => number;
    cos?: (angle: number) => number;
    sin?: (angle: number) => number;
    TAU?: number;
    // Setup function from swirl.js
    setup?: () => void;
  }
}

interface SwirlBackgroundProps {
  className?: string;
}

export function SwirlBackground({ className = "" }: SwirlBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState(0);

  // Initialize animation when all scripts are loaded and component is mounted
  useEffect(() => {
    if (isMounted && scriptsLoaded === 3 && containerRef.current) {
      // Wait a bit for all scripts to be fully executed
      const timeoutId = setTimeout(() => {
        // Check if the setup function exists (from swirl.js)
        if (typeof window !== "undefined") {
          // Manually trigger the setup since window load may have already fired
          try {
            // Call the setup function directly if it exists globally
            if (typeof window.setup === "function") {
              window.setup();
            } else {
              // If setup function doesn't exist globally, try to create our own initialization
              initializeSwirlAnimation();
            }
          } catch (error) {
            console.warn("Failed to initialize swirl animation:", error);
          }
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isMounted, scriptsLoaded]);

  const initializeSwirlAnimation = () => {
    // Fallback initialization if the global setup function isn't available
    if (typeof window !== "undefined" && containerRef.current) {
      // Re-run the setup logic from swirl.js
      const event = new Event("load");
      window.dispatchEvent(event);
    }
  };

  useEffect(() => {
    // Only render on the client to prevent hydration mismatch
    setIsMounted(true);

    return () => {
      // Cleanup if needed
    };
  }, []);

  const handleScriptLoad = () => {
    setScriptsLoaded((prev) => prev + 1);
  };

  // Don't render anything on the server to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className={`fixed inset-0 -z-10 ${className}`}>
        <div
          className="content content--canvas w-full h-full"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: -1,
            backgroundColor: "hsl(229.6, 69.7%, 6.5%)" // Match the swirl background color
          }}
        />
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      {/* Load required scripts in order */}
      <Script
        src="/js/noise.min.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
      <Script
        src="/js/util.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
      <Script
        src="/js/swirl.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />

      {/* Container that the original swirl.js expects */}
      <div
        ref={containerRef}
        className="content content--canvas w-full h-full"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1
        }}
      >
        {/* Original script will inject canvas here */}
      </div>
    </div>
  );
}

// Default export for convenience
export default SwirlBackground;
