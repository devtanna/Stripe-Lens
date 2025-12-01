import React from 'react';

export const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export const StatCard: React.FC<{ title: string; value: string; subValue?: string; icon?: React.ReactNode }> = ({ title, value, subValue, icon }) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">{value}</h3>
          {subValue && <p className="text-sm text-slate-400 mt-1">{subValue}</p>}
        </div>
        {icon && (
          <div className="p-3 bg-stripe-50 rounded-lg text-stripe-600">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};