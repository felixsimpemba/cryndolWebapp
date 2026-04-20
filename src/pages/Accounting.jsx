import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Download,
  Calendar,
  Wallet,
  Building,
  DollarSign
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { formatCurrency, formatDate } from '../utils/formatters';

const Accounting = () => {
    const [activeTab, setActiveTab] = useState('ledger');

    const stats = [
        { label: 'Total Assets', value: 1250000, change: '+12%', icon: Wallet, color: 'emerald' },
        { label: 'Total Liabilities', value: 450000, change: '-5%', icon: CreditCard, color: 'rose' },
        { label: 'Business Equity', value: 800000, change: '+18%', icon: Building, color: 'amber' },
        { label: 'Current Liquidity', value: 120500, change: '+2%', icon: DollarSign, color: 'blue' },
    ];

    const transactions = [
        { id: '1', date: '2024-03-15', description: 'Loan Disbursement #LN-9921', account: 'Cash Account', type: 'credit', amount: 5000, status: 'Completed' },
        { id: '2', date: '2024-03-14', description: 'Repayment Received - Chanda M.', account: 'Bank A/C', type: 'debit', amount: 850, status: 'Completed' },
        { id: '3', date: '2024-03-14', description: 'Penalty Interest Charged', account: 'Revenue', type: 'debit', amount: 45, status: 'Pending' },
        { id: '4', date: '2024-03-13', description: 'System Fee - SMS Gateway', account: 'Expense', type: 'credit', amount: 120, status: 'Completed' },
        { id: '5', date: '2024-03-12', description: 'Initial Capital Injection', account: 'Equity', type: 'debit', amount: 100000, status: 'Completed' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Financial Ledger</h1>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">Double-entry accounting & treasury.</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <Button variant="outline" leftIcon={<Download size={18} />} className="flex-1 sm:flex-none text-xs py-2.5">Export</Button>
                    <Button variant="primary" leftIcon={<ArrowUpRight size={18} />} className="flex-1 sm:flex-none text-xs py-2.5 whitespace-nowrap">Manual Entry</Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="relative overflow-hidden group">
                           <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110`} />
                           <div className="p-6">
                               <div className="flex items-center justify-between mb-4">
                                   <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500`}>
                                       <stat.icon size={24} />
                                   </div>
                                   <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                       {stat.change}
                                   </span>
                               </div>
                               <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                               <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatCurrency(stat.value)}</h3>
                           </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Tabs & Filters */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10">
                    <div className="flex gap-8">
                        {['ledger', 'accounts', 'wallets'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "pb-4 text-sm font-bold uppercase tracking-widest transition-all relative",
                                    activeTab === tab ? "text-emerald-500" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                )}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <motion.div layoutId="accountingTab" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search transactions..." 
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" leftIcon={<Filter size={16} />} className="flex-1 text-xs py-2">Filter</Button>
                        <Button variant="outline" leftIcon={<Calendar size={16} />} className="flex-1 text-xs py-2 whitespace-nowrap">Range</Button>
                    </div>
                </div>

                {/* Ledger Table */}
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Description</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Account</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Type</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Amount</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">{formatDate(tx.date)}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{tx.description}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-tighter mt-0.5">REF: TX-0012920{tx.id}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">{tx.account}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {tx.type === 'debit' ? (
                                                    <div className="p-1 rounded bg-blue-500/10 text-blue-500"><ArrowDownLeft size={14} /></div>
                                                ) : (
                                                    <div className="p-1 rounded bg-amber-500/10 text-amber-500"><ArrowUpRight size={14} /></div>
                                                )}
                                                <span className="text-xs font-bold uppercase tracking-tighter">{tx.type}</span>
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-black ${tx.type === 'debit' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                                            {tx.type === 'debit' ? '+' : '-'} {formatCurrency(tx.amount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                tx.status === 'Completed' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                                            )}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Accounting;

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
