import React from 'react'

export function Field({
  label, help, children
}: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/80">{label}</span>
        {help && <span className="text-xs text-white/50">{help}</span>}
      </div>
      <div className="mt-1">{children}</div>
    </label>
  )
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-white",
        "focus:outline-none focus:ring-2 focus:ring-emerald-400/40",
        props.className || ""
      ].join(" ")}
    />
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={[
        "w-full rounded-xl bg-slate-900 border border-white/10 px-3 py-2 text-white",
        "focus:outline-none focus:ring-2 focus:ring-emerald-400/40",
        props.className || ""
      ].join(" ")}
    />
  )
}
