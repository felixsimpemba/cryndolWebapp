import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Zap, TrendingDown, CheckCircle2, XCircle,
  DollarSign, Percent, Info
} from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoanTemplateModal from '../components/modals/LoanTemplateModal';
import loanTemplateService from '../services/loanTemplate.service';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/formatters';

const LoanTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editingTemplate, setEditingTemplate] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await loanTemplateService.getTemplates();
      const data = response.data?.data || [];
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch loan templates:', error);
      toast.error('Failed to load loan templates');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (template) => {
    try {
      const newStatus = !template.is_active;
      await loanTemplateService.configureTemplate(template.id, { is_active: newStatus });
      toast.success(`${template.name} ${newStatus ? 'activated' : 'deactivated'}`);
      fetchTemplates();
    } catch (error) {
      console.error('Failed to toggle template status:', error);
      toast.error('Failed to update template status');
    }
  };

  const flatRate  = templates.find(t => t.template_type === 'flat_rate');
  const smartLoan = templates.find(t => t.template_type === 'smart_loan');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Header title="Loan Templates" />

      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Lending Products</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure your two lending products below. Toggle them active or inactive at any time.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">Loading templates...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TemplateCard
              template={flatRate}
              type="flat_rate"
              onConfigure={setEditingTemplate}
              onToggleStatus={() => toggleStatus(flatRate)}
            />
            <TemplateCard
              template={smartLoan}
              type="smart_loan"
              onConfigure={setEditingTemplate}
              onToggleStatus={() => toggleStatus(smartLoan)}
            />
          </div>
        )}
      </div>

      <LoanTemplateModal
        isOpen={!!editingTemplate}
        onClose={() => setEditingTemplate(null)}
        template={editingTemplate}
        onSuccess={() => {
          setEditingTemplate(null);
          fetchTemplates();
        }}
      />
    </div>
  );
};

// ─── Template Card ─────────────────────────────────────────────────────────────

const TemplateCard = ({ template, type, onConfigure, onToggleStatus }) => {
  const isFlatRate = type === 'flat_rate';

  const meta = isFlatRate
    ? {
        icon:        <Zap size={28} className="text-amber-500" />,
        iconBg:      'bg-amber-500/10 dark:bg-amber-500/15',
        accentColor: 'border-amber-400/30 dark:border-amber-500/20',
        badgeBg:     'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
        label:       'Flat Rate',
        tagline:     'Simple interest charged at a fixed rate per period',
        gradient:    'from-amber-500/5 to-orange-500/5',
      }
    : {
        icon:        <TrendingDown size={28} className="text-blue-500" />,
        iconBg:      'bg-blue-500/10 dark:bg-blue-500/15',
        accentColor: 'border-blue-400/30 dark:border-blue-500/20',
        badgeBg:     'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
        label:       'Smart Loan',
        tagline:     'Bank-style reducing balance with monthly amortization',
        gradient:    'from-blue-500/5 to-indigo-500/5',
      };

  if (!template) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative bg-gradient-to-br ${meta.gradient} rounded-3xl border ${meta.accentColor} p-6 flex items-center justify-center min-h-64`}
      >
        <div className="text-center text-slate-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300 mb-3" />
          <p className="text-sm">Initializing...</p>
        </div>
      </motion.div>
    );
  }

  const isActive = !!template.is_active;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-gradient-to-br ${meta.gradient} rounded-3xl border ${meta.accentColor} overflow-hidden`}
    >
      {/* Active indicator strip */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${isActive ? (isFlatRate ? 'bg-amber-400' : 'bg-blue-400') : 'bg-slate-300 dark:bg-slate-700'}`} />

      <div className="p-6 space-y-5">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${meta.iconBg}`}>
              {meta.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{meta.label}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{meta.tagline}</p>
            </div>
          </div>
          <button 
            onClick={onToggleStatus}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 ${isActive ? meta.badgeBg : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
          >
            {isActive
              ? <><CheckCircle2 size={12} /> Active</>
              : <><XCircle size={12} /> Inactive</>
            }
          </button>
        </div>

        {/* Rates / Info */}
        <div className="bg-white/60 dark:bg-slate-900/40 rounded-2xl border border-white/80 dark:border-white/5 p-4">
          {isFlatRate ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Per Day',     value: template.rate_per_day    },
                { label: 'Per Week',    value: template.rate_per_week   },
                { label: 'Per 2 Weeks', value: template.rate_per_2weeks },
                { label: 'Per 3 Weeks', value: template.rate_per_3weeks },
                { label: 'Per Month',   value: template.rate_per_month  },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                    {parseFloat(value || 0).toFixed(2)}
                    <span className="text-xs font-normal text-slate-500">%</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Annual Interest Rate</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {parseFloat(template.interest_rate || 0).toFixed(2)}
                  <span className="text-sm font-normal text-slate-500">% p.a.</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  ≈ {(parseFloat(template.interest_rate || 0) / 12).toFixed(3)}% / month
                </p>
              </div>
              <div className="opacity-10">
                <TrendingDown size={60} className="text-blue-500" />
              </div>
            </div>
          )}
        </div>

        {/* Loan limits */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/60 dark:bg-slate-900/40 rounded-xl border border-white/80 dark:border-white/5 p-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Min Loan</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(parseFloat(template.min_amount || 0))}
            </p>
          </div>
          <div className="bg-white/60 dark:bg-slate-900/40 rounded-xl border border-white/80 dark:border-white/5 p-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Max Loan</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(parseFloat(template.max_amount || 0))}
            </p>
          </div>
        </div>

        {/* Fees row */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Processing fee: <span className="font-semibold text-slate-700 dark:text-slate-300">
              {template.processing_fee_type === 'percentage'
                ? `${template.processing_fee_value}%`
                : formatCurrency(parseFloat(template.processing_fee_value || 0))
              }
            </span>
          </span>
          <span>
            Late penalty: <span className="font-semibold text-slate-700 dark:text-slate-300">
              {template.late_penalty_type === 'percentage'
                ? `${template.late_penalty_value}%`
                : formatCurrency(parseFloat(template.late_penalty_value || 0))
              }
              <span className="text-slate-400 font-normal"> ({template.late_penalty_frequency})</span>
            </span>
          </span>
        </div>

        {/* Configure button */}
        <Button
          variant="ghost"
          onClick={() => onConfigure(template)}
          leftIcon={<Settings size={16} />}
          className="w-full border border-slate-200 dark:border-white/10 hover:border-emerald-500 dark:hover:border-emerald-500"
        >
          Configure
        </Button>
      </div>
    </motion.div>
  );
};

export default LoanTemplates;
