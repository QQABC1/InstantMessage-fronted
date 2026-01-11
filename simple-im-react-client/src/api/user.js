import request from './request';

/**
 * 获取当前用户信息
 * @returns Result<UserVO>
 */
export function getUserInfoReq() {
  return request({
    url: '/api/user/info',
    method: 'get'
  });
}

/**
 * 修改个人资料
 * @param {Object} data { nickname, avatar, signature, gender }
 */
export function updateUserInfoReq(data) {
  return request({
    url: '/api/user/update',
    method: 'post',
    data
  });
}

/**
 * 修改密码
 * @param {Object} data { oldPassword, newPassword }
 */
export function updatePasswordReq(data) {
  return request({
    url: '/api/user/password',
    method: 'post',
    data
  });
}