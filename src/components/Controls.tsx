import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, SlidersHorizontal } from "lucide-react";
import {
  FORMATS,
  SCALES,
  type OutputFormat,
} from "../lib/pdf";

interface ControlsProps {
  format: OutputFormat;
  onFormat: (f: OutputFormat) => void;
  webpOk: boolean;
  quality: number;
  onQuality: (q: number) => void;
  scale: number;
  onScale: (s: number) => void;
  estimate: { w: number; h: number } | null;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onSelectNone: () => void;
  disabled: boolean;
}

export default function Controls(props: ControlsProps) {
  const {
    format,
    onFormat,
    webpOk,
    quality,
    onQuality,
    scale,
    onScale,
    estimate,
    selectedCount,
    totalCount,
    onSelectAll,
    onSelectNone,
    disabled,
  } = props;

  const pct = ((quality - 0.4) / 0.6) * 100;

  return (
    <motion.aside
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className="rounded-3xl border border-ink bg-ink p-6 text-paper shadow-[0_30px_60px_-30px_rgba(27,24,19,0.5)] sm:p-7 lg:sticky lg:top-24"
      aria-label="Press settings"
    >
      <div className="mb-7 flex items-center justify-between">
        <span className="flex items-center gap-2.5 font-mono text-[11px] font-medium tracking-[0.28em] text-paper/85">
          <SlidersHorizontal size={14} className="text-accent" />
          PRESS SETTINGS
        </span>
        <span className="size-1.5 animate-pulse rounded-full bg-accent" />
      </div>

      {/* ------- format ------- */}
      <p className="mb-3 font-mono text-[10px] font-medium tracking-[0.25em] text-paper/70">
        OUTPUT FORMAT
      </p>
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(FORMATS) as OutputFormat[]).map((f) => {
          const meta = FORMATS[f];
          const active = format === f;
          const unsupported = f === "webp" && !webpOk;
          return (
            <button
              key={f}
              disabled={disabled || unsupported}
              onClick={() => onFormat(f)}
              title={unsupported ? "WebP not supported by this browser" : meta.blurb}
              className={`relative rounded-2xl border px-3 py-3.5 text-left transition-all duration-200 ${
                active
                  ? "border-accent bg-accent text-ink"
                  : "border-white/25 bg-white/[0.05] text-paper hover:border-white/45 hover:bg-white/10"
              } ${unsupported ? "cursor-not-allowed opacity-35" : ""}`}
            >
              <span className="block text-[17px] font-bold leading-none tracking-tight">
                {meta.label}
              </span>
              <span
                className={`mt-1.5 block font-mono text-[9px] font-medium tracking-[0.1em] ${
                  active ? "text-ink/75" : "text-paper/65"
                }`}
              >
                {meta.tag}
              </span>
              {active && (
                <motion.span
                  layoutId="fmt-dot"
                  className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-ink"
                />
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-3 min-h-10 text-[13px] leading-snug text-paper/80">
        {FORMATS[format].blurb}
      </p>

      {/* ------- quality ------- */}
      <AnimatePresence initial={false}>
        {format !== "png" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-5 border-t border-white/15 pt-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-mono text-[10px] font-medium tracking-[0.25em] text-paper/70">
                  QUALITY
                </p>
                <p className="font-mono text-xs font-semibold tabular-nums text-accent">
                  {Math.round(quality * 100)}%
                </p>
              </div>
              <input
                type="range"
                min={0.4}
                max={1}
                step={0.01}
                value={quality}
                disabled={disabled}
                onChange={(e) => onQuality(parseFloat(e.target.value))}
                className="press-range"
                style={
                  {
                    "--range-track": `linear-gradient(90deg, #FF4A1C ${pct}%, rgba(252,250,244,0.18) ${pct}%)`,
                  } as React.CSSProperties
                }
              />
              <div className="mt-1 flex justify-between font-mono text-[9px] font-medium tracking-[0.18em] text-paper/60">
                <span>SMALLER</span>
                <span>CRISPER</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------- resolution ------- */}
      <div className="mt-5 border-t border-white/15 pt-5">
        <p className="mb-3 font-mono text-[10px] font-medium tracking-[0.25em] text-paper/70">
          RESOLUTION
        </p>
        <div className="grid grid-cols-4 gap-2">
          {SCALES.map((s) => {
            const active = scale === s.value;
            return (
              <button
                key={s.value}
                disabled={disabled}
                onClick={() => onScale(s.value)}
                className={`rounded-xl border px-1 py-2.5 text-center transition-all duration-200 ${
                  active
                    ? "border-paper bg-paper text-ink"
                    : "border-white/25 bg-white/[0.05] text-paper/90 hover:border-white/45 hover:bg-white/10 hover:text-paper"
                }`}
              >
                <span className="block text-sm font-bold leading-none tabular-nums">
                  {s.label}
                </span>
                <span
                  className={`mt-1 block font-mono text-[8.5px] font-medium tracking-[0.08em] ${
                    active ? "text-ink/65" : "text-paper/60"
                  }`}
                >
                  {s.dpi}DPI
                </span>
              </button>
            );
          })}
        </div>
        {estimate && (
          <p className="mt-3 flex items-center gap-2 font-mono text-[10.5px] font-medium tracking-[0.12em] text-paper/75">
            <Crosshair size={13} className="text-accent" />
            ≈&nbsp;
            <span className="tabular-nums text-paper">
              {estimate.w.toLocaleString()} × {estimate.h.toLocaleString()}
            </span>
            &nbsp;PX / PAGE
          </p>
        )}
      </div>

      {/* ------- selection ------- */}
      <div className="mt-5 border-t border-white/15 pt-5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] font-medium tracking-[0.25em] text-paper/70">
            PAGES
          </p>
          <div className="flex gap-4">
            <button
              onClick={onSelectAll}
              disabled={disabled}
              className="font-mono text-[10px] font-semibold tracking-[0.2em] text-accent hover:underline"
            >
              ALL
            </button>
            <button
              onClick={onSelectNone}
              disabled={disabled}
              className="font-mono text-[10px] font-medium tracking-[0.2em] text-paper/70 hover:text-paper hover:underline"
            >
              NONE
            </button>
          </div>
        </div>
        <p className="mt-2 font-mono text-sm tabular-nums text-paper">
          <span className="font-semibold text-accent">{selectedCount}</span>
          <span className="text-paper/70"> / {totalCount} selected</span>
        </p>
        <p className="mt-1.5 text-[12px] leading-snug text-paper/65">
          Click any page on the right to include or exclude it from the press.
        </p>
      </div>
    </motion.aside>
  );
}
