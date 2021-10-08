import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`hybrid/tencent/eip`, param);
  },
  queryEcs(uuid) {
    return rpc.query('hybrid/tencent/ecs', {
      q: [`uuid=${uuid}`]
    });
  },
  create(param, progressCb) {
    return rpc.create('hybrid/tencent/eip', param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update('hybrid/tencent/eip', uuid, {
      "updateTencentEip": param
    }, progressCb)
  },
  delete(url, progressCb) {
    return rpc._delete(url, { type: 'tencent' }, progressCb)
  },
  queryDataCenter(uuid){
    return rpc.query(`hybrid/tencent/data-center`, {
      q: `uuid=${uuid}`,
    })
  },
  detach(uuid, progressCb) {
    return rpc.put(`hybrid/tencent/eip/${uuid}/detach`, {
      'params': {
        "type": "tencent"
      }
    }, progressCb)
  },
  attach(uuid,vmNicUuid,  progressCb) {
    return rpc.put(`hybrid/tencent/eip/${uuid}/attach`, {
      params: {
        ecsUuid: vmNicUuid,
        type: 'tencent'
      }
    }, progressCb)
  }
}
