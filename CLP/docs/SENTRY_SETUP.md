# Sentry Error Monitoring Setup

This guide explains how to set up Sentry for error monitoring in production.

## Prerequisites

1. Create a Sentry account at [sentry.io](https://sentry.io)
2. Create a new project (select **Next.js** as the platform)
3. Note your organization slug (found in Settings > General)

## Getting Your Credentials

### 1. Get your DSN

1. Go to **Settings > Projects > [Your Project] > Client Keys (DSN)**
2. Copy the DSN (looks like: `https://abc123@o123.ingest.sentry.io/456`)

### 2. Create an Auth Token

1. Go to **Settings > Developer Settings > Auth Tokens**
2. Click **Create New Token**
3. Name: `nypkpi-vercel-deploy`
4. Scopes: Select **project:releases** and **org:read**
5. Copy the token (you'll only see it once!)

## Setup Steps

### 1. Configure Environment Variables

```bash
# Set your Sentry credentials
export SENTRY_DSN='https://your-dsn@sentry.io/project-id'
export SENTRY_ORG='your-org-slug'
export SENTRY_PROJECT='nypkpi'
export SENTRY_AUTH_TOKEN='your-auth-token-here'

# Run the setup script
./scripts/setup-sentry.sh
```

This will configure Vercel environment variables for production, preview, and development.

### 2. Update Local .sentryclirc

Edit `.sentryclirc` and replace placeholders:

```ini
[auth]
token=YOUR_ACTUAL_AUTH_TOKEN_HERE

[defaults]
org=your-org-slug
project=nypkpi
```

**⚠️ Important:** Never commit `.sentryclirc` to git! It's already in `.gitignore`.

### 3. Add DSN to Local Development

```bash
echo "NEXT_PUBLIC_SENTRY_DSN=$SENTRY_DSN" >> .env.local
```

### 4. Deploy to Production

```bash
npm run deploy
```

Sentry will automatically:
- Upload source maps during build
- Track errors in production
- Monitor Vercel Cron Jobs
- Capture client-side errors

## What's Being Monitored

### 1. Cron Job Errors

The cron job (`/api/cron/download-reports`) captures:
- Parser failures
- Database errors
- NYP API errors (excluding session expired)
- Storage upload errors

### 2. Client-Side Errors

- React component errors
- Network failures
- User-triggered errors
- Unhandled promise rejections

### 3. Server-Side Errors

- API route errors
- Middleware errors
- Database errors

## Testing Sentry Integration

### Test in Development

```bash
npm run dev
```

Visit: http://localhost:3000/api/sentry-test (if you create a test endpoint)

### Test in Production

Trigger a test error after deployment:

```typescript
// Add to any page temporarily:
throw new Error('Sentry test error');
```

Deploy, visit the page, then check Sentry dashboard for the error.

## Monitoring Dashboard

Access your Sentry dashboard:
- **Projects:** https://sentry.io/organizations/YOUR_ORG/projects/
- **Issues:** https://sentry.io/organizations/YOUR_ORG/issues/
- **Performance:** https://sentry.io/organizations/YOUR_ORG/performance/

## Features Enabled

### Source Maps

Source maps are automatically uploaded during build, allowing you to see the original TypeScript code in error stack traces.

### Session Replay

Captures 10% of all sessions and 100% of sessions with errors. This allows you to see exactly what the user did before an error occurred.

### Performance Monitoring

Tracks transaction performance with 10% sampling rate. Adjust `tracesSampleRate` in config files to change.

### Breadcrumbs

Automatically captures:
- Console logs
- Network requests
- User interactions
- Navigation events

### Vercel Cron Monitoring

Automatically tracks cron job execution with `automaticVercelMonitors: true`.

## Configuration Files

- **`sentry.client.config.ts`** — Client-side error tracking
- **`sentry.server.config.ts`** — Server-side error tracking (API routes)
- **`sentry.edge.config.ts`** — Edge runtime error tracking (middleware)
- **`next.config.ts`** — Build-time Sentry webpack plugin config
- **`.sentryclirc`** — Sentry CLI authentication (DO NOT COMMIT)

## Adjusting Sample Rates

Edit the config files to adjust sampling:

```typescript
// Increase performance tracing in production
tracesSampleRate: 0.5, // 50% of transactions

// Capture more session replays
replaysSessionSampleRate: 0.2, // 20% of sessions
```

## Privacy & Data Scrubbing

Sentry is configured to:
- ✅ Mask all text in session replays
- ✅ Block all media in session replays
- ✅ Scrub sensitive data from breadcrumbs
- ✅ Filter known benign errors (ECONNRESET during dev)

## Cost Optimization

Sentry free tier limits:
- 5,000 errors/month
- 10,000 performance transactions/month
- 50 session replays/month

To stay within limits:
- Keep `tracesSampleRate` at 0.1 (10%)
- Keep `replaysSessionSampleRate` at 0.1 (10%)
- Filter out noisy errors in `beforeSend` hooks

## Alerting

Set up alerts in Sentry:

1. Go to **Settings > Alerts**
2. Create alert rule:
   - **Condition:** Issue is first seen
   - **Action:** Send email to team
3. Create another for high-volume issues

## Troubleshooting

### Source maps not uploading

Check Vercel build logs for Sentry plugin errors:
```bash
vercel logs --follow
```

Verify auth token has `project:releases` scope.

### Errors not appearing in Sentry

1. Check DSN is correct in environment variables
2. Verify Sentry config files are imported (check `.next/server/`)
3. Check browser console for Sentry initialization errors
4. Verify `NEXT_PUBLIC_SENTRY_DSN` is set (public env var)

### Too many events (quota exceeded)

Increase filtering:
```typescript
// sentry.server.config.ts
beforeSend(event, hint) {
  // Filter out specific errors
  if (event.exception?.values?.[0]?.value?.includes('known-benign-error')) {
    return null;
  }
  return event;
}
```

## Next Steps

1. ✅ Set up Sentry account
2. ✅ Configure environment variables
3. ✅ Deploy to production
4. ✅ Test error tracking
5. 📧 Set up email alerts
6. 📊 Review errors weekly
7. 🔍 Set up performance budgets

## Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Best Practices](https://docs.sentry.io/product/best-practices/)
- [Vercel + Sentry Integration](https://vercel.com/integrations/sentry)
