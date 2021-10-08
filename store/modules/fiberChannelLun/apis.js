import rpc from 'src/utils/rpc'

export default {
  async query (param) {
    return await rpc.query('storage-devices/fiber-channel/luns', param)
  },
  attachVm (vmUuid, uuid, progressCb) {
    return rpc.post(`vm-instances/${vmUuid}/scsi-lun/${uuid}`, null, progressCb)
  },
  detachVm (vmUuid, uuid, progressCb) {
    return rpc._delete(`vm-instances/${vmUuid}/scsi-lun/${uuid}`, null, progressCb)
  },
  update (uuid, obj, progressCb) {
    return rpc.update('storage-devices/scsi-lun', uuid, {
      'updateScsiLun': obj
    }, progressCb)
  },
  async queryScsiLun (param) {
    return await rpc.query('storage-devices/scsi-lun/luns', param)
  },
  async queryFcList (param) {
    return await rpc.query('storage-devices/fiber-channel/controllers', param)
  },
  refresh (zoneUuid, progressCb) {
    return rpc.post(`storage-devices/fiber-channel/controllers`, {
      params: {
        zoneUuid
      }
    }, progressCb)
  }
}



// WEBPACK FOOTER //
// ./src/store/modules/fiberChannelLun/apis.js