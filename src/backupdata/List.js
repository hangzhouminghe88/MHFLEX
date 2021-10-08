import WindowBase from 'src/windows/Window';
import rpc from 'src/utils/rpc';
import Methods from './Methods';
import _ from 'lodash'

export default {
  mixins: [WindowBase, Methods],

  methods: {
    queryList() {
      let zoneUuid = window.localStorage.getItem('currZoneUuid')
      let conditions = this.translateConditions(this.getCondition())
      let data = this.windowData
      let script = `
query volumebackup where status='Ready' and ${conditions} and backupStorage.__systemTag__ in ('onlybackup', 'allowbackup') return with (total) order by createDate desc limit ${data.pageSize} offset ${(data.pageIndex - 1) * data.pageSize} named as 'backupData';
query backupstorage where type='ImageStoreBackupStorage' and zone.uuid='${zoneUuid}' and __systemTag__ in ('onlybackup', 'allowbackup') named as 'localBackupStorage';
query backupstorage where type='ImageStoreBackupStorage' and __systemTag__ in ('aliyun', 'remotebackup') named as 'remoteBackupStorage';
query backupstorage where type='ImageStoreBackupStorage' named as 'backupstorage';
`
      return rpc.query('zql', {
        zql: encodeURIComponent(script)
      }).then(resp => {
        let result = resp.results
        let backupDataList = result[0].inventories
        if (backupDataList.length === 0) return this.updateWindow({table: {}, uuidList: []})
        backupDataList.forEach(data => {
          data.metadata = JSON.parse(data.metadata)
        })
        let uuidList = backupDataList.map(it => it.uuid)
        let table = {}
        uuidList.forEach(uuid => {
          table[uuid] = {
            selected: false
          }
        })
        return this.updateDbTableWithZql(result, this).then(() => {
          return this.updateWindow({
            table,
            pageCount: result[0].total === 0 ? 1 : Math.ceil(result[0].total / data.pageSize),
            uuidList,
            total: result[0].total
          })
        })
      })
    },

    canSync() {
      if (!this.isSelected) return false
      let remoteBackupStorageUuids = _.keys(this.dbData.remoteBackupStorage)
      if (remoteBackupStorageUuids.length === 0) return false
      let attachedZoneUuids = this.dbData.remoteBackupStorage[remoteBackupStorageUuids[0]].attachedZoneUuids
      let zoneUuid = window.localStorage.getItem('currZoneUuid')
      if (!_.includes(attachedZoneUuids, zoneUuid)) return false
      let uuidList = this.selectedList.filter(uuid => !this.isRemoteSynced(uuid))
      return uuidList.length > 0
    },
  }
}
