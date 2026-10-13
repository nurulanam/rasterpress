import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import JSZip from "jszip";

export type PDFDocument = pdfjsLib.PDFDocumentProxy;

export type OutputFormat = "jpeg" | "png" | "webp";

export type Phase = "idle" | "loading" | "ready" | "converting" | "done";

export interface FormatMeta {
  label: string;
  ext: string;
  mime: string;
  tag: string;
  blurb: string;
}

export const FORMATS: Record<OutputFormat, FormatMeta> = {
  jpeg: {
    label: "JPG",
    ext: "jpg",
    mime: "image/jpeg",
    tag: "LOSSY · SMALL",
    blurb: "Compact universal files — ideal for sharing, docs & the web.",
  },
  png: {
    label: "PNG",
    ext: "png",
    mime: "image/png",
    tag: "LOSSLESS · CRISP",
    blurb: "Pixel-perfect lossless output with transparency preserved.",
  },
  webp: {
    label: "WEBP",
    ext: "webp",
    mime: "image/webp",
    tag: "MODERN · TINY",
    blurb: "Next-gen compression — up to 30% smaller than JPG.",
  },
};

export const SCALES = [
  { value: 1, label: "1×", dpi: 72, hint: "SCREEN" },
  { value: 1.5, label: "1.5×", dpi: 108, hint: "DRAFT" },
  { value: 2, label: "2×", dpi: 144, hint: "SHARP" },
  { value: 3, label: "3×", dpi: 216, hint: "PRINT" },
];

export interface PageResult {
  page: number;
  name: string;
  url: string;
  size: number;
  width: number;
  height: number;
}

/* ------------------------------------------------------------------ */
/*  Worker bootstrap — the pdf.js worker is bundled inline so the app */
/*  keeps working fully offline from a single HTML file.              */
/* ------------------------------------------------------------------ */

let workerReady = false;

function ensureWorker() {
  if (workerReady) return;
  // Set the worker source URL — Vite emits this as a separate file so it is
  // fetched and cached independently (not inlined into the main bundle).
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  workerReady = true;
}

/* ------------------------------------------------------------------ */
/*  Loading                                                            */
/* ------------------------------------------------------------------ */

export async function loadPdf(buffer: ArrayBuffer): Promise<PDFDocument> {
  ensureWorker();
  const task = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
  return task.promise;
}

export function friendlyPdfError(err: unknown): string {
  const name = (err as { name?: string })?.name ?? "";
  if (name === "PasswordException")
    return "This PDF is password-protected. Unlock it and try again.";
  if (name === "InvalidPDFException")
    return "That file doesn't look like a valid PDF document.";
  return "Something went wrong while reading that file. Try another PDF?";
}

/* ------------------------------------------------------------------ */
/*  Rendering                                                          */
/* ------------------------------------------------------------------ */

export interface RenderedImage {
  blob: Blob;
  width: number;
  height: number;
}

export async function renderPageImage(
  doc: PDFDocument,
  pageNum: number,
  scale: number,
  format: OutputFormat,
  quality: number,
): Promise<RenderedImage> {
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext("2d")!;
  if (format === "jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(
      resolve,
      FORMATS[format].mime,
      format === "png" ? undefined : quality,
    ),
  );
  const { width, height } = canvas;
  page.cleanup();
  // release GPU / memory
  canvas.width = 0;
  canvas.height = 0;
  if (!blob || blob.size === 0)
    throw new Error("Encoder failed to produce an image");
  return { blob, width, height };
}

export async function renderThumbnail(
  doc: PDFDocument,
  pageNum: number,
  targetWidth = 640,
): Promise<string> {
  const page = await doc.getPage(pageNum);
  const base = page.getViewport({ scale: 1 });
  const scale = targetWidth / base.width;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext("2d")!;
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  const url = canvas.toDataURL("image/png");
  page.cleanup();
  canvas.width = 0;
  canvas.height = 0;
  return url;
}

export async function basePageDims(
  doc: PDFDocument,
  pageNum = 1,
): Promise<{ w: number; h: number }> {
  const page = await doc.getPage(pageNum);
  const v = page.getViewport({ scale: 1 });
  return { w: v.width, h: v.height };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

let webpSupport: boolean | null = null;
export function supportsWebP(): boolean {
  if (webpSupport !== null) return webpSupport;
  try {
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 1;
    webpSupport = c.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    webpSupport = false;
  }
  return webpSupport;
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function padPage(n: number): string {
  return String(n).padStart(3, "0");
}

export function safeBaseName(name: string): string {
  const base = name.replace(/\.pdf$/i, "").trim() || "document";
  return base.replace(/[^\w\- ]+/g, "").replace(/\s+/g, "-").slice(0, 60);
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function downloadUrl(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function buildZip(
  results: PageResult[],
  zipName: string,
  onProgress?: (pct: number) => void,
): Promise<void> {
  const zip = new JSZip();
  for (const r of results) {
    const blob = await fetch(r.url).then((res) => res.blob());
    zip.file(r.name, blob);
  }
  const blob = await zip.generateAsync(
    { type: "blob", compression: "STORE" },
    (meta) => onProgress?.(meta.percent),
  );
  downloadBlob(blob, zipName);
}
