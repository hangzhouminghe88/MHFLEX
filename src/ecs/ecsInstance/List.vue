<script>
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  import {mapGetters, mapState} from 'vuex';
  import Methods from './Methods';
  import Strategy from './strategy';
  import ChangeResourceOwnerDlg from 'src/utils/changeResourceOwner'
  import TagPartialForResourceList from 'src/om/tag/partials/TagPartialForResourceList'
  import VolumeMethods from 'src/ecs/volume/Methods';
  import { setTimeout } from 'timers';
  //ecs云主机相关的请求
  export default {
    name: "EcsInstancePage",
    mixins: [Root, VolumeMethods, Methods, TagPartialForResourceList],
    computed:{
      ...mapGetters({get: 'vm/get'}),
      ...mapState({
        vm: state => state.vm
      })
    },
    watch: {
      'windowData.pageIndex': function(newVal, oldVal){
        let self = this;
        if(newVal !== oldVal){
          self.queryList();
        }
      },
      'windowData.pageSize': function(newVal, oldVal){
        let self = this;
        if(newVal !== oldVal){
          self.queryList();
        }
      }
    },
    created(){
      this.changeResourceOwnerDlg = ChangeResourceOwnerDlg.changeResourceOwnerDlg.bind(this);
      rpc.query('backup-storage', {
        q: `zone.uuid=${localStorage.getItem('currZoneUuid')}`
      }).then(resp => {
        this.bsListInCurrentZone = resp.inventories
      })
    },
    data(){
      return {
        bsListInCurrentZone: []
      }
    },
    methods: {
      ...Utils,
      //查询列表
      queryList: function () {
        let self = this;
        self.windowData.loading = true;
        return self.dispatchAction('vm/query', {
          start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
          limit: self.windowData.pageSize,
          q: self.getCondition(),
          sortBy: self.windowData.sortBy,
          sortDirection: self.windowData.sortDirection
        }).then(resp => {
          return self.updateWindow({
            uuidList: resp.uuidList,
            table: Utils.createTableObjFromUuidList(resp.uuidList),
            total: resp.total
          })
        }).then(() => {
          self.windowData.loading = false;
           self.itemList = self.get(self.windowData.uuidList);
           let itemInterval = setInterval ( () => {
             self.itemList = self.get(self.windowData.uuidList);
             self.itemList.forEach( (item) => {
              if(item.ownerName){
               clearInterval(itemInterval);
               if(itemInterval){
                 itemInterval = null;
               }
              }
            })
           }, 100);
        }).catch(() => {
          self.windowData.loading = false;
        })
      },
      //获得默认三层网络ip
      getDefaultL3NetworkIp: function (uuid) {
        let value = [];
        for (let i = 0; i < this.dbData.vm[uuid].vmNics.length; i++) {
          if (this.dbData.vm[uuid].defaultL3NetworkUuid === this.dbData.vm[uuid].vmNics[i].l3NetworkUuid) {
            value = this.dbData.vm[uuid].vmNics[i].usedIps.map((item) => item.ip);
            break
          }
        }
        return value
      },
      //获得集群名称
      getClusterName(uuid){
        rpc.queryResourceNames(this, 'cluster', uuid)
      },
      //获得可用的条件
      getAvailableCondition () {
        let conditionList = ['state!=Destroyed'];
        return conditionList.concat(this.getBasicCondition())
      },
      //获得销毁的条件
      getDestroyedCondition () {
        let conditionList = ['state=Destroyed'];
        return conditionList.concat(this.getBasicCondition())
      },
      getBasicCondition () {
        let conditionList = [];
        conditionList.push('type=UserVm');
        conditionList.push('hypervisorType=KVM');
        conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`);
        if (this.getTagCondtion) {
          conditionList = conditionList.concat(this.getTagCondtion())
        }
        conditionList = conditionList.concat(this.getSearchCondition());
        return conditionList
      },
      //获得搜索条件
      getSearchCondition () {
        let self = this;
        if (this.selectVal !=='' && self.searchStr !== '') {
          return [`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`]
        }
        return []
      },
      //获得标签查询条件
      getTagCondtion () {
        if (!this.tagUuidList) return [];
        return this.tagUuidList.map(uuid => `__tagUuid__=${uuid}`)
      },
      //获得查询条件
      getCondition: function () {
        if (this.windowData.currTab === 'available') {
          return this.getAvailableCondition()
        } else {
          return this.getDestroyedCondition()
        }
      },
      //开启虚拟机
      startVm() {
        const self = this;
        let uuidList = [];
       self.windowData.selectList.map((item)=>{
         if (item.state !== 'Running' && item.state !== 'Paused' && item.state !== 'VolumeMigrating' && item.state !== 'Migrating') uuidList.push(item.uuid);
       });
        if (uuidList.length > 0) {
          self.start(uuidList)
            .then(() => {
              self.queryList();
            })
        }
      },
      //停止虚拟机
      stopVm() {
        const self = this;
        let uuidList = [];
        if(self.windowData.selectList.length <=0) return;
        uuidList  = this.windowData.selectList.map((item) => {
          if(item.state !== 'Stopped') {
          return item.uuid;
          }
        });
        if (uuidList.length > 0) {
          self.normalVmInstanceMessage = {
           'confirmDlgType': 'Stop',
            uuidList,
          };
          self.showNormalVmInstanceDlg = true;
        }
      },
      //彻底删除云主机
      expungeVm(){
        let self = this;
        self.updateWindow({
          showMoreDropdown: false
        });
        let uuidList = [];
        uuidList = this.windowData.selectList.map((item) => {
          return item.uuid;
        });
        let clearWindowDataUuidList = (uuid) => {
          let windowUuidList = self.windowData.uuidList;
          _.remove(windowUuidList, (uid) => {
            return uid === uuid
          });
          self.updateWindow({
            uuidList: windowUuidList
          });
          if (_.isNumber(self.destroyedCount)) {
            self.destroyedCount --
          }
        };
        self.updateWindow({
          vmUuidList: uuidList,
          clearWindowDataUuidList: clearWindowDataUuidList
        });
        self.normalVmInstanceMessage.confirmDlgType = 'Expunge';
        self.normalVmInstanceMessage.uuidList = uuidList;
        self.showNormalVmInstanceDlg = true;
      },
      //开启虚拟机
      start: function (uuidList) {
        return this.dispatchActionWithEvent('vm/start', uuidList)
          .then(() => {
          return this.dispatchAction('vm/query', { q: `uuid?=${uuidList.join(',')}` })
        })
      },
      //创建虚拟机
      create: function (createParam, count) {
        let event = this.createEvent('vm.action.create', createParam.name, count);
        let self = this;
        let tagUuidList;
        if (createParam.tagUuidList) {
          tagUuidList = createParam.tagUuidList;
          delete createParam.tagUuidList
        }
        let isInVmPage = _.includes(this.windowId, 'VmInstanceListPage');
        let intervalHandler;
        if (isInVmPage) {
          let timeInterval = this.windowData.pageSize / 3 * 1000;
          intervalHandler = setInterval(this.queryList, timeInterval)
        }
        return this.dispatchAction('vm/create', {
          createParam,
          count,
          event,
          progressCb: function (result) {
            function complete () {
              if (event.successCount + event.failCount >= event.count) {
                clearInterval(intervalHandler);
                if (isInVmPage) {
                  self.queryList()
                }
              }
            }
            if (result.success) {
              self.incEventSuccess(event);
              if (tagUuidList && tagUuidList.length > 0) {
                self.attachTag([result.inventory.uuid], tagUuidList)
                  .then(complete)
              } else {
                complete()
              }
            } else {
              self.incEventFail(event);
              complete()
            }
          }
        })
      },
      //关闭虚拟机弹框
      closeNormalVmIntanceDlg(param){
        let self = this;
        if(param){
          switch(param.type.toLowerCase()){
            case 'stop':
              self.stop(param.uuidList, param.stopHa, self.queryList);
              break;
            case 'reboot':
              this.reboot(param.uuidList, param.type, self.queryList)
                .then(()=>{
                  self.queryVirtualRouterVm()
                });
              break;
            case 'pause':
              this.pause(param.uuidList, param.type, self.queryList);
              break;
            case 'resume':
              this.resume(param.uuidList, param.type, self.queryList);
              break;
            case 'poweroff':
              this.powerOff(param.uuidList, param.stopHa, self.queryList);
              break;
            case 'deletesshkey':
              this.deleteVmSshKey(param.uuidList, param.type, self.queryList);
              break;
            case 'reimage':
              this.reimage(param.uuidList, param.type);
              break;
            case 'cancel':
              self.deleteConsolePassword(param.uuidList, param.isReboot, self.queryList);
              break;
            case 'leaveaffinity':
              self.leaveAffinityGroup(param.uuidList[0], self.vm[param.uuidList[0]].affinityGroupUuid, self.queryList);
              break;
            case 'expunge':
              self.expunge(param.uuidList, self.updateCount)
                .then(() =>{
                  self.queryList();
                });
              break;
            case 'delete':
              self.delete(param.uuidList, param.isDeleteVolume, self.updateCount)
                .then(()=>{
                  self.queryList();
                });
              break;
            case 'recover':
              self.recover(param.uuidList, self.updateCount, param.startVm, self.windowData.clearWindowDataUuidList)
                .then(()=>{
                  self.queryList();
                });
          }
        }
        self.showNormalVmInstanceDlg = false;
      },
      //关闭虚拟机confirm
      closeNormalConfirmDlg(param){
        let self = this;
        if(param){
          self.detachDataVolumeFromVm(param.uuidList, param.uuid)
            .then(() => {
              self.dispatchAction('vm/query', {
                q: `uuid=${param.uuid}`
              });
              self.dispatchAction('vm/getExtraData', param.uuid);
              for (let volumeUuid of param.uuidList) {
                this.updateVolumeVms(volumeUuid, [param.uuid])
              }
            })
        }
        self.showNormalConfirmDlg = false;
        self.showAttachVolumeDlg = false;
      },
      //查询虚拟路由
      queryVirtualRouterVm: function () {
        const self = this;
        return rpc.query('vm-instances/appliances/virtual-routers', {
          q: `zoneUuid=${localStorage.getItem('currZoneUuid')}`
        })
          .then((resp) => {
            return self.updateDbTable({
              tableName: 'vm',
              list: resp.inventories
            })
          })
      },
      //是否可以重启
      canReboot(){
        let self = this;
        if (self.windowData.selectList.length <= 0) return false;
        // selected items have same state
        let uuidList = self.windowData.selectList.map((item) => item.uuid);
        if (_.uniq(self.windowData.selectList.map((item) => { return item.state})).length === 1) {
          return Strategy.canRebootList(uuidList, this.vm)
        }
        return true
      },
      //恢复虚拟机
      recoverVm(){
        let self = this;
        self.updateWindow({
          showMoreDropdown: false
        });
        let uuidList = [];
        uuidList = this.windowData.selectList.map((item) => {
          return item.uuid;
        });
        let clearWindowDataUuidList = (uuid) => {
          let windowUuidList = self.windowData.uuidList;
          _.remove(windowUuidList, (uid) => {
            return uid === uuid
          });
          self.updateWindow({
            uuidList: windowUuidList
          });
          if (_.isNumber(self.destroyedCount)) {
            self.destroyedCount --
          }
        };
        self.updateWindow({
          vmUuidList: uuidList,
          clearWindowDataUuidList: clearWindowDataUuidList
        });
        self.normalVmInstanceMessage.confirmDlgType = 'Recover';
        self.normalVmInstanceMessage.uuidList = uuidList;
        self.showNormalVmInstanceDlg = true;
      },
      //是否可以暂停
      canPause(){
        let self = this;
        if(self.windowData.selectList.length <=0) return false;
        let uuidList = self.windowData.selectList.map((item) => item.uuid);
        if (_.uniq(self.windowData.selectList.map((item) => { return item.state})).length === 1) {
          return Strategy.canPauseList(uuidList, this.vm)
        }
        return true
      },
      //暂停虚拟机
      vmPause(){
        let self = this;
        let uuidList = [];
        uuidList = this.windowData.selectList.map((item) => {
          return item.uuid;
        });
        self.normalVmInstanceMessage.confirmDlgType = 'Pause';
        self.normalVmInstanceMessage.uuidList = uuidList;
        self.showNormalVmInstanceDlg = true;
      },
      //重启虚拟机
      vmReboot() {
        let self = this, uuidList = [];
        uuidList = this.windowData.selectList.map((item) => {
          return item.uuid;
        });
        if (uuidList.length > 0) {
          self.normalVmInstanceMessage.confirmDlgType = 'Reboot';
          self.normalVmInstanceMessage.uuidList = uuidList;
          self.normalVmInstanceMessage.vmModel = this.model;
          self.showNormalVmInstanceDlg = true;
        }
      },
      //是否可以恢复
      canResume(){
        let self = this, uuidList =  [], isUniq = false;
        if(self.windowData.selectList.length <=0) return false;
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        isUniq = _.uniq(self.windowData.selectList.map((item) => {return item.state})).length === 1 ? true : false;
        if(isUniq){
          return Strategy.canResumeListLoose(uuidList, this.vm);
        }
        return true;
      },
      //恢复
      vmResume(){
        let self = this, uuidList = [];
        if (self.windowData.selectList.length <= 0) return;
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        self.normalVmInstanceMessage.confirmDlgType = 'Resume';
        self.normalVmInstanceMessage.uuidList = uuidList;
        self.showNormalVmInstanceDlg = true;
      },
      //是否可以强制停止
      canForceStop(){
        let self = this, uuidList =  [], isUniq = false;
        if(self.windowData.selectList.length <=0) return false;
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        isUniq = _.uniq(self.windowData.selectList.map((item) => {return item.state})).length === 1 ? true : false;
        if(isUniq){
          return Strategy.canForceStopList(uuidList, this.vm);
        }
        return true;
      },
      //关闭电源
      vmPowerOff(){
        let self = this, uuidList = [];
        if(self.windowData.selectList.length<=0) return;
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        self.normalVmInstanceMessage.confirmDlgType = 'PowerOff';
        self.normalVmInstanceMessage.uuidList = uuidList;
        self.showNormalVmInstanceDlg = true;
      },
      //是否可以打开控制台
      canOpenConsole(){
        let self = this, uuidList =  [], isUniq = false;
        if(self.windowData.selectList.length <=0) return false;
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        isUniq = _.uniq(self.windowData.selectList.map((item) => {return item.state})).length === 1 ? true : false;
        if(isUniq && self.windowData.selectList.length ===1){
          return Strategy.canOpenConsole(this.vm[uuidList[0]]);
        }
        return false;
      },
      //是否可以迁移
      canMigrate(){
        let self = this, uuidList = [], isUniq = false;
        if (self.windowData.selectList.length !== 1) return false;
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        return Strategy.canMigrate(this.vm[uuidList[0]], this.dbData.primarystorage, this.dbData.common.liveMigrate)
      },
      //迁移虚拟机
      vmMigrate(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        self._pageMigrate(uuidList[0])
      },
      //打开虚拟机控制台
      vmOpenConsole() {
        let self = this, uuidList = [];
        if (self.windowData.selectList.length !== 1) return;
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        self.openConsole(uuidList[0], this.vm[uuidList[0]].name)
      },
      //删除虚拟机
      vmDelete(){
        let self = this, uuidList = [];
        if (self.windowData.selectList.length <= 0) return;
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        self.normalVmInstanceMessage.confirmDlgType = 'Delete';
        self.normalVmInstanceMessage.uuidList = uuidList;
        self.showNormalVmInstanceDlg = true;
      },
      //关闭单个主机
      closeHostSingleDlg(param){
        let self = this;
        if(param){
          switch(param.type){
            case 'migrate':
              this.migrate(param.vmUuid, param.uuid)
                .then(() =>{
                  this.queryVirtualRouterVm();
                });
            break;
            case 'start':
              self.startVmFromHost(param.uuid, self.windowData.vmUuidList[0]);
            break;
          }

        }
        self.showHostSingleDlg = false;
      },
      //是否可以创建快照
      canCreateSnapshot(){
        let self = this, uuidList = [];
        if(self.windowData.selectList.length !==1) return false;
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        return Strategy.canCreateSnapshot(this.vm[uuidList[0]])
      },
      //是否可以解绑标签
      canDetachTag () {
        let self = this, uuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        if (this.windowData.selectList.length !==1) return false;
        return this._canDetachTag(this.vm[uuidList[0]])
      },
      //创建快照
      vmCreateSnapshot(){
        let self = this;
        if (!self.windowData.selectList || self.windowData.selectList.length <= 0) return;
        let vmInstanceUuid = self.windowData.selectList[0].uuid;
        self.createSnapMessage = {
          vmInstanceUuid: vmInstanceUuid
        };
        self.showCreateSnapDlg = true;
      },
      //关闭创建快照
      closeCreateSnapDlg(param){
        let self =this;
        if(param){
          self.createSnapshot(self.vm[param.vmInstanceUuid].rootVolumeUuid, param)
        }
        self.showCreateSnapDlg = false;
      },
      //是否可以绑定标签
      _canDetachTag (res) {
        if ((res && res.myUserTagUuidList && res.myUserTagUuidList.length > 0) ||
          (res && res.otherUserTagUuidList && res.otherUserTagUuidList.length > 0)) {
          return true
        }
        return false
      },
      //判断是否能够克隆云主机
      canClone(){
        let self = this, uuidList = [];
        if (self.windowData.selectList.length !==1 ) return false;
        uuidList = self.windowData.selectList.map((item) => item.uuid);
        return Strategy.canClone(this.vm[uuidList[0]], this.bsListInCurrentZone)
      },
      //克隆
      async vmClone(){
        let self = this, uuidList= [];
        if(self.windowData.selectList.length !==1) return;
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        this.openClonePanel(uuidList[0]);
      },
      closeCloneVm(param){
        let self = this;
        if(param){
          let names = [];
          if (param.numbers > 1) {
            for (let i = 0; i < param.numbers; i++) {
              names.push(`${param.name}-${i + 1}`)
            }
          } else {
            names.push(`${param.name}`)
          }
          param.names = names;
          let uuid = param.uuid;
          delete param.name;
          delete param.numbers;
          delete param.uuid;
          let cb = (resp = {}) => {
            if (resp.numberOfClonedVm > 0) {
              this.queryList()
            }
          };
          self.clone(uuid, param).then((resp) => {
            if (cb) cb(resp)
          })
        }
        self.showCloneVm = false;
      },
      //判断能够删除sshkey
      canDeleteSshKey(){
        let self = this, uuidList = [];
        if (self.windowData.selectList.length !==1 ) return false;
        uuidList = self.windowData.selectList.map((item) => item.uuid);
        return Strategy.canDeleteSshKeyList(uuidList, self.vm)
      },
      //判断是否可以设置sshkey
      canSetSshKey(){
        let self = this, uuidList = [];
        if (self.windowData.selectList.length !==1 ) return false;
        uuidList = self.windowData.selectList.map((item) => item.uuid);
        return Strategy.canSetSshKey(self.vm[uuidList[0]])
      },
      //添加sshKey
      vmsetVmSshKey(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        self.vmSSHKeyMessage ={
          uuidList: uuidList
        };
        self.showVmSSHKeyDlg = true;
      },
      closeVmSSHKeyDlg(param){
        let self = this;
        if(param){
          self.setVmSshKey(param.uuidList[0], param.msg)
        }
        self.showVmSSHKeyDlg = false;
      },
      //设置高可用
      canSetHa(){
        let self = this, uuidList = [];
        if (this.windowData.selectList.length <=0) return false;
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        return Strategy.canSetHaList(uuidList, this.vm, this.dbData.common.haEnabled)
      },
      //设置高可用只有停止或者运行状态的才可以设置
      vmSetHaLevel(){
        let self = this , uuidList = [],selectUuidList = [];
        uuidList = self.windowData.selectList.map((item) =>{
          return item.uuid;
        });
        uuidList.forEach((item) => {
          if (self.dbData.vm[item].state === 'Stopped' || self.dbData.vm[item].state === 'Running') selectUuidList.push(item)
        });
        if (_.isUndefined(selectUuidList)) return;
        if (!_.isArray(selectUuidList)) {
          selectUuidList = [selectUuidList]
        }
        let defaultValue = 'None';
        if (selectUuidList.length === 1) {
          defaultValue = this.vm[selectUuidList[0]].ha === 'NeverStop' ? this.vm[selectUuidList[0]].ha : 'None'
        }
        self.haLevelMessage ={
          selectUuidList: selectUuidList,
          haLevel: defaultValue,
        };
        self.showHaLevelDlg = true;
      },
      //关闭高可用弹框
      closeHaLevelDlg(param){
        let self = this;
        if(param){
          self.updateHaLevel(param.selectUuidList, param.haLevel);
        }
        self.showHaLevelDlg = false;
      },
      canDeleteSshKey(){
        let uuidList = [];
        if (this.windowData.selectList.length!==1) return false;
        uuidList = this.windowData.selectList.map((item)=>{
          return item.uuid;
        });
        return Strategy.canDeleteSshKeyList(uuidList, this.vm)
      },
      //删除sshKey
      vmDeleteVmSshKey(){
        let uuidList = [], self = this;
        if (this.windowData.selectList.length!==1) return;
        uuidList = this.windowData.selectList.map((item)=>{
          return item.uuid;
        });
        self.normalVmInstanceMessage.confirmDlgType = 'DeleteSshKey';
        self.normalVmInstanceMessage.uuidList = uuidList;
        self.showNormalVmInstanceDlg = true;
      },
      canReimage(){
        let self = this, uuidList = [];
        if (this.windowData.selectList.length!==1) return false;
        uuidList = this.windowData.selectList.map((item)=>{
          return item.uuid;
        });
        return Strategy.canReimage(self.vm[uuidList[0]], self.dbData.primarystorage, self.dbData.common.isAdmin)
      },
      //重启云主机
      vmReimage(){
        let uuidList = [], self = this;
        if (this.windowData.selectList.length!==1) return;
        uuidList = this.windowData.selectList.map((item)=>{
          return item.uuid;
        });
        self.normalVmInstanceMessage.confirmDlgType = 'Reimage';
        self.normalVmInstanceMessage.uuidList = uuidList;
        self.showNormalVmInstanceDlg = true;
      },
      //设置相关的回调
      closeSetModelDlg(param){
        let self = this,enable;
        if(param){
          switch(param.type){
            case 'RDP-MODE':
              enable = param.value === 'On';
              self.setRdpMode(param.uuidList, enable);
            break;
            case 'USB-REDIRECT':
              enable = param.value === 'On';
              self.setUsbRedirect(param.uuidList, enable);
            break;
            case 'TOGGLE_CONSOLE_MODE':
            self.toggleConsoleMode(param.uuidList, param.value);
            break;
          }
        }
        self.showSetModeDlg = false;
      },
      //设置rdp模式
      vmSetRdpMode(){
        let self = this, uuidList = [];
        uuidList = this.windowData.selectList.map((item)=>{
          return item.uuid;
        });
        self.setModeMessage ={
          uuidList: uuidList,
          title: 'RDP-MODE',
          label: 'rdpMode',
          value: ['On', 'Off'],
          type: 'RDP-MODE',
          defaultVal: 'On'
        };
        self.showSetModeDlg = true;
      },
      //设置USB重定向
      vmSetUsbRedirect(){
        let self = this, uuidList = [];
        uuidList = this.windowData.selectList.map((item)=>{
          return item.uuid;
        });
        self.setModeMessage ={
          uuidList: uuidList,
          title: 'USB-REDIRECT',
          label: 'usbRedirect',
          value: ['On', 'Off'],
          type: 'USB-REDIRECT',
          defaultVal: 'On'
        };
        self.showSetModeDlg = true;
      },
      //判断是否可以切换控制台模式
      canSetConsoleMode(){
        let self = this, uuidList = [];
        uuidList = this.windowData.selectList.map((item)=>{
          return item.uuid;
        });
        if(uuidList.length >=0 ) return true;
      },
      //切换控制台模式
      vmSetConsoleModeDlg(){
        let self = this, uuidList = [];
        uuidList = this.windowData.selectList.map((item)=>{
          return item.uuid;
        });
        self.setModeMessage ={
          uuidList: uuidList,
          title: 'TOGGLE_CONSOLE_MODE',
          label: 'consoleMode',
          value: ['vnc', 'spice'],
          type: 'TOGGLE_CONSOLE_MODE',
          defaultVal: self.vm[uuidList[0]].vmConsoleMode === 'vnc' ? 'vnc' : 'spice'
        };
        self.showSetModeDlg = true;
      },
      //是否可以创建云主机镜像
      canCreateImage(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        if (self.windowData.selectList.length !== 1) return false;
        return Strategy.canCreateImage(this.vm[uuidList[0]], this.bsListInCurrentZone)
      },
      //关闭添加云主机镜像
      closeCreateImage(param){
        let self = this;
        if(param){
          param.vmUuid = self.model.uuid;
          param.volumeUuid = self.model.rootVolumeUuid;
          this.createImage(param)
        }
        self.showCreateVmImage = false;
      },
      listOpenStorageMigrateDlg () {
        let self = this;
        if (!self.isSingleSelected) return
        let vmUuid = self.selectedList[0]
        self.openStorageMigrateDlg(vmUuid)
      },
      canStorageMigrate () {
        if (!this.isSingleSelected) return false
        return Strategy.canStorageMigrate(this.vm[this.selectedList[0]], this.dbData.primarystorage, this.dbData.common.isAdmin)
      },
      vmCreateImage(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        self.createVmImageMessage ={
          vmUuid: uuidList[0]
        };
        self.showCreateVmImage = true;
        self.$emit('showCreateVmImageFun', {showVmImage: self.showCreateVmImage, createVmImagMessage: self.createVmImageMessage});
      },
      closeCreateImage(param){
        let self = this;
        if(param){
          param.volumeUuid = this.vm[param.vmUuid].rootVolumeUuid;
          //创建云主机镜像在Methods中
          this.createImage(param);
        }
        self.showCreateVmImage = false;
      },
      //判断能否绑定云盘只能单选
      canAttachVolume(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        if(uuidList.length !== 1) return false;
        return Strategy.canAttachVolume(self.vm[uuidList[0]]);
      },
      //关闭绑定云盘弹框并执行逻辑
      closeAttachVolumeDlg(param){
        let self = this;
       if(param){
         switch (param.type) {
           case 'load':
             self.handleAttachVolume(param);
             break;
           case 'unload':
             self.handleDetachVolume(param);
             break;
         }
       }
       self.showAttachVolumeDlg = false;
      },
      //处理加载云盘
      handleAttachVolume(param){
        let self = this;
        if(param.volumeUuidList.length <=0) return;
          self.attachDataVolumeToVm(param.volumeUuidList, param.selectUuidList[0])
          .then(() => {
            return self.dispatchAction('vm/query', {
              q: `uuid=${param.selectUuidList[0]}`
            }).then(() => {
              return self.dispatchAction('vm/getExtraData', param.selectUuidList[0])
            })
          });
        self.showAttachVolumeDlg = false;
      },
      //处理卸载云盘
      handleDetachVolume(param){
        let self = this;
        self.normalConfirmMessage ={
          title: 'volume.detach',
          description: 'vm.detachVolume',
          uuidList: param.volumeUuidList,
          icon: 'volume_n',
          warning: 'vm.detachVolumeWarning',
          getName: uuid => self.dbData.volume[uuid].name,
          uuid:param.selectUuidList[0]
        };
        self.showNormalConfirmDlg = true;
      },
      //加载云盘
      vmloadVolume(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        self.attachVolumeMessage ={
          uuid: uuidList,
          type: 'load'
        };
        self.showAttachVolumeDlg = true;
      },
      //是否可以云主机卸载云盘只能单选
      canDetachVolume () {
        let self = this, uuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        if(uuidList.length !== 1) return false;
        return Strategy.canDetachVolume(self.vm[uuidList[0]])
      },
      //
      vmUnloadVolume(){
        let self = this,uuid,
          volumeList = [], taskList = [],
          uuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        uuid = uuidList[0];
        let p = rpc.query('volumes', {
          q: `vmInstanceUuid=${uuid}`,
          fields: 'uuid'
        }).then(resp => {
          volumeList = volumeList.concat(resp.inventories.map(item => item.uuid))
        });
        taskList.push(p);
        p = rpc.query('volumes/vm-instances/refs', {
          q: `vmInstanceUuid=${uuid}`,
          fields: 'volumeUuid'
        }).then(resp => {
          volumeList = volumeList.concat(resp.inventories.map(item => item.volumeUuid))
        });
        Promise.all(taskList).then(() => {
          _.uniq(volumeList);
          self.attachVolumeMessage = {
            conditions:[`uuid?=${volumeList}`, 'type=Data'],
            type: 'unload',
            uuid: uuid
          };
          self.showAttachVolumeDlg = true;
        })
      },
      //判断是否加载ISO镜像
      canAttachIso(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        if(uuidList.length !== 1) return false;
        return Strategy.canAttachIso(self.vm[uuidList[0]]);
      },
      //加载ISO
      vmloadISO(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        self.isoImageMessage ={
          vmInstanceUuid:uuidList
        };
        self.updateWindow({
          vmInstanceUuid:uuidList
        });
       self.showIsoImageSingleDlg = true;
      },
      //处理弹框关闭后的回调
      closeIsoImageSingleDlg(param){
        let self = this;
        if(param){
          self.attachISOToVmInstance([param.uuid], self.windowData.vmInstanceUuid)
        }
        self.showIsoImageSingleDlg = false;
      },
      canDetachIso(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        if(uuidList.length !==1) return false;
        return Strategy.canDetachIso(self.vm[uuidList[0]]);
      },
      vmUnloadISO(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        self.updateWindow({
          vmInstanceUuid: uuidList[0]
        });
        self.detachIsoImageMessage={
          vmInstanceUuid: uuidList[0]
        };
        self.showDetachIsoImageDlg = true;
      },
      closeDetachIsoImageDlg(param){
        let self = this;
        if(param){
          self.openDialog('ConfirmDlg', {
            title: 'common.detachISO',
            description: 'vm.detachISO',
            uuidList: param.uuid,
            icon: 'image_n',
            warning: 'vm.detachISOWarning',
            getName: uuid => self.dbData.image[uuid].name,
            ok: () => {
              self.detachISOFromVmInstance(param.uuid, self.windowData.vmInstanceUuid)
                .then(() => {
                  self.$forceUpdate()
                })
            }
          })
        }
        self.showDetachIsoImageDlg = false;
      },
      //是否可以设置启动个顺序
      canSetBootOrder(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        if(uuidList.length !==1) return false;
        return Strategy.canSetBootOrder(self.vm[uuidList[0]]);
      },
      //设置控制台密码
      canSetConsolePassword(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        if(uuidList.length !== 1) return false;
        return Strategy.canSetConsolePassword(self.vm[uuidList[0]]);
      },
      //设置密码
      closeSetConsolePasswordDlg(param){
         let self = this;
         if(param){
           self.setVmConsolePassword(self.windowData.vmUuidList, param.newPassword, param.isReboot)
         }
         self.showSetConsolePasswordDlg = false;
      },
      vmSetVmConsolePassword(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        self.updateWindow({
          vmUuidList: uuidList[0]
        });
        self.setConsolePasswordMessage ={
          state: self.dbData.vm[uuidList[0]].state,
        };
        self.showSetConsolePasswordDlg = true;
      },
      //判断能否更换系统
      canChangeVmImage(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        if(uuidList.length !==1) return false;
        return Strategy.canChangeVmImage(self.vm[uuidList[0]])
      },
      //更换系统
      vmChangeVmImage(){
        let _this = this, uuidList = [];
         uuidList = _this.windowData.selectList.map((item) => {
          return item.uuid;
        });
        if(uuidList.length !==1) return;
        _this.openDialog('VMChangeImageConfirmDlg', {
          ok: () => {
            rpc.query(`vm-instances/${uuidList[0]}/image-candidates`)
               .then(resp => {
                let imageUuidList = []
                if (resp.inventories && resp.inventories.length > 0) {
                  imageUuidList = resp.inventories.map((item) => item.uuid)
                }
                _this.openDialog('VirtualRouterImageAndImageSingleSelectListDlg', {
                  conditions: [`uuid?=${imageUuidList}`],
                  withTab: true,
                  select: (imageUuid) => {
                     _this.changeVmImage(uuidList[0], imageUuid)
                  }
                 })
               })
          }
        })
      },
      closeChangeVmImageDlg(){
        let self = this;
        self.showChangeVmImageDlg = false;
      },
      //能否设置云主机密码
      canSetVmPassword(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        if(uuidList.length !==1) return false;
        return Strategy.canSetVmPassword(self.vm[uuidList[0]]);
      },
      //设置云主机密码
      vmSetVmPassword(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        self.updateWindow({
          vmUuidList: uuidList[0]
        });
        self.showSetVmPasswordDlg = true;
      },
      //关闭设置云主机密码的回调
      closeSetVmPasswordDlg(param){
        let self = this;
        if(param){
          self.setVmPassword(self.windowData.vmUuidList[0], param.account, param.password)
        }
        self.showSetVmPasswordDlg = false;
      },
      //判断是否可以绑定亲和组
      canJoinAffinityGroup(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        if(uuidList.length !==1) return false;
        return Strategy.canJoinAffinityGroup(self.vm[uuidList[0]]);
      },
      //绑定亲和组
      async vmJoinAffinityGroup(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        self.updateWindow({
          vmUuidList: uuidList[0]
        });
        let affinityGroupUuids = await self.getCandidateAffinityGroupForVmAttaching(self.windowData.vmUuidList);
        self.affinityMessage = {
          conditions: [`uuid?=${affinityGroupUuids}`],
        };
        self.showAffinitySingleDlg = true;
      },
      //绑定亲和组的回调
      closeAffinitySingleDlg(param){
        let self = this;
        if(param){
          self.joinAffinityGroup(self.windowData.vmUuidList, param);
        }
        self.showAffinitySingleDlg = false;
      },
      //判断是否能够修改计算规格
      canChangeConfig(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        if(uuidList.length <= 0) return false;
        return Strategy.canChangeConfigListLoose(uuidList, self.vm, self.dbData.common.numa)
      },
      //修改计算规格
      vmChangeInstanceOffering(){
        let self = this, uuidList = [];
        if (!self.windowData.selectList || self.windowData.selectList.length <= 0) return;
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        uuidList = _.filter(uuidList, (uuid) => {
          return Strategy.canChangeConfig(self.vm[uuid], self.dbData.common.numa)
        });
        self.updateWindow({
          vmUuidList: uuidList
        });
        if (uuidList.length > 0) {
          let instanceOfferingUuid = _.get(self.vm, [uuidList[0], 'instanceOfferingUuid']);
          instanceOfferingUuid = _.every(uuidList, (uuid) => _.get(self.vm, [`${uuid}`, 'instanceOfferingUuid']) === instanceOfferingUuid) ? instanceOfferingUuid : '';
          let conditions = ['state!=Disabled', 'type=UserVm'];
          if (instanceOfferingUuid) conditions.push(`uuid!=${instanceOfferingUuid}`);
          self.instanceOfferingMessage = {
            conditions: conditions
          };
          self.showInstanceOfferingSingleDlg = true;
        }
      },
      closeInstanceOfferingSingleDlg(param){
        let self = this, uuidList = [];
        if(param){
          let list = _.filter(self.windowData.vmUuidList, (vmUuid) => {
            return _.get(self.vm, [`${vmUuid}`, 'instanceOfferingUuid']) !== param.uuid;
          });
          if (list.length === 0) return;
          self.changeInstanceOffering(list, param.uuid)
        }
        self.showInstanceOfferingSingleDlg = false;
      },
      //判断是否可以启动云主机
      canStartFromHost(){
        let self = this, uuidList = [];
        if (!self.windowData.selectList || self.windowData.selectList.length <= 0) return;
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        if(uuidList.length !==1) return false;
        return Strategy.canStartFromHost(this.vm[uuidList[0]], this.dbData.primarystorage, this.dbData.common.isAdmin)
      },
      //启动指定物理机
      vmStartFromHost(){
        let self = this, uuidList = [], uuid, pciDeviceUuidList= [], usbDeviceUuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        uuid = self.windowData.selectList[0].uuid;
        pciDeviceUuidList = self.windowData.selectList[0].pciDeviceUuidList;
        pciDeviceUuidList = self.windowData.selectList[0].usbDeviceUuidList;
        let hasPciDevice = _.isArray(pciDeviceUuidList) && pciDeviceUuidList.length > 0;
        let hasUsbDevice = _.isArray(usbDeviceUuidList) && usbDeviceUuidList.length > 0;
        self.updateWindow({
          vmUuidList: uuid
        });
        self.hostMessage ={
          uuid: uuid,
          type: 'start'
        };
        self.showHostSingleDlg = true;
      },
      //是否可以删除控制台密码
      canDeleteVmConsolePassword(){
        let self = this, uuidList = [];
        if (!self.windowData.selectList || self.windowData.selectList.length <= 0) return;
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        if(uuidList.length !==1) return false;
        return Strategy.canDeleteVmConsolePassword(this.vm[uuidList[0]])
      },
      vmDeleteVmConsolePassword(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
          self.normalVmInstanceMessage = {
          'confirmDlgType': 'DeleteConsolePassword',
          uuidList,
          };
        self.showNormalVmInstanceDlg = true;
      },
      //判断是否可以绑定亲和组
      canLeaveAffinityGroup(){
        let self = this, uuidList = [];
        if (!self.windowData.selectList || self.windowData.selectList.length <= 0) return;
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        if(uuidList.length !==1) return false;
        return Strategy.canLeaveAffinityGroup(this.vm[uuidList[0]])
      },
      vmLeaveAffinityGroup(){
        let self = this, uuidList = [];
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        self.normalVmInstanceMessage = {
          'confirmDlgType': 'LeaveAffinity',
          uuidList,
        };
        self.showNormalVmInstanceDlg = true;
      },
      //判断是否可以系统扩容
      canResizeRootVolume(){
        let self = this, uuidList = [];
        if (!self.windowData.selectList || self.windowData.selectList.length <= 0) return;
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        if(uuidList.length !==1) return false;
        return Strategy.canResizeRootVolume(this.vm[uuidList[0]])
      },
      //系统扩容操作
      vmResizeRootVolume(){
        let self = this, uuidList = [];
        if (!self.windowData.selectList || self.windowData.selectList.length <= 0) return;
        uuidList = self.windowData.selectList.map((item) => {
          return item.uuid;
        });
        self.updateWindow({
          vmUuid: uuidList[0]
        });
        let rootVolume = self.getRootVolume(self.windowData.vmUuid);
        self.vmResizeRVMessage = {
          rootVolume
        };
        self.showVmResizeRVDlg = true;
      },
      //系统扩容回调
      closeVmResizeRVDlg(param){
        let self = this;
        if(param){
          self.resizeRootVolume(self.windowData.vmUuid, param.uuid, param.size).then(() => self.queryList())
        }
        self.showVmResizeRVDlg = false;
      },
      //判断是否可以更改所有者
      canChangeResourceOwner(){
        if (this.windowData.selectList.length <= 0) return false;
        let uuidList = this.windowData.selectList.map((item) => {
          return item.uuid;
        });
        return Strategy.canChangeResourceOwnerList(uuidList, this.vm)
      },
      //处理更改所有者操作
      vmChangeResourceOwner(){
        let self = this, selectedList = [];
        selectedList = self.windowData.selectList.map((item) => {
          return  item.uuid;
        });
        self.changeResourceOwnerDlg(selectedList, self.changeResourceToAccountOrProject, undefined, true)
      },
      queryAllList: async function () {
        let event = this.createEvent('vm.action.queryAllList', undefined, undefined, '', 'NotApiCall');
        let ret = await this.dispatchAction('vm/pureQuery', {
          q: this.getCondition(),
        }, {root: true});
        let vmArray = this.get(ret.uuidList);
        await this.dispatchAction('vm/queryRelatedDataForCsv', vmArray);
        vmArray = this.get(ret.uuidList);
        this.setEventSuccess(event);
        return vmArray
      },
      closeVmChangeROToAProjDlg(){
        let self = this;
        self.showVmChangeROToAProjDlg = false;
      },
      ...{
        updateVolumeVms: VolumeMethods.methods.updateVolumeVms
      },
      inStates () {
        let self = this, states = [];
        for (let arg in arguments) {
          states.push(arguments[arg]);
        }
        let instate = self.selectList.every( (item) => {
          return states.some( (state) => {
            return item.state === state;
          })
        })
        return instate;
      }
    },
    watch: {
      itemList () {
        let self = this;
        return self.get(self.windowData.uuidList);
      }
    }
  }
</script>
