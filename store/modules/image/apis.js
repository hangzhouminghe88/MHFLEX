import rpc from "src/utils/rpc";

export default{
  query (param) {
    return rpc.query('images', param)
  },
  queryBs(param){
    return rpc.query('backup-storage', {
      q: param
    })
  },
  update (uuid, param, progressCb) {
    return rpc.update('images', uuid, {
      'updateImage': param
    }, progressCb)
  },
}
