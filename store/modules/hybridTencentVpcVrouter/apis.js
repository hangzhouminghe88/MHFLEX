import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`hybrid/tencent/vrouter`, param);
  },
  queryHybridVpc(uuid) {
    return rpc.query(`hybrid/tencent/vpc/${uuid}`);
  },
  create(param, progressCb) {
    return rpc.create('hybrid/tencent/vrouter', param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update('hybrid/tencent/vrouter', uuid, {
      "updateTencentVirtualRouter": param
    }, progressCb)
  },
  delete(url, uuid, progressCb) {
    return rpc._delete(`${url}${uuid}`, null, progressCb)
  },
}
