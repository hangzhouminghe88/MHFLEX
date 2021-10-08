import rpc from 'src/utils/rpc';
import Methods from './Methods';

export default {
  mixins: [Methods],

  methods: {
    getCondition() {
      let self = this, conditionList = [];
      if(self.selectVal !== '' && self.searchStr !== '') {
        conditionList.concat(`${self.selectVal}~=%25${self.searchStr}%25`);
      }
      return conditionList;
    },

    async queryList() {
      let self = this;
      self.itemList = [], self.windowData.loading = true;
      let resp = await rpc.query('hybrid/aliyun/vswitch', {
        count: false,
        start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
        limit: self.windowData.pageSize,
        replyWithCount: true,
        q: this.getCondition(),
        sort: `${this.windowData.sortDirection}${self.windowData.sortBy}`
      })
      self.updateWindow({
        pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / self.windowData.pageSize),
        availableCount: resp.total
      })
      let uuidList = resp.inventories.map((item) => item.uuid)
      self.updateWindow({ uuidList })
      self.updateDbTable({
        tableName: 'hybridVSwitch',
        list: resp.inventories
      });
      self.itemList = resp.inventories;
      self.windowData.loading = false;
    },

    pageDelete() {
      const self = this
      if (!self.isSelected || self.selectedList.length <= 0) return
      let selectedUuidList = self.selectedList
      self.openDialog('ConfirmDlg', {
        title: 'hybridvswitch.deleteVSwitch',
        description: 'hybridvswitch.delete',
        icon: 'vswitch_popupico',
        uuidList: selectedUuidList,
        warning: 'hybridvswitch.info.deleteWarning',
        isChecked: true,
        checkBoxText: 'hybrid.deleteOrigin',
        getName: (uuid) => {
          return self.dbData.hybridVSwitch[uuid].name;
        },
        ok: (deleteOrigin) => {
          self.delete(selectedUuidList, deleteOrigin, self.queryList)
        }
      })
    }
  }
}
