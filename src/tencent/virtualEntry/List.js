import Utils from "../../utils/utils";
import { mapGetters } from 'vuex';
import Methods from './Methods';

export default {
  mixins: [Methods],

  computed: {
    ...mapGetters({
      get: 'hybridTencentVirtualRouterEntry/getList'
    })
  },

  methods: {
    getCondition(){
      let conditionList = [], self = this;
      if(self.selectVal !== '' && self.searchStr !== '') {
        conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
      }
      return conditionList;
    },

    //查询云路由器
    queryList() {
      let self = this;
      self.windowData.loading = true;
      return self.dispatchAction('hybridTencentVirtualRouterEntry/basicQuery', {
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

    pageDelete() {
      let self = this, uuidList = [];
      if(!self.isSelected) return;
      uuidList = self.selectedList;
      self.openDialog('ConfirmDlg', {
        uuidList,
        title: 'hybridvirtualrouterentry.deleteVirtualRouterEntry',
        description: 'vRouterRouteEntry.deleteEntry',
        icon: 'image_popupico',
        warning: 'hybridvirtualrouterentry.deleteWarning',
        getName: (uuid) => {
          return  self.dbData.hybridTencentVirtualRouterEntry[uuid].destinationCidrBlock
        },
        ok: () => {
          self.delete(uuidList).then(() => self.queryList())
        }
      })
    },

    canBatchDeleteEntry() {
      let self  = this;
      if(!self.selected && self.selectedList.length <=0) return false;
      let canBatch = self.selectedList.every((uuid) => self.dbData.hybridTencentVirtualRouterEntry[uuid].type === 'System');
      return !canBatch;
    }
  }
}

