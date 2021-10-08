import Utils from 'src/utils/utils';
import { mapGetters } from 'vuex';

export default {
	computed: {
    ...mapGetters({
      get: 'hybridTencentVpcUserGateway/getList'
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
      return self.dispatchAction('hybridTencentVpcUserGateway/basicQuery', {
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
					setTimeout(() => {
						self.itemList = self.get(self.windowData.uuidList);
					}, 500)
        })
      }).catch((e) => {
        self.windowData.loading = false;
      })
	  }
  }
}