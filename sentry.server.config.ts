import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
  // Adjust this value in production for performance
  tracesSampleRate: 0.1,

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps

  environment: process.env.NODE_ENV,

  // Capture 100% of errors
  beforeSend(event, hint) {
    // Don't send events for specific errors that are expected
    const error = hint.originalException;

    if (error && typeof error === 'object' && 'message' in error) {
      const message = String(error.message);

      // Filter out known benign errors
      if (message.includes('fetch failed') && message.includes('ECONNRESET')) {
        // Network errors during development
        return null;
      }
    }

    return event;
  },
});
