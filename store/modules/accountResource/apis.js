import rpc from 'src/utils/rpc'

export default {
  shareToPublic (uuidList, progressCb) {
    return rpc.put('accounts/resources/actions', {
      'shareResource': {
        'resourceUuids': uuidList,
        'toPublic': true
      }
    }, progressCb)
  },
  revokePublicSharing (uuidList, progressCb) {
    return rpc.put('accounts/resources/actions', {
      'revokeResourceSharing': {
        'resourceUuids': uuidList,
        'toPublic': true,
        'all': true
      }
    }, progressCb)
  },
  async getSharedToPubliceResource (uuidList) {
    let list = []
    let respAccountsResources = await rpc.query('accounts/resources', {
      q: `resourceUuid?=${uuidList.join(',')}`
    })
    respAccountsResources.inventories.forEach((item) => {
      list.push({
        uuid: item.resourceUuid,
        toPublic: !!item.toPublic
      })
    })
    return list
  },
  async changeOwner (resourceUuid, accountUuid, progressCb) {
    await rpc.create(`account/${accountUuid}/resources`, {
      resourceUuid
    }, progressCb)
  }
}



// WEBPACK FOOTER //
// ./src/store/modules/accountResource/apis.js
