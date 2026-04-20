import React from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  CreditCard,
  Building,
  Smartphone,
  Banknote
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { formatCurrency } from '../utils/formatters';

const Wallets = () => {
    const wallets = [
        { id: 1, name: 'Main Treasury (Cash)', type: 'CASH', balance: 45200.50, currency: 'ZMW', provider: 'Internal' },
        { id: 2, name: 'ABSA Corporate', type: 'BANK', balance: 1250000.00, currency: 'ZMW', provider: 'ABSA Bank' },
        { id: 3, name: 'MTN Mobile Money', type: 'MOBILE_MONEY', balance: 8400.25, currency: 'ZMW', provider: 'MTN Zambia' },
        { id: 4, name: 'Airtel Collections', type: 'MOBILE_MONEY', balance: 12900.80, currency: 'ZMW', provider: 'Airtel Zambia' },
    ];

    const getIcon = (type) => {
        switch(type) {
            case 'BANK': return <Building size={24} />;
            case 'MOBILE_MONEY': return <Smartphone size={24} />;
            case 'CASH': return <Banknote size={24} />;
            default: return <Wallet size={24} />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Treasury & Wallets</h1>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">Manage liquid assets across bank accounts and mobile money vendors.</p>
                </div>
                <Button variant="primary" leftIcon={<Plus size={18} />} className="w-full sm:w-auto text-xs py-2.5">Connect Provider</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {wallets.map((wallet, idx) => (
                    <motion.div
                        key={wallet.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="group hover:border-emerald-500 transition-colors duration-300">
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                        {getIcon(wallet.type)}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{wallet.provider}</span>
                                </div>
                                <div className="mt-8">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{wallet.name}</p>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                                        <span className="text-sm font-medium mr-1 text-slate-400">{wallet.currency}</span>
                                        {formatCurrency(wallet.balance).replace('K', '').trim()}
                                    </h3>
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1 text-[10px]">Transfer</Button>
                                    <Button variant="outline" size="sm" className="flex-1 text-[10px]">History</Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Card className="p-12 text-center bg-slate-50 dark:bg-white/5 border-dashed border-2">
                <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6">
                        <CreditCard size={32} className="text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Issue Corporate Cards</h3>
                    <p className="text-sm text-slate-500 mt-2">Coming soon: Empower your loan officers with physical spending cards for field operations.</p>
                    <Button variant="outline" className="mt-8">Join the Waitlist</Button>
                </div>
            </Card>
        </div>
    );
};

export default Wallets;
