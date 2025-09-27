import { Card } from '../components/Card';
import Segmented from '../components/Segmented';
import { useState } from 'react';

const RiskMetrics = () => (
  <Card className="mb-6">
    <div className="text-white font-semibold mb-4">Risk Overview</div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="rounded-xl bg-slate-900/40 border border-white/10 p-4">
        <div className="text-xs text-white/60 mb-2">Portfolio VaR (95%)</div>
        <div className="text-2xl font-semibold text-red-400">-$1,247</div>
        <div className="text-xs text-red-400 mt-1">Daily risk estimate</div>
      </div>
      <div className="rounded-xl bg-slate-900/40 border border-white/10 p-4">
        <div className="text-xs text-white/60 mb-2">Interest Rate Beta</div>
        <div className="text-2xl font-semibold">0.67</div>
        <div className="text-xs text-white/60 mt-1">vs market rates</div>
      </div>
      <div className="rounded-xl bg-slate-900/40 border border-white/10 p-4">
        <div className="text-xs text-white/60 mb-2">Duration Risk</div>
        <div className="text-2xl font-semibold">2.3 years</div>
        <div className="text-xs text-yellow-400 mt-1">Moderate sensitivity</div>
      </div>
      <div className="rounded-xl bg-slate-900/40 border border-white/10 p-4">
        <div className="text-xs text-white/60 mb-2">Correlation Score</div>
        <div className="text-2xl font-semibold">0.91</div>
        <div className="text-xs text-emerald-400 mt-1">High diversification</div>
      </div>
    </div>
  </Card>
);

const InterestRateTable = ({ period }: { period: string }) => {
  const rates = [
    { tenor: '3M', fixed: 4.15, floating: 3.89, spread: 0.26 },
    { tenor: '6M', fixed: 4.28, floating: 3.95, spread: 0.33 },
    { tenor: '12M', fixed: 4.42, floating: 4.08, spread: 0.34 },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 text-white/60 text-sm">Tenor</th>
            <th className="text-right py-3 text-white/60 text-sm">Fixed Rate</th>
            <th className="text-right py-3 text-white/60 text-sm">Floating Rate</th>
            <th className="text-right py-3 text-white/60 text-sm">Spread</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((rate) => (
            <tr key={rate.tenor} className="border-b border-white/5">
              <td className="py-3 text-white">{rate.tenor}</td>
              <td className="py-3 text-right text-blue-400">{rate.fixed.toFixed(2)}%</td>
              <td className="py-3 text-right text-emerald-400">{rate.floating.toFixed(2)}%</td>
              <td className="py-3 text-right text-yellow-400">+{rate.spread.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const VolatilityAnalysis = () => {
  const pools = [
    { name: '3M Pool', volatility: 12.4, risk: 'Low' },
    { name: '6M Pool', volatility: 18.7, risk: 'Medium' },
    { name: '12M Pool', volatility: 24.1, risk: 'High' },
  ];

  return (
    <div className="space-y-4">
      {pools.map((pool) => (
        <div key={pool.name} className="flex justify-between items-center p-3 rounded-lg bg-slate-900/40">
          <div>
            <div className="text-white font-medium">{pool.name}</div>
            <div className="text-white/60 text-sm">{pool.volatility}% volatility</div>
          </div>
          <span 
            className={`px-2 py-1 rounded text-xs ${
              pool.risk === 'Low' ? 'bg-emerald-500/15 text-emerald-400' :
              pool.risk === 'Medium' ? 'bg-yellow-500/15 text-yellow-400' :
              'bg-red-500/15 text-red-400'
            }`}
          >
            {pool.risk} Risk
          </span>
        </div>
      ))}
    </div>
  );
};

const YieldCurveTable = () => {
  const yields = [
    { maturity: '1M', current: 2.1, projected: 2.2, change: '+0.1' },
    { maturity: '3M', current: 2.3, projected: 2.5, change: '+0.2' },
    { maturity: '6M', current: 2.8, projected: 3.1, change: '+0.3' },
    { maturity: '1Y', current: 3.2, projected: 3.5, change: '+0.3' },
    { maturity: '2Y', current: 3.8, projected: 4.0, change: '+0.2' },
    { maturity: '3Y', current: 4.1, projected: 4.2, change: '+0.1' },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 text-white/60 text-sm">Maturity</th>
            <th className="text-right py-3 text-white/60 text-sm">Current</th>
            <th className="text-right py-3 text-white/60 text-sm">Projected</th>
            <th className="text-right py-3 text-white/60 text-sm">Change</th>
          </tr>
        </thead>
        <tbody>
          {yields.map((yield_) => (
            <tr key={yield_.maturity} className="border-b border-white/5">
              <td className="py-3 text-white">{yield_.maturity}</td>
              <td className="py-3 text-right text-blue-400">{yield_.current.toFixed(2)}%</td>
              <td className="py-3 text-right text-yellow-400">{yield_.projected.toFixed(2)}%</td>
              <td className="py-3 text-right text-emerald-400">{yield_.change}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function Analytics() {
  const [period, setPeriod] = useState('24h');
  const [analysisType, setAnalysisType] = useState('rates');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Interest Rate & Risk Analysis</h1>
        <div className="text-sm text-white/60">
          Real-time market data and risk metrics
        </div>
      </div>

      <RiskMetrics />

      <div className="flex flex-wrap gap-4 mb-6">
        <Segmented
          value={period}
          onChange={setPeriod}
          options={[
            { label: '24 Hours', value: '24h' },
            { label: '7 Days', value: '7d' },
            { label: '30 Days', value: '30d' },
          ]}
        />
        <Segmented
          value={analysisType}
          onChange={setAnalysisType}
          options={[
            { label: 'Interest Rates', value: 'rates' },
            { label: 'Volatility', value: 'volatility' },
            { label: 'Yield Curve', value: 'curve' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="text-white font-semibold mb-4">
            {analysisType === 'rates' && 'Interest Rate Overview'}
            {analysisType === 'volatility' && 'Pool Volatility Analysis'}
            {analysisType === 'curve' && 'Yield Curve Analysis'}
          </div>
          <div className="min-h-80">
            {analysisType === 'rates' && <InterestRateTable period={period} />}
            {analysisType === 'volatility' && <VolatilityAnalysis />}
            {analysisType === 'curve' && <YieldCurveTable />}
          </div>
        </Card>

        <Card>
          <div className="text-white font-semibold mb-4">Risk Breakdown</div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/40">
              <span className="text-white/80">Interest Rate Risk</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-slate-700 rounded-full">
                  <div className="w-3/5 h-2 bg-yellow-500 rounded-full"></div>
                </div>
                <span className="text-sm text-yellow-400">Medium</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/40">
              <span className="text-white/80">Credit Risk</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-slate-700 rounded-full">
                  <div className="w-1/5 h-2 bg-emerald-500 rounded-full"></div>
                </div>
                <span className="text-sm text-emerald-400">Low</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/40">
              <span className="text-white/80">Liquidity Risk</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-slate-700 rounded-full">
                  <div className="w-2/5 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-sm text-blue-400">Low-Med</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/40">
              <span className="text-white/80">Counterparty Risk</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-slate-700 rounded-full">
                  <div className="w-1/4 h-2 bg-emerald-500 rounded-full"></div>
                </div>
                <span className="text-sm text-emerald-400">Low</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/40">
              <span className="text-white/80">Basis Risk</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-slate-700 rounded-full">
                  <div className="w-4/5 h-2 bg-red-500 rounded-full"></div>
                </div>
                <span className="text-sm text-red-400">High</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="text-white font-medium mb-3">Stress Test Scenarios</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">+200bps rate shock:</span>
                <span className="text-red-400">-$3,247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">-100bps rate shock:</span>
                <span className="text-emerald-400">+$1,623</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Curve inversion:</span>
                <span className="text-yellow-400">-$892</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Volatility spike:</span>
                <span className="text-red-400">-$1,456</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-white font-semibold mb-4">Market Indicators</div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/70 text-sm">Fed Funds Rate</span>
              <span className="text-white">5.25%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70 text-sm">SOFR</span>
              <span className="text-white">5.31%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70 text-sm">10Y Treasury</span>
              <span className="text-white">4.22%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70 text-sm">VIX</span>
              <span className="text-yellow-400">18.7</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70 text-sm">MOVE Index</span>
              <span className="text-yellow-400">102.3</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-white font-semibold mb-4">Pool Performance</div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/70 text-sm">Best Performer</span>
              <span className="text-emerald-400">3M Pool (+1.2%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70 text-sm">Worst Performer</span>
              <span className="text-red-400">12M Pool (-0.8%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70 text-sm">Avg. APR</span>
              <span className="text-white">4.15%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70 text-sm">Total Volume (24h)</span>
              <span className="text-white">$2.1M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70 text-sm">Active Positions</span>
              <span className="text-white">147</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-white font-semibold mb-4">Risk Alerts</div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="text-yellow-400 text-sm font-medium">Medium Risk</div>
              <div className="text-white/70 text-xs mt-1">
                Interest rate volatility increasing
              </div>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-emerald-400 text-sm font-medium">All Clear</div>
              <div className="text-white/70 text-xs mt-1">
                Liquidity levels healthy
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-blue-400 text-sm font-medium">Info</div>
              <div className="text-white/70 text-xs mt-1">
                New pool launching soon
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}