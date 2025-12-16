import React, { useRef, useState } from 'react';
import { BusinessMetrics } from '../types';
import { read, utils } from 'xlsx';

interface Props {
  metrics: BusinessMetrics;
  onChange: (metrics: BusinessMetrics) => void;
}

const METRIC_LABELS: Record<string, keyof BusinessMetrics> = {
  "Inventory Level": "inventoryLevel",
  "Material Cost Per Unit": "materialCostPerUnit",
  "Labor Efficiency": "laborEfficiency",
  "Labor Cost Per Hour": "laborCostPerHour",
  "Sales Volume": "salesVolume",
  "Sales Price": "salesPrice",
  "Marketing Spend": "marketingSpend"
};

const InputForm: React.FC<Props> = ({ metrics, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [newCustomKey, setNewCustomKey] = useState('');
  const [newCustomValue, setNewCustomValue] = useState('');

  const handleChange = (key: keyof BusinessMetrics, value: string) => {
    onChange({
      ...metrics,
      [key]: parseFloat(value) || 0
    });
  };

  const handleCustomMetricChange = (key: string, value: string) => {
    onChange({
      ...metrics,
      customMetrics: {
        ...metrics.customMetrics,
        [key]: value
      }
    });
  };

  const removeCustomMetric = (key: string) => {
    const newCustom = { ...metrics.customMetrics };
    delete newCustom[key];
    onChange({
      ...metrics,
      customMetrics: newCustom
    });
  };

  const addCustomMetric = () => {
    if (newCustomKey && newCustomValue) {
      handleCustomMetricChange(newCustomKey, newCustomValue);
      setNewCustomKey('');
      setNewCustomValue('');
    }
  };

  const processFile = async (file: File) => {
    try {
        setUploadStatus('Processing...');
        const arrayBuffer = await file.arrayBuffer();
        const workbook = read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = utils.sheet_to_json<any>(worksheet);

        const newMetrics = { ...metrics };
        const newCustomMetrics = { ...metrics.customMetrics };
        let updatedCount = 0;

        jsonData.forEach((row) => {
            // Support multiple column header variations
            const keyName = row['Metric'] || row['Parameter'] || row['Name'] || row['Indicator'];
            const val = row['Value'];

            if (keyName && val !== undefined) {
                const trimmedKey = keyName.toString().trim();
                const coreMetricKey = METRIC_LABELS[trimmedKey];

                if (coreMetricKey) {
                    // It's a core metric
                    (newMetrics as any)[coreMetricKey] = parseFloat(val);
                    updatedCount++;
                } else {
                    // It's a custom metric - add to customMetrics map
                    // Attempt to parse number if possible, else keep string
                    const numVal = parseFloat(val);
                    newCustomMetrics[trimmedKey] = isNaN(numVal) ? val : numVal;
                    updatedCount++;
                }
            }
        });

        newMetrics.customMetrics = newCustomMetrics;

        if (updatedCount > 0) {
            onChange(newMetrics);
            setUploadStatus(`Success! Imported ${updatedCount} data points.`);
        } else {
            setUploadStatus('Warning: No readable data found. Check column headers "Metric" and "Value".');
        }

        setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
        console.error(error);
        setUploadStatus('Error parsing file. Ensure it is a valid Excel/CSV.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
        processFile(e.dataTransfer.files[0]);
    }
  };

  const downloadTemplate = () => {
      const headers = ['Metric', 'Value'];
      const coreRows = Object.entries(METRIC_LABELS).map(([label, key]) => [label, metrics[key]]);
      const customRows = Object.entries(metrics.customMetrics).map(([key, val]) => [key, val]);
      
      const csvContent = [
          headers.join(','),
          ...coreRows.map(row => row.join(',')),
          ...customRows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'smartbiz_template.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
        
        {/* Import/Export Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex justify-between items-center">
                <span>Data Import (Excel/CSV)</span>
                <button 
                    onClick={downloadTemplate}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download Template
                </button>
            </h3>
            
            <div 
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
            >
                <div className="mb-2 text-gray-400">
                    <svg className="mx-auto h-10 w-10" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                    Drag and drop your Excel file here
                </p>
                <p className="text-xs text-gray-400 mb-3">Supported columns: "Metric", "Value"</p>
                
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                />
                
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                >
                    Browse Files
                </button>
                
                {uploadStatus && (
                    <p className={`mt-3 text-sm font-medium ${uploadStatus.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                        {uploadStatus}
                    </p>
                )}
            </div>
        </div>

        {/* Core Parameters Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Core Operational Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Inventory Group */}
              <div className="space-y-3">
              <h4 className="text-sm font-medium text-blue-600 uppercase tracking-wider">Inventory & Cost</h4>
              <div>
                  <label className="block text-sm text-gray-600 mb-1">Inventory Level (Units)</label>
                  <input
                  type="number"
                  value={metrics.inventoryLevel}
                  onChange={(e) => handleChange('inventoryLevel', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
              </div>
              <div>
                  <label className="block text-sm text-gray-600 mb-1">Material Cost / Unit ($)</label>
                  <input
                  type="number"
                  value={metrics.materialCostPerUnit}
                  onChange={(e) => handleChange('materialCostPerUnit', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
              </div>
              </div>

              {/* Efficiency Group */}
              <div className="space-y-3">
              <h4 className="text-sm font-medium text-blue-600 uppercase tracking-wider">Efficiency</h4>
              <div>
                  <label className="block text-sm text-gray-600 mb-1">Labor Efficiency (Units/Hr)</label>
                  <input
                  type="number"
                  value={metrics.laborEfficiency}
                  onChange={(e) => handleChange('laborEfficiency', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
              </div>
              <div>
                  <label className="block text-sm text-gray-600 mb-1">Labor Cost / Hour ($)</label>
                  <input
                  type="number"
                  value={metrics.laborCostPerHour}
                  onChange={(e) => handleChange('laborCostPerHour', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
              </div>
              </div>

              {/* Sales Group */}
              <div className="space-y-3">
              <h4 className="text-sm font-medium text-blue-600 uppercase tracking-wider">Sales & Marketing</h4>
              <div>
                  <label className="block text-sm text-gray-600 mb-1">Sales Volume (Units)</label>
                  <input
                  type="number"
                  value={metrics.salesVolume}
                  onChange={(e) => handleChange('salesVolume', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
              </div>
              <div>
                  <label className="block text-sm text-gray-600 mb-1">Sales Price ($)</label>
                  <input
                  type="number"
                  value={metrics.salesPrice}
                  onChange={(e) => handleChange('salesPrice', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
              </div>
              <div>
                  <label className="block text-sm text-gray-600 mb-1">Marketing Spend ($)</label>
                  <input
                  type="number"
                  value={metrics.marketingSpend}
                  onChange={(e) => handleChange('marketingSpend', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
              </div>
              </div>

          </div>
        </div>

        {/* Custom Metrics Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Metrics & Indicators</h3>
            <p className="text-sm text-gray-500 mb-4">Add any other relevant business data here (e.g., Competitor Price, Weather Condition, Customer Sentiment). The AI Analyst will include these in its evaluation.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
               {Object.entries(metrics.customMetrics).map(([key, val]) => (
                   <div key={key} className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                       <div className="flex-1">
                           <p className="text-xs font-bold text-gray-500 uppercase">{key}</p>
                           <input 
                              type="text" 
                              value={val} 
                              onChange={(e) => handleCustomMetricChange(key, e.target.value)}
                              className="w-full bg-transparent font-medium text-gray-800 focus:outline-none border-b border-gray-300 focus:border-blue-500"
                           />
                       </div>
                       <button onClick={() => removeCustomMetric(key)} className="text-red-400 hover:text-red-600 p-1">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                       </button>
                   </div>
               ))}
            </div>

            <div className="flex gap-2 items-end">
                <div className="flex-1 max-w-xs">
                    <label className="block text-xs text-gray-500 mb-1">Metric Name</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Employee Churn Rate"
                        value={newCustomKey}
                        onChange={(e) => setNewCustomKey(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                </div>
                <div className="flex-1 max-w-xs">
                    <label className="block text-xs text-gray-500 mb-1">Value</label>
                    <input 
                        type="text" 
                        placeholder="e.g. 5%"
                        value={newCustomValue}
                        onChange={(e) => setNewCustomValue(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                </div>
                <button 
                    onClick={addCustomMetric}
                    className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700 transition mb-[1px]"
                >
                    Add
                </button>
            </div>
        </div>
    </div>
  );
};

export default InputForm;