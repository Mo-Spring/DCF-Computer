
export interface YearProjection {
  year: number;
  fcf: number;
  pv: number;
}

export interface DCFInputs {
  initialFCF: number;
  growthRate: number;
  years: number;
  discountRate: number;
  terminalGrowthRate: number;
  netDebt: number;
  sharesOutstanding: number;
  marginOfSafety: number;
  currentPrice: number;
  eps: number;
  bvps: number;
  sps: number;
  ocfps: number;
  dividendPerShare: number;
  asOfDate?: string; // 数据基准日期
  confidenceScore?: number; // 可信度评分
}

export interface MetricPercentile {
  current: number;
  min10Y: number;
  max10Y: number;
  percentile: number;
}

export interface DCFResult {
  projections: YearProjection[];
  intrinsicValuePerShare: number;
  safeBuyPrice: number;
  enterpriseValue: number;
  equityValue: number;
  pe: MetricPercentile;
  pb: MetricPercentile;
  ps: MetricPercentile;
  pcf: MetricPercentile;
  dy: MetricPercentile;
  companyType: string;
  focusMetrics: string[];
  metadata?: {
    lastUpdated: string;
    sourceCount: number;
  };
}
