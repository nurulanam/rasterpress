import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, CheckCircle2, Download, Loader2 } from "lucide-react";
import {
  downloadUrl,
  formatBytes,
  padPage,
  type PageResult,
} from "../lib/pdf";

interface PageCardProps {
  page: number;
  index: number;
  selected: boolean;
  converting: boolean;
  result?: PageResult;
  getThumb: (page: number) => Promise<string>;
  onToggle: (page: number) => void;
}

export default function PageCard({
  page,
  index,
  selected,
  converting,
  result,
  getThumb,
  onToggle,
}: PageCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [thumb, setThumb] = useState<string | null>(null);

  /* lazy: only ask for a thumbnail once the card scrolls near the viewport */
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "800px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible || thumb) return;
    let alive = true;
    getThumb(page)
      .then((url) => alive && setThumb(url))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [visible, thumb, page, getThumb]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
        delay: Math.min(index, 7) * 0.05,
      }}
      onClick={() => !converting && onToggle(page)}
      className={`group relative select-none overflow-hidden rounded-2xl border bg-cream transition-all duration-300 ${
        converting ? "cursor-wait" : "cursor-pointer"
      } ${
        selected
          ? "border-accent ring-1 ring-accent"
          : "border-line opacity-90 hover:border-ink/35 hover:opacity-100"
      } hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(27,24,19,0.35)]`}
    >
      {/* thumbnail */}
      <div className="checker relative aspect-[1/1.3] w-full overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={`Page ${page}`}
            draggable={false}
            className={`size-full object-contain p-2.5 transition-all duration-500 ${
              selected ? "" : "grayscale-[0.35]"
            }`}
          />
        ) : (
          <div className="shimmer absolute inset-3 rounded-lg" />
        )}

        {!thumb && (
          <span className="absolute inset-0 grid place-items-center font-mono text-lg font-semibold text-ink/25">
            {padPage(page)}
          </span>
        )}

        {/* converting overlay */}
        {converting && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-cream/80 backdrop-blur-[2px]">
            <Loader2 size={22} className="animate-spin text-accent" />
            <span className="font-mono text-[9px] tracking-[0.3em] text-ink2">
              PRESSING…
            </span>
          </div>
        )}

        {/* selection chip */}
        <div
          className={`absolute left-2.5 top-2.5 z-20 grid size-6 place-items-center rounded-lg border transition-all duration-200 ${
            selected
              ? "border-accent bg-accent text-cream"
              : "border-ink/25 bg-cream/90 text-transparent group-hover:border-ink/50"
          }`}
        >
          <Check size={14} strokeWidth={3.2} />
        </div>

        {/* done badge */}
        {result && !converting && (
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            className="absolute right-2.5 top-2.5 z-20 grid size-6 place-items-center rounded-full bg-ink text-paper"
          >
            <CheckCircle2 size={14} className="text-accent" />
          </motion.div>
        )}
      </div>

      {/* footer */}
      <div className="flex items-center justify-between border-t border-line px-3.5 py-2.5">
        {result ? (
          <>
            <div className="min-w-0">
              <p className="font-mono text-[11px] font-semibold tabular-nums leading-none">
                {formatBytes(result.size)}
              </p>
              <p className="mt-1 truncate font-mono text-[9px] tabular-nums tracking-[0.06em] text-stone">
                {result.width}×{result.height}
              </p>
            </div>
            <button
              aria-label={`Download page ${page}`}
              onClick={(e) => {
                e.stopPropagation();
                downloadUrl(result.url, result.name);
              }}
              className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-paper transition-all duration-200 hover:scale-110 hover:bg-accent active:scale-95"
            >
              <Download size={14} strokeWidth={2.4} />
            </button>
          </>
        ) : (
          <>
            <p className="font-mono text-[10px] tracking-[0.22em] text-stone">
              PAGE {padPage(page)}
            </p>
            <span
              className={`size-1.5 rounded-full transition-colors ${
                selected ? "bg-accent" : "bg-ink/20"
              }`}
            />
          </>
        )}
      </div>
    </motion.div>
  );
}
