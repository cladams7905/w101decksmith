import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { CheerioAPI } from "cheerio";

const WIKI_BASE_URL = "https://wiki.wizard101central.com";

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
type School =
  | "fire"
  | "ice"
  | "storm"
  | "life"
  | "myth"
  | "death"
  | "balance"
  | "astral"
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

interface PvpInfo {
  status: PvpStatus;
  level?: number;
}

function determineSpellType(name: string): CardType {
  if (name.toLowerCase().startsWith("treasurecard:")) return "treasure_card";
  if (name.toLowerCase().startsWith("itemcard:")) return "item_card";
  return "spell";
}

function normalizeSchool(school: string): School | undefined {
  const schoolMap: { [key: string]: School } = {
    Fire: "fire",
    Ice: "ice",
    Storm: "storm",
    Life: "life",
    Myth: "myth",
    Death: "death",
    Balance: "balance",
    Sun: "astral",
    Moon: "astral",
    Star: "astral",
    Shadow: "shadow"
  };

  return schoolMap[school];
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
  // Remove both "Spell:" prefix and any type prefix (TreasureCard:, ItemCard:)
  const cleanedName = name
    .replace(/^(?:Spell:|TreasureCard:|ItemCard:)/i, "")
    .trim();
  return cleanedName;
}

function cleanAccuracy(accuracy: string): number {
  const match = accuracy.match(/\d+/);
  if (!match) return 1; // Default to 100% if no number found
  const percentage = parseInt(match[0], 10);
  return percentage / 100;
}

function cleanPipCost(pipCost: string): string {
  // Check for "X" or variable pip cost indicators
  if (pipCost.toLowerCase().includes("x")) {
    return "X";
  }

  // Extract numeric pip cost
  const match = pipCost.match(/\d+/);
  if (!match) {
    console.log(`No numeric pip cost found in: ${pipCost}, defaulting to "1"`);
    return "1";
  }
  return match[0];
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

function extractPvpInfo($: CheerioAPI): PvpInfo {
  // Find the PvP and PvP Level rows in the infobox table
  const pvpRows = $(".infobox tr").filter((_, el) => {
    const firstCell = $(el).find("td:first-child");
    const cellText = firstCell.find("b").text().trim();
    return cellText === "PvP" || cellText === "PvP Level";
  });

  if (!pvpRows.length) {
    // If no PvP row found, assume unrestricted
    return { status: "unrestricted" };
  }

  let pvpStatus: PvpStatus = "unrestricted";
  let pvpLevel: number | undefined;

  // Process each row (could be just PvP, just PvP Level, or both)
  pvpRows.each((_, row) => {
    const $row = $(row);
    const label = $row.find("td:first-child b").text().trim();
    const cell = $row.find("td:last-child");
    const cellText = cell.text().trim();

    if (label === "PvP") {
      // Check for "No PvP"
      if (
        cellText.startsWith("No") &&
        cell.find('img[alt="No PvP"]').length > 0
      ) {
        pvpStatus = "no_pvp";
      }
      // Check for "PvP Only"
      else if (
        cellText.startsWith("Only") &&
        cell.find('img[alt="PvP Only"]').length > 0
      ) {
        pvpStatus = "no_pve";
      }
    } else if (label === "PvP Level") {
      // Extract level number, handling both "40+" and "40" formats
      const levelMatch = cellText.match(/(\d+)\+?/);
      if (levelMatch) {
        pvpLevel = parseInt(levelMatch[1], 10);
        // Only set status to level_restricted if it's not already no_pve
        if (pvpStatus !== "no_pve") {
          pvpStatus = "level_restricted";
        }
      }
    }
  });

  return {
    status: pvpStatus,
    ...(pvpLevel !== undefined && { level: pvpLevel })
  };
}

async function getSpellwrightingTierLinks($: CheerioAPI): Promise<string[]> {
  const tierLinks: string[] = [];

  // Find the Spellwrighting Tiers section
  const tierSection = $(".data-table-heading").filter((_, el) =>
    $(el).text().trim().startsWith("Spellwrighting Tiers")
  );

  if (tierSection.length) {
    // Find the following table or list containing the tier links
    const tierContainer = tierSection.next();

    // Extract all spell links from the container
    tierContainer.find("a").each((_, link) => {
      const href = $(link).attr("href");
      if (href && href.includes("/wiki/Spell:")) {
        const fullUrl = href.startsWith("http")
          ? href
          : `${WIKI_BASE_URL}${href}`;
        if (!tierLinks.includes(fullUrl)) {
          // Avoid duplicates
          tierLinks.push(fullUrl);
        }
      }
    });
  }

  return tierLinks;
}

function extractNameAndTier(rawName: string): { name: string; tier: string } {
  // First clean any Spell: prefix from the name
  const cleanedName = cleanSpellName(rawName);

  // Match patterns like "Name (Tier 2a)" or "Name Tier 2a"
  const tierPattern = /(?:\(Tier\s+(\d+[a-z]?)\)|\s+Tier\s+(\d+[a-z]?))\s*$/i;
  const match = cleanedName.match(tierPattern);

  if (match) {
    // Get the tier value from either capture group
    const tier = (match[1] || match[2]).toLowerCase();
    // Remove the tier part from the name
    const name = cleanedName.replace(tierPattern, "").trim();
    return { name, tier };
  }

  // If no tier found in the name, return the cleaned name and tier "1"
  return {
    name: cleanedName,
    tier: "1"
  };
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

    // Initialize with required fields
    const spellInfo: SpellInfo = {
      name,
      card_type: cardType,
      wiki_url: url,
      category,
      tier
    };

    // Extract school from school image alt tag
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
          } else {
            console.log(`Could not normalize school: ${schoolAlt} for ${name}`);
          }
        }
      }
    } else {
      console.log(`No school row found for ${name}`);
    }

    // Extract type from type image alt tags
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
        } else {
          console.log(`No type alt texts found for ${name}`);
        }
      }
    } else {
      console.log(`No type row found for ${name}`);
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
      } else {
        console.log(`No accuracy text found for ${name}`);
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
      } else {
        console.log(`No pip cost text found for ${name}`);
      }
    }

    // Extract spell description
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

    // If no description found in infobox, try first paragraph
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

    if (!spellInfo.description) {
      console.log(`No description found for ${name}`);
    }

    // Extract spell card image URL
    const spellImage = infoBox.find("img").first();
    if (spellImage.length) {
      const imgSrc = spellImage.attr("src");
      if (imgSrc) {
        spellInfo.card_image_url = imgSrc.startsWith("http")
          ? imgSrc
          : `${WIKI_BASE_URL}${imgSrc}`;
      } else {
        console.log(`No image source found for ${name}`);
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
      console.log(`Page content length: ${html.length} characters`);

      const $ = cheerio.load(html);

      // Find all links in the page
      $("a").each((_, el) => {
        const href = $(el).attr("href");
        if (href) {
          // Convert relative URLs to absolute
          const fullUrl = href.startsWith("http")
            ? href
            : `${WIKI_BASE_URL}${href}`;

          // Only include links that:
          // 1. Are spell pages
          // 2. Are not the current page
          // 3. Haven't been processed yet
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

      // Look for the "next page" link
      const nextLink = $("#mw-pages a")
        .filter((_, el) => $(el).text().toLowerCase().includes("next"))
        .first();

      // Update currentUrl for next iteration
      const nextHref = nextLink.attr("href");
      currentUrl = nextHref ? `${WIKI_BASE_URL}${nextHref}` : "";
      if (nextHref) {
        console.log(`Found next page link: ${currentUrl}`);
      }
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
  // First fetch the page to get tier links
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  // Get all tier links including the base spell
  const tierLinks = await getSpellwrightingTierLinks($);

  // If no tier links found, process as a single spell
  if (!tierLinks.length) {
    const spellInfo = await getSpellDetailsFromPage(url, category);
    return spellInfo ? [spellInfo] : [];
  }

  // Process all spells from the tier links
  const variants: SpellInfo[] = [];
  for (const tierLink of tierLinks) {
    const tierSpell = await getSpellDetailsFromPage(tierLink, category);
    if (tierSpell) {
      variants.push(tierSpell);
    }
  }

  return variants;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetSchool = searchParams.get("school")?.trim();

    console.log("Available school paths:", SCHOOL_SPELL_PATHS);
    console.log("Target school:", targetSchool);

    const spells: SpellInfo[] = [];
    let foundSpellLinks: string[] = [];

    if (targetSchool) {
      const schoolPath = SCHOOL_SPELL_PATHS.find((path) =>
        path.toLowerCase().includes(targetSchool.toLowerCase())
      );

      console.log("Found school path:", schoolPath);

      if (schoolPath) {
        const schoolUrl = `${WIKI_BASE_URL}${schoolPath}`;
        const schoolName = schoolPath.split(":")[1].split("_")[0];
        console.log(
          `Processing ${schoolName} school spells from URL: ${schoolUrl}`
        );

        foundSpellLinks = await getSpellLinksFromSchoolPage(schoolUrl);
        console.log(`Found ${foundSpellLinks.length} unique spell links`);

        for (const spellUrl of foundSpellLinks) {
          console.log(`Processing spell URL: ${spellUrl}`);
          const variants = await processSpellWithVariants(
            spellUrl,
            `${schoolName} School`
          );
          spells.push(...variants);
        }

        console.log(`Processed ${spells.length} spells (including variants)`);
      } else {
        return NextResponse.json(
          { error: `School '${targetSchool}' not found` },
          { status: 404 }
        );
      }
    } else {
      // Return available schools extracted from the paths
      const availableSchools = SCHOOL_SPELL_PATHS.map(
        (path) => path.split(":")[1].split("_")[0]
      );
      return NextResponse.json({
        message: "Please specify a school",
        available_schools: availableSchools,
        example: "?school=Fire"
      });
    }

    return NextResponse.json({
      spells,
      total_spells: spells.length,
      total_base_spells: foundSpellLinks.length
    });
  } catch (error) {
    console.error("Error in GET handler:", error);
    return NextResponse.json(
      { error: "Failed to fetch spells" },
      { status: 500 }
    );
  }
}
