import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

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

type SpellType = "Spell" | "TreasureCard" | "ItemCard";

interface SpellInfo {
  name: string;
  card_type: SpellType;
  school?: string;
  card_effects?: string[];
  accuracy?: string;
  description?: string;
  description_image_alts?: string[];
  card_image_url?: string;
  pip_cost?: string;
  pvp_level?: string;
  wiki_url: string;
  category?: string;
}

function determineSpellType(name: string): SpellType {
  if (name.toLowerCase().startsWith("treasurecard:")) return "TreasureCard";
  if (name.toLowerCase().startsWith("itemcard:")) return "ItemCard";
  return "Spell";
}

function cleanSpellName(name: string): string {
  const colonIndex = name.indexOf(":");
  if (colonIndex !== -1) {
    return name.substring(colonIndex + 1).trim();
  }
  return name;
}

function cleanAccuracy(accuracy: string): string {
  const match = accuracy.match(/\d+/);
  return match ? `${match[0]}%` : accuracy;
}

function cleanPipCost(pipCost: string): string {
  const match = pipCost.match(/Pip Cost(\d+)/);
  return match ? match[1] : pipCost;
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

function extractPvpLevel(html: string): string | undefined {
  const pvpLevelRegex = /(?:PvP|Level)[- ]*((?:\d+\+|\d+))/i;
  const match = html.match(pvpLevelRegex);
  return match ? match[1] : undefined;
}

async function getSpellDetailsFromPage(
  url: string,
  category: string
): Promise<SpellInfo | null> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Log the raw HTML for debugging failed pages
    console.log(`Processing page content for ${url}`);

    const rawName = $(".firstHeading").text().trim();
    if (!rawName) {
      console.log(`No spell name found at ${url}`);
      return null;
    }

    const cardType = determineSpellType(rawName);
    const name = cleanSpellName(rawName);

    const infoBox = $(".infobox");
    if (!infoBox.length) {
      console.log(`No infobox found for spell at ${url}`);
    }

    // Initialize with required fields
    const spellInfo: SpellInfo = {
      name,
      card_type: cardType,
      wiki_url: url,
      category
    };

    const pvpLevel = extractPvpLevel(html);
    if (pvpLevel) {
      spellInfo.pvp_level = pvpLevel;
    }

    // Extract school from school image alt tag
    const schoolRow = infoBox
      .find("tr")
      .filter((_, el) => $(el).text().toLowerCase().includes("school"));
    if (schoolRow.length) {
      const schoolImage = schoolRow.find("img");
      if (schoolImage.length) {
        const schoolAlt = schoolImage.attr("alt");
        if (schoolAlt) {
          spellInfo.school = schoolAlt.replace(" School", "").trim();
        } else {
          console.log(`No school alt text found for ${name}`);
        }
      }
    } else {
      console.log(`No school row found for ${name}`);
    }

    // Extract type from type image alt tags
    const typeRow = infoBox
      .find("tr")
      .filter((_, el) => $(el).text().toLowerCase().includes("type"));
    if (typeRow.length) {
      const typeImages = typeRow.find("img");
      if (typeImages.length) {
        const typeAlts = typeImages
          .map((_, img) => $(img).attr("alt"))
          .get()
          .filter((alt): alt is string => alt !== undefined);

        if (typeAlts.length) {
          spellInfo.card_effects = processSpellTypes(typeAlts);
        } else {
          console.log(`No type alt texts found for ${name}`);
        }
      }
    } else {
      console.log(`No type row found for ${name}`);
    }

    // Extract accuracy
    const accuracyRow = infoBox
      .find("tr")
      .filter((_, el) => $(el).text().toLowerCase().includes("accuracy"));
    if (accuracyRow.length) {
      const accuracyText = accuracyRow.find("td").text().trim();
      if (accuracyText) {
        spellInfo.accuracy = cleanAccuracy(accuracyText);
      } else {
        console.log(`No accuracy text found for ${name}`);
      }
    }

    // Extract pip cost
    const pipRow = infoBox
      .find("tr")
      .filter((_, el) => $(el).text().toLowerCase().includes("pip"));
    if (pipRow.length) {
      const pipText = pipRow.find("td").text().trim();
      if (pipText) {
        spellInfo.pip_cost = cleanPipCost(pipText);
      } else {
        console.log(`No pip cost text found for ${name}`);
      }
    }

    // Extract spell description
    let description = "";

    // Try infobox description first
    const descriptionRow = infoBox
      .find("tr")
      .filter(
        (_, el) => $(el).text().trim().toLowerCase() === "spell description"
      )
      .next("tr");

    if (descriptionRow.length) {
      const infoboxDesc = descriptionRow.find("td").text().trim();
      if (infoboxDesc) {
        description = infoboxDesc;
      }
    }

    // If no infobox description, try first paragraph
    if (!description) {
      const contentParagraphs = $(".mw-parser-output > p");
      contentParagraphs.each((_, el) => {
        const text = $(el).text().trim();
        if (text && !description) {
          description = text;
          return false;
        }
      });
    }

    if (description) {
      spellInfo.description = description;
    } else {
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

    console.log(`Successfully processed spell: ${name}`, spellInfo);
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetSchool = searchParams.get("school")?.trim();

    console.log("Available school paths:", SCHOOL_SPELL_PATHS);
    console.log("Target school:", targetSchool);

    const spells: SpellInfo[] = [];
    let foundSpellLinks: string[] = [];

    if (targetSchool) {
      // Find the matching school path
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
          const spellInfo = await getSpellDetailsFromPage(
            spellUrl,
            `${schoolName} School`
          );
          if (spellInfo) {
            console.log("Found spell:", spellInfo.name);
            spells.push(spellInfo);
          } else {
            console.log(`Failed to process spell at URL: ${spellUrl}`);
          }
        }
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
      total_scraped: spells.length,
      failed_to_process: foundSpellLinks.filter(
        (link) => !spells.some((spell) => spell.wiki_url === link)
      )
    });
  } catch (error) {
    console.error("Error in GET handler:", error);
    return NextResponse.json(
      { error: "Failed to fetch spells" },
      { status: 500 }
    );
  }
}
