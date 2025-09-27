import { NavLink } from 'react-router-dom'

const LinkItem = ({ to, label, icon }: { to: string; label: string; icon?: React.ReactNode }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      [
        "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
        isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"
      ].join(" ")
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
)

const Dot = () => <span className="h-1.5 w-1.5 rounded-full bg-white/50" />

export default function SideNav() {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 backdrop-blur">
      <div className="mb-2 px-2 text-xs uppercase tracking-wide text-white/50">Navigate</div>
      <div className="flex flex-col gap-1">
        <LinkItem to="/dashboard" label="Dashboard" icon={<Dot />} />
        <LinkItem to="/pools" label="Pools" icon={<Dot />} />
        <LinkItem to="/analytics" label="Analytics" icon={<Dot />} />
      </div>
      
      <div className="mt-4 mb-2 px-2 text-xs uppercase tracking-wide text-white/50">Trading</div>
      <div className="flex flex-col gap-1">
        <LinkItem to="/traders" label="IRS Trading" icon={<Dot />} />
        <LinkItem to="/trade" label="Swap Rates" icon={<Dot />} />
        <LinkItem to="/hedge" label="Hedge Risk" icon={<Dot />} />
      </div>
      
      <div className="mt-4 mb-2 px-2 text-xs uppercase tracking-wide text-white/50">Liquidity</div>
      <div className="flex flex-col gap-1">
        <LinkItem to="/liquidity" label="LP Dashboard" icon={<Dot />} />
        <LinkItem to="/deposit" label="Provide Liquidity" icon={<Dot />} />
      </div>
      
      <div className="mt-4 mb-2 px-2 text-xs uppercase tracking-wide text-white/50">System</div>
      <div className="flex flex-col gap-1">
        <LinkItem to="/oracle" label="Oracle" icon={<Dot />} />
        <LinkItem to="/settings" label="Settings" icon={<Dot />} />
      </div>
    </div>
  )
}
