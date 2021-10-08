import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`nas/aliyun/access`, param);
  },
  create(param, progressCb) {
    return rpc.create('nas/aliyun/access', param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update.update(`primary-storage/nas`, uuid, {
      'updateAliyunNasAccessGroup': param
    }, progressCb)
  },
  delete(uuid, progressCb) {
    return rpc._delete(`nas/access/${uuid}`, null, progressCb)
  }
}
