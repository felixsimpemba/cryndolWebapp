import api from './api';

const getTemplates = () => api.get('/loan-templates');
const getTemplate = (id) => api.get(`/loan-templates/${id}`);
const createTemplate = (data) => api.post('/loan-templates', data);
const updateTemplate = (id, data) => api.put(`/loan-templates/${id}`, data);
const deleteTemplate = (id) => api.delete(`/loan-templates/${id}`);

const loanTemplateService = {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate
};

export default loanTemplateService;
