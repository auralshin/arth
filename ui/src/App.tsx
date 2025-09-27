import React, { useMemo, useState } from "react";
import { Button } from "./components/Button";
import ConnectWalletButton from "./components/ConnectButton";
import Card from "./components/Card";
import Footer from "./components/Footer";

type Pool = {
  id: string;
  name: string;
  maturity: number;
  apr: number;
  totalLiquidity: number;
  frozen?: boolean;
};

type Position = {
  key: string;
  poolId: string;
  L: number;
  kappa: number;
  maturity: number;
  fundingOwed: number;
  hf: number;
  im: number;
  mm: number;
};

const fmtNum = (n: number) =>
  Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);

const fmtPct = (p: number) => `${p.toFixed(2)}%`;

const fmtTs = (t: number) =>
  new Date(t * 1000).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const sparkPath = (values: number[], width = 120, height = 36, pad = 6) => {
  if (!values.length) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const w = width - pad * 2;
  const h = height - pad * 2;
  const scaleX = w / (values.length - 1 || 1);
  const scaleY = max === min ? 0 : h / (max - min);
  return values
    .map((v, i) => {
      const x = pad + i * scaleX;
      const y = pad + (max - v) * scaleY;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
};

const now = Math.floor(Date.now() / 1000);

const demoPools: Pool[] = [
  {
    id: "pool-3m",
    name: "ETH Base 3M",
    maturity: now + 60 * 60 * 24 * 90,
    apr: 4.21,
    totalLiquidity: 12_450_000,
  },
  {
    id: "pool-6m",
    name: "ETH Base 6M",
    maturity: now + 60 * 60 * 24 * 180,
    apr: 4.68,
    totalLiquidity: 9_820_000,
  },
  {
    id: "pool-12m",
    name: "ETH Base 12M",
    maturity: now + 60 * 60 * 24 * 365,
    apr: 5.12,
    totalLiquidity: 7_300_000,
  },
];

const demoPositions: Position[] = [
  {
    key: "pos-1",
    poolId: "pool-3m",
    L: 1200,
    kappa: 1.0,
    maturity: demoPools[0].maturity,
    fundingOwed: 312.42,
    hf: 1.34,
    im: 860.0,
    mm: 620.0,
  },
  {
    key: "pos-2",
    poolId: "pool-6m",
    L: 800,
    kappa: 1.35,
    maturity: demoPools[1].maturity,
    fundingOwed: -120.11,
    hf: 0.91,
    im: 740.0,
    mm: 520.0,
  },
];

const demoIndexLine = [
  3.6, 3.8, 3.9, 4.1, 4.0, 4.1, 4.2, 4.25, 4.2, 4.3, 4.28, 4.35,
];

const Badge: React.FC<{
  color?: "green" | "red" | "slate";
  children: React.ReactNode;
}> = ({ color = "slate", children }) => {
  const map = {
    green:
      "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/20",
    red: "bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-400/20",
  slate: "bg-slate-500/10 text-white/70 ring-1 ring-inset ring-white/10",
  } as const;
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${map[color]}`}
    >
      {children}
    </span>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string;
  sub?: string;
  good?: boolean;
  bad?: boolean;
  children?: React.ReactNode;
}> = ({ title, value, sub, good, bad, children }) => (
  <div className="group relative isolate overflow-hidden rounded-2xl bg-black backdrop-blur border border-white/30 p-4 shadow-sm hover:shadow-xl transition-shadow min-h-[148px]">
    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="flex items-center justify-between">
      <span className="text-slate-300 text-sm">{title}</span>
      {good && <Badge color="green">healthy</Badge>}
      {bad && <Badge color="red">at risk</Badge>}
    </div>
    <div className="mt-2 text-3xl font-semibold tracking-tight text-white">
      {value}
    </div>
    {sub && <div className="text-slate-400 text-sm mt-1">{sub}</div>}
    {children && <div className="mt-3">{children}</div>}
  </div>
);

const Progress: React.FC<{ value: number }> = ({ value }) => (
  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400"
      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
    />
  </div>
);


const PoolsGrid: React.FC<{
  pools: Pool[];
  onView: (p: Pool) => void;
  onAdd: (p: Pool) => void;
}> = ({ pools, onView, onAdd }) => {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {pools.map((p) => (
        <Card key={p.id}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-white font-semibold text-lg">{p.name}</div>
              <div className="text-white/60 text-sm">
                Maturity · {fmtTs(p.maturity)}
              </div>
            </div>
            <Badge color={p.frozen ? "red" : "green"}>
              {p.frozen ? "frozen" : "active"}
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <div className="text-white/60 text-xs">Base APR</div>
              <div className="text-white text-xl font-semibold">
                {fmtPct(p.apr)}
              </div>
            </div>
            <div>
              <div className="text-white/60 text-xs">Total Liquidity</div>
              <div className="text-white text-xl font-semibold">
                {fmtNum(p.totalLiquidity)}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <svg
                width="120"
                height="36"
                viewBox="0 0 120 36"
                className="opacity-80"
              >
                <path
                  d={sparkPath(demoIndexLine)}
                  fill="none"
                  stroke="url(#g)"
                  strokeWidth="2"
                />
                <defs>
                  <linearGradient id="g" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button kind="outline" onClick={() => onView(p)}>
              View
            </Button>
            <Button onClick={() => onAdd(p)}>Add Liquidity</Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

const PositionsTable: React.FC<{ positions: Position[]; pools: Pool[] }> = ({
  positions,
  pools,
}) => {
  const poolById = useMemo(() => new Map(pools.map((p) => [p.id, p])), [pools]);
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="text-white font-semibold text-lg">Your Positions</div>
        <Badge color="slate">{positions.length} open</Badge>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full table-fixed text-sm">
          <thead className="text-white/60">
            <tr className="text-left">
              <th className="py-2 pr-4 font-medium">Pool</th>
              <th className="py-2 pr-4 font-medium">L × κ (Notional)</th>
              <th className="py-2 pr-4 font-medium">Funding Owed</th>
              <th className="py-2 pr-4 font-medium">HF</th>
              <th className="py-2 pr-4 font-medium">IM / MM</th>
              <th className="py-2 pr-4 font-medium">Maturity</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => {
              const pool = poolById.get(pos.poolId);
              const notional = pos.L * pos.kappa;
              const hfPct = Math.max(0, Math.min(2, pos.hf)) * 50;
              return (
                <tr key={pos.key} className="border-t border-white/10">
                  <td className="py-3 pr-4 text-white">
                    <div className="font-medium">
                      {pool?.name ?? pos.poolId}
                    </div>
                    <div className="text-white/60">{pos.key}</div>
                  </td>
                  <td className="py-3 pr-4 text-white/90">
                    {fmtNum(notional)}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={
                        pos.fundingOwed >= 0
                          ? "text-emerald-300"
                          : "text-rose-300"
                      }
                    >
                      {pos.fundingOwed >= 0 ? "+" : ""}
                      {fmtNum(pos.fundingOwed)}
                    </span>
                  </td>
                  <td className="py-3 pr-4 w-56">
                    <div className="flex items-center gap-2">
                      <Progress value={hfPct} />
                      <span
                        className={`text-xs ${
                          pos.hf >= 1 ? "text-emerald-300" : "text-rose-300"
                        }`}
                      >
                        {pos.hf.toFixed(2)}x
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-white/90">
                    {fmtNum(pos.im)} / {fmtNum(pos.mm)}
                  </td>
                  <td className="py-3 pr-4 text-white/60">
                    {fmtTs(pos.maturity)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const HealthPanel: React.FC<{ positions: Position[] }> = ({ positions }) => {
  const equity = positions.reduce(
    (s, p) => s + (p.fundingOwed - p.im * 0.1),
    0
  );
  const im = positions.reduce((s, p) => s + p.im, 0);
  const mm = positions.reduce((s, p) => s + p.mm, 0);
  const hf = mm <= 0 ? Infinity : Math.max(0, equity) / mm;
  const hfPct = Math.max(0, Math.min(2, hf)) * 50;
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Health Factor"
        value={hf === Infinity ? "∞" : `${hf.toFixed(2)}x`}
        good={hf >= 1}
        bad={hf < 1}
      >
        <Progress value={hfPct} />
      </StatCard>
      <StatCard
        title="Equity (token1)"
        value={fmtNum(equity)}
        sub="Sum of collateral value minus debt"
      />
      <StatCard title="Initial Margin (IM)" value={fmtNum(im)} />
      <StatCard title="Maintenance Margin (MM)" value={fmtNum(mm)} />
    </div>
  );
};

export default function App() {
  const [pools] = useState<Pool[]>(demoPools);
  const [positions] = useState<Position[]>(demoPositions);
  const [activePool, setActivePool] = useState<Pool | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  return (
  <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0" style={{
        background:
          "url('https://www.transparenttextures.com/patterns/asfalt-light.png'), radial-gradient(60% 40% at 70% 0%, rgba(34,211,238,0.08), transparent 60%),\n           radial-gradient(45% 35% at 10% 20%, rgba(245, 158, 11, 0.08), transparent 60%),\n           radial-gradient(40% 50% at 50% 100%, rgba(16,185,129,0.06), transparent 60%)",
        backgroundRepeat: 'repeat',
        backgroundSize: '160px 160px',
        opacity: 0.6,
        mixBlendMode: 'normal'
      }} />

      <header className="sticky top-0 z-20 border-b border-white/10 backdrop-blur bg-slate-950/70 supports-[backdrop-filter]:bg-slate-950/60">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 p-[2px]">
              <div className="h-full w-full rounded-[10px] bg-slate-950" />
            </div>
            <div>
              <div className="text-white font-semibold leading-tight">
                IRS on Uniswap v4
              </div>
              <div className="text-xs text-white/60 -mt-0.5">
                fixed vs floating · prototype
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              <Button kind="ghost" className="hidden sm:inline-flex">
                Docs
              </Button>
              <Button kind="ghost" className="hidden sm:inline-flex">
                GitHub
              </Button>
            </div>
            <ConnectWalletButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <HealthPanel positions={positions} />

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">ETH Base Index</div>
                <div className="text-slate-400 text-sm">
                  EWMA · deviation clamped
                </div>
              </div>
              <Badge color="slate">live</Badge>
            </div>
            <div className="mt-4">
              <svg
                width="100%"
                height="84"
                viewBox="0 0 320 84"
                className="opacity-90"
              >
                <path
                  d={sparkPath(demoIndexLine, 320, 84, 8)}
                  fill="none"
                  stroke="url(#gi)"
                  strokeWidth="3"
                />
                <defs>
                  <linearGradient id="gi" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <div className="text-slate-400">Smoothed APR</div>
              <div className="text-white font-semibold">
                {fmtPct(demoIndexLine.at(-1) ?? 4.2)}
              </div>
            </div>
          </Card>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-lg font-semibold">Tenor Pools</h2>
            <div className="text-sm text-slate-400">
              select a pool to provide/modify liquidity
            </div>
          </div>
          <PoolsGrid
            pools={pools}
            onView={(p) => setActivePool(p)}
            onAdd={(p) => {
              setActivePool(p);
              setShowAdd(true);
            }}
          />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-lg font-semibold">Portfolio</h2>
            <div className="text-sm text-slate-400">
              funding settles in token1 via router
            </div>
          </div>
          <PositionsTable positions={positions} pools={pools} />
        </section>
      </main>

      {showAdd && activePool && (
        <div
          className="fixed inset-0 z-30 grid place-items-center bg-black/60 p-4"
          role="dialog"
          aria-modal
        >
          <div className="w-full max-w-lg rounded-2xl bg-slate-950 border border-white/10 p-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-white font-semibold text-lg">
                  Add Liquidity
                </div>
                <div className="text-white/60 text-sm">
                  {activePool.name} · Matures {fmtTs(activePool.maturity)}
                </div>
              </div>
              <button
                onClick={() => setShowAdd(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-white/70 text-sm">Liquidity (L)</span>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  className="mt-1 w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                />
              </label>
              <label className="block">
                <span className="text-white/70 text-sm">Scale (κ)</span>
                <input
                  type="number"
                  placeholder="e.g. 1.25"
                  className="mt-1 w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                />
              </label>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-900 border border-white/10 p-3">
                <div className="text-xs text-white/60">Preview Notional</div>
                <div className="text-white text-xl font-semibold">—</div>
              </div>
              <div className="rounded-xl bg-slate-900 border border-white/10 p-3">
                <div className="text-xs text-white/60">IM Estimate</div>
                <div className="text-white text-xl font-semibold">—</div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <Button kind="outline" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowAdd(false)}>Confirm</Button>
            </div>
          </div>
        </div>
      )}

      {activePool && !showAdd && (
        <div className="fixed bottom-4 inset-x-4 z-20 sm:inset-x-auto sm:right-4 sm:w-[420px]">
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-white font-semibold">
                  {activePool.name}
                </div>
                <div className="text-white/60 text-sm">
                  APR {fmtPct(activePool.apr)} · Matures{" "}
                  {fmtTs(activePool.maturity)}
                </div>
              </div>
              <Button kind="ghost" onClick={() => setActivePool(null)}>
                Close
              </Button>
            </div>
            <div className="mt-3 text-sm text-white/70">
              This pool accrues funding using the EWMA-smoothed ETH base rate
              and settles in token1 via the Router. New swaps/adds are blocked
              after maturity.
            </div>
            <div className="mt-3 flex gap-2">
              <Button kind="outline" onClick={() => setShowAdd(true)}>
                Add Liquidity
              </Button>
              <Button>Open Swap</Button>
            </div>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
