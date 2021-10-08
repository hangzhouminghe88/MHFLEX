import Utils from "../../utils/utils";
import { mapGetters } from 'vuex';
import Methods from './Methods';

export default {
  mixins: [Methods],

  computed: {
    ...mapGetters({
      get: 'hybridAliCloudUserVpnGateway/getList'
    })
  },

  methods: {
    getCondition() {
      let self = this, conditionList = [];
      if(self.selectVal !== "" && self.searchStr !== '') {
        conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}25%`);
      }
      return conditionList;
    },

   //查询userVpnGateway
    queryList() {
      let self = this;
      self.windowData.loading = true;
      return self.dispatchAction('hybridAliCloudUserVpnGateway/basicQuery', {
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

    // 删除网关
    pageDelete() {
      let self = this,uuidList = [];
      if(!self.isSelected) return;
      uuidList = self.selectedList;
      self.openDialog('ConfirmDlg', {
        title: 'hybridvpcuservpngateway.delete',
        description: 'hybridvpcuservpngateway.deleteConfirm',
        uuidList,
        icon: 'vpn_gateway_popupico',
        isChecked: true,
        checkBoxText: self.$t('hybrid.deleteOrigin'),
        getName: (uuid) => {
          return self.dbData.hybridVpcUserVpnGateway[uuid].name;
        },
        ok: (isOrigin) => {
          self.delete(uuidList, isOrigin)
            .then( () => {
              self.queryList();
            });
        }
      })
    }
  }
}
