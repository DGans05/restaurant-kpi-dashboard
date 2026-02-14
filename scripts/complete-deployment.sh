#!/bin/bash

# Complete Deployment Setup Script
# Run after initial deployment to finish configuration

set -e

echo "🚀 Restaurant KPI Dashboard - Deployment Completion Script"
echo "==========================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must run from project root${NC}"
    exit 1
fi

echo "📋 Remaining Critical Tasks:"
echo ""
echo "1. Run Database Migration 008"
echo "2. Set Up Sentry Error Monitoring"
echo "3. Rotate CRON_SECRET"
echo ""
echo "=================================================="
echo ""

# Task 1: Database Migration
echo -e "${YELLOW}Task 1: Database Migration 008${NC}"
echo ""
echo "The Supabase SQL Editor should already be open."
echo "If not, opening it now..."
open "https://supabase.com/dashboard/project/apvamphntjpbgoydsluc/sql/new" 2>/dev/null || \
  echo "Please open: https://supabase.com/dashboard/project/apvamphntjpbgoydsluc/sql/new"
echo ""
echo "📄 Migration file: lib/supabase/migrations/008_performance_indexes.sql"
echo ""
echo "Steps:"
echo "  1. Copy the contents of the migration file above"
echo "  2. Paste into Supabase SQL Editor"
echo "  3. Click 'Run'"
echo "  4. Verify success message"
echo ""
read -p "Press Enter when migration is complete..."
echo -e "${GREEN}✓ Migration marked as complete${NC}"
echo ""

# Task 2: Sentry Setup
echo -e "${YELLOW}Task 2: Sentry Error Monitoring${NC}"
echo ""
echo "Do you want to set up Sentry now? (y/n)"
read -p "> " setup_sentry

if [ "$setup_sentry" = "y" ]; then
    echo ""
    echo "Opening Sentry signup..."
    open "https://sentry.io/signup/" 2>/dev/null || \
      echo "Please visit: https://sentry.io/signup/"
    echo ""
    echo "Steps:"
    echo "  1. Sign up or log in to Sentry"
    echo "  2. Create new project"
    echo "     - Platform: Next.js"
    echo "     - Name: restaurant-kpi-dashboard"
    echo "  3. Copy the DSN (looks like: https://...@...ingest.sentry.io/...)"
    echo ""
    read -p "Press Enter when you have the DSN..."
    echo ""

    echo "Enter your Sentry DSN:"
    read -p "> " sentry_dsn

    echo "Enter your Sentry organization slug:"
    read -p "> " sentry_org

    echo "Enter your Sentry auth token (from Settings > Account > API > Auth Tokens):"
    read -p "> " sentry_token

    echo ""
    echo "Adding Sentry environment variables to Vercel..."

    echo "$sentry_dsn" | vercel env add NEXT_PUBLIC_SENTRY_DSN production --scope dgans-projects
    echo "$sentry_org" | vercel env add SENTRY_ORG production --scope dgans-projects
    echo "restaurant-kpi-dashboard" | vercel env add SENTRY_PROJECT production --scope dgans-projects
    echo "$sentry_token" | vercel env add SENTRY_AUTH_TOKEN production --scope dgans-projects

    echo -e "${GREEN}✓ Sentry configured${NC}"
    echo ""
    echo "Note: You'll need to redeploy for Sentry to take effect."
    NEEDS_REDEPLOY=true
else
    echo "Skipping Sentry setup. You can set it up later using the instructions in DEPLOYMENT_STATUS.md"
fi
echo ""

# Task 3: Rotate CRON_SECRET
echo -e "${YELLOW}Task 3: Rotate CRON_SECRET${NC}"
echo ""
echo "The CRON_SECRET was exposed in git history and should be rotated."
echo "Do you want to generate and set a new CRON_SECRET? (y/n)"
read -p "> " rotate_secret

if [ "$rotate_secret" = "y" ]; then
    echo ""
    echo "Generating new secure secret..."
    NEW_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    echo "New secret: $NEW_SECRET"
    echo ""

    echo "Updating CRON_SECRET in Vercel (production)..."
    vercel env rm CRON_SECRET production --scope dgans-projects --yes || true
    echo "$NEW_SECRET" | vercel env add CRON_SECRET production --scope dgans-projects

    echo "Updating CRON_SECRET in Vercel (preview)..."
    vercel env rm CRON_SECRET preview --scope dgans-projects --yes || true
    echo "$NEW_SECRET" | vercel env add CRON_SECRET preview --scope dgans-projects

    echo "Updating CRON_SECRET in Vercel (development)..."
    vercel env rm CRON_SECRET development --scope dgans-projects --yes || true
    echo "$NEW_SECRET" | vercel env add CRON_SECRET development --scope dgans-projects

    echo -e "${GREEN}✓ CRON_SECRET rotated${NC}"
    echo ""
    echo "⚠️  IMPORTANT: Save this secret securely for manual testing:"
    echo "$NEW_SECRET"
    echo ""
    NEEDS_REDEPLOY=true
else
    echo "Skipping CRON_SECRET rotation. Highly recommended for security!"
fi
echo ""

# Redeploy if needed
if [ "$NEEDS_REDEPLOY" = "true" ]; then
    echo "=================================================="
    echo ""
    echo -e "${YELLOW}Redeployment Required${NC}"
    echo ""
    echo "Environment variables have been updated."
    echo "Do you want to redeploy to production now? (y/n)"
    read -p "> " redeploy

    if [ "$redeploy" = "y" ]; then
        echo ""
        echo "Deploying to production..."
        vercel --prod --scope dgans-projects --yes
        echo -e "${GREEN}✓ Deployed to production${NC}"
    else
        echo ""
        echo "Skipping deployment. Run 'vercel --prod' when ready."
    fi
fi

echo ""
echo "=================================================="
echo ""
echo -e "${GREEN}✅ Deployment Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Test production site: https://nypkpi.com"
echo "  2. Verify security headers:"
echo "     curl -I https://nypkpi.com | grep -E \"X-Frame-Options|CSP\""
echo "  3. Test cron jobs (see DEPLOYMENT_STATUS.md)"
echo "  4. Monitor first automated runs (1 AM & 6 AM UTC)"
echo ""
echo "📚 Documentation:"
echo "  - DEPLOYMENT_STATUS.md - Current status and verification steps"
echo "  - DEPLOYMENT_CHECKLIST.md - Complete deployment guide"
echo "  - SECURITY_NOTICE.md - Security improvements"
echo "  - docs/PERFORMANCE.md - Performance optimization"
echo ""
echo "🎉 Your Restaurant KPI Dashboard is ready for production!"
