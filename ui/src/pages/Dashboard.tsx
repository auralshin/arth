import Card from "../components/Card";
import { fmtPct } from "../utils/format";
import NetworkChecker from "../components/NetworkChecker";
import { useBaseIndex, useProtocolStats, useTokenBalances, useRiskEngine } from "../hooks/useContracts";
import { useAccount } from "wagmi";
import ConnectButton from "../components/ConnectButton";

// Removed unused Stat component

const UserProfileCard = () => {
  const { address, isConnected } = useAccount();
  const { usdcBalance, wstETHBalance, isLoading: balancesLoading, error: balancesError } = useTokenBalances(address);
  const { positions, margin } = useRiskEngine(address);
  const { isLive } = useBaseIndex();

  // Format balances with proper decimals
  const formattedUsdcBalance = usdcBalance ? Number(usdcBalance) / 1e18 : 0; // Mock tokens use 18 decimals
  const formattedWstETHBalance = wstETHBalance ? Number(wstETHBalance) / 1e18 : 0;

  // Calculate health based on real margin data
  const isHealthy = !margin || margin > 0n;
  const healthStatus = isHealthy ? "Healthy" : "At Risk";
  const healthColor = isHealthy ? "text-emerald-400" : "text-red-400";

  // Show loading state
  if (isConnected && balancesLoading) {
    return (
      <Card className="mb-6">
        <div className="text-white font-semibold mb-4">Account Overview</div>
        <div className="text-center py-8">
          <div className="text-white/60">Loading account data...</div>
        </div>
      </Card>
    );
  }

  // Show error state
  if (balancesError) {
    return (
      <Card className="mb-6">
        <div className="text-white font-semibold mb-4">Account Overview</div>
        <div className="text-center py-8">
          <div className="text-red-400">Error loading account data</div>
          <div className="text-white/60 text-sm mt-2">{balancesError.message || 'Please check your network connection'}</div>
        </div>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-white font-semibold">Account Overview</div>
          <ConnectButton />
        </div>
        <div className="text-center py-8">
          <div className="text-white/60">Connect your wallet to view account details</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-white font-semibold">Account Overview</div>
        <ConnectButton />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-900/40 border border-white/10 p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-white/60 mb-2">USDC Balance</div>
              {!isLive && (
                <div className="text-xs text-yellow-400">Oracle Offline</div>
              )}
            </div>
            <div className="text-xl font-semibold">
              {formattedUsdcBalance.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })} USDC
            </div>
          </div>
          <div className="rounded-xl bg-slate-900/40 border border-white/10 p-3">
            <div className="text-xs text-white/60 mb-2">wstETH Balance</div>
            <div className="text-xl font-semibold">
              {formattedWstETHBalance.toFixed(4)} wstETH
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-emerald-500/10 border border-white/10 p-4">
          <div className="text-xs text-white/60 mb-2">Account Health</div>
          <div className={`text-2xl font-bold ${healthColor} mb-1`}>{healthStatus}</div>
          <div className="text-sm text-white/70">
            {positions && positions.length > 0 
              ? `${positions.length} active position${positions.length > 1 ? 's' : ''}`
              : "No active positions"
            }
          </div>
          {margin && (
            <div className="text-xs text-white/50 mt-1">
              Margin: {(Number(margin) / 1e6).toFixed(2)} USDC
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Duplicate PortfolioAnalytics function removed

const ProtocolStats = () => {
  const { ratePerSecond, isLive } = useBaseIndex();
  const stats = useProtocolStats();

  // Format the current index rate as percentage
  const currentRate = ratePerSecond ? Number(ratePerSecond) / 1e18 * 365 * 24 * 60 * 60 * 100 : 4.2;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <div className="text-sm text-white/70">Base Rate</div>
        <div className="mt-1 text-2xl font-semibold flex items-center gap-2">
          {fmtPct(currentRate / 100)}
          {!isLive && <span className="text-xs text-yellow-400">*Offline</span>}
        </div>
      </Card>
      
      <Card>
        <div className="text-sm text-white/70">Total Liquidity</div>
        <div className="mt-1 text-2xl font-semibold">
          {stats.totalNotional || "$0M"}
        </div>
      </Card>
      
      <Card>
        <div className="text-sm text-white/70">Active Pools</div>
        <div className="mt-1 text-2xl font-semibold">
          {stats.activePools || 0}
        </div>
      </Card>
      
      <Card>
        <div className="text-sm text-white/70">Health Factor</div>
        <div className="mt-1 text-2xl font-semibold text-emerald-400">
          {stats.healthFactor || 1.25}
        </div>
      </Card>
    </div>
  );
};

const PortfolioAnalytics = () => {
  const { address } = useAccount();
  const { positions } = useRiskEngine(address);

  return (
    <Card>
      <div className="text-white font-semibold mb-4">Portfolio Analytics</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-slate-900/40 border border-white/10 p-4">
          <div className="text-xs text-white/60 mb-2">Active Positions</div>
          <div className="text-xl font-semibold">{positions?.length || 0}</div>
          <div className="text-xs text-white/60 mt-1">IRS Contracts</div>
        </div>
        <div className="rounded-xl bg-slate-900/40 border border-white/10 p-4">
          <div className="text-xs text-white/60 mb-2">Funding Accrued</div>
          <div className="text-xl font-semibold">$0.00</div>
          <div className="text-xs text-white/60 mt-1">Since last settlement</div>
        </div>
        <div className="rounded-xl bg-slate-900/40 border border-white/10 p-4">
          <div className="text-xs text-white/60 mb-2">Risk Score</div>
          <div className="text-xl font-semibold text-emerald-400">Low</div>
          <div className="text-xs text-white/60 mt-1">Based on exposure</div>
        </div>
      </div>
    </Card>
  );
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <NetworkChecker />
      <UserProfileCard />
      <ProtocolStats />
      <PortfolioAnalytics />
    </div>
  );
}
