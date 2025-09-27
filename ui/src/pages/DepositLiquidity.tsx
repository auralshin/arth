import { useState, useMemo } from "react";
import Card from "../components/Card";
import { Button } from "../components/Button";
import Segmented from "../components/Segmented";
import { Field, TextInput, Select } from "../components/Field";
import { demoPools } from "../data/demo";
import type { Pool } from "../data/demo";
import { fmtPct, fmtNum } from "../utils/format";
import { useAccount } from "wagmi";

export default function DepositLiquidity() {
  const { isConnected } = useAccount();

  const [depositType, setDepositType] = useState<"single" | "dual">("single");
  const [poolId, setPoolId] = useState<string>(demoPools[0].id);
  const [token0Amount, setToken0Amount] = useState<string>("10000");
  const [token1Amount, setToken1Amount] = useState<string>("10000");
  const [lockPeriod, setLockPeriod] = useState<string>("30");
  const [isLoading, setIsLoading] = useState(false);

  const pool = useMemo(
    () => demoPools.find((p: Pool) => p.id === poolId)!,
    [poolId]
  );

  const token0Value = Number(token0Amount || 0);
  const token1Value = Number(token1Amount || 0);
  const totalDeposit = depositType === "single" ? token0Value : token0Value + token1Value;
  
  // Mock LP calculations
  const expectedLPTokens = totalDeposit * 0.98; // Assuming 2% slippage
  const projectedAPY = pool.apr + 1.2; // LP gets additional yield
  const dailyRewards = (totalDeposit * projectedAPY / 100) / 365;
  const lockBonus = Number(lockPeriod) > 0 ? (Number(lockPeriod) / 30) * 0.5 : 0; // 0.5% per month locked

  const handleDeposit = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Liquidity deposited successfully! (This is a demo)');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Provide Liquidity</h1>
        <div className="text-sm text-white/60">
          Earn yield by providing liquidity to IRS pools
        </div>
      </div>

      <div className="grid lg:grid-cols-[400px_1fr] gap-6">
        <Card className="p-6">
          <div className="text-white font-semibold mb-4">Deposit Configuration</div>

          <div className="space-y-4">
            <Field label="Deposit Type">
              <Segmented
                value={depositType}
                onChange={(v: string) => setDepositType(v as "single" | "dual")}
                options={[
                  { label: "Single Token", value: "single" },
                  { label: "Dual Token", value: "dual" },
                ]}
              />
            </Field>

            <Field label="Target Pool">
              <Select
                value={poolId}
                onChange={(e) => setPoolId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10"
              >
                {demoPools.map((p: Pool) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {fmtPct(p.apr)} APR
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="USDC Amount">
              <TextInput
                type="number"
                inputMode="decimal"
                placeholder="10000"
                value={token0Amount}
                onChange={(e) => setToken0Amount(e.target.value)}
                className="rounded-xl"
              />
            </Field>

            {depositType === "dual" && (
              <Field label="WETH Amount">
                <TextInput
                  type="number"
                  inputMode="decimal"
                  placeholder="10000"
                  value={token1Amount}
                  onChange={(e) => setToken1Amount(e.target.value)}
                  className="rounded-xl"
                />
              </Field>
            )}

            <Field label="Lock Period (days)" help="Optional lock for bonus rewards">
              <Select
                value={lockPeriod}
                onChange={(e) => setLockPeriod(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10"
              >
                <option value="0">No lock</option>
                <option value="30">30 days (+0.5% APY)</option>
                <option value="60">60 days (+1.0% APY)</option>
                <option value="90">90 days (+1.5% APY)</option>
                <option value="180">180 days (+3.0% APY)</option>
              </Select>
            </Field>
          </div>

          <div className="mt-6 space-y-3">
            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
              <div className="text-xs text-white/60">Expected LP Tokens</div>
              <div className="mt-1 text-xl font-semibold text-blue-400">
                {fmtNum(expectedLPTokens)}
              </div>
            </div>
            
            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
              <div className="text-xs text-white/60">Projected APY</div>
              <div className="mt-1 text-xl font-semibold text-emerald-400">
                {fmtPct(projectedAPY + lockBonus)}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
              <div className="text-xs text-white/60">Daily Rewards</div>
              <div className="mt-1 text-lg font-semibold text-yellow-400">
                ~{fmtNum(dailyRewards)} USDC
              </div>
            </div>

            {!isConnected && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                <div className="text-xs text-red-400 font-medium">Wallet Not Connected</div>
                <div className="text-xs text-white/70 mt-1">
                  Connect your wallet to provide liquidity
                </div>
              </div>
            )}
          </div>

          <Button 
            className="w-full mt-6"
            onClick={handleDeposit}
            disabled={!isConnected || isLoading}
          >
            {isLoading ? "Depositing..." : "Provide Liquidity"}
          </Button>
        </Card>

        <Card className="p-6">
          <div className="text-white font-semibold mb-4">Liquidity Analysis</div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-900/30 p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{fmtNum(totalDeposit)}</div>
                <div className="text-xs text-white/60 mt-1">Total Deposit (USDC)</div>
              </div>
              <div className="rounded-xl bg-slate-900/30 p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">{fmtPct(projectedAPY + lockBonus)}</div>
                <div className="text-xs text-white/60 mt-1">Expected APY</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-white/80 mb-2">Pool Utilization</div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full"
                    style={{ width: "67%" }}
                  ></div>
                </div>
                <div className="text-xs text-white/60 mt-1">
                  67% utilized • High demand for liquidity
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/30 p-4">
                <div className="text-sm font-medium text-white/80 mb-3">Reward Breakdown</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Base LP rewards:</span>
                    <span className="text-emerald-400">{fmtPct(projectedAPY)}</span>
                  </div>
                  {lockBonus > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Lock bonus:</span>
                      <span className="text-yellow-400">+{fmtPct(lockBonus)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-medium pt-2 border-t border-white/10">
                    <span className="text-white">Total APY:</span>
                    <span className="text-emerald-400">{fmtPct(projectedAPY + lockBonus)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-900/30 p-3">
                  <div className="text-xs text-white/60">Pool TVL</div>
                  <div className="text-lg font-semibold mt-1">
                    {fmtNum(pool.totalLiquidity)} USDC
                  </div>
                </div>
                <div className="rounded-xl bg-slate-900/30 p-3">
                  <div className="text-xs text-white/60">Your Share</div>
                  <div className="text-lg font-semibold mt-1">
                    {((totalDeposit / pool.totalLiquidity) * 100).toFixed(3)}%
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                <div className="text-sm font-medium text-blue-400 mb-2">Liquidity Provider Benefits</div>
                <div className="space-y-1 text-xs text-white/70">
                  <div>• Earn fees from all trades in the pool</div>
                  <div>• Receive additional protocol rewards</div>
                  <div>• Lock bonuses for committed capital</div>
                  <div>• Exposure to both sides of the IRS market</div>
                </div>
              </div>

              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                <div className="text-sm font-medium text-yellow-400 mb-2">Risk Considerations</div>
                <div className="space-y-1 text-xs text-white/70">
                  <div>• Impermanent loss from rate movements</div>
                  <div>• Liquidity locked if lock period selected</div>
                  <div>• Exposure to interest rate volatility</div>
                  <div>• Smart contract risk</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}