import Nav from "./Nav";

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Nav />
      <main className="page-content">
        {children}
      </main>
    </div>
  );
}
