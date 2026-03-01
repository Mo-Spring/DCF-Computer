
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { YearProjection } from '../types';

interface Props {
  projections: YearProjection[];
}

const Charts: React.FC<Props> = ({ projections }) => {
  const chartData = projections.map(p => ({
    name: `第 ${p.year} 年`,
    fcf: Math.round(p.fcf),
    pv: Math.round(p.pv),
  }));

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-[400px]">
      <h3 className="text-lg font-bold text-slate-800 mb-6">现金流预测视图</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip 
            formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            cursor={{ fill: '#f8fafc' }}
          />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
          <Bar name="名义 FCF" dataKey="fcf" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={32} />
          <Bar name="折现现值 (PV)" dataKey="pv" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;
