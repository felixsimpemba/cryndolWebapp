import api from './api';

const getProducts = () => api.get('/loan-products');
const getProduct = (id) => api.get(`/loan-products/${id}`);
const createProduct = (data) => api.post('/loan-products', data);
const updateProduct = (id, data) => api.put(`/loan-products/${id}`, data);
const deleteProduct = (id) => api.delete(`/loan-products/${id}`);

const loanProductService = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};

export default loanProductService;
