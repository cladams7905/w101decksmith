#!/bin/bash

PROJECT_REF="rnsdsclvovqpgqdrvzmv"

# Generate the types
npx supabase gen types typescript --project-id "$PROJECT_REF" --schema public > ./src/db/database.types.ts

# Replace all occurrences of 'spells: Json | null' with 'spells: Spell[]'
sed -i.bak 's/spells: Json | null/spells: Spell[]/g' ./src/db/database.types.ts

# Replace all occurrences of 'spells?: Json | null' with 'spells?: Spell[]' 
sed -i.bak 's/spells?: Json | null/spells?: Spell[]/g' ./src/db/database.types.ts

# Replace verbose enum references with clean type aliases (excluding export type lines)
sed -i.bak '/^export type /!s/Database\["public"\]\["Enums"\]\["school"\]/School/g' ./src/db/database.types.ts
sed -i.bak '/^export type /!s/Database\["public"\]\["Enums"\]\["card_effect"\]/CardEffect/g' ./src/db/database.types.ts  
sed -i.bak '/^export type /!s/Database\["public"\]\["Enums"\]\["card_type"\]/CardType/g' ./src/db/database.types.ts
sed -i.bak '/^export type /!s/Database\["public"\]\["Enums"\]\["pvp_status"\]/PvpStatus/g' ./src/db/database.types.ts

# Add all type aliases after the Json type definition
sed -i.bak '8a\
\
export type Spell = Database["public"]["Tables"]["spells"]["Row"];\
export type SpellInsert = Database["public"]["Tables"]["spells"]["Insert"];\
export type SpellUpdate = Database["public"]["Tables"]["spells"]["Update"];\
\
export type Deck = Database["public"]["Tables"]["decks"]["Row"];\
export type DeckInsert = Database["public"]["Tables"]["decks"]["Insert"];\
export type DeckUpdate = Database["public"]["Tables"]["decks"]["Update"];\
\
export type School = Database["public"]["Enums"]["school"];\
export type CardEffect = Database["public"]["Enums"]["card_effect"];\
export type CardType = Database["public"]["Enums"]["card_type"];\
export type PvpStatus = Database["public"]["Enums"]["pvp_status"];
\
' ./src/db/database.types.ts

# Remove the backup file
rm ./src/db/database.types.ts.bak

echo "Types generated with clean type aliases and enum references updated"