import Methods from 'src/tencent/dataCenter/Methods';
import { mapGetters, mapState } from "vuex";
import Utils from 'src/utils/utils';

export default {
  mixins: [Methods],

  computed: {
    ...mapGetters({
      get: 'hybridTencentDataCenter/getList'
    }),
    ...mapState({
      dataCenter: state => state.hybridTencentDataCenter
    })
  },

  methods: {
    getCondition() {
      let self = this, conditionList = [];
      if(self.selectVal !== '' && self.searchStr !== '') {
        conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
      }
      return conditionList;
    },

    queryList() {
      let self = this;
      self.windowData.loading = true;
      return self.dispatchAction('hybridTencentDataCenter/basicQuery', {
        start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
        limit: self.windowData.pageSize,
        q: self.getCondition(),
        sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`
      }).then((resp) => {
        self.updateWindow({
          uuidList: resp.uuidList,
          table: Utils.createTableObjFromUuidList(resp.uuidList),
          list: resp.inventories,
          availableCount: resp.total
        }).then( () => {
          self.itemList = self.get(self.windowData.uuidList);
          self.windowData.loading = false;
        })
      })
    },

    pageDelete() {
      let self = this,
        uuidList = self.isSelected ? self.selectedList: [],
        options = {
          title: 'hybridTencenterDataCenter.Deletedatacenter',
          description: 'hybridTencenterDataCenter.delete',
          icon: 'zone_popupico',
          uuidList,
          getName: (uuid) => {
            return self.dataCenter && self.dataCenter[uuid].regionName;
          },
          ok: () => {
            self.delete(uuidList)
              .then( () => self.queryList());
          }
        };
      self.openDialog('ConfirmDlg', options)
    }
  }
}
