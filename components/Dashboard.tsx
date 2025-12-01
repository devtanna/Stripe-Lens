import React, { useState } from 'react';
import { DollarSign, CreditCard, PieChart, Activity, AlertCircle, CheckCircle2, FileJson, ArrowRight } from 'lucide-react';
import { Card, StatCard } from './ui/Card';
import { RevenueChart } from './charts/RevenueChart';
import { ProductTable } from './tables/ProductTable';
import { fetchDashboardData } from '../services/stripeService';
import { DashboardData } from '../types';

export const Dashboard: React.FC = () => {
  // In a real Next.js app, this would be process.env.STRIPE_SECRET_KEY
  // We use the environment variable directly.
  const envStripeKey = process.env.STRIPE_SECRET_KEY;
  const hasEnvKey = !!envStripeKey;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const loadData = async (key: string | undefined, demo: boolean) => {
    setLoading(true);
    setError(null);
    setData(null);
    setIsDemo(demo);

    try {
      // If demo, key is ignored. If real, we use the env key.
      const apiKeyToUse = demo ? 'demo' : (key || '');
      const dashboardData = await fetchDashboardData(apiKeyToUse, demo);
      setData(dashboardData);
    } catch (err: any) {
      if (err.message.includes('Failed to fetch') || err.message.includes('CORS')) {
        setError("Network Error: In a real Next.js app, Stripe calls run server-side. For this demo environment, please try 'Demo Mode'.");
      } else {
        setError(err.message || "An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  if (!data && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-stripe-600 text-white mb-4 shadow-lg shadow-stripe-500/30">
              <Activity className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">StripeLens</h1>
            <p className="text-slate-500 mt-2">Revenue analytics & fee visualization</p>
          </div>

          <Card className="p-8">
            {hasEnvKey ? (
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                   <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-100">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                   </div>
                   <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Environment Configured</h3>
                  <p className="text-sm text-slate-500 mt-2">
                    Stripe key detected in <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono text-xs">.env.local</code>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Ready to visualize data</p>
                </div>

                <div className="space-y-3 pt-2">
                  <button 
                    onClick={() => loadData(envStripeKey, false)}
                    className="w-full py-2.5 px-4 bg-stripe-600 hover:bg-stripe-700 text-white font-medium rounded-lg transition-colors shadow-sm shadow-stripe-600/30 flex items-center justify-center gap-2 group"
                  >
                    Visualize Data
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <button 
                    onClick={() => loadData('demo', true)}
                    className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
                  >
                    Try Demo Mode
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-md shadow-sm border border-slate-100 shrink-0">
                      <FileJson className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Configuration Missing</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        To connect real data, add your Stripe Secret Key to your environment file.
                      </p>
                      <div className="mt-3 p-2.5 bg-slate-900 rounded-md border border-slate-800 overflow-hidden">
                         <div className="flex items-center justify-between">
                            <code className="text-[11px] text-green-400 font-mono whitespace-nowrap">
                              STRIPE_SECRET_KEY=sk_test_...
                            </code>
                         </div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 text-right">file: .env.local</p>
                    </div>
                  </div>
                </div>

                <div>
                   <button 
                    onClick={() => loadData('demo', true)}
                    className="w-full py-2.5 px-4 bg-stripe-600 hover:bg-stripe-700 text-white font-medium rounded-lg transition-colors shadow-sm shadow-stripe-600/30 flex items-center justify-center gap-2"
                  >
                    Try Demo Mode
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-4">
                    Or configure your environment to use real data.
                  </p>
                </div>
              </div>
            )}
            
            {error && (
               <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded-lg flex gap-3 text-sm text-red-600 items-start">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>{error}</p>
               </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-stripe-200 border-t-stripe-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Crunching the numbers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-stripe-600 text-white p-1.5 rounded-md">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">StripeLens</span>
            {isDemo && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium border border-slate-200">
                Demo Mode
              </span>
            )}
          </div>
          <button 
            onClick={() => setData(null)} 
            className="text-sm text-slate-500 hover:text-slate-900 font-medium"
          >
            Disconnect
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* KPI Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Revenue" 
            value={formatCurrency(data?.summary.totalRevenue || 0)} 
            subValue={`${data?.summary.transactionCount} transactions`}
            icon={<DollarSign className="w-6 h-6" />}
          />
          <StatCard 
            title="Stripe Fees" 
            value={formatCurrency(data?.summary.totalFees || 0)} 
            subValue="Approximate processing fees"
            icon={<CreditCard className="w-6 h-6" />}
          />
          <StatCard 
            title="Net Volume" 
            value={formatCurrency(data?.summary.netRevenue || 0)} 
            subValue="Earnings after fees"
            icon={<PieChart className="w-6 h-6" />}
          />
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
             <Card className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-900">Cumulative Revenue</h2>
                  <p className="text-sm text-slate-500">Growth over time broken down by product.</p>
                </div>
                {data && (
                  <RevenueChart 
                    data={data.chartData} 
                    productNames={data.products.map(p => p.name)} 
                  />
                )}
             </Card>
          </div>

          {/* Top Products Table */}
          <div className="lg:col-span-1">
             <Card className="p-6 h-full">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Top Products</h2>
                  <p className="text-sm text-slate-500">Revenue distribution.</p>
                </div>
                {data && <ProductTable products={data.products} />}
             </Card>
          </div>
        </div>

      </main>
    </div>
  );
};