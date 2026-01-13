import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';
import useChatStore from '../store/chatStore';
import { getFriendListReq } from '../api/contact';
import ProfileModal from '../components/ProfileModal';
import AddFriendModal from '../components/AddFriendModal';
import NotificationModal from '../components/NotificationModal';
import { getGroupListReq } from '../api/group';
import CreateGroupModal from '../components/CreateGroupModal';
import JoinGroupModal from '../components/JoinGroupModal';
import { useWebSocket } from '../hooks/useWebSocket';
import { MsgType } from '../utils/constants';
import { getHistoryMsgReq } from '../api/chat';
import { uploadFileReq } from '../utils/file';

const ChatRoom = () => {
  const navigate = useNavigate();

  // 全局状态
  const { userInfo, logout } = useUserStore();
  const { currentSession, messages } = useChatStore(); // 取出 messages
  const {
    friendList,
    setFriendList,
    groupList,
    setGroupList,
    setCurrentSession,
    setSessionMessages
  } = useChatStore();



  // 初始化 WebSocket
  const { sendText, sendFile, closeSocket } = useWebSocket();
  const fileInputRef = useRef(null); // 创建 Ref 用于触发点击
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef(null); // 用于滚动到底部
  // 本地状态：控制侧边栏 Tab 切换 (0: 好友, 1: 群组)
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);




  // ✅ 核心逻辑：监听会话切换，加载历史记录
  useEffect(() => {
    // 如果没有选中会话，或者该会话的消息已经加载过(可选缓存策略)，则不请求
    if (!currentSession) return;

    const targetId = currentSession.sessionType === 'group' ? currentSession.id : currentSession.userId;
    const type = currentSession.sessionType === 'group' ? 2 : 1;

// 获取历史消息
    const loadHistory = async () => {
      try {
        const res = await getHistoryMsgReq({
          targetId: targetId,
          sessionType: type
        });

        if (res.code === 200) {
          // ⚠️ 数据格式转换 ⚠️
          const historyList = res.data.map(dbMsg => {
            
            // ---------------------------------------------------------
            // 1. 处理富文本 (msgType === 2)
            // ---------------------------------------------------------
            let fontStyle = {};
            try {
              if (dbMsg.msgType === 2 || (typeof dbMsg.content === 'string' && dbMsg.content.startsWith('{'))) {
                const dataObj = JSON.parse(dbMsg.content);
                return {
                  type: 1, // 前端 UI 视为文本 (MsgType.CHAT_TEXT)
                  senderId: dbMsg.fromId,
                  receiverId: dbMsg.toId,
                  data: dataObj 
                };
              }
            } catch (e) { }

            // ---------------------------------------------------------
            // 2. 处理图片/文件 (msgType === 3)
            // 根据你的 JSON 数据，msgType: 3 且 content 是 URL
            // ---------------------------------------------------------
            if (dbMsg.msgType === 3) {
               return {
                 type: 2, // 对应前端常量 MsgType.CHAT_FILE (通常是2)
                 senderId: dbMsg.fromId,
                 receiverId: dbMsg.toId,
                 data: {
                   url: dbMsg.content,      // 数据库 content 字段直接存的是 URL
                   content: '[图片]',        // 文本展示占位符
                   fileName: '图片',         // 历史记录没存文件名，给个默认值
                   fileSize: 0              // 历史记录没存大小，给个默认值
                 }
               };
            }

            // ---------------------------------------------------------
            // 3. 默认兜底转换 (msgType === 1 或其他)
            // ---------------------------------------------------------
            return {
              type: 1, // MsgType.CHAT_TEXT
              senderId: dbMsg.fromId,
              receiverId: dbMsg.toId,
              data: {
                content: dbMsg.content,
                font: { size: 14, color: "#000000" } // 默认字体
              }
            };
          });

          // 更新 Store
          setSessionMessages(targetId, historyList);
        }
      } catch (error) {
        console.error("加载历史记录失败", error);
      }
    };

    loadHistory();

  }, [currentSession]); // 依赖 currentSession，切换时触发

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 0) {
          const res = await getFriendListReq();
          if (res.code === 200) setFriendList(res.data);
        } else {
          // === 新增群组加载逻辑 ===
          const res = await getGroupListReq();
          if (res.code === 200) setGroupList(res.data);
        }
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [activeTab, setFriendList, setGroupList]);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentSession]);

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

  // 发送处理
  const handleSend = () => {
    if (!inputText.trim() || !currentSession) return;

    // 发送消息
    // currentSession.userId 是好友ID (单聊)
    // currentSession.id 是群组ID (群聊，之前代码存的是id)
    const targetId = currentSession.sessionType === 'group' ? currentSession.id : currentSession.userId;
    const type = currentSession.sessionType === 'group' ? 2 : 1;

    sendText(targetId, inputText, type);
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };
  // 登录退出按钮
  const handleLogout = () => {
    //  先断网
    closeSocket(); 
    logout();
    navigate('/login');
  };

  //处理点击通知按钮
  const handleOpenNotification = () => {
    setIsNotificationOpen(true);
    setHasNewFriendRequest(false); // 点击后消除红点
  };
  // 处理文件选择
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 简单校验
    if (file.size > 10 * 1024 * 1024) { // 10MB
      alert('文件不能超过 10MB');
      return;
    }

    // 1. 构造 FormData
    const formData = new FormData();
    formData.append('file', file); // 后端接口参数名为 'file'

    try {
      // 2. 上传到服务器
      const res = await uploadFileReq(formData);

      if (res.code === 200) {
        // res.data 对应 FileUploadVO: { url, fileName, fileSize }
        const targetId = currentSession.sessionType === 'group' ? currentSession.id : currentSession.userId;
        const type = currentSession.sessionType === 'group' ? 2 : 1;

        // 3. 通过 WebSocket 发送图片链接
        sendFile(targetId, res.data, type);
      }
    } catch (error) {
      console.error('上传失败', error);
      alert('图片发送失败');
    } finally {
      // 清空 input，防止无法连续上传同一张图
      e.target.value = '';
    }
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
              <div className="font-semibold text-sm">{userInfo.nickname}</div>
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

            {/* 动态按钮：好友页显示[添加][通知]，群组页显示[创建][加入] */}
            {activeTab === 0 ? (
              <>
                <button onClick={() => setIsAddFriendOpen(true)} className="p-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg shadow-md transition-all active:scale-95" title="添加好友">
                  {/* ...加号图标... */}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </button>
                <button onClick={() => setIsNotificationOpen(true)} className="p-2 bg-white/10 text-gray-300 hover:bg-violet-600 hover:text-white rounded-lg transition-all" title="通知">
                  {/* ...铃铛图标... */}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>

                </button>
              </>
            ) : (
              <>
                {/* 创建群组按钮 */}
                <button onClick={() => setIsCreateGroupOpen(true)} className="p-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg shadow-md transition-all active:scale-95" title="创建群组">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </button>
                {/* 加入群组按钮 */}
                <button onClick={() => setIsJoinGroupOpen(true)} className="p-2 bg-white/10 text-gray-300 hover:bg-violet-600 hover:text-white rounded-lg transition-all" title="加入群组">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>
                </button>
              </>
            )}
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
          ) : activeTab === 1 ? (
            // === 群组列表 ===
            groupList.length === 0 ? <div className="text-center text-gray-500 mt-10 text-sm">暂无群组</div> :
              groupList.map((group) => (
                <div
                  key={group.id}
                  onClick={() => setCurrentSession({ ...group, sessionType: 'group' })} // 标记类型
                  className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${currentSession?.id === group.id && currentSession?.sessionType === 'group' ? 'bg-violet-600 shadow-lg shadow-violet-900/50' : 'hover:bg-white/5'}`}
                >
                  <div className="relative">
                    {/* 群头像：isGroup=true 使用圆角方形 */}
                    {renderAvatar(null, group.groupName, true)}
                  </div>
                  <div className="ml-3 overflow-hidden">
                    <div className={`text-sm font-medium truncate ${currentSession?.id === group.id ? 'text-white' : 'text-gray-200'}`}>
                      {group.groupName}
                    </div>
                    <div className={`text-xs truncate ${currentSession?.id === group.id ? 'text-violet-200' : 'text-gray-500'}`}>
                      ID: {group.id} {group.role === 3 ? '(群主)' : ''}
                    </div>
                  </div>
                </div>
              ))
          ) : null}
        </div>
      </aside>

      {/* 聊天框 */}
      <main className="flex-1 bg-white flex flex-col relative">
        {currentSession ? (
          <>
            {/* 1. Header (保持不变) */}
            <header className="h-16 border-b border-gray-200 flex items-center px-6 justify-between bg-white shadow-sm z-10">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {currentSession.groupName || currentSession.nickname}
                </h3>
                <div className="text-xs text-gray-500">
                  {currentSession.sessionType === 'group'
                    ? `群组 ID: ${currentSession.id}`
                    : (currentSession.online ? <span className="text-green-600">● 在线</span> : '离线')}
                </div>
              </div>
            </header>

            {/* 2. 消息列表 (核心修改) */}
            <div
              ref={scrollRef}
              className="flex-1 bg-violet-50/30 p-6 overflow-y-auto space-y-4"
            >
              {/* 获取当前会话的消息列表 */}
              {(messages[currentSession.userId || currentSession.id] || []).map((msg, index) => {
                const isMe = msg.senderId === userInfo.id;

                return (
                  <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>

                    {/* 对方头像 */}
                    {!isMe && (
                      <div className="w-9 h-9 rounded-full bg-violet-200 flex items-center justify-center text-xs text-violet-700 font-bold mr-2 flex-shrink-0">
                        {/* 简单起见，不查对方具体头像了，用 ? 代替 */}
                        TA
                      </div>
                    )}

                    <div className="max-w-[70%]">
                      {/* 昵称 (群聊时显示) */}
                      {!isMe && currentSession.sessionType === 'group' && (
                        <div className="text-xs text-gray-400 mb-1 ml-1">{msg.senderId}</div>
                      )}

                      {/* 气泡本体 */}
                      <div
                        className={`px-4 py-2.5 shadow-sm text-sm break-all ${isMe
                          ? 'bg-violet-600 text-white rounded-l-2xl rounded-tr-2xl rounded-br-sm' // 我的: 电光紫
                          : 'bg-white text-gray-800 border border-gray-100 rounded-r-2xl rounded-tl-2xl rounded-bl-sm' // 对方: 白色
                          }`}
                        style={{
                          // 如果后端传了字体样式，可以在这里应用
                          fontSize: msg.data.font?.size + 'px',
                          color: isMe ? '#fff' : (msg.data.font?.color || 'inherit'),
                          fontWeight: msg.data.font?.bold ? 'bold' : 'normal'
                        }}
                      >
                        {/* 文本消息 */}
                        {msg.type === MsgType.CHAT_TEXT && msg.data.content}
                        {/* 图片消息渲染 */}
                        {msg.type === MsgType.CHAT_FILE && (
                          <div className="group cursor-pointer">
                            <img
                              src={msg.data.url}
                              alt="chat-img"
                              className="max-w-[200px] max-h-[200px] rounded-lg object-cover hover:opacity-90 transition"
                              onClick={() => window.open(msg.data.url, '_blank')} // 点击查看大图
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 我的头像 */}
                    {isMe && (
                      <img
                        src={userInfo.avatar || `https://api.dicebear.com/7.x/miniavs/svg?seed=${userInfo.username}`}
                        className="w-9 h-9 rounded-full bg-gray-200 ml-2 flex-shrink-0 object-cover"
                        alt="me"
                      />
                    )}
                  </div>
                );
              })}

              {/* 空消息提示 */}
              {(!messages[currentSession.userId || currentSession.id] || messages[currentSession.userId || currentSession.id].length === 0) && (
                <div className="text-center text-gray-400 text-xs mt-10">
                  - 既然相遇，不如聊聊 -
                </div>
              )}
            </div>

            {/* 隐藏的文件输入框 */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*" // 限制只选图片
              onChange={handleFileChange}
            />
            {/* 3. 输入框 (绑定事件) */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center bg-gray-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
                {/* ✅ 新增：图片上传按钮 (图标) */}
                <button
                  onClick={() => fileInputRef.current.click()} // 触发隐藏的input
                  className="mr-2 text-gray-400 hover:text-violet-600 transition-colors"
                  title="发送图片"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </button>
                <input
                  type="text"
                  className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 h-10"
                  placeholder="发送消息..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                <button
                  onClick={handleSend}
                  className="ml-2 bg-violet-600 hover:bg-violet-700 text-white p-2 rounded-lg transition-colors shadow-md active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transform -rotate-45 translate-x-0.5 translate-y-[-1px]">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl grayscale">👋</span>
            </div>
            <p>选择一个好友或群组开始聊天</p>
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
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
      />
      <JoinGroupModal
        isOpen={isJoinGroupOpen}
        onClose={() => setIsJoinGroupOpen(false)}
      />

    </div>


  );
};

export default ChatRoom;