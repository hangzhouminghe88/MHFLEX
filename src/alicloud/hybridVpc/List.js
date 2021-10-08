import Utils from "../../utils/utils";
import { mapGetters } from 'vuex';
import Methods from './Methods';

export default {
  mixins: [Methods],

  computed: {
    ...mapGetters({
      get: 'hybridAliCloudVpc/getList'
    })
  },

  methods: {
    //获得查询条件
    getCondition: function () {
      let conditionList = [], self = this;
      if (self.selectVal !== '' && self.searchStr !== '') {
        conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
      }
      return conditionList
    },
    //查询vpc
    queryList() {
      let self = this;
      self.windowData.loading = true;
      return self.dispatchAction('hybridAliCloudVpc/basicQuery', {
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
      uuidList = self.selectedList;
      self.openDialog('ConfirmDlg', {
        uuidList,
        title: 'hybridvirtualprivatecloud.DeleteVirtualPrivateCloud',
        description: 'hybridvirtualprivatecloud.delete',
        icon: 'vpc_popupico',
        warning:'hybridvirtualprivatecloud.info.deleteWarning',
        checkBoxText: "hybrid.deleteOrigin",
        isChecked: true,
        ok: (deleteOrigin) => {
          self.delete(deleteOrigin, uuidList)
            .then( () => {
              self.queryList();
            });
        },
        getName:(uuid) => {
          return self.dbData.hybridVirtualPrivateCloud[uuid].name;
        }
      })
    }
  }
}
