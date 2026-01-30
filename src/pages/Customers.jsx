import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import CustomerModal from '../components/modals/CustomerModal';
import customerService from '../services/customer.service';
import { formatDate, getCustomerStatusColor } from '../utils/formatters';
import toast from 'react-hot-toast';
import { useConfirmation } from '../context/ConfirmationContext';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const { confirm } = useConfirmation();

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await customerService.getCustomers(params);

      setCustomers(response.data?.data || []);
      if (response.data?.meta) {
        setPagination(response.data.meta);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: 'Delete Customer',
      message: 'Are you sure you want to delete this customer?',
      confirmText: 'Yes, Delete',
      type: 'danger'
    });

    if (!isConfirmed) return;

    try {
      await customerService.deleteCustomer(id);
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      console.error('Failed to delete customer:', error);
      toast.error('Failed to delete customer');
    }
  };

  const filteredCustomers = customers;

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <Header title="Customers" />

      <div className="p-6">
        <Card>
          <Card.Header>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <Card.Title>All Customers</Card.Title>
                <Card.Description>Manage your customer database</Card.Description>
              </div>
              <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
                Add Customer
              </Button>
            </div>

            {/* Search */}
            <div className="mt-4">
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search size={18} />}
              />
            </div>
          </Card.Header>

          <Card.Content>
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <p className="mt-4 text-slate-600 dark:text-gray-400">Loading customers...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Phone</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Joined</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer, index) => (
                        <motion.tr
                          key={customer.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm text-slate-900 dark:text-gray-200 font-medium">
                            {customer.fullName}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-500 dark:text-gray-400">{customer.email}</td>
                          <td className="py-3 px-4 text-sm text-slate-500 dark:text-gray-400">{customer.phoneNumber}</td>
                          <td className="py-3 px-4 text-sm text-slate-500 dark:text-gray-400">
                            {formatDate(customer.created_at)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                className="p-2 hover:bg-slate-500/10 text-slate-500 hover:text-primary-500 rounded-lg transition-colors"
                                onClick={() => handleEdit(customer)}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                                onClick={() => handleDelete(customer.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-12 text-center">
                          <div className="text-slate-400 dark:text-gray-500">
                            <p className="text-lg mb-2">No customers found</p>
                            <p className="text-sm">Try adjusting your search criteria or add a new customer</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card.Content>

          {filteredCustomers.length > 0 && (
            <Card.Footer>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-gray-400">
                  Showing {filteredCustomers.length} of {pagination.total || filteredCustomers.length} customers
                </p>
              </div>
            </Card.Footer>
          )}
        </Card>
      </div>

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        customer={editingCustomer}
        onSuccess={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
          fetchCustomers();
          toast.success(editingCustomer ? 'Customer updated' : 'Customer added');
        }}
      />
    </div>
  );
};

export default Customers;

