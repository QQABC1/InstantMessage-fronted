import request from './request';

/**
 * 创建群组
 * @param {Object} data { groupName, notice }
 */
export function createGroupReq(data) {
  return request({
    url: '/api/group/create',
    method: 'post',
    data
  });
}

/**
 * 获取我的群组列表
 * @returns Result<List<GroupVO>>
 */
export function getGroupListReq() {
  return request({
    url: '/api/group/list',
    method: 'get'
  });
}

/**
 * 加入群组
 * @param {Object} data { groupId }
 */
export function joinGroupReq(data) {
  return request({
    url: '/api/group/join',
    method: 'post',
    data
  });
}