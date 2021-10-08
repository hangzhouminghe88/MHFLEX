import rpc from 'src/utils/rpc'
// import _ from 'lodash'
// import accountResourceApi from '../accountResource/apis'
// import util from '../../utils'

export default {
  query (param) {
    return rpc.query('volumes', param)
  },
  update (uuid, obj, progressCb) {
    return rpc.update('volumes', uuid, {
      'updateVolume': obj
    }, progressCb)
  },
  enable (uuid, progressCb) {
    return rpc.update('volumes', uuid, {
      'changeVolumeState': {
        'stateEvent': 'enable'
      }
    }, progressCb)
  },
  disable (uuid, progressCb) {
    return rpc.update('volumes', uuid, {
      'changeVolumeState': {
        'stateEvent': 'disable'
      }
    }, progressCb)
  },
  attach (volumeUuid, vmUuid, progressCb) {
    return rpc.create(`volumes/${volumeUuid}/vm-instances/${vmUuid}`, null, progressCb)
  },
  detach (volumeUuid, progressCb) {
    return rpc._delete(`volumes/${volumeUuid}/vm-instances`, null, progressCb)
  },
  detachShareable (volumeUuid, vmUuid, progressCb) {
    return rpc._delete(`volumes/${volumeUuid}/vm-instances`, {
      vmUuid
    }, progressCb)
  },
  migrate (param, progressCb) {
    return rpc.update('primary-storage/local-storage/volumes', param.uuid, {
      'localStorageMigrateVolume': {
        'destHostUuid': param.hostUuid
      }
    }, progressCb, param.jobUuid)
  },
  rootVolumeBackup (uuid, param, progressCb) {
    rpc.create(`images/root-volume-templates/from/volumes/${uuid}`, param, progressCb)
  },
  dataVolumeBackup (uuid, param, progressCb) {
    rpc.create(`images/data-volume-templates/from/volumes/${uuid}`, param, progressCb)
  },
  // createRootVolumeTemplate (msg, progressCb, jobUuid) {
  //   return rpc.create('longjobs', {
  //     jobName: 'APICreateRootVolumeTemplateFromRootVolumeMsg',
  //     jobData: JSON.stringify(msg)
  //   }, progressCb, jobUuid)
  // },
  // createDataVolumeTemplate (msg, progressCb, jobUuid) {
  //   return rpc.create('longjobs', {
  //     jobName: 'APICreateDataVolumeTemplateFromVolumeMsg',
  //     jobData: JSON.stringify(msg)
  //   }, progressCb, jobUuid)
  // },
  createSnapshot (uuid, param, progressCb) {
    return rpc.create(`volumes/${uuid}/volume-snapshots`, param, progressCb)
  },
  removeQos (uuid, mode, progressCb) {
    return rpc._delete(`volumes/${uuid}/qos`, {
      mode: mode
    }, progressCb)
  },
  setQos (uuid, volumeBandwidth, mode, progressCb) {
    return rpc.put(`volumes/${uuid}/actions`, {
      setVolumeQos: {
        volumeBandwidth: volumeBandwidth,
        mode: mode
      }
    }, progressCb)
  },
  // storageMigrate (msg, progressCb, jobUuid) {
  //   return rpc.create('longjobs', {
  //     jobName: 'APIPrimaryStorageMigrateVolumeMsg',
  //     jobData: JSON.stringify(msg)
  //   }, progressCb, jobUuid)
  // },
  create (msg, progressCb) {
    return rpc.create('instance-offerings', msg, progressCb)
  },
  delete (uuid, progressCb) {
    return rpc._delete(`volumes/${uuid}`, null, progressCb)
  },
  refreshActualSize (uuid, progressCb) {
    return rpc.put(`volumes/${uuid}/actions`, {
      syncVolumeSize: {}
    }, progressCb)
  },
  recover (uuid, progressCb) {
    return rpc.update('volumes', uuid, {
      'recoverDataVolume': {}
    }, progressCb)
  },
  expunge (uuid, progressCb) {
    return rpc.update('volumes', uuid, {
      'expungeDataVolume': {}
    }, progressCb)
  },
  resize (uuid, size, progressCb) {
    return rpc.put(`volumes/data/resize/${uuid}/actions`, {
      resizeDataVolume: {
        size: size
      }
    }, progressCb)
  },
  resizeRoot (uuid, size, progressCb) {
    return rpc.put(`volumes/resize/${uuid}/actions`, {
      resizeRootVolume: {
        size: size
      }
    }, progressCb)
  },
  queryShareableVolumeVmInstanceRefByVolumeUuid (uuidList) {
    return rpc.query('volumes/vm-instances/refs', {
      q: `volumeUuid?=${uuidList}`
    })
  },
  getVolumeCapabilities (uuid) {
    return rpc.query(`volumes/${uuid}/capabilities`)
  },
  getVolumeQos (uuid) {
    return rpc.query(`volumes/${uuid}/qos`)
  }
}



// WEBPACK FOOTER //
// ./src/store/modules/volume/apis.js