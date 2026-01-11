import React, { useState, useEffect } from 'react';
import useUserStore from '../store/userStore';
import { updateUserInfoReq, updatePasswordReq, getUserInfoReq } from '../api/user';

const ProfileModal = ({ isOpen, onClose }) => {
  const { userInfo, updateLocalUserInfo } = useUserStore();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'
  const [loading, setLoading] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState({
    nickname: '',
    signature: '',
    gender: 0,
    avatar: '',
  });

  // 密码表单
  const [pwdData, setPwdData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 打开弹窗时，从后端获取最新数据回显
  useEffect(() => {
    if (isOpen) {
      // 优先显示 store 里的，同时静默请求最新数据
      setFormData({
        nickname: userInfo.nickname || '',
        signature: userInfo.signature || '', // 假设 store 里还没存 signature，初始为空
        gender: userInfo.gender || 0,
        avatar: userInfo.avatar || ''
      });
      
      // 调用 API 获取最全的资料（包含 signature, gender 等可能不在登录返回里的字段）
      getUserInfoReq().then(res => {
        if(res.code === 200) {
          const remoteData = res.data;
          setFormData({
            nickname: remoteData.nickname,
            signature: remoteData.signature || '',
            gender: remoteData.gender,
            avatar: remoteData.avatar
          });
          // 同步更新 store，防止数据不一致
          updateLocalUserInfo(remoteData);
        }
      });
    }
  }, [isOpen]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateUserInfoReq(formData);
      if (res.code === 200) {
        alert('资料修改成功');
        updateLocalUserInfo(formData); // 更新全局状态
        onClose(); // 关闭弹窗
      }
    } catch (error) {
      alert(error.message || '修改失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }
    setLoading(true);
    try {
      const res = await updatePasswordReq({
        oldPassword: pwdData.oldPassword,
        newPassword: pwdData.newPassword
      });
      if (res.code === 200) {
        alert('密码修改成功，请重新登录');
        onClose();
        // 这里可以触发登出逻辑，视需求而定
      }
    } catch (error) {
      alert(error.message || '修改失败');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    // 遮罩层
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* 弹窗主体 */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-fade-in-up">
        
        {/* 头部：电光紫背景 */}
        <div className="bg-violet-600 px-6 py-4 flex justify-between items-center text-white">
          <h3 className="text-lg font-bold">个人中心</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab 切换 */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'profile' 
                ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            基本资料
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'security' 
                ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            安全设置
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6">
          {activeTab === 'profile' ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* 头像预览与设置 */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative w-20 h-20 rounded-full border-2 border-violet-100 overflow-hidden bg-gray-100 flex-shrink-0">
                   <img 
                     src={formData.avatar || `https://api.dicebear.com/7.x/miniavs/svg?seed=${userInfo.username}`} 
                     alt="Avatar" 
                     className="w-full h-full object-cover"
                   />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">头像链接</label>
                  <input
                    type="text"
                    value={formData.avatar}
                    onChange={e => setFormData({...formData, avatar: e.target.value})}
                    placeholder="输入图片URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
                  />
                  <p className="text-xs text-gray-400 mt-1">支持粘贴网络图片地址</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={e => setFormData({...formData, nickname: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({...formData, gender: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  >
                    <option value={0}>保密</option>
                    <option value={1}>男</option>
                    <option value={2}>女</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">个性签名</label>
                <textarea
                  rows="3"
                  value={formData.signature}
                  onChange={e => setFormData({...formData, signature: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none"
                  placeholder="写点什么..."
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition shadow-md shadow-violet-200"
                >
                  {loading ? '保存中...' : '保存修改'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePwdSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">旧密码</label>
                <input
                  type="password"
                  required
                  value={pwdData.oldPassword}
                  onChange={e => setPwdData({...pwdData, oldPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">新密码</label>
                <input
                  type="password"
                  required
                  value={pwdData.newPassword}
                  onChange={e => setPwdData({...pwdData, newPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
                <input
                  type="password"
                  required
                  value={pwdData.confirmPassword}
                  onChange={e => setPwdData({...pwdData, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition shadow-md shadow-red-200"
                >
                  {loading ? '处理中...' : '确认修改密码'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;