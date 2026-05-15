"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Upload, Loader2 } from "lucide-react";

type Props = {
  resourceType: "video" | "image" | "raw" | "auto";
  folder?: string;
  onUploaded: (url: string, info: CloudinaryUploadInfo) => void;
  label?: string;
  fullWidth?: boolean;
};

export interface CloudinaryUploadInfo {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
  bytes: number;
  original_filename?: string;
}

interface CloudinaryWindow extends Window {
  cloudinary?: {
    createUploadWidget: (
      config: Record<string, unknown>,
      callback: (error: unknown, result: { event?: string; info?: CloudinaryUploadInfo }) => void
    ) => { open: () => void };
  };
}

export default function CloudinaryUploadButton({
  resourceType,
  folder,
  onUploaded,
  label,
  fullWidth,
}: Props) {
  const widgetRef = useRef<{ open: () => void } | null>(null);
  const [busy, setBusy] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const configured = !!cloudName && !!apiKey;

  useEffect(() => {
    if (!scriptReady || !configured) return;
    const w = window as CloudinaryWindow;
    if (!w.cloudinary) return;

    widgetRef.current = w.cloudinary.createUploadWidget(
      {
        cloudName,
        apiKey,
        uploadSignature: (
          cb: (sig: string) => void,
          params: Record<string, unknown>
        ) => {
          fetch("/api/cloudinary/sign-upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paramsToSign: params }),
          })
            .then((r) => r.json())
            .then((d: { signature?: string }) => cb(d.signature ?? ""));
        },
        resourceType,
        folder,
        sources: ["local", "url"],
        multiple: false,
        styles: {
          palette: {
            window: "#1b2035",
            sourceBg: "#161b2e",
            windowBorder: "#252b40",
            tabIcon: "#00c4b4",
            inactiveTabIcon: "#94a3b8",
            menuIcons: "#94a3b8",
            link: "#00c4b4",
            action: "#00c4b4",
            inProgress: "#f59e0b",
            complete: "#10b981",
            error: "#ef4444",
            textDark: "#0f172a",
            textLight: "#f8fafc",
          },
        },
      },
      (error, result) => {
        if (error) {
          setBusy(false);
          return;
        }
        if (!result?.event) return;
        if (result.event === "success" && result.info) {
          setBusy(false);
          onUploaded(result.info.secure_url, result.info);
        } else if (result.event === "close" || result.event === "abort") {
          setBusy(false);
        }
      }
    );
  }, [scriptReady, configured, cloudName, apiKey, resourceType, folder, onUploaded]);

  function open() {
    if (!configured) {
      alert("Cloudinary not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your environment.");
      return;
    }
    if (widgetRef.current) {
      setBusy(true);
      widgetRef.current.open();
    }
  }

  return (
    <>
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <button
        type="button"
        onClick={open}
        disabled={!scriptReady || busy || !configured}
        data-testid="cloudinary-upload-button"
        title={configured ? "Upload to Cloudinary" : "Cloudinary not configured"}
        className={`inline-flex items-center justify-center gap-2 rounded-sm border border-white/10 px-3 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-white hover:border-teal/60 hover:text-teal transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${fullWidth ? "w-full" : ""}`}
      >
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" strokeWidth={2} />}
        {label ?? "Upload"}
      </button>
    </>
  );
}
