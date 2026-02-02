export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between text-center">
        <h1 className="text-4xl font-bold mb-4">Restaurant KPI Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Welcome to the Restaurant KPI Dashboard
        </p>
        <div className="mt-8 p-4 border rounded-lg bg-card">
          <p className="text-sm">
            Project initialized successfully. Next.js with TypeScript and
            Tailwind CSS is ready.
          </p>
        </div>
      </div>
    </main>
  );
}
