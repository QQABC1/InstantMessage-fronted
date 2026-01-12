import request from './request';

/**
 * 获取好友列表
 * 响应数据: Result<List<ContactVO>>
 */
export function getFriendListReq() {
  return request({
    url: '/api/friend/list',
    method: 'get'
  });
}

/**
 * 获取群组列表 (预留，对应需求 3.2.2)
 */
export function getGroupListReq() {
  // 假设后端接口为 /api/group/list
  return request({
    url: '/api/group/list',
    method: 'get'
  });
}

  /**
 * 搜索用户 (精确查找)
 * @param {string} username 
 */
export function searchUserReq(username) {
  return request({
    url: '/api/friend/search',
    method: 'get',
    params: { username }
  });
}

/**
 * 发起好友申请
 * @param {Object} data { targetUserId, remark }
 */
export function addFriendReq(data) {
  return request({
    url: '/api/friend/request',
    method: 'post',
    data
  });
}

/**
 * 获取待处理的好友申请
 * @returns Result<List<ContactVO>>
 */
export function getPendingRequestsReq() {
  return request({
    url: '/api/friend/pending',
    method: 'get'
  });
}

/**
 * 处理好友申请
 * @param {Object} data { requestId, agree }
 */
export function approveFriendReq(data) {
  return request({
    url: '/api/friend/approve',
    method: 'post',
    data
  });
}
