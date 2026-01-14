import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ChatRoom from './pages/ChatRoom';
import AuthGuard from './components/AuthGuard'; // 引入守卫
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Routes>
        {/* 1. 根路径重定向：一进来就跳到 /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 2. 公开页面：登录/注册 */}
        <Route path="/login" element={<Login />} />

        {/* 3. 受保护页面：必须登录才能访问 */}
        <Route 
          path="/chat" 
          element={
            <AuthGuard>
              <ChatRoom />
            </AuthGuard>
          } 
        />

        {/* 4. 404 处理 (可选，未匹配路由跳回登录) */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      
      <Toaster position="top-center" />
    </>
  );
}

export default App;