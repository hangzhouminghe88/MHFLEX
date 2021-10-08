import rpc from 'src/utils/rpc';

export default {
  basicQuery(param){
    return rpc.query('/hybrid/tencent/identity-zone', param);
  },
  delete(uuid, progressCb){
    return rpc._delete(`hybrid/tencent/identity-zone/${uuid}`, null, progressCb);
  },
  create(param, progressCb){
    return rpc.create('/hybrid/tencent/identity-zone', param, progressCb)
  },
  queryDataCenter(uuid) {
    return rpc.query(`/hybrid/tencent/data-center/${uuid}`)
  }
}
