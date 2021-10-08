import Utils from 'src/utils/utils';
import { mapGetters } from 'vuex';
import Methods from './Methods';

export default {
	mixins: [Methods],

	computed: {
    ...mapGetters({
			get: 'hybridTencentVpc/getList'
		})
	},

	methods: {
		getCondition() {
			let self = this, conditionList = [];
			if(self.selectVal !== '' && self.searchStr !== '') {
				conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
			}
			return conditionList;
		},

		queryList() {
			let self = this;
			self.windowData.loading = true;
			return self.dispatchAction('hybridTencentVpc/basicQuery', {
				limit: self.windowData.pageSize,
				start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
				sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`,
				q: self.getCondition()
			}).then( (resp) => {
				self.updateWindow( {
					uuidList: resp.uuidList,
					table: Utils.createTableObjFromUuidList(resp.uuidList),
					availableCount: resp.total
				}).then( () => {
					self.itemList = self.get(self.windowData.uuidList);
					self.windowData.loading = false;
				})
			}).catch( () => {
				self.windowData.loading = false;
			})
		},

		pageDelete() {
			let self = this, uuidList = [];
			if(!self.isSelected) return;
			uuidList = self.selectedList;
			self.openDialog('ConfirmDlg', {
				uuidList,
				title: 'hybridvirtualprivatecloud.DeleteVirtualPrivateCloud',
        description: 'hybridvirtualprivatecloud.delete',
        icon: 'vpc_popupico',
        warning:'hybridvirtualprivatecloud.info.deleteWarning',
        checkBoxText: "同时删除腾讯云上资源",
        isChecked: true,
				getName: (uuid) => {
          return self.dbData.hybridTencentVirtualPrivateCloud[uuid].name;
				},
				ok: (isOrigin) => {
					 self.delete(uuidList, isOrigin)
					 .then(() => {
						 self.queryList();
					 });
				}
			})
		}
	}
}
