import rpc from 'src/utils/rpc';
import accountResourceApi from "../accountResource/apis";
export default{
  queryResource(params){
    return rpc.query('accounts/resources', params)
  },
  query(params){
    return rpc.query('disk-offerings',params);
  },
  enable (uuid, progressCb) {
    return rpc.update('disk-offerings', uuid, {
      'changeDiskOfferingState': {
        'stateEvent': 'enable'
      }
    }, progressCb)
  },
  disable(uuid, progressCb){
    return rpc.update('disk-offerings', uuid, {
      'changeDiskOfferingState': {
        'stateEvent': 'disable'
      }
    }, progressCb)
  },
  delete (uuid, progressCb) {
    return rpc._delete(`disk-offerings/${uuid}`, null, progressCb)
  },
  create (msg, progressCb) {
    return rpc.create('disk-offerings', msg, progressCb)
  },
  async queryByUuid(uuid){
    let resp = await rpc.query(`disk-offerings/${uuid}`)
    return resp.inventories[0]
  },
  update (uuid, obj, progressCb) {
    return rpc.update('disk-offerings', uuid, {
      'updateDiskOffering': obj
    }, progressCb)
  },
  async queryExtraData (uuid, isAdmin) {
    let respSystemTags = await rpc.query('system-tags', {
      q: `resourceUuid=${uuid}`
    })

    let objA = {}
    respSystemTags.inventories.forEach((item) => {
      let val = item.tag.split('::')
      objA[val[0]] = val[1]
    })
    if (isAdmin) {
      objA.toPublic = false
      let list = await accountResourceApi.getSharedToPubliceResource([uuid])
      if (list.length > 0) {
        objA.toPublic = !!list[0].toPublic
      } else {
        objA.toPublic = false
      }
    }
    return objA
  },
}
