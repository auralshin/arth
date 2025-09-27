import { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { Button } from './Button';
import Modal from './Modal';
import { use1inchSwap, calculateHedgeAmount, type HedgeParams } from '../hooks/use1inch';

import { fmtNum } from '../utils/format';
import type { Position } from '../data/demo';

interface HedgeButtonProps {
  position: Position;
  className?: string;
}

// Mock token addresses - replace with actual addresses from your contracts
const TOKEN_ADDRESSES = {
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' as `0x${string}`,
  USDC: '0xA0b86a33E6411c94A4b5c0c48C85ed2c68F4c528' as `0x${string}`,
} as const;

const TOKEN_DECIMALS = {
  WETH: 18,
  USDC: 6,
} as const;

export default function HedgeButton({ position, className = '' }: HedgeButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<'calculate' | 'quote' | 'confirm'>('calculate');
  
  const { address } = useAccount();
  const chainId = useChainId();
  
  const {
    getQuote,
    buildSwapTx,
    executeSwap,
    quote,
    isLoading,
    isPending,
    error,
    clearQuote,
  } = use1inchSwap(chainId);

  const hedgeCalculation = calculateHedgeAmount(position);

  const handleOpenModal = () => {
    setShowModal(true);
    setStep('calculate');
    clearQuote();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setStep('calculate');
    clearQuote();
  };

  const handleGetQuote = async () => {
    if (!hedgeCalculation.shouldHedge) return;
    
    setStep('quote');
    
    // Determine swap direction based on hedge calculation
    const params: HedgeParams = hedgeCalculation.direction === 'long'
      ? {
          // Go long ETH: swap USDC -> WETH
          tokenIn: TOKEN_ADDRESSES.USDC,
          tokenOut: TOKEN_ADDRESSES.WETH,
          amount: hedgeCalculation.hedgeAmount.toString(),
          decimalsIn: TOKEN_DECIMALS.USDC,
          decimalsOut: TOKEN_DECIMALS.WETH,
          slippage: 1,
        }
      : {
          // Go short ETH: swap WETH -> USDC  
          tokenIn: TOKEN_ADDRESSES.WETH,
          tokenOut: TOKEN_ADDRESSES.USDC,
          amount: hedgeCalculation.hedgeAmount.toString(),
          decimalsIn: TOKEN_DECIMALS.WETH,
          decimalsOut: TOKEN_DECIMALS.USDC,
          slippage: 1,
        };

    await getQuote(params);
  };

  const handleConfirmSwap = async () => {
    if (!quote || !address) return;
    
    setStep('confirm');
    
    const params: HedgeParams = hedgeCalculation.direction === 'long'
      ? {
          tokenIn: TOKEN_ADDRESSES.USDC,
          tokenOut: TOKEN_ADDRESSES.WETH,
          amount: hedgeCalculation.hedgeAmount.toString(),
          decimalsIn: TOKEN_DECIMALS.USDC,
          decimalsOut: TOKEN_DECIMALS.WETH,
          slippage: 1,
        }
      : {
          tokenIn: TOKEN_ADDRESSES.WETH,
          tokenOut: TOKEN_ADDRESSES.USDC,
          amount: hedgeCalculation.hedgeAmount.toString(),
          decimalsIn: TOKEN_DECIMALS.WETH,
          decimalsOut: TOKEN_DECIMALS.WETH,
          slippage: 1,
        };

    const swapTx = await buildSwapTx(params, address);
    if (swapTx) {
      await executeSwap(swapTx);
    }
  };

  if (!hedgeCalculation.shouldHedge) {
    return null; // Don't show button if hedge isn't needed
  }

  return (
    <>
      <Button 
        kind="outline" 
        onClick={handleOpenModal}
        className={className}
        disabled={!address}
      >
        Hedge via 1inch
      </Button>

      {showModal && (
        <Modal title="Hedge Position" onClose={handleCloseModal}>
          <div className="space-y-4">
            <div className="border-b border-white/10 pb-3">
              <p className="text-sm text-white/70 mt-1">
                Rebalance your token exposure using 1inch
              </p>
            </div>

            {step === 'calculate' && (
              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                  <div className="text-sm text-white/70">Position Analysis</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Funding Owed:</span>
                      <div className={`font-medium ${position.fundingOwed >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {position.fundingOwed >= 0 ? '+' : ''}{fmtNum(position.fundingOwed)}
                      </div>
                    </div>
                    <div>
                      <span className="text-white/60">Suggested Hedge:</span>
                      <div className="font-medium text-white">
                        {hedgeCalculation.direction.toUpperCase()} ${fmtNum(hedgeCalculation.hedgeAmount)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm text-amber-200">
                  <strong>Hedge Strategy:</strong> {hedgeCalculation.direction === 'long' 
                    ? 'Buy ETH to offset negative funding.' 
                    : 'Sell ETH to offset positive funding.'
                  }
                </div>

                <Button 
                  onClick={handleGetQuote} 
                  disabled={isLoading || !address}
                  className="w-full"
                >
                  {isLoading ? 'Getting Quote...' : 'Get 1inch Quote'}
                </Button>
              </div>
            )}

            {step === 'quote' && quote && (
              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                  <div className="text-sm text-white/70">1inch Quote</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">You Send:</span>
                      <span className="text-white font-medium">{hedgeCalculation.hedgeAmount} {hedgeCalculation.direction === 'long' ? 'USDC' : 'ETH'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">You Receive:</span>
                      <span className="text-white font-medium">{quote.dstAmount} {hedgeCalculation.direction === 'long' ? 'ETH' : 'USDC'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Est. Gas:</span>
                      <span className="text-white/80">{quote.gas}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    kind="outline" 
                    onClick={() => setStep('calculate')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleConfirmSwap}
                    disabled={isLoading || isPending}
                    className="flex-1"
                  >
                    {isPending ? 'Confirming...' : 'Execute Swap'}
                  </Button>
                </div>
              </div>
            )}

            {step === 'confirm' && (
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-sm text-emerald-200">
                  Swap transaction is being prepared. This feature is under development.
                </div>
                <Button onClick={handleCloseModal} className="w-full">
                  Close
                </Button>
              </div>
            )}

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-sm text-rose-200">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}