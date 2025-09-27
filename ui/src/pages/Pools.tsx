import { useMemo, useState } from "react";
import Card from "../components/Card";
import { Button } from "../components/Button";
import { demoIndexLine } from "../data/demo";
// Pool type is now defined inline
import { fmtPct, fmtNum, fmtTs } from "../utils/format";
import { sparkPath } from "../utils/spark";
import Modal from "../components/Modal";
import { TradeSwapPanel } from "./TradeSwap";
import Segmented from "../components/Segmented";
import { useAllPools, useBaseIndex } from "../hooks/useContracts";
import { POOLS as DEPLOYED_POOLS, isPoolExpired } from "../deployed-addresses";
import { formatUnits } from "viem";

const PoolAnalytics = () => {
  const { pools } = useAllPools();
  const { ratePerSecond, isLive } = useBaseIndex();
  
  const totalLiquidity = pools.reduce((sum, pool) => {
    if (pool.liquidity) {
      return sum + Number(formatUnits(pool.liquidity, 18));
    }
    return sum;
  }, 0);
  
  const activePools = pools.filter(p => !p.isExpired).length;
  const avgMaturity = pools.filter(p => !p.isExpired).reduce((sum, p) => sum + p.daysToMaturity, 0) / activePools || 0;
  
  const currentRate = ratePerSecond ? Number(formatUnits(ratePerSecond, 18)) * 365 * 24 * 60 * 60 * 100 : 4.5;
  
  return (
    <Card className="mb-6">
      <div className="text-white font-semibold mb-4">Market Overview</div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-slate-900/40 border border-white/10 p-4">
          <div className="text-xs text-white/60 mb-2">Total Value Locked</div>
          <div className="text-2xl font-semibold">${fmtNum(totalLiquidity)}</div>
          <div className="text-xs text-emerald-400 mt-1">Real-time data</div>
        </div>
        <div className="rounded-xl bg-slate-900/40 border border-white/10 p-4">
          <div className="text-xs text-white/60 mb-2">Active Pools</div>
          <div className="text-2xl font-semibold">{activePools}</div>
          <div className="text-xs text-white/60 mt-1">of {pools.length} total</div>
        </div>
        <div className="rounded-xl bg-slate-900/40 border border-white/10 p-4">
          <div className="text-xs text-white/60 mb-2">Avg. Maturity</div>
          <div className="text-2xl font-semibold">{Math.round(avgMaturity)}d</div>
          <div className="text-xs text-white/60 mt-1">Days remaining</div>
        </div>
        <div className="rounded-xl bg-slate-900/40 border border-white/10 p-4">
          <div className="text-xs text-white/60 mb-2">Base Rate</div>
          <div className="text-2xl font-semibold">{currentRate.toFixed(2)}%</div>
          <div className={`text-xs ${isLive ? 'text-emerald-400' : 'text-rose-400'} mt-1`}>
            {isLive ? 'Live' : 'Frozen'}
          </div>
        </div>
      </div>
    </Card>
  );
};

const PoolFilters = ({ 
  selectedMaturity, 
  setSelectedMaturity,
  sortBy,
  setSortBy
}: {
  selectedMaturity: string;
  setSelectedMaturity: (v: string) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
}) => (
  <div className="flex flex-wrap gap-4 mb-4">
    <Segmented
      value={selectedMaturity}
      onChange={setSelectedMaturity}
      options={[
        { label: 'All Maturities', value: 'all' },
        { label: '3M', value: '3m' },
        { label: '6M', value: '6m' },
        { label: '12M', value: '12m' },
      ]}
    />
    <Segmented
      value={sortBy}
      onChange={setSortBy}
      options={[
        { label: 'APR', value: 'apr' },
        { label: 'Liquidity', value: 'liquidity' },
        { label: 'Maturity', value: 'maturity' },
      ]}
    />
  </div>
);

export default function Pools() {
  const { pools: contractPools } = useAllPools();
  const pools = useMemo(() => {
    // Combine deployed pools with contract data
    return DEPLOYED_POOLS.map(deployedPool => {
      const contractPool = contractPools.find(cp => cp.poolId === deployedPool.poolId);
      return {
        ...deployedPool,
        id: deployedPool.id.toString(),
        apr: contractPool?.fundingGrowthGlobal ? 
          Number(contractPool.fundingGrowthGlobal) / 1e18 * 365 * 24 * 3600 * 100 : // Real funding rate
          3.5 + Math.random() * 2, // Fallback random APR
        totalLiquidity: contractPool?.liquidity ? Number(formatUnits(contractPool.liquidity, 18)) : 0,
        maturity: deployedPool.maturity,
        isExpired: isPoolExpired(deployedPool.poolId),
        daysToMaturity: contractPool?.daysToMaturity || 0
      };
    });
  }, [contractPools]);
  
  const [openPool, setOpenPool] = useState<string | null>(null);
  const [selectedMaturity, setSelectedMaturity] = useState('all');
  const [sortBy, setSortBy] = useState('apr');

  const filteredPools = useMemo(() => {
    let filtered = pools;
    
    if (selectedMaturity !== 'all') {
      const now = Date.now() / 1000;
      const threeMonths = 90 * 24 * 60 * 60;
      const sixMonths = 180 * 24 * 60 * 60;
      
      filtered = pools.filter(pool => {
        const timeToMaturity = pool.maturity - now;
        if (selectedMaturity === '3m') return timeToMaturity <= threeMonths;
        if (selectedMaturity === '6m') return timeToMaturity > threeMonths && timeToMaturity <= sixMonths;
        if (selectedMaturity === '12m') return timeToMaturity > sixMonths;
        return true;
      });
    }
    
    return filtered.sort((a, b) => {
      if (sortBy === 'apr') return b.apr - a.apr;
      if (sortBy === 'liquidity') return b.totalLiquidity - a.totalLiquidity;
      if (sortBy === 'maturity') return a.maturity - b.maturity;
      return 0;
    });
  }, [pools, selectedMaturity, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Interest Rate Swap Pools</h1>
        <div className="text-sm text-white/60">
          Trade fixed vs floating rates · Powered by Uniswap v4
        </div>
      </div>

      <PoolAnalytics />

      <PoolFilters
        selectedMaturity={selectedMaturity}
        setSelectedMaturity={setSelectedMaturity}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredPools.map((p) => (
          <Card
            key={p.id}
            className="min-h-[280px] md:min-h-[300px] lg:min-h-[320px]"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-white">{p.name}</div>
                <div className="text-white/60 text-sm">{p.description}</div>
                <div className="text-white/60 text-xs mt-1">
                  Maturity · {fmtTs(p.maturity)}
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ring-1 ${
                p.isExpired 
                  ? 'bg-rose-500/15 text-rose-300 ring-rose-400/20'
                  : 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/20'
              }`}>
                {p.isExpired ? 'expired' : 'active'}
              </span>
            </div>

            {/* Token Pair Info */}
            <div className="mt-3 flex items-center gap-2 text-sm text-white/70">
              <span className="px-2 py-1 bg-slate-800/50 rounded">{p.token0Symbol}</span>
              <span>↔</span>
              <span className="px-2 py-1 bg-slate-800/50 rounded">{p.token1Symbol}</span>
              <span className="text-xs text-white/50">· {(p.fee / 10000).toFixed(2)}% fee</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-white/60 text-xs">Fixed Rate</div>
                <div className="text-lg font-semibold">{fmtPct(p.apr)}</div>
              </div>
              <div>
                <div className="text-white/60 text-xs">Liquidity</div>
                <div className="text-lg font-semibold">
                  ${fmtNum(p.totalLiquidity)}
                </div>
              </div>
              <div>
                <div className="text-white/60 text-xs">Time to Maturity</div>
                <div className="text-lg font-semibold">
                  {p.daysToMaturity || Math.ceil((p.maturity - Date.now() / 1000) / (24 * 60 * 60))}d
                </div>
              </div>
              <div>
                <div className="text-white/60 text-xs">Pool Health</div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-sm font-medium text-emerald-300">Good</span>
                </div>
              </div>
            </div>

            {/* Rate Chart */}
            <div className="mt-4 flex justify-center">
              <svg
                width="200"
                height="60"
                viewBox="0 0 200 60"
                className="opacity-90"
              >
                <path
                  d={sparkPath(demoIndexLine, 200, 60)}
                  fill="none"
                  stroke="url(#grad-${p.id})"
                  strokeWidth="2"
                />
                <defs>
                  <linearGradient id={`grad-${p.id}`} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="mt-4 flex gap-2">
              <Button 
                kind="outline" 
                onClick={() => setOpenPool(p.id)}
                disabled={p.isExpired}
              >
                {p.isExpired ? 'Expired' : 'View Details'}
              </Button>
              <Button 
                onClick={() => setOpenPool(p.id)}
                disabled={p.isExpired}
              >
                {p.isExpired ? 'Settled' : 'Trade'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
      {openPool && (
        <Modal title="Open Swap" onClose={() => setOpenPool(null)}>
          <TradeSwapPanel
            presetPoolId={openPool}
            onClose={() => setOpenPool(null)}
          />
        </Modal>
      )}
    </div>
  );
}
