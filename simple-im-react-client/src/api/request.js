import axios from 'axios';

// 创建 axios 实例
const request = axios.create({
  // 开发环境通常配置代理，这里直接写相对路径，由 Vite 代理到后端 8080
  baseURL: '', 
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 如果有 token，带上 token (从 localStorage 取)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = token; // 注意后端是 Bearer token，这里假设存的时候已经拼好了或者后端只认纯token
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data;
    // 如果后端返回的 code 不是 200，说明有业务错误
    if (res.code !== 200) {
      // 可以统一在这里弹窗提示错误，或者抛出异常由页面处理
      return Promise.reject(new Error(res.msg || 'Error'));
    }
    return res; // 直接返回后端 Result 的 json 对象
  },
  error => {
    console.error('Request err: ' + error);
    return Promise.reject(error);
  }
);

export default request;