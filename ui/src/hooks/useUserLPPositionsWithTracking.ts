import { useEffect, useState } from 'react'
import { useWatchContractEvent, useReadContracts } from 'wagmi'
import { arthHookABI } from '../abi/ArthHook'
import { positionManagerABI } from '../abi/PositionManager'

interface Position {
  key: string
  owner: string
  poolId: string
  tickLower: number
  tickUpper: number
  salt: string
  liquidity: string
  fundingOwed: string
  fundingSnapshot: string
}

export function useUserLPPositionsWithEvents(userAddress?: string) {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Watch for position events to update in real-time
  useWatchContractEvent({
    address: process.env.NEXT_PUBLIC_ARTH_HOOK_ADDRESS as `0x${string}`,
    abi: arthHookABI,
    eventName: 'PositionUpdated',
    args: userAddress ? { owner: userAddress } : {},
    onLogs: (logs) => {
      console.log('Position updated:', logs)
      // Refresh positions when we detect changes
      refreshPositions()
    },
  })

  useWatchContractEvent({
    address: process.env.NEXT_PUBLIC_ARTH_HOOK_ADDRESS as `0x${string}`,
    abi: arthHookABI,
    eventName: 'PositionCreated',
    args: userAddress ? { owner: userAddress } : {},
    onLogs: (logs) => {
      console.log('Position created:', logs)
      refreshPositions()
    },
  })

  useWatchContractEvent({
    address: process.env.NEXT_PUBLIC_ARTH_HOOK_ADDRESS as `0x${string}`,
    abi: arthHookABI,
    eventName: 'PositionClosed',
    args: userAddress ? { owner: userAddress } : {},
    onLogs: (logs) => {
      console.log('Position closed:', logs)
      refreshPositions()
    },
  })

  // Get positions using the new enumeration functions
  const { data: positionKeys, refetch: refetchKeys } = useReadContracts({
    contracts: userAddress ? [{
      address: process.env.NEXT_PUBLIC_ARTH_HOOK_ADDRESS as `0x${string}`,
      abi: arthHookABI,
      functionName: 'getUserPositionKeys',
      args: [userAddress]
    }] : [],
    query: {
      enabled: !!userAddress
    }
  })

  // Get position details for each key
  const { data: positionDetails, refetch: refetchDetails } = useReadContracts({
    contracts: (positionKeys?.[0]?.result as string[] || []).map((key: string) => ({
      address: process.env.NEXT_PUBLIC_ARTH_HOOK_ADDRESS as `0x${string}`,
      abi: arthHookABI,
      functionName: 'positions',
      args: [key]
    })),
    query: {
      enabled: !!positionKeys?.[0]?.result?.length
    }
  })

  const refreshPositions = async () => {
    if (!userAddress) return

    setLoading(true)
    setError(null)

    try {
      await refetchKeys()
      await refetchDetails()
    } catch (err) {
      console.error('Error fetching positions:', err)
      setError('Failed to fetch positions')
    } finally {
      setLoading(false)
    }
  }

  // Process position data
  useEffect(() => {
    if (!positionKeys?.[0]?.result || !positionDetails) {
      setPositions([])
      setLoading(false)
      return
    }

    const keys = positionKeys[0].result as string[]
    const processedPositions: Position[] = []

    keys.forEach((key, index) => {
      const details = positionDetails[index]
      if (details?.result) {
        const [liquidity, fundingSnapshot, fundingOwed] = details.result as [bigint, bigint, bigint]
        
        if (liquidity > 0n) { // Only include active positions
          processedPositions.push({
            key,
            owner: userAddress!,
            poolId: '', // Would need to decode or store separately
            tickLower: 0, // Would need to decode or store separately
            tickUpper: 0, // Would need to decode or store separately
            salt: '', // Would need to decode or store separately
            liquidity: liquidity.toString(),
            fundingOwed: fundingOwed.toString(),
            fundingSnapshot: fundingSnapshot.toString()
          })
        }
      }
    })

    setPositions(processedPositions)
    setLoading(false)
  }, [positionKeys, positionDetails, userAddress])

  // Initial load
  useEffect(() => {
    if (userAddress) {
      refreshPositions()
    }
  }, [userAddress])

  return {
    positions,
    loading,
    error,
    refresh: refreshPositions
  }
}

// Alternative hook using PositionManager contract
export function useUserLPPositionsWithManager(userAddress?: string) {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { data, refetch, isLoading } = useReadContracts({
    contracts: userAddress ? [{
      address: process.env.NEXT_PUBLIC_POSITION_MANAGER_ADDRESS as `0x${string}`,
      abi: positionManagerABI,
      functionName: 'getUserPositions',
      args: [userAddress]
    }] : [],
    query: {
      enabled: !!userAddress
    }
  })

  // Watch for position events to trigger refresh
  useWatchContractEvent({
    address: process.env.NEXT_PUBLIC_ARTH_HOOK_ADDRESS as `0x${string}`,
    abi: arthHookABI,
    eventName: 'PositionUpdated',
    args: userAddress ? { owner: userAddress } : {},
    onLogs: () => refetch(),
  })

  useEffect(() => {
    setLoading(isLoading)
    
    if (data?.[0]?.result) {
      const rawPositions = data[0].result as any[]
      const processedPositions = rawPositions.map((pos: any) => ({
        key: pos.key,
        owner: pos.owner,
        poolId: pos.poolId,
        tickLower: pos.tickLower,
        tickUpper: pos.tickUpper,
        salt: pos.salt,
        liquidity: pos.liquidity.toString(),
        fundingOwed: pos.fundingOwed.toString(),
        fundingSnapshot: pos.fundingGrowthSnapshot.toString()
      }))
      
      setPositions(processedPositions)
    } else {
      setPositions([])
    }
  }, [data, isLoading])

  return {
    positions,
    loading,
    error,
    refresh: refetch
  }
}

// Hook for scanning positions (fallback method)
export function useUserLPPositionsScan(userAddress?: string) {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)

  // Common parameters to scan
  const poolIds = [
    '0x05b0d5045f348ab0ad325ccbadaf168addfb2199cdcac1ca09aba2ca984ad79b',
    '0x7600d12bd88c3969c20139cca7822bb5b995aebadb8edf8f5d00d22240cd1bac',
    '0x28c89adadd937ec0941e66d5475bee018a568a0d1161ba1cb8096d35b1788071',
    '0xbce5cdd64f1bb45585bf81b546d4d24d9cdc8e639f24470d154ecc46496462ac'
  ]
  
  const tickLowers = [-46080, -23040, -11520, -120, -60]
  const tickUppers = [46080, 23040, 11520, 120, 60]
  const salts = [
    '0x0000000000000000000000000000000000000000000000000000000000000000',
    '0x0000000000000000000000000000000000000000000000000000000000000001',
    '0x0000000000000000000000000000000000000000000000000000000000000002'
  ]

  const { data } = useReadContracts({
    contracts: userAddress ? [{
      address: process.env.NEXT_PUBLIC_POSITION_MANAGER_ADDRESS as `0x${string}`,
      abi: positionManagerABI,
      functionName: 'scanUserPositions',
      args: [userAddress, poolIds, tickLowers, tickUppers, salts]
    }] : [],
    query: {
      enabled: !!userAddress
    }
  })

  useEffect(() => {
    if (data?.[0]?.result) {
      const foundPositions = data[0].result as any[]
      setPositions(foundPositions.map((pos: any) => ({
        key: pos.key,
        owner: pos.owner,
        poolId: pos.poolId,
        tickLower: pos.tickLower,
        tickUpper: pos.tickUpper,
        salt: pos.salt,
        liquidity: pos.liquidity.toString(),
        fundingOwed: pos.fundingOwed.toString(),
        fundingSnapshot: pos.fundingGrowthSnapshot.toString()
      })))
    }
    setLoading(false)
  }, [data])

  return { positions, loading }
}