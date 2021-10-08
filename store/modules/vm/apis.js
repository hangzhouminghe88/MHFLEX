import rpc from 'src/utils/rpc'
import systemTagsApi from '../systemTag/apis'
// import _ from 'lodash'
// import accountResourceApi from '../accountResource/apis'
// import util from '../../utils'

export default {
  query (param) {
    return rpc.query('vm-instances', param)
  },
  reboot (uuid, progressCb) {
    return rpc.update('vm-instances', uuid, {
      'rebootVmInstance': {}
    }, progressCb)
  },
  pause (uuid, progressCb) {
    return rpc.update('vm-instances', uuid, {
      'pauseVmInstance': {}
    }, progressCb)
  },
  resume (uuid, progressCb) {
    return rpc.update('vm-instances', uuid, {
      'resumeVmInstance': {}
    }, progressCb)
  },
  powerOff (uuid, stopHa, progressCb) {
    return rpc.update('vm-instances', uuid, {
      'stopVmInstance': {
        'type': 'cold',
        'stopHA': stopHa
      }
    }, progressCb)
  },
  openConsole (uuid, progressCb) {
    return rpc.create('consoles', {
      'vmInstanceUuid': uuid
    }, progressCb)
  },
  clone (uuid, param, event) {
    return rpc.update('vm-instances', uuid, {
      cloneVmInstance: {
        strategy: param.strategy,
        names: param.names,
        full: param.full,
        primaryStorageUuidForRootVolume: param.primaryStorageUuidForRootVolume,
        primaryStorageUuidForDataVolume: param.primaryStorageUuidForDataVolume,
        systemTags: param.systemTags,
        rootVolumeSystemTags: param.rootVolumeSystemTags,
        dataVolumeSystemTags: param.dataVolumeSystemTags
      }
    }, event)
  },
  attachIso (isoUuid, vmUuid, cdromUuid, progressCb) {
    let obj = {}
    if (cdromUuid) obj.systemTags = [`cdromUuid::${cdromUuid}`]
    return rpc.post(`vm-instances/${vmUuid}/iso/${isoUuid}`, obj, progressCb)
  },
  detachIso (isoUuid, vmUuid, progressCb) {
    return rpc._delete(`vm-instances/${vmUuid}/iso`, {
      isoUuid
    }, progressCb)
  },
  setVmSshKey (uuid, sshKey, progressCb) {
    return rpc.update('vm-instances', uuid, {
      'setVmSshKey': {
        'SshKey': sshKey
      }
    }, progressCb)
  },
  deleteVmSshKey (uuid, progressCb) {
    return rpc._delete(`vm-instances/${uuid}/ssh-keys`, null, progressCb)
  },
  setHa (uuid, level, progressCb) {
    return rpc.create(`vm-instances/${uuid}/ha-levels`, {
      level
    }, progressCb)
  },
  deleteHa (uuid, level, progressCb) {
    return rpc._delete(`vm-instances/${uuid}/ha-levels`, null, progressCb)
  },
  setVmBootOrder (uuid, bootOrder, cdromBootOnce, progressCb) {
    let payload = {
      setVmBootOrder: {
        bootOrder
      }
    }
    if (cdromBootOnce) {
      payload.setVmBootOrder.systemTags = ['cdromBootOnce::true']
    }
    return rpc.put(`vm-instances/${uuid}/actions`, payload, progressCb)
  },
  setConsolePassword (uuid, password, progressCb) {
    return rpc.put(`vm-instances/${uuid}/actions`, {
      'setVmConsolePassword': {
        'consolePassword': password
      }
    }, progressCb)
  },
  reimage (uuid, progressCb) {
    return rpc.update('vm-instances', uuid, {
      'reimageVmInstance': {}
    }, progressCb)
  },
  setRdpMode (uuid, enable, progressCb) {
    return rpc.put(`vm-instances/${uuid}/actions`, {
      setVmRDP: {
        enable
      }
    }, progressCb)
  },
  setVmCleanTraffic (uuid, enable, progressCb) {
    return rpc.put(`vm-instances/${uuid}/actions`, {
      setVmCleanTraffic: {
        enable
      }
    }, progressCb)
  },
  setVmPassword (uuid, account, password, progressCb) {
    return rpc.put(`vm-instances/${uuid}/actions`, {
      'changeVmPassword': {
        password,
        account
      }
    }, progressCb)
  },
  async setConsoleMode (uuid, mode, progressCb) {
    let resp = await rpc.query('system-tags', {
      q: [`resourceUuid=${uuid}`, 'resourceType=VmInstanceVO', 'tag~=vmConsoleMode::%25']
    })
    if (resp.inventories.length > 0) {
      await rpc.update('system-tags', resp.inventories[0].uuid, {
        updateSystemTag: {
          tag: `vmConsoleMode::${mode}`
        }
      }, progressCb)
    } else {
      await rpc.create('system-tags', {
        resourceType: 'VmInstanceVO',
        resourceUuid: uuid,
        tag: `vmConsoleMode::${mode}`
      }, progressCb)
    }
  },
  async setBootMode (uuid, mode, progressCb) {
    await rpc.update('vm-instances', uuid, {
      setVmBootMode: {
        bootMode: mode
      }
    }, progressCb)
    systemTagsApi.query([`resourceUuid=${uuid}`, 'resourceType=VmInstanceVO', 'tag~=vmMachineType::%25'])
      .then(resp => {
        let tagUuid = (resp.inventories && resp.inventories.length > 0) ? resp.inventories[0].uuid : undefined
        if (mode === 'UEFI' && tagUuid) systemTagsApi.update(tagUuid, 'vmMachineType::q35')
        if (mode === 'UEFI' && !tagUuid) {
          systemTagsApi.create({
            resourceType: 'VmInstanceVO',
            resourceUuid: uuid,
            tag: `vmMachineType::q35`
          })
        }
        if (mode !== 'UEFI' && tagUuid) systemTagsApi._delete(tagUuid)
      })
  },
  addVmToAffinityGroup (uuid, affinityGroupUuid, progressCb) {
    return rpc.create(`affinity-groups/${affinityGroupUuid}/vm-instances/${uuid}`, null, progressCb)
  },
  changeInstanceOffering (uuid, instanceOfferingUuid, progressCb) {
    return rpc.update('vm-instances', uuid, {
      'changeInstanceOffering': {
        'instanceOfferingUuid': instanceOfferingUuid
      }
    }, progressCb)
  },
  startVmFromHost (uuid, hostUuid, progressCb) {
    return rpc.put(`vm-instances/${uuid}/actions`, {
      startVmInstance: {
        hostUuid
      }
    }, progressCb)
  },
  deleteConsolePassword (uuid, progressCb) {
    return rpc._delete(`vm-instances/${uuid}/console-password`, null, progressCb)
  },
  setUsbRedirect (uuid, enable, progressCb) {
    return rpc.put(`vm-instances/${uuid}/actions`, {
      setVmUsbRedirect: {
        enable
      }
    }, progressCb)
  },
  resizeRootVolume (uuid, size, progressCb) {
    return rpc.put(`volumes/resize/${uuid}/actions`, {
      resizeRootVolume: {
        size: size
      }
    }, progressCb)
  },
  removeVmFromAffinityGroup (uuid, affinityGroupUuid, progressCb) {
    return rpc._delete(`affinity-groups/${affinityGroupUuid}/vm-instances`, {
      uuid
    }, progressCb)
  },
  update (uuid, param, progressCb) {
    return rpc.update('vm-instances', uuid, {
      'updateVmInstance': param
    }, progressCb)
  },
  setQga (uuid, enable, progressCb) {
    return rpc.put(`vm-instances/${uuid}/actions`, {
      setVmQga: {
        enable
      }
    }, progressCb)
  },
  setVDIMonitorNumber (uuid, monitorNumber, progressCb) {
    return rpc.put(`vm-instances/${uuid}/actions`, {
      setVmMonitorNumber: {
        monitorNumber
      }
    }, progressCb)
  },
  createTag (uuid, tag, progressCb) {
    return rpc.create('user-tags', {
      resourceType: 'VmInstanceVO',
      resourceUuid: uuid,
      tag
    }, progressCb)
  },
  deleteTag (uuid, progressCb) {
    return rpc._delete(`tags/${uuid}`, null, progressCb)
  },
  start (uuid, progressCb) {
    return rpc.update('vm-instances', uuid, {
      'startVmInstance': {}
    }, progressCb)
  },
  delete (uuid, progressCb) {
    return rpc._delete(`vm-instances/${uuid}`, null, progressCb)
  },
  stop (uuid, stopHA, progressCb) {
    return rpc.update('vm-instances', uuid, {
      'stopVmInstance': {
        stopHA
      }
    }, progressCb)
  },
  recover (uuid, progressCb) {
    return rpc.update('vm-instances', uuid, {
      'recoverVmInstance': {}
    }, progressCb)
  },
  expunge (uuid, progressCb) {
    return rpc.update('vm-instances', uuid, {
      'expungeVmInstance': {}
    }, progressCb)
  },
  liveMigrate (vmUuid, hostUuid, progressCb, jobUuid) {
    return rpc.update('vm-instances', vmUuid, {
      'migrateVm': {
        'hostUuid': hostUuid
      }
    }, progressCb, jobUuid)
  },
  codeMigrate (rootVolumeUuid, hostUuid, progressCb, jobUuid) {
    return rpc.put(`primary-storage/local-storage/volumes/${rootVolumeUuid}/actions`, {
      'localStorageMigrateVolume': {
        'destHostUuid': hostUuid
      }
    }, progressCb, jobUuid)
  }
}
