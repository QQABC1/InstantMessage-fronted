import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';
import useChatStore from '../store/chatStore';
import { getFriendListReq } from '../api/contact';
import ProfileModal from '../components/ProfileModal';
import AddFriendModal from '../components/AddFriendModal';
import NotificationModal from '../components/NotificationModal';
const ChatRoom = () => {
  const navigate = useNavigate();

  // 全局状态
  const { userInfo, logout } = useUserStore();
  const { friendList, setFriendList, currentSession, setCurrentSession } = useChatStore();


  // 本地状态：控制侧边栏 Tab 切换 (0: 好友, 1: 群组)
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // 初始化加载好友列表
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getFriendListReq();
        if (res.code === 200) {
          setFriendList(res.data);
        }
      } catch (error) {
        console.error("加载好友失败", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setFriendList]);

  // 处理登出
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 渲染头像 (如果没头像则用首字母占位)
  const renderAvatar = (url, name) => {
    if (url) {
      return <img src={url} alt={name} className="w-10 h-10 rounded-full object-cover bg-gray-200" />;
    }
    return (
      <div className="w-10 h-10 rounded-full bg-violet-500 text-white flex items-center justify-center font-bold text-sm">
        {name ? name.charAt(0).toUpperCase() : '?'}
      </div>
    );
  };

  return (
    // 整体容器：禁止页面滚动，高度占满
    <div className="flex h-screen w-full overflow-hidden bg-gray-100">

      {/* ================= 左侧侧边栏 (Sidebar) ================= */}
      <aside className="w-80 flex flex-col bg-[#1e1b4b] text-white flex-shrink-0">

        {/* 1. 个人信息区 */}
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <div
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition"
            onClick={() => setIsProfileOpen(true)} // <--- 点击打开弹窗
          >
            {renderAvatar(userInfo.avatar || "https://api.dicebear.com/7.x/miniavs/svg?seed=" + userInfo.username, userInfo.nickname)}
            <div>
              <div className="font-semibold text-sm">{userInfo.nickname || userInfo.username}</div>
              <div className="text-xs text-green-400 flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                在线
              </div>
            </div>
          </div>
          {/* 登出按钮 (简单图标) */}
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
            title="退出登录"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
        </div>

        {/* 2. 搜索框 */}
        <div className="px-4 py-3">
          {/* 2. 搜索框 & 添加按钮 */}
          <div className="px-4 py-3 flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="过滤列表..." // 注意：这里的搜索通常是过滤本地列表
                className="w-full bg-black/20 text-sm text-white placeholder-gray-400 border border-transparent focus:border-violet-500 rounded-lg pl-9 pr-3 py-2 outline-none transition-all"
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 absolute left-3 top-2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>

            {/* 新增：添加好友按钮 (+) */}
            <button
              onClick={() => setIsAddFriendOpen(true)}
              className="p-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg shadow-md transition-all active:scale-95"
              title="添加好友"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>

            {/* 新增: 通知按钮 (铃铛) */}
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="p-2 bg-white/10 text-gray-300 hover:bg-violet-600 hover:text-white rounded-lg transition-all relative"
              title="好友通知"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {/* 这里可以通过 Store 判断是否有未读红点，暂时写死一个红点示例 */}
              {/* <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#1e1b4b]"></span> */}
            </button>
          </div>
        </div>

        {/* 3. Tab 切换 (好友 / 群组) */}
        <div className="flex border-b border-white/10 text-sm font-medium">
          <button
            onClick={() => setActiveTab(0)}
            className={`flex-1 py-3 text-center transition-colors ${activeTab === 0 ? 'text-violet-400 border-b-2 border-violet-500' : 'text-gray-400 hover:text-white'}`}
          >
            好友
          </button>
          <button
            onClick={() => setActiveTab(1)}
            className={`flex-1 py-3 text-center transition-colors ${activeTab === 1 ? 'text-violet-400 border-b-2 border-violet-500' : 'text-gray-400 hover:text-white'}`}
          >
            群组
          </button>
        </div>

        {/* 4. 列表区域 (滚动) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="text-center text-gray-500 mt-10 text-sm">加载中...</div>
          ) : activeTab === 0 ? (
            // === 好友列表 ===
            <div className="space-y-1 p-2">
              {friendList.length === 0 && (
                <div className="text-center text-gray-500 mt-10 text-sm">暂无好友，去添加一个吧</div>
              )}
              {friendList.map((friend) => (
                <div
                  key={friend.userId}
                  onClick={() => setCurrentSession(friend)}
                  className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 
                    ${currentSession?.userId === friend.userId
                      ? 'bg-violet-600 shadow-lg shadow-violet-900/50' // 选中态：电光紫
                      : 'hover:bg-white/5' // 悬停态
                    }`}
                >
                  {/* 头像容器 (带在线状态点) */}
                  <div className="relative">
                    {renderAvatar(friend.avatar, friend.nickname)}
                    {/* 在线状态点: 只有 online=true 才显示绿色，否则显示灰色或不显示 */}
                    <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-[#1e1b4b] rounded-full 
                      ${friend.online ? 'bg-green-500' : 'bg-gray-500'}`}>
                    </span>
                  </div>

                  {/* 文本信息 */}
                  <div className="ml-3 overflow-hidden">
                    <div className={`text-sm font-medium truncate ${currentSession?.userId === friend.userId ? 'text-white' : 'text-gray-200'}`}>
                      {friend.nickname}
                    </div>
                    <div className={`text-xs truncate ${currentSession?.userId === friend.userId ? 'text-violet-200' : 'text-gray-500'}`}>
                      {friend.online ? '[在线]' : '[离线]'} 点击发起聊天
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // === 群组列表 (占位) ===
            <div className="text-center text-gray-500 mt-10 text-sm">暂无群组</div>
          )}
        </div>
      </aside>

      {/* ================= 右侧聊天区域 (Chat Area) ================= */}
      <main className="flex-1 bg-white flex flex-col relative">
        {currentSession ? (
          <>
            {/* 聊天头部 */}
            <header className="h-16 border-b border-gray-200 flex items-center px-6 justify-between bg-white shadow-sm z-10">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {currentSession.remark || currentSession.nickname}
                </h3>
                <div className="flex items-center text-xs text-gray-500">
                  {currentSession.online ? (
                    <span className="text-green-600 flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1"></span>在线
                    </span>
                  ) : '离线'}
                </div>
              </div>

              {/* 右侧工具栏 (更多操作) */}
              <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </button>
            </header>

            {/* 消息列表占位 */}
            <div className="flex-1 bg-violet-50/30 p-6 overflow-y-auto">
              <div className="text-center text-gray-400 text-sm mt-20">
                这里是与 {currentSession.nickname} 的聊天记录<br />
                (WebSocket 消息对接中...)
              </div>
            </div>

            {/* 输入框占位 */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
                <input
                  type="text"
                  className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 h-10"
                  placeholder="发送消息..."
                />
                <button className="ml-2 bg-violet-600 hover:bg-violet-700 text-white p-2 rounded-lg transition-colors shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transform -rotate-45 translate-x-0.5 translate-y-[-1px]">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          // 空状态 (未选中任何好友)
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <p>选择一个好友开始聊天</p>
          </div>
        )}
      </main>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
      <AddFriendModal
        isOpen={isAddFriendOpen}
        onClose={() => setIsAddFriendOpen(false)}
      />
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

    </div>


  );
};

export default ChatRoom;