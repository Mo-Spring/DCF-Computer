
import React, { useState, useEffect, useCallback } from 'react';
import InputSection from './components/InputSection';
import ResultsView from './components/ResultsView';
import { DCFInputs, DCFResult } from './types';
import { calculateValuation } from './utils/financeUtils';
import { getFinancialInsights, fetchCompanyData } from './services/geminiService';

const DEFAULT_INPUTS: DCFInputs = {
  initialFCF: 1000000, growthRate: 5, years: 5, discountRate: 8, terminalGrowthRate: 2,
  netDebt: 500000, sharesOutstanding: 1000000, marginOfSafety: 20,
  currentPrice: 10, eps: 0.5, bvps: 5, sps: 2, ocfps: 0.8, dividendPerShare: 0.3,
  asOfDate: '2024-Q3', confidenceScore: 85
};

const App: React.FC = () => {
  const [inputs, setInputs] = useState<DCFInputs>(DEFAULT_INPUTS);
  const [historical, setHistorical] = useState<any>(null);
  const [aiContext, setAiContext] = useState<any>(null);
  const [results, setResults] = useState<DCFResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [sources, setSources] = useState<{ title: string; uri: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'results' | 'analysis'>('input');

  const handleCalculate = useCallback(() => {
    const res = calculateValuation(inputs, historical, aiContext);
    setResults(res);
  }, [inputs, historical, aiContext]);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setAiAnalysis('');
    try {
      const { data, sources: fetchedSources } = await fetchCompanyData(query);
      if (data) {
        setInputs(prev => ({ ...prev, ...data.inputs }));
        setHistorical(data.historical);
        setAiContext(data.context);
        setSources(fetchedSources);
        const res = calculateValuation(data.inputs, data.historical, data.context);
        setResults(res);
        setActiveTab('results');
      }
    } catch (e: any) { 
      console.error(e);
      alert(`抓取失败: ${e.message || "未知错误"}。请核对公司名或稍后再试。`); 
    }
    finally { setIsSearching(false); }
  };

  const runPressureTest = async () => {
    if (!results) return;
    setIsLoading(true);
    try {
      const insights = await getFinancialInsights(inputs, results);
      setAiAnalysis(insights);
    } catch (e) { setAiAnalysis("无法生成 AI 分析，建议核实输入数据是否在合理区间。"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { handleCalculate(); }, [handleCalculate]);

  return (
    <div className="min-h-screen flex flex-col pb-24 max-w-[100vw] overflow-x-hidden">
      {/* 顶部标题栏 */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 h-16 flex items-center px-6 sticky top-0 z-[100] premium-shadow">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-900 rounded-[1rem] flex items-center justify-center shadow-xl shadow-slate-900/20 rotate-3 transition-transform hover:rotate-0">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[13px] font-black uppercase tracking-[0.2em] text-slate-950 leading-none">DCF计算器</h1>
            <span className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-tighter opacity-60">智能现金流折现评估系统</span>
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="flex-1 w-full max-w-xl mx-auto px-5 py-6">
        {activeTab === 'input' && (
          <InputSection inputs={inputs} setInputs={setInputs} onCalculate={handleCalculate} onSearch={handleSearch} isSearching={isSearching} sources={sources} />
        )}

        {activeTab === 'results' && results && (
          <ResultsView results={results} currentPrice={inputs.currentPrice} inputs={inputs} />
        )}

        {activeTab === 'analysis' && results && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-xl text-center">
              <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner shadow-indigo-100/50">
                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
              </div>
              
              <h3 className="text-xl font-black text-slate-950 mb-4 tracking-tight">AI 深度审计与风险洞察</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10 max-w-[280px] mx-auto">
                针对 <span className="text-indigo-600 font-bold">{results.companyType}</span> 的资产特质，我们将从宏观环境及财务指标钩稽关系进行深度扫描。
              </p>

              {aiAnalysis ? (
                <div className="text-left bg-slate-50/80 p-8 rounded-[2rem] border border-slate-100 text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-line shadow-inner">
                  {aiAnalysis}
                </div>
              ) : (
                <button 
                  onClick={runPressureTest} 
                  disabled={isLoading} 
                  className="w-full bg-slate-950 text-white font-black py-6 rounded-3xl shadow-2xl hover:bg-indigo-600 active:scale-[0.98] transition-all text-xs uppercase tracking-[0.3em] group flex justify-center items-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>报告生成中...</span>
                    </>
                  ) : "生成 AI 综合分析报告"}
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 底部导航栏 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-slate-100 px-10 py-4 flex justify-around items-center z-[100] h-20 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)]">
        <TabButton active={activeTab === 'input'} onClick={() => setActiveTab('input')} label="数据录入" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zm12-4v4m-8-4v4m-4 8h16"/></svg>} />
        <TabButton active={activeTab === 'results'} onClick={() => { if(results) setActiveTab('results') }} label="估值看板" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>} disabled={!results} />
        <TabButton active={activeTab === 'analysis'} onClick={() => { if(results) setActiveTab('analysis') }} label="AI 审计" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>} disabled={!results} />
      </nav>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: React.ReactNode; disabled?: boolean }> = ({ active, onClick, label, icon, disabled }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`flex flex-col items-center gap-1.5 transition-all flex-1 py-1 ${disabled ? 'opacity-20 grayscale' : ''} ${active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
  >
    <div className={`p-2 rounded-xl transition-all ${active ? 'bg-indigo-50 shadow-sm ring-1 ring-indigo-100' : 'bg-transparent'}`}>
      {icon}
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
