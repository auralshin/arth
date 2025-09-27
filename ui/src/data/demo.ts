export type Pool = { id: string; name: string; maturity: number; apr: number; totalLiquidity: number; frozen?: boolean }
export type Position = { key: string; poolId: string; L: number; kappa: number; maturity: number; fundingOwed: number; hf: number; im: number; mm: number }

const now = Math.floor(Date.now() / 1000)

export const demoPools: Pool[] = [
  { id: "pool-3m",  name: "ETH Base 3M",  maturity: now + 60*60*24*90,  apr: 4.21, totalLiquidity: 12_450_000 },
  { id: "pool-6m",  name: "ETH Base 6M",  maturity: now + 60*60*24*180, apr: 4.68, totalLiquidity: 9_820_000 },
  { id: "pool-12m", name: "ETH Base 12M", maturity: now + 60*60*24*365, apr: 5.12, totalLiquidity: 7_300_000 }
]

export const demoPositions: Position[] = [
  { key: "pos-1", poolId: "pool-3m", L: 1200, kappa: 1.0,  maturity: demoPools[0].maturity, fundingOwed: 312.42,  hf: 1.34, im: 860.0, mm: 620.0 },
  { key: "pos-2", poolId: "pool-6m", L: 800,  kappa: 1.35, maturity: demoPools[1].maturity, fundingOwed: -120.11, hf: 0.91, im: 740.0, mm: 520.0 }
]

export const demoIndexLine = [3.6, 3.8, 3.9, 4.1, 4.0, 4.1, 4.2, 4.25, 4.2, 4.3, 4.28, 4.35]
