import axios from 'axios';

// 创建 axios 实例
const request = axios.create({
  // 开发环境通常配置代理，这里直接写相对路径，由 Vite 代理到后端 8080
  baseURL: '',
  timeout: 15000, // 建议适当延长超时时间，特别是上传文件时
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // ============ 【关键修改】先检查 token 是否存在 ============
    const token = localStorage.getItem('token');
    

    if (token) {
      // 【建议】确保 token 格式正确，如果是 JWT 通常需要加 Bearer 前缀
      // 假设你存储的是完整 token，如 "Bearer eyJhbGciOi..."
      config.headers['Authorization'] = token;
      // 如果你存储的只是 token 字符串，需要拼接：
      // config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 请求配置出错（非常少见）
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    // 如果后端返回的 code 不是 200，说明有业务错误
    if (res.code !== 200) {
      // 可以在这里统一弹窗提示，或者交给具体页面处理
      console.error('业务错误:', res.msg || `错误码: ${res.code}`);
      return Promise.reject(new Error(res.msg || '请求失败'));
    }
    return res;
  },
  (error) => {
    // 网络错误、HTTP 状态码错误（如 401、500 等）
    if (error.response) {
      // 请求已发出，服务器有响应（状态码不是 2xx）
      const { status, data } = error.response;
      const errorMsg = data?.msg || data?.message || error.message;
      
      console.error(`HTTP 错误 ${status}:`, errorMsg);
      
      // ✅ 处理 401 未授权 (Token 过期或无效)
      if (status === 401) {
        console.warn('身份认证失败，清除 token 并跳转登录页...');
        // 1. 清除本地存储的认证信息
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        
        // 2. 避免重复跳转：当前不在登录页时才跳转
        if (!window.location.pathname.includes('/login')) {
          // 添加一个查询参数，让登录页知道是过期跳转过来的（可选）
          const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.href = `/login?redirect=${redirectUrl}`;
        }
      }
      
      // 【可选】处理其他常见错误
      if (status === 403) {
        console.error('权限不足，无法访问此资源');
      }
      if (status === 404) {
        console.error('请求的资源不存在');
      }
      if (status >= 500) {
        console.error('服务器内部错误，请联系管理员');
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应（网络断开、服务器未启动、CORS 问题等）
      console.error('网络错误：未收到服务器响应', error.message);
      // 可以在这里提示用户检查网络连接
    } else {
      // 请求配置出错（如之前的 ReferenceError）
      console.error('请求配置错误:', error.message);
    }
    
    // 将错误继续抛出，让具体调用的地方可以 .catch 处理
    return Promise.reject(error);
  }
);

export default request;