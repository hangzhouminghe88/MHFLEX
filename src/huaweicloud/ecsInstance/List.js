import Utils from "../../utils/utils";
import Methods from './Methods';
import { mapGetters } from 'vuex';

export default {
  mixins: [Methods],
  computed: {
    ...mapGetters({
      get: 'hybridHuaweiEcsInstance/getList'
    })
  },
  methods: {
    //查询条件
    getCondition() {
      let self = this, conditionList = [];
      if(self.selectVal !== "" && self.searchStr !== "") {
        conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
      }
      return conditionList;
    },
    //查询华为云列表
    queryList() {
      let self = this;
      self.windowData.loading = true;
      return self.dispatchAction('hybridHuaweiEcsInstance/basicQuery', {
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
    //判断是否在某个状态中
    inStates() {
      let self = this, states = [];
      for(let i in arguments) {
        states.push(arguments[i])
      }
      if(self.selectedUuidList.length > 0) {
        return self.selectedUuidList.every(uuid => states.some((state) => self.dbData.hybridHuaweiEcsInstance[uuid].ecsStatus === state))
      }
      return false;
    },
    //停用启用云主机
    pageEnableOrDisable(operate) {
      let self = this, uuidList = [];
      if(!self.isSelected) return;
      self.selectedList.forEach((uuid) => {
        if(self.dbData.hybridHuaweiEcsInstance[uuid].ecsStatus !== operate.toUpperCase())
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
            return self.dbData.hybridHuaweiEcsInstance[uuid].name;
          },
          ok: () => {
            self.action(uuidList,'stop').then(() => self.queryList());
          }
        })
    },
    //重启华为云云主机
    pageReboot() {
      let self = this, uuidList = [];
      if(!self.isSelected)  return;
      uuidList = self.selectedUuidList;
      self.openDialog('ConfirmDlg', {
        title: 'hybridecsinstance.reboot',
        description: 'hybridecsinstance.rebotHybridEcsInstance',
        icon:  'vm_popupico',
        uuidList,
        getName: (uuid) => {
          return self.dbData.hybridHuaweiEcsInstance[uuid].name;
        },
        ok: () => {
          self.action(uuidList,'reboot').then(() => self.queryList());
        }
      })
    },
    //打开控制台
    pageOpenHuaweiConsole() {
      let self = this;
      if(!self.isSingleSelected) return;
      self.getHuaweiEcsInstanceVncUrl(self.selectedList)
    },
    //更新密码
    pageUpdateHuaweiEcsRootPassword() {
      let self = this, uuid = '';
      if(!self.isSingleSelected) return;
      uuid = self.selectedList[0];
      self.openDialog('HybridModifyRootPassword', {
        ok: (newPassword) => {
          self.updateEcsInstancePassword (uuid, newPassword, 'Root')
            .then(() => self.queryList());
        }
      })
    },
    //删除云主机
    pageDelete() {
      let self = this, uuidList = [];
      if(!self.isSelected) return;
      uuidList = self.selectedUuidList;
      self.openDialog('ConfirmDlg', {
        title: 'hybridecsinstance.deleteEcsInstance',
        description: 'hybridecsinstance.delete',
        uuidList,
        icon: 'vm_popupico',
        type: 'delete',
        isChecked: true,
        checkBoxText: "hybrid.deleteOrigin",
        ok: (deleteOrigion) => {
          return self.delete(uuidList, deleteOrigion)
            .then(() => {
              self.queryList();
            });
        },
        getName: (uuid) => {
          return self.dbData.hybridHuaweiEcsInstance[uuid].name;
        }
      })
    }
  }
}
