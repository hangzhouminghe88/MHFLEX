import rpc from 'src/utils/rpc';

export default {
  query(param) {
    return rpc.query(`hybrid/eip`, param);
  },
  queryEcs(uuid) {
    return rpc.query('hybrid/aliyun/ecs', {
      q: [`uuid=${uuid}`]
    });
  },
  create(param, progressCb) {
    return rpc.create('hybrid/eip', param, progressCb);
  },
  update(uuid, param, progressCb) {
    return rpc.update('hybrid/eip', uuid, {
      "updateHybridEip": param
    }, progressCb)
  },
  delete(url, progressCb) {
    return rpc._delete(url, { type: 'aliyun' }, progressCb)
  },
  queryDataCenter(uuid){
    return rpc.query(`hybrid/data-center`, {
      q: `uuid=${uuid}`,
    })
  },
  detach(uuid, progressCb) {
    return rpc.put(`hybrid/eip/${uuid}/detach`, {
      'params': {
        "type": "aliyun"
      }
    }, progressCb)
  },
  attach(uuid,vmNicUuid,  progressCb) {
    return rpc.put(`hybrid/eip/${uuid}/attach`, {
      params: {
        ecsUuid: vmNicUuid,
        type: 'aliyun'
      }
    }, progressCb)
  }
}
