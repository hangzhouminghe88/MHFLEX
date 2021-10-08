import WindowBase from 'src/windows/Window';
import Utils from 'src/utils/utils';
import {mapGetters, mapState} from 'vuex';
import Methods from './Methods';

export default {
  mixins: [Methods],

	computed: {
		...mapGetters({
      getList: `hybridAliCloudSecurityGroup/getList`,
		})
	},

	methods: {
		queryList () {
			let self = this;
			self.windowData.loading = true;
			return self.dispatchAction('hybridAliCloudSecurityGroup/basicQuery', {
				start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
				limit: self.windowData.pageSize,
				q: self.getCondition(),
				sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
			}).then((resp) => {
				self.windowData.loading = false;
				return self.updateWindow({
					uuidList: resp.uuidList,
					table: Utils.createTableObjFromUuidList(resp.uuidList),
					availableCount: resp.total
				}).then ( () => {
					self.itemList = self.getList(self.windowData.uuidList);
				})
			}).catch( (e) => {
				self.windowData.loading = false;
			})
		},

    getCondition () {
      let conditionList = [], self = this;
      if (self.selectVal !== '' && self.searchStr !== '') {
        conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
      }
      return conditionList
    },

    pageDelete() {
      let self = this, uuidList = [];
      if(!self.isSelected) return;
      uuidList = self.selectedList;
      self.openDialog('ConfirmDlg', {
        title: 'hybridesecuritygroup.deleteSecurityGroup',
        description: 'hybridesecuritygroup.delete',
        icon: 'sg_popupico',
        uuidList,
        isChecked: true,
        warning: 'hybridSecurityGroupRule.info.deleteWarning',
        checkBoxText: 'hybrid.deleteOrigin',
        getName: (uuid) => {
          return self.dbData.hybridSecurityGroup[uuid].name;
        },
        ok: (isOrigin) => {
          self.delete(isOrigin, uuidList)
            .then( () => {
              self.queryList();
            });
        }
      })
    }
	}
}
