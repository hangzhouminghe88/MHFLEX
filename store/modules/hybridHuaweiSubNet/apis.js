import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`hybrid/huawei/subnet`, param);
  },
  queryIdentityZone(uuid) {
    return rpc.query(`/hybrid/huawei/identity-zone/${uuid}`);
  },
  create(param, progressCb) {
    return rpc.create('hybrid/huawei/subnet', param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update('/hybrid/huawei/subnet', uuid, {
      "updateVswitch": param
    }, progressCb)
  },
  delete(url, uuid, progressCb) {
    return rpc._delete(`${url}/${uuid}`, null, progressCb)
  },
  queryVpc(uuid) {
    return rpc.query('hybrid/huawei/vpc', {
      q: `uuid=${uuid}`
    })
  }
}
