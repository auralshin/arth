import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import { Button } from '../components/Button'
import { demoPools, demoIndexLine } from '../data/demo'
import type { Pool } from '../data/demo'
import { fmtPct, fmtTs } from '../utils/format'
import { sparkPath } from '../utils/spark'

export default function PoolView() {
  const { poolId } = useParams()
  const nav = useNavigate()
  const pool = useMemo(() => demoPools.find((p: Pool) => p.id === poolId), [poolId])

  if (!pool) return <div>Pool not found.</div>

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xl font-semibold">{pool.name}</div>
          <div className="text-white/60">APR {fmtPct(pool.apr)} · Matures {fmtTs(pool.maturity)}</div>
        </div>
        <div className="flex gap-2">
          <Button kind="outline" onClick={() => nav('/trade', { state: { poolId: pool.id }})}>Open Swap</Button>
          <Button onClick={() => nav('/trade', { state: { poolId: pool.id, tab: 'liquidity' }})}>Add Liquidity</Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="text-white/80 text-sm">Index trend</div>
        <svg width="100%" height="120" viewBox="0 0 320 120" className="mt-2 opacity-90">
          <path d={sparkPath(demoIndexLine, 320, 120, 8)} fill="none" stroke="url(#gi)" strokeWidth="3" />
          <defs>
            <linearGradient id="gi" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
        </svg>
      </Card>

      <Card>
        <div className="text-white font-semibold">About this pool</div>
        <p className="mt-2 text-sm text-white/80">
          Funding accrues continuously (floating - fixed), integrated over time. Swaps/adds are blocked post-maturity.
          Settlement nets in token1 via the Router.
        </p>
      </Card>
    </div>
  )
}
