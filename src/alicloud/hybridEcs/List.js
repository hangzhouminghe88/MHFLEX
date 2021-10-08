import rpc from 'src/utils/rpc';
import Methods from './Methods';

export default {
  mixins: [Methods],

  methods: {
    getCondition: function () {
      let conditionList = [], self = this;
      if (self.selectVal !== '' && self.searchStr !== '') {
        conditionList = conditionList.concat(`${self.selectVal}~=%25${self.searchStr}%25`)
      }
      return conditionList
    },

    queryList() {
      let self = this;
      self.itemList = [], self.windowData.loading = true;
      return rpc.query('hybrid/aliyun/ecs', {
        count: false,
        start: (self.windowData.pageIndex - 1) * this.windowData.pageSize,
        limit: self.windowData.pageSize,
        replyWithCount: true,
        q: this.getCondition(),
        sort: `${self.windowData.sortDirection}${this.windowData.sortBy}`
      }).then((resp) => {
        self.updateWindow({
          pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / self.windowData.pageSize),
          availableCount: resp.total,
          loading: false,
        })
        self.updateDbTable({
          tableName: 'hybridEcsInstance',
          list: resp.inventories
        }).then(() => {
          self.itemList = resp.inventories
        })
      }).catch((e) => {
        self.windowData.loading = false;
      })
    },

    inStates() {
      let self = this, states = [];
      for (let arg in arguments) {
        states.push(arguments[arg]);
      }
      let instate = self.selectedList.every((uuid) => {
        return states.some((state) => {
          return self.dbData.hybridEcsInstance[uuid].ecsStatus === state;
        })
      })
      return instate;
    },

    pageReboot() {
      let self = this;
      if (!self.isSelected) return;
      self.openDialog('ConfirmDlg', {
        title: 'hybridecsinstance.reboot',
        description: 'hybridecsinstance.rebotHybridEcsInstance',
        icon: 'vm_popupico',
        uuidList: self.selectedList,
        getName: (uuid) => {
          return self.dbData.hybridEcsInstance[uuid].name;
        },
        ok: () => {
          self.action(self.selectedList, self.queryList, 'reboot');
        }
      })
    },

    pageOpenConsole() {
      let self = this;
      if (!self.isSingleSelected) return;
      self.getEcsInstanceVncUrl(self.selectedList);
    },

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

    pageUpdateEcsRootPassword() {
      let self = this;
      if(!self.isSingleSelected) return;
      let uuid = self.selectedList[0];
      self.openDialog('HybridModifyRootPassword', {
        ok: (newPassword) => {
          self.updateEcsInstancePassword(uuid, newPassword, 'Root')
            .then(() => self.queryList());
        }
      })
    },

    pageDelete() {
      let self = this;
      if (!self.isSelected) return;
      self.openDialog('ConfirmDlg', {
        title: 'hybridecsinstance.deleteEcsInstance',
        description: 'hybridecsinstance.delete',
        uuidList: self.selectedList,
        icon: 'vm_popupico',
        type: 'delete',
        isChecked: true,
        checkBoxText: "hybrid.deleteOrigin",
        ok: (deleteOrigion) => {
          return self.delete(self.selectedList, deleteOrigion, self.queryList);
        },
        getName: (uuid) => {
          return self.dbData.hybridEcsInstance[uuid].name;
        }
      })
    },

    pageEnableOrDisable(param) {
      let self = this, uuidList = [];
      if (!self.isSelected) return;
      for (let uuid of self.selectedList) {
        if (self.dbData.hybridEcsInstance[uuid].ecsStatus !== param) {
          uuidList.unshift(uuid)
        }
      }
      if (uuidList.length === 0) return
      if (param === 'Running') self.action(uuidList, self.queryList, 'start');
      if (param === 'Stopped') {
        self.openDialog('ConfirmDlg', {
          title: 'hybridecsinstance.stop',
          description: 'hybridecsinstance.delete',
          icon: 'vm_popupico',
          uuidList,
          getName: (uuid) => {
            return self.dbData.hybridEcsInstance[uuid].name;
          },
          ok: () => {
            self.action(uuidList, self.queryList, 'stop');
          }
        })
      }
    }
  }
}
