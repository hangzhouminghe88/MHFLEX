import rpc from 'src/utils/rpc'

let get = async function (uuidList) {
  return rpc.query('system-tags', {
    q: `resourceUuid?=${uuidList.join(',')}`
  })
}

let query = async function (conditions) {
  return rpc.query('system-tags', {
    q: conditions
  })
}

let create = async function (param, progressCb) {
  return rpc.create('system-tags', param, progressCb)
}

let update = async function (uuid, tag, progressCb) {
  return rpc.update('system-tags', uuid, {
    updateSystemTag: {
      tag
    }
  }, progressCb)
}

let _delete = async function (uuid, progressCb) {
  return rpc._delete(`tags/${uuid}`, null, progressCb)
}

export default {
  get,
  query,
  create,
  update,
  _delete
}



// WEBPACK FOOTER //
// ./src/store/modules/systemTag/apis.js