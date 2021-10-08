import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`hybrid/vpn-connection`, param);
  },
  queryDataCenter(uuid) {
    return rpc.query(`hybrid/data-center/${uuid}`);
  },
  create(param, progressCb) {
    return rpc.create('hybrid/vpn-connection', param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update('hybrid/vpn-connection', uuid, {
      "updateVpcVpnConnectionRemote": param
    }, progressCb)
  },
  delete(url, progressCb) {
    return rpc._delete(url, null, progressCb)
  },
  getVSwitchName(uuid) {
    return rpc.query(`hybrid/aliyun/vswitch`, {
      q: `uuid=${uuid}`
    })
  }
}
