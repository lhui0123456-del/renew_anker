import React, { useState, useEffect } from 'react';
import { BusinessMetrics, SimulationResult } from '../types';
import { calculatePnL } from '../constants';
import { simulateDecisionImpact } from '../services/geminiService';

interface Props {
  initialMetrics: BusinessMetrics;
  baseResult: SimulationResult;
}

const SimulationView: React.FC<Props> = ({ initialMetrics, baseResult }) => {
  const [simMetrics, setSimMetrics] = useState<BusinessMetrics>(initialMetrics);
  const [simResult, setSimResult] = useState<SimulationResult>(baseResult);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSimResult(calculatePnL(simMetrics));
  }, [simMetrics]);

  const handleSlide = (key: keyof BusinessMetrics, val: number) => {
    setSimMetrics(prev => ({ ...prev, [key]: val }));
  };

  const getDiffColor = (curr: number, base: number) => {
    if (curr > base) return 'text-green-600';
    if (curr < base) return 'text-red-600';
    return 'text-gray-500';
  };

  const explainImpact = async () => {
    setLoading(true);
    const diff = {
        profitDiff: simResult.netProfit - baseResult.netProfit,
        marginDiff: simResult.profitMargin - baseResult.profitMargin
    }
    const text = await simulateDecisionImpact(initialMetrics, simMetrics, diff);
    setAiInsight(text);
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Decision Simulator</h3>
            <button 
                onClick={() => setSimMetrics(initialMetrics)}
                className="text-xs text-blue-600 hover:underline"
            >
                Reset to Base
            </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <label>Sales Price ($)</label>
              <span className="font-bold">{simMetrics.salesPrice}</span>
            </div>
            <input 
              type="range" min="10" max="100" step="0.5"
              value={simMetrics.salesPrice}
              onChange={(e) => handleSlide('salesPrice', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <label>Marketing Spend ($)</label>
              <span className="font-bold">{simMetrics.marketingSpend}</span>
            </div>
            <input 
              type="range" min="5000" max="50000" step="500"
              value={simMetrics.marketingSpend}
              onChange={(e) => handleSlide('marketingSpend', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

           <div>
            <div className="flex justify-between text-sm mb-1">
              <label>Inventory Level (Units)</label>
              <span className="font-bold">{simMetrics.inventoryLevel}</span>
            </div>
            <input 
              type="range" min="1000" max="10000" step="100"
              value={simMetrics.inventoryLevel}
              onChange={(e) => handleSlide('inventoryLevel', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        <button 
            onClick={explainImpact}
            disabled={loading}
            className="mt-8 w-full py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition flex justify-center items-center"
        >
            {loading ? (
                 <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            ) : "Calculate Impact on P&L"}
        </button>
      </div>

      {/* Results */}
      <div className="space-y-6">
        <div className="bg-gray-900 text-white p-6 rounded-lg shadow-md">
            <h4 className="text-sm uppercase tracking-widest text-gray-400 mb-4">Simulated P&L</h4>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-gray-400 text-xs">Net Profit</p>
                    <p className={`text-2xl font-bold ${getDiffColor(simResult.netProfit, baseResult.netProfit)}`}>
                        ${simResult.netProfit.toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </p>
                    <p className="text-xs text-gray-500">Base: ${baseResult.netProfit.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-xs">Margin</p>
                    <p className={`text-2xl font-bold ${getDiffColor(simResult.profitMargin, baseResult.profitMargin)}`}>
                        {simResult.profitMargin.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">Base: {baseResult.profitMargin.toFixed(1)}%</p>
                </div>
            </div>
        </div>

        {aiInsight && (
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded shadow-sm">
                <h5 className="font-bold text-indigo-900 text-sm mb-2">AI Strategic Insight</h5>
                <p className="text-sm text-indigo-800 leading-relaxed">{aiInsight}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default SimulationView;