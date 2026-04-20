import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../utils/cn';

const StatCard = ({ title, value, change, icon: Icon, delay = 0, color = 'emerald' }) => {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="relative overflow-hidden bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 group"
    >
      <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-emerald-500/5 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 group-hover:scale-150 transition-transform duration-700" />
      
      <div className="relative z-10 flex items-start justify-between mb-3 sm:mb-4">
        <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
          <Icon size={18} className="sm:hidden" />
          <Icon size={24} className="hidden sm:block" />
        </div>
        {change !== 0 && (
          <div
            className={cn(
              'flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
              isPositive
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-rose-500/10 text-rose-500'
            )}
          >
            {isPositive ? <ArrowUpRight size={10} className="sm:size-3" /> : <ArrowDownRight size={10} className="sm:size-3" />}
            <span className="text-[9px] sm:text-[10px]">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      
      <div className="relative z-10">
        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 truncate">{title}</p>
        <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {value}
        </h3>
        <p className="hidden sm:block text-[10px] text-slate-400 mt-2 font-medium">Recorded this billing cycle</p>
      </div>
    </motion.div>
  );
};

export default StatCard;
