import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`hybrid/cip`, param);
  },
  queryEcs(uuid) {
    return rpc.query('hybrid/huawei/ecs', {
      q: [`uuid=${uuid}`]
    });
  },
  create(param, progressCb) {
    return rpc.create('hybrid/cip', param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update('hybrid/cip', uuid, {
      "updateTencentEip": param
    }, progressCb)
  },
  delete(url, progressCb) {
    return rpc._delete(url, { type: 'huawei' }, progressCb)
  },
  queryDataCenter(uuid){
    return rpc.query(`brid/data-center`, {
      q: `uuid=${uuid}`,
    })
  },
  detach(uuid, progressCb) {
    return rpc.put(`hybrid/cip/${uuid}/detach`, {
      'params': {
        "type": "huawei"
      }
    }, progressCb)
  },
  attach(uuid,vmNicUuid,  progressCb) {
    return rpc.put(`hybrid/cip/${uuid}/attach`, {
      params: {
        ecsUuid: vmNicUuid,
        type: 'huawei'
      }
    }, progressCb)
  }
}
