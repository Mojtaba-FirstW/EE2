export interface YearlyData {
  year: number;
  cashFlow: number;
  pv: number;
  fv: number;
}

export interface ProjectMetrics {
  npv: number;
  irr: number;
  totalPv: number;
  totalFv: number;
  initialInvestment: number;
  discountRate: number;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}