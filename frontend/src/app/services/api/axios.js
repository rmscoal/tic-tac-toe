import axios from 'axios';

const ax = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  timeout: 1000,
});

ax.interceptors.request.use(
  function (config) {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export { ax };
