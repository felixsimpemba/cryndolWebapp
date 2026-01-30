import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Wallet } from 'lucide-react';
import { cn } from '../../utils/cn';

const StatCard = ({ title, value, change, icon: Icon, gradient, delay = 0 }) => {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl dark:hover:shadow-glow group"
    >
      {/* Decorative Gradient Blob */}
      <div className={cn("absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-2xl", gradient)} />
      
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <motion.h3
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2, type: 'spring' }}
            className="text-3xl font-bold text-slate-900 dark:text-white"
          >
            {value}
          </motion.h3>
        </div>
        <div className={cn('p-3 rounded-xl shadow-lg text-white', gradient)}>
          <Icon size={24} />
        </div>
      </div>

      <div className="relative z-10 flex items-center space-x-2">
        <div
          className={cn(
            'flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-semibold',
            isPositive
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 text-red-600 dark:text-red-400'
          )}
        >
          <TrendingUp
            size={14}
            className={cn(!isPositive && 'rotate-180')}
          />
          <span>{Math.abs(change)}%</span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-500">vs last month</span>
      </div>
    </motion.div>
  );
};

export default StatCard;
