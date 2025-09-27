import React, { useMemo, useRef, useState, useEffect } from 'react'
import { sparkPath } from '../utils/spark'

type Props = {
  data: number[]
  width?: number
  height?: number
  padding?: number
}

export default function InteractiveSpark({ data, width = 320, height = 96, padding = 8 }: Props) {
  const ref = useRef<SVGSVGElement | null>(null)
  const [hoverX, setHoverX] = useState<number | null>(null)
  const [lockedIdx, setLockedIdx] = useState<number | null>(null)

  const path = useMemo(() => sparkPath(data, width, height, padding), [data, width, height, padding])

  // compute points for hover mapping
  const points = useMemo(() => {
    if (!data.length) return [] as { x: number; y: number; v: number }[]
    const min = Math.min(...data)
    const max = Math.max(...data)
    const w = width - padding * 2
    const h = height - padding * 2
    const scaleX = w / (data.length - 1 || 1)
    const scaleY = max === min ? 0 : h / (max - min)
    return data.map((v, i) => {
      const x = padding + i * scaleX
      const y = padding + (max - v) * scaleY
      return { x, y, v }
    })
  }, [data, width, height, padding])

  const handleMove = (e: React.MouseEvent) => {
    const svg = ref.current
    if (!svg || !points.length) return
    const rect = svg.getBoundingClientRect()
    const x = e.clientX - rect.left
    // clamp
    const clamped = Math.max(padding, Math.min(x, width - padding))
    if (lockedIdx == null) setHoverX(clamped)
  }

  const handleLeave = () => setHoverX(null)

  // click to lock / unlock tooltip
  const handleClick = (e: React.MouseEvent) => {
    if (!points.length) return
    const svg = ref.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const x = e.clientX - rect.left
    const clamped = Math.max(padding, Math.min(x, width - padding))
    // find nearest index
    let best = 0
    let bestDist = Infinity
    for (let i = 0; i < points.length; i++) {
      const d = Math.abs(points[i].x - clamped)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    }
    if (lockedIdx === best) setLockedIdx(null)
    else setLockedIdx(best)
  }

  // touch support
  const handleTouch = (e: React.TouchEvent) => {
    if (!points.length) return
    const svg = ref.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const t = e.touches[0]
    const x = t.clientX - rect.left
    const clamped = Math.max(padding, Math.min(x, width - padding))
    // set hover and lock for touch
    let best = 0
    let bestDist = Infinity
    for (let i = 0; i < points.length; i++) {
      const d = Math.abs(points[i].x - clamped)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    }
    setLockedIdx(best)
  }

  // find nearest point index
  const idx = useMemo(() => {
    const sourceX = lockedIdx != null ? points[lockedIdx]?.x ?? null : hoverX
    if (sourceX == null || !points.length) return -1
    let best = 0
    let bestDist = Infinity
    for (let i = 0; i < points.length; i++) {
      const d = Math.abs(points[i].x - sourceX)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    }
    return best
  }, [hoverX, points, lockedIdx])

  const hovered = idx >= 0 ? points[idx] : null

  // keyboard navigation: left/right to move locked index
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      if (!points.length) return
      e.preventDefault()
      if (lockedIdx == null) {
        setLockedIdx(0)
        return
      }
      if (e.key === 'ArrowLeft') setLockedIdx(Math.max(0, lockedIdx - 1))
      if (e.key === 'ArrowRight') setLockedIdx(Math.min(points.length - 1, lockedIdx + 1))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lockedIdx, points])

  return (
    <div className="relative w-full" style={{ width }}>
      <svg
        ref={ref}
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onClick={handleClick}
        onTouchStart={handleTouch}
        className="block"
      >
        <defs>
          <linearGradient id="ispark" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="iarea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {/* area fill: take the same path and close to bottom */}
        {data.length > 0 && (
          <path d={`${path} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`} fill="url(#iarea)" />
        )}

        {/* line */}
        <path d={path} fill="none" stroke="url(#ispark)" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />

        {/* highlight point */}
        {hovered && (
          <g>
            <line x1={hovered.x} x2={hovered.x} y1={padding} y2={height - padding} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
            <circle cx={hovered.x} cy={hovered.y} r={4.5} fill="#10b981" stroke="#0f172a" strokeWidth={1} />
          </g>
        )}
      </svg>

      {/* tooltip */}
      {hovered && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 bg-black/90 text-white text-xs rounded py-1 px-2 border border-white/10"
          style={{ left: hovered.x, top: -8 }}
        >
          {hovered.v}%
        </div>
      )}
    </div>
  )
}
