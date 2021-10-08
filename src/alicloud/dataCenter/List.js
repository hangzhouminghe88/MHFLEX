import rpc from 'src/utils/rpc';
import Methods from './Methods';

export default {
  mixins: [Methods],

  methods: {
    getCondition () {
      let self = this, conditionList = [];
      if (self.selectVal !== '' && self.searchStr !== '') {
        conditionList.push(`${self.selectVal}~=%25${self.searchStr}%25`)
      }
      return conditionList;
    },

    async queryList () {
      let self = this;
      let resp = await rpc.query('hybrid/data-center', {
        start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
        limit: self.windowData.pageSize,
        q: self.getCondition(),
        sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`,
        replyWithCount: true
      })
      self.itemList = resp.inventories;
      self.updateWindow({
        availableCount: resp.total
      })
      self.updateDbTable({
        tableName: 'hybridDataCenter',
        list: resp.inventories
      })
    },

    pageDelete () {
      let self = this, uuidList = [];
      if(!self.isSelected) return;
      uuidList = self.selectedList;
      self.openDialog('ConfirmDlg', {
        title: 'hybriddatacenter.Deletedatacenter',
        description:  'hybriddatacenter.delete',
        uuidList,
        icon: 'zone_popupico',
        ok: () => {
          self.delete(uuidList, self.queryList)
        },
        getName: (uuid) => {
          return self.dbData.hybridDataCenter[uuid].regionName;
        }
      })
    }
  }
}
