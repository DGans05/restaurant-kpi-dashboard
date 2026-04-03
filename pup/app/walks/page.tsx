"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import Modal from "@/components/Modal";
import { getWalkLogs, addWalkLog, deleteWalkLog } from "@/lib/db";
import { getLocal, setLocal } from "@/lib/localStorage";
import type { WalkLog } from "@/lib/types";

const LS_KEY = "walkLogs";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("nl-NL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function nowLocal(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export default function WalksPage() {
  const [entries, setEntries] = useState<WalkLog[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [durationInput, setDurationInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [dateInput, setDateInput] = useState(nowLocal());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cached = getLocal<WalkLog[]>(LS_KEY);
    if (cached) setEntries(cached);
    getWalkLogs().then((remote) => {
      setEntries(remote);
      setLocal(LS_KEY, remote);
    });
  }, []);

  const openModal = () => {
    setDurationInput("");
    setNotesInput("");
    setDateInput(nowLocal());
    setShowModal(true);
  };

  const handleSave = async () => {
    const mins = parseInt(durationInput, 10);
    if (!durationInput || isNaN(mins) || mins <= 0) return;

    setSaving(true);
    const newEntry: WalkLog = {
      id: `local-${Date.now()}`,
      puppy_id: "default",
      duration_min: mins,
      notes: notesInput || null,
      walked_at: new Date(dateInput).toISOString(),
      created_at: new Date().toISOString()
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    setLocal(LS_KEY, updated);
    setShowModal(false);

    await addWalkLog({
      duration_min: mins,
      notes: notesInput || null,
      walked_at: new Date(dateInput).toISOString()
    });

    const refreshed = await getWalkLogs();
    setEntries(refreshed);
    setLocal(LS_KEY, refreshed);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    setLocal(LS_KEY, updated);
    await deleteWalkLog(id);
  };

  const today = todayStr();
  const todayEntries = entries.filter((e) => e.walked_at.startsWith(today));
  const todayMins = todayEntries.reduce((sum, e) => sum + e.duration_min, 0);

  return (
    <PageShell>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">🐾 Wandelingen</h1>
          <p className="page-subtitle">Wandelingen en buitentijd bijhouden</p>
        </div>
        <button className="clay-btn" onClick={openModal} type="button">
          + Wandeling toevoegen
        </button>
      </div>

      {/* Today summary */}
      <div className="clay-card" style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--berner-dark)" }}>
              {todayEntries.length}×
            </div>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Wandelingen vandaag
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--berner-dark)" }}>
              {todayMins} min
            </div>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Totaal vandaag
            </div>
          </div>
        </div>
      </div>

      {/* Entry list */}
      <div className="clay-card">
        <div style={{ padding: "1.25rem 1.5rem 1rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--berner-dark)" }}>
            Wandelingslog
          </h2>
        </div>
        {entries.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🐾</span>
            <span className="empty-state-title">Nog geen wandelingen</span>
            <span className="empty-state-desc">Voeg de eerste wandeling toe om buitentijd bij te houden.</span>
          </div>
        ) : (
          <div className="entry-list" style={{ padding: "0 1rem 1rem" }}>
            {entries.map((entry, i) => (
              <div
                className="clay-card-flat entry-item stagger-item"
                key={entry.id}
                style={{ "--i": i } as React.CSSProperties}
              >
                <div className="entry-item-left">
                  <span className="entry-item-title">{entry.duration_min} minuten</span>
                  <span className="entry-item-meta">{formatDateTime(entry.walked_at)}</span>
                  {entry.notes && <span className="entry-item-notes">{entry.notes}</span>}
                </div>
                <button
                  className="entry-delete-btn"
                  onClick={() => handleDelete(entry.id)}
                  aria-label="Wandeling verwijderen"
                  type="button"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Wandeling toevoegen" onClose={() => setShowModal(false)}>
          <div className="clay-field">
            <label className="clay-label" htmlFor="walk-duration">Duur (minuten) *</label>
            <input
              autoFocus
              className="clay-input"
              id="walk-duration"
              inputMode="numeric"
              onChange={(e) => setDurationInput(e.target.value)}
              placeholder="bv. 15"
              type="text"
              value={durationInput}
            />
          </div>
          <div className="clay-field">
            <label className="clay-label" htmlFor="walk-date">Datum & tijd *</label>
            <input
              className="clay-input"
              id="walk-date"
              onChange={(e) => setDateInput(e.target.value)}
              type="datetime-local"
              value={dateInput}
            />
          </div>
          <div className="clay-field">
            <label className="clay-label" htmlFor="walk-notes">Notities</label>
            <input
              className="clay-input"
              id="walk-notes"
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Route, bijzonderheden…"
              type="text"
              value={notesInput}
            />
          </div>
          <div className="modal-footer">
            <button className="clay-btn clay-btn-ghost" onClick={() => setShowModal(false)} type="button">
              Annuleren
            </button>
            <button
              className="clay-btn"
              disabled={saving || !durationInput}
              onClick={handleSave}
              type="button"
            >
              {saving ? "Opslaan…" : "Opslaan"}
            </button>
          </div>
        </Modal>
      )}
    </PageShell>
  );
}
