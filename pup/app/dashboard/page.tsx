"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/PageShell";
import CountdownBadge from "@/components/CountdownBadge";
import { getPuppyProfile, getWeightLogs, getFeedingLogs, getWalkLogs, getMilestones } from "@/lib/db";
import { getPhotoUrl } from "@/lib/storage";
import type { PuppyProfile, WeightLog, FeedingLog, WalkLog, Milestone } from "@/lib/types";

const DEFAULT_PROFILE: PuppyProfile = {
  puppy_id: "default",
  name: "Berner",
  breed: "Berner Senner",
  birth_date: null,
  arrival_date: "2026-05-11",
  avatar_path: null,
  updated_at: new Date().toISOString()
};

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long"
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<PuppyProfile>(DEFAULT_PROFILE);
  const [latestWeight, setLatestWeight] = useState<WeightLog | null>(null);
  const [todayFeedings, setTodayFeedings] = useState(0);
  const [todayWalks, setTodayWalks] = useState(0);
  const [latestMilestone, setLatestMilestone] = useState<Milestone | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [profileData, weights, feedings, walks, milestones] = await Promise.all([
        getPuppyProfile(),
        getWeightLogs(),
        getFeedingLogs(),
        getWalkLogs(),
        getMilestones()
      ]);

      if (profileData) setProfile(profileData);
      if (weights.length > 0) setLatestWeight(weights[0]);

      const today = todayStr();
      setTodayFeedings(feedings.filter((f) => f.fed_at.startsWith(today)).length);
      setTodayWalks(walks.filter((w) => w.walked_at.startsWith(today)).length);
      if (milestones.length > 0) setLatestMilestone(milestones[0]);

      setLoading(false);
    }
    load();
  }, []);

  return (
    <PageShell>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welkom terug — hier is een overzicht van vandaag</p>
      </div>

      {/* Profile + countdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1.5rem", alignItems: "start", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div className="clay-card profile-card">
          <div className="profile-avatar">
            {profile.avatar_path ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={getPhotoUrl(profile.avatar_path)} alt={`${profile.name} foto`} />
            ) : (
              <span aria-hidden="true">🐕</span>
            )}
          </div>
          <div>
            <div className="profile-name">{profile.name}</div>
            <div className="profile-breed">{profile.breed}</div>
            {profile.birth_date && (
              <div className="mt-1">
                <span className="clay-badge clay-badge-rust">
                  🎂 {formatDate(profile.birth_date)}
                </span>
              </div>
            )}
          </div>
        </div>

        <CountdownBadge arrivalDate={profile.arrival_date} />
      </div>

      {/* Today summary */}
      {loading ? (
        <div className="clay-card-flat" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
          Laden…
        </div>
      ) : (
        <div className="summary-grid">
          <button
            className="clay-card summary-card"
            onClick={() => router.push("/weight")}
            type="button"
            style={{ textAlign: "left", cursor: "pointer" }}
          >
            <span className="summary-card-icon">⚖️</span>
            <span className="summary-card-value">
              {latestWeight ? `${latestWeight.weight_kg} kg` : "—"}
            </span>
            <span className="summary-card-label">
              {latestWeight ? `Gewicht (${formatDate(latestWeight.logged_at)})` : "Nog geen gewicht"}
            </span>
          </button>

          <button
            className="clay-card summary-card"
            onClick={() => router.push("/feeding")}
            type="button"
            style={{ textAlign: "left", cursor: "pointer" }}
          >
            <span className="summary-card-icon">🍽️</span>
            <span className="summary-card-value">{todayFeedings}×</span>
            <span className="summary-card-label">Gevoerd vandaag</span>
          </button>

          <button
            className="clay-card summary-card"
            onClick={() => router.push("/walks")}
            type="button"
            style={{ textAlign: "left", cursor: "pointer" }}
          >
            <span className="summary-card-icon">🐾</span>
            <span className="summary-card-value">{todayWalks}×</span>
            <span className="summary-card-label">Wandelingen vandaag</span>
          </button>

          <button
            className="clay-card summary-card"
            onClick={() => router.push("/milestones")}
            type="button"
            style={{ textAlign: "left", cursor: "pointer" }}
          >
            <span className="summary-card-icon">🌟</span>
            <span className="summary-card-value" style={{ fontSize: "1rem", paddingTop: "0.2rem" }}>
              {latestMilestone ? latestMilestone.title : "—"}
            </span>
            <span className="summary-card-label">
              {latestMilestone ? `Mijlpaal (${formatDate(latestMilestone.occurred_at)})` : "Nog geen mijlpalen"}
            </span>
          </button>
        </div>
      )}

      {/* Quick links */}
      <div className="mt-4">
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "var(--berner-dark)", marginBottom: "1rem" }}>
          Snel naar
        </h2>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {[
            { href: "/photos", icon: "📸", label: "Foto toevoegen" },
            { href: "/milestones", icon: "🌟", label: "Mijlpaal vastleggen" },
            { href: "/health", icon: "💊", label: "Dierenarts bezoek" },
            { href: "/checklist", icon: "✅", label: "Checklist" }
          ].map((link) => (
            <button
              key={link.href}
              className="clay-btn clay-btn-ghost"
              onClick={() => router.push(link.href)}
              type="button"
            >
              {link.icon} {link.label}
            </button>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
