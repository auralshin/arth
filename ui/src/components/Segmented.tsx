export default function Segmented({
  value, onChange, options
}: { value: string; onChange: (v: string) => void; options: {label: string; value: string}[] }) {
  return (
    <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
      {options.map((o) => {
        const active = value === o.value
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={[
              "px-3 py-1.5 text-sm rounded-lg transition",
              active ? "bg-white text-slate-900 font-medium shadow-sm" : "text-white/80 hover:bg-white/10"
            ].join(" ")}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
