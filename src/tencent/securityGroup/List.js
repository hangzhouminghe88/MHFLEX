import Utils from 'src/utils/utils';
import {mapGetters, mapState} from 'vuex';
import Methods from './Methods';

export default {
  mixins: [Methods],

	computed: {
		...mapGetters({
      getList: `hybridTencentSecurityGroup/getList`,
		})
	},

	methods: {
    //查询安全组
		queryList () {
			let self = this;
			self.windowData.loading = true;
			return self.dispatchAction('hybridTencentSecurityGroup/basicQuery', {
				start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
				limit: self.windowData.pageSize,
				q: self.getCondition(),
				sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
			}).then((resp) => {
				return self.updateWindow({
					uuidList: resp.uuidList,
					table: Utils.createTableObjFromUuidList(resp.uuidList),
					availableCount: resp.total
				}).then ( () => {
          self.itemList =  self.getList(self.windowData.uuidList)
          self.windowData.loading = false;
				})
			}).catch( (e) => {
				self.windowData.loading = false;
			})
		},
    //构造查询条件
    getCondition () {
      let conditionList = [], self = this;
      if (self.selectVal !== '' && self.searchStr !== '') {
        conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
      }
      return conditionList
    },
    //删除安全组
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
        checkBoxText: '同时删除腾讯云上资源',
        getName: (uuid) => {
          return self.dbData.hybridTencentSecurityGroup[uuid].name;
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
