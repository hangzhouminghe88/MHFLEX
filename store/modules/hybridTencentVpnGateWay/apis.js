import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`/hybrid/tencent/vpc-vpn`, param);
  },
  queryDataCenter(uuid) {
    return rpc.query(`hybrid/tencent/data-center/${uuid}`);
  },
  create(param, progressCb) {
    return rpc.create('/hybrid/tencent/vpc-vpn', param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update('/hybrid/tencent/vpc-vpn', uuid, {
      "updateVpcVpnGateway": param
    }, progressCb)
  },
  delete(url, progressCb) {
    return rpc._delete(url, null, progressCb)
  },
  getVSwitchName(uuid) {
    return rpc.query(`hybrid/tencent/vswitch`, {
      q: `uuid=${uuid}`
    })
  },
  sync(uuid, progressCb) {
    return rpc.post(`/hybrid/tencent/vpc-vpn/${uuid}/sync`, null, progressCb)
  }
}
