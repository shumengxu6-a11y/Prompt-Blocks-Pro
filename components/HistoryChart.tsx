import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { HistoryItem } from '../types';

interface HistoryChartProps {
  history: HistoryItem[];
}

const HistoryChart: React.FC<HistoryChartProps> = ({ history }) => {
  if (history.length === 0) {
    return (
        <div className="h-32 flex items-center justify-center text-gray-600 text-xs italic border border-dashed border-gray-800 rounded-lg">
            暂无历史数据
        </div>
    );
  }

  // Process data: Take last 10 items, reverse to show chronological order left-to-right
  const data = [...history].reverse().slice(-10).map((item, index) => ({
    name: `P${index + 1}`,
    tokens: item.tokenCount,
    cost: item.cost,
    preview: item.content.substring(0, 20) + '...'
  }));

  return (
    <div className="h-40 w-full mt-4">
      <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase">使用趋势 (最近 10 次)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '6px' }}
            itemStyle={{ color: '#e5e7eb', fontSize: '12px' }}
            cursor={{ fill: '#374151', opacity: 0.2 }}
          />
          <Bar dataKey="tokens" radius={[4, 4, 0, 0]}>
             {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.tokens > 1000 ? '#ef4444' : '#6366f1'} />
              ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoryChart;