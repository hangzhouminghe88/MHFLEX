import Utils from 'src/utils/utils';
import { mapGetters } from 'vuex';
import Methods from './Methods';

export default {
	mixins: [Methods],

	computed: {
		...mapGetters({
			get: 'hybridTencentSubNets/getList'
		})
	},

	methods: {
		getCondition() {
      let conditionList = [];
      if (this.selectVal !== "" && this.searchStr !== "") {
        conditionList = conditionList.concat(
          `${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`
        );
      }
      return conditionList;
		},

		queryList() {
			let self = this;
			self.windowData.loading = true;
			return self.dispatchAction('hybridTencentSubNets/basicQuery', {
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

		pageDelete() {
			const self = this
      if (!self.isSelected || self.selectedList.length <= 0) return
      let selectedUuidList = self.selectedList
      self.openDialog('ConfirmDlg', {
        title: 'hybridvswitch.deleteVSwitch',
        description: 'hybridvswitch.delete',
        icon: 'vswitch_popupico',
        uuidList: selectedUuidList,
        warning: 'hybridvswitch.info.deleteWarning',
        isChecked: true,
        checkBoxText: '同时删除腾讯云上资源',
        getName: (uuid) => {
          return self.dbData.hybridTencentSubNets[uuid].name;
        },
        ok: (deleteOrigin) => {
					self.delete(selectedUuidList, deleteOrigin)
					.then(() => {self.queryList()})
        }
      })
		}
	}
}
