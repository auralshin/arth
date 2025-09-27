export const fmtNum = (n: number) =>
  Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n)

export const fmtPct = (p: number) => `${p.toFixed(2)}%`

export const fmtTs = (t: number) =>
  new Date(t * 1000).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit"
  })
