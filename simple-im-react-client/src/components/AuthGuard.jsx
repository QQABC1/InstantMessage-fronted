import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

// 路由守卫组件
const AuthGuard = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  // 如果没有 Token，重定向到登录页
  // state={{ from: location }} 用于登录后跳回原本想去的页面（可选）
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 有 Token，允许访问子组件
  return children;
};

export default AuthGuard;