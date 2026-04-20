import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Calendar,
  Layers,
  Activity
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { formatCurrency } from '../utils/formatters';

const Reports = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Business Intelligence</h1>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">Cross-sectional analytics & health.</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <Button variant="outline" leftIcon={<Calendar size={18} />} className="flex-1 sm:flex-none text-xs py-2.5">Schedule</Button>
                    <Button variant="primary" leftIcon={<Download size={18} />} className="flex-1 sm:flex-none text-xs py-2.5 whitespace-nowrap">Audit Report</Button>
                </div>
            </div>

            {/* Top Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-6 h-[400px] flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Portfolio Performance</h3>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Revenue vs. Disbursement</h2>
                        </div>
                        <div className="flex items-center gap-4">
                             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-[10px] font-bold text-slate-500">Revenue</span></div>
                             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-200" /><span className="text-[10px] font-bold text-slate-500">Target</span></div>
                        </div>
                    </div>
                    {/* Mock Chart Placeholder */}
                    <div className="flex-1 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-end justify-between px-12 py-8 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        {[40, 65, 45, 90, 60, 85, 30, 75, 50, 95].map((h, i) => (
                            <motion.div 
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: i * 0.05, duration: 0.5 }}
                                className="w-4 bg-emerald-500 rounded-t-lg relative"
                            >
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                    {(h * 10).toLocaleString()}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6 h-[400px] flex flex-col bg-slate-900 dark:bg-slate-950 border-none text-white overflow-hidden relative">
                    <Layers className="absolute -right-12 -top-12 text-white/5" size={240} />
                    <div className="relative z-10">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Portfolio Quality</h3>
                        <h2 className="text-xl font-black mt-1">NPL (Non-Performing Loans)</h2>
                        
                        <div className="mt-12 flex flex-col items-center">
                            <div className="relative w-40 h-40">
                                <svg className="w-full h-full rotate-[-90deg]">
                                    <circle cx="80" cy="80" r="70" className="stroke-white/10 fill-none" strokeWidth="12" />
                                    <circle cx="80" cy="80" r="70" className="stroke-rose-500 fill-none" strokeWidth="12" strokeDasharray="440" strokeDashoffset="400" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black italic">8.2%</span>
                                    <span className="text-[10px] text-white/40 uppercase tracking-widest">At Risk</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 space-y-4">
                            <div className="flex justify-between items-center text-sm p-4 bg-white/5 rounded-2xl">
                                <span className="text-white/60">Healthy Loans</span>
                                <span className="font-bold text-emerald-400">91.8%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm p-4 bg-white/5 rounded-2xl">
                                <span className="text-white/60">Delinquent (1-30d)</span>
                                <span className="font-bold text-amber-400">5.4%</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Bottom Row Dashboard cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Avg Loan Size', value: 'K 4,200', icon: Target, trend: 'up' },
                    { label: 'Active Branches', value: '12', icon: Activity, trend: 'stable' },
                    { label: 'Customer Growth', value: '24%', icon: TrendingUp, trend: 'up' },
                    { label: 'Yield to Maturity', value: '19.4%', icon: BarChart3, trend: 'down' },
                ].map((item, i) => (
                    <Card key={i} className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500">
                                <item.icon size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
                                <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{item.value}</h4>
                                    {item.trend === 'up' && <ArrowUpRight className="text-emerald-500" size={16} />}
                                    {item.trend === 'down' && <ArrowDownRight className="text-rose-500" size={16} />}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Reports;
