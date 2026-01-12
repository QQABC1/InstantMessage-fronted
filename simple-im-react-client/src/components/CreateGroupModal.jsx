import React, { useState } from 'react';
import { createGroupReq, getGroupListReq } from '../api/group';
import useChatStore from '../store/chatStore';

const CreateGroupModal = ({ isOpen, onClose }) => {
  const { setGroupList } = useChatStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    groupName: '',
    notice: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.groupName.trim()) return;

    setLoading(true);
    try {
      const res = await createGroupReq(formData);
      if (res.code === 200) {
        alert('群组创建成功！');
        // 刷新群组列表
        const listRes = await getGroupListReq();
        if (listRes.code === 200) {
          setGroupList(listRes.data);
        }
        onClose();
        setFormData({ groupName: '', notice: '' });
      }
    } catch (error) {
      alert(error.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        
        {/* 头部：电光紫 */}
        <div className="bg-violet-600 px-6 py-4 flex justify-between items-center text-white">
          <h3 className="text-lg font-bold">创建新群组</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">群名称</label>
            <input
              type="text"
              required
              placeholder="给群起个名字"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all text-sm"
              value={formData.groupName}
              onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">群公告</label>
            <textarea
              rows="3"
              placeholder="介绍一下本群规则..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all text-sm resize-none"
              value={formData.notice}
              onChange={(e) => setFormData({ ...formData, notice: e.target.value })}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition shadow-md shadow-violet-200 active:scale-95"
            >
              {loading ? '创建中...' : '立即创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;