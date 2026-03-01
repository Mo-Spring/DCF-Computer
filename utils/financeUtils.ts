
import { DCFInputs, DCFResult, MetricPercentile } from '../types';

const calculatePercentile = (current: number, min: number, max: number): number => {
  if (max === min) return 50;
  const p = ((current - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, p));
};

export const calculateValuation = (inputs: DCFInputs, historicalRanges: any, aiContext?: any): DCFResult => {
  const {
    initialFCF, growthRate, years, discountRate, terminalGrowthRate,
    netDebt, sharesOutstanding, marginOfSafety, currentPrice, eps, bvps, sps, ocfps, dividendPerShare
  } = inputs;

  // --- DCF 核心计算 ---
  const g = growthRate / 100;
  const wacc = discountRate / 100;
  const tg = Math.min(terminalGrowthRate / 100, wacc - 0.005);
  
  const projections = [];
  let currentFCF = initialFCF;
  let pvOfCashFlows = 0;
  for (let i = 1; i <= years; i++) {
    currentFCF *= (1 + g);
    const pv = currentFCF / Math.pow(1 + wacc, i);
    projections.push({ year: i, fcf: currentFCF, pv });
    pvOfCashFlows += pv;
  }

  const lastYearFCF = projections.length > 0 ? projections[projections.length - 1].fcf : initialFCF;
  const terminalValue = (lastYearFCF * (1 + tg)) / (wacc - tg);
  const pvOfTerminalValue = terminalValue / Math.pow(1 + wacc, years);
  
  const enterpriseValue = pvOfCashFlows + pvOfTerminalValue;
  
  // 关键：权益价值 = 企业价值 - 净负债。如果净负债是负数(现金多)，这里会变成加号。
  const equityValue = enterpriseValue - netDebt;
  
  const intrinsicValuePerShare = (sharesOutstanding > 0 && equityValue > 0) 
    ? (equityValue / sharesOutstanding) 
    : 0;
    
  const safeBuyPrice = intrinsicValuePerShare * (1 - marginOfSafety / 100);

  // --- 相对估值指标 ---
  const peVal = eps > 0 ? currentPrice / eps : 0;
  const pbVal = bvps > 0 ? currentPrice / bvps : 0;
  const psVal = sps > 0 ? currentPrice / sps : 0;
  const pcfVal = ocfps > 0 ? currentPrice / ocfps : 0;
  const dyVal = currentPrice > 0 ? (dividendPerShare / currentPrice) * 100 : 0;

  return {
    projections,
    intrinsicValuePerShare,
    safeBuyPrice,
    enterpriseValue,
    equityValue,
    companyType: aiContext?.type || "通用型企业",
    focusMetrics: aiContext?.focusMetrics || ["P/E", "股息率"],
    pe: {
      current: peVal,
      min10Y: historicalRanges?.pe?.min || peVal * 0.7,
      max10Y: historicalRanges?.pe?.max || peVal * 1.3,
      percentile: calculatePercentile(peVal, historicalRanges?.pe?.min, historicalRanges?.pe?.max)
    },
    pb: {
      current: pbVal,
      min10Y: historicalRanges?.pb?.min || pbVal * 0.7,
      max10Y: historicalRanges?.pb?.max || pbVal * 1.3,
      percentile: calculatePercentile(pbVal, historicalRanges?.pb?.min, historicalRanges?.pb?.max)
    },
    ps: {
      current: psVal,
      min10Y: historicalRanges?.ps?.min || psVal * 0.7,
      max10Y: historicalRanges?.ps?.max || psVal * 1.3,
      percentile: calculatePercentile(psVal, historicalRanges?.ps?.min, historicalRanges?.ps?.max)
    },
    pcf: {
      current: pcfVal,
      min10Y: historicalRanges?.pcf?.min || pcfVal * 0.7,
      max10Y: historicalRanges?.pcf?.max || pcfVal * 1.3,
      percentile: calculatePercentile(pcfVal, historicalRanges?.pcf?.min, historicalRanges?.pcf?.max)
    },
    dy: {
      current: dyVal,
      min10Y: historicalRanges?.dy?.min || dyVal * 0.5,
      max10Y: historicalRanges?.dy?.max || dyVal * 1.5,
      percentile: calculatePercentile(dyVal, historicalRanges?.dy?.min, historicalRanges?.dy?.max)
    }
  };
};

export const formatCurrency = (value: number) => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (absValue >= 100000000) return sign + (absValue / 100000000).toFixed(2) + ' 亿';
  if (absValue >= 10000) return sign + (absValue / 10000).toFixed(2) + ' 万';
  return sign + value.toFixed(2);
};

export const getPercentileColor = (p: number, isHighGood: boolean = false) => {
  if (isHighGood) {
    if (p > 70) return 'text-emerald-600 bg-emerald-50';
    if (p < 30) return 'text-rose-600 bg-rose-50';
  } else {
    if (p < 30) return 'text-emerald-600 bg-emerald-50';
    if (p > 70) return 'text-rose-600 bg-rose-50';
  }
  return 'text-amber-600 bg-amber-50';
};
