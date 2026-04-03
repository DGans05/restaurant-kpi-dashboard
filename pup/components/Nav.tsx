"use client";

import NavLink from "./NavLink";

const navItems = [
  { href: "/dashboard",   icon: "🏠", label: "Dashboard" },
  { href: "/weight",      icon: "⚖️",  label: "Gewicht" },
  { href: "/feeding",     icon: "🍽️",  label: "Voeding" },
  { href: "/walks",       icon: "🐾",  label: "Wandelingen" },
  { href: "/photos",      icon: "📸",  label: "Foto's" },
  { href: "/milestones",  icon: "🌟",  label: "Mijlpalen" },
  { href: "/health",      icon: "💊",  label: "Gezondheid" },
  { href: "/checklist",   icon: "✅",  label: "Checklist" }
];

export default function Nav() {
  return (
    <>
      {/* Desktop sidebar */}
      <nav className="nav-sidebar" aria-label="Hoofdnavigatie">
        <div className="nav-logo">
          <span className="nav-logo-title">🐕 Berner</span>
          <span className="nav-logo-subtitle">Puppy Dagboek</span>
        </div>
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} variant="sidebar" />
        ))}
      </nav>

      {/* Mobile bottom nav */}
      <nav className="nav-bottom" aria-label="Navigatie">
        <div className="nav-bottom-inner">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} variant="bottom" />
          ))}
        </div>
      </nav>
    </>
  );
}
