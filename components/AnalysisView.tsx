import React, { useEffect, useState } from 'react';
import { BusinessMetrics, SimulationResult, HistoricalData } from '../types';
import { analyzeBusinessPerformance } from '../services/geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ReactMarkdown from 'react-markdown';

interface Props {
  currentMetrics: BusinessMetrics;
  currentResult: SimulationResult;
  history: HistoricalData[];
}

const AnalysisView: React.FC<Props> = ({ currentMetrics, currentResult, history }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [sources, setSources] = useState<Array<{uri: string; title: string}>>([]);
  const [loading, setLoading] = useState(false);

  // Prepare chart data: combine history with current "Forecast/Current" point
  const chartData = [
    ...history.map(h => ({
      name: h.month,
      Revenue: h.result.revenue,
      Profit: h.result.netProfit,
      Margin: h.result.profitMargin
    })),
    {
      name: 'Current',
      Revenue: currentResult.revenue,
      Profit: currentResult.netProfit,
      Margin: currentResult.profitMargin
    }
  ];

  const handleRunAnalysis = async () => {
    setLoading(true);
    const historySummary = history.map(h => `${h.month}: NetProfit=${h.result.netProfit}`).join(', ');
    const result = await analyzeBusinessPerformance(currentMetrics, currentResult, historySummary);
    setAnalysis(result.markdown);
    setSources(result.groundingUrls || []);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Charts Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Historical Trend & Current Status</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="Revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line yAxisId="left" type="monotone" dataKey="Profit" stroke="#82ca9d" />
              <Line yAxisId="right" type="monotone" dataKey="Margin" stroke="#ff7300" name="Margin %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Anomaly & Market Analysis
          </h3>
          <button
            onClick={handleRunAnalysis}
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white font-medium transition ${
              loading ? 'bg-purple-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {loading ? 'Analyzing with Gemini...' : 'Analyze Anomalies'}
          </button>
        </div>

        <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded-md border border-gray-100 min-h-[150px]">
          {analysis ? (
            <ReactMarkdown>{analysis}</ReactMarkdown>
          ) : (
            <p className="text-gray-400 italic">Click "Analyze Anomalies" to generate insights based on internal data and Google Search trends.</p>
          )}
        </div>

        {/* Grounding Sources */}
        {sources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Sources (Google Search Grounding)</h4>
            <ul className="space-y-1">
              {sources.map((source, idx) => (
                <li key={idx}>
                  <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisView;