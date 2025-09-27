import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const features = [
  {
    title: "Fixed vs Floating",
    body: "Take fixed or floating exposure on an on-chain base rate. Provide liquidity or open swaps with clear, continuous PnL.",
  },
  {
    title: "EWMA Index",
    body: "Smoothed floating index using deviation-clamped EWMA to resist noise and stale updates.",
  },
  {
    title: "Uniswap v4 Hook",
    body: "Funding accrual and maturity logic are implemented in a custom v4 Hook, with flash accounting via a Router.",
  },
  {
    title: "Instant Settlement",
    body: "Funding nets to token1 with no stranded credits — add, remove, or swap and settle in one flow.",
  },
];

function IndicCorner() {
  return (
    <svg
      className="pointer-events-none absolute -top-12 -right-12 h-56 w-56 opacity-20"
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <g stroke="url(#g)" strokeWidth="1">
        {[...Array(7)].map((_, i) => (
          <circle key={i} cx="120" cy="80" r={15 + i * 12} />
        ))}
        {[...Array(12)].map((_, i) => (
          <path
            key={i}
            d={`M120 80 L ${120 + 70 * Math.cos((i * Math.PI) / 6)} ${
              80 + 70 * Math.sin((i * Math.PI) / 6)
            }`}
          />
        ))}
      </g>
    </svg>
  );
}

function LogoWordmark() {
  const [lang, setLang] = useState<"en" | "hi">("en");

  // auto flip every 3.5s
  useEffect(() => {
    const t = setInterval(
      () => setLang((p) => (p === "en" ? "hi" : "en")),
      3500
    );
    return () => clearInterval(t);
  }, []);

  const toggle = () => setLang((p) => (p === "en" ? "hi" : "en"));

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Fixed width to avoid layout collapse; layered fallback text behind gradient */}
      <div className="relative h-20 w-[min(90vw,24rem)] sm:h-24">
        {/* English */}
        <span
          className={`absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl font-extrabold leading-none transition-opacity duration-700 ${
            lang === "en" ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={lang !== "en"}
        >
          <span className="relative">
            <span className="absolute inset-0 text-white/20 select-none">
              Arth
            </span>
            <span className="select-none bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
              Arth
            </span>
          </span>
        </span>
        {/* Hindi */}
        <span
          className={`absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl font-extrabold leading-none transition-opacity duration-700 ${
            lang === "hi" ? "opacity-100" : "opacity-0"
          }`}
          style={{
            fontFamily: "'Noto Sans Devanagari', system-ui, sans-serif",
          }}
          aria-hidden={lang !== "hi"}
        >
          <span className="relative">
            <span className="absolute inset-0 text-white/20 select-none">
              अर्थ
            </span>
            <span className="select-none bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400 bg-clip-text text-transparent">
              अर्थ
            </span>
          </span>
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-white/70">
        <button
          onClick={toggle}
          className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 hover:bg-white/10 transition"
          aria-label="Toggle language"
        >
          <span className={lang === "en" ? "text-white" : "text-white/60"}>
            EN
          </span>
          <span className="mx-1">·</span>
          <span className={lang === "hi" ? "text-white" : "text-white/60"}>
            हिन्दी
          </span>
        </button>
        <span className="text-white/60">pronounced</span>
        <span className="font-medium text-white">/ɑːrθ/</span>
        <span className="text-white/50">·</span>
        <span
          className="text-white/70"
          style={{
            fontFamily: "'Noto Sans Devanagari', system-ui, sans-serif",
          }}
        >
          /ərt̪ʰ/
        </span>
      </div>
    </div>
  );
}

import Card from "./components/Card";
import Footer from "./components/Footer";

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <Card className="group relative overflow-hidden p-4">
      <div
        className="pointer-events-none absolute -inset-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(600px 180px at 100% -10%, rgba(245, 158, 11, 0.15), transparent 40%), radial-gradient(600px 180px at -10% 110%, rgba(16, 185, 129, 0.15), transparent 40%)",
        }}
      />
      <div className="relative">
        <div className="text-sm font-semibold tracking-wide text-amber-300/90">
          {title}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-white/70">{body}</p>
      </div>
    </Card>
  );
}

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "url('https://www.transparenttextures.com/patterns/asfalt-light.png'), radial-gradient(60% 40% at 70% 0%, rgba(34,211,238,0.08), transparent 60%),\n           radial-gradient(45% 35% at 10% 20%, rgba(245, 158, 11, 0.08), transparent 60%),\n           radial-gradient(40% 50% at 50% 100%, rgba(16,185,129,0.06), transparent 60%)",
          backgroundRepeat: "repeat",
          backgroundSize: "160px 160px",
          opacity: 0.6,
          mixBlendMode: "normal",
        }}
      />

      <IndicCorner />

      <main className="mx-auto max-w-6xl px-4 pt-8">
        {/* Hero */}
        <section className="relative grid place-items-center py-20 sm:py-28">
          <div className="flex flex-col items-center gap-4">
            <LogoWordmark />
            <p className="mx-auto mt-1 max-w-2xl text-center text-sm leading-relaxed text-white/70">
              A modern, permissionless prototype for <span className="neon-accent">Interest Rate Swaps</span> on
              <span className="neon-accent"> Uniswap v4</span>. Trade fixed vs
              floating, with funding accrued continuously and settled in <span className="text-white">token1</span> via a custom Router.
            </p>
            <div
              id="cta"
              className="mt-5 flex flex-wrap items-center justify-center gap-3"
            >
              <Link
                to="/app"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-black shadow-sm transition hover:-translate-y-0.5"
              >
                Launch dApp
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="opacity-80"
                >
                  <path
                    d="M7 17L17 7"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M8 7H17V16"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
              </Link>
              <a
                href="/docs"
                className="inline-flex items-center gap-2 rounded-xl border border-white/60 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/5"
              >
                Read Docs
              </a>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="pb-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <FeatureCard key={f.title} title={f.title} body={f.body} />
            ))}
          </div>
        </section>

        {/* About */}
        <section
          id="about"
          className="mt-2 grid items-center gap-6 rounded-3xl border border-white/30 bg-black p-6 backdrop-blur lg:grid-cols-2"
        >
          <div>
            <div className="text-sm font-semibold tracking-wide text-amber-300/90">
              Why Arth?
            </div>
            <h2 className="mt-1 text-2xl font-semibold text-white">
              Clarity, balance, and value on-chain
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              <span className="text-white">Arth</span> (अर्थ) means value,
              sense, and purpose. The protocol lets participants exchange a
              fixed rate for a floating one, with funding integrated over time
              into a cumulative index. Positions store a snapshot and settle the
              difference in token1 using Uniswap v4’s flash accounting — no
              dangling balances.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>• Maturity-gated pools (no adds/swaps after maturity)</li>
              <li>• Deviation-clamped EWMA for robust index updates</li>
              <li>• Custom v4 Hook + Router for atomic settlement</li>
            </ul>
          </div>
          <div className="relative">
            <div
              className="absolute -inset-2 rounded-3xl opacity-30"
              style={{
                background:
                  "conic-gradient(from 120deg at 60% 40%, rgba(245,158,11,0.25), rgba(16,185,129,0.25), transparent 60%)",
              }}
            />
            <div className="relative rounded-2xl border border-white/30 bg-black p-4 shadow">
              <div className="text-xs text-white/60">Settlement flow</div>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-white/70">
                <li>
                  Hook accrues funding (floating − fixed), clamped by deviation.
                </li>
                <li>On add/remove/swap, v4 returns BalanceDelta.</li>
                <li>Router nets deltas and settles in token1 instantly.</li>
              </ol>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
