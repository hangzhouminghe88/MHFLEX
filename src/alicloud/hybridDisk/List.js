import Utils from "../../utils/utils";
import {mapGetters} from "vuex";
import Methods from './Methods';

export default {
  mixins: [Methods],

  computed: {
    ...mapGetters({
      get: `hybridAliCloudDisk/getList`
    })
  },

  methods: {
    getCondition: function () {
      let conditionList = []
      conditionList.push('diskType=data')
      if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
        conditionList = conditionList.concat(this.windowData.searchConditionList)
      }
      return conditionList
    },
    //查询云盘
    queryList() {
      let self = this;
      self.windowData.loading = true;
      self.itemList = [];
      return self.dispatchAction('hybridAliCloudDisk/basicQuery', {
        start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
        limit: self.windowData.pageSize,
        q: self.getCondition(),
        sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
      }).then(resp => {
        self.windowData.loading = false;
        return self.updateWindow({
          uuidList: resp.uuidList,
          table: Utils.createTableObjFromUuidList(resp.uuidList),
          total: resp.total
        }).then(() => {
          self.itemList = self.get(self.windowData.uuidList);
        })
      }).catch((e) => {
        self.windowData.loading = false;
      })
    },

    //是否可以加载云主机
    canDetachEcsInstance() {
      let self = this;
      if(!self.isSingleSelected) return false;
      if(self.dbData.hybridAliyunDisk[self.selectedList[0]].ecsInstanceUuid) {
        return false;
      }
      return true;
    },

    pageAttach() {
      let self = this, uuid = '';
      uuid = self.selectedList[0];
      self.openDialog('HybridAliCloudEcsSingleSelect', {
        conditions: [],
        select: (ecsUuid) => {
          self.attach(ecsUuid, [uuid])
            .then(() => {
              self.queryList()
            })
        }
      })
    },

    pageDetach() {
      const self = this
      let uuidList = []
      self.selectedList.forEach((uuid) => {
        if (self.dbData.hybridAliyunDisk[uuid].ecsInstanceUuid && self.dbData.hybridAliyunDisk[uuid].diskType === 'data') uuidList.push(uuid)
      })
      if (uuidList.length <= 0) return
      self.openDialog('ConfirmDlg', {
        uuidList: uuidList,
        title:'hybridAliyunDisk.detach',
        description: 'hybridAliyunDisk.detachDisk',
        icon: 'volume_popupico',
        getName: (uuid) => {
          return self.dbData.hybridAliyunDisk[uuid].name;
        },
        ok: () => {
          self.detach(self.selectedList)
            .then(() => {
              self.queryList()
            })
        }
      })
    },

    pageDelete() {
      let self = this,  uuidList = [];
      uuidList = self.selectedList;
      self.openDialog('ConfirmDlg', {
        uuidList: uuidList,
        title:'hybridAliyunDisk.delete',
        description: 'hybridAliyunDisk.deleteDisk',
        icon: 'volume_popupico',
        isChecked: true,
        checkBoxText: 'hybrid.deleteOrigin',
        getName: (uuid) => {
          return self.dbData.hybridAliyunDisk[uuid].name;
        },
        ok: (isDeleteOrigin) => {
          self.delete(isDeleteOrigin, self.selectedList)
            .then(() => {
              self.queryList()
            })
        }
      })
    },

    canDetach() {
      let self = this, uuidList = [];
      self.selectedList.forEach((uuid) => {
        if (self.dbData.hybridAliyunDisk[uuid].ecsInstanceUuid && self.dbData.hybridAliyunDisk[uuid].diskType === 'data') uuidList.push(uuid)
      })
      if(uuidList.length >0) return true;
      return false;
    }
  }
}
