import Utils from "../../utils/utils";
import { mapGetters } from 'vuex';
// import  Methods from './Methods';

export default {
  // mixins: [Methods],

  computed: {
    ...mapGetters({
      get: 'hybridTencentVpcVpnConnection/getList'
    })
  },

  methods: {
    getCondition: function() {
      let self = this, conditionList = [];
      if(self.selectVal !== '' && self.searchStr !== '') {
        conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
      }
      return conditionList;
    },

    //查询vpnGateway
    queryList:function() {
      let self = this;
      self.windowData.loading = true;
      return self.dispatchAction('hybridTencentVpcVpnConnection/basicQuery', {
        start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
        limit: self.windowData.pageSize,
        q: self.getCondition(),
        sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
      }).then(resp => {
        self.windowData.loading = false;
        return self.updateWindow({
          uuidList: resp.uuidList,
          table: Utils.createTableObjFromUuidList(resp.uuidList),
          availableCount: resp.total
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
        title: 'hybridvpcvpnconnection.delete',
        description: 'hybridvpcvpnconnection.deleteVpcVpnConnection',
        uuidList,
        icon: 'vpn_connection_popupico',
        isChecked: true,
        checkBoxText: '同时删除腾讯云上资源',
        getName: (uuid) => {
          return self.dbData.hybridTencentVpcVpnConnection[uuid].name;
        },
        ok: (isOrigin) => {
          self.delete(uuidList, isOrigin).then(() => self.queryList())
        }
      })
    }

  }
}
