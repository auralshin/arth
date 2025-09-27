import Card from "../components/Card";
import { fmtPct, fmtTs } from "../utils/format";
import { useBaseIndex } from "../hooks/useContracts";
import InteractiveSpark from "../components/InteractiveSpark";
import { demoIndexLine } from "../data/demo";

export default function Oracle() {
  const { ratePerSecond, cumulative, lastUpdate, frozen, isLive } = useBaseIndex();

  const currentAPR = ratePerSecond 
    ? Number(ratePerSecond) / 1e18 * 365.25 * 24 * 3600 * 100
    : demoIndexLine.at(-1) ?? 4.2;

  const cumulativeFormatted = cumulative 
    ? Number(cumulative) / 1e18
    : 0;

  const lastUpdateTime = lastUpdate 
    ? new Date(Number(lastUpdate) * 1000)
    : new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">ETH Base Index Oracle</h1>
        <p className="mt-2 text-white/60">
          EWMA-smoothed ETH base rate with deviation clamping for IRS funding calculations
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-sm text-white/70">Current APR</div>
          <div className="mt-1 text-2xl font-semibold">{fmtPct(currentAPR)}</div>
          <div className="text-xs text-white/50 mt-1">
            {isLive ? '🟢 Live' : '🔴 Paused'}
          </div>
        </Card>

        <Card>
          <div className="text-sm text-white/70">Rate Per Second</div>
          <div className="mt-1 text-2xl font-semibold">
            {ratePerSecond ? (Number(ratePerSecond) / 1e18).toFixed(8) : 'N/A'}
          </div>
          <div className="text-xs text-white/50 mt-1">Wei per second</div>
        </Card>

        <Card>
          <div className="text-sm text-white/70">Cumulative</div>
          <div className="mt-1 text-2xl font-semibold">
            {cumulativeFormatted.toFixed(4)}
          </div>
          <div className="text-xs text-white/50 mt-1">Total accumulated</div>
        </Card>

        <Card>
          <div className="text-sm text-white/70">Last Update</div>
          <div className="mt-1 text-lg font-semibold">
            {fmtTs(Math.floor(lastUpdateTime.getTime() / 1000))}
          </div>
          <div className="text-xs text-white/50 mt-1">
            {lastUpdateTime.toLocaleString()}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-white font-semibold text-lg">Rate History</div>
            <div className="text-white/60 text-sm">
              EWMA-smoothed base rate over time
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isLive 
              ? 'bg-green-500/10 text-green-400 ring-1 ring-green-500/20' 
              : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
          }`}>
            {isLive ? 'Live Oracle' : 'Oracle Paused'}
          </span>
        </div>
        
        <div className="mt-4">
          <InteractiveSpark data={demoIndexLine} width={640} height={200} padding={20} />
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
            <div className="text-sm text-white/70 mb-2">Oracle Status</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Frozen:</span>
                <span className="text-white">{frozen ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Active:</span>
                <span className="text-white">{isLive ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Smoothing:</span>
                <span className="text-white">EWMA</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
            <div className="text-sm text-white/70 mb-2">Rate Information</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Precision:</span>
                <span className="text-white">18 decimals</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Update Frequency:</span>
                <span className="text-white">Continuous</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Deviation Cap:</span>
                <span className="text-white">Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="text-white font-semibold text-lg mb-3">About ETH Base Index</div>
        <div className="space-y-3 text-sm text-white/80">
          <p>
            The ETH Base Index provides a smoothed, deviation-capped interest rate used 
            for funding calculations in the IRS protocol. It uses an Exponentially 
            Weighted Moving Average (EWMA) to reduce volatility while maintaining 
            responsiveness to market conditions.
          </p>
          <p>
            The oracle accumulates funding continuously, with the rate per second 
            determining how much funding accrues for position holders. Fixed rate 
            payers benefit when the base rate is below their fixed rate, while 
            floating rate payers benefit when it's above.
          </p>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/60">
            <strong>Note:</strong> Oracle data is fetched from the deployed contract. 
            Historical data shown is for demonstration purposes and may not reflect 
            actual on-chain history.
          </div>
        </div>
      </Card>
    </div>
  );
}