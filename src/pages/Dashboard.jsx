import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, Wallet, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import StatCard from '../components/features/StatCard';
import dashboardService from '../services/dashboard.service';
import loanService from '../services/loan.service';
import { formatCurrency, formatNumber, getLoanStatusColor } from '../utils/formatters';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [loanStatusData, setLoanStatusData] = useState([]);
  const [recentLoans, setRecentLoans] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState(null);

  const handleAddCapital = async () => {
    const amount = prompt("Enter amount to add to Working Capital:");
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
      try {
        await dashboardService.addCapital(parseFloat(amount));
        toast.success("Capital added successfully");
        fetchDashboardData();
      } catch (e) {
        toast.error("Failed to add capital");
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      const businessId = user?.businessProfile?.id || user?.id;

      // Fetch dashboard summary
      // Fetch dashboard summary
      const summary = await dashboardService.getSummary(businessId);
      setDashboardSummary(summary);

      // Build stats from API data
      const statsData = [
        {
          title: 'Money in Business',
          value: formatCurrency(summary.moneyInBusiness || 0),
          change: 0,
          icon: Wallet,
          gradient: 'bg-gradient-to-br from-indigo-500 to-purple-600',
        },
        {
          title: 'Current Balance',
          value: formatCurrency(summary.currentBalance || 0),
          change: 0,
          icon: DollarSign,
          gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
        },
        {
          title: 'Profit Made',
          value: formatCurrency(summary.profitMade || 0),
          change: 0,
          icon: CheckCircle,
          gradient: 'bg-gradient-to-br from-amber-500 to-orange-600',
        },
        {
          title: 'Estimated Profit',
          value: formatCurrency(summary.estimatedProfit || 0),
          change: 0,
          icon: TrendingUp,
          gradient: 'bg-gradient-to-br from-blue-500 to-cyan-600',
        },
      ];
      setStats(statsData);

      // Fetch recent loans
      const loansResponse = await loanService.getLoans({ per_page: 5 });
      const loans = loansResponse.data?.data || [];

      // Transform loans for display
      const formattedLoans = loans.map(loan => ({
        id: loan.id,
        customer: loan.borrower?.fullName || 'N/A',
        amount: loan.principal,
        status: loan.status?.toLowerCase() || 'pending',
        date: loan.startDate || loan.created_at,
      }));
      setRecentLoans(formattedLoans);

      // Calculate loan status distribution from loans
      const statusCounts = {
        active: 0,
        pending: 0,
        closed: 0,
        defaulted: 0,
      };

      loans.forEach(loan => {
        const status = loan.status?.toLowerCase();
        if (statusCounts.hasOwnProperty(status)) {
          statusCounts[status]++;
        }
      });

      const statusData = [
        { name: 'Active', value: statusCounts.active, color: '#10b981' },
        { name: 'Pending', value: statusCounts.pending, color: '#f59e0b' },
        { name: 'Closed', value: statusCounts.closed, color: '#3b82f6' },
        { name: 'Defaulted', value: statusCounts.defaulted, color: '#ef4444' },
      ];
      setLoanStatusData(statusData);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <Header title="Dashboard" />
        <div className="p-6 flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <p className="mt-4 text-slate-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar relative">
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-96 bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl -z-10 pointer-events-none" />

      <Header title="Dashboard" />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={stat.title} {...stat} delay={index * 0.1} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Loan Status Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <Card.Header>
                <Card.Title>Loan Status Distribution</Card.Title>
                <Card.Description>Overview of all loan statuses</Card.Description>
              </Card.Header>
              <Card.Content>
                {loanStatusData.some(item => item.value > 0) ? (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={loanStatusData.filter(item => item.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {loanStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {loanStatusData.map((item) => (
                        <div key={item.name} className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-slate-500 dark:text-gray-400">{item.name}</span>
                          <span className="text-sm font-semibold text-slate-900 dark:text-gray-200 ml-auto">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-slate-400 dark:text-gray-500">
                    <p>No loan data available</p>
                  </div>
                )}
              </Card.Content>
            </Card>
          </motion.div>

          {/* Placeholder for Monthly Revenue - would need additional API endpoint */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <Card.Header>
                <div className="flex justify-between items-center">
                  <Card.Title>Capital Overview</Card.Title>
                  <button
                    onClick={handleAddCapital}
                    className="px-3 py-1 text-sm bg-emerald-500/10 text-emerald-600 rounded-md hover:bg-emerald-500/20 transition-colors"
                  >
                    + Add Capital
                  </button>
                </div>
                <Card.Description>Manage your business capital</Card.Description>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-lg">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-gray-400">Working Capital</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-gray-100">
                        {formatCurrency(dashboardSummary?.workingCapital || 0)}
                      </p>
                    </div>
                    <DollarSign className="text-indigo-500" size={32} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-lg">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-gray-400">Current Balance</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-gray-100">
                        {formatCurrency(dashboardSummary?.currentBalance || 0)}
                      </p>
                    </div>
                    <Wallet className="text-emerald-500" size={32} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-lg">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-gray-400">Total Collected</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-gray-100">
                        {formatCurrency(dashboardSummary?.totalPaidAmount || 0)}
                      </p>
                    </div>
                    <TrendingUp className="text-purple-500" size={32} />
                  </div>
                </div>
              </Card.Content>
            </Card>
          </motion.div>
        </div>

        {/* Recent Loans Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <Card.Header>
              <Card.Title>Recent Loans</Card.Title>
              <Card.Description>Latest loan applications and updates</Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLoans.length > 0 ? (
                      recentLoans.map((loan, index) => (
                        <motion.tr
                          key={loan.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.05 }}
                          className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm text-slate-800 dark:text-gray-200">{loan.customer}</td>
                          <td className="py-3 px-4 text-sm font-semibold text-slate-900 dark:text-gray-100">
                            {formatCurrency(loan.amount)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getLoanStatusColor(
                                loan.status
                              )}`}
                            >
                              {loan.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-500 dark:text-gray-400">{loan.date}</td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-12 text-center">
                          <div className="text-slate-400 dark:text-gray-500">
                            <p className="text-lg mb-2">No loans yet</p>
                            <p className="text-sm">Create your first loan to get started</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Content>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

