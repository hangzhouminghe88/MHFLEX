import rpc from 'src/utils/rpc';

export default {
  basicQuery(param){
    return rpc.query('accesskeys', param);
  },
  queryAccountResource(param){
   return rpc.query('accounts/resources/refs', {
      q: 'resourceUuid?=' + param
    })
  },
  queryAccount(resourceUuidList){
   return rpc.query('accounts', {
      q: 'uuid?=' + resourceUuidList
    })
  },
  queryProjects(resourceUuidList){
    return rpc.query('iam2/projects', {
      q: 'linkedAccountUuid?=' + resourceUuidList
    })
  },
  enable(uuid, progressCb){
    return rpc.update('accesskeys', uuid, {
      'changeAccessKeyState': {
        'stateEvent': 'enable'
      }
    }, progressCb)
  },
  disable(uuid, progressCb){
    return rpc.update('accesskeys', uuid, {
      'changeAccessKeyState': {
        'stateEvent': 'disable'
      }
    }, progressCb)
  },
  delete(uuid, progressCb){
    return rpc._delete(`accesskeys/${uuid}`, undefined, progressCb);
  },
  queryBs(uuid){
    return  rpc.query('backup-storage', {
      q: `accesskey.uuid=${uuid}`,
      fields: 'uuid'
    }).then((resp) => {
      let bsUuidList = resp.inventories.map(item => item.uuid)
      bsUuidList.forEach((bsUuid) => {
        return rpc._delete(`backup-storage/${bsUuid}`)
      })
    })
  },
  create(param, progressCb){
    return rpc.create('accesskeys', param, progressCb)
  }
}
