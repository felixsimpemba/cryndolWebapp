import api from './api';

const getTemplates    = ()        => api.get('/loan-templates');
const getTemplate     = (id)      => api.get(`/loan-templates/${id}`);
const configureTemplate = (id, data) => api.put(`/loan-templates/${id}`, data);

// Alias for backwards compat
const updateTemplate  = configureTemplate;

const loanTemplateService = {
  getTemplates,
  getTemplate,
  configureTemplate,
  updateTemplate,
};

export default loanTemplateService;
