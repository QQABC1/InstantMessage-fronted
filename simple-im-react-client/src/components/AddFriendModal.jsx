import React, { useState } from 'react';
import { searchUserReq, addFriendReq } from '../api/contact';

const AddFriendModal = ({ isOpen, onClose }) => {
  const [searchText, setSearchText] = useState('');
  const [searchResult, setSearchResult] = useState(null); // 存储搜索到的用户信息
  const [loading, setLoading] = useState(false);
  const [remark, setRemark] = useState(''); // 申请备注
  const [requestSent, setRequestSent] = useState(false); // 是否已发送申请

  // 重置状态
  const resetState = () => {
    setSearchText('');
    setSearchResult(null);
    setRemark('');
    setRequestSent(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // 执行搜索
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchText.trim()) return;

    setLoading(true);
    setSearchResult(null);
    setRequestSent(false);
    
    try {
      const res = await searchUserReq(searchText);
      if (res.code === 200 && res.data) {
        setSearchResult(res.data);
      }
    } catch (error) {
      alert('未找到该用户，请检查账号是否正确');
    } finally {
      setLoading(false);
    }
  };

  // 发送好友申请
  const handleAddFriend = async () => {
    if (!searchResult) return;
    
    try {
      const res = await addFriendReq({
        targetUserId: searchResult.id,
        remark: remark || `我是${searchResult.nickname}的朋友` // 默认备注
      });
      if (res.code === 200) {
        setRequestSent(true); // 切换为成功状态
      }
    } catch (error) {
      alert(error.message || '申请发送失败');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        
        {/* 头部：电光紫 */}
        <div className="bg-violet-600 px-6 py-4 flex justify-between items-center text-white">
          <h3 className="text-lg font-bold">添加好友</h3>
          <button onClick={handleClose} className="hover:bg-white/20 p-1 rounded-full transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* 搜索框区域 */}
          <form onSubmit={handleSearch} className="relative mb-6">
            <input
              type="text"
              placeholder="输入对方账号 (username)"
              className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all text-sm"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 p-1.5 bg-violet-100 text-violet-600 rounded-lg hover:bg-violet-600 hover:text-white transition-colors"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
          </form>

          {/* 搜索结果显示区域 */}
          {searchResult && (
            <div className="bg-violet-50 rounded-xl p-4 border border-violet-100 animate-fade-in">
              <div className="flex items-center space-x-4">
                {/* 头像 */}
                <img 
                  src={searchResult.avatar || `https://api.dicebear.com/7.x/miniavs/svg?seed=${searchResult.username}`} 
                  alt="avatar" 
                  className="w-14 h-14 rounded-full bg-white border-2 border-white shadow-sm"
                />
                
                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-gray-900 font-bold truncate">{searchResult.nickname}</h4>
                    {searchResult.gender === 1 && <span className="text-blue-500 text-xs">♂</span>}
                    {searchResult.gender === 2 && <span className="text-pink-500 text-xs">♀</span>}
                  </div>
                  <p className="text-gray-500 text-xs">账号: {searchResult.username}</p>
                  <p className="text-gray-400 text-xs truncate mt-1">
                    {searchResult.signature || '暂无个性签名'}
                  </p>
                </div>
              </div>

              {/* 操作区域 */}
              <div className="mt-4 pt-4 border-t border-violet-200/50">
                {!requestSent ? (
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="发送验证申请: 我是..."
                      className="w-full px-3 py-2 bg-white border border-violet-200 rounded-lg text-sm focus:outline-none focus:border-violet-500"
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                    />
                    <button 
                      onClick={handleAddFriend}
                      className="w-full py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition shadow-md shadow-violet-200 text-sm"
                    >
                      发送好友申请
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-green-600 py-2 bg-green-50 rounded-lg border border-green-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    申请已发送
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 空状态提示 */}
          {!searchResult && !loading && (
            <div className="text-center py-8 text-gray-400 text-sm">
              输入精准账号查找陌生人
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddFriendModal;