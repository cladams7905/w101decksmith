import { supabase } from "../src/lib/db/supabase";

const SCHOOL_PATHS = [
  "Fire",
  "Ice",
  "Storm",
  "Life",
  "Myth",
  "Death",
  "Balance",
  "Sun",
  "Moon",
  "Star",
  "Shadow"
];

async function syncSpells() {
  console.log("Starting spell sync...");

  for (const school of SCHOOL_PATHS) {
    console.log(`\nProcessing ${school} school spells...`);

    try {
      // Call the web-scrape endpoint
      const response = await fetch(
        `http://localhost:3000/api/web-scrape/spells?school=${school}`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch ${school} spells: ${response.statusText}`
        );
      }

      const data = await response.json();
      const spells = data.spells;

      console.log(`Found ${spells.length} ${school} spells`);

      // Insert or update spells in Supabase
      for (const spell of spells) {
        try {
          const { error } = await supabase.from("spells").upsert(
            {
              name: spell.name,
              tier: spell.tier || "1", // Ensure tier is always set, default to "1"
              card_type: spell.card_type,
              school: spell.school,
              card_effects: spell.card_effects,
              accuracy: spell.accuracy,
              description: spell.description,
              description_image_alts: spell.description_image_alts,
              card_image_url: spell.card_image_url,
              pip_cost: spell.pip_cost,
              pvp_level: spell.pvp_level,
              pvp_status: spell.pvp_status,
              wiki_url: spell.wiki_url,
              last_updated: new Date().toISOString()
            },
            {
              onConflict: "name,tier", // Use composite key for conflict resolution
              ignoreDuplicates: false
            }
          );

          if (error) {
            console.error(
              `Error upserting spell ${spell.name} (Tier ${spell.tier}):`,
              error
            );
          } else {
            console.log(
              `Successfully synced: ${spell.name} (Tier ${spell.tier})`
            );
          }
        } catch (error) {
          console.error(`Error processing spell ${spell.name}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error processing ${school} school:`, error);
    }
  }

  console.log("\nSpell sync complete!");
}

// Execute the sync if this script is run directly
if (require.main === module) {
  syncSpells().catch(console.error);
}

export { syncSpells };
