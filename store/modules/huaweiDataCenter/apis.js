import rpc from 'src/utils/rpc';

export default {
  basicQuery(param){
    return rpc.query('brid/data-center', param);
  },
  delete(uuid, progressCb){
    return rpc._delete(`brid/data-center/${uuid}`, null, progressCb);
  },
  create(param, progressCb){
    return rpc.create('brid/data-center', param, progressCb)
  }
}
