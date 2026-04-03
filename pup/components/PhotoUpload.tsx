"use client";

import { useRef, useState } from "react";
import { uploadPhoto } from "@/lib/storage";

interface PhotoUploadProps {
  folder: "photos" | "milestones" | "avatar";
  onUpload: (storagePath: string) => void;
  label?: string;
}

export default function PhotoUpload({ folder, onUpload, label = "Foto uploaden" }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploading(true);

    try {
      const path = await uploadPhoto(file, "default", folder);
      onUpload(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload mislukt");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="Voorbeeld" className="photo-preview" />
      ) : (
        <div
          className="photo-upload-zone"
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter") inputRef.current?.click(); }}
          aria-label={label}
        >
          <span className="photo-upload-icon" aria-hidden="true">
            {uploading ? "⟳" : "📸"}
          </span>
          <span className="photo-upload-text">
            {uploading ? "Uploaden…" : label}
          </span>
          {!uploading && (
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Klik om te selecteren
            </span>
          )}
        </div>
      )}
      <input
        accept="image/*"
        aria-hidden="true"
        onChange={handleChange}
        ref={inputRef}
        style={{ display: "none" }}
        tabIndex={-1}
        type="file"
      />
      {error && (
        <p style={{ color: "var(--danger-text)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          ⚠ {error}
        </p>
      )}
    </div>
  );
}
