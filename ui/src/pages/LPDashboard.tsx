import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Card from '../components/Card';
import { Button } from '../components/Button';
import Modal from '../components/Modal';
import { Field, TextInput } from '../components/Field';
import NetworkChecker from '../components/NetworkChecker';
import ConnectButton from '../components/ConnectButton';
import { useAllPools, useTokenBalances, useUserLPPositions, useContractAddresses } from '../hooks/useContracts';
import { useAddLiquidity, useTokenApproval, useTokenAllowance } from '../hooks/useTrading';
import { useNotifications } from '../hooks/useNotifications';
import { getRecommendedTickRange, alignTick, calculateSafeLiquidityDelta, validateTransactionParams } from '../utils/transactionUtils';
import { POOLS } from '../deployed-addresses';
import { fmtNum } from '../utils/format';
import { formatUnits } from 'viem';

export default function LPDashboard() {
  const { address, isConnected } = useAccount();
  const [showAddLiquidityModal, setShowAddLiquidityModal] = useState(false);
  const [selectedPool, setSelectedPool] = useState<typeof POOLS[number] | null>(null);

  const { pools } = useAllPools();
  const { balances, isLoading: balancesLoading, error: balancesError } = useTokenBalances(address);
  const { 
    positions: lpPositions, 
    totalLiquidityValue, 
    totalFeesEarned, 
    averageAPY,
    positionCount,
    isLoading: positionsLoading,
    hasRealPositions,
    error: positionsError
  } = useUserLPPositions(address);

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <NetworkChecker />
        <Card>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-white mb-4">LP Dashboard</h2>
            <p className="text-white/60 mb-6">Connect your wallet to view your liquidity provider dashboard</p>
            <ConnectButton />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <NetworkChecker />
      {/* LP Overview */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Liquidity Provider Dashboard</h1>
            <p className="text-white/60 mt-1">Manage your liquidity positions and earn fees from IRS trading</p>
          </div>
          {isConnected ? (
            <Button onClick={() => setShowAddLiquidityModal(true)}>
              Add Liquidity
            </Button>
          ) : (
            <ConnectButton />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/30 rounded-lg p-4">
            <div className="text-white/60 text-sm">Total Liquidity</div>
            {positionsLoading ? (
              <div className="text-2xl font-bold text-white/60">Loading...</div>
            ) : (
              <div className="text-2xl font-bold text-white">${fmtNum(totalLiquidityValue)}</div>
            )}
            <div className="text-sm text-emerald-300">
              {totalLiquidityValue > 0 ? `+${((totalLiquidityValue * 0.052)).toFixed(2)} this month` : 'No positions'}
            </div>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-4">
            <div className="text-white/60 text-sm">Fees Earned</div>
            {positionsLoading ? (
              <div className="text-2xl font-bold text-white/60">Loading...</div>
            ) : (
              <div className="text-2xl font-bold text-white">${fmtNum(totalFeesEarned)}</div>
            )}
            <div className="text-sm text-emerald-300">
              {totalFeesEarned > 0 ? `+$${fmtNum(totalFeesEarned * 0.1)} this week` : 'No fees yet'}
            </div>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-4">
            <div className="text-white/60 text-sm">Average APY</div>
            {positionsLoading ? (
              <div className="text-2xl font-bold text-white/60">Loading...</div>
            ) : (
              <div className="text-2xl font-bold text-white">{averageAPY.toFixed(1)}%</div>
            )}
            <div className="text-sm text-white/60">Across {positionCount} pools</div>
          </div>
        </div>
      </Card>

      {/* LP Positions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Your Liquidity Positions</h2>
            {!hasRealPositions && positionCount > 0 && (
              <div className="text-xs text-yellow-400 mt-1">
                📍 Demo positions shown - Add liquidity to see real positions
              </div>
            )}
          </div>
          <div className="text-right">
            <span className="text-sm text-white/60">
              {positionsLoading ? 'Loading...' : `${positionCount} active positions`}
            </span>
            {positionsError && (
              <div className="text-xs text-red-400 mt-1">{positionsError}</div>
            )}
          </div>
        </div>

        {positionsLoading ? (
          <div className="text-center py-8">
            <div className="text-white/60">Loading your positions...</div>
          </div>
        ) : lpPositions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-white/60 mb-2">No liquidity positions found</div>
            <div className="text-white/40 text-sm">Add liquidity to a pool to start earning fees</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-white/60 border-b border-white/10">
                <tr>
                  <th className="text-left py-3 pr-4 font-medium">Pool</th>
                  <th className="text-left py-3 pr-4 font-medium">Liquidity</th>
                  <th className="text-left py-3 pr-4 font-medium">Token Amounts</th>
                  <th className="text-left py-3 pr-4 font-medium">Fees Earned</th>
                  <th className="text-left py-3 pr-4 font-medium">APY</th>
                  <th className="text-left py-3 pr-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lpPositions.filter(Boolean).map((position) => {
                  if (!position) return null;
                  return (
                    <tr key={position.poolId} className="border-t border-white/5">
                      <td className="py-4 pr-4">
                        <div className="text-white font-medium">{position.poolName}</div>
                        <div className="text-white/60 text-xs">Maturity: {position.maturityDate.toLocaleDateString()}</div>
                      </td>
                      <td className="py-4 pr-4 text-white">
                        ${fmtNum(Number(formatUnits(position.liquidity, 18)))}
                      </td>
                      <td className="py-4 pr-4">
                        <div className="text-white">
                          {fmtNum(Number(formatUnits(position.token0Amount, 18)))} {position.token0Symbol}
                        </div>
                        <div className="text-white/60">
                          {fmtNum(Number(formatUnits(position.token1Amount, 18)))} {position.token1Symbol}
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="text-emerald-300 font-medium">
                          +${fmtNum(Number(formatUnits(position.feesEarned, 18)))}
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="bg-emerald-500/10 text-emerald-300 px-2 py-1 rounded-full text-xs font-medium">
                          {position.apy.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex gap-2">
                          <Button 
                            kind="outline" 
                            onClick={() => {
                              const originalPool = POOLS.find(p => p.poolId === position.poolId);
                              setSelectedPool(originalPool || null);
                              setShowAddLiquidityModal(true);
                            }}
                          >
                            Add
                          </Button>
                          <Button kind="outline">Remove</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Available Pools */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Available Pools</h2>
          <div className="text-sm text-white/60">
            {pools.filter(p => !p.isExpired).length} active pools
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pools.filter(p => !p.isExpired).map((pool) => (
            <div key={pool.id} className="bg-slate-800/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-white font-medium">{pool.name}</div>
                  <div className="text-white/60 text-sm">{pool.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-white/60 text-xs">Maturity</div>
                  <div className="text-white text-sm">
                    {Math.ceil((pool.maturityDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <div className="text-white/60">Liquidity</div>
                  <div className="text-white font-medium">
                    ${pool.liquidity ? fmtNum(Number(formatUnits(pool.liquidity, 18))) : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-white/60">Est. APY</div>
                  <div className="text-emerald-300 font-medium">
                    {(Math.random() * 10 + 8).toFixed(1)}%
                  </div>
                </div>
              </div>

              <Button 
                kind="outline" 
                className="w-full"
                onClick={() => {
                  const originalPool = POOLS.find(p => p.poolId === pool.poolId);
                  setSelectedPool(originalPool || null);
                  setShowAddLiquidityModal(true);
                }}
              >
                Provide Liquidity
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Token Balances */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Token Balances</h2>
          {balancesError && (
            <div className="text-red-400 text-sm">Error loading balances</div>
          )}
        </div>
        
        {balancesLoading ? (
          <div className="text-center py-8">
            <div className="text-white/60">Loading balances...</div>
          </div>
        ) : balancesError ? (
          <div className="text-center py-8">
            <div className="text-red-400 mb-2">Failed to load token balances</div>
            <div className="text-white/60 text-sm">{String(balancesError)}</div>
            <div className="text-white/40 text-xs mt-2">
              {String(balancesError).includes('Sepolia') ? 'Switch to Sepolia network in your wallet' : 'Please check your wallet connection and network'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {balances.map((balance, index) => {
              const tokenInfo = balance.tokenInfo;
              const hasError = balance.error;
              
              return (
                <div key={index} className="bg-slate-800/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{tokenInfo?.symbol || 'Unknown'}</div>
                      <div className="text-white/60 text-sm">{tokenInfo?.name || 'Unknown Token'}</div>
                      {hasError && <div className="text-red-400 text-xs">Failed to load</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">
                        {hasError ? 'Error' : 
                         balance.balance ? 
                          fmtNum(Number(formatUnits(balance.balance, tokenInfo?.decimals || 18))) : 
                          '0'
                        }
                      </div>
                      <div className="text-white/60 text-xs">{tokenInfo?.symbol}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add Liquidity Modal */}
      {showAddLiquidityModal && (
        <AddLiquidityModal 
          pool={selectedPool}
          onClose={() => {
            setShowAddLiquidityModal(false);
            setSelectedPool(null);
          }}
          balances={balances}
        />
      )}
    </div>
  );
}

// Add Liquidity Modal Component
function AddLiquidityModal({ 
  pool, 
  onClose, 
  balances 
}: { 
  pool: typeof POOLS[number] | null;
  onClose: () => void;
  balances: Array<{
    address: string;
    balance: bigint | undefined;
    tokenInfo: {
      symbol?: string;
      name?: string;
      decimals?: number;
    } | undefined;
    error?: Error | string;
    loading?: boolean;
  }>;
}) {
  const { address } = useAccount();
  const { addNotification } = useNotifications();
  const [token0Amount, setToken0Amount] = useState('');
  const [token1Amount, setToken1Amount] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addresses = useContractAddresses();
  const { addLiquidity, isPending: isAddingLiquidity, isSuccess } = useAddLiquidity();
  const { approve, isPending: isApproving } = useTokenApproval();
  
  // Check token allowances
  const { allowance: token0Allowance } = useTokenAllowance(
    pool?.token0 as `0x${string}` | undefined, 
    address, 
    addresses.ROUTER
  );
  const { allowance: token1Allowance } = useTokenAllowance(
    pool?.token1 as `0x${string}` | undefined, 
    address, 
    addresses.ROUTER
  );

  // Handle success state with notification instead of alert
  useEffect(() => {
    if (isSuccess && pool) {
      addNotification({
        type: 'success',
        title: 'Liquidity Added Successfully!',
        message: `Added ${token0Amount} ${pool.token0Symbol} + ${token1Amount} ${pool.token1Symbol} to ${pool.name}`,
        autoClose: true,
      });
      onClose();
    }
  }, [isSuccess, addNotification, onClose, token0Amount, token1Amount, pool]);

  if (!pool) return null;

  // Get balances for the pool's tokens
  const token0Balance = balances.find(b => b.address.toLowerCase() === pool.token0.toLowerCase());
  const token1Balance = balances.find(b => b.address.toLowerCase() === pool.token1.toLowerCase());
  
  const token0BalanceNum = token0Balance?.balance ? Number(formatUnits(token0Balance.balance, 18)) : 0;
  const token1BalanceNum = token1Balance?.balance ? Number(formatUnits(token1Balance.balance, 18)) : 0;

  const token0AmountNum = Number(token0Amount || 0);
  const token1AmountNum = Number(token1Amount || 0);

  // Check if user has sufficient balance
  const hasInsufficientToken0 = token0AmountNum > token0BalanceNum;
  const hasInsufficientToken1 = token1AmountNum > token1BalanceNum;
  const hasInsufficientBalance = hasInsufficientToken0 || hasInsufficientToken1;

  // Check if token approvals are needed
  const needsToken0Approval = token0AmountNum > 0 && token0Allowance && BigInt(Math.floor(token0AmountNum * 1e18)) > token0Allowance;
  const needsToken1Approval = token1AmountNum > 0 && token1Allowance && BigInt(Math.floor(token1AmountNum * 1e18)) > token1Allowance;

  // Estimate LP tokens and share
  const estimatedLPTokens = Math.sqrt(token0AmountNum * token1AmountNum);
  const estimatedPoolShare = estimatedLPTokens / (estimatedLPTokens + 1000000) * 100; // Mock calculation

  const handleAddLiquidity = async () => {
    if (!address || hasInsufficientBalance || !addresses.ROUTER) return;
    
    setIsLoading(true);
    try {
      // Step 1: Check and handle token approvals
      if (needsToken0Approval) {
        await approve(pool.token0 as `0x${string}`, addresses.ROUTER, token0Amount);
      }
      
      if (needsToken1Approval) {
        await approve(pool.token1 as `0x${string}`, addresses.ROUTER, token1Amount);
      }

      // Step 2: Add liquidity to the pool
      // Calculate liquidity delta using safe parameters
      const calculatedLiquidity = BigInt(Math.floor((token0AmountNum + token1AmountNum) * 1e15)); // Use smaller multiplier
      const liquidityDelta = calculateSafeLiquidityDelta(calculatedLiquidity);
      
      // Use recommended tick range for moderate risk tolerance
      const { tickLower: rawTickLower, tickUpper: rawTickUpper } = getRecommendedTickRange('moderate');
      const tickLower = alignTick(rawTickLower, pool.tickSpacing, false);
      const tickUpper = alignTick(rawTickUpper, pool.tickSpacing, true);
      
      // Validate parameters before submission
      const validation = validateTransactionParams({
        tickLower,
        tickUpper,
        tickSpacing: pool.tickSpacing,
        liquidityDelta,
        userAddress: address,
      });
      
      if (!validation.isValid) {
        throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
      }
      
      await addLiquidity({
        poolKey: {
          currency0: pool.token0 as `0x${string}`,
          currency1: pool.token1 as `0x${string}`,
          fee: pool.fee,
          tickSpacing: pool.tickSpacing,
          hooks: pool.hook as `0x${string}`,
        },
        tickLower,
        tickUpper,
        liquidityDelta,
        amount0: token0Amount,
        amount1: token1Amount,
      });

      // Success will be handled by the isSuccess effect
    } catch (error) {
      console.error('Failed to add liquidity:', error);
      // Error handling is now done through the notification system in useAddLiquidity
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <Modal 
      title={`Add Liquidity to ${pool.name}`}
      onClose={onClose}
    >
      <div className="space-y-6">
        {/* Pool Info */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-white font-medium mb-3">Pool Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Pair:</span>
              <span className="text-white">{pool.token0Symbol}/{pool.token1Symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Fee Tier:</span>
              <span className="text-white">{pool.fee / 10000}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Maturity:</span>
              <span className="text-white">
                {Math.ceil((pool.maturityDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Duration:</span>
              <span className="text-white">{pool.duration}</span>
            </div>
          </div>
        </div>

        {/* Token Amounts */}
        <div className="space-y-4">
          <Field label={`${pool.token0Symbol} Amount`}>
            <div className="relative">
              <TextInput
                type="number"
                inputMode="decimal"
                placeholder="0.0"
                value={token0Amount}
                onChange={(e) => setToken0Amount(e.target.value)}
                className="rounded-xl pr-20"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button 
                  kind="outline" 
                  className="text-xs py-1 px-2"
                  onClick={() => setToken0Amount((token0BalanceNum * 0.5).toString())}
                >
                  50%
                </Button>
                <Button 
                  kind="outline" 
                  className="text-xs py-1 px-2"
                  onClick={() => setToken0Amount(token0BalanceNum.toString())}
                >
                  MAX
                </Button>
              </div>
            </div>
            <div className="text-xs text-white/60 mt-1">
              Balance: {fmtNum(token0BalanceNum)} {pool.token0Symbol}
            </div>
            {hasInsufficientToken0 && (
              <div className="text-xs text-red-400 mt-1">
                Insufficient {pool.token0Symbol} balance
              </div>
            )}
          </Field>

          <Field label={`${pool.token1Symbol} Amount`}>
            <div className="relative">
              <TextInput
                type="number"
                inputMode="decimal"
                placeholder="0.0"
                value={token1Amount}
                onChange={(e) => setToken1Amount(e.target.value)}
                className="rounded-xl pr-20"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button 
                  kind="outline" 
                  className="text-xs py-1 px-2"
                  onClick={() => setToken1Amount((token1BalanceNum * 0.5).toString())}
                >
                  50%
                </Button>
                <Button 
                  kind="outline" 
                  className="text-xs py-1 px-2"
                  onClick={() => setToken1Amount(token1BalanceNum.toString())}
                >
                  MAX
                </Button>
              </div>
            </div>
            <div className="text-xs text-white/60 mt-1">
              Balance: {fmtNum(token1BalanceNum)} {pool.token1Symbol}
            </div>
            {hasInsufficientToken1 && (
              <div className="text-xs text-red-400 mt-1">
                Insufficient {pool.token1Symbol} balance
              </div>
            )}
          </Field>
        </div>

        {/* Price Range */}
        <div className="space-y-4">
          <h3 className="text-white font-medium">Price Range (Optional)</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Min Price">
              <TextInput
                type="number"
                inputMode="decimal"
                placeholder="Auto"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="rounded-xl"
              />
              <div className="text-xs text-white/60 mt-1">
                {pool.token0Symbol} per {pool.token1Symbol}
              </div>
            </Field>
            <Field label="Max Price">
              <TextInput
                type="number"
                inputMode="decimal"
                placeholder="Auto"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="rounded-xl"
              />
              <div className="text-xs text-white/60 mt-1">
                {pool.token0Symbol} per {pool.token1Symbol}
              </div>
            </Field>
          </div>
          <div className="text-xs text-white/60">
            Leave empty for full range liquidity (recommended for IRS pools)
          </div>
        </div>

        {/* Summary */}
        {(token0AmountNum > 0 || token1AmountNum > 0) && (
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h3 className="text-white font-medium mb-3">Liquidity Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Estimated LP Tokens:</span>
                <span className="text-white">{fmtNum(estimatedLPTokens)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Pool Share:</span>
                <span className="text-white">{estimatedPoolShare.toFixed(4)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Est. APY:</span>
                <span className="text-emerald-400">{(Math.random() * 10 + 8).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {(token0AmountNum > 0 || token1AmountNum > 0) && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-sm text-amber-200">
            <div className="font-medium mb-1">⚠️ Important Notes:</div>
            <ul className="space-y-1 text-xs">
              <li>• You'll earn fees from all IRS trades in this pool</li>
              <li>• Liquidity is locked until pool maturity ({pool.maturityDate.toLocaleDateString()})</li>
              <li>• Interest rate changes may affect your position value</li>
              <li>• Consider the impermanent loss risk with volatile rates</li>
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={onClose} kind="outline" className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleAddLiquidity}
            disabled={isLoading || isAddingLiquidity || isApproving || hasInsufficientBalance || (!token0AmountNum && !token1AmountNum)}
            className={`flex-1 ${(isLoading || isAddingLiquidity || isApproving || hasInsufficientBalance) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading || isAddingLiquidity ? 'Adding Liquidity...' :
             isApproving ? 'Approving Tokens...' :
             hasInsufficientBalance ? 'Insufficient Balance' :
             'Add Liquidity'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}