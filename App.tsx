import React, { useState, useEffect } from 'react';
import { AppView, BusinessMetrics, SimulationResult } from './types';
import { DEFAULT_METRICS, calculatePnL, HISTORICAL_DATA } from './constants';
import InputForm from './components/InputForm';
import AnalysisView from './components/AnalysisView';
import SimulationView from './components/SimulationView';
import ImageEditor from './components/ImageEditor';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [metrics, setMetrics] = useState<BusinessMetrics>(DEFAULT_METRICS);
  const [result, setResult] = useState<SimulationResult>(calculatePnL(DEFAULT_METRICS));

  // Recalculate results whenever metrics change
  useEffect(() => {
    setResult(calculatePnL(metrics));
  }, [metrics]);

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
              <p className="text-sm text-gray-500">Net Revenue</p>
              <p className="text-2xl font-bold text-gray-800">${result.revenue.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
              <p className="text-sm text-gray-500">COGS</p>
              <p className="text-2xl font-bold text-gray-800">${result.cogs.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
              <p className="text-sm text-gray-500">Net Profit</p>
              <p className="text-2xl font-bold text-gray-800">${result.netProfit.toLocaleString()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
              <p className="text-sm text-gray-500">Margin</p>
              <p className="text-2xl font-bold text-gray-800">{result.profitMargin.toFixed(1)}%</p>
            </div>

            <div className="col-span-1 lg:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white shadow-md">
                <h2 className="text-xl font-bold mb-2">Welcome to SmartBiz Analyst</h2>
                <p className="opacity-90 mb-4">
                    Your AI-powered assistant for cost analysis, P&L simulation, and product visualization.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setCurrentView(AppView.ANALYSIS)}
                        className="bg-white text-indigo-700 px-4 py-2 rounded font-medium text-sm hover:bg-gray-100 transition"
                    >
                        View Analysis
                    </button>
                    <button 
                        onClick={() => setCurrentView(AppView.SIMULATION)}
                        className="bg-indigo-500 bg-opacity-30 border border-white border-opacity-30 px-4 py-2 rounded font-medium text-sm hover:bg-opacity-40 transition"
                    >
                        Simulate Scenario
                    </button>
                </div>
            </div>

            <div className="col-span-1 lg:col-span-2 bg-white rounded-lg p-6 border border-gray-200">
                 <h3 className="font-semibold text-gray-700 mb-3">Quick Actions</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setCurrentView(AppView.INPUTS)}
                        className="flex flex-col items-center justify-center p-4 border rounded hover:bg-gray-50 transition text-gray-600"
                    >
                        <span className="text-xl mb-1">📝</span>
                        <span className="text-sm font-medium">Update Data</span>
                    </button>
                    <button 
                        onClick={() => setCurrentView(AppView.IMAGE_STUDIO)}
                        className="flex flex-col items-center justify-center p-4 border rounded hover:bg-gray-50 transition text-gray-600"
                    >
                        <span className="text-xl mb-1">✨</span>
                        <span className="text-sm font-medium">Image Studio</span>
                    </button>
                 </div>
            </div>
          </div>
        );
      case AppView.INPUTS:
        return <InputForm metrics={metrics} onChange={setMetrics} />;
      case AppView.ANALYSIS:
        return <AnalysisView currentMetrics={metrics} currentResult={result} history={HISTORICAL_DATA} />;
      case AppView.SIMULATION:
        return <SimulationView initialMetrics={metrics} baseResult={result} />;
      case AppView.IMAGE_STUDIO:
        return <ImageEditor />;
      default:
        return <div>View not found</div>;
    }
  };

  const NavButton = ({ view, label, icon }: { view: AppView; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center space-x-2 px-4 py-3 w-full text-left rounded-md transition mb-1 ${
        currentView === view
          ? 'bg-blue-50 text-blue-700 font-medium'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            <span className="text-blue-600">Smart</span>Biz
          </h1>
          <p className="text-xs text-gray-400 mt-1">AI Decision Support</p>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          <NavButton 
            view={AppView.DASHBOARD} 
            label="Dashboard" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
          />
          <NavButton 
            view={AppView.INPUTS} 
            label="Data Input" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
          />
          <NavButton 
            view={AppView.ANALYSIS} 
            label="Analysis & History" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          />
          <NavButton 
            view={AppView.SIMULATION} 
            label="P&L Simulator" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          />
          <NavButton 
            view={AppView.IMAGE_STUDIO} 
            label="Image Studio" 
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">U</div>
             <div className="text-sm">
                <p className="font-medium text-gray-700">User Admin</p>
                <p className="text-xs text-gray-400">admin@smartbiz.com</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        <header className="mb-8 flex justify-between items-center md:hidden">
             <h1 className="text-xl font-bold text-gray-800">SmartBiz</h1>
             <button className="text-gray-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
             </button>
        </header>

        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {currentView === AppView.DASHBOARD && 'Dashboard Overview'}
              {currentView === AppView.INPUTS && 'Data Entry'}
              {currentView === AppView.ANALYSIS && 'Performance Analysis'}
              {currentView === AppView.SIMULATION && 'P&L Decision Simulator'}
              {currentView === AppView.IMAGE_STUDIO && 'Product Image Studio'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {currentView === AppView.DASHBOARD && 'Key metrics and alerts for your business.'}
              {currentView === AppView.INPUTS && 'Update your core business parameters here.'}
              {currentView === AppView.ANALYSIS && 'Compare current performance against history with AI insights.'}
              {currentView === AppView.SIMULATION && 'Model "What-If" scenarios to see financial impact.'}
              {currentView === AppView.IMAGE_STUDIO && 'Visualize product changes using Generative AI.'}
            </p>
          </div>

          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;