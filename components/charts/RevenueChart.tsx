import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../constants';

interface RevenueChartProps {
  data: any[];
  productNames: string[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data, productNames }) => {
  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              {productNames.map((name, index) => (
                <linearGradient key={name} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => `$${value}`}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number) => [formatCurrency(value), 'Revenue']}
            />
            {productNames.map((name, index) => (
              <Area
                key={name}
                type="monotone"
                dataKey={name}
                stackId="1"
                stroke={COLORS[index % COLORS.length]}
                fillOpacity={hoveredProduct === null || hoveredProduct === name ? 1 : 0.2}
                fill={`url(#color${index})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {productNames.length > 0 && (
        <div className="border-t border-slate-100 pt-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Products ({productNames.length})
          </div>
          <div className="max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {productNames.map((name, index) => (
                <div
                  key={name}
                  className="flex items-center gap-2 text-xs text-slate-700 hover:bg-slate-50 p-1.5 rounded transition-colors cursor-pointer"
                  onMouseEnter={() => setHoveredProduct(name)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="truncate" title={name}>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};