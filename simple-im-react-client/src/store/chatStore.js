import { create } from 'zustand';

const useChatStore = create((set) => ({
  friendList: [], // 好友列表
  groupList: [],  // 群组列表
  currentSession: null, // 当前选中的聊天对象 (好友或群组)
  // 消息记录字典: { [sessionId]: [msg1, msg2, ...] }
  messages: {},
  //是否有新的好友申请
  hasNewFriendRequest: false,

  // 设置好友列表
  setFriendList: (list) => set({ friendList: list }),

  // 设置群组列表
  setGroupList: (list) => set({ groupList: list }),
  //更新有新好友状态
  setHasNewFriendRequest: (status) => set({ hasNewFriendRequest: status }),
  // 选中某个会话
  setCurrentSession: (session) => set({ currentSession: session }),
  // 接收/发送消息时调用
  addMessage: (sessionId, message) => {
    set((state) => {
      // 从当前的 state 中获取历史消息
      const prevMessages = state.messages[sessionId] || [];
      return {
        messages: {
          ...state.messages,
          [sessionId]: [...prevMessages, message]
        }
      };
    });
  },

  // 2. 设置完整消息列表 (用于 Step 5: 历史漫游)
  setSessionMessages: (sessionId, msgList) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [sessionId]: msgList
      }
    }));
  },
  //更新好友在线状态
  updateFriendStatus: (friendId, isOnline) => {
    set((state) => ({
      friendList: state.friendList.map((friend) =>
        friend.userId === friendId
          ? { ...friend, online: isOnline }
          : friend
      )
    }));
  }
}));

export default useChatStore;