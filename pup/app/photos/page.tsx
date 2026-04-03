"use client";

import { useEffect, useState } from "react";
import PageShell from "@/components/PageShell";
import Modal from "@/components/Modal";
import PhotoUpload from "@/components/PhotoUpload";
import { getPhotos, addPhoto, deletePhoto } from "@/lib/db";
import { getPhotoUrl } from "@/lib/storage";
import type { Photo } from "@/lib/types";

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

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [captionInput, setCaptionInput] = useState("");
  const [dateInput, setDateInput] = useState(todayStr());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPhotos().then(setPhotos);
  }, []);

  const openModal = () => {
    setPendingPath(null);
    setCaptionInput("");
    setDateInput(todayStr());
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!pendingPath) return;
    setSaving(true);

    const saved = await addPhoto({
      storage_path: pendingPath,
      caption: captionInput || null,
      taken_at: dateInput
    });

    if (saved) {
      setPhotos((prev) => [saved, ...prev]);
    }
    setShowModal(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    await deletePhoto(id);
  };

  return (
    <PageShell>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">📸 Foto{"'"}s</h1>
          <p className="page-subtitle">Het fotoalbum van je puppy</p>
        </div>
        <button className="clay-btn" onClick={openModal} type="button">
          + Foto toevoegen
        </button>
      </div>

      {photos.length === 0 ? (
        <div className="clay-card">
          <div className="empty-state">
            <span className="empty-state-icon">📸</span>
            <span className="empty-state-title">Nog geen foto{"'"}s</span>
            <span className="empty-state-desc">Begin het fotoalbum door de eerste foto toe te voegen.</span>
            <button className="clay-btn mt-2" onClick={openModal} type="button">
              Eerste foto toevoegen
            </button>
          </div>
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map((photo, i) => (
            <div
              className="photo-card stagger-item"
              key={photo.id}
              style={{ "--i": i } as React.CSSProperties}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getPhotoUrl(photo.storage_path)}
                alt={photo.caption ?? `Foto ${formatDate(photo.taken_at)}`}
                loading="lazy"
              />
              {(photo.caption || photo.taken_at) && (
                <div className="photo-card-caption">
                  {photo.caption && <div>{photo.caption}</div>}
                  <div style={{ opacity: 0.8, fontSize: "0.72rem" }}>{formatDate(photo.taken_at)}</div>
                </div>
              )}
              <button
                style={{
                  position: "absolute",
                  top: "0.5rem",
                  right: "0.5rem",
                  background: "rgba(61,32,16,0.55)",
                  border: "none",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 150ms ease"
                }}
                className="photo-delete-btn"
                onClick={() => handleDelete(photo.id)}
                aria-label="Foto verwijderen"
                type="button"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Foto toevoegen" onClose={() => setShowModal(false)}>
          <div className="clay-field">
            <label className="clay-label">Foto *</label>
            <PhotoUpload
              folder="photos"
              onUpload={(path) => setPendingPath(path)}
              label="Foto selecteren"
            />
          </div>
          <div className="clay-field">
            <label className="clay-label" htmlFor="photo-caption">Bijschrift</label>
            <input
              className="clay-input"
              id="photo-caption"
              onChange={(e) => setCaptionInput(e.target.value)}
              placeholder="Beschrijf dit moment…"
              type="text"
              value={captionInput}
            />
          </div>
          <div className="clay-field">
            <label className="clay-label" htmlFor="photo-date">Datum foto *</label>
            <input
              className="clay-input"
              id="photo-date"
              onChange={(e) => setDateInput(e.target.value)}
              type="date"
              value={dateInput}
            />
          </div>
          <div className="modal-footer">
            <button className="clay-btn clay-btn-ghost" onClick={() => setShowModal(false)} type="button">
              Annuleren
            </button>
            <button
              className="clay-btn"
              disabled={saving || !pendingPath}
              onClick={handleSave}
              type="button"
            >
              {saving ? "Opslaan…" : "Opslaan"}
            </button>
          </div>
        </Modal>
      )}

      <style>{`
        .photo-card:hover .photo-delete-btn {
          opacity: 1 !important;
        }
      `}</style>
    </PageShell>
  );
}
