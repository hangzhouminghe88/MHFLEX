import rpc from 'src/utils/rpc'

export default {
  async queryList (param) {
    return await rpc.query('storage-devices/iscsi/servers', param)
  },
  async queryByUuid (uuid) {
    let resp = await rpc.query(`storage-devices/iscsi/servers/${uuid}`)
    return resp.inventories[0]
  },
  create (msg, progressCb) {
    return rpc.create('storage-devices/iscsi/servers', msg, progressCb)
  },
  delete (uuid, progressCb) {
    return rpc._delete(`storage-devices/iscsi/servers/${uuid}`, null, progressCb)
  },
  update (uuid, obj, progressCb) {
    return rpc.update('storage-devices/iscsi/servers', uuid, {
      'updateIscsiServer': obj
    }, progressCb)
  },
  attachCluster (clusterUuid, uuid, progressCb) {
    return rpc.post(`clusters/${clusterUuid}/storage-devices/iscsi/servers/${uuid}`, null, progressCb)
  },
  detachCluster (clusterUuid, uuid, progressCb) {
    return rpc._delete(`clusters/${clusterUuid}/storage-devices/iscsi/servers/${uuid}`, null, progressCb)
  },
  refreshIscsiServer (uuid, progressCb) {
    return rpc.post(`storage-devices/iscsi/servers/${uuid}`, null, progressCb)
  },
  async queryLunList (param) {
    return await rpc.query('storage-devices/iscsi/luns', param)
  }
}



// WEBPACK FOOTER //
// ./src/store/modules/webStorage/apis.js