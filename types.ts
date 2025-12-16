export interface BusinessMetrics {
  inventoryLevel: number; // Units
  materialCostPerUnit: number; // Currency
  laborEfficiency: number; // Units per Hour
  laborCostPerHour: number; // Currency
  salesVolume: number; // Units
  salesPrice: number; // Currency
  marketingSpend: number; // Currency
  customMetrics: Record<string, string | number>; // Dynamic metrics for AI analysis
}

export interface SimulationResult {
  revenue: number;
  cogs: number; // Cost of Goods Sold
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
  profitMargin: number;
}

export interface HistoricalData {
  month: string;
  metrics: BusinessMetrics;
  result: SimulationResult;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  INPUTS = 'INPUTS',
  ANALYSIS = 'ANALYSIS',
  SIMULATION = 'SIMULATION',
  IMAGE_STUDIO = 'IMAGE_STUDIO'
}

export interface AnalysisResponse {
  markdown: string;
  groundingUrls?: Array<{uri: string; title: string}>;
}