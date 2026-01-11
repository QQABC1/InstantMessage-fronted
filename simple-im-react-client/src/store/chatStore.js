import { create } from 'zustand';

const useChatStore = create((set) => ({
  friendList: [], // 好友列表
  groupList: [],  // 群组列表
  currentSession: null, // 当前选中的聊天对象 (好友或群组)

  // 设置好友列表
  setFriendList: (list) => set({ friendList: list }),
  
  // 设置群组列表
  setGroupList: (list) => set({ groupList: list }),

  // 选中某个会话
  setCurrentSession: (session) => set({ currentSession: session }),
}));

export default useChatStore;