import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Controls from "./components/Controls";
import PageCard from "./components/PageCard";
import BottomBar from "./components/BottomBar";
import {
  FORMATS,
  basePageDims,
  buildZip,
  formatBytes,
  friendlyPdfError,
  loadPdf,
  padPage,
  renderPageImage,
  renderThumbnail,
  safeBaseName,
  supportsWebP,
  type OutputFormat,
  type PDFDocument,
  type PageResult,
  type Phase,
} from "./lib/pdf";

const MAX_THUMB_CONCURRENCY = 3;

export default function App() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const [format, setFormat] = useState<OutputFormat>("jpeg");
  const [quality, setQuality] = useState(0.85);
  const [scale, setScale] = useState(2);

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [baseDims, setBaseDims] = useState<{ w: number; h: number } | null>(null);
  const [results, setResults] = useState<Record<number, PageResult>>({});
  const [renderingPage, setRenderingPage] = useState<number | null>(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [failed, setFailed] = useState(0);
  const [zipping, setZipping] = useState(false);
  const [zipPct, setZipPct] = useState(0);

  const pdfRef = useRef<PDFDocument | null>(null);
  const thumbsRef = useRef(new Map<number, string>());
  const inflightRef = useRef(new Map<number, Promise<string>>());
  const slotsRef = useRef<{ active: number; queue: (() => void)[] }>({
    active: 0,
    queue: [],
  });
  const webpOk = useMemo(() => supportsWebP(), []);

  /* ------------------------------------------------ thumbnails */

  const acquireSlot = () =>
    new Promise<void>((resolve) => {
      const s = slotsRef.current;
      if (s.active < MAX_THUMB_CONCURRENCY) {
        s.active += 1;
        resolve();
      } else {
        s.queue.push(resolve);
      }
    });

  const releaseSlot = () => {
    const s = slotsRef.current;
    const next = s.queue.shift();
    if (next) next();
    else s.active -= 1;
  };

  const getThumb = useCallback((page: number): Promise<string> => {
    const cached = thumbsRef.current.get(page);
    if (cached) return Promise.resolve(cached);
    const inflight = inflightRef.current.get(page);
    if (inflight) return inflight;
    const doc = pdfRef.current;
    if (!doc) return Promise.reject(new Error("no document"));

    const p = (async () => {
      await acquireSlot();
      try {
        const url = await renderThumbnail(doc, page);
        thumbsRef.current.set(page, url);
        return url;
      } finally {
        releaseSlot();
        inflightRef.current.delete(page);
      }
    })();
    inflightRef.current.set(page, p);
    return p;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------------------------ file intake */

  const clearResults = useCallback(() => {
    setResults((prev) => {
      Object.values(prev).forEach((r) => URL.revokeObjectURL(r.url));
      return {};
    });
    setFailed(0);
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      const okType =
        file.type === "application/pdf" || /\.pdf$/i.test(file.name);
      if (!okType) {
        setError("That doesn't look like a PDF. Drop a .pdf file to press it.");
        return;
      }

      // teardown previous session
      setPhase("loading");
      try {
        pdfRef.current?.destroy();
      } catch {
        /* noop */
      }
      pdfRef.current = null;
      thumbsRef.current.clear();
      clearResults();

      try {
        const buffer = await file.arrayBuffer();
        const doc = await loadPdf(buffer);
        pdfRef.current = doc;
        const dims = await basePageDims(doc, 1);

        setFileName(file.name);
        setFileSize(file.size);
        setPageCount(doc.numPages);
        setBaseDims(dims);
        setSelected(new Set(Array.from({ length: doc.numPages }, (_, i) => i + 1)));
        setProgress({ done: 0, total: 0 });
        setPhase("ready");
      } catch (err) {
        setError(friendlyPdfError(err));
        setPhase("idle");
      }
    },
    [clearResults],
  );

  const reset = useCallback(() => {
    try {
      pdfRef.current?.destroy();
    } catch {
      /* noop */
    }
    pdfRef.current = null;
    thumbsRef.current.clear();
    inflightRef.current.clear();
    clearResults();
    setSelected(new Set());
    setPageCount(0);
    setFileName("");
    setBaseDims(null);
    setError(null);
    setProgress({ done: 0, total: 0 });
    setPhase("idle");
    window.scrollTo({ top: 0 });
  }, [clearResults]);

  /* ------------------------------------------------ selection */

  const togglePage = useCallback((page: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  }, []);

  const selectAll = useCallback(
    () => setSelected(new Set(Array.from({ length: pageCount }, (_, i) => i + 1))),
    [pageCount],
  );
  const selectNone = useCallback(() => setSelected(new Set()), []);

  /* ------------------------------------------------ settings changes invalidate press output */

  const changeFormat = useCallback(
    (f: OutputFormat) => {
      setFormat(f);
      clearResults();
      setPhase((p) => (p === "done" ? "ready" : p));
    },
    [clearResults],
  );
  const changeScale = useCallback(
    (s: number) => {
      setScale(s);
      clearResults();
      setPhase((p) => (p === "done" ? "ready" : p));
    },
    [clearResults],
  );
  const changeQuality = useCallback(
    (q: number) => {
      setQuality(q);
      clearResults();
      setPhase((p) => (p === "done" ? "ready" : p));
    },
    [clearResults],
  );

  /* ------------------------------------------------ the press */

  const convert = useCallback(async () => {
    const doc = pdfRef.current;
    if (!doc || phase === "converting" || selected.size === 0) return;

    clearResults();
    const pages = Array.from(selected).sort((a, b) => a - b);
    const base = safeBaseName(fileName);
    const ext = FORMATS[format].ext;

    setPhase("converting");
    setProgress({ done: 0, total: pages.length });

    let failures = 0;
    for (const page of pages) {
      setRenderingPage(page);
      try {
        const { blob, width, height } = await renderPageImage(
          doc,
          page,
          scale,
          format,
          quality,
        );
        const result: PageResult = {
          page,
          name: `${base}-p${padPage(page)}.${ext}`,
          url: URL.createObjectURL(blob),
          size: blob.size,
          width,
          height,
        };
        setResults((prev) => ({ ...prev, [page]: result }));
      } catch {
        failures += 1;
      }
      setProgress({ done: pages.indexOf(page) + 1, total: pages.length });
    }

    setRenderingPage(null);
    setFailed(failures);
    setPhase("done");
  }, [phase, selected, fileName, format, scale, quality, clearResults]);

  const convertRef = useRef(convert);
  convertRef.current = convert;

  /* ------------------------------------------------ zip */

  const zipAll = useCallback(async () => {
    if (zipping) return;
    const items = Array.from(selected)
      .filter((p) => results[p])
      .sort((a, b) => a - b)
      .map((p) => results[p]);
    if (items.length === 0) return;
    setZipping(true);
    setZipPct(0);
    try {
      await buildZip(
        items,
        `${safeBaseName(fileName)}-${FORMATS[format].ext}.zip`,
        setZipPct,
      );
    } finally {
      setZipping(false);
    }
  }, [zipping, selected, results, fileName, format]);

  /* ------------------------------------------------ derived */

  const estimate = useMemo(() => {
    if (!baseDims) return null;
    return {
      w: Math.round(baseDims.w * scale),
      h: Math.round(baseDims.h * scale),
    };
  }, [baseDims, scale]);

  const resultsList = useMemo(() => Object.values(results), [results]);
  const resultsSize = useMemo(
    () => resultsList.reduce((acc, r) => acc + r.size, 0),
    [resultsList],
  );

  const inWorkspace = phase === "ready" || phase === "converting" || phase === "done";

  /* ------------------------------------------------ render */

  return (
    <div className="min-h-screen">
      <div className="grain" aria-hidden />
      <Nav />

      <AnimatePresence mode="wait">
        {!inWorkspace ? (
          <motion.div
            key="landing"
            exit={{ opacity: 0, y: -30, transition: { duration: 0.45 } }}
          >
            <Hero
              loading={phase === "loading"}
              error={error}
              onFile={handleFile}
              onClearError={() => setError(null)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="workspace"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30, transition: { duration: 0.35 } }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <section className="mx-auto max-w-7xl px-4 pb-56 pt-24 sm:px-6 sm:pt-28">
              {/* file header */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="mb-8 flex flex-wrap items-center gap-4"
              >
                <button
                  onClick={reset}
                  disabled={phase === "converting"}
                  className="group flex items-center gap-2 rounded-full border border-line bg-cream px-4 py-2 font-mono text-[10.5px] tracking-[0.18em] text-ink2 transition-all hover:border-ink/40 hover:text-ink disabled:opacity-40"
                >
                  <ArrowLeft
                    size={14}
                    className="transition-transform group-hover:-translate-x-0.5"
                  />
                  NEW FILE
                </button>

                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink text-paper">
                    <FileText size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="max-w-[280px] truncate text-sm font-semibold tracking-tight sm:max-w-md">
                      {fileName}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] tracking-[0.18em] text-stone">
                      {pageCount} PAGES · {formatBytes(fileSize)}
                    </p>
                  </div>
                </div>

                <span className="ml-auto hidden items-center gap-1.5 rounded-full border border-line bg-cream px-3 py-1.5 font-mono text-[9.5px] tracking-[0.14em] text-ink2 sm:flex">
                  <ShieldCheck size={12} className="text-accent" />
                  PROCESSED IN THIS TAB ONLY
                </span>
              </motion.div>

              <div className="grid items-start gap-6 lg:grid-cols-[340px_1fr] lg:gap-8">
                <Controls
                  format={format}
                  onFormat={changeFormat}
                  webpOk={webpOk}
                  quality={quality}
                  onQuality={changeQuality}
                  scale={scale}
                  onScale={changeScale}
                  estimate={estimate}
                  selectedCount={selected.size}
                  totalCount={pageCount}
                  onSelectAll={selectAll}
                  onSelectNone={selectNone}
                  disabled={phase === "converting"}
                />

                <div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-4 flex items-baseline justify-between"
                  >
                    <h2 className="font-display text-2xl font-semibold italic tracking-tight">
                      Pages
                    </h2>
                    <p className="font-mono text-[10px] tracking-[0.2em] text-stone">
                      CLICK TO INCLUDE / EXCLUDE
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 2xl:grid-cols-4">
                    {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                      (page, idx) => (
                        <PageCard
                          key={`${fileName}-${page}`}
                          page={page}
                          index={idx}
                          selected={selected.has(page)}
                          converting={renderingPage === page}
                          result={results[page]}
                          getThumb={getThumb}
                          onToggle={togglePage}
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>
            </section>

            <BottomBar
              phase={phase}
              selected={selected.size}
              total={pageCount}
              format={format}
              scale={scale}
              quality={quality}
              progress={progress}
              resultsCount={resultsList.length}
              resultsSize={resultsSize}
              failed={failed}
              zipping={zipping}
              zipPct={zipPct}
              onConvert={() => convertRef.current()}
              onZip={zipAll}
              onReset={reset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
