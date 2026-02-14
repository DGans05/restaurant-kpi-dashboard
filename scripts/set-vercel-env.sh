#!/bin/bash
# ============================================================================
# Set Vercel Environment Variables from .env.local
# ============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Setting Vercel Environment Variables ===${NC}\n"

if [ ! -f .env.local ]; then
  echo "Error: .env.local not found"
  exit 1
fi

source .env.local

# Required variables
declare -a VARS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "CRON_SECRET"
  "NYP_STORE_USERNAME_ROSMALEN"
  "NYP_STORE_PASSWORD_ROSMALEN"
)

# Set each variable for production, preview, and development
for VAR in "${VARS[@]}"; do
  VALUE="${!VAR}"

  if [ -z "$VALUE" ]; then
    echo -e "${YELLOW}Warning: $VAR is empty${NC}"
    continue
  fi

  echo "Setting: $VAR"

  # Set for all environments
  echo "$VALUE" | vercel env add "$VAR" production --force 2>/dev/null || true
  echo "$VALUE" | vercel env add "$VAR" preview --force 2>/dev/null || true
  echo "$VALUE" | vercel env add "$VAR" development --force 2>/dev/null || true
done

echo -e "\n${GREEN}✓ Environment variables set!${NC}"
echo "Verify with: vercel env ls"
