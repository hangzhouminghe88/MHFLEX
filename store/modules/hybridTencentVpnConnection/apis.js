import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`/hybrid/tencent/vpn-connection`, param);
  },
  queryDataCenter(uuid) {
    return rpc.query(`hybrid/tencent/data-center/${uuid}`);
  },
  create(param, progressCb) {
    return rpc.create('hybrid/tencent/vpn-connection', param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update('hybrid/tencent/vpn-connection', uuid, {
      "updateVpcVpnConnectionRemote": param
    }, progressCb)
  },
  delete(url, progressCb) {
    return rpc._delete(url, null, progressCb)
  },
  getVSwitchName(uuid) {
    return rpc.query(`hybrid/tencent/vswitch`, {
      q: `uuid=${uuid}`
    })
  }
}
