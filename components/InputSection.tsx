
import React, { useState } from 'react';
import { DCFInputs } from '../types';
import { formatCurrency } from '../utils/financeUtils';

interface Props {
  inputs: DCFInputs;
  setInputs: (inputs: DCFInputs) => void;
  onCalculate: () => void;
  onSearch: (query: string) => Promise<void>;
  isSearching: boolean;
  sources: { title: string; uri: string }[];
}

const InputField: React.FC<{
  label: string;
  value: number;
  name: keyof DCFInputs;
  onChange: (name: keyof DCFInputs, val: number) => void;
  prefix?: string;
  suffix?: string;
  step?: string;
  helper?: string;
}> = ({ label, value, name, onChange, prefix, suffix, step = "0.01", helper }) => (
  <div className="group space-y-2">
    <div className="flex justify-between items-center px-1">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</label>
      {helper && <span className="text-[9px] text-indigo-500 font-extrabold">{helper}</span>}
    </div>
    <div className="relative group/input">
      {prefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{prefix}</span>}
      <input
        type="number"
        inputMode="decimal"
        step={step}
        value={value}
        onChange={(e) => onChange(name, parseFloat(e.target.value) || 0)}
        className={`w-full bg-slate-50 border border-slate-100 rounded-[1.25rem] py-4 px-4 text-sm font-black text-slate-900 focus:bg-white focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all duration-300 ${prefix ? 'pl-9' : ''} group-hover/input:border-indigo-200`}
      />
      {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-black uppercase">{suffix}</span>}
    </div>
  </div>
);

const InputSection: React.FC<Props> = ({ inputs, setInputs, onCalculate, onSearch, isSearching, sources }) => {
  const [query, setQuery] = useState('');
  const handleChange = (name: keyof DCFInputs, val: number) => setInputs({ ...inputs, [name]: val });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 搜索抓取区 - 优化后的布局 */}
      <div className="relative p-[1px] rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-emerald-400 shadow-xl shadow-indigo-500/10 group">
        <div className="bg-white/95 backdrop-blur-xl p-5 rounded-[2.45rem]">
          <form onSubmit={(e) => { e.preventDefault(); if(query) onSearch(query); }}>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-300 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <input 
                className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl pl-11 pr-28 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all" 
                placeholder="输入股票代码或公司名称" 
                value={query} 
                onChange={e => setQuery(e.target.value)}
              />
              <button 
                type="submit"
                disabled={isSearching}
                className="absolute right-1.5 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSearching ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>审计中</span>
                  </>
                ) : "抓取数据"}
              </button>
            </div>
          </form>
          
          {inputs.asOfDate && (
            <div className="mt-4 flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">数据基准日: {inputs.asOfDate}</span>
              </div>
              <div className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-tighter">可信度: {inputs.confidenceScore}%</div>
            </div>
          )}
        </div>
      </div>

      {/* 核心财务分类输入 - Bento 式布局 */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200/60 shadow-sm space-y-10">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">市值与现金流 / Values</h3>
          </div>
          <div className="grid gap-5">
            <InputField label="当前市价" value={inputs.currentPrice} name="currentPrice" onChange={handleChange} prefix="¥" />
            <InputField label="自由现金流 (FCF)" value={inputs.initialFCF} name="initialFCF" onChange={handleChange} helper={formatCurrency(inputs.initialFCF)} />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="净负债" value={inputs.netDebt} name="netDebt" onChange={handleChange} />
              <InputField label="总股本" value={inputs.sharesOutstanding} name="sharesOutstanding" onChange={handleChange} suffix="股" />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
            </div>
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">收益与分红 / Yields</h3>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <InputField label="每股收益 (EPS)" value={inputs.eps} name="eps" onChange={handleChange} prefix="¥" />
            <InputField label="每股股息 (DPS)" value={inputs.dividendPerShare} name="dividendPerShare" onChange={handleChange} prefix="¥" />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/10">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>
            </div>
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">模型假设 / Growth Model</h3>
          </div>
          <div className="grid grid-cols-2 gap-5 mb-8">
            <InputField label="预测期增长率" value={inputs.growthRate} name="growthRate" onChange={handleChange} suffix="%" />
            <InputField label="折现率 (WACC)" value={inputs.discountRate} name="discountRate" onChange={handleChange} suffix="%" />
          </div>
          <div className="px-1">
            <div className="flex justify-between mb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>安全边际 / Margin of Safety</span>
              <span className="text-indigo-600 font-bold">{inputs.marginOfSafety}%</span>
            </div>
            <div className="relative h-2.5 bg-slate-100 rounded-full flex items-center">
              <input 
                type="range" min="0" max="50" value={inputs.marginOfSafety} 
                onChange={e => handleChange('marginOfSafety', parseInt(e.target.value))} 
                className="w-full h-full appearance-none bg-transparent cursor-pointer z-10 accent-indigo-600" 
              />
              <div className="absolute left-0 h-full bg-indigo-600 rounded-full transition-all pointer-events-none shadow-[0_0_10px_rgba(79,70,229,0.3)]" style={{ width: `${(inputs.marginOfSafety / 50) * 100}%` }}></div>
            </div>
          </div>
        </section>

        <button 
          onClick={onCalculate} 
          className="w-full bg-slate-900 text-white font-black py-6 rounded-3xl shadow-2xl hover:bg-indigo-600 active:scale-[0.98] transition-all text-xs uppercase tracking-[0.3em] relative overflow-hidden group/btn"
        >
          <span className="relative z-10">执行实时估值计算</span>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
        </button>
      </div>

      {sources.length > 0 && (
        <div className="px-4 py-8 text-center border-t border-slate-100">
          <span className="text-[9px] font-black text-slate-300 uppercase mb-4 block tracking-[0.4em]">数据审计来源明细</span>
          <div className="flex flex-col gap-3">
            {sources.map((s, i) => (
              <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 bg-white/50 border border-slate-100 px-6 py-3 rounded-2xl flex items-center justify-between group/link transition-all">
                <span className="truncate max-w-[200px]">{s.title}</span>
                <svg className="w-3.5 h-3.5 opacity-30 group-hover/link:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InputSection;
