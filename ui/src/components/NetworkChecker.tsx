import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { Button } from './Button';

export default function NetworkChecker() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const SEPOLIA_CHAIN_ID = 11155111;
  const isCorrectNetwork = chainId === SEPOLIA_CHAIN_ID;

  if (!isConnected) {
    return null;
  }

  if (isCorrectNetwork) {
    return (
      <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-3 mb-4">
        <div className="flex items-center text-emerald-400">
          <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
          <span className="text-sm">Connected to Sepolia Network ✓</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-yellow-400 font-medium">Wrong Network</div>
          <div className="text-yellow-300/80 text-sm mt-1">
            Please switch to Sepolia network to use this app
          </div>
          <div className="text-yellow-300/60 text-xs mt-1">
            Current: Chain ID {chainId} | Required: Sepolia ({SEPOLIA_CHAIN_ID})
          </div>
        </div>
        <Button
          kind="outline"
          onClick={() => switchChain({ chainId: SEPOLIA_CHAIN_ID })}
        >
          Switch Network
        </Button>
      </div>
    </div>
  );
}