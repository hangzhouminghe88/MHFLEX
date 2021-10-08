import rpc from 'src/utils/rpc';

export default {
  basicQuery(param){
    return rpc.query('/brid/identity-zone', param);
  },
  delete(uuid, progressCb){
    return rpc._delete(`/brid/identity-zone/${uuid}`, null, progressCb);
  },
  create(param, progressCb){
    return rpc.create('/brid/identity-zone', param, progressCb)
  },
  queryDataCenter(uuid) {
    return rpc.query(`/brid/data-center/${uuid}`)
  }
}
