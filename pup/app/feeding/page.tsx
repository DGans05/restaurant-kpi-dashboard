"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import Modal from "@/components/Modal";
import { getFeedingLogs, addFeedingLog, deleteFeedingLog } from "@/lib/db";
import { getLocal, setLocal } from "@/lib/localStorage";
import type { FeedingLog } from "@/lib/types";

const LS_KEY = "feedingLogs";

const FOOD_TYPES = ["Droogvoer", "Natvoer", "Snack", "Rauw voer", "Anders"];

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

export default function FeedingPage() {
  const [entries, setEntries] = useState<FeedingLog[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [foodType, setFoodType] = useState(FOOD_TYPES[0]);
  const [amountInput, setAmountInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [dateInput, setDateInput] = useState(nowLocal());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cached = getLocal<FeedingLog[]>(LS_KEY);
    if (cached) setEntries(cached);
    getFeedingLogs().then((remote) => {
      setEntries(remote);
      setLocal(LS_KEY, remote);
    });
  }, []);

  const openModal = () => {
    setFoodType(FOOD_TYPES[0]);
    setAmountInput("");
    setNotesInput("");
    setDateInput(nowLocal());
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const amount = amountInput ? parseFloat(amountInput.replace(",", ".")) : null;
    const newEntry: FeedingLog = {
      id: `local-${Date.now()}`,
      puppy_id: "default",
      food_type: foodType,
      amount_g: amount,
      notes: notesInput || null,
      fed_at: new Date(dateInput).toISOString(),
      created_at: new Date().toISOString()
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    setLocal(LS_KEY, updated);
    setShowModal(false);

    await addFeedingLog({
      food_type: foodType,
      amount_g: amount,
      notes: notesInput || null,
      fed_at: new Date(dateInput).toISOString()
    });

    const refreshed = await getFeedingLogs();
    setEntries(refreshed);
    setLocal(LS_KEY, refreshed);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    setLocal(LS_KEY, updated);
    await deleteFeedingLog(id);
  };

  const today = todayStr();
  const todayEntries = entries.filter((e) => e.fed_at.startsWith(today));
  const todayGrams = todayEntries
    .filter((e) => e.amount_g !== null)
    .reduce((sum, e) => sum + (e.amount_g ?? 0), 0);

  return (
    <PageShell>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">🍽️ Voeding</h1>
          <p className="page-subtitle">Bijhouden wat en wanneer je puppy eet</p>
        </div>
        <button className="clay-btn" onClick={openModal} type="button">
          + Voeding toevoegen
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
              Gevoerd vandaag
            </div>
          </div>
          {todayGrams > 0 && (
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--berner-dark)" }}>
                {todayGrams}g
              </div>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Totaal vandaag
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Entry list */}
      <div className="clay-card">
        <div style={{ padding: "1.25rem 1.5rem 1rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--berner-dark)" }}>
            Voedingslog
          </h2>
        </div>
        {entries.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🍽️</span>
            <span className="empty-state-title">Nog geen voedingen</span>
            <span className="empty-state-desc">Voeg de eerste voeding toe om het bij te houden.</span>
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
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span className="entry-item-title">{entry.food_type}</span>
                    {entry.amount_g && (
                      <span className="clay-badge clay-badge-brown">{entry.amount_g}g</span>
                    )}
                  </div>
                  <span className="entry-item-meta">{formatDateTime(entry.fed_at)}</span>
                  {entry.notes && <span className="entry-item-notes">{entry.notes}</span>}
                </div>
                <button
                  className="entry-delete-btn"
                  onClick={() => handleDelete(entry.id)}
                  aria-label="Voeding verwijderen"
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
        <Modal title="Voeding toevoegen" onClose={() => setShowModal(false)}>
          <div className="clay-field">
            <label className="clay-label" htmlFor="food-type">Type voeding *</label>
            <select
              className="clay-input"
              id="food-type"
              onChange={(e) => setFoodType(e.target.value)}
              value={foodType}
            >
              {FOOD_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="clay-field">
            <label className="clay-label" htmlFor="food-amount">Hoeveelheid (gram)</label>
            <input
              className="clay-input"
              id="food-amount"
              inputMode="decimal"
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="bv. 150"
              type="text"
              value={amountInput}
            />
          </div>
          <div className="clay-field">
            <label className="clay-label" htmlFor="food-date">Datum & tijd *</label>
            <input
              className="clay-input"
              id="food-date"
              onChange={(e) => setDateInput(e.target.value)}
              type="datetime-local"
              value={dateInput}
            />
          </div>
          <div className="clay-field">
            <label className="clay-label" htmlFor="food-notes">Notities</label>
            <input
              className="clay-input"
              id="food-notes"
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Optionele opmerking…"
              type="text"
              value={notesInput}
            />
          </div>
          <div className="modal-footer">
            <button className="clay-btn clay-btn-ghost" onClick={() => setShowModal(false)} type="button">
              Annuleren
            </button>
            <button className="clay-btn" disabled={saving} onClick={handleSave} type="button">
              {saving ? "Opslaan…" : "Opslaan"}
            </button>
          </div>
        </Modal>
      )}
    </PageShell>
  );
}
