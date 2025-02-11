// api/axios.ts
import axios from 'axios';
import { API_CONFIG } from '@/utils/config';

const api = axios.create({
    baseURL: API_CONFIG.baseURL,
    withCredentials: true,
    timeout: 10000,
});

export default api;