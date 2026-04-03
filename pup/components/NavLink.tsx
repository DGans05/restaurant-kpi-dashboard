"use client";

import { usePathname, useRouter } from "next/navigation";

interface NavLinkProps {
  href: string;
  icon: string;
  label: string;
  variant?: "sidebar" | "bottom";
}

export default function NavLink({ href, icon, label, variant = "sidebar" }: NavLinkProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  if (variant === "bottom") {
    return (
      <button
        aria-current={isActive ? "page" : undefined}
        className={`nav-bottom-link ${isActive ? "active" : ""}`}
        onClick={() => router.push(href)}
        type="button"
      >
        <span className="nav-bottom-link-icon" aria-hidden="true">{icon}</span>
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      aria-current={isActive ? "page" : undefined}
      className={`nav-link ${isActive ? "active" : ""}`}
      onClick={() => router.push(href)}
      type="button"
    >
      <span className="nav-link-icon" aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
