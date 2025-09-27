import { useMemo } from "react";
import Card from "../components/Card";
import HedgeButton from "../components/HedgeButton";
import { fmtNum, fmtTs } from "../utils/format";
import { useUserPositions, type EnhancedPosition } from "../hooks/useContracts";
import { useAccount } from "wagmi";
import { POOLS, getPoolById } from "../deployed-addresses";

export default function MyPositions() {
  const { address } = useAccount();
  const { positions, hasRealPositions } = useUserPositions(address);
  
  const poolsById = useMemo(
    () => new Map(POOLS.map((p) => [p.id.toString(), p])),
    []
  );

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white font-semibold text-lg">Your Positions</div>
          {!hasRealPositions && positions.length > 0 && (
            <div className="text-xs text-yellow-400 mt-1">
              📍 Demo position shown - Open real trades to see actual positions
            </div>
          )}
        </div>
        <span className="px-2 py-1 rounded-full text-xs bg-slate-500/10 text-white/70 ring-1 ring-white/10">
          {positions.length} open
        </span>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full table-fixed text-sm">
          <thead className="text-white/60">
            <tr className="text-left">
              <th className="py-2 pr-4 font-medium">Pool</th>
              <th className="py-2 pr-4 font-medium">Notional</th>
              <th className="py-2 pr-4 font-medium">Funding Owed</th>
              <th className="py-2 pr-4 font-medium">IM / MM</th>
              <th className="py-2 pr-4 font-medium">Maturity</th>
              <th className="py-2 pr-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos: EnhancedPosition) => {
              const pool = poolsById.get(pos.poolId.toString()) || getPoolById(pos.poolId);
              const notional = pos.L * pos.kappa;
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
                  <td className="py-3 pr-4 text-white/90">
                    {fmtNum(pos.im)} / {fmtNum(pos.mm)}
                  </td>
                  <td className="py-3 pr-4 text-white/60">
                    {fmtTs(pos.maturity)}
                  </td>
                  <td className="py-3 pr-4">
                    <HedgeButton position={pos} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
