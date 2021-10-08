import Utils from 'src/utils/utils';
import { mapGetters } from "vuex";
import Methods from './Methods';

export default {
  mixins: [Methods],

  computed: {
    ...mapGetters( {
      get: 'hybridTencentDisk/getList'
    }),
  },
  methods: {
    getCondition() {
      let self = this, conditionList = [];
      if(self.selectVal !== '' && self.searchStr !== '') {
        conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
      }
      return conditionList;
    },
    //查询磁盘
    queryList() {
      let self = this;
      self.windowData.loading = true;
      return self.dispatchAction('hybridTencentDisk/basicQuery', {
        start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
        limit: self.windowData.pageSize,
        sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`,
        q: self.getCondition()
      }).then( (resp) => {
        this.updateWindow({
          uuidList: resp.uuidList,
          table: Utils.createTableObjFromUuidList(resp.uuidList),
          availableCount: resp.total
        }).then( () => {
          self.itemList =  self.get(self.windowData.uuidList)
					setTimeout(() => {
						self.itemList =  self.get(self.windowData.uuidList)
					}, 500);
          self.windowData.loading = false;
        })
      }).catch(() => {
        self.windowData.loading = false;
      })
    },
    //是否可以删除
    canDeleteDisk () {
      let self = this;
      if(!self.isSelected) return false;
      let canDelete = self.selectedList.some( (uuid) => {
        return self.dbData.hybridTencentDisk[uuid].diskType === 'DATA_DISK' && !self.dbData.hybridTencentDisk[uuid].ecsInstanceUuid
      })
      return canDelete;
    },
    //删除云盘
    pageTencentDelete() {
      let self = this,
        uuidList = [];
       self.selectedList.some( (uuid) => {
         self.dbData.hybridTencentDisk[uuid].diskType === 'DATA_DISK' && !self.dbData.hybridTencentDisk[uuid].ecsInstanceUuid ? uuidList.push(uuid) : uuidList = uuidList;
      })
      self.openDialog('ConfirmDlg', {
        title: 'hybridAliyunDisk.delete',
        description: 'hybridAliyunDisk.deleteDisk',
        icon: 'volume_popupico',
        isChecked: true,
        uuidList,
        checkBoxText: '同时删除腾讯云上资源',
        getName: (uuid) => {
           return self.dbData.hybridTencentDisk[uuid].name;
        },
        ok: (isDeleteOrigin) => {
          return self.delete(uuidList, isDeleteOrigin)
            .then(() => {
              self.queryList();
            });
        }
      })
    },
    //绑定云主机
    pageTencentAttach(diskUuid) {
      let self = this, uuid = '';
      uuid = diskUuid ? diskUuid : self.selectedList[0];
      self.openDialog('HybridTencentEcsInstanceSingleSelect', {
        conditions: [],
        select: (ecsUuid) => {
          self.attach(ecsUuid, [uuid])
            .then(() => {
              self.queryList()
            })
        }
      })
    },
    //是否可以加载云主机
    canDetachEcsInstance() {
      let self = this;
      if(!self.isSingleSelected) return false;
      if(self.dbData.hybridTencentDisk[self.selectedList[0]].ecsInstanceUuid) {
        return false;
      }
      return true;
    },
    //解绑云主机
    pageTencentDetach() {
      const self = this
      let uuidList = []
      self.selectedList.forEach((uuid) => {
        if (self.dbData.hybridTencentDisk[uuid].ecsInstanceUuid && self.dbData.hybridTencentDisk[uuid].diskType === 'DATA_DISK') uuidList.push(uuid)
      })
      if (uuidList.length <= 0) return
      self.openDialog('ConfirmDlg', {
        uuidList: uuidList,
        title:'hybridAliyunDisk.detach',
        description: 'hybridAliyunDisk.detachDisk',
        icon: 'volume_popupico',
        getName: (uuid) => {
          return self.dbData.hybridTencentDisk[uuid].name;
        },
        ok: () => {
          self.detach(self.selectedList)
            .then(() => {
              self.queryList()
            })
        }
      })
    }
  }
}
