import { useState, useRef, useEffect } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount, useDisconnect, useEnsName } from 'wagmi';
import { Button } from './Button';

export default function ConnectWalletButton() {
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const { isConnected, address } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Use ENS name if available, otherwise show formatted address
  const displayName = ensName || (address ? formatAddress(address) : '');

  if (!isConnected) {
    return (
      <Button onClick={() => open()}>
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="min-w-[120px] justify-center"
      >
        {displayName}
      </Button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-slate-900/95 border border-white/10 rounded-xl shadow-xl backdrop-blur-sm z-50">
          <div className="p-3 border-b border-white/10">
            <div className="text-xs text-white/60 mb-1">Connected as</div>
            {ensName ? (
              <>
                <div className="text-sm text-white font-medium">{ensName}</div>
                {address && (
                  <div className="text-xs text-white/50 mt-1">
                    {formatAddress(address)}
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-white font-medium">
                {address ? formatAddress(address) : 'Unknown'}
              </div>
            )}
          </div>
          
          <div className="p-2 space-y-1">
            {address && (
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(address);
                  setCopied(true);
                  setTimeout(() => {
                    setCopied(false);
                    setShowDropdown(false);
                  }, 1000);
                }}
                className="w-full text-left px-3 py-2 text-sm text-white/70 hover:bg-white/5 rounded-lg transition-colors"
              >
                {copied ? '✓ Copied!' : 'Copy Address'}
              </button>
            )}
            <button
              onClick={() => {
                disconnect();
                setShowDropdown(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
