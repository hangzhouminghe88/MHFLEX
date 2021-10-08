import rpc from 'src/utils/rpc';
export default {
  basicQuery(param){
    return rpc.query(`accounts/groups`, param)
  },
  create(param, progressCb){
    return rpc.create(`accounts/groups`, param, progressCb)
  },
  delete(uuid, progressCb){
    return rpc._delete(`accounts/groups/${uuid}`,null,  progressCb)
  },
  detailQuery(uuid){
    return rpc.query(`accounts/groups/${uuid}`)
  },
  update(param, progressCb){
    return rpc.put('accounts/groups/actions',{
      "updateUserGroup": param,
    }, progressCb)
  },
  addUser(uuid, userGroupUuid, progressCb){
    return rpc.post(`accounts/groups/${userGroupUuid}/users`, {
      'params': {
        'userUuid': uuid
      }
    } , progressCb)
  }
}
