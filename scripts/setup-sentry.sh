#!/bin/bash

# Setup Sentry for Production
# Run this after creating a Sentry project at sentry.io

set -e

echo "🔧 Setting up Sentry for NYP KPI Dashboard..."
echo ""
echo "Prerequisites:"
echo "1. Create a Sentry account at https://sentry.io"
echo "2. Create a new project (select Next.js)"
echo "3. Get your DSN from Project Settings > Client Keys (DSN)"
echo "4. Create an Auth Token from Settings > Developer Settings > Auth Tokens"
echo ""

# Check if DSN is provided
if [ -z "$SENTRY_DSN" ]; then
  echo "❌ Error: SENTRY_DSN environment variable not set"
  echo ""
  echo "Usage:"
  echo "  export SENTRY_DSN='https://your-dsn@sentry.io/project-id'"
  echo "  export SENTRY_ORG='your-org'"
  echo "  export SENTRY_PROJECT='nypkpi'"
  echo "  export SENTRY_AUTH_TOKEN='your-auth-token'"
  echo "  ./scripts/setup-sentry.sh"
  exit 1
fi

echo "✅ Setting Vercel environment variables..."

# Set Sentry DSN (public - available in browser)
printf '%s' "$SENTRY_DSN" | vercel env add NEXT_PUBLIC_SENTRY_DSN production
printf '%s' "$SENTRY_DSN" | vercel env add NEXT_PUBLIC_SENTRY_DSN preview
printf '%s' "$SENTRY_DSN" | vercel env add NEXT_PUBLIC_SENTRY_DSN development

# Set Sentry Org (build-time only)
printf '%s' "${SENTRY_ORG:-your-org}" | vercel env add SENTRY_ORG production
printf '%s' "${SENTRY_ORG:-your-org}" | vercel env add SENTRY_ORG preview
printf '%s' "${SENTRY_ORG:-your-org}" | vercel env add SENTRY_ORG development

# Set Sentry Project (build-time only)
printf '%s' "${SENTRY_PROJECT:-nypkpi}" | vercel env add SENTRY_PROJECT production
printf '%s' "${SENTRY_PROJECT:-nypkpi}" | vercel env add SENTRY_PROJECT preview
printf '%s' "${SENTRY_PROJECT:-nypkpi}" | vercel env add SENTRY_PROJECT development

# Set Sentry Auth Token (build-time only - for uploading source maps)
printf '%s' "$SENTRY_AUTH_TOKEN" | vercel env add SENTRY_AUTH_TOKEN production
printf '%s' "$SENTRY_AUTH_TOKEN" | vercel env add SENTRY_AUTH_TOKEN preview
printf '%s' "$SENTRY_AUTH_TOKEN" | vercel env add SENTRY_AUTH_TOKEN development

echo ""
echo "✅ Sentry environment variables configured!"
echo ""
echo "Next steps:"
echo "1. Update .sentryclirc with your auth token"
echo "2. Deploy to Vercel: npm run deploy"
echo "3. Test error tracking by triggering an error in production"
echo ""
echo "To test locally:"
echo "  echo 'NEXT_PUBLIC_SENTRY_DSN=$SENTRY_DSN' >> .env.local"
echo "  npm run dev"
echo ""
