import Utils from "../../utils/utils";
import {mapGetters} from "vuex";
import Methods from './Methods';

export default {
  mixins: [Methods],
  computed: {
    ...mapGetters({
      get: 'hybridHuaweiIdentityZone/getList'
    })
  },

  methods: {
    //构造查询条件
    getCondition() {
      let self = this, conditionList = [];
      if(self.selectVal !== '' && self.searchStr !== '') {
        conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
      }
      return conditionList;
    },
    //查询列表
    queryList() {
      let self = this;
      self.windowData.loading = true;
      return self.dispatchAction('hybridHuaweiIdentityZone/basicQuery', {
        start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
        limit: self.windowData.pageSize,
        sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`,
        q: self.getCondition()
      }).then(resp => {
        self.updateWindow({
          uuidList: resp.uuidList,
          table: Utils.createTableObjFromUuidList(resp.uuidList),
          availableCount: resp.total
        }).then(() => {
          self.itemList =  self.get(self.windowData.uuidList)
          setTimeout(() => {
            self.itemList =  self.get(self.windowData.uuidList)
          }, 500);
          self.windowData.loading = false;
        })
      }).catch(() => {
        self.windowData.loading = false;
      })
    },
    //删除可用区
    pageDelete() {
      let self = this, uuidList = [];
      if(!self.isSelected) return;
      uuidList = self.windowData.selectedUuidList;
      self.openDialog('ConfirmDlg', {
        title: 'hybrididentityzone.Deleteidentityzone',
        description: 'hybrididentityzone.delete',
        icon: 'izone_popupico',
        uuidList,
        getName: (uuid) => {
          return self.dbData.hybridHuaweiyunIdentityZone[uuid].zoneName;
        },
        ok: () => {
          self.delete(uuidList)
            .then( () => {
              self.queryList();
            });
        }
      })
    }
  }
}
