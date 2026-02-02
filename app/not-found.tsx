import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-16">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Page not found
          </h2>
          <p className="mt-2 text-muted-foreground">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/dashboard" className="block">
            <Button className="w-full">
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              Go to Home
            </Button>
          </Link>
        </div>

        <div className="pt-8 border-t space-y-2 text-sm text-muted-foreground">
          <p>Need help?</p>
          <a href="mailto:support@example.com" className="text-primary hover:underline">
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
}
