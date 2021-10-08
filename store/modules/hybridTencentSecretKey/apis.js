import rpc from 'src/utils/rpc';

export default {
  basicQuery(param){
    return rpc.query('/hybrid/tencent/key', param);
  },
  attach(uuid, progressCb){
    return rpc.put(`hybrid/tencent/key/${uuid}/attach`, null, progressCb)
  },
  detach(uuid, progressCb){
    return rpc.put(`hybrid/tencent/key/${uuid}/detach`, null, progressCb)
  },
  delete(uuid, progressCb){
    return rpc._delete(`hybrid/tencent/key/${uuid}`, null, progressCb);
  },
  update(uuid, param, progressCb){
    return rpc.create(`hybrid/tencent/${uuid}/key`, param, progressCb)
  },
  create(param, progressCb){
    return rpc.create('/hybrid/tencent/key', param, progressCb)
  }
}
