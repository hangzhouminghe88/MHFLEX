import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`/hybrid/tencent/user-vpn`, param);
  },
  create(param, progressCb) {
    return rpc.create('/hybrid/tencent/user-vpn', param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update('/hybrid/tencent/user-vpn', uuid, {
      "updateVpcUserVpnGateway": param
    }, progressCb)
  },
  delete(url, progressCb) {
    return rpc._delete(url, null, progressCb)
  },
  getDataCenterName(uuid) {
    return rpc.query(`hybrid/tencent/data-center`, {
      q: `uuid=${uuid}`
    })
  }
}
