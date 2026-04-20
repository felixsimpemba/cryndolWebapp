import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, DollarSign, Wallet, TrendingUp, AlertTriangle, CheckCircle, 
  ArrowUpRight, ArrowDownRight, Briefcase, Activity, Calendar, ShieldCheck
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import Card from '../components/ui/Card';
import StatCard from '../components/features/StatCard';
import dashboardService from '../services/dashboard.service';
import useAuthStore from '../store/authStore';
import { formatCurrency, formatNumber, formatPercentage, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const businessId = currentUser?.businessProfile?.id || currentUser?.id;
      const summary = await dashboardService.getSummary(businessId);
      setDashboardData(summary);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const kpiStats = useMemo(() => {
    if (!dashboardData) return [];
    const { coreMetrics, growthMetrics } = dashboardData;
    return [
      { title: 'Liquid Capital', value: formatCurrency(coreMetrics.currentBalance || 0), change: growthMetrics.revenueGrowthRate, icon: Wallet },
      { title: 'Projected Revenue', value: formatCurrency(coreMetrics.totalActiveLoanAmount), change: 12, icon: Activity },
      { title: 'Realized Profit', value: formatCurrency(coreMetrics.realizedProfit), change: growthMetrics.revenueGrowthRate, icon: CheckCircle },
      { title: 'Total Customers', value: formatNumber(coreMetrics.numberOfCustomers), change: growthMetrics.customerGrowthRate, icon: Users },
    ];
  }, [dashboardData]);

  const loanStatusData = useMemo(() => {
    if (!dashboardData) return [];
    const { coreMetrics } = dashboardData;
    return [
      { name: 'Active', value: coreMetrics.loanStatusCounts.active, color: '#10b981' },
      { name: 'Closed', value: coreMetrics.loanStatusCounts.closed, color: '#3b82f6' },
      { name: 'Defaulted', value: coreMetrics.loanStatusCounts.defaulted, color: '#ef4444' },
    ];
  }, [dashboardData]);

  if (loading || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center group">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mr-1" />
            <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500 animate-pulse" size={24} />
          </div>
          <p className="mt-6 text-slate-500 font-black uppercase tracking-widest text-[10px] dark:text-slate-400">Synchronizing Financials...</p>
        </div>
      </div>
    );
  }

  const { coreMetrics, growthMetrics } = dashboardData;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Financial Overview</h1>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-1">
                Hello <span className="text-emerald-500 font-bold">{user?.fullName?.split(' ')[0]}</span>, here's your portfolio today.
              </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="outline" leftIcon={<Calendar size={18} />} className="flex-1 sm:flex-none text-xs py-2.5">30 Days</Button>
              <Button variant="primary" leftIcon={<ArrowUpRight size={18} />} className="flex-1 sm:flex-none text-xs py-2.5 whitespace-nowrap">New Application</Button>
          </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {kpiStats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} delay={index * 0.05} />
        ))}
      </div>

      {/* Main Analytical Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        
        {/* Growth Chart */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="p-4 sm:p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Performance Trends</h3>
                   <h2 className="text-xl font-black text-slate-900 dark:text-white">Revenue & Profit Growth</h2>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[10px] font-black text-slate-500 uppercase">Revenue</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500" /><span className="text-[10px] font-black text-slate-500 uppercase">Profit</span></div>
                </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthMetrics.revenueTrend}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} tickFormatter={(val) => `K${val/1000}k`} />
                  <Tooltip cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="profit" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Portfolio Pie */}
        <Card className="flex flex-col">
            <div className="p-4 sm:p-8">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Portfolio Mix</h3>
               <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">Status Distribution</h2>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center -mt-8">
                <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                        <Pie
                            data={loanStatusData.filter(d => d.value > 0)}
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                        >
                            {loanStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-4 w-full px-8 mt-4">
                    {loanStatusData.map(item => (
                        <div key={item.name} className="text-center group">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{item.name}</p>
                            <div className="flex items-center justify-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-sm font-black text-slate-900 dark:text-white">{item.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>

      </div>

      {/* Information Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        
        {/* Receivables Alert */}
        <div className="bg-emerald-600 rounded-3xl p-5 sm:p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000" />
            <AlertTriangle className="text-emerald-400 mb-4" size={32} />
            <h3 className="text-lg font-black italic">Upcoming Liquidity</h3>
            <p className="text-emerald-50/70 text-sm mt-1 leading-relaxed">
                You have <strong>{coreMetrics.loansDueNext7Days.count} loans</strong> maturing in the next 7 days, totaling <strong>{formatCurrency(coreMetrics.loansDueNext7Days.amount)}</strong>.
            </p>
            <Button className="mt-6 bg-white text-emerald-600 border-none hover:bg-emerald-50 text-xs font-black">View Schedule</Button>
        </div>

        {/* Quick Insights Cache */}
        <Card className="bg-slate-900 border-none p-5 sm:p-8 flex flex-col justify-between">
            <div>
               <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Yield Analysis</span>
                  <div className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase">Live</div>
               </div>
               <h3 className="text-xl font-black text-white mt-4 italic">Portfolio Quality Index</h3>
               <p className="text-slate-400 text-sm mt-2">Your current NPL (Non-Performing Loan) ratio is within the target threshold.</p>
            </div>
            <div className="mt-8 flex items-end justify-between">
                <div>
                    <p className="text-2xl font-black text-white italic">8.4%</p>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Excellent Range</p>
                </div>
                <TrendingUp className="text-emerald-500" size={32} />
            </div>
        </Card>

        {/* System Health */}
        <Card className="p-5 sm:p-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">System Integrity</h3>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-emerald-500"><ShieldCheck size={18} /></div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Transaction Ledger</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase">Synced</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-emerald-500"><Briefcase size={18} /></div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Regulatory Compliance</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase">Active</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-blue-500"><DollarSign size={18} /></div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Mobile Money Hub</span>
                    </div>
                    <span className="text-[10px] font-black text-blue-500 uppercase">Connected</span>
                </div>
            </div>
        </Card>

      </div>
    </div>
  );
};

export default Dashboard;
