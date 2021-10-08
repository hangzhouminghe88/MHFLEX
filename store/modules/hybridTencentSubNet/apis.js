import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`hybrid/tencent/vswitch`, param);
  },
  queryIdentityZone(uuid) {
    return rpc.query(`/hybrid/tencent/identity-zone/${uuid}`);
  },
  create(param, progressCb) {
    return rpc.create('hybrid/tencent/vswitch', param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update('/hybrid/tencent/vswitch', uuid, {
      "updateVswitch": param
    }, progressCb)
  },
  delete(url, uuid, progressCb) {
    return rpc._delete(`${url}/${uuid}`, null, progressCb)
  },
  queryVpc(uuid) {
    return rpc.query('hybrid/tencent/vpc', {
      q: `uuid=${uuid}`
    })
  }
}
