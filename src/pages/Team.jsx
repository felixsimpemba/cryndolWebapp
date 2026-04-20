import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Mail, 
  ShieldCheck, 
  MoreVertical,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { cn } from '../utils/cn';

const Team = () => {
    const team = [
        { id: 1, name: 'Felix Lungu', email: 'felix@cryndol.com', role: 'SUPER_ADMIN', status: 'Active', lastActive: '2 mins ago', avatar: 'FL' },
        { id: 2, name: 'Sarah Mwansa', email: 'sarah.m@cryndol.com', role: 'LOAN_OFFICER', status: 'Active', lastActive: '1 hour ago', avatar: 'SM' },
        { id: 3, name: 'John Zulu', email: 'john.z@cryndol.com', role: 'LOAN_OFFICER', status: 'Suspended', lastActive: '5 days ago', avatar: 'JZ' },
        { id: 4, name: 'Mercy Phiri', email: 'mercy@cryndol.com', role: 'VIEWER', status: 'Active', lastActive: 'Just now', avatar: 'MP' },
    ];

    const getRoleBadge = (role) => {
        const styles = {
            SUPER_ADMIN: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            ADMIN: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            LOAN_OFFICER: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            VIEWER: 'bg-slate-500/10 text-slate-500 border-slate-500/20'
        };
        return (
            <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest border", styles[role] || styles.VIEWER)}>
                {role}
            </span>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Staff Directory</h1>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">Manage organizational roles & performance.</p>
                </div>
                <Button variant="primary" leftIcon={<UserPlus size={18} />} className="w-full sm:w-auto text-xs py-2.5">Invite Member</Button>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search team members..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm text-sm"
                    />
                </div>
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.map((member, idx) => (
                    <motion.div
                        key={member.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Card className="relative group overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-100 dark:from-white/10 dark:to-white/5 rounded-2xl flex items-center justify-center text-lg font-black text-slate-600 dark:text-slate-300">
                                            {member.avatar}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 dark:text-white">{member.name}</h3>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Mail size={12} /> {member.email}</p>
                                        </div>
                                    </div>
                                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                                        <MoreVertical size={16} className="text-slate-400" />
                                    </button>
                                </div>

                                <div className="mt-6 flex items-center gap-3">
                                    {getRoleBadge(member.role)}
                                    <div className="h-4 w-px bg-slate-200 dark:border-white/10" />
                                    <div className="flex items-center gap-1.5">
                                        <div className={cn("w-1.5 h-1.5 rounded-full", member.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500')} />
                                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-tighter">{member.status}</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <Clock size={12} />
                                        <span className="text-[10px] font-medium tracking-tight">Last active {member.lastActive}</span>
                                    </div>
                                    <button className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:underline">View Profile</button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions Card */}
            <Card className="bg-emerald-600 dark:bg-emerald-500/10 border-none p-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-black text-white">Need to scale your workforce?</h2>
                        <p className="text-emerald-100 mt-2">Add more branches and loan officers to reach more customers across Zambia.</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="secondary">Configure Roles</Button>
                        <Button className="bg-white text-emerald-600 hover:bg-emerald-50 border-none">Setup New Branch</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Team;
