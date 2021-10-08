import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`hybrid/aliyun/border-router`, param);
  },
  create(param, progressCb) {
    return rpc.create('hybrid/aliyun/border-router', param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update('hybrid/aliyun/border-router', uuid, {
      "updateVpcUserVpnGateway": param
    }, progressCb)
  },
  delete(url, progressCb) {
    return rpc._delete(url, null, progressCb)
  },

  getDataCenterName(uuid) {
    return rpc.query(`hybrid/data-center`, {
      q: `uuid=${uuid}`
    })
  },

  getAccessPointName(uuid) {
    return rpc.query(`hybrid/aliyun/access-point/${uuid}`)
  },
  async(uuid, progressCb) {
    return rpc.put(`hybrid/aliyun/border-router/${uuid}/sync`, null, progressCb)
  }
}
