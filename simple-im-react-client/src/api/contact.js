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