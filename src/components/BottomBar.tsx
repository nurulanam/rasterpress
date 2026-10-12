import { AnimatePresence, motion } from "framer-motion";
import { FileImage, Loader2, Package, RotateCcw } from "lucide-react";
import { FORMATS, formatBytes, type OutputFormat, type Phase } from "../lib/pdf";

interface BottomBarProps {
  phase: Phase;
  selected: number;
  total: number;
  format: OutputFormat;
  scale: number;
  quality: number;
  progress: { done: number; total: number };
  resultsCount: number;
  resultsSize: number;
  failed: number;
  zipping: boolean;
  zipPct: number;
  onConvert: () => void;
  onZip: () => void;
  onReset: () => void;
}

export default function BottomBar(props: BottomBarProps) {
  const {
    phase,
    selected,
    total,
    format,
    scale,
    quality,
    progress,
    resultsCount,
    resultsSize,
    failed,
    zipping,
    zipPct,
    onConvert,
    onZip,
    onReset,
  } = props;

  const converting = phase === "converting";
  const done = phase === "done" && resultsCount > 0;
  const progPct =
    progress.total > 0 ? (progress.done / progress.total) * 100 : 0;

  return (
    <AnimatePresence>
      {(phase === "ready" || phase === "converting" || phase === "done") && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-4 sm:pb-6"
        >
          <div className="pointer-events-auto flex w-full max-w-3xl flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-line bg-cream/90 p-3 shadow-[0_24px_70px_-24px_rgba(27,24,19,0.45)] backdrop-blur-xl sm:flex-nowrap">
            {/* summary / progress */}
            <div className="min-w-0 flex-1 pl-1.5">
              {converting ? (
                <div>
                  <div className="flex items-baseline justify-between font-mono text-[10.5px] tracking-[0.16em] text-ink2">
                    <span>PRESSING PAGES</span>
                    <span className="tabular-nums text-ink">
                      {progress.done}/{progress.total}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
                    <motion.div
                      className="h-full rounded-full bg-accent"
                      animate={{ width: `${progPct}%` }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="hidden font-mono text-[10.5px] tracking-[0.14em] text-stone sm:block">
                    <span className="font-semibold text-ink">{selected}</span>
                    /{total} PAGES
                  </span>
                  <span className="hidden h-3.5 w-px bg-line sm:block" />
                  <span className="font-mono text-[10.5px] tracking-[0.14em] text-stone">
                    {FORMATS[format].label} · {scale}×
                    {format !== "png" && ` · Q${Math.round(quality * 100)}`}
                  </span>
                  {done && (
                    <>
                      <span className="hidden h-3.5 w-px bg-line sm:block" />
                      <span className="font-mono text-[10.5px] tracking-[0.14em] text-accent">
                        {resultsCount} READY · {formatBytes(resultsSize)}
                      </span>
                    </>
                  )}
                  {failed > 0 && (
                    <span className="font-mono text-[10.5px] tracking-[0.14em] text-ember">
                      {failed} FAILED
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* actions */}
            <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
              <button
                onClick={onReset}
                disabled={converting || zipping}
                title="Start over with a new file"
                className="grid size-11 place-items-center rounded-full border border-line text-ink2 transition-all hover:border-ink/40 hover:text-ink disabled:opacity-40"
              >
                <RotateCcw size={16} />
              </button>

              {done && (
                <motion.button
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={onZip}
                  disabled={zipping || converting}
                  className="relative flex h-11 min-w-44 items-center justify-center gap-2 overflow-hidden rounded-full border border-ink bg-ink px-5 text-sm font-semibold text-paper transition-all hover:shadow-[0_10px_30px_-10px_rgba(27,24,19,0.6)] disabled:opacity-60"
                >
                  {zipping ? (
                    <>
                      <motion.span
                        className="absolute inset-y-0 left-0 bg-accent/25"
                        animate={{ width: `${zipPct}%` }}
                        transition={{ duration: 0.2 }}
                      />
                      <Loader2 size={16} className="relative animate-spin" />
                      <span className="relative font-mono text-xs tracking-widest">
                        ZIPPING {Math.round(zipPct)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <Package size={16} className="text-accent" />
                      ZIP · {formatBytes(resultsSize)}
                    </>
                  )}
                </motion.button>
              )}

              <button
                onClick={onConvert}
                disabled={converting || zipping || selected === 0}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-bold tracking-tight text-cream shadow-[0_12px_30px_-10px_rgba(255,74,28,0.7)] transition-all hover:-translate-y-0.5 hover:bg-ember hover:shadow-[0_16px_36px_-10px_rgba(255,74,28,0.8)] active:translate-y-0 disabled:translate-y-0 disabled:opacity-45 disabled:shadow-none sm:flex-initial"
              >
                {converting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Pressing…
                  </>
                ) : (
                  <>
                    <FileImage size={16} />
                    {done ? `Re-press ${selected}` : `Press ${selected} page${selected === 1 ? "" : "s"}`}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
