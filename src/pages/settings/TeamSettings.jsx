import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Shield, User } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useConfirmation } from '../../context/ConfirmationContext';

const TeamSettings = () => {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showInvite, setShowInvite] = useState(false);
    const [inviteData, setInviteData] = useState({ fullName: '', email: '', role: 'officer' });
    const { confirm } = useConfirmation();

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        try {
            setLoading(true);
            const response = await api.get('/settings/team');
            setTeam(response.data.data);
        } catch (error) {
            toast.error('Failed to load team members');
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            await api.post('/settings/team', inviteData);
            toast.success('Team member invited');
            setShowInvite(false);
            setInviteData({ fullName: '', email: '', role: 'officer' });
            fetchTeam();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to invite member');
        }
    };

    const handleRemove = async (id) => {
        const isConfirmed = await confirm({
            title: 'Remove Team Member',
            message: 'Are you sure you want to remove this member?',
            confirmText: 'Remove',
            type: 'danger'
        });

        if (!isConfirmed) return;
        try {
            await api.delete(`/settings/team/${id}`);
            toast.success('Member removed');
            fetchTeam();
        } catch (error) {
            toast.error('Failed to remove member');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Team Members</h3>
                <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setShowInvite(!showInvite)}>
                    Invite Member
                </Button>
            </div>

            {showInvite && (
                <form onSubmit={handleInvite} className="p-4 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Full Name"
                            value={inviteData.fullName}
                            onChange={(e) => setInviteData({ ...inviteData, fullName: e.target.value })}
                            required
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            value={inviteData.email}
                            onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                            required
                        />
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Role</label>
                            <select
                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500"
                                value={inviteData.role}
                                onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                            >
                                <option value="admin">Administrator</option>
                                <option value="manager">Manager</option>
                                <option value="officer">Loan Officer</option>
                                <option value="audit">Auditor</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setShowInvite(false)}>Cancel</Button>
                        <Button type="submit" variant="primary">Send Invitation</Button>
                    </div>
                </form>
            )}

            <div className="overflow-hidden bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                        {loading ? (
                            <tr><td colSpan="4" className="text-center py-4">Loading...</td></tr>
                        ) : team.map((member) => (
                            <tr key={member.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                            {member.fullName.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">{member.fullName}</div>
                                            <div className="text-sm text-slate-500">{member.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                                        {member.role || 'user'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                    Active
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleRemove(member.id)} className="text-red-600 hover:text-red-900 dark:hover:text-red-400">
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeamSettings;
