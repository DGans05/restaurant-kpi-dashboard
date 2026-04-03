"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import WeightChart from "@/components/WeightChart";
import Modal from "@/components/Modal";
import { getWeightLogs, addWeightLog, deleteWeightLog } from "@/lib/db";
import { getLocal, setLocal } from "@/lib/localStorage";
import type { WeightLog } from "@/lib/types";

const LS_KEY = "weightLogs";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function nowLocal(): string {
  // Returns datetime-local input value in local time
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export default function WeightPage() {
  const [entries, setEntries] = useState<WeightLog[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [dateInput, setDateInput] = useState(nowLocal());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cached = getLocal<WeightLog[]>(LS_KEY);
    if (cached) setEntries(cached);
    getWeightLogs().then((remote) => {
      setEntries(remote);
      setLocal(LS_KEY, remote);
    });
  }, []);

  const openModal = () => {
    setWeightInput("");
    setNotesInput("");
    setDateInput(nowLocal());
    setShowModal(true);
  };

  const handleSave = async () => {
    const kg = parseFloat(weightInput.replace(",", "."));
    if (!weightInput || isNaN(kg) || kg <= 0) return;

    setSaving(true);
    const newEntry: WeightLog = {
      id: `local-${Date.now()}`,
      puppy_id: "default",
      weight_kg: kg,
      notes: notesInput || null,
      logged_at: new Date(dateInput).toISOString(),
      created_at: new Date().toISOString()
    };

    const updated = [newEntry, ...entries].sort(
      (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
    );
    setEntries(updated);
    setLocal(LS_KEY, updated);
    setShowModal(false);

    const saved = await addWeightLog({
      weight_kg: kg,
      notes: notesInput || null,
      logged_at: new Date(dateInput).toISOString()
    });
    if (saved) {
      const refreshed = await getWeightLogs();
      setEntries(refreshed);
      setLocal(LS_KEY, refreshed);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    setLocal(LS_KEY, updated);
    await deleteWeightLog(id);
  };

  const chartEntries = [...entries].sort(
    (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
  );

  return (
    <PageShell>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">⚖️ Gewicht</h1>
          <p className="page-subtitle">Volg de groei van je puppy over tijd</p>
        </div>
        <button className="clay-btn" onClick={openModal} type="button">
          + Meting toevoegen
        </button>
      </div>

      {/* Chart */}
      <div className="clay-card mb-2" style={{ marginBottom: "1.5rem" }}>
        <div style={{ padding: "1rem 1.5rem 0.5rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--berner-dark)" }}>
            Groeiverloop
          </h2>
        </div>
        <WeightChart entries={chartEntries} />
      </div>

      {/* Entry list */}
      <div className="clay-card">
        <div style={{ padding: "1.25rem 1.5rem 1rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--berner-dark)" }}>
            Alle metingen
          </h2>
        </div>
        {entries.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">⚖️</span>
            <span className="empty-state-title">Nog geen metingen</span>
            <span className="empty-state-desc">Voeg de eerste gewichtsmeting toe om de groei bij te houden.</span>
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
                  <span className="entry-item-title">{entry.weight_kg} kg</span>
                  <span className="entry-item-meta">{formatDateTime(entry.logged_at)}</span>
                  {entry.notes && <span className="entry-item-notes">{entry.notes}</span>}
                </div>
                <button
                  className="entry-delete-btn"
                  onClick={() => handleDelete(entry.id)}
                  aria-label="Meting verwijderen"
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
        <Modal title="Gewicht vastleggen" onClose={() => setShowModal(false)}>
          <div className="clay-field">
            <label className="clay-label" htmlFor="weight-input">Gewicht (kg) *</label>
            <input
              autoFocus
              className="clay-input"
              id="weight-input"
              inputMode="decimal"
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="bv. 5.2"
              required
              type="text"
              value={weightInput}
            />
          </div>
          <div className="clay-field">
            <label className="clay-label" htmlFor="weight-date">Datum & tijd *</label>
            <input
              className="clay-input"
              id="weight-date"
              onChange={(e) => setDateInput(e.target.value)}
              type="datetime-local"
              value={dateInput}
            />
          </div>
          <div className="clay-field">
            <label className="clay-label" htmlFor="weight-notes">Notities</label>
            <input
              className="clay-input"
              id="weight-notes"
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
            <button
              className="clay-btn"
              disabled={saving || !weightInput}
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
