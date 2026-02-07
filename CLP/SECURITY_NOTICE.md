# Security Notice

## ⚠️ CRITICAL: CRON_SECRET Rotation Required

The value `nyp-kpi-cron-secret-2026` was previously hardcoded in `scripts/capture-nyp-cookies.ts` (now fixed).

**ACTION REQUIRED:**

1. **Rotate the CRON_SECRET immediately** if you're using the exposed value
2. Generate a new strong secret:
   ```bash
   openssl rand -base64 32
   ```

3. Update in Vercel:
   ```bash
   # Remove old secret
   vercel env rm CRON_SECRET production

   # Add new secret
   printf 'YOUR_NEW_SECRET_HERE' | vercel env add CRON_SECRET production
   printf 'YOUR_NEW_SECRET_HERE' | vercel env add CRON_SECRET preview
   printf 'YOUR_NEW_SECRET_HERE' | vercel env add CRON_SECRET development
   ```

4. Update in `.env.local` for local development:
   ```bash
   CRON_SECRET=YOUR_NEW_SECRET_HERE
   ```

5. Redeploy:
   ```bash
   npm run deploy
   ```

## Security Improvements Implemented

### Fixed in This Commit

1. **CRITICAL: Removed hardcoded secret** from scripts
2. **HIGH: Added timing-safe token comparison** (prevents timing attacks)
3. **HIGH: Generic error messages** (no internal details leaked)
4. **HIGH: CRON_SECRET validation** (prevents undefined secret bypass)
5. **MEDIUM: CSV injection protection** (sanitizes formula characters)
6. **MEDIUM: Removed console.log** statements from production code
7. **LOW: Removed URL logging** to Sentry (privacy improvement)

### Security Checklist

- [x] No hardcoded secrets in code
- [x] Timing-safe comparisons for auth tokens
- [x] Generic error messages (no stack traces to clients)
- [x] Input validation with Zod
- [x] CSV injection protection
- [x] No console.log in production
- [x] Sentry session replay with masking enabled
- [x] Environment variable validation

### Remaining Recommendations

**Rate Limiting (To implement soon):**
- Add rate limiting to `/api/export/csv`
- Add rate limiting to cron endpoints
- Consider Vercel Edge middleware or upstash/ratelimit

**Example rate limiting implementation:**
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

// In route handler:
const { success } = await ratelimit.limit(user.id);
if (!success) {
  return NextResponse.json({ error: "Too many requests" }, { status: 429 });
}
```

**Additional Hardening:**
- Consider adding security headers via Next.js middleware
- Implement CORS policies if needed
- Add request size limits
- Monitor Sentry for suspicious patterns

## Reporting Security Issues

If you discover a security vulnerability, please email: [your-email@example.com]

Do NOT create a public GitHub issue for security vulnerabilities.

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
