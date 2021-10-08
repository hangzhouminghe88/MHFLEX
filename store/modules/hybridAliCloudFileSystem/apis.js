import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`primary-storage/nas`, param);
  },
  create(param, progressCb) {
    return rpc.create('nas/aliyun', param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update.update(`primary-storage/nas`, uuid, {
      'updateNasFileSystem': param
    }, progressCb)
  },
  delete(uuid, progressCb) {
    return rpc._delete(`primary-storage/nas/${uuid}`, null, progressCb)
  }
}
