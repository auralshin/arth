import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';

// 1inch API endpoints
const ONEINCH_API_BASE = 'https://api.1inch.dev';

export interface SwapQuote {
  dstAmount: string;
  srcAmount: string;
  gas: string;
  gasPrice: string;
  protocols: unknown[];
}

export interface SwapTransaction {
  from: string;
  to: string;
  data: string;
  value: string;
  gas: string;
  gasPrice: string;
}

export interface HedgeParams {
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  amount: string;
  decimalsIn: number;
  decimalsOut: number;
  slippage?: number; // percentage (e.g., 1 for 1%)
}

export function use1inchSwap(chainId: number = 1) {
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: hash } = useWriteContract();
  const { isLoading: isPending, isSuccess } = useWaitForTransactionReceipt({ hash });

  const getQuote = async (params: HedgeParams): Promise<SwapQuote | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const amountWei = parseUnits(params.amount, params.decimalsIn);
      
      const url = new URL(`${ONEINCH_API_BASE}/swap/v6.0/${chainId}/quote`);
      url.searchParams.set('src', params.tokenIn);
      url.searchParams.set('dst', params.tokenOut);
      url.searchParams.set('amount', amountWei.toString());
      url.searchParams.set('includeGas', 'true');

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_1INCH_API_KEY || ''}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`1inch API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setQuote(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error getting quote';
      setError(message);
      console.error('1inch quote error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const buildSwapTx = async (params: HedgeParams, fromAddress: `0x${string}`): Promise<SwapTransaction | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const amountWei = parseUnits(params.amount, params.decimalsIn);
      const slippage = params.slippage || 1; // Default 1% slippage
      
      const url = new URL(`${ONEINCH_API_BASE}/swap/v6.0/${chainId}/swap`);
      url.searchParams.set('src', params.tokenIn);
      url.searchParams.set('dst', params.tokenOut);
      url.searchParams.set('amount', amountWei.toString());
      url.searchParams.set('from', fromAddress);
      url.searchParams.set('slippage', slippage.toString());
      url.searchParams.set('disableEstimate', 'true');

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_1INCH_API_KEY || ''}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`1inch API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.tx;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error building swap';
      setError(message);
      console.error('1inch swap build error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const executeSwap = async (swapTx: SwapTransaction) => {
    try {
      // For 1inch swaps, we need to send a raw transaction
      // This would typically require sendTransaction instead of writeContract
      console.log('Swap transaction ready:', swapTx);
      // TODO: Implement with useSendTransaction when available
      throw new Error('Swap execution not yet implemented - requires useSendTransaction');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error executing swap';
      setError(message);
      console.error('Swap execution error:', err);
    }
  };

  const clearQuote = () => {
    setQuote(null);
    setError(null);
  };

  return {
    getQuote,
    buildSwapTx,
    executeSwap,
    clearQuote,
    quote,
    isLoading,
    isPending,
    isSuccess,
    error,
    transactionHash: hash,
  };
}

// Helper function to calculate hedge amounts based on position data
export function calculateHedgeAmount(position: {
  L: number;
  kappa: number;
  fundingOwed: number;
}): { shouldHedge: boolean; hedgeAmount: number; direction: 'long' | 'short' } {
  const hedgeRatio = 0.5; // Hedge 50% of funding exposure by default
  const hedgeThreshold = 100; // Only hedge if funding owed > $100
  
  if (Math.abs(position.fundingOwed) < hedgeThreshold) {
    return { shouldHedge: false, hedgeAmount: 0, direction: 'long' };
  }

  const hedgeAmount = Math.abs(position.fundingOwed) * hedgeRatio;
  const direction = position.fundingOwed > 0 ? 'short' : 'long'; // Hedge opposite direction

  return {
    shouldHedge: true,
    hedgeAmount,
    direction,
  };
}