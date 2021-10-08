import rpc from 'src/utils/rpc';

export default{
  query(param){
    return rpc.query(`vcenters`, param);
  },
  syncvCenter(uuid, progressCb){
    return rpc.update('vcenters', uuid, {
      syncVCenter: {}
    }, progressCb)
  },
  delete(uuid, progressCb){
    return rpc._delete(`vcenters/${uuid}`, null, progressCb);
  },
  create(params, progressCb){
    return rpc.create(`vcenters`, params, progressCb);
  },
  update(uuid, param, progressCb){
    return rpc.update(`vcenters`, uuid, {
      "updateVCenter": param
    }, progressCb);
  }
}
