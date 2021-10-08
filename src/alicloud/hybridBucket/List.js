import rpc from 'src/utils/rpc';
import Methods from './Methods';
import _ from 'lodash'

export default {
  mixins: [Methods],

  methods: {
    getCondition: function () {
      let conditionList = []
      if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
        conditionList = conditionList.concat(this.windowData.searchConditionList)
      }
      return conditionList
    },
    queryList: async function () {
      this.windowData.loading = true;
      let resp = await rpc.query('hybrid/aliyun/oss-bucket', {
        count: false,
        start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
        limit: this.windowData.pageSize,
        replyWithCount: true,
        q: this.getCondition(),
        sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
      })
      this.updateWindow({
        pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
        availableCount: resp.total
      })
      let uuidList = resp.inventories.map((item) => item.uuid)
      let regionName = resp.inventories.map((item) => item.regionName)
      let table = {}
      uuidList.map((uuid) => {
        table[uuid] = {
          selected: false
        }
      })

      let tasks = []
      resp.inventories.forEach(function (item) {
        ((item) => {
          let p = rpc.query('hybrid/data-center', {
            q: `uuid=${item.dataCenterUuid}`,
            fields: 'regionId'
          }).then((resp) => {
            let obj = {}
            if (resp.inventories.length > 0) obj.regionId = resp.inventories[0].regionId
            else obj.regionId = ''
            item = _.assign(item, obj)
          })
          tasks.push(p)
        })(item)
      })
      this.windowData.loading = false;
      Promise.all(tasks).then(() => {
        this.updateWindow({ uuidList, table, regionName })
        this.updateDbTable({
          tableName: 'hybridBucket',
          list: resp.inventories
        }).then( () => {
          this.itemList = this.getData();
        })
      })
    },

    getData() {
      let self = this;
      return self.windowData.uuidList.map((uuid) => {
        return self.dbData.hybridBucket[uuid]
      })
    },
    //设置默认
    pageAttach () {
      const self = this
      if (!self.isSelected || self.selectedList.length <= 0) return
      self.attach(self.selectedList, self.queryList)
    },
    //取消默认
    pageDetach () {
      const self = this
      if (!self.isSelected || self.selectedList.length <= 0) return
      self.detach(self.selectedList, self.queryList)
    },

    //是否设置默认
    isDefault() {
      let self = this;
      if(!self.isSingleSelected) return false;
      return self.dbData.hybridBucket[self.selectedList[0]].current === true;
    },

    pageDelete() {
      let self = this;
      if (!self.isSelected || self.selectedList.length <= 0) return
      let selectedUuidList = self.selectedList
      self.openDialog('ConfirmDlg', {
        title: 'hybridbucket.DeleteBucket',
        description: 'hybridbucket.delete',
        icon: 'bucket_popupico',
        uuidList: selectedUuidList,
        isChecked: true,
        checkBoxText: 'hybrid.deleteOrigin',
        ok: (deleteOrigin) => {
          self.delete(selectedUuidList, deleteOrigin, self.queryList)
        },
        getName: (uuid) => {
          return self.dbData.hybridBucket[uuid].name;
        }
      })
    }
  }
}
