import Utils from 'src/utils/utils';
import { mapGetters } from 'vuex';
import Methods from './Methods';

export default {
  mixins: [Methods],
  computed: {
    ...mapGetters({
      get: 'hybridHuaweiDisk/getList'
    })
  },
  methods: {
    //构造查询条件
    getCondition() {
      let self = this, conditionList = [];
      if(self.selectVal !== '' && self.searchStr !== '') {
        conditionList = conditionList.concat( `${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
      }
      return conditionList;
    },
    //查询列表
    queryList() {
      let self = this;
      self.windowData.loading = true;
      self.dispatchAction('hybridHuaweiDisk/basicQuery', {
        limit: self.windowData.pageSize,
        start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
        sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`,
        q: self.getCondition()
      }).then((resp) => {
        return self.updateWindow({
          uuidList: resp.uuidList,
          table: Utils.createTableObjFromUuidList(resp.uuidList),
          availableCount: resp.total
        }).then(() => {
          self.itemList = self.get(self.windowData.uuidList);
          self.windowData.loading = false;
        })
      }).catch(() => {
        self.windowData.loading = false;
      })
    },
    //绑定云主机
    pageHuaweiAttachEcs(diskUuid) {
      let self = this, uuid = '';
      uuid = diskUuid ? diskUuid : self.selectedList[0];
      self.openDialog('HybridHuaweiEcsInstanceSingleSelect', {
        conditions: [`identityZoneUuid=${self.dbData.hybridHuaweiDisk[self.selectedList[0]].identityZoneUuid}`],
        select: (ecsUuid) => {
          self.attach(ecsUuid, [uuid])
            .then(() => {
              self.queryList()
            })
        }
      })
    },
    //是否可以卸载ecs
    canDetachEcsInstance(){
      let self = this, uuidList = [], isDetach;
      if(!self.isSelected || self.selectedList.length<=0) return false;
      isDetach = self.selectedList.some(uuid=> self.dbData.hybridHuaweiDisk[uuid].ecsInstanceUuid && self.dbData.hybridHuaweiDisk[uuid].diskType.toLocaleLowerCase() === 'data')
      if(self.isSelected && isDetach){
        return true;
      }else{
        return false;
      }
    },
    //解绑ecs
    pageHuaweiDiskDetach() {
      const self = this
      let uuidList = []
      self.selectedList.forEach((uuid) => {
        if (self.dbData.hybridHuaweiDisk[uuid].ecsInstanceUuid && self.dbData.hybridHuaweiDisk[uuid].diskType === 'DATA_DISK') uuidList.push(uuid)
      })
      if (uuidList.length <= 0) return
      self.openDialog('ConfirmDlg', {
        uuidList: uuidList,
        title:'hybridAliyunDisk.detach',
        description: 'hybridAliyunDisk.detachDisk',
        icon: 'volume_popupico',
        getName: (uuid) => {
          return self.dbData.hybridHuaweiDisk[uuid].name;
        },
        ok: () => {
          self.detach(self.selectedList)
            .then(() => {
              self.queryList()
            })
        }
      })
    },
    //是否可删除
    canDeleteDisk () {
      const self = this
      if (!self.isSelected || self.selectedList.length <= 0) return false
      for (let i = self.selectedList.length - 1; i >= 0; i--) {
        if (self.dbData.hybridHuaweiDisk[self.selectedList[i]].diskType.toLocaleLowerCase() !== 'data_disk' || self.dbData.hybridHuaweiDisk[self.selectedList[i]].ecsInstanceUuid) {
          return false
        }
      }
      return true
    },
    //删除云盘
    pageHuaweiDiskDelete() {
      let self = this,
        uuidList = [];
      self.selectedList.some( (uuid) => {
        self.dbData.hybridHuaweiDisk[uuid].diskType === 'DATA_DISK' && !self.dbData.hybridHuaweiDisk[uuid].ecsInstanceUuid ? uuidList.push(uuid) : uuidList = uuidList;
      })
      self.openDialog('ConfirmDlg', {
        title: 'hybridAliyunDisk.delete',
        description: 'hybridAliyunDisk.deleteDisk',
        icon: 'volume_popupico',
        isChecked: true,
        uuidList,
        checkBoxText: self.$t('hybridTencentDisk.warning'),
        getName: (uuid) => {
          return self.dbData.hybridHuaweiDisk[uuid].name;
        },
        ok: (isDeleteOrigin) => {
          return self.delete(uuidList, isDeleteOrigin)
            .then(() => {
              self.queryList();
            });
        }
      })
    }
  }
}
