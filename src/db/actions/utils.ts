"use server";

import { headers } from "next/headers";

export async function getURL(): Promise<string> {
  const headersList = await headers();
  const url = headersList.get("x-url");

  if (!url) {
    throw new Error("URL not found");
  }

  return url;
}
