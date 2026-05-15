"use client";

import { useState } from "react";
import { Save, Loader2, Check, Link2, Upload, RotateCcw } from "lucide-react";
import VideoEmbed from "@/components/VideoEmbed";
import CloudinaryUploadButton from "./CloudinaryUploadButton";

type Props = {
  lessonId: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultVideoUrl: string;
  overrideTitle: string | null;
  overrideDescription: string | null;
  overrideVideoUrl: string | null;
};

export default function LessonOverrideEditor(props: Props) {
  const [title, setTitle] = useState(props.overrideTitle ?? "");
  const [description, setDescription] = useState(props.overrideDescription ?? "");
  const [videoUrl, setVideoUrl] = useState(props.overrideVideoUrl ?? "");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasOverride =
    !!props.overrideTitle || !!props.overrideDescription || !!props.overrideVideoUrl;

  const previewUrl = videoUrl || props.defaultVideoUrl;

  async function save() {
    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/admin/lesson-override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: props.lessonId,
          title: title || null,
          description: description || null,
          videoUrl: videoUrl || null,
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "save_failed");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "save_failed");
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    if (!confirm("Remove override and revert to original content?")) return;
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/admin/lesson-override?lessonId=${encodeURIComponent(props.lessonId)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("delete_failed");
      setTitle(""); setDescription(""); setVideoUrl("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "delete_failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3" data-testid={`lesson-editor-${props.lessonId}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        data-testid={`lesson-toggle-${props.lessonId}`}
        className="flex items-center justify-between gap-4 text-left hover:bg-card/50 -mx-2 px-2 py-1 rounded-sm transition-colors"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-display text-base tracking-wide text-white">
              {props.overrideTitle || props.defaultTitle}
            </p>
            {hasOverride && <span className="pill pill-info">override</span>}
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted mt-0.5">
            {props.lessonId}
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-teal">
          {open ? "Close" : "Edit"}
        </span>
      </button>

      {open && (
        <div className="grid gap-5 pt-3 lg:grid-cols-2">
          {/* Fields */}
          <div className="flex flex-col gap-4">
            <Field
              label="Title (override)"
              placeholder={props.defaultTitle}
              value={title}
              onChange={setTitle}
              testid={`field-title-${props.lessonId}`}
            />
            <Field
              label="Description (override)"
              placeholder={props.defaultDescription}
              value={description}
              onChange={setDescription}
              textarea
              testid={`field-desc-${props.lessonId}`}
            />

            {/* Video URL with upload */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.22em] text-ink-dim mb-1.5">
                Video URL
              </label>
              <div className="flex items-stretch gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" strokeWidth={1.75} />
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder={props.defaultVideoUrl || "Loom / YouTube / Vimeo / Cloudinary URL"}
                    data-testid={`field-video-url-${props.lessonId}`}
                    className="w-full rounded-sm border border-white/10 bg-bg pl-10 pr-3 py-2.5 text-sm font-mono text-white placeholder:text-white/30 focus:border-teal/60 focus:outline-none"
                  />
                </div>
                <CloudinaryUploadButton
                  resourceType="video"
                  folder={`coachg/lessons/${props.lessonId}`}
                  onUploaded={(url) => setVideoUrl(url)}
                />
              </div>
              <p className="mt-1.5 font-mono text-[10px] text-muted">
                Paste any URL or click <Upload className="inline h-3 w-3" /> to upload directly to Cloudinary.
              </p>
            </div>

            {error && <p className="text-xs font-mono text-danger">{error}</p>}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={save}
                disabled={saving}
                data-testid={`save-${props.lessonId}`}
                className="inline-flex items-center gap-2 rounded-sm bg-teal px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-black hover:bg-teal/80 disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : saved ? <Check className="h-3 w-3" /> : <Save className="h-3 w-3" />}
                {saved ? "Saved" : "Save Override"}
              </button>
              {hasOverride && (
                <button
                  type="button"
                  onClick={reset}
                  disabled={saving}
                  data-testid={`reset-${props.lessonId}`}
                  className="inline-flex items-center gap-2 rounded-sm border border-white/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-white/60 hover:border-danger/60 hover:text-danger transition-colors"
                >
                  <RotateCcw className="h-3 w-3" /> Revert
                </button>
              )}
            </div>
          </div>

          {/* Preview */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-dim mb-1.5">
              Preview
            </p>
            <VideoEmbed url={previewUrl} title={title || props.defaultTitle} />
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, textarea, testid }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; textarea?: boolean; testid?: string;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-ink-dim mb-1.5">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          data-testid={testid}
          className="w-full rounded-sm border border-white/10 bg-bg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-teal/60 focus:outline-none resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          data-testid={testid}
          className="w-full rounded-sm border border-white/10 bg-bg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-teal/60 focus:outline-none"
        />
      )}
    </label>
  );
}
