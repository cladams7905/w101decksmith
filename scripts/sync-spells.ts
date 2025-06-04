import { supabaseAdmin } from "../src/db/supabase/server";
import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";
import type { SpellInsert } from "@/db/database.types";

const WIKI_BASE_URL = "https://wiki.wizard101central.com";

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

const SCHOOL_SPELL_PATHS = [
  "/wiki/Spell:Fire_School_Spells",
  "/wiki/Spell:Ice_School_Spells",
  "/wiki/Spell:Storm_School_Spells",
  "/wiki/Spell:Life_School_Spells",
  "/wiki/Spell:Myth_School_Spells",
  "/wiki/Spell:Death_School_Spells",
  "/wiki/Spell:Balance_School_Spells",
  "/wiki/Spell:Sun_School_Spells",
  "/wiki/Spell:Moon_School_Spells",
  "/wiki/Spell:Star_School_Spells",
  "/wiki/Spell:Shadow_School_Spells"
];

type CardType = "spell" | "treasure_card" | "item_card";
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
type CardEffect =
  | "damage"
  | "manipulation"
  | "steal"
  | "global"
  | "charm"
  | "ward"
  | "heal"
  | "aoe"
  | "aura"
  | "enchantment"
  | "shadow";
type PvpStatus = "no_pvp" | "no_pve" | "level_restricted" | "unrestricted";

interface SpellInfo {
  name: string;
  card_type: CardType;
  school?: School;
  card_effects?: CardEffect[];
  accuracy?: number;
  description?: string;
  description_image_alts?: string[];
  card_image_url?: string;
  pip_cost?: string;
  pvp_level?: number;
  pvp_status?: PvpStatus;
  wiki_url: string;
  category?: string;
  tier?: string;
}

function normalizeSchool(school: string): School | undefined {
  const schoolMap: { [key: string]: School } = {
    fire: "fire",
    ice: "ice",
    storm: "storm",
    life: "life",
    myth: "myth",
    death: "death",
    balance: "balance",
    shadow: "shadow",
    sun: "astral",
    moon: "astral",
    star: "astral"
  };
  return schoolMap[school.toLowerCase()];
}

function normalizeCardEffects(effects: string[]): CardEffect[] {
  const effectMap: { [key: string]: CardEffect } = {
    damage: "damage",
    manipulation: "manipulation",
    steal: "steal",
    global: "global",
    charm: "charm",
    ward: "ward",
    healing: "heal",
    heal: "heal",
    aoe: "aoe",
    aura: "aura",
    enchantment: "enchantment",
    shadow: "shadow"
  };

  return effects
    .map((effect) => effectMap[effect.toLowerCase()])
    .filter((effect): effect is CardEffect => effect !== undefined);
}

function cleanSpellName(name: string): string {
  const cleanedName = name
    .replace(/^(?:Spell:|TreasureCard:|ItemCard:)/i, "")
    .trim();
  return cleanedName;
}

function determineSpellType(name: string): CardType {
  if (name.toLowerCase().startsWith("treasurecard:")) return "treasure_card";
  if (name.toLowerCase().startsWith("itemcard:")) return "item_card";
  return "spell";
}

function extractNameAndTier(rawName: string): { name: string; tier: string } {
  const name = cleanSpellName(rawName);
  const tierMatch = name.match(/\(Tier (\d+)\)$/);
  const tier = tierMatch ? tierMatch[1] : "1";
  const cleanName = name.replace(/\(Tier \d+\)$/, "").trim();
  return { name: cleanName, tier };
}

function cleanAccuracy(text: string): number | undefined {
  const match = text.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

function cleanPipCost(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function extractPvpInfo($: CheerioAPI): { status?: PvpStatus; level?: number } {
  const pvpInfo: { status?: PvpStatus; level?: number } = {};

  const paragraphs = $(".mw-parser-output > p");
  let pvpText = "";
  paragraphs.each((_, el) => {
    const text = $(el).text().toLowerCase();
    if (text.includes("pvp")) {
      pvpText = text;
      return false;
    }
  });

  if (pvpText) {
    if (pvpText.includes("banned")) {
      pvpInfo.status = "no_pvp";
    } else if (pvpText.includes("restricted")) {
      pvpInfo.status = "level_restricted";
    } else if (pvpText.includes("pve")) {
      pvpInfo.status = "no_pve";
    } else {
      pvpInfo.status = "unrestricted";
    }

    const levelMatch = pvpText.match(/level (\d+)/);
    if (levelMatch) {
      pvpInfo.level = parseInt(levelMatch[1], 10);
    }
  }

  return pvpInfo;
}

function processSpellTypes(typeAlts: string[]): string[] {
  return typeAlts
    .map((alt) =>
      alt
        .replace(/ Spell$/, "")
        .replace(/All Enemies$/, "aoe")
        .toLowerCase()
    )
    .filter((value, index, self) => self.indexOf(value) === index);
}

async function getSpellwrightingTierLinks($: CheerioAPI): Promise<string[]> {
  const tierLinks: string[] = [];

  const tierSection = $(".data-table-heading").filter((_, el) =>
    $(el).text().trim().startsWith("Spellwrighting Tiers")
  );

  if (tierSection.length) {
    const tierContainer = tierSection.next();

    tierContainer.find("a").each((_, link) => {
      const href = $(link).attr("href");
      if (href && href.includes("/wiki/Spell:")) {
        const fullUrl = href.startsWith("http")
          ? href
          : `${WIKI_BASE_URL}${href}`;
        if (!tierLinks.includes(fullUrl)) {
          tierLinks.push(fullUrl);
        }
      }
    });
  }

  return tierLinks;
}

async function getSpellDetailsFromPage(
  url: string,
  category: string
): Promise<SpellInfo | null> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    console.log(`Processing page content for ${url}`);

    const rawName = $(".firstHeading").text().trim();
    if (!rawName) {
      console.log(`No spell name found at ${url}`);
      return null;
    }

    const cardType = determineSpellType(rawName);
    const { name, tier } = extractNameAndTier(rawName);

    const infoBox = $(".infobox");
    if (!infoBox.length) {
      console.log(`No infobox found for spell at ${url}`);
    }

    const spellInfo: SpellInfo = {
      name,
      card_type: cardType,
      wiki_url: url,
      category,
      tier
    };

    // Extract school
    const schoolRow = infoBox.find("tr").filter((_, el) => {
      const firstCell = $(el).find("td:first-child");
      return firstCell.find("b").text().trim() === "School";
    });
    if (schoolRow.length) {
      const schoolImage = schoolRow.find("img");
      if (schoolImage.length) {
        const schoolAlt = schoolImage.attr("alt");
        if (schoolAlt) {
          const normalizedSchool = normalizeSchool(
            schoolAlt.replace(" School", "").trim()
          );
          if (normalizedSchool) {
            spellInfo.school = normalizedSchool;
          }
        }
      }
    }

    // Extract card effects
    const typeRow = infoBox.find("tr").filter((_, el) => {
      const firstCell = $(el).find("td:first-child");
      return firstCell.find("b").text().trim() === "Type";
    });
    if (typeRow.length) {
      const typeImages = typeRow.find("img");
      if (typeImages.length) {
        const typeAlts = typeImages
          .map((_, img) => $(img).attr("alt"))
          .get()
          .filter((alt): alt is string => alt !== undefined);

        if (typeAlts.length) {
          const rawEffects = processSpellTypes(typeAlts);
          spellInfo.card_effects = normalizeCardEffects(rawEffects);
        }
      }
    }

    // Extract accuracy
    const accuracyRow = infoBox.find("tr").filter((_, el) => {
      const firstCell = $(el).find("td:first-child");
      return firstCell.find("b").text().trim() === "Accuracy";
    });
    if (accuracyRow.length) {
      const accuracyText = accuracyRow.find("td:last-child").text().trim();
      if (accuracyText) {
        spellInfo.accuracy = cleanAccuracy(accuracyText);
      }
    }

    // Extract pip cost
    const pipRow = infoBox.find("tr").filter((_, el) => {
      const firstCell = $(el).find("td:first-child");
      return firstCell.find("b").text().trim() === "Pip Cost";
    });
    if (pipRow.length) {
      const pipText = pipRow.find("td:last-child").text().trim();
      if (pipText) {
        spellInfo.pip_cost = cleanPipCost(pipText);
      }
    }

    // Extract description
    const descriptionRow = infoBox
      .find("tr")
      .filter((_, el) => {
        const firstCell = $(el).find("td:first-child");
        return firstCell.find("b").text().trim() === "Spell Description";
      })
      .next("tr");

    if (descriptionRow.length) {
      const description = descriptionRow.find("td").text().trim();
      if (description) {
        spellInfo.description = description;
      }
    }

    // Try first paragraph if no description in infobox
    if (!spellInfo.description) {
      const contentParagraphs = $(".mw-parser-output > p");
      contentParagraphs.each((_, el) => {
        const text = $(el).text().trim();
        if (text && !spellInfo.description) {
          spellInfo.description = text;
          return false;
        }
      });
    }

    // Extract spell card image URL
    const spellImage = infoBox.find("img").first();
    if (spellImage.length) {
      const imgSrc = spellImage.attr("src");
      if (imgSrc) {
        spellInfo.card_image_url = imgSrc.startsWith("http")
          ? imgSrc
          : `${WIKI_BASE_URL}${imgSrc}`;
      }
    }

    // Extract description image alt texts
    const descriptionImages = $(".mw-parser-output > p").first().find("img");
    if (descriptionImages.length > 0) {
      const altTexts = descriptionImages
        .map((_, img) => $(img).attr("alt"))
        .get()
        .filter((alt): alt is string => alt !== undefined);

      if (altTexts.length > 0) {
        spellInfo.description_image_alts = altTexts;
      }
    }

    // Extract PvP information
    const pvpInfo = extractPvpInfo($);
    spellInfo.pvp_status = pvpInfo.status;
    if (pvpInfo.level !== undefined) {
      spellInfo.pvp_level = pvpInfo.level;
    }

    console.log(
      `Successfully processed spell: ${name} (Tier ${tier})`,
      spellInfo
    );
    return spellInfo;
  } catch (error) {
    console.error(`Error processing spell at ${url}:`, error);
    return null;
  }
}

async function getSpellLinksFromSchoolPage(url: string): Promise<string[]> {
  const links: string[] = [];
  let currentUrl = url;

  while (currentUrl) {
    try {
      console.log(`Fetching page: ${currentUrl}`);
      const response = await fetch(currentUrl);
      const html = await response.text();

      const $ = cheerio.load(html);

      // Find all spell links
      $("a").each((_, el) => {
        const href = $(el).attr("href");
        if (href) {
          const fullUrl = href.startsWith("http")
            ? href
            : `${WIKI_BASE_URL}${href}`;

          if (
            href.includes("/wiki/Spell:") &&
            fullUrl !== currentUrl &&
            !links.includes(fullUrl)
          ) {
            console.log(`Found spell link: ${fullUrl}`);
            links.push(fullUrl);
          }
        }
      });

      // Look for next page
      const nextLink = $("#mw-pages a")
        .filter((_, el) => $(el).text().toLowerCase().includes("next"))
        .first();

      const nextHref = nextLink.attr("href");
      currentUrl = nextHref ? `${WIKI_BASE_URL}${nextHref}` : "";
    } catch (error) {
      console.error(`Error fetching page ${currentUrl}:`, error);
      break;
    }
  }

  return links;
}

async function processSpellWithVariants(
  url: string,
  category: string
): Promise<SpellInfo[]> {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  const tierLinks = await getSpellwrightingTierLinks($);

  if (!tierLinks.length) {
    const spellInfo = await getSpellDetailsFromPage(url, category);
    return spellInfo ? [spellInfo] : [];
  }

  const variants: SpellInfo[] = [];
  for (const tierLink of tierLinks) {
    const tierSpell = await getSpellDetailsFromPage(tierLink, category);
    if (tierSpell) {
      variants.push(tierSpell);
    }
  }

  return variants;
}

async function syncSpells() {
  console.log("Starting spell sync...");

  for (const school of SCHOOL_PATHS) {
    console.log(`\nProcessing ${school} school spells...`);

    try {
      const schoolPath = SCHOOL_SPELL_PATHS.find((path) =>
        path.toLowerCase().includes(school.toLowerCase())
      );

      if (schoolPath) {
        const schoolUrl = `${WIKI_BASE_URL}${schoolPath}`;
        console.log(`Processing spells from URL: ${schoolUrl}`);

        const spellLinks = await getSpellLinksFromSchoolPage(schoolUrl);
        console.log(`Found ${spellLinks.length} unique spell links`);

        for (const spellUrl of spellLinks) {
          console.log(`Processing spell URL: ${spellUrl}`);
          const variants = await processSpellWithVariants(
            spellUrl,
            `${school} School`
          );

          // Insert or update spells in Supabase
          for (const spell of variants) {
            try {
              const spellData: SpellInsert = {
                name: spell.name,
                accuracy: spell.accuracy,
                card_effects: spell.card_effects,
                card_image_url: spell.card_image_url,
                card_type: spell.card_type,
                description: spell.description,
                last_updated: new Date().toISOString(),
                pip_cost: spell.pip_cost,
                pvp_level: spell.pvp_level,
                pvp_status: spell.pvp_status,
                school: spell.school,
                tier: spell.tier || "1",
                wiki_url: spell.wiki_url
              };

              const { error } = await supabaseAdmin
                .from("spells")
                .upsert(spellData, {
                  onConflict: "name,tier",
                  ignoreDuplicates: false
                });

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
