import { ShieldCheck } from "lucide-react";

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="group flex items-center gap-3"
        >
          <div className="grid size-9 rotate-[-4deg] place-items-center rounded-lg bg-ink font-mono text-sm font-bold tracking-tighter text-paper transition-transform duration-300 group-hover:rotate-3 group-hover:bg-accent">
            RP
          </div>
          <div className="leading-none">
            <div className="font-display text-lg font-semibold tracking-tight">
              Rasterpress
            </div>
            <div className="mt-0.5 font-mono text-[9.5px] tracking-[0.28em] text-stone">
              PDF&nbsp;IMAGE&nbsp;STUDIO
            </div>
          </div>
        </a>

        <div className="hidden items-center gap-4 md:flex">
          <div className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-stone">
            <span>JPG</span>
            <span className="text-accent">·</span>
            <span>PNG</span>
            <span className="text-accent">·</span>
            <span>WEBP</span>
          </div>
          <div className="h-4 w-px bg-line" />
          <div className="flex items-center gap-1.5 rounded-full border border-line bg-cream px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-ink2">
            <ShieldCheck size={13} className="text-accent" />
            CLIENT-SIDE&nbsp;ONLY
          </div>
        </div>
      </div>
    </header>
  );
}
