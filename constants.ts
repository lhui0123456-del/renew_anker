import { BusinessMetrics, HistoricalData, SimulationResult } from "./types";

export const DEFAULT_METRICS: BusinessMetrics = {
  inventoryLevel: 5000,
  materialCostPerUnit: 15.50,
  laborEfficiency: 12, // units produced per hour
  laborCostPerHour: 25.00,
  salesVolume: 4200,
  salesPrice: 45.00,
  marketingSpend: 15000,
  customMetrics: {}
};

export const calculatePnL = (metrics: BusinessMetrics): SimulationResult => {
  const revenue = metrics.salesVolume * metrics.salesPrice;
  
  // COGS Calculation
  const totalMaterialCost = metrics.salesVolume * metrics.materialCostPerUnit;
  const totalLaborHours = metrics.salesVolume / metrics.laborEfficiency;
  const totalLaborCost = totalLaborHours * metrics.laborCostPerHour;
  const cogs = totalMaterialCost + totalLaborCost;

  const grossProfit = revenue - cogs;
  
  // Operating Expenses (Simplified model: Marketing + 10% inventory holding cost estimate)
  const holdingCost = (metrics.inventoryLevel - metrics.salesVolume) * 2.5; // Hypothetical holding cost per unsold unit
  const operatingExpenses = metrics.marketingSpend + (holdingCost > 0 ? holdingCost : 0);

  const netProfit = grossProfit - operatingExpenses;
  const profitMargin = (netProfit / revenue) * 100;

  return {
    revenue,
    cogs,
    grossProfit,
    operatingExpenses,
    netProfit,
    profitMargin
  };
};

// Mock Historical Data for last 6 months
export const HISTORICAL_DATA: HistoricalData[] = [
  { month: 'Jan', metrics: { ...DEFAULT_METRICS, salesVolume: 3800, materialCostPerUnit: 14.00 }, result: calculatePnL({ ...DEFAULT_METRICS, salesVolume: 3800, materialCostPerUnit: 14.00 }) },
  { month: 'Feb', metrics: { ...DEFAULT_METRICS, salesVolume: 3900, materialCostPerUnit: 14.20 }, result: calculatePnL({ ...DEFAULT_METRICS, salesVolume: 3900, materialCostPerUnit: 14.20 }) },
  { month: 'Mar', metrics: { ...DEFAULT_METRICS, salesVolume: 4100, materialCostPerUnit: 14.50 }, result: calculatePnL({ ...DEFAULT_METRICS, salesVolume: 4100, materialCostPerUnit: 14.50 }) },
  { month: 'Apr', metrics: { ...DEFAULT_METRICS, salesVolume: 4050, materialCostPerUnit: 15.00 }, result: calculatePnL({ ...DEFAULT_METRICS, salesVolume: 4050, materialCostPerUnit: 15.00 }) },
  { month: 'May', metrics: { ...DEFAULT_METRICS, salesVolume: 4300, materialCostPerUnit: 15.20 }, result: calculatePnL({ ...DEFAULT_METRICS, salesVolume: 4300, materialCostPerUnit: 15.20 }) },
  { month: 'Jun', metrics: { ...DEFAULT_METRICS, salesVolume: 4150, materialCostPerUnit: 15.40 }, result: calculatePnL({ ...DEFAULT_METRICS, salesVolume: 4150, materialCostPerUnit: 15.40 }) },
];