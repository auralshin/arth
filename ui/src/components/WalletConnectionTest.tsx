import { useAccount } from 'wagmi';
import ConnectButton from '../components/ConnectButton';
import { Button } from '../components/Button';

// Test component to verify wallet connection works with Add Liquidity
export default function WalletConnectionTest() {
  const { isConnected, address } = useAccount();

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-white">Wallet Connection Test</h2>
      
      <div className="bg-slate-800/50 rounded-lg p-4">
        <div className="text-sm text-white/60 mb-2">Connection Status:</div>
        <div className={`font-medium ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
          {isConnected ? '✅ Connected' : '❌ Not Connected'}
        </div>
        {address && (
          <div className="text-xs text-white/50 mt-1">
            Address: {address}
          </div>
        )}
      </div>

      <div className="bg-slate-800/50 rounded-lg p-4">
        <div className="text-sm text-white/60 mb-3">Add Liquidity Button Behavior:</div>
        
        {isConnected ? (
          <div className="space-y-2">
            <Button onClick={() => alert('Add Liquidity modal would open')}>
              Add Liquidity (Connected)
            </Button>
            <div className="text-xs text-emerald-300">
              ✅ When connected: Opens liquidity modal
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <ConnectButton />
            <div className="text-xs text-yellow-300">
              ⚠️ When not connected: Shows connect wallet button
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-800/50 rounded-lg p-4">
        <div className="text-sm text-white/60 mb-2">Expected Flow:</div>
        <ol className="text-xs text-white/70 space-y-1 list-decimal list-inside">
          <li>User clicks "Add Liquidity" when not connected</li>
          <li>System shows "Connect Wallet" button instead</li>
          <li>User connects wallet via wallet modal</li>
          <li>After connection, "Add Liquidity" button becomes active</li>
          <li>Clicking "Add Liquidity" opens the liquidity modal</li>
        </ol>
      </div>
    </div>
  );
}