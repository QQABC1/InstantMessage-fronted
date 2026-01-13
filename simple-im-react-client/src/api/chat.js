import request from './request';

/**
 * 获取历史消息
 * @param {Object} params { targetId, sessionType }
 */
export function getHistoryMsgReq(params) {
  return request({
    url: '/api/chat/history',
    method: 'get',
    params
  });
}