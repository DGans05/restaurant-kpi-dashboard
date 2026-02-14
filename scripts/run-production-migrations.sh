#!/bin/bash
# ============================================================================
# Run Pending Migrations on Production Supabase
# ============================================================================
# Executes migrations 005, 006, 007 on the remote Supabase project.
# Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== NYP KPI Dashboard - Production Migration Runner ===${NC}\n"

# Load environment variables
if [ ! -f .env.local ]; then
  echo -e "${RED}Error: .env.local not found${NC}"
  exit 1
fi

source .env.local

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo -e "${RED}Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set${NC}"
  exit 1
fi

# Extract project ref from URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed -E 's|https://([^.]+)\.supabase\.co|\1|')
echo -e "Project: ${GREEN}${PROJECT_REF}${NC}"
echo -e "URL: ${NEXT_PUBLIC_SUPABASE_URL}\n"

# Confirmation
echo -e "${YELLOW}This will run migrations 005, 006, 007 on production.${NC}"
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 1
fi

# Function to run SQL via psql (requires Supabase DB password)
run_migration() {
  local migration_file=$1
  local migration_name=$(basename "$migration_file")

  echo -e "\n${GREEN}Running: ${migration_name}${NC}"

  # Using Supabase REST API to execute SQL
  # Note: This requires the service role key
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"query\": $(jq -Rs . < "$migration_file")}")

  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)

  if [ "$HTTP_CODE" -ne 200 ]; then
    echo -e "${RED}Failed: HTTP ${HTTP_CODE}${NC}"
    echo "$BODY"
    return 1
  fi

  echo -e "${GREEN}✓ Success${NC}"
}

# Alternative: Direct psql connection (requires DB password)
# Uncomment if you have direct DB access configured
run_migration_psql() {
  local migration_file=$1
  local migration_name=$(basename "$migration_file")

  echo -e "\n${GREEN}Running: ${migration_name}${NC}"

  # Connection string format: postgresql://postgres:[PASSWORD]@db.PROJECT_REF.supabase.co:5432/postgres
  # You'll need to set DB_PASSWORD in .env.local
  if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}Error: DB_PASSWORD not set in .env.local${NC}"
    exit 1
  fi

  PGPASSWORD=$DB_PASSWORD psql \
    "postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres" \
    -f "$migration_file"

  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Success${NC}"
  else
    echo -e "${RED}✗ Failed${NC}"
    exit 1
  fi
}

echo -e "\n${YELLOW}Migration Method:${NC}"
echo "1) Direct psql connection (recommended, requires DB password)"
echo "2) Manual execution (copy SQL and run in Supabase SQL Editor)"
read -p "Select method (1/2): " -n 1 -r METHOD
echo

if [ "$METHOD" = "1" ]; then
  echo -e "\n${YELLOW}Note: You need to add DB_PASSWORD to .env.local${NC}"
  echo "Get it from: Supabase Dashboard > Settings > Database > Connection string"
  echo ""

  if [ -z "$DB_PASSWORD" ]; then
    read -sp "Enter database password: " DB_PASSWORD
    echo
    export DB_PASSWORD
  fi

  # Run migrations
  run_migration_psql "lib/supabase/migrations/005_user_profiles.sql"
  run_migration_psql "lib/supabase/migrations/006_nyp_sessions.sql"
  run_migration_psql "lib/supabase/migrations/007_targets.sql"

  echo -e "\n${GREEN}✓ All migrations completed successfully!${NC}"

elif [ "$METHOD" = "2" ]; then
  echo -e "\n${YELLOW}Manual Execution Instructions:${NC}"
  echo "1. Go to: https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"
  echo "2. Copy and paste each migration file contents:"
  echo "   - lib/supabase/migrations/005_user_profiles.sql"
  echo "   - lib/supabase/migrations/006_nyp_sessions.sql"
  echo "   - lib/supabase/migrations/007_targets.sql"
  echo "3. Run each migration in order"
  echo ""
  echo -e "${GREEN}Opening Supabase SQL Editor...${NC}"
  open "https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"

else
  echo "Invalid selection. Aborted."
  exit 1
fi
