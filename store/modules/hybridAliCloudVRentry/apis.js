import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`hybrid/aliyun/route-entry`, param);
  },
  create(param, progressCb) {
    return rpc.create('hybrid/aliyun/route-entry', param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update('hybrid/aliyun/route-entry', uuid, {
      "updateRouteEntry": param
    }, progressCb)
  },
  delete(url, uuid, type, progressCb) {
    return rpc._delete(`${url}${uuid}`, {
      type: type
    }, progressCb)
  }
}
