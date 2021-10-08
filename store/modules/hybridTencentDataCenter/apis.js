import rpc from 'src/utils/rpc';

export default {
  basicQuery(param){
    return rpc.query('/hybrid/tencent/data-center', param);
  },
  delete(uuid, progressCb){
    return rpc._delete(`hybrid/tencent/data-center/${uuid}`, null, progressCb);
  },
  create(param, progressCb){
    return rpc.create('/hybrid/tencent/data-center', param, progressCb)
  }
}
