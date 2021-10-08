import rpc from 'src/utils/rpc';

export default {
  query(param){
    return rpc.query('cloudformation/stack', param);
  },
  delete(uuid, progressCb){
    return rpc._delete(`cloudformation/stack/${uuid}`, null, progressCb)
  },
  create(param, progressCb){
    return rpc.create( `cloudformation/stack`, param, progressCb);
  }
}
