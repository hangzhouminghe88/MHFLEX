import { mapGetters } from 'vuex';
import Methods from './Methods';
export default {
  mixins: [Methods],
  computed: {
		...mapGetters({
			get: 'hybridHuaweiSubNet/getList'
		})
	},
  methods: {
    //华为云子网查询条件
    getCondition() {
      let self = this, conditionList = [];
      if(self.selectVal !== '' && self.searchStr !== '') {
        conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
      }
      return conditionList;
    },
    //查询华为云子网列表
    queryList() {
      let self = this;
			self.windowData.loading = true;
			return self.dispatchAction('hybridHuaweiSubNet/basicQuery', {
				limit: self.windowData.pageSize,
				start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
				replyWidthCount: true,
				sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`,
				q: self.getCondition()
			}).then( (resp) => {
         self.updateWindow({
					 uuidList: resp.uuidList,
					 table: Utils.createTableObjFromUuidList(resp.uuidList),
					 availableCount: resp.total
				 }).then( () => {
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
    //删除华为云子网
    pageDelete() {
      let _this = this;
      if(!_this.isSelected) return;
      let uuidList = _this.selectedList;
      _this.openDialog('ConfirmDlg', {
        title: '',
        description: '',
        icon: '',
        uuidList,
        isChecked: true,
        checkBoxText: '同时删除华为云上资源',
        getName: (uuid) => {
          return _this.dbData.hybridHuaweiSubnets[uuid].name;
        },
        ok: (isOrigin) => {
          _this.delete(uuidList, isOrigin);
        }
      })
    }
  }
}
