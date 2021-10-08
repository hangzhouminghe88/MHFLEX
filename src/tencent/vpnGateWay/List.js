import Utils from "../../utils/utils";
import { mapGetters } from 'vuex';
import Methods from './Methods';

export  default {
  mixins: [Methods],

  computed: {
    ...mapGetters({
      get: 'hybridTencentVpcVpnGateway/getList'
    })
  },

  methods: {
    //构造查询条件
    getCondition: function() {
      let self = this, conditionList = [];
      if(self.selectVal !== "" && self.searchStr !== '') {
        conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}25%`);
      }
      return conditionList;
    },

    //查询vpnGateway
    queryList() {
      let self = this;
      self.windowData.loading = true;
      self.itemList= [];
      return self.dispatchAction('hybridTencentVpcVpnGateway/basicQuery', {
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
        title: 'hybridvpcvpngateway.delete',
        description: 'hybridvpcvpngateway.deleteVpnGateway',
        uuidList,
        icon: 'vpn_gateway_popupico',
        isChecked: true,
        checkBoxText:'同时删除腾讯云上资源',
        getName: (uuid) => {
          return self.dbData.hybridTencentVpcVpnGateway[uuid].name;
        },
        ok: (isOrigin) => {
          self.delete(isOrigin, uuidList)
            .then( () => {
              self.queryList();
            });
        }
      })
    },
    //同步
    pageAsync() {
      let self = this;
      self.asyncGateWay()
      .then(() => {
        self.queryList();
      })
    }
  }
}
