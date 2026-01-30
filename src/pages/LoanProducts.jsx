import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoanProductModal from '../components/modals/LoanProductModal';
import loanProductService from '../services/loanProduct.service';
import toast from 'react-hot-toast';
import { useConfirmation } from '../context/ConfirmationContext';

const LoanProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const { confirm } = useConfirmation();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await loanProductService.getProducts();
      setProducts(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch loan products:', error);
      toast.error('Failed to load loan products');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: 'Deactivate Product',
      message: 'Are you sure you want to deactivate this product?',
      confirmText: 'Deactivate',
      type: 'danger'
    });

    if (!isConfirmed) return;

    try {
      await loanProductService.deleteProduct(id);
      toast.success('Product deactivated successfully');
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to deactivate product');
    }
  };

  const closeModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <Header title="Loan Products" />

      <div className="p-6">
        <Card>
          <Card.Header>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <Card.Title>Loan Products</Card.Title>
                <Card.Description>Configure your lending products</Card.Description>
              </div>
              <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
                Add Product
              </Button>
            </div>

            {/* Search */}
            <div className="mt-4">
              <Input
                placeholder="Search products..."
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
                <p className="mt-4 text-slate-600 dark:text-gray-400">Loading products...</p>
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
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product, index) => (
                        <motion.tr
                          key={product.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm text-slate-900 dark:text-gray-200 font-medium">
                            {product.name}
                            <div className="text-xs text-slate-500 font-normal">{product.interest_type.replace('_', ' ')}</div>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-500 dark:text-gray-400">
                            {product.interest_rate}%
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-500 dark:text-gray-400">
                            {product.min_term} - {product.max_term} {product.term_unit}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-500 dark:text-gray-400">
                            {parseFloat(product.min_amount).toLocaleString()} - {parseFloat(product.max_amount).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.is_active
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-slate-500/10 text-slate-500'
                              }`}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                className="p-2 hover:bg-slate-500/10 text-slate-500 hover:text-primary-500 rounded-lg transition-colors"
                                onClick={() => handleEdit(product)}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                                onClick={() => handleDelete(product.id)}
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
                            <p className="text-lg mb-2">No products found</p>
                            <p className="text-sm">Get started by creating a new loan product</p>
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

      <LoanProductModal
        isOpen={isModalOpen}
        onClose={closeModal}
        product={editingProduct}
        onSuccess={() => {
          closeModal();
          fetchProducts();
          toast.success(editingProduct ? 'Product updated' : 'Product created');
        }}
      />
    </div>
  );
};

export default LoanProducts;
