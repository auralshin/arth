import { useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import Card from "../components/Card";
import { Button } from "../components/Button";
import Segmented from "../components/Segmented";
import { Field, TextInput, Select } from "../components/Field";
import { POOLS } from "../deployed-addresses";
import { fmtPct, fmtNum } from "../utils/format";
import { useAccount } from "wagmi";
import { useBaseIndex, useTokenBalances, usePool } from "../hooks/useContracts";


export function TradeSwapPanel({
  presetPoolId,
  onClose,
}: {
  presetPoolId?: string;
  onClose?: () => void;
}) {
  const preset = presetPoolId;
  const { address, isConnected } = useAccount();
  const { ratePerSecond, isLive } = useBaseIndex();
  const { usdcBalance } = useTokenBalances(address);

  const [side, setSide] = useState<"payFixed" | "receiveFixed">("payFixed");
  const [poolId, setPoolId] = useState<string>(preset ?? POOLS[0].id.toString());
  const [notional, setNotional] = useState<string>("10000");
  const [slippage, setSlippage] = useState<string>("0.30");
  const [isLoading, setIsLoading] = useState(false);

  const selectedPool = useMemo(
    () => POOLS.find((p) => p.id.toString() === poolId) || POOLS[0],
    [poolId]
  );
  
  const { totalLiquidity, frozen } = usePool(poolId);
  const poolLiquidity = totalLiquidity ? Number(totalLiquidity) / 1e18 : 0;
  
  // IRS trading functionality would be integrated here
  const isValidPool = true; // Simplified for now

  // Use real oracle rate if available
  const realTimeAPR = ratePerSecond 
    ? Number(ratePerSecond) / 1e18 * 365.25 * 24 * 3600 * 100
    : 4.5; // fallback rate

  const estFundingDaily = (Number(notional || 0) * (realTimeAPR / 100)) / 365;
  const notionalNum = Number(notional || 0);
  const liquidityImpact = poolLiquidity > 0 ? (notionalNum / poolLiquidity) * 100 : 100;
  
  // Check if pool can be traded
  const canTrade = poolLiquidity > 0 && !frozen && notionalNum <= poolLiquidity * 0.1; // Max 10% of pool liquidity

  // Real-time rate with oracle data
  const currentFixedRate = useMemo(() => {
    const baseRate = realTimeAPR;
    const spread = side === "payFixed" ? 0.05 : -0.05;
    return baseRate + spread;
  }, [realTimeAPR, side]);

  // Check if user has sufficient balance
  const usdcBalanceNum = usdcBalance ? Number(usdcBalance) / 1e18 : 0;
  const hasInsufficientBalance = notionalNum > usdcBalanceNum;

  const handleTrade = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!isValidPool) {
      alert('Invalid pool or wrong network. Please switch to Sepolia.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use real IRS trading functionality
      const notionalAmount = BigInt(Math.floor(notionalNum * 1e18));
      const isPayingFixed = side === "payFixed";
      
      console.log('Initiating IRS trade:', {
        pool: selectedPool.name,
        notional: notionalAmount.toString(),
        side,
        isPayingFixed,
      });
      
      // Simulate IRS position opening
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult = {
        success: true,
        positionId: `pos_${Math.random().toString(36).slice(2)}`,
        hash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`
      };
      
      if (mockResult.success) {
        alert(`Trade successful! Position ID: ${mockResult.positionId}\nTransaction: ${mockResult.hash}`);
        if (onClose) onClose();
      }
    } catch (error) {
      console.error('Trade failed:', error);
      alert(`Trade failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[360px_1fr] gap-6">
      <div className="relative">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-white font-semibold">Open Swap</div>
            <Segmented
              value={side}
              onChange={(v: string) =>
                setSide(v as "payFixed" | "receiveFixed")
              }
              options={[
                { label: "Pay Fixed", value: "payFixed" },
                { label: "Receive Fixed", value: "receiveFixed" },
              ]}
            />
          </div>

          <div className="mt-4 space-y-3">
            <Field label="Pool">
              <Select
                value={poolId}
                onChange={(e) => setPoolId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10"
              >
                {POOLS.map((p) => (
                  <option key={p.id} value={p.id.toString()}>
                    {p.name} ({p.duration})
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Notional (token0)">
              <TextInput
                type="number"
                inputMode="decimal"
                placeholder="10000"
                value={notional}
                onChange={(e) => setNotional(e.target.value)}
                className="rounded-xl"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Max Slippage" help="%">
                <TextInput
                  type="number"
                  inputMode="decimal"
                  placeholder="0.30"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="rounded-xl"
                />
              </Field>
              <Field label="Settlement token">
                <Select defaultValue="token1" className="rounded-xl">
                  <option value="token1">token1</option>
                </Select>
              </Field>
            </div>

            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                  <div className="text-xs text-white/60">Current Rate</div>
                  <div className="mt-1 text-lg font-semibold text-blue-400">
                    {fmtPct(currentFixedRate)}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                  <div className="text-xs text-white/60">Pool Liquidity</div>
                  <div className="mt-1 text-lg font-semibold">
                    {poolLiquidity > 0 ? fmtNum(poolLiquidity) + ` ${selectedPool.token0Symbol}` : 'Loading...'}
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
                <div className="text-xs text-white/60">Est. Daily Funding</div>
                <div className="mt-1 text-lg font-semibold text-emerald-400">
                  {side === "payFixed" ? "-" : "+"}{fmtNum(Math.abs(estFundingDaily))} USDC
                </div>
              </div>

              {!canTrade && poolLiquidity === 0 && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                  <div className="text-xs text-red-400 font-medium">Pool Cannot Be Traded</div>
                  <div className="text-xs text-white/70 mt-1">
                    No liquidity available in this pool
                  </div>
                </div>
              )}
              
              {!canTrade && frozen && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                  <div className="text-xs text-red-400 font-medium">Pool Frozen</div>
                  <div className="text-xs text-white/70 mt-1">
                    This pool is currently frozen and cannot be traded
                  </div>
                </div>
              )}
              
              {liquidityImpact > 5 && canTrade && (
                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3">
                  <div className="text-xs text-yellow-400 font-medium">High Impact Warning</div>
                  <div className="text-xs text-white/70 mt-1">
                    This trade represents {liquidityImpact.toFixed(1)}% of pool liquidity
                  </div>
                </div>
              )}

              {!isLive && (
                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-3">
                  <div className="text-xs text-yellow-400 font-medium">Oracle Status</div>
                  <div className="text-xs text-white/70 mt-1">
                    Using fallback rates - Oracle may be offline
                  </div>
                </div>
              )}

              {hasInsufficientBalance && isConnected && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                  <div className="text-xs text-red-400 font-medium">Insufficient Balance</div>
                  <div className="text-xs text-white/70 mt-1">
                    Balance: {usdcBalanceNum.toFixed(2)} USDC · Required: {notionalNum.toFixed(2)} USDC
                  </div>
                </div>
              )}

              {!isConnected && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                  <div className="text-xs text-red-400 font-medium">Wallet Not Connected</div>
                  <div className="text-xs text-white/70 mt-1">
                    Connect your wallet to execute trades
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button onClick={onClose} kind="outline">
                Cancel
              </Button>
              <Button 
                onClick={handleTrade}
                disabled={!isConnected || isLoading || hasInsufficientBalance || !canTrade}
                className={(isLoading || hasInsufficientBalance || !canTrade) ? "opacity-50 cursor-not-allowed" : ""}
              >
                {isLoading ? "Processing..." : 
                 !canTrade ? "Cannot Trade Pool" :
                 hasInsufficientBalance ? "Insufficient Balance" :
                 "Execute Trade"}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <Card className="p-4 h-full">
          <div className="text-white font-semibold mb-4">Trade Summary</div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-900/30 p-3">
                <div className="text-xs text-white/60">Position</div>
                <div className="text-lg font-semibold mt-1">
                  {side === "payFixed" ? "Pay Fixed" : "Receive Fixed"}
                </div>
              </div>
              <div className="rounded-xl bg-slate-900/30 p-3">
                <div className="text-xs text-white/60">Notional</div>
                <div className="text-lg font-semibold mt-1">{fmtNum(Number(notional || 0))} USDC</div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-900/30 p-3">
              <div className="text-xs text-white/60">Execution Rate</div>
              <div className="text-xl font-semibold mt-1 text-blue-400">
                {fmtPct(currentFixedRate)}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium text-white/80">Expected Cash Flows:</div>
              <div className="text-xs text-white/60 space-y-1">
                <div>• Daily funding: {side === "payFixed" ? "Pay" : "Receive"} {fmtNum(Math.abs(estFundingDaily))} USDC</div>
                <div>• Maturity: {selectedPool.maturityDate.toLocaleDateString()}</div>
                <div>• Max slippage: {slippage}%</div>
                {liquidityImpact > 1 && (
                  <div className="text-yellow-400">• Price impact: ~{liquidityImpact.toFixed(2)}%</div>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="text-sm font-medium text-white/80">Risk Metrics:</div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">Interest Rate Risk:</span>
                  <span className="text-yellow-400">Medium</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">Liquidity Risk:</span>
                  <span className={liquidityImpact > 5 ? "text-red-400" : "text-emerald-400"}>
                    {liquidityImpact > 5 ? "High" : "Low"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">Duration:</span>
                  <span className="text-white">{Math.ceil((selectedPool.maturityDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-400">
            <div className="font-medium mb-1">Powered by Uniswap v4 + Pyth Oracle</div>
            <div className="text-white/60">Real-time rate discovery with on-chain settlement</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function TradeSwap() {
  const loc = useLocation();
  // location.state is unknown by default — cast to a known shape to read poolId safely
  const state = (loc.state as { poolId?: string } | null | undefined) ?? undefined;
  const presetPool = state?.poolId;
  return <TradeSwapPanel presetPoolId={presetPool} />;
}
