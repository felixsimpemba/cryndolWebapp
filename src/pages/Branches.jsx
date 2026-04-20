import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Users, 
  MoreVertical,
  Plus,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Branches = () => {
    const branches = [
        { id: 1, name: 'Lusaka Head Office', location: '74 Independence Ave, Lusaka', manager: 'Felix Lungu', staff: 12, loans: 450, code: 'LUS-01', status: 'Active' },
        { id: 2, name: 'Ndola Branch', location: 'Presidents Ave, Ndola', manager: 'Sarah Mwansa', staff: 5, loans: 182, code: 'NDL-02', status: 'Active' },
        { id: 3, name: 'Kitwe Hub', location: 'City Square, Kitwe', manager: 'John Zulu', staff: 8, loans: 310, code: 'KTW-03', status: 'Active' },
        { id: 4, name: 'Livingstone Outpost', location: 'Mosi-o-Tunya Rd, Livingstone', manager: 'Mercy Phiri', staff: 3, loans: 68, code: 'LIV-04', status: 'Pending' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Branch Infrastructure</h1>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">Manage physical locations and regional hubs.</p>
                </div>
                <Button variant="primary" leftIcon={<Plus size={18} />} className="w-full sm:w-auto text-xs py-2.5">New Branch</Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {branches.map((branch, idx) => (
                    <motion.div
                        key={branch.id}
                        initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="p-0 overflow-hidden group">
                           <div className="flex flex-col md:flex-row h-full">
                               <div className="w-full md:w-1/3 bg-slate-100 dark:bg-white/5 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 group-hover:bg-emerald-500 transition-colors duration-500">
                                   <Building2 size={48} className="text-slate-400 group-hover:text-white transition-colors" />
                                   <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-white/80">{branch.code}</p>
                               </div>
                               <div className="flex-1 p-8">
                                   <div className="flex justify-between items-start">
                                       <div>
                                           <h3 className="text-xl font-black text-slate-900 dark:text-white">{branch.name}</h3>
                                           <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                                               <MapPin size={14} /> {branch.location}
                                           </p>
                                       </div>
                                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${branch.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                           {branch.status}
                                       </span>
                                   </div>

                                   <div className="grid grid-cols-3 gap-8 mt-10">
                                       <div>
                                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Loans</p>
                                           <p className="text-lg font-black text-slate-900 dark:text-white mt-1">{branch.loans}</p>
                                       </div>
                                       <div>
                                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team Size</p>
                                           <p className="text-lg font-black text-slate-900 dark:text-white mt-1">{branch.staff}</p>
                                       </div>
                                       <div>
                                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency</p>
                                           <p className="text-lg font-black text-emerald-500 mt-1">94%</p>
                                       </div>
                                   </div>

                                   <div className="mt-10 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                       <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold italic overflow-hidden border border-white dark:border-slate-800">
                                                {branch.manager.split(' ').map(n=>n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Manager</p>
                                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{branch.manager}</p>
                                            </div>
                                       </div>
                                       <Button variant="outline" size="sm" rightIcon={<ArrowUpRight size={14} />}>Dashboard</Button>
                                   </div>
                               </div>
                           </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Branches;
