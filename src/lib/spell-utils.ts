import type { Spell } from "@/lib/types";

// Helper function to get spell ID (using name as unique identifier)
export function getSpellId(spell: Spell): string {
  return spell.name;
}

// Helper function to parse pip cost from string to number
export function getSpellPips(spell: Spell): number {
  if (!spell.pip_cost) return 0;

  // Handle "X" pip cost
  if (spell.pip_cost.toLowerCase().includes("x")) {
    return 0; // Return 0 for calculations, but we'll handle display separately
  }

  // Extract number from pip cost string (e.g., "3 pips" -> 3)
  const pipMatch = spell.pip_cost.match(/(\d+)/);
  return pipMatch ? parseInt(pipMatch[1], 10) : 0;
}

// Helper function to get pip cost display value (handles "X" properly)
export function getSpellPipDisplay(spell: Spell): string {
  if (!spell.pip_cost) return "0";

  // Handle "X" pip cost
  if (spell.pip_cost.toLowerCase().includes("x")) {
    return "X";
  }

  // Extract number from pip cost string (e.g., "3 pips" -> "3")
  const pipMatch = spell.pip_cost.match(/(\d+)/);
  return pipMatch ? pipMatch[1] : "0";
}

// Helper function to check if spell has utility effects
export function isUtilitySpell(spell: Spell): boolean {
  return (
    spell.card_effects?.some((effect) =>
      ["charm", "ward", "heal", "manipulation", "global", "aura"].includes(
        effect
      )
    ) || false
  );
}

// Helper function to get spell description safely
export function getSpellDescription(spell: Spell): string {
  return spell.description || "";
}

// Helper function to get spell school safely
export function getSpellSchool(spell: Spell): string {
  return spell.school || "balance";
}

// Helper function to get school color for styling
export function getSchoolColor(spell: Spell): string {
  const school = getSpellSchool(spell);
  const schoolColors: Record<string, string> = {
    fire: "red",
    ice: "blue",
    storm: "purple",
    life: "green",
    death: "gray",
    myth: "yellow",
    balance: "orange",
    astral: "purple",
    shadow: "gray"
  };
  return schoolColors[school] || "gray";
}

// Helper function to get school icon path
export function getSchoolIconPath(school: string): string {
  const normalizedSchool = school.toLowerCase();
  const iconMap: Record<string, string> = {
    fire: "/school-icons/(Icon)_Fire_School.png",
    ice: "/school-icons/(Icon)_Ice_School.png",
    storm: "/school-icons/(Icon)_Storm_School.png",
    life: "/school-icons/(Icon)_Life_School.png",
    death: "/school-icons/(Icon)_Death_School.png",
    myth: "/school-icons/(Icon)_Myth_School.png",
    balance: "/school-icons/(Icon)_Balance_School.png",
    astral: "/school-icons/(Icon)_Astral_School.png",
    shadow: "/school-icons/(Icon)_Shadow.png"
  };
  return iconMap[normalizedSchool] || iconMap.balance;
}

// Helper function to generate Supabase storage URL for spell card images
export function getSpellImageUrl(spell: Spell): string {
  const supabaseUrl = "https://rnsdsclvovqpgqdrvzmv.supabase.co";
  let spellName = spell.name;
  const spellTier = spell.tier || "1"; // Default to tier 1 if not specified
  const spellSchool = getSpellSchool(spell);

  // Special case: King Artorius needs the school in parentheses
  if (spellName === "King Artorius") {
    const capitalizedSchool = spellSchool.toUpperCase();
    spellName = `${spellName} (${capitalizedSchool})`;
    console.log(`Generated URL for ${spell.name} (${spellTier})`);
  }

  // Only encode spaces to %20, leave other characters like apostrophes and parentheses as-is
  const encodedSpellName = spellName.replace(/ /g, "%20");
  const encodedSpellTier = spellTier.replace(/ /g, "%20");
  const fileName = `Spell::${encodedSpellName}::${encodedSpellTier}.png`;

  // Format: https://<SUPABASE_URL>.supabase.co/storage/v1/object/public/card-images/spells/Spell::<SPELL_NAME>::<SPELL_TIER>.png
  const url = `${supabaseUrl}/storage/v1/object/public/card-images/spells/${fileName}`;

  // // Log the URL being generated for debugging
  // console.log(`Generated URL for ${spell.name} (${spellTier}):`, url);

  return url;
}

// For now, these properties would need to be parsed from description or stored separately
// You may want to enhance these based on your data structure

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getSpellDamage(_spell: Spell): number {
  // TODO: Parse from description or add to database schema
  return 0;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getSpellDamageOverTime(_spell: Spell): number {
  // TODO: Parse from description or add to database schema
  return 0;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getSpellBuffPercentage(_spell: Spell): number {
  // TODO: Parse from description or add to database schema
  return 0;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getSpellDebuffPercentage(_spell: Spell): number {
  // TODO: Parse from description or add to database schema
  return 0;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getSpellHealing(_spell: Spell): number {
  // TODO: Parse from description or add to database schema
  return 0;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getSpellHealingOverTime(_spell: Spell): number {
  // TODO: Parse from description or add to database schema
  return 0;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getSpellPipsGained(_spell: Spell): number {
  // TODO: Parse from description or add to database schema
  return 0;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getSpellTier(spell: Spell): string {
  return spell.tier;
}

// Helper function to group spells by name (consolidating different tiers)
export function groupSpellsByName(spells: Spell[]): Map<string, Spell[]> {
  const grouped = new Map<string, Spell[]>();

  spells.forEach((spell) => {
    const name = spell.name;
    if (!grouped.has(name)) {
      grouped.set(name, []);
    }
    grouped.get(name)!.push(spell);
  });

  // Sort tiers within each group
  grouped.forEach((spellGroup) => {
    spellGroup.sort((a, b) => {
      const tierA = a.tier || "1";
      const tierB = b.tier || "1";
      return tierA.localeCompare(tierB);
    });
  });

  return grouped;
}

// Helper function to get the primary spell (usually the first/lowest tier) from a group
export function getPrimarySpell(spellGroup: Spell[]): Spell {
  return spellGroup[0]; // Already sorted by tier in groupSpellsByName
}

// Helper function to get available tiers for a spell group
export function getAvailableTiers(spellGroup: Spell[]): string[] {
  return spellGroup.map((spell) => spell.tier || "1");
}
