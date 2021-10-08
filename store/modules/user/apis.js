import rpc from 'src/utils/rpc';

export default {
  basicQuery(param){
    return rpc.query(`accounts/users`, param);
  },
  create(param, progressCb){
    return rpc.create('accounts/users', param, progressCb);
  },
  delete(uuid, progressCb){
    return rpc._delete(`accounts/users/${uuid}`, null, progressCb)
  },
  detailQuery(uuid){
    return rpc.query(`accounts/users/${uuid}`)
  },
  update(param, progressCb){
    return rpc.put('accounts/users/actions',{
      "updateUser": param,
    }, progressCb)
  }
}
