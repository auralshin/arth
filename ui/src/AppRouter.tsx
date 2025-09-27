import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import Pools from './pages/Pools'
import Analytics from './pages/Analytics'
import TradeSwap from './pages/TradeSwap'
import DepositLiquidity from './pages/DepositLiquidity'
import Settings from './pages/Settings'
import Oracle from './pages/Oracle'
import LPDashboard from './pages/LPDashboard'
import TradersView from './pages/TradersView'
import Landing from './Landing'
import TopBar from './components/TopBar'

export default function AppRouter() {
  return (
    <>
      <TopBar />
      <Routes>
  {/* Landing is full-bleed and should not be wrapped by AppLayout */}
  <Route path="/" element={<Landing />} />
  <Route path="/landing" element={<Landing />} />
  {/* convenience alias */}
  <Route path="/app" element={<Navigate to="/dashboard" replace />} />

      <Route element={<AppLayout />}> 
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pools" element={<Pools />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/trade" element={<TradeSwap />} />
        <Route path="/traders" element={<TradersView />} />
        <Route path="/liquidity" element={<LPDashboard />} />
        <Route path="/deposit" element={<DepositLiquidity />} />
        <Route path="/oracle" element={<Oracle />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}
