import { create } from 'zustand';

const useChatStore = create((set) => ({
  friendList: [], // 好友列表
  groupList: [],  // 群组列表
  currentSession: null, // 当前选中的聊天对象 (好友或群组)
    // 消息记录字典: { [sessionId]: [msg1, msg2, ...] }
  messages: {},

  // 设置好友列表
  setFriendList: (list) => set({ friendList: list }),
  
  // 设置群组列表
  setGroupList: (list) => set({ groupList: list }),

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
  }
}));

export default useChatStore;