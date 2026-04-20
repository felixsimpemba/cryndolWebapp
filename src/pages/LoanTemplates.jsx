import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, BookOpen } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoanTemplateModal from '../components/modals/LoanTemplateModal';
import loanTemplateService from '../services/loanTemplate.service';
import toast from 'react-hot-toast';
import { useConfirmation } from '../context/ConfirmationContext';

const LoanTemplates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const { confirm } = useConfirmation();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await loanTemplateService.getTemplates();
      setTemplates(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch loan templates:', error);
      toast.error('Failed to load loan templates');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: 'Deactivate Template',
      message: 'Are you sure you want to deactivate this loan template?',
      confirmText: 'Deactivate',
      type: 'danger'
    });

    if (!isConfirmed) return;

    try {
      await loanTemplateService.deleteTemplate(id);
      toast.success('Template deactivated successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to deactivate template');
    }
  };

  const closeModal = () => {
    setEditingTemplate(null);
    setIsModalOpen(false);
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Header title="Loan Templates" />

      <div>
        <Card>
          <Card.Header>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Card.Title className="text-xl sm:text-2xl">Lending Templates</Card.Title>
                <Card.Description>Configure your standard loan terms and conditions</Card.Description>
              </div>
              <Button 
                variant="primary" 
                leftIcon={<Plus size={18} />} 
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto"
              >
                Add Template
              </Button>
            </div>

            {/* Search */}
            <div className="mt-4">
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search size={18} />}
              />
            </div>
          </Card.Header>

          <Card.Content>
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                <p className="mt-4 text-slate-600 dark:text-gray-400">Loading templates...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Interest</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Term</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Amount (Min-Max)</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTemplates.length > 0 ? (
                      filteredTemplates.map((template, index) => (
                        <motion.tr
                          key={template.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm text-slate-900 dark:text-gray-200 font-medium">
                            {template.name}
                            <div className="text-xs text-slate-500 font-normal">{template.interest_type.toLowerCase().replace('_', ' ')}</div>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-500 dark:text-gray-400">
                            {template.interest_rate}%
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-500 dark:text-gray-400">
                            {template.default_term} {template.term_unit}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-500 dark:text-gray-400">
                            {parseFloat(template.min_amount).toLocaleString()} - {parseFloat(template.max_amount).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${template.is_active
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-slate-500/10 text-slate-500'
                              }`}>
                              {template.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                className="p-2 hover:bg-slate-500/10 text-slate-500 hover:text-emerald-500 rounded-lg transition-colors"
                                onClick={() => handleEdit(template)}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                                onClick={() => handleDelete(template.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-12 text-center">
                          <div className="text-slate-400 dark:text-gray-500">
                            <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="text-lg mb-2">No templates found</p>
                            <p className="text-sm">Get started by creating a new loan template</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      <LoanTemplateModal
        isOpen={isModalOpen}
        onClose={closeModal}
        template={editingTemplate}
        onSuccess={() => {
          closeModal();
          fetchTemplates();
        }}
      />
    </div>
  );
};

export default LoanTemplates;
