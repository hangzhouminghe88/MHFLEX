import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`hybrid/aliyun/vrouter`, param);
  },
  queryHybridVpc(uuid) {
    return rpc.query(`hybrid/aliyun/vpc/${uuid}`);
  },
  create(param, progressCb) {
    return rpc.create('hybrid/aliyun/vrouter', param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update('hybrid/aliyun/vrouter', uuid, {
      "updateAliyunVirtualRouter": param
    }, progressCb)
  },
  delete(url, uuid, progressCb) {
    return rpc._delete(`${url}${uuid}`, null, progressCb)
  },
}
