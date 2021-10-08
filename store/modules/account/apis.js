import rpc from 'src/utils/rpc';
export  default {
  query(param){
    return rpc.query('accounts', param);
  },
  queryBindings(param){
    return rpc.query(`ldap/bindings`, {q: `accountUuid=${param}`, count: true})
  },
  queryUsages(param){
    return rpc.query(`accounts/quota/${param}/usages`)
  },
  queryAccountVmTotalNum(param){
    return  rpc.query('/zql', {
      zql: encodeURIComponent(param)
    })
  },
  createAccount(param, progressCb){
    return rpc.create('accounts', param, progressCb)
  },
  delete(uuid, progressCb){
    return rpc._delete(`accounts/${uuid}`, null, progressCb)
  },
  update(uuid, obj, progressCb){
    return rpc.put(`accounts/${uuid}`, {
      'updateAccount': obj
    }, progressCb)
  },
  queryVmResource(uuid){
    return rpc.query('accounts/resources/refs', {
      q: [`accountUuid=${uuid}`, 'resourceType=VmInstanceVO'],
      replyWithCount: 'true'
    })
  },
  queryVolumeResource(uuid) {
    return rpc.query('accounts/resources/refs', {
      q: [`accountUuid=${uuid}`, 'resourceType=VolumeVO'],
      fields: 'resourceUuid'
    })
  },
  queryVolume(uuidList){
    return rpc.query('volumes', {
      q: [`uuid?=${uuidList.join()}`, 'type=Data', 'status!=Deleted'],
      replyWithCount: 'true'
    })
  }
}
