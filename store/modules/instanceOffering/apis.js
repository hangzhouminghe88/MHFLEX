import rpc from 'src/utils/rpc'
// import _ from 'lodash'
import accountResourceApi from '../accountResource/apis'

export default {
  async query (param) {
    return await rpc.query('instance-offerings', param)
  },
  async queryByUuid (uuid) {
    let resp = await rpc.query(`instance-offerings/${uuid}`)
    return resp.inventories[0]
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
  update (uuid, obj, progressCb) {
    return rpc.update('instance-offerings', uuid, {
      'updateInstanceOffering': obj
    }, progressCb)
  },
  enable (uuid, progressCb) {
    return rpc.update('instance-offerings', uuid, {
      'changeInstanceOfferingState': {
        'stateEvent': 'enable'
      }
    }, progressCb)
  },
  disable (uuid, progressCb) {
    return rpc.update('instance-offerings', uuid, {
      'changeInstanceOfferingState': {
        'stateEvent': 'disable'
      }
    }, progressCb)
  },
  create (msg, progressCb) {
    return rpc.create('instance-offerings', msg, progressCb)
  },
  delete (uuid, progressCb) {
    return rpc._delete(`instance-offerings/${uuid}`, null, progressCb)
  }
}



// WEBPACK FOOTER //
// ./src/store/modules/instanceOffering/apis.js