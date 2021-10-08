import Utils from "../../utils/utils";
import { mapGetters } from 'vuex';
import Methods from './Methods';

export default {
  computed: {
    ...mapGetters({
      get: 'hybridAlicloudVirtualRouterInterface/getList'
    })
  },

  mixins: [Methods],

  methods: {
    getCondition(){
      let conditionList = [], self = this;
        if (this.currSelectTab === 'vbr') {
          conditionList.push('vRouterType=vbr')
        } else {
          conditionList.push('vRouterType=vrouter')
        }
      if(self.selectVal !== '' && self.searchStr !== '') {
        conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
      }
      return conditionList;
    },

    //查询云路由器
    queryList() {
      let self = this;
      self.windowData.loading = true;
      self.updateCount();
      return self.dispatchAction('hybridAlicloudVirtualRouterInterface/basicQuery', {
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

    //添加路由器接口
    pageCreate() {
      let self = this;
      self.$router.push({name: 'createHybridAliCloudVirtualRouterInterface', params: {currTab: self.currSelectTab}})
    }
  }
}

