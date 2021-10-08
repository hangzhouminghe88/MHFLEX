import _ from 'lodash'

export default {
  canAttach (item) {
    if (!item) return false;
    if (item.type === 'Root') return false;
    return (item.isShareable || !item.vmInstanceUuid) &&
             item.state === 'Enabled' &&
             ['Ready', 'NotInstantiated'].indexOf(item.status) !== -1
  },
  canAttachList (uuidList, volumeTable) {
    if (!volumeTable) return false;
    return _.every(uuidList, uuid => this.canAttach(volumeTable[uuid], volumeTable))
  },
  canDetach (volume, vmTable) {
    if (!volume || !vmTable) return false;
    if (volume.type === 'Root') return false;
    let vmUuidList = [];
    if (volume.vmInstanceUuid) {
      vmUuidList = [volume.vmInstanceUuid]
    } else if (volume.vmInstanceUuidList) {
      vmUuidList = volume.vmInstanceUuidList
    }
    if (vmUuidList.length <= 0) return false;
    if (_.some(vmUuidList, uuid => vmTable[uuid].state !== 'Paused')) return true;
    return false
  },
  canDetachList (uuidList, volumeTable, vmTable) {
    if (!volumeTable || !vmTable) return false;
    return _.every(uuidList, uuid => this.canDetach(volumeTable[uuid], vmTable))
  },
  canMigrate (item) {
    if (!item) return false;
    if (item.type === 'Root') return false;
    return item.MigrationInCurrentPrimaryStorage
  },
  canBackupInHybrid (item, psTable, hasImageStore) {
    if (!item || !psTable) return false;
    let ps = psTable[item.primaryStorageUuid];
    if (!ps) return false;
    if (item.status !== 'Ready') return false;
    let allowList = ['NFS',
      'LocalStorage',
      'SharedMountPoint',
      'Ceph',
      'SharedBlock',
      'AliyunNAS'];
    return hasImageStore && allowList.indexOf(ps.type) > -1
  },
  canBackup (item, vmTable) {
    if (!item || !vmTable) return false;
    if (item.status !== 'Ready') return false;
    if (!item.vmInstanceUuid) return false;
    let vmItem = vmTable[item.vmInstanceUuid];
    if (!vmItem || vmItem.state !== 'Running') return false;
    return true
  },
  canCreateShareableVolumeImage: function (volume, psTable, vmTable) {
    if (!volume) return false;
    let ps = psTable[volume.primaryStorageUuid];
    let additionalCon = true;
    if (volume.vmInstanceUuid) {
      if (volume.isShareable) {
        if (ps) {
          if (['SharedBlock'].indexOf(ps.type) > -1) {
            let vmUuids = volume.vmInstanceUuid;
            for (let uuid of vmUuids) {
              let vm = vmTable[uuid];
              if (vm && vm.state === 'Running') {
                additionalCon = false;
                break
              }
            }
          }
        }
      }
    }
    return additionalCon
  },
  canCreateImage (volume, psTable, vmTable) {
    if (!volume || !psTable || !vmTable) return false;
    let ps = psTable[volume.primaryStorageUuid];
    if (!ps) return false;
    let result = volume && volume.status !== 'Deleted' && volume.status !== 'NotInstantiated' && volume.state !== 'Disabled';
    let additionalCon = this.canCreateShareableVolumeImage(volume, ps, vmTable);
    return result && additionalCon
  },
  canCreateSnapshot (volume, vmTable) {
    if (!volume || !vmTable) return false;
    let result = volume && volume.status !== 'Deleted' && volume.status !== 'NotInstantiated';
    let additionalCon = this.canCreateShareableVolumeImage(volume, vmTable);
    return result && additionalCon
  },
  canSetQos (volume) {
    if (!volume) return false;
    // if (item.vmInstanceUuid && vmTable[item.vmInstanceUuid].state === 'Paused') {
    //   return false
    // }
    return !volume.isShareable
  },
  canRemoveQos (volume, vmTable) {
    if (!volume || !vmTable) return false;
    if (volume.vmInstanceUuid && vmTable[volume.vmInstanceUuid] && vmTable[volume.vmInstanceUuid].state === 'Paused') {
      return false
    }
    return volume.volumeBandwidth > 0
  },
  canResize (volume, psTable) {
    if (!volume || !psTable) return false;
    if ((psTable[volume.primaryStorageUuid] &&
         psTable[volume.primaryStorageUuid].type === 'SharedBlock') &&
         volume.isShareable) {
      return false
    }
    return true
  },
  canStorageMigrate (volume, vmTable, psTable) {
    if (!volume || !vmTable || !psTable) return false;
    let ps = psTable[volume.primaryStorageUuid];
    if (!ps) return false;
    if (['Ceph', 'NFS'].indexOf(ps.type) > -1) {
      if (volume.type === 'Data') {
        return true
      }
      let vm = vmTable[volume.vmInstanceUuid];
      if (volume.type === 'Root' && vm && vm.state === 'Stopped') {
        return true
      }
    } else if (ps.type === 'SharedBlock') {
      let vm = vmTable[volume.vmInstanceUuid];
      if (vm) {
        if (vm.state === 'Stopped') {
          return true
        }
      } else {
        return true
      }
    }
    return false
  },
  canDelete (volume, vmTable) {
    if (!volume || !vmTable) return false;
    if (volume.status === 'Deleted') return false;
    if (volume.vmInstanceUuid && vmTable[volume.vmInstanceUuid] && vmTable[volume.vmInstanceUuid].state === 'Paused') {
      return false
    }
    if (volume.type === 'Root') {
      return false
    }
    return true
  },
  canDeleteList (uuidList, volumeTable, vmTable) {
    if (!volumeTable || !vmTable) return false;
    return _.every(uuidList, uuid => this.canDelete(volumeTable[uuid], vmTable))
  },
  canChangeOwner (volume) {
    if (!volume) return false;
    return volume.type !== 'Root'
  },
  canRecover (volume) {
    if (!volume) return false;
    return volume.status === 'Deleted'
  },
  canExpunge (volume) {
    if (!volume) return false;
    return volume.status === 'Deleted'
  }
}



// WEBPACK FOOTER //
// ./src/strategies/volume/strategy.js
