import Utils from "../../utils/utils";
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters({
      get: 'hybridTencentVirtualRouter/getList'
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
      return self.dispatchAction('hybridTencentVirtualRouter/basicQuery', {
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
  }
}

