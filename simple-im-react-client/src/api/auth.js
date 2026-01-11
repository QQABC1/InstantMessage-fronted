import request from './request';

/**
 * 用户注册
 * @param {Object} data { username, password, nickname }
 */
export function registerReq(data) {
  return request({
    url: '/api/auth/register',
    method: 'post',
    data: data
  });
}

/**
 * 用户登录
 * @param {Object} data { username, password }
 */
export function loginReq(data) {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data: data
  });
}