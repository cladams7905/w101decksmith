#!/bin/bash

PROJECT_REF="rnsdsclvovqpgqdrvzmv"

npx supabase gen types typescript --project-id "$PROJECT_REF" --schema public > ./src/db/database.types.ts