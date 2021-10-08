import _ from 'lodash'

export default {
  canStart (vm) {
    return vm.state === 'Stopped'
  },
  canStartList (uuidList, vmTable) {
    // don't require all vms can be started
    return _.some(uuidList, uuid => this.canStart(vmTable[uuid]))
  },
  canStop (vm) {
    return _.includes(['Running', 'Paused'], vm.state)
  },
  canStopList (uuidList, vmTable) {
    // don't require all vms can be stopped
    return _.some(uuidList, uuid => this.canStop(vmTable[uuid]))
  },
  canReboot (vm) {
    return vm.state === 'Running'
  },
  canRebootList (uuidList, vmTable) {
    if (!vmTable) return false
    return _.every(uuidList, uuid => this.canReboot(vmTable[uuid]))
  },
  canPause (vm) {
    return vm.state === 'Running'
  },
  canPauseList (uuidList, vmTable) {
    if (!vmTable) return false
    return _.every(uuidList, uuid => this.canPause(vmTable[uuid]))
  },
  canResume (vm) {
    return vm.state === 'Paused'
  },
  canResumeListStrict (uuidList, vmTable) {
    if (!vmTable) return false
    return _.every(uuidList, uuid => this.canResume(vmTable[uuid]))
  },
  canResumeListLoose (uuidList, vmTable) {
    if (!vmTable) return false
    return _.some(uuidList, uuid => this.canResume(vmTable[uuid]))
  },
  canForceStop (vm) {
    return _.includes(['Running', 'Paused'], vm.state)
  },
  canForceStopList (uuidList, vmTable) {
    if (!vmTable) return false
    return _.every(uuidList, uuid => this.canForceStop(vmTable[uuid]))
  },
  canOpenConsole (vm) {
    // vm's state not to be Resuming when in haProgress, ths resuming state is add by UI
    return vm.state === 'Running' && !vm.haProgress
  },
  getPrimaryStorageType (vm, psTable, isAdmin) {
    if (!isAdmin) return ''
    let rootVolume = _.find(vm.allVolumes, volume => volume.uuid === vm.rootVolumeUuid)
    return rootVolume && _.get(psTable, `${rootVolume.primaryStorageUuid}.type`)
  },
  canMigrate (vm, psTable, globalLiveMigrate) {
    if (!psTable || !vm) return false
    const { state, allVolumes, platform } = vm
    let rootVolume = allVolumes.find(it => it.type === 'Root')
    let rootVolumePsType = rootVolume && _.get(psTable, `${rootVolume.primaryStorageUuid}.type`)// billing page
    // Created by WeiQi on 12/03/18.
    // http://gitlab.zstack.io/zstackio/zstack-ui-doc/blob/master/%E4%BA%91%E4%B8%BB%E6%9C%BA/%E8%BF%81%E7%A7%BB.md
    const actions = new Map([
      ['LocalStorage', () => { return state === 'Stopped' || (_.includes(['Running', 'Paused'], state) && globalLiveMigrate && !_.includes(['Windows', 'WindowsVirtio'], platform)) }],
      ['Ceph', () => { return _.includes(['Running', 'Paused'], state) }],
      ['NFS', () => { return _.includes(['Running', 'Paused'], state) }],
      ['AliyunNAS', () => { return _.includes(['Running', 'Paused'], state) }],
      ['SharedMountPoint', () => { return _.includes(['Running', 'Paused'], state) }],
      ['SharedBlock', () => { return _.includes(['Running', 'Paused'], state) }]
    ])
    return actions.has(rootVolumePsType) && actions.get(rootVolumePsType).call(this)
    // enable it to warning user
    // let rootVolume = vm.allVolumes.find(it => it.type === 'Root')
    // if (rootVolume) {
    //   let psType = psTable[rootVolume.primaryStorageUuid].type
    //   if (psType === 'AliyunEBS' && vm.state === 'Running') return false
    //   if (psType === 'LocalStorage') {
    //     if (globalLiveMigrate === false) {
    //       if (vm.state === 'Stopped') {
    //         return true
    //       } else {
    //         return false
    //       }
    //     } else {
    //       if (vm.state === 'Stopped') {
    //         return true
    //       } else {
    //         if (_.includes(['Windows', 'WindowsVirtio'], vm.platform)) {
    //           return false
    //         } else {
    //           return true
    //         }
    //       }
    //       // return true
    //     }
    //   } else {
    //     if (vm.state === 'Running') {
    //       return true
    //     } else {
    //       return false
    //       // return this.canLiveMigrate()
    //       // if (vm.isoList && vm.isoList.length > 0) return true
    //       // let dataVolumeList = vm.allVolumes.find(it => it.type === 'Data')
    //       // if (dataVolumeList && dataVolumeList.length > 0) return true
    //       // if (vm.pciDeviceUuidList && vm.pciDeviceUuidList.length > 0) return true
    //       // if (vm.usbDeviceUuidList && vm.usbDeviceUuidList.length > 0) return true
    //     }
    //   }
    // }
  },
  canLiveMigrate (vm, psTable) {
    if (!vm.capabilities) return false
    return vm.capabilities.LiveMigration
  },
  canCreateSnapshot (vm) {
    return _.includes(['Running', 'Stopped'], vm.state)
  },
  canClone (vm, bsListInCurrentZone) {
    if (!vm || !bsListInCurrentZone) return false
    if (!_.isArray(bsListInCurrentZone)) return false

    if (!_.includes(['Running', 'Stopped', 'Paused'], vm.state)) return false
    if (_.some(bsListInCurrentZone, bs => bs.type === 'ImageStoreBackupStorage')) return true
    if (_.some(bsListInCurrentZone, bs => bs.type === 'AliyunEBS')) return true
    if (_.some(bsListInCurrentZone, bs => bs.type === 'Ceph')) return true
    return false
  },
  canCreateImage (vm, bsListInCurrentZone) {
    if (!vm || !bsListInCurrentZone) return false
    if (!_.isArray(bsListInCurrentZone)) return false

    if (vm.state === 'Stopped' && bsListInCurrentZone.length > 0) return true
    if (vm.state === 'Running') {
      if (_.some(bsListInCurrentZone, bs => bs.type === 'ImageStoreBackupStorage')) return true
      if (_.some(bsListInCurrentZone, bs => bs.type === 'AliyunEBS')) return true
      if (_.some(bsListInCurrentZone, bs => bs.type === 'Ceph')) return true
    }
    return false
  },
  canAttachVolume (vm) {
    return _.includes(['Running', 'Stopped'], vm.state)
  },
  canAttachIso (vm) {
    if (!_.includes(['Running', 'Stopped'], vm.state)) return false
    let { isoUuids, cdromLimit } = vm
    return _.isArray(isoUuids) && isoUuids.length < cdromLimit
  },
  canDetachIso (vm) {
    if (!_.includes(['Running', 'Stopped'], vm.state)) return false
    let { isoUuids } = vm
    return _.isArray(isoUuids) && isoUuids.length > 0
  },
  canSetSshKey (vm) {
    if (!_.includes(['Running', 'Stopped'], vm.state)) return false
    if (vm.sshkey) return false
    return true
  },
  canDeleteSshKey (vm) {
    if (!_.includes(['Running', 'Stopped'], vm.state)) return false
    if (!vm.sshkey) return false
    return true
  },
  canDeleteSshKeyList (uuidList, vmTable) {
    if (!vmTable) return false
    return _.every(uuidList, uuid => this.canDeleteSshKey(vmTable[uuid]))
  },
  canDetachVolume (vm) {
    if (!_.includes(['Running', 'Stopped'], vm.state)) return false
    let shareableVolumeCount = 0
    if (vm.shareableVolumeUuidList) {
      shareableVolumeCount = vm.shareableVolumeUuidList.length
    }
    if ((vm.allVolumes.length + shareableVolumeCount) <= 1) return false
    return true
  },
  canSetHa (vm, haEnabled) {
    return haEnabled && _.includes(['Running', 'Stopped'], vm.state)
  },
  canSetHaList (uuidList, vmTable, haEnabled) {
    if (!vmTable) return false
    return _.every(uuidList, uuid => this.canSetHa(vmTable[uuid], haEnabled))
  },
  canSetBootOrder (vm) {
    if (!_.includes(['Running', 'Stopped'], vm.state)) return false
    if (!vm.isoUuids || vm.isoUuids.length === 0) return false
    return true
  },
  canSetConsolePassword (vm) {
    if (!_.includes(['Running', 'Stopped'], vm.state)) return false
    if (vm.consolePassword) return false
    return true
  },
  canJoinAffinityGroup (vm) {
    if (!_.includes(['Running', 'Stopped'], vm.state)) return false
    if (vm.affinityGroupUuid) return false
    return true
  },
  canReimage (vm, psTable, isAdmin) {
    if (vm.state !== 'Stopped') return false
    if (this.getPrimaryStorageType(vm, psTable, isAdmin) === 'AliyunEBS') return false
    if (vm.capabilities) {
      return vm.capabilities.Reimage
    }
    return true
  },
  canSetVmPassword (vm) {
    if (vm.state !== 'Running') return false
    if (!vm.qemuga) return false
    return true
  },
  canChangeVmImage (vm) {
    if (vm.state !== 'Stopped') return false
    return true
  },
  canChangeConfig (vm, isNumaEnabled) {
    const actions = new Map([
      ['Running', () => { return isNumaEnabled }],
      ['Paused', () => { return isNumaEnabled }],
      ['Stopped', () => { return true }]
    ])
    return actions.has(vm.state) && actions.get(vm.state).call(this)
  },
  canChangeConfigListStrict (uuidList, vmTable, isNumaEnabled) {
    if (!vmTable) return false
    return _.every(uuidList, uuid => this.canChangeConfig(vmTable[uuid], isNumaEnabled))
  },
  canChangeConfigListLoose (uuidList, vmTable, isNumaEnabled) {
    if (!vmTable) return false
    return _.some(uuidList, uuid => this.canChangeConfig(vmTable[uuid], isNumaEnabled))
  },
  canStartFromHost (vm, psTable, isAdmin) {
    if (vm.state !== 'Stopped') return false
    if (this.getPrimaryStorageType(vm, psTable, isAdmin) === 'LocalStorage') return false
    // if (!this.canLiveMigrate(vm, psTable, isAdmin)) return false
    // if (vm.capabilities && !vm.capabilities.LiveMigration) return false
    return true
  },
  canDeleteVmConsolePassword (vm) {
    if (!_.includes(['Running', 'Stopped'], vm.state)) return false
    if (!vm.consolePassword) return false
    return true
  },
  canChangeResourceOwner (vm) {
    return _.includes(['Running', 'Stopped'], vm.state)
  },
  canChangeResourceOwnerList (uuidList, vmTable) {
    if (!vmTable) return false
    return _.every(uuidList, uuid => this.canChangeResourceOwner(vmTable[uuid]))
  },
  canResizeRootVolume (vm) {
    if(vm.allVolumes){
      let rootVolume = vm.allVolumes.find(it => it.type === 'Root')
      if (!rootVolume) return false
      if (!rootVolume.installPath) return false
      return !_.startsWith(rootVolume.installPath, 'fusionstor:')
    }
  },
  canStorageMigrate (vm, psTable, isAdmin) {
    if (vm.state !== 'Stopped') return false
    return _.includes(['Ceph', 'NFS', 'SharedBlock'], this.getPrimaryStorageType(vm, psTable, isAdmin))
  },
  canLeaveAffinityGroup (vm) {
    if (!vm.affinityGroupUuid) return false
    return _.includes(['Stopped', 'Running'], vm.state)
  }
}
