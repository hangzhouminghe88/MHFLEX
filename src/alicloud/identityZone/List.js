import rpc from 'src/utils/rpc';
import Methods from './Methods';

export default {
  name: 'HybridAliCloudIdentityZoneList',
  mixins: [Methods],

  methods: {
    getCondition() {
      let self = this, conditionList = [];
      if (self.selectVal !== '' && self.searchStr !== '') {
        conditionList.push(`${self.selectVal}~=%25${self.searchStr}%25`);
      }
      return conditionList;
    },

    queryList() {
      let self = this;
      return rpc.query(`hybrid/identity-zone`, {
        start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
        limit: self.windowData.pageSize,
        replyWithCount: true,
        sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`,
        q: self.getCondition()
      }).then((resp) => {
        self.updateWindow({
          availableCount: resp.total
        });
        self.itemList = resp.inventories;
        self.updateDbTable({
          tableName: 'hybridIdentityZone',
          list: resp.inventories
        });
      })
    },

    pageDelete() {
      ;
      let self = this, uuidList = [];
      if (!self.isSelected) return;
      uuidList = self.selectedList;
      self.openDialog('ConfirmDlg', {
        title: 'hybrididentityzone.Deleteidentityzone',
        description: 'hybrididentityzone.delete',
        icon: 'izone_popupico',
        uuidList,
        getName: (uuid) => {
          return self.dbData.hybridIdentityZone[uuid].zoneName;
        },
        ok: () => {
          self.delete(uuidList, self.queryList);
        }
      })
    }
  }
}
