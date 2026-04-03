"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import Modal from "@/components/Modal";
import { getHealthRecords, addHealthRecord, deleteHealthRecord } from "@/lib/db";
import { getLocal, setLocal } from "@/lib/localStorage";
import type { HealthRecord, HealthRecordType } from "@/lib/types";

const LS_KEY = "healthRecords";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function isDueSoon(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const due = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 30 && diffDays >= 0;
}

function isPastDue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

const SECTIONS: { type: HealthRecordType; icon: string; label: string }[] = [
  { type: "dierenarts", icon: "🏥", label: "Dierenarts Bezoeken" },
  { type: "vaccinatie", icon: "💉", label: "Vaccinaties" },
  { type: "medicatie", icon: "💊", label: "Medicatie" }
];

export default function HealthPage() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<HealthRecordType>("dierenarts");
  const [titleInput, setTitleInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [providerInput, setProviderInput] = useState("");
  const [dateInput, setDateInput] = useState(todayStr());
  const [nextDueInput, setNextDueInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cached = getLocal<HealthRecord[]>(LS_KEY);
    if (cached) setRecords(cached);
    getHealthRecords().then((remote) => {
      setRecords(remote);
      setLocal(LS_KEY, remote);
    });
  }, []);

  const openModal = (type: HealthRecordType) => {
    setModalType(type);
    setTitleInput("");
    setDescInput("");
    setProviderInput("");
    setDateInput(todayStr());
    setNextDueInput("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!titleInput.trim()) return;
    setSaving(true);

    const newEntry: HealthRecord = {
      id: `local-${Date.now()}`,
      puppy_id: "default",
      record_type: modalType,
      title: titleInput.trim(),
      description: descInput || null,
      provider: providerInput || null,
      next_due_at: nextDueInput || null,
      occurred_at: dateInput,
      created_at: new Date().toISOString()
    };

    const updated = [newEntry, ...records];
    setRecords(updated);
    setLocal(LS_KEY, updated);
    setShowModal(false);

    await addHealthRecord({
      record_type: modalType,
      title: titleInput.trim(),
      description: descInput || null,
      provider: providerInput || null,
      next_due_at: nextDueInput || null,
      occurred_at: dateInput
    });

    const refreshed = await getHealthRecords();
    setRecords(refreshed);
    setLocal(LS_KEY, refreshed);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    setLocal(LS_KEY, updated);
    await deleteHealthRecord(id);
  };

  const sectionLabel = SECTIONS.find((s) => s.type === modalType)?.label ?? "";

  return (
    <PageShell>
      <div className="page-header">
        <h1 className="page-title">💊 Gezondheid</h1>
        <p className="page-subtitle">Dierenarts bezoeken, vaccinaties en medicatie bijhouden</p>
      </div>

      {SECTIONS.map(({ type, icon, label }) => {
        const sectionRecords = records.filter((r) => r.record_type === type);
        return (
          <div className="health-section" key={type}>
            <div className="health-section-title">
              <span aria-hidden="true">{icon}</span>
              {label}
              <button
                className="clay-btn clay-btn-sm clay-btn-ghost"
                onClick={() => openModal(type)}
                type="button"
                style={{ marginLeft: "auto" }}
              >
                + Toevoegen
              </button>
            </div>

            {sectionRecords.length === 0 ? (
              <div className="clay-card-flat" style={{ padding: "1.25rem 1.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Nog geen {label.toLowerCase()} geregistreerd.
              </div>
            ) : (
              <div className="entry-list">
                {sectionRecords.map((record, i) => (
                  <div
                    className="clay-card-flat health-record-item stagger-item"
                    key={record.id}
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    <div>
                      <div className="health-record-title">{record.title}</div>
                      <div className="health-record-meta">
                        {formatDate(record.occurred_at)}
                        {record.provider && ` · ${record.provider}`}
                      </div>
                      {record.description && (
                        <div className="entry-item-notes" style={{ marginTop: "0.25rem" }}>
                          {record.description}
                        </div>
                      )}
                      {record.next_due_at && (
                        <div
                          className="health-due-badge"
                          style={isPastDue(record.next_due_at) ? {
                            background: "var(--danger-bg)",
                            borderColor: "var(--danger-border)",
                            color: "var(--danger-text)"
                          } : {}}
                        >
                          {isPastDue(record.next_due_at) ? "⚠ Verlopen:" : isDueSoon(record.next_due_at) ? "⏰ Binnenkort:" : "📅 Volgende:"}
                          {" "}{formatDate(record.next_due_at)}
                        </div>
                      )}
                    </div>
                    <button
                      className="entry-delete-btn"
                      onClick={() => handleDelete(record.id)}
                      aria-label="Record verwijderen"
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {showModal && (
        <Modal title={`${sectionLabel} toevoegen`} onClose={() => setShowModal(false)}>
          <div className="clay-field">
            <label className="clay-label" htmlFor="health-title">Titel *</label>
            <input
              autoFocus
              className="clay-input"
              id="health-title"
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder={
                modalType === "dierenarts" ? "bv. Controle 8 weken" :
                modalType === "vaccinatie" ? "bv. DHPP Combinatievaccin" :
                "bv. Ontwormingsmiddel"
              }
              type="text"
              value={titleInput}
            />
          </div>
          <div className="clay-field">
            <label className="clay-label" htmlFor="health-date">Datum *</label>
            <input
              className="clay-input"
              id="health-date"
              onChange={(e) => setDateInput(e.target.value)}
              type="date"
              value={dateInput}
            />
          </div>
          {(modalType === "dierenarts" || modalType === "vaccinatie") && (
            <div className="clay-field">
              <label className="clay-label" htmlFor="health-provider">
                {modalType === "dierenarts" ? "Dierenarts / Kliniek" : "Uitvoerder"}
              </label>
              <input
                className="clay-input"
                id="health-provider"
                onChange={(e) => setProviderInput(e.target.value)}
                placeholder="Naam dierenartspraktijk…"
                type="text"
                value={providerInput}
              />
            </div>
          )}
          {(modalType === "vaccinatie" || modalType === "medicatie") && (
            <div className="clay-field">
              <label className="clay-label" htmlFor="health-next">Volgende keer</label>
              <input
                className="clay-input"
                id="health-next"
                onChange={(e) => setNextDueInput(e.target.value)}
                type="date"
                value={nextDueInput}
              />
            </div>
          )}
          <div className="clay-field">
            <label className="clay-label" htmlFor="health-desc">Notities</label>
            <textarea
              className="clay-input"
              id="health-desc"
              onChange={(e) => setDescInput(e.target.value)}
              placeholder="Aanvullende informatie…"
              rows={3}
              style={{ resize: "vertical" }}
              value={descInput}
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
