import axios from 'axios';
import { getTenantId } from './tenant';

axios.interceptors.request.use((config) => {
  const tenantId = getTenantId();
  if (tenantId) {
    config.headers = config.headers || {};
    config.headers['X-Tenant-Id'] = tenantId;
  }
  return config;
});

