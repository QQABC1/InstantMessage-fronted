import { create } from 'zustand';

const useUserStore = create((set) => ({
  token: localStorage.getItem('token') || '',
  userInfo: JSON.parse(localStorage.getItem('userInfo')) || {},

  // 登录成功动作
  loginSuccess: (payload) => {
    // payload 结构对应后端 Result.data: { token, tokenHead, username, ... }
    const fullToken = payload.tokenHead + payload.token; 
    
    localStorage.setItem('token', fullToken);
    localStorage.setItem('userInfo', JSON.stringify(payload));

    set({ 
      token: fullToken,
      userInfo: payload
    });
  },
    // === 新增：更新本地用户信息 ===
  updateLocalUserInfo: (partialData) => {
    set((state) => {
      const newUserInfo = { ...state.userInfo, ...partialData };
      localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
      return { userInfo: newUserInfo };
    });
  },

  // 登出动作
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    set({ token: '', userInfo: {} });
  }
}));

export default useUserStore;