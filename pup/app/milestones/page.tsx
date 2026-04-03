"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import Modal from "@/components/Modal";
import PhotoUpload from "@/components/PhotoUpload";
import { getMilestones, addMilestone, deleteMilestone } from "@/lib/db";
import { getPhotoUrl } from "@/lib/storage";
import { getLocal, setLocal } from "@/lib/localStorage";
import type { Milestone } from "@/lib/types";

const LS_KEY = "milestones";

const SUGGESTED = [
  "Eerste nacht thuis",
  "Eerste bad",
  "Eerste wandeling buiten",
  "Eerste kennismaking met kat",
  "Eerste commando geleerd",
  "Eerste puppyles",
  "Eerste autorit",
  "Eerste speeldate",
  "Eerste nacht doorslapen"
];

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

export default function MilestonesPage() {
  const [entries, setEntries] = useState<Milestone[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [dateInput, setDateInput] = useState(todayStr());
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cached = getLocal<Milestone[]>(LS_KEY);
    if (cached) setEntries(cached);
    getMilestones().then((remote) => {
      setEntries(remote);
      setLocal(LS_KEY, remote);
    });
  }, []);

  const openModal = () => {
    setTitleInput("");
    setDescInput("");
    setDateInput(todayStr());
    setPhotoPath(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!titleInput.trim()) return;
    setSaving(true);

    const newEntry: Milestone = {
      id: `local-${Date.now()}`,
      puppy_id: "default",
      title: titleInput.trim(),
      description: descInput || null,
      photo_path: photoPath,
      occurred_at: dateInput,
      created_at: new Date().toISOString()
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    setLocal(LS_KEY, updated);
    setShowModal(false);

    await addMilestone({
      title: titleInput.trim(),
      description: descInput || null,
      photo_path: photoPath,
      occurred_at: dateInput
    });

    const refreshed = await getMilestones();
    setEntries(refreshed);
    setLocal(LS_KEY, refreshed);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    setLocal(LS_KEY, updated);
    await deleteMilestone(id);
  };

  return (
    <PageShell>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">🌟 Mijlpalen</h1>
          <p className="page-subtitle">Bijzondere eerste momenten vastleggen</p>
        </div>
        <button className="clay-btn" onClick={openModal} type="button">
          + Mijlpaal toevoegen
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="clay-card">
          <div className="empty-state">
            <span className="empty-state-icon">🌟</span>
            <span className="empty-state-title">Nog geen mijlpalen</span>
            <span className="empty-state-desc">Leg de eerste bijzondere momenten van je puppy vast.</span>
            <button className="clay-btn mt-2" onClick={openModal} type="button">
              Eerste mijlpaal toevoegen
            </button>
          </div>
        </div>
      ) : (
        <div className="milestone-timeline">
          {entries.map((entry, i) => (
            <div
              className="clay-card milestone-item stagger-item"
              key={entry.id}
              style={{ "--i": i } as React.CSSProperties}
            >
              <div className="milestone-dot" aria-hidden="true" />
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                <div>
                  <div className="milestone-title">{entry.title}</div>
                  <div className="milestone-date">{formatDate(entry.occurred_at)}</div>
                  {entry.description && (
                    <div className="milestone-description">{entry.description}</div>
                  )}
                </div>
                <button
                  className="entry-delete-btn"
                  onClick={() => handleDelete(entry.id)}
                  aria-label="Mijlpaal verwijderen"
                  type="button"
                >
                  ✕
                </button>
              </div>
              {entry.photo_path && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getPhotoUrl(entry.photo_path)}
                  alt={`Foto bij mijlpaal: ${entry.title}`}
                  className="milestone-photo"
                  loading="lazy"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Mijlpaal vastleggen" onClose={() => setShowModal(false)}>
          <div className="clay-field">
            <label className="clay-label" htmlFor="milestone-title">Mijlpaal *</label>
            <input
              autoFocus
              className="clay-input"
              id="milestone-title"
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="bv. Eerste bad"
              type="text"
              value={titleInput}
            />
          </div>

          {/* Suggested titles */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1rem" }}>
            {SUGGESTED.map((s) => (
              <button
                key={s}
                className="clay-badge clay-badge-brown"
                onClick={() => setTitleInput(s)}
                type="button"
                style={{ cursor: "pointer" }}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="clay-field">
            <label className="clay-label" htmlFor="milestone-date">Datum *</label>
            <input
              className="clay-input"
              id="milestone-date"
              onChange={(e) => setDateInput(e.target.value)}
              type="date"
              value={dateInput}
            />
          </div>
          <div className="clay-field">
            <label className="clay-label" htmlFor="milestone-desc">Beschrijving</label>
            <textarea
              className="clay-input"
              id="milestone-desc"
              onChange={(e) => setDescInput(e.target.value)}
              placeholder="Vertel meer over dit moment…"
              rows={3}
              value={descInput}
              style={{ resize: "vertical" }}
            />
          </div>
          <div className="clay-field">
            <label className="clay-label">Foto (optioneel)</label>
            <PhotoUpload
              folder="milestones"
              onUpload={(path) => setPhotoPath(path)}
              label="Foto toevoegen"
            />
          </div>
          <div className="modal-footer">
            <button className="clay-btn clay-btn-ghost" onClick={() => setShowModal(false)} type="button">
              Annuleren
            </button>
            <button
              className="clay-btn"
              disabled={saving || !titleInput.trim()}
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
