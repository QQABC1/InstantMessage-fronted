import request from '../api/request';

/**
 * 上传文件
 * @param {FormData} formData 包含 key 为 'file' 的二进制流
 */
export function uploadFileReq(formData) {
  return request({
    url: '/api/file/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data' // 明确指定上传类型
    }
  });
}