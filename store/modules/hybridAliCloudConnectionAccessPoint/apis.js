import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`hybrid/aliyun/access-point`, param);
  },
  create(param, progressCb) {
    return rpc.create('hybrid/aliyun/access-point', param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update('hybrid/aliyun/access-point', uuid, {
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
  },

  getOpposoteInterfaceName(uuid){
    return rpc.query(`hybrid/aliyun/router-interface/${uuid}`);
  } 
}
