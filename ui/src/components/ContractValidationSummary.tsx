import { useChainId } from 'wagmi';
import { getValidationSummary } from '../utils/contractValidation';

export default function ContractValidationSummary() {
  const chainId = useChainId();
  const validation = getValidationSummary(chainId);

  if (validation.contract.isValid && validation.network?.isSupported) {
    return (
      <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-3 mb-4">
        <div className="flex items-center text-emerald-400">
          <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
          <span className="text-sm font-medium">All Contract Interactions Ready ✓</span>
        </div>
        <div className="text-xs text-emerald-300/80 mt-1">
          {validation.contract.summary.totalPools} pools configured • {validation.network.networkName}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4 mb-4">
      <div className="text-red-400 font-medium mb-2">Contract Setup Issues</div>
      
      {!validation.network?.isSupported && (
        <div className="text-red-300 text-sm mb-2">
          ❌ Wrong network: {validation.network?.networkName} (expected: Sepolia)
        </div>
      )}
      
      {validation.contract.issues.map((issue, index) => (
        <div key={index} className="text-red-300 text-sm mb-1">
          ❌ {issue}
        </div>
      ))}
      
      <div className="mt-3 p-2 bg-red-900/30 rounded text-xs text-red-200">
        <div className="font-medium">Summary:</div>
        <div>Pools: {validation.contract.summary.totalPools}</div>
        <div>Addresses: {validation.contract.summary.foundAddresses}/{validation.contract.summary.requiredAddresses}</div>
        <div>Network: {validation.network?.networkName || 'Unknown'}</div>
      </div>
    </div>
  );
}