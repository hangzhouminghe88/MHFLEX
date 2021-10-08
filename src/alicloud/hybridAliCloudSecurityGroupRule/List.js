import Utils from "../../utils/utils";
import { mapGetters } from 'vuex';
import Methods from './Methods';

export default {
  mixins: [Methods],

  computed: {
    ...mapGetters({
      getList: 'hybridAliCloudSecurityGroupRule/getList'
    }),
  },

  methods: {
    getCondition() {
      let self = this, conditionList = [];
      if(self.selectVal !== '' && self.searchStr !== '') {
        conditionList = conditionList.concat(`${self.selectVal}~=%25${self.searchStr}%25`);
      }
      return conditionList;
    },

    queryList() {
      let self = this;
      self.windowData.loading = true;
      return self.dispatchAction('hybridAliCloudSecurityGroupRule/basicQuery', {
        start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
        limit: self.windowData.pageSize,
        q: self.getCondition(),
        sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
      }).then((resp) => {
        self.windowData.loading = false;
        return self.updateWindow({
          uuidList: resp.uuidList,
          table: Utils.createTableObjFromUuidList(resp.uuidList),
        }).then ( () => {
          let Direction = self.currSelectTab
          let ret = self.getList(self.windowData.uuidList).filter(rule => rule.direction === Direction)
          let total = ret.length
          self.updateWindow({
            table: Utils.createTableObjFromUuidList(resp.uuidList),
            availableCount: total
          })
          self.itemList = ret;
        })
      }).catch( (e) => {
        self.windowData.loading = false;
      })
    },

    pageDelete() {
      let self = this, uuidList = [];
      uuidList = self.selectedList;
      self.openDialog('ConfirmDlg', {
        title: 'hybridSecurityGroupRule.delete',
        description: 'hybridSecurityGroupRule.deleteDescription',
        icon: 'security_group_popupico',
        warning: 'hybridSecurityGroupRule.deleteWarning',
        uuidList,
        getName: (uuid) => {
          return self.dbData.hybridSecurityGroupRule[uuid].cidrIp;
        },
        ok: () => {
          self.delete(uuidList).then(() => {
            self.queryList();
          })
        }
      })
    }
  }
}
