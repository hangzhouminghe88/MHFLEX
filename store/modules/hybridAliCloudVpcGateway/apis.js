import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`hybrid/vpc-vpn`, param);
  },
  queryDataCenter(uuid) {
    return rpc.query(`hybrid/data-center/${uuid}`);
  },
  create(param, progressCb) {
    return rpc.create('hybrid/vpc-vpn', param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update('hybrid/vpc-vpn', uuid, {
      "updateVpcVpnGateway": param
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
