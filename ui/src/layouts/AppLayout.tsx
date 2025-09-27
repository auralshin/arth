import { Outlet, useLocation } from 'react-router-dom'
import SideNav from '../components/SideNav'
import Footer from '../components/Footer'
import { NotificationContainer } from '../components/NotificationSystem'

export default function AppLayout() {
  const loc = useLocation()
  const hideAside = loc.pathname === '/'

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col">
      {/* subtle background field */}
      <div className="pointer-events-none absolute inset-0"
           style={{
             background:
               "url('https://www.transparenttextures.com/patterns/asfalt-light.png'), radial-gradient(60% 40% at 70% 0%, rgba(34,211,238,0.08), transparent 60%), radial-gradient(45% 35% at 10% 20%, rgba(245, 158, 11, 0.08), transparent 60%), radial-gradient(40% 50% at 50% 100%, rgba(16,185,129,0.06), transparent 60%)",
             backgroundRepeat: 'repeat',
             backgroundSize: '160px 160px',
             opacity: 0.6
           }}
      />
  <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 py-6 flex-1">
        {!hideAside && (
          <aside className="hidden lg:block">
            <SideNav />
          </aside>
        )}
        <main className="space-y-6">
          <Outlet />
        </main>
      </div>

      {/* keep footer at bottom */}
      <Footer />
      
      {/* Transaction notification system */}
      <NotificationContainer />
    </div>
  )
}
