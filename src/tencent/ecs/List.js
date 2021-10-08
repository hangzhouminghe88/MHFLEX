import Utils from 'src/utils/utils';
import { mapGetters } from 'vuex';
import Methods from './Methods';

export default {
	mixins: [Methods],

	computed: {
		...mapGetters({
			get: 'hybridTencentEcsInstance/getList'
		})
	},

	methods: {
		//构造查询条件
    getCondition () {
      let conditionList = [], self = this;
      if (self.selectVal !== '' && self.searchStr !== '') {
        conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
      }
      return conditionList
    },
		 //查询ecs
		 queryList () {
			let self = this;
			self.windowData.loading = true;
			return self.dispatchAction('hybridTencentEcsInstance/basicQuery', {
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
					self.itemList =  self.get(self.windowData.uuidList)
					setTimeout(() => {
						self.itemList =  self.get(self.windowData.uuidList)
					}, 500);
					self.windowData.loading = false;
				})
			}).catch( (e) => {
				self.windowData.loading = false;
			})
		},

	  inStates() {
			let self = this, states = [];
			if(!self.isSelected) return false;
			for(let arg in arguments) {
				states.push(arguments[arg]);
			}
			let instate = self.selectedList.every((uuid) => {
        return states.some((state) => {
          return self.dbData.hybridTencentEcsInstance[uuid].ecsStatus === state;
        })
      })
      return instate;
		},

		//停用启用云主机
		pageEnableOrDisable(operate) {
			let self = this, uuidList = [];
			if(!self.isSelected) return;
			self.selectedList.forEach((uuid) => {
				if(self.dbData.hybridTencentEcsInstance[uuid].ecsStatus !== operate.toUpperCase())
				uuidList.push(uuid);
			})
			if(uuidList.length <=0 ) return;
			if (operate === 'Running') self.action(uuidList, 'start').then(() => self.queryList());
			if(operate === 'Stopped')
			 self.openDialog('ConfirmDlg', {
				title: 'hybridecsinstance.stop',
				description: 'hybridecsinstance.delete',
				icon: 'vm_popupico',
				uuidList,
				getName: (uuid) => {
					return self.dbData.hybridTencentEcsInstance[uuid].name;
				},
				ok: () => {
					self.action(uuidList,'stop').then(() => self.queryList());
				}
			})
		},
		//删除云主机
		pageDelete () {
			let self = this, uuidList = [];
			if(!self.isSelected) return;
			uuidList = self.selectedList;
			self.openDialog('ConfirmDlg', {
        title: 'hybridecsinstance.deleteEcsInstance',
        description: 'hybridecsinstance.delete',
        uuidList,
        icon: 'vm_popupico',
        type: 'delete',
        isChecked: true,
        checkBoxText: "同时删除腾讯云上资源",
        ok: (deleteOrigion) => {
					return self.delete(uuidList, deleteOrigion)
					.then(() => {
						self.queryList();
					});
        },
        getName: (uuid) => {
          return self.dbData.hybridTencentEcsInstance[uuid].name;
        }
      })
		},
		//重启云主机
		pageReboot() {
			let self = this;
      if (!self.isSelected) return;
      self.openDialog('ConfirmDlg', {
        title: 'hybridecsinstance.reboot',
        description: 'hybridecsinstance.rebotHybridEcsInstance',
        icon: 'vm_popupico',
        uuidList: self.selectedList,
        getName: (uuid) => {
          return self.dbData.hybridTencentEcsInstance[uuid].name;
        },
        ok: () => {
					self.action(self.selectedList,'reboot').then(() => self.queryList());
        }
      })
		},
		//打开控制台
		pageOpenConsole() {
			let self = this;
      if (!self.isSingleSelected) return;
			self.getEcsInstanceVncUrl(self.selectedList)
		},
    //设置控制台密码
		pageSetVmConsolePassword() {
      let self = this;
      if(!self.isSingleSelected) return;
      let uuid = self.selectedList[0];
      self.openDialog('HybridModifyConsolePassword', {
        ok: (param) => {
          self.updateEcsInstancePassword(uuid, param, 'Console')
          .then(() => self.queryList())
        }
      })
    },
     //修改系统用户密码
    pageUpdateEcsRootPassword() {
      let self = this;
      if(!self.isSingleSelected) return;
      let uuid = self.selectedList[0];
      self.openDialog('HybridModifyRootPassword', {
        ok: (newPassword) => {
          self.updateEcsInstancePassword (uuid, newPassword, 'Root')
            .then(() => self.queryList());
        }
      })
    },
	}
}
