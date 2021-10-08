import rpc from 'src/utils/rpc';
import Utils from 'src/utils/utils';
import _ from 'lodash'

export default {
  methods: {
    ...Utils,
    delete (uuidList, bsUuid, remote, whole) {
      const self = this
      let event = self.createEvent('backupData.action.delete', uuidList.length === 1 ? self.dbData.backupData[uuidList[0]].name : '', uuidList.length)
      let tasks = []
      let param = null
      if (!remote && bsUuid) {
        param = {
          backupStorageUuids: bsUuid
        }
      }
      uuidList.forEach(uuid => {
        let backupData = this.dbData.backupData[uuid]
        if (!remote && !bsUuid) {
          let bsUuids = backupData.backupStorageRefs.map(bs => bs.backupStorageUuid)
          let remoteBackupStorageUuids = _.keys(this.dbData.remoteBackupStorage)
          let localBackupStorageUuids = _.difference(bsUuids, remoteBackupStorageUuids)
          param = {
            backupStorageUuids: localBackupStorageUuids
          }
        }
        let path = `volume-backups/${uuid}`
        if (this.currTab === 'db') {
          path = `database-backups/${uuid}`
        }
        let groupUuid = backupData.type === 'Root' && backupData.groupUuid
        if (groupUuid && whole) {
          path = `vm-backups/${groupUuid}`
        }
        let p = rpc._delete(path, param, event).then((resp) => {
          self.incEventSuccess(event)
        }, () => {
          self.incEventFail(event)
        })
        tasks.push(p)
      })
      return Promise.all(tasks)
    },

    createVmFromVmBackup (param, backupUuid) {
      const self = this
      let name = self.dbData.backupData[backupUuid].name
      let groupUuid = self.dbData.backupData[backupUuid].groupUuid
      let systemTags = param.systemTags
      if (systemTags && systemTags.length > 0) {
        let index = _.findIndex(systemTags, tag => _.includes(tag, 'primaryStorageUuidForDataVolume'))
        if (index > -1) {
          param.primaryStorageUuidForDataVolume = systemTags[index].split('::')[1]
          systemTags.splice(index, 1)
          if (systemTags.length === 0) {
            delete param.systemTags
          }
        }
      }
      let event = self.createEvent('backupData.action.new', name)
      return rpc.create(`vm-instances/from/vm-backups/${groupUuid}`, param, event).then(resp => {
        self.incEventSuccess(event)
      }, () => {
        self.incEventFail(event)
      })
    },

    newVmByBackup (param, backupUuid) {
      const self = this
      let name = self.dbData.backupData[backupUuid].name
      let backupStorageUuid = self.dbData.backupData[backupUuid].backupStorageRefs[0].backupStorageUuid
      let platform = self.dbData.backupData[backupUuid].metadata.platform
      let event = self.createEvent('backupData.action.new', name)
      return rpc.create(`images/root-volume-templates/from/volume-template/${backupUuid}`, {
        name,
        backupStorageUuid,
        platform
      }, event).then(resp => {
        self.incEventSuccess(event)
        param.imageUuid = resp.inventory.uuid
        return self.createVmInstance(param, 1).then(() => {
          return self.clearImage(resp.inventory)
        }, () => {
          return self.clearImage(resp.inventory)
        })
      }, () => {
        self.incEventFail(event)
      })
    },
    newVolumeByBackup (param, backupUuid) {
      const self = this
      let name = self.dbData.backupData[backupUuid].name
      let backupStorageUuid = self.dbData.backupData[backupUuid].backupStorageRefs[0].backupStorageUuid
      let event = self.createEvent('backupData.action.new', name)
      return rpc.create(`images/data-volume-templates/from/volume-template/${backupUuid}`, {
        name,
        backupStorageUuid
      }, event).then(resp => {
        self.incEventSuccess(event)
        param.volumeImageUuid = resp.inventory.uuid
        return self.createVolume(param).then(() => {
          return self.clearImage(resp.inventory)
        }, () => {
          return self.clearImage(resp.inventory)
        })
      }, () => {
        self.incEventFail(event)
      })
    },

    overlap (uuid, whole) {
      const self = this
      let backupData = self.dbData.backupData[uuid]
      let event = self.createEvent('backupData.action.overlap', backupData.name)
      let bsUuid = backupData.backupStorageRefs[0].backupStrogeUuid
      let groupUuid = backupData.type === 'Root' && backupData.groupUuid
      let bsTable = {
        'backupStrogeUuid': bsUuid
      }
      let path = `volume-backups`
      let apiName = 'revertVolumeFromVolumeBackup'
      if (groupUuid && whole) {
        path = `vm-backups`
        uuid = groupUuid
        apiName = 'revertVmFromVmBackup'
      }
      let param = {}
      param[apiName] = bsTable
      return rpc.update(path, uuid, param, event).then(resp => {
        self.incEventSuccess(event)
      }, () => {
        self.incEventFail(event)
      })
    },

    isRemoteSynced (uuid) {
      let backupData = this.dbData.backupData[uuid]
      if (!backupData) return false
      let bsUuids = backupData.backupStorageRefs.map(bs => bs.backupStorageUuid)
      let remoteBackupStorageUuids = _.keys(this.dbData.remoteBackupStorage)
      return bsUuids.some(uuid => _.includes(remoteBackupStorageUuids, uuid))
    },

    query (uuid) {
      let zoneUuid = window.localStorage.getItem('currZoneUuid')
      let script = `
query volumebackup where uuid='${uuid}' named as 'backupData';
query backupstorage where type='ImageStoreBackupStorage' and zone.uuid='${zoneUuid}' and __systemTag__ in ('onlybackup', 'allowbackup') named as 'localBackupStorage';
query backupstorage where type='ImageStoreBackupStorage' and __systemTag__ in ('aliyun', 'remotebackup') named as 'remoteBackupStorage';
query backupstorage where type='ImageStoreBackupStorage' named as 'backupstorage';
      `
      return rpc.query('zql', {
        zql: encodeURIComponent(script)
      }).then(resp => {
        let results = resp.results
        let volumeBackup = results[0].inventories[0]
        volumeBackup.metadata = JSON.parse(volumeBackup.metadata)
        let data = volumeBackup.metadata
        let l3networkUuids = data.vmNics.map(it => `'${it.l3NetworkUuid}'`)
        let queryOther = `
query instanceoffering where uuid='${data.instanceOfferingUuid}' named as 'instanceOffering';
query vminstance where uuid='${data.vmInstanceUuid}' named as 'vm';
query l3network where uuid in (${l3networkUuids.join(',')}) named as 'l3network';
        `
        if (data.dataVolumeUuids && data.dataVolumeUuids.length > 0) {
          let volumeUuids = data.dataVolumeUuids.map(it => `'${it}'`)
          queryOther += `
query volume where uuid in (${volumeUuids.join(',')}) named as 'volume';
          `
        }
        if (this.dbData.common.isAdmin) {
          queryOther += `
query primarystorage where uuid='${data.primaryStorageUuid}' named as 'primarystorage';
query cluster where uuid='${data.clusterUuid}' named as 'cluster';
          `
        }
        return rpc.query('zql', {
          zql: encodeURIComponent(queryOther)
        }).then(otherResp => {
          results = results.concat(otherResp.results)
          return this.updateDbTableWithZql(results, this)
        })
      })
    },

    getBackupStorageName (backupUuid) {
      let backupData = this.dbData.backupData[backupUuid]
      if (!backupData) return ''
      let bsUuids = backupData.backupStorageRefs.map(bs => bs.backupStorageUuid)
      let remoteBackupStorageUuids = _.keys(this.dbData.remoteBackupStorage)
      let localBackupStorageUuids = _.keys(this.dbData.localBackupStorage)
      let tempLocalBsUuids = _.difference(bsUuids, remoteBackupStorageUuids)
      let result = ''
      if (tempLocalBsUuids.length > 0) {
        for (let i = tempLocalBsUuids.length - 1; i >= 0; i--) {
          if (_.includes(localBackupStorageUuids, tempLocalBsUuids[i])) {
            result = this.dbData.backupstorage[tempLocalBsUuids[i]].name
            break
          }
        }
      } else {
        let remoteBackupStorage = this.dbData.backupstorage[remoteBackupStorageUuids[0]]
        if (remoteBackupStorage) result = remoteBackupStorage.name
      }
      return result
    },

  }
}
