import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginReq, registerReq } from '../api/auth';
import useUserStore from '../store/userStore';

const Login = () => {
  const navigate = useNavigate();
  const loginSuccess = useUserStore((state) => state.loginSuccess);

  // true: 注册模式, false: 登录模式
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nickname: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        // === 注册 ===
        await registerReq(formData);
        alert('注册成功，请登录！');
        setIsRegister(false);
        setFormData(prev => ({ ...prev, password: '' })); // 清空密码
      } else {
        // === 登录 ===
        const { nickname, ...loginData } = formData; // 登录不需要昵称
        const res = await loginReq(loginData);
        // 保存状态并跳转
        loginSuccess(res.data);
        navigate('/chat'); // 假设聊天页路由是 /chat
      }
    } catch (error) {
      alert(error.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    // 容器：全屏 + 淡紫背景 + Flex居中
    <div className="min-h-screen w-full flex items-center justify-center bg-violet-50 p-4">
      
      {/* 登录卡片：白色 + 阴影 + 圆角 */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8 transition-all duration-300">
        
        {/* 头部 Logo 区域 */}
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-200 mb-4">
            IM
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isRegister ? '创建新账号' : '欢迎回来'}
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            {isRegister ? '填写以下信息开启聊天之旅' : '登录以连接您的好友'}
          </p>
        </div>

        {/* 表单区域 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* 账号输入框 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">账号</label>
            <input
              type="text"
              name="username"
              required
              placeholder="请输入用户名"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-violet-600 focus:ring-4 focus:ring-violet-100 transition-all duration-200"
            />
          </div>

          {/* 昵称输入框 (仅注册显示) */}
          {isRegister && (
            <div className="animate-fade-in-down">
              <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
              <input
                type="text"
                name="nickname"
                required
                placeholder="大家怎么称呼你？"
                value={formData.nickname}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-violet-600 focus:ring-4 focus:ring-violet-100 transition-all duration-200"
              />
            </div>
          )}

          {/* 密码输入框 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              type="password"
              name="password"
              required
              placeholder="请输入密码"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-violet-600 focus:ring-4 focus:ring-violet-100 transition-all duration-200"
            />
          </div>

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-semibold text-sm shadow-md transition-all duration-200 
              ${loading 
                ? 'bg-violet-400 cursor-not-allowed' 
                : 'bg-violet-600 hover:bg-violet-700 hover:shadow-lg active:transform active:scale-95'
              }`}
          >
            {loading ? '处理中...' : (isRegister ? '立即注册' : '登 录')}
          </button>
        </form>

        {/* 底部切换链接 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            {isRegister ? '已有账号？' : '还没有账号？'}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="ml-1 font-semibold text-violet-600 hover:text-violet-700 hover:underline focus:outline-none"
            >
              {isRegister ? '直接登录' : '免费注册'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;