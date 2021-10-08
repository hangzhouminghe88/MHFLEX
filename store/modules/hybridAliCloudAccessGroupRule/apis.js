import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`nas/aliyun/nas/access/${param}`);
  },
  create(param, progressCb) {
    return rpc.create('nas/aliyun/rule', param, progressCb);
  },
  delete(uuid, progressCb) {
    return rpc._delete(`nas/access/${uuid}`, null, progressCb)
  }
}
