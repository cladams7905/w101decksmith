import { supabaseAdmin } from "../src/db/supabase/server";
import fetch from "node-fetch";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
const PAGE_SIZE = 1000; // Supabase's maximum page size

type School =
  | "fire"
  | "ice"
  | "storm"
  | "life"
  | "myth"
  | "death"
  | "balance"
  | "shadow"
  | "astral";

interface SpellRecord {
  name: string;
  tier: string;
  card_image_url: string;
  school: School | null;
}

interface DatabaseSpell {
  name: string;
  tier: string;
  card_image_url: string | null;
  school: string | null;
}

async function downloadImage(url: string, retryCount = 0): Promise<Buffer> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 429 || response.status === 503) {
        if (retryCount < MAX_RETRIES) {
          console.log(
            `Rate limited or service unavailable, waiting ${RETRY_DELAY}ms before retry...`
          );
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          return downloadImage(url, retryCount + 1);
        }
      }
      throw new Error(
        `Failed to download image from ${url}: ${response.status} ${response.statusText}`
      );
    }
    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(
        `Error downloading image, attempt ${
          retryCount + 1
        }/${MAX_RETRIES}. Retrying...`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return downloadImage(url, retryCount + 1);
    }
    throw error;
  }
}

async function getAllSpells(): Promise<SpellRecord[]> {
  let allSpells: SpellRecord[] = [];
  let currentOffset = 0;
  let hasMore = true;

  const { count, error: countError } = await supabaseAdmin
    .from("spells")
    .select("*", { count: "exact", head: true })
    .not("card_image_url", "is", null);

  if (countError) {
    throw countError;
  }

  const totalSpells = count || 0;
  console.log(`Total spells to fetch: ${totalSpells}`);

  while (hasMore) {
    const { data: spells, error } = await supabaseAdmin
      .from("spells")
      .select("name, tier, card_image_url, school")
      .not("card_image_url", "is", null)
      .order("school", { ascending: true })
      .range(currentOffset, currentOffset + PAGE_SIZE - 1);

    if (error) {
      throw error;
    }

    if (!spells || spells.length === 0) {
      hasMore = false;
    } else {
      // Filter out spells with null card_image_url and convert to SpellRecord
      const validSpells = (spells as DatabaseSpell[])
        .filter(
          (spell): spell is DatabaseSpell & { card_image_url: string } =>
            typeof spell.card_image_url === "string" &&
            spell.card_image_url !== null
        )
        .map((spell) => ({
          name: spell.name,
          tier: spell.tier,
          card_image_url: spell.card_image_url,
          school: spell.school as School | null
        }));

      allSpells = [...allSpells, ...validSpells];
      currentOffset += spells.length;
      console.log(
        `Fetched ${validSpells.length} valid spells (total: ${allSpells.length}/${totalSpells})`
      );

      if (spells.length < PAGE_SIZE) {
        hasMore = false;
      }
    }
  }

  return allSpells;
}

async function syncCardImages() {
  console.log("Starting card image sync...");
  let processedCount = 0;
  let errorCount = 0;
  let skipCount = 0;

  try {
    const spells = await getAllSpells();

    if (spells.length === 0) {
      console.log("No spells with card images found");
      return;
    }

    console.log(
      `Found ${spells.length} total spells with card images to process`
    );
    let currentSchool = "";

    for (const spell of spells) {
      try {
        if (spell.school !== currentSchool) {
          currentSchool = spell.school || "";
          console.log(`\n=== Processing ${currentSchool} School Spells ===\n`);
        }

        const storagePath = `spells/Spell::${spell.name}::${spell.tier}.png`;

        console.log(
          `[${++processedCount}/${spells.length}] Processing ${
            spell.name
          } (Tier ${spell.tier})...`
        );

        const { data: existingFile } = await supabaseAdmin.storage
          .from("card-images")
          .list(`spells`, {
            search: `Spell::${spell.name}::${spell.tier}.png`
          });

        if (existingFile && existingFile.length > 0) {
          console.log(
            `Image already exists for ${spell.name} (Tier ${spell.tier}), skipping...`
          );
          skipCount++;
          continue;
        }

        console.log(`Downloading image from ${spell.card_image_url}...`);
        const imageBuffer = await downloadImage(spell.card_image_url);

        const { error: uploadError } = await supabaseAdmin.storage
          .from("card-images")
          .upload(storagePath, imageBuffer, {
            contentType: "image/png",
            cacheControl: "3600",
            upsert: true
          });

        if (uploadError) {
          throw uploadError;
        }

        console.log(`Successfully uploaded ${storagePath}`);

        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));
      } catch (error) {
        errorCount++;
        console.error(
          `Error processing ${spell.name} (Tier ${spell.tier}):`,
          error
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }
    }

    console.log("\nCard image sync complete!");
    console.log(`Total processed: ${processedCount}`);
    console.log(
      `Successfully synced: ${processedCount - errorCount - skipCount}`
    );
    console.log(`Skipped (already exists): ${skipCount}`);
    console.log(`Errors: ${errorCount}`);
  } catch (error) {
    console.error("Fatal error in card image sync:", error);
  }
}

if (require.main === module) {
  syncCardImages().catch(console.error);
}

export { syncCardImages };
