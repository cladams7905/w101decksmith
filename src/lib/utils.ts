import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the url of the app based on the environment.
 * @returns The url of the app.
 */
export function getUrl() {
  const dev = process.env.NODE_ENV !== "production";
  const port = process.env.PORT || 3000;
  return dev
    ? `http://localhost:${port}`
    : "https://your-production-domain.com"; //TODO: change to production url
}
