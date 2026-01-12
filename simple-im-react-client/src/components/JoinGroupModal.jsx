import React, { useState } from 'react';
import { joinGroupReq, getGroupListReq } from '../api/group';
import useChatStore from '../store/chatStore';

const JoinGroupModal = ({ isOpen, onClose }) => {
  const { setGroupList } = useChatStore();
  const [loading, setLoading] = useState(false);
  const [groupId, setGroupId] = useState('');

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!groupId) return;

    setLoading(true);
    try {
      const res = await joinGroupReq({ groupId: parseInt(groupId) });
      if (res.code === 200) {
        alert('加入成功！');
        // 刷新列表
        const listRes = await getGroupListReq();
        if (listRes.code === 200) {
          setGroupList(listRes.data);
        }
        onClose();
        setGroupId('');
      }
    } catch (error) {
      // 这里会捕获后端抛出的 "你已经在这个群里了" 异常
      alert(error.message || '加入失败');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        
        <div className="bg-violet-600 px-6 py-4 flex justify-between items-center text-white">
          <h3 className="text-lg font-bold">加入群组</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleJoin} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">群组 ID</label>
            <input
              type="number"
              required
              placeholder="请输入群号 (ID)"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all text-sm"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-2">
              * 测试阶段请输入精准的数字 ID (例如: 1)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition shadow-md shadow-violet-200 active:scale-95"
          >
            {loading ? '加入中...' : '申请加入'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinGroupModal;