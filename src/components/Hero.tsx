import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Archive,
  Asterisk,
  FileText,
  FileUp,
  Loader2,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  TriangleAlert,
  Zap,
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: EASE, delay: 0.08 * i },
  }),
};

const CHIPS = [
  { label: "JPG", className: "left-[-14px] top-[-26px] rotate-[-8deg]", dur: 5 },
  { label: "PNG", className: "right-[-18px] top-[18%] rotate-[7deg]", dur: 6.5 },
  { label: "WEBP", className: "left-[-34px] bottom-[8%] rotate-[5deg]", dur: 7 },
  { label: "216 DPI", className: "right-[-8px] bottom-[-22px] rotate-[-6deg]", dur: 5.6 },
];

const TICKER = [
  "PDF TO JPG",
  "PDF TO PNG",
  "PDF TO WEBP",
  "216 DPI PRINT",
  "ZIP EXPORT",
  "LOSSLESS CRISP",
  "100% PRIVATE",
];

const STEPS = [
  {
    n: "01",
    icon: FileUp,
    title: "Drop your PDF",
    text: "Any document, any page count. It's parsed locally — nothing is ever uploaded to a server.",
  },
  {
    n: "02",
    icon: SlidersHorizontal,
    title: "Dial in the output",
    text: "Pick JPG, PNG or WebP, set print-grade resolution up to 216 DPI and fine-tune quality.",
  },
  {
    n: "03",
    icon: Archive,
    title: "Press & download",
    text: "Every page is rasterized in seconds. Grab them one by one, or all of them as a tidy ZIP.",
  },
];

const FAQ = [
  {
    q: "How do I convert a PDF to JPG, PNG or WebP for free?",
    a: "Drop your PDF into Rasterpress, pick JPG, PNG or WebP, choose a resolution up to 216 DPI, and press convert. Every page becomes a downloadable image in seconds — grab pages individually or all of them as a ZIP. It's completely free and unlimited, with no sign-up, no watermarks, no file-size caps, and no daily quotas.",
  },
  {
    q: "Are my PDF files uploaded to a server?",
    a: "No. This PDF to image converter runs entirely inside your browser using PDF.js and the Canvas API. Your documents never leave your device, which makes Rasterpress private by architecture — not just by policy.",
  },
  {
    q: "Which output should I choose — JPG, PNG or WebP?",
    a: "Choose JPG for the smallest, most compatible files for sharing. Choose PNG for lossless, pixel-perfect page images with transparency preserved. Choose WebP for modern compression that's up to 30% smaller than JPG at similar quality.",
  },
  {
    q: "What resolution do the converted images have?",
    a: "You can render pages at 1× (72 DPI), 1.5× (108 DPI), 2× (144 DPI) or 3× (216 DPI). A standard A4 or Letter page at 3× becomes a sharp, print-ready image of roughly 2550 × 3300 pixels.",
  },
];

const GitHubMark = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 16 16" aria-hidden className={className} fill="currentColor">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
  </svg>
);

interface HeroProps {
  loading: boolean;
  error: string | null;
  onFile: (file: File) => void;
  onClearError: () => void;
}

export default function Hero({ loading, error, onFile, onClearError }: HeroProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);

  const pick = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onFile(files[0]);
  };

  return (
    <div>
      {/* ------------------------------------------------ hero */}
      <section className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-4 pb-16 pt-28 sm:px-6 lg:pt-32">
        {/* giant watermark */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 select-none overflow-hidden text-center"
        >
          <span className="font-display text-[26vw] font-black italic leading-[0.85] tracking-tight text-ink/[0.035]">
            Pixels
          </span>
        </div>

        <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <div>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0}
              className="mb-6 flex items-center gap-3 font-mono text-[11px] tracking-[0.3em] text-ink2"
            >
              <span className="inline-block size-1.5 rounded-full bg-accent" />
              FREE UNLIMITED PDF → IMAGE CONVERTER
            </motion.p>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className="font-sans text-[13vw] font-bold leading-[0.94] tracking-[-0.03em] sm:text-7xl lg:text-[5.4rem]"
            >
              Every page,
              <br />
              <span className="font-display font-medium italic tracking-tight text-accent">
                free & unlimited
              </span>{" "}
              to pixels.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="mt-7 max-w-md text-lg leading-relaxed text-ink2"
            >
              Convert unlimited PDF pages to perfect JPG, PNG or WebP images at
              print-grade resolution — 100% free, no sign-up, no watermarks,
              no file-size caps. Entirely in your browser.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
              className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 font-mono text-[11px] tracking-[0.14em] text-stone"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-accent" />
                100% FREE · NO LIMITS
              </span>
              <span className="flex items-center gap-2">
                <Zap size={15} className="text-accent" />
                ~0.2S PER PAGE
              </span>
              <span className="flex items-center gap-2">
                <Archive size={15} className="text-accent" />
                ONE-CLICK ZIP
              </span>
            </motion.div>
          </div>

          {/* ------- dropzone card ------- */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="relative"
          >
            {CHIPS.map((c) => (
              <motion.span
                key={c.label}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: c.dur, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute z-10 hidden rounded-full border border-line bg-cream px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-widest text-ink2 shadow-sm md:block ${c.className}`}
              >
                {c.label}
              </motion.span>
            ))}

            <div className="rounded-[28px] border border-line bg-cream p-2 shadow-[0_30px_80px_-40px_rgba(27,24,19,0.35)]">
              <div
                role="button"
                tabIndex={0}
                aria-label="Upload a PDF"
                onClick={() => !loading && inputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                onDragEnter={(e) => {
                  e.preventDefault();
                  dragDepth.current += 1;
                  setDragging(true);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={(e) => {
                  e.preventDefault();
                  dragDepth.current -= 1;
                  if (dragDepth.current <= 0) {
                    dragDepth.current = 0;
                    setDragging(false);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  dragDepth.current = 0;
                  setDragging(false);
                  pick(e.dataTransfer.files);
                }}
                className={`group relative flex h-[380px] cursor-pointer flex-col items-center justify-center gap-5 overflow-hidden rounded-[22px] border-2 border-dashed transition-all duration-300 ${
                  dragging
                    ? "border-accent bg-accent/[0.06]"
                    : "border-ink/20 hover:border-ink/45 hover:bg-ink/[0.02]"
                }`}
              >
                {dragging && (
                  <>
                    <div className="dash-anim absolute inset-x-0 top-0 h-0.5" />
                    <div className="dash-anim absolute inset-x-0 bottom-0 h-0.5" />
                  </>
                )}

                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    pick(e.target.files);
                    e.target.value = "";
                  }}
                />

                {loading ? (
                  <>
                    <div className="grid size-16 place-items-center rounded-2xl bg-ink text-paper">
                      <Loader2 size={26} className="animate-spin" />
                    </div>
                    <p className="font-mono text-xs tracking-[0.25em] text-ink2">
                      READING YOUR PDF…
                    </p>
                  </>
                ) : (
                  <>
                    <motion.div
                      animate={dragging ? { scale: 1.12, rotate: -4 } : { scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                      className={`grid size-16 place-items-center rounded-2xl transition-colors ${
                        dragging ? "bg-accent text-cream" : "bg-ink text-paper"
                      }`}
                    >
                      <FileUp size={26} strokeWidth={2.2} />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-xl font-semibold tracking-tight">
                        {dragging ? "Release to press it" : "Drop your PDF here"}
                      </p>
                      <p className="mt-1.5 text-sm text-stone">
                        or{" "}
                        <span className="font-semibold text-accent underline underline-offset-4">
                          browse your files
                        </span>
                      </p>
                    </div>
                    <p className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.2em] text-stone">
                      <FileText size={13} />
                      .PDF · UP TO 100+ PAGES
                    </p>
                  </>
                )}
              </div>
            </div>

            {error && (
              <motion.div
                key={error}
                initial={{ opacity: 0, y: 10, x: 0 }}
                animate={{ opacity: 1, y: 0, x: [0, -6, 6, -3, 0] }}
                transition={{ duration: 0.45 }}
                className="mt-4 flex items-start gap-3 rounded-2xl border border-ember/30 bg-ember/[0.08] px-4 py-3 text-sm text-ember"
              >
                <TriangleAlert size={17} className="mt-0.5 shrink-0" />
                <div className="flex-1 leading-snug">{error}</div>
                <button
                  onClick={onClearError}
                  className="font-mono text-[10px] tracking-widest underline underline-offset-2 hover:opacity-70"
                >
                  DISMISS
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------ ticker */}
      <div className="border-y border-ink bg-ink py-3.5 text-paper">
        <div className="flex overflow-hidden">
          <div className="animate-marquee flex w-max items-center gap-8 pr-8">
            {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((t, i) => (
              <span
                key={i}
                className="flex items-center gap-8 font-mono text-xs tracking-[0.3em]"
              >
                {t}
                <Asterisk size={14} className="text-accent" />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ steps */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.1 }}
              className="group bg-cream p-8 sm:p-10"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-5xl font-light italic text-ink/15 transition-colors duration-500 group-hover:text-accent">
                  {s.n}
                </span>
                <s.icon
                  size={22}
                  strokeWidth={1.8}
                  className="text-stone transition-colors duration-500 group-hover:text-ink"
                />
              </div>
              <h3 className="mt-8 text-lg font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink2">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="mb-4 flex items-center gap-3 font-mono text-[11px] tracking-[0.3em] text-ink2">
              <span className="inline-block size-1.5 rounded-full bg-accent" />
              GOOD TO KNOW
            </p>
            <h2 className="font-sans text-4xl font-bold tracking-[-0.02em] sm:text-5xl">
              PDF to image,{" "}
              <span className="font-display font-medium italic text-accent">
                answered.
              </span>
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ink2">
              Everything about converting PDF to JPG, PNG and WebP — free,
              unlimited and completely private.
            </p>
          </div>

          <div className="divide-y divide-line border-y border-line">
            {FAQ.map((f, i) => (
              <motion.details
                key={f.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.06 }}
                className="group py-5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold tracking-tight marker:hidden [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line text-ink2 transition-all duration-300 group-open:rotate-45 group-open:border-accent group-open:bg-accent group-open:text-cream">
                    <Plus size={14} strokeWidth={2.4} />
                  </span>
                </summary>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink2">
                  {f.a}
                </p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ footer */}
      <footer className="border-t border-ink bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
            <div>
              <p className="font-display text-5xl font-semibold italic tracking-tight sm:text-6xl">
                Rasterpress
              </p>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper/70">
                A free, unlimited PDF to image converter. Built on PDF.js — every
                file is processed on your device and never touches a server.
              </p>
            </div>
            <div className="font-mono text-[11px] leading-loose tracking-[0.18em] text-paper/60">
              <p>JPG · PNG · WEBP</p>
              <p>UP TO 216 DPI · ZIP EXPORT</p>
              <p className="flex items-center gap-2">
                <ShieldCheck size={13} className="text-accent" />
                PRIVACY BY ARCHITECTURE
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-white/15 pt-6 font-mono text-[10.5px] tracking-[0.12em] text-paper/60 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>© {new Date().getFullYear()}</span>
              <a
                href="https://github.com/Oblique-Code"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-paper transition-colors hover:text-accent"
              >
                OBLIQUE CODE
              </a>
              <span className="text-paper/40">· ALL RIGHTS RESERVED</span>
            </p>
            <p className="flex items-center gap-2">
              <GitHubMark className="size-3.5 text-paper/60" />
              <span>DESIGNED & DEVELOPED BY</span>
              <a
                href="https://github.com/nurulanam"
                target="_blank"
                rel="noopener noreferrer author"
                className="font-semibold text-paper underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent"
              >
                NURULANAM
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
