import React, { useEffect, useState } from 'react';
import { getPendingRequestsReq, approveFriendReq, getFriendListReq } from '../api/contact';
import useChatStore from '../store/chatStore';

const NotificationModal = ({ isOpen, onClose }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setFriendList } = useChatStore(); // 用于同意后刷新好友列表

  // 打开弹窗时加载数据
  useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getPendingRequestsReq();
      if (res.code === 200) {
        setRequests(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 处理申请 (同意/拒绝)
  const handleApprove = async (requestId, agree) => {
    try {
      const res = await approveFriendReq({ requestId, agree });
      if (res.code === 200) {
        // 1. 从列表中移除该条目
        setRequests(prev => prev.filter(req => req.userId !== requestId));
        
        // 2. 如果是同意，重新拉取最新的好友列表，更新 UI
        if (agree) {
          const listRes = await getFriendListReq();
          if (listRes.code === 200) {
            setFriendList(listRes.data);
          }
        }
      }
    } catch (error) {
      alert(error.message || '操作失败');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        
        {/* 头部：电光紫 */}
        <div className="bg-violet-600 px-6 py-4 flex justify-between items-center text-white">
          <h3 className="text-lg font-bold">新朋友通知</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 列表区域 */}
        <div className="min-h-[300px] max-h-[500px] overflow-y-auto bg-gray-50 p-4">
          {loading ? (
            <div className="flex justify-center py-10 text-gray-400">
              <svg className="animate-spin h-6 w-6 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              加载中...
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-sm">暂无新的好友申请</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.userId} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <img 
                      src={req.avatar || `https://api.dicebear.com/7.x/miniavs/svg?seed=${req.username}`} 
                      alt="avatar" 
                      className="w-10 h-10 rounded-full bg-gray-100"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-800 truncate text-sm">{req.nickname}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {/* 这里展示申请附言 */}
                        留言: {req.remark || '无'} 
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                    {/* 拒绝按钮 */}
                    <button 
                      onClick={() => handleApprove(req.userId, false)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="拒绝"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    {/* 同意按钮 (电光紫) */}
                    <button 
                      onClick={() => handleApprove(req.userId, true)}
                      className="px-3 py-1.5 bg-violet-600 text-white text-xs font-bold rounded-lg hover:bg-violet-700 active:scale-95 transition shadow-sm shadow-violet-200"
                    >
                      同意
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;