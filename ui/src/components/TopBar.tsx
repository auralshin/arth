import ConnectWalletButton from './ConnectButton'
import { Button } from './Button'
import { Link, useLocation } from 'react-router-dom'

export default function TopBar() {
  const loc = useLocation()
  const isLanding = loc.pathname === '/' || loc.pathname === '/landing'

  return (
    <header className={`sticky top-0 z-20 border-b border-white/30 backdrop-blur supports-[backdrop-filter]:bg-black`}>
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3" aria-label="Go to landing">
            <img src="/arth.png" alt="Arth logo" className="h-9 w-9 rounded-xl object-cover" />
            <div className="leading-tight">
              <div className="text-white font-semibold">Arth — IRS on Uniswap v4</div>
              <div className="text-xs text-white/60 -mt-0.5">fixed vs floating · prototype</div>
            </div>
          </Link>
        </div>
        <nav className="flex items-center gap-2">
          {/* Docs and GitHub should be visible on both landing and app */}
          <a className="hidden sm:inline-flex" href="/docs" target="_blank" rel="noreferrer"> 
            <Button kind="ghost">Docs</Button>
          </a>
          <a className="hidden sm:inline-flex" href="https://github.com/your-repo" target="_blank" rel="noreferrer">
            <Button kind="ghost">GitHub</Button>
          </a>

          {isLanding ? (
            <Link to="/app">
              <Button>Launch</Button>
            </Link>
          ) : (
            <ConnectWalletButton />
          )}
        </nav>
      </div>
    </header>
  )
}
