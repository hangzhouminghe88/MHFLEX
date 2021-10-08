import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`/hybrid/tencent/route-entry`, param);
  },
  create(param, progressCb) {
    return rpc.create('/hybrid/tencent/route-entry', param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update('/hybrid/tencent/route-entry', uuid, {
      "updateRouteEntry": param
    }, progressCb)
  },
  delete(uuid, progressCb) {
    return rpc._delete(`/hybrid/tencent/route-entry/${uuid}`,null, progressCb)
  }
}
