export const sparkPath = (values: number[], width = 120, height = 36, pad = 6) => {
  if (!values.length) return ""
  const min = Math.min(...values)
  const max = Math.max(...values)
  const w = width - pad * 2
  const h = height - pad * 2
  const scaleX = w / (values.length - 1 || 1)
  const scaleY = max === min ? 0 : h / (max - min)
  return values
    .map((v, i) => {
      const x = pad + i * scaleX
      const y = pad + (max - v) * scaleY
      return `${i === 0 ? "M" : "L"}${x},${y}`
    })
    .join(" ")
}
