import { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import Card from '../components/Card';
import { Button } from '../components/Button';
import Segmented from '../components/Segmented';
import Modal from '../components/Modal';
import HedgeButton from '../components/HedgeButton';
import { useAllPools, useBaseIndex } from '../hooks/useContracts';
import { POOLS } from '../deployed-addresses';
import { fmtNum, fmtTs } from '../utils/format';
import { formatUnits } from 'viem';
import type { Position } from '../data/demo';

type TraderType = 'fixed' | 'float';
type PositionSide = 'long' | 'short';

interface TraderPosition extends Position {
  side: PositionSide;
  entryRate: number;
  currentRate: number;
  pnl: number;
  fundingPaid: number;
  healthFactor: number;
  liquidationPrice?: number;
}

export default function TradersView() {
  const { isConnected } = useAccount();
  const [traderType, setTraderType] = useState<TraderType>('fixed');
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedPool, setSelectedPool] = useState<(typeof POOLS[0] & {liquidity?: bigint; isExpired?: boolean; daysToMaturity?: number}) | null>(null);

  const { pools } = useAllPools();
  const { ratePerSecond, isLive } = useBaseIndex();

  // Mock trading positions - in real implementation, this would come from the contract
  const mockPositions: TraderPosition[] = [
    {
      key: '0x1234',
      poolId: POOLS[0].poolId,
      L: 1000000,
      kappa: 0.05,
      maturity: 1761531132,
      fundingOwed: -150.5,
      hf: 1.25,
      im: 2500,
      mm: 1500,
      side: 'short',
      entryRate: 4.8,
      currentRate: 5.2,
      pnl: -2800,
      fundingPaid: 150.5,
      healthFactor: 1.25,
      liquidationPrice: 6.8
    },
    {
      key: '0x5678',
      poolId: POOLS[1].poolId,
      L: 500000,
      kappa: 0.042,
      maturity: 1766715900,
      fundingOwed: 75.2,
      hf: 1.8,
      im: 1200,
      mm: 800,
      side: 'long',
      entryRate: 4.2,
      currentRate: 4.5,
      pnl: 1200,
      fundingPaid: -75.2,
      healthFactor: 1.8,
      liquidationPrice: 2.8
    }
  ];

  const currentRate = useMemo(() => {
    if (!ratePerSecond) return 4.5;
    // Convert per-second rate to annual percentage
    const annualRate = Number(formatUnits(ratePerSecond, 18)) * 365 * 24 * 60 * 60 * 100;
    return annualRate;
  }, [ratePerSecond]);

  const filteredPositions = mockPositions.filter(pos => {
    if (traderType === 'fixed') {
      // Fixed rate traders pay fixed, receive floating (short positions)
      return pos.side === 'short';
    } else {
      // Float rate traders pay floating, receive fixed (long positions)
      return pos.side === 'long';
    }
  });

  const totalPnL = filteredPositions.reduce((sum, pos) => sum + pos.pnl, 0);
  const totalFundingPaid = filteredPositions.reduce((sum, pos) => sum + pos.fundingPaid, 0);
  // const totalNotional = filteredPositions.reduce((sum, pos) => sum + (pos.L * pos.kappa), 0);
  const averageHealthFactor = filteredPositions.length > 0 ? 
    filteredPositions.reduce((sum, pos) => sum + pos.healthFactor, 0) / filteredPositions.length : 0;

  if (!isConnected) {
    return (
      <Card>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-white mb-4">Traders Dashboard</h2>
          <p className="text-white/60 mb-6">Connect your wallet to view your trading positions</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Interest Rate Swaps Trading</h1>
            <p className="text-white/60 mt-1">
              Trade fixed vs floating interest rates with leveraged positions
            </p>
          </div>
          <Button onClick={() => setShowTradeModal(true)}>
            New Position
          </Button>
        </div>

        {/* Trader Type Selection */}
        <div className="mb-6">
          <Segmented
            value={traderType}
            onChange={(value: string) => setTraderType(value as TraderType)}
            options={[
              { value: 'fixed', label: 'Fixed Rate Trader' },
              { value: 'float', label: 'Float Rate Trader' }
            ]}
          />
          <div className="mt-2 text-sm text-white/60">
            {traderType === 'fixed' 
              ? 'Pay fixed rate, receive floating rate (bet rates will increase)'
              : 'Pay floating rate, receive fixed rate (bet rates will decrease)'
            }
          </div>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/30 rounded-lg p-4">
            <div className="text-white/60 text-sm">Current Base Rate</div>
            <div className="text-xl font-bold text-white">{currentRate.toFixed(2)}%</div>
            <div className={`text-sm ${isLive ? 'text-emerald-300' : 'text-rose-300'}`}>
              {isLive ? 'Live' : 'Frozen'}
            </div>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-4">
            <div className="text-white/60 text-sm">Total P&L</div>
            <div className={`text-xl font-bold ${totalPnL >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
              {totalPnL >= 0 ? '+' : ''}${fmtNum(totalPnL)}
            </div>
            <div className="text-sm text-white/60">Unrealized</div>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-4">
            <div className="text-white/60 text-sm">Funding Paid</div>
            <div className={`text-xl font-bold ${totalFundingPaid <= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
              {totalFundingPaid >= 0 ? '+' : ''}${fmtNum(totalFundingPaid)}
            </div>
            <div className="text-sm text-white/60">Net payments</div>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-4">
            <div className="text-white/60 text-sm">Avg Health Factor</div>
            <div className={`text-xl font-bold ${averageHealthFactor > 1.5 ? 'text-emerald-300' : averageHealthFactor > 1.2 ? 'text-yellow-300' : 'text-rose-300'}`}>
              {averageHealthFactor.toFixed(2)}
            </div>
            <div className="text-sm text-white/60">{filteredPositions.length} positions</div>
          </div>
        </div>
      </Card>

      {/* Active Positions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Your {traderType === 'fixed' ? 'Fixed Rate' : 'Float Rate'} Positions
          </h2>
          <span className="text-sm text-white/60">{filteredPositions.length} active</span>
        </div>

        {filteredPositions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-white/60 border-b border-white/10">
                <tr>
                  <th className="text-left py-3 pr-4 font-medium">Pool</th>
                  <th className="text-left py-3 pr-4 font-medium">Side/Notional</th>
                  <th className="text-left py-3 pr-4 font-medium">Entry/Current Rate</th>
                  <th className="text-left py-3 pr-4 font-medium">P&L</th>
                  <th className="text-left py-3 pr-4 font-medium">Funding</th>
                  <th className="text-left py-3 pr-4 font-medium">Health</th>
                  <th className="text-left py-3 pr-4 font-medium">Maturity</th>
                  <th className="text-left py-3 pr-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPositions.map((position) => {
                  const pool = pools.find(p => p.poolId === position.poolId);
                  const notional = position.L * position.kappa;
                  
                  return (
                    <tr key={position.key} className="border-t border-white/5">
                      <td className="py-4 pr-4">
                        <div className="text-white font-medium">{pool?.name}</div>
                        <div className="text-white/60 text-xs">{pool?.description}</div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            position.side === 'long' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'
                          }`}>
                            {position.side.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-white/90">${fmtNum(notional)}</div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="text-white">{position.entryRate.toFixed(2)}%</div>
                        <div className="text-white/60">{position.currentRate.toFixed(2)}% current</div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className={`font-medium ${position.pnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                          {position.pnl >= 0 ? '+' : ''}${fmtNum(position.pnl)}
                        </div>
                        <div className="text-white/60 text-xs">
                          {((position.pnl / notional) * 100).toFixed(1)}%
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className={`${position.fundingPaid <= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                          {position.fundingPaid >= 0 ? '+' : ''}${fmtNum(position.fundingPaid)}
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className={`font-medium ${
                          position.healthFactor > 1.5 ? 'text-emerald-300' : 
                          position.healthFactor > 1.2 ? 'text-yellow-300' : 'text-rose-300'
                        }`}>
                          {position.healthFactor.toFixed(2)}
                        </div>
                        {position.liquidationPrice && (
                          <div className="text-white/60 text-xs">
                            Liq: {position.liquidationPrice.toFixed(2)}%
                          </div>
                        )}
                      </td>
                      <td className="py-4 pr-4 text-white/60">
                        {fmtTs(position.maturity)}
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex gap-2">
                          <HedgeButton position={position} />
                          <Button kind="outline">Close</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-white/60 mb-4">No {traderType} rate positions found</div>
            <Button onClick={() => setShowTradeModal(true)}>
              Open Your First Position
            </Button>
          </div>
        )}
      </Card>

      {/* Available Pools for Trading */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Available Markets</h2>
          <div className="text-sm text-white/60">
            {pools.filter(p => !p.isExpired).length} active markets
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pools.filter(p => !p.isExpired).map((pool) => {
            // Mock current funding rate for the pool
            const fundingRate = (Math.random() * 0.4 + 4.8).toFixed(2);
            const rateChange = (Math.random() * 0.4 - 0.2).toFixed(2);
            
            return (
              <div key={pool.id} className="bg-slate-800/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-white font-medium">{pool.name}</div>
                    <div className="text-white/60 text-sm">{pool.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white/60 text-xs">Days to maturity</div>
                    <div className="text-white text-sm">{pool.daysToMaturity}d</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <div className="text-white/60">Fixed Rate</div>
                    <div className="text-white font-medium">{fundingRate}%</div>
                  </div>
                  <div>
                    <div className="text-white/60">24h Change</div>
                    <div className={`font-medium ${Number(rateChange) >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {Number(rateChange) >= 0 ? '+' : ''}{rateChange}%
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    kind="outline"
                    className="flex-1"
                    onClick={() => {
                      // Find the original pool from POOLS constant
                      const originalPool = POOLS.find(p => p.poolId === pool.poolId);
                      setSelectedPool(originalPool || null);
                      setShowTradeModal(true);
                    }}
                  >
                    {traderType === 'fixed' ? 'Pay Fixed' : 'Pay Float'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Trade Modal */}
      {showTradeModal && (
        <Modal 
          title={`Open ${traderType === 'fixed' ? 'Fixed Rate' : 'Float Rate'} Position`}
          onClose={() => {
            setShowTradeModal(false);
            setSelectedPool(null);
          }}
        >
          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm text-amber-200">
              <strong>Coming Soon:</strong> Trading interface is under development. 
              Connect with the team to open positions manually.
            </div>
            
            {selectedPool && (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Market Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Pool:</span>
                    <span className="text-white">{selectedPool.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Current Rate:</span>
                    <span className="text-white">{currentRate.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Maturity:</span>
                    <span className="text-white">{selectedPool.daysToMaturity} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Strategy:</span>
                    <span className="text-white">
                      {traderType === 'fixed' ? 'Pay Fixed, Receive Floating' : 'Pay Floating, Receive Fixed'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm text-blue-200">
              <strong>Strategy Explanation:</strong><br />
              {traderType === 'fixed' ? (
                <>You will pay a fixed rate and receive the floating base rate. 
                Profit if rates increase above your fixed rate.</>
              ) : (
                <>You will pay the floating base rate and receive a fixed rate. 
                Profit if rates decrease below your fixed rate.</>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}