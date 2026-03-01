
import React from 'react';
import { DCFResult, MetricPercentile } from '../types';
import { getPercentileColor } from '../utils/financeUtils';

const RowMetric: React.FC<{ 
  label: string; 
  metric: MetricPercentile; 
  suffix?: string; 
  isHighGood?: boolean; 
  isFocus?: boolean;
  customValue?: string;
}> = ({ label, metric, suffix = "", isHighGood = false, isFocus = false, customValue }) => (
  <div className={`group flex flex-col p-5 rounded-[2rem] border transition-all duration-300 ${isFocus ? 'bg-indigo-50/40 border-indigo-200 ring-4 ring-indigo-500/5' : 'bg-white/80 border-slate-100 hover:border-indigo-200'}`}>
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2.5">
        <div className={`w-1.5 h-1.5 rounded-full ${isFocus ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'}`}></div>
        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-[0.15em]">{label}</span>
      </div>
      <div className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-tight ${getPercentileColor(metric.percentile, isHighGood)}`}>
        {metric.percentile.toFixed(1)}% <span className="opacity-60 ml-0.5">历史分位</span>
      </div>
    </div>
    
    <div className="flex items-end justify-between gap-6">
      <div className="text-3xl font-black text-slate-900 tracking-tighter">
        {customValue ? customValue : metric.current.toFixed(2)}
        {suffix && <span className="text-sm ml-1 font-bold text-slate-400">{suffix}</span>}
      </div>
      <div className="flex-1 max-w-[120px] mb-2">
        <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${
            isHighGood 
            ? (metric.percentile > 70 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : metric.percentile < 30 ? 'bg-rose-500' : 'bg-amber-400')
            : (metric.percentile < 30 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : metric.percentile > 70 ? 'bg-rose-500' : 'bg-amber-400')
          }`} style={{ width: `${metric.percentile}%` }}></div>
        </div>
      </div>
    </div>
  </div>
);

const ResultsView: React.FC<{ results: DCFResult; currentPrice: number; inputs?: any }> = ({ results, currentPrice, inputs }) => {
  const isSafe = currentPrice <= results.safeBuyPrice && results.safeBuyPrice > 0;
  const valuationDiff = ((currentPrice - results.intrinsicValuePerShare) / results.intrinsicValuePerShare * 100);
  const potentialUpside = results.intrinsicValuePerShare > currentPrice ? ((results.intrinsicValuePerShare - currentPrice) / currentPrice * 100) : 0;

  const earningsYield = results.pe.current > 0 ? (1 / results.pe.current) * 100 : 0;
  const riskPremium = earningsYield - 2.5;

  return (
    <div className="space-y-8 pb-10">
      {/* 1. 核心看板 - 高级黑卡设计 */}
      <div className="relative group">
        <div className={`absolute -inset-1 rounded-[3rem] blur-xl opacity-20 transition duration-1000 group-hover:opacity-30 ${isSafe ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
        
        <div className="relative bg-white rounded-[2.5rem] border border-slate-200/60 shadow-2xl overflow-hidden flex flex-col">
          <div className={`p-10 text-center relative overflow-hidden transition-colors duration-500 ${isSafe ? 'bg-slate-950' : 'bg-slate-900'}`}>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }}></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl mb-8">
                <div className={`w-2 h-2 rounded-full ${isSafe ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-indigo-400'}`}></div>
                <span className="text-[11px] font-black text-white/80 uppercase tracking-[0.2em]">{results.companyType}</span>
              </div>
              
              <div className="text-white space-y-2">
                <h2 className="text-[11px] font-extrabold opacity-40 uppercase tracking-[0.3em]">每股内在价值评估 / DCF Valuation</h2>
                <div className="text-7xl font-black tracking-tighter flex items-center justify-center gap-2">
                  <span className="text-3xl font-light text-white/30 -mt-2">¥</span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">{results.intrinsicValuePerShare.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center gap-8 opacity-40">
              <div className="text-center">
                <div className="text-[8px] text-white font-black uppercase tracking-widest mb-1">审计信心 / Confidence</div>
                <div className="text-xs text-white font-bold">{inputs?.confidenceScore || 0}%</div>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div className="text-center">
                <div className="text-[8px] text-white font-black uppercase tracking-widest mb-1">数据基准 / Base Date</div>
                <div className="text-xs text-white font-bold">{inputs?.asOfDate || '--'}</div>
              </div>
            </div>
          </div>

          <div className="flex divide-x divide-slate-100 bg-slate-50/50 border-b border-slate-100">
            <div className="flex-1 p-7 text-center">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.1em] mb-1">当前市场价格</div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">¥{currentPrice.toFixed(2)}</div>
            </div>
            <div className="flex-1 p-7 text-center">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.1em] mb-1">估值偏离度</div>
              <div className={`text-3xl font-black tracking-tighter ${valuationDiff > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {valuationDiff > 0 ? '+' : ''}{valuationDiff.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="p-8 bg-white">
            <div className="grid grid-cols-2 gap-5 mb-6">
              <div className="p-5 bg-emerald-50/50 rounded-[2rem] border border-emerald-100/50 transition-transform hover:scale-[1.02]">
                <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest mb-2 block">建议买入价</span>
                <span className="text-2xl font-black text-emerald-600 tracking-tight">¥{results.safeBuyPrice.toFixed(2)}</span>
              </div>
              <div className="p-5 bg-indigo-50/50 rounded-[2rem] border border-indigo-100/50 text-right transition-transform hover:scale-[1.02]">
                <span className="text-[9px] font-black text-indigo-800 uppercase tracking-widest mb-2 block">预期上涨空间</span>
                <span className="text-2xl font-black text-indigo-600 tracking-tight">+{potentialUpside.toFixed(1)}%</span>
              </div>
            </div>
            
            <div className={`p-5 rounded-[1.5rem] text-sm font-black text-center flex items-center justify-center gap-3 transition-all ${isSafe ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'bg-slate-100 text-slate-400'}`}>
              {isSafe ? (
                <><span className="text-xl">✨</span> 当前股价极具吸引力，具备安全边际</>
              ) : (
                <><span className="text-xl">⏳</span> 目前估值溢价，建议等待合理价格</>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2 mb-2">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">多维估值锚点对照 / Matrix</h3>
          <div className="h-px flex-1 bg-slate-100 ml-4"></div>
        </div>
        
        <div className="grid gap-4">
          <RowMetric label="P/E 市盈率" metric={results.pe} isFocus={results.focusMetrics.includes("P/E") || results.focusMetrics.includes("PE")} />
          <RowMetric label="P/B 市净率" metric={results.pb} isFocus={results.focusMetrics.includes("P/B") || results.focusMetrics.includes("PB")} />
          <RowMetric label="DY 股息率" metric={results.dy} suffix="%" isHighGood={true} isFocus={results.focusMetrics.includes("股息") || results.focusMetrics.includes("DY")} />
          <RowMetric label="ERP 风险溢价" metric={{ ...results.pe, current: riskPremium, percentile: 100 - results.pe.percentile }} suffix="%" isHighGood={true} customValue={`${riskPremium.toFixed(2)}%`} />
          <RowMetric label="P/S 市销率" metric={results.ps} isFocus={results.focusMetrics.includes("P/S") || results.focusMetrics.includes("PS")} />
          <RowMetric label="P/CF 市现率" metric={results.pcf} isFocus={results.focusMetrics.includes("P/CF") || results.focusMetrics.includes("PCF")} />
        </div>
      </div>

      <div className="glass-panel p-7 rounded-[2.5rem] border border-slate-200 flex items-start gap-5 shadow-sm">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0 shadow-lg rotate-3">
          <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-1.5">审计上下文说明 / Audit Note</h4>
          <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
            本报告由 <span className="text-indigo-600">智汇金融 2.5 引擎</span> 实时驱动。
            数据更新于 <span className="font-bold text-slate-700">{inputs?.asOfDate}</span>。模型已根据 <span className="text-slate-700 font-bold">{results.companyType}</span> 的行业特质自动调整了估值权重。
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
