import Utils from "../../utils/utils";
import {mapGetters, mapState} from "vuex";
import Methods from  './Methods';

export default {
  mixins: [Methods],
  computed: {
    //计算dbData.hybridHuaweiyunDataCenter
    ...mapGetters({
      get: 'hybridHuaweiDataCenter/getList'
    }),
    //得到dataCenter对象
    ...mapState({
      dataCenter: state => {
        return state.hybridHuaweiDataCenter
      }
    })
  },
  methods: {
    //请求条件
    getCondition() {
      let self = this, conditionList = [];
      if(self.selectVal !== '' && self.searchStr !== '') {
        conditionList = conditionList.concat(`${self.selectVal}~=25%${encodeURIComponent(self.searchStr)}25%`)
      }
      return conditionList;
    },
    //列表请求
    queryList() {
      let self = this;
      self.windowData.loading = true;
      return self.dispatchAction('hybridHuaweiDataCenter/basicQuery', {
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
    //删除地域
    pageDelete() {
      let self = this, uuidList = [];
      if(!self.isSelected) return;
      uuidList = self.windowData.selectedUuidList;
      self.openDialog('ConfirmDlg', {
        title: 'hybridHuaweiDataCenter.Deletedatacenter',
        description: 'hybridHuaweiDataCenter.delete',
        icon: 'zone_popupico',
        uuidList,
        getName: (uuid) => {
          return self.dataCenter && self.dataCenter[uuid].regionName;
        },
        ok: () => {
          self.delete(uuidList);
        }
      })
    }
  }
}
