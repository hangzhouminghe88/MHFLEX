<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>
          {{$t('scheduler.create')}}
        </span>
      <span class="create-back" @click="$router.push({name: 'schedulerjob'})">
        <i class="el-icon-back"></i>回到定时任务列表
      </span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row" v-if="resourceType === 'vm'">
        <div class="title required">{{$t('common.vm')}}</div>
        <div class="text">{{dbData.vm[$route.params.resourceUuid] && dbData.vm[$route.params.resourceUuid].name}}</div>
      </div>
      <div class="operation-row" v-if="resourceType === 'timer'">
        <div class="title required">{{$t('common.timer')}}</div>
        <div class="text">{{dbData.timer[$route.params.resourceUuid] && dbData.timer[$route.params.resourceUuid].name}}</div>
      </div>
      <div class="operation-row" v-if="resourceType === 'volume'">
        <div class="title required">{{$t('common.volume')}}</div>
        <div class="text">{{dbData.volume[$route.params.resourceUuid] && dbData.volume[$route.params.resourceUuid].name}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <input type="text" v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')"/>
        <div class="error error-text" v-if="emptyname">{{$t('common.name')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.task')}}</div>
        <el-select v-model="schedulerText" style="width: 100%;">
          <el-option v-if="resourceType === 'trigger' || resourceType ==='vm' || resourceType === 'timer'" @click.native="selectOption($event, 'startVm')" :value="$t('common.startInstance')">{{ $t("common.startInstance") }}</el-option>
          <el-option v-if="resourceType === 'trigger' || resourceType ==='vm' || resourceType === 'timer'" @click.native="selectOption($event, 'stopVm')" :value="$t('common.stopInstance')">{{ $t("common.stopInstance") }}</el-option>
          <el-option v-if="resourceType === 'trigger' || resourceType ==='vm' || resourceType === 'timer'" @click.native="selectOption($event, 'rebootVm')" :value="$t('common.rebootInstance')">{{ $t("common.rebootInstance") }}</el-option>
          <el-option v-if="resourceType === 'trigger' || resourceType ==='vm' || resourceType === 'timer'" @click.native="selectOption($event, 'volumeSnapshot')" :value="$t('common.vmSnapshot')">{{ $t("common.vmSnapshot") }}</el-option>
          <el-option v-if="resourceType === 'trigger' || resourceType === 'volume' || resourceType === 'timer'"
             @click="selectOption($event, 'volumeSnapshot')" :value="$t('common.volumeSnapshot')">{{ $t("common.volumeSnapshot") }}</el-option>
        </el-select>
        <!--<drop-down class="create-dropdown dropdown">-->
          <!--<span slot="title">-->
            <!--<span class="text">{{schedulerText}}</span>-->
          <!--</span>-->
          <!--<span slot="content">-->
            <!--<div class="dropdown-content">-->
              <!--<a v-if="resourceType === 'trigger' || resourceType ==='vm' || resourceType === 'timer'" @click="selectOption($event, 'startVm')">{{ $t("common.startInstance") }}</a>-->
              <!--<a v-if="resourceType === 'trigger' || resourceType ==='vm' || resourceType === 'timer'" @click="selectOption($event, 'stopVm')">{{ $t("common.stopInstance") }}</a>-->
              <!--<a v-if="resourceType === 'trigger' || resourceType ==='vm' || resourceType === 'timer'" @click="selectOption($event, 'rebootVm')">{{ $t("common.rebootInstance") }}</a>-->
              <!--<a v-if="resourceType === 'trigger' || resourceType ==='vm' || resourceType === 'timer'" @click="selectOption($event, 'volumeSnapshot')">{{ $t("common.vmSnapshot") }}</a>-->
              <!--<a v-if="resourceType === 'trigger' || resourceType === 'volume' || resourceType === 'timer'"-->
                 <!--@click="selectOption($event, 'volumeSnapshot')">{{ $t("common.volumeSnapshot") }}</a>-->
            <!--</div>-->
          <!--</span>-->
        <!--</drop-down>-->
      </div>
      <div class="operation-row" v-if="isVm && resourceType !== 'vm'">
        <div class="title required">{{$t('common.vm')}}</div>
        <div v-for="(uuid, index) in vmUuidList" :key="index">
          <add-or-delete-input :value="dbData.vm[uuid].name"
                               @remove="removeUuid($event, 'vmUuid',uuid)"></add-or-delete-input>
        </div>
        <add-or-delete-input @open="openVMSingleSelectDlg()" :class="{'is-error': emptyvmUuidList}"></add-or-delete-input>
        <div class="error error-text" v-if="emptyvmUuidList">{{$t('common.vm')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row" v-if="!isVm && resourceType !== 'volume'">
        <div class="title required">{{$t('common.volume')}}</div>
        <div v-for="(uuid, index) in volumeUuidList" :key="index">
          <add-or-delete-input :value="dbData.volume[uuid].name"
                               @remove="removeUuid($event, 'volumeUuid',uuid)"></add-or-delete-input>
        </div>
        <add-or-delete-input @open="openVolumeDlg()" :class="{'is-error': emptyvolumeUuidList}"></add-or-delete-input>
        <div class="error error-text" v-if="emptyvolumeUuidList">{{$t('common.volume')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row" v-if="maxSnapshow">
        <div class="title required">{{$t("scheduler.maxSnapshot")}}({{$t("scheduler.maxSnapshotTip")}})</div>
        <input type="text" :placeholder="maxSnapshowPlaceHolder" v-model="maxSnapshot"
               :class="{'is-error': emptymaxSnapshot}"
               @blur="validate('maxSnapshot')"/>
        <div class="error error-text" v-if="(isAllCephVolume || isVm && isAllCephVm) && !emptymaxSnapshot && invalidmaxSnapshot">
          {{$t("error.invalid")+$t("scheduler.maxSnapshot")}}
        </div>
        <div class="error error-text" v-if="(isAllCephVolume || isVm && isAllCephVm) && emptymaxSnapshot">
          {{$t("error.emptyInput")+$t("scheduler.maxSnapshot")}}
        </div>
      </div>
      <div class="operation-row" v-if="resourceType !== 'timer'">
        <div class="title">{{$t('common.timer')}}</div>
        <add-or-delete-input @open="openTimerDlg()" :value="dbData.timer[timerUuid] && dbData.timer[timerUuid].name"
                             @remove="removeUuid($event, '', '')"
                             :class="{'is-error': emptytimerUuid}"></add-or-delete-input>
        <div class="error error-text" v-if="emptytimerUuid">{{$t('common.timer')}}{{$t('error.noEmpty')}}</div>
      </div>
    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push({name: 'schedulerjob'})">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import CreateTemplate from "../../component/CreateTemplate";
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";
  import WindowBase from 'src/windows/Window';
  import SchedulerMethods from 'src/om/schedulerjob/Methods';
  import validator from 'src/utils/validator';

  export default {
    name: "CreateScheduler",
    mixins: [WindowBase],
    components: {AddOrDeleteInput, CreateTemplate},
    data() {
      /*
      * "startVm": "启动云主机",
    "stopVm": "停止云主机",
    "rebootVm": "重启云主机",
      * */
      return {
        name: '',
        resourceType: 'vm',
        resourceUuid: '',
        maxSnapshot: 1,
        maxSnapshowPlaceHolder: this.$t('scheduler.maxSnapshotPlaceholder'),
        schedulerText: this.$t('timer.startVm'),
        maxSnapshow: false,
        type: 'startVm',
        isVm: true,
        volumeUuidList: [],
        vmUuidList: [],
        isAllCephVm: false,
        isAllCephVolue: false,
        timerUuid: '',
        emptyname: '',
        emptymaxSnapshot: false,
        emptyvolumeUuidList: false,
        emptyvmUuidList: false,
        emptytimerUuid: false,
        invalidmaxSnapshot: false,
        invalidInput: false,
        canCreate: true,
        isAllCephVolume: false
      }
    },
    mounted() {
      let self = this;
      if (self.$route.params.resourceUuid) {
        self.resourceType = self.$route.params.resourceType;
        self.resourceUuid = self.$route.params.resourceUuid;
        self.resourceType === 'volume' ? self.isVm = false : self.isVm = true;
        self.resourceType === 'volume' ? self.schedulerText = self.$t('common.volumeSnapshot') : '';
        self.initResourceUuid(self.resourceType);
      } else {
        self.resourceType = 'trigger'
        self.resourceUuid = ''
        self.vmUuidList = []
        self.volumeUuidList = []
        self.isVm = true
        self.type = 'startVm'
        self.schedulerText = this.$t('common.startInstance')
      }
    },
    methods: {
      ...validator,
      ...{
        create: SchedulerMethods.methods.create
      },
      initResourceUuid(type){
        let self = this;
        if(!self.resourceUuid) return;
        switch (type) {
          case 'vm':
            self.vmUuidList.push(self.resourceUuid);
            break;
          case 'volume':
            self.volumeUuidList.push(self.resourceUuid);
            break;
          case  'timer':
            self.timerUuid = self.resourceUuid;
            break;
        }
      },
      selectOption(event, type) {
        let self = this;
        if (event.target) {
          self.schedulerText = event.target.innerText;
        }
        if (type === 'volumeSnapshot' || type === 'vmSnapshot') {
          self.maxSnapshow = true;
        } else {
          self.maxSnapshow = false;
        }
        type === 'volumeSnapshot' ? self.isVm = false : self.isVm = true;
        self.type = type;
        self.volumeUuidList = [];
      },
      openVMSingleSelectDlg() {
        let self = this;
        self.openDialog('VmInstanceMultiSelectListDlg', {
          conditions: [`uuid!?=${this.vmUuidList}`, 'state!=Destroyed'],
          select: (uuidList) => self.selectVm(uuidList)
        })
      },
      selectVm(uuidList) {
        let vmUuidList = uuidList, self = this;
        if (this.vmUuidList.length > 0) vmUuidList = this.vmUuidList.concat(uuidList)
        this.volumeUuidList = [];
        this.isAllCephVmFun(vmUuidList);
        self.vmUuidList = vmUuidList;
        this.validate('vmUuidList')
      },
      removeUuid($event, resourceName, uuid) {
        let self = this;
        if (resourceName === 'vmUuid') {
          let uuidList = _.cloneDeep(this.vmUuidList)
          let selectVmUuidList = uuidList.filter((i) => i !== uuid)
          this.isAllCephVmFun(selectVmUuidList)
          self.vmUuidList = selectVmUuidList
          this.validate('vmUuidList')
        }
        if (resourceName === 'volumeUuid') {
          let uuidList = _.cloneDeep(this.volumeUuidList)
          let selectVolumeUuidList = uuidList.filter((i) => i !== uuid)
          this.isAllCephVolumeFun(selectVolumeUuidList)
          this.volumeUuidList = selectVolumeUuidList
          this.validate('volumeUuidList')
        }
        self.timerUuid = '';
        self.validate('timerUuid');
      },
      validate(name) {
        let self = this;
        self[`empty${name}`] = false
        let input = name === 'name' ? String(self[name]).trim() : self[name]
        if (name.indexOf('UuidList') > -1) {
          input = self[name].length
        }
        if (!input) {
          self[`empty${name}`] = true
          return
        }
        if (name === 'maxSnapshot') {
          let range = {
            maxValue: 32,
            minValue: 1
          }
          if (self.isUint(input) && self.isIn(input, range)) self[`invalid${name}`] = false
          else self[`invalid${name}`] = true
        }
      },
      isAllCephVmFun(uuidList) {
        let isAllCephVm = true, self = this;
        if (uuidList.length === 0) isAllCephVm = false
        uuidList.forEach((uuid) => {
          let primaryStorageUuid = this.dbData.vm[uuid].allVolumes.filter(volume => volume.type === 'Root')[0].primaryStorageUuid
          if (this.dbData.primarystorage[primaryStorageUuid].type !== 'Ceph') isAllCephVm = false
        })
        self.isAllCephVm = isAllCephVm;
      },
      isAllCephVolumeFun(uuidList) {
        let isAllCephVolume = true, self = this;
        if (uuidList.length === 0) isAllCephVolume = false
        uuidList.forEach((uuid) => {
          if (this.dbData.primarystorage[this.dbData.volume[uuid].primaryStorageUuid].type !== 'Ceph') isAllCephVolume = false
        })
        self.isAllCephVolume = isAllCephVolume;
      },
      openTimerDlg() {
        let self = this;
        self.openDialog('AttachSchedulerJobDlg', {
          select: (uuid) => self.selectTimer(uuid)
        })
      },
      selectTimer(uuid) {
        let self = this;
        self.timerUuid = uuid;
        self.validate('timerUuid');
      },
      openVolumeDlg() {
        let self = this;
        self.openDialog('VolumeSelectListForJob', {
          conditions: [`uuid!?=${this.volumeUuidList}`, 'type=Data'],
          select: (uuidList) => self.selectVolume(uuidList)
        })
      },
      selectVolume(uuidList) {
        let volumeUuidList = uuidList, self = this;
        if (this.volumeUuidList.length > 0) volumeUuidList = this.volumeUuidList.concat(uuidList)
        self.vmUuidList = []
        this.isAllCephVolumeFun(volumeUuidList)
        self.volumeUuidList = volumeUuidList
        this.validate('volumeUuidList')
      },
      validateAll () {
        let self = this;
        self.invalidInput = false
        let props = ['name']
        if (self.isVm) {
          props.push('vmUuidList')
          if (this.type === 'volumeSnapshot') {
            this.isAllCephVmFun(self.vmUuidList)
            if (self.isAllCephVm) props.push('maxSnapshot')
          }
        }
        if (!self.isVm) {
          props.push('volumeUuidList')
          if (self.type === 'volumeSnapshot') {
            self.isAllCephVolumeFun(self.volumeUuidList)
            if (self.isAllCephVolume) props.push('maxSnapshot')
          }
        }
        props.forEach(item => self.validate(item))
        let isInvalid = props.some(item => this[`empty${item}`] || this[`invalid${item}`])
        if (isInvalid) self.invalidInput = true
      },
      createParam(){
        if (this.vmUuidList.length !== 0) (this.resourceType === 'vm' && this.resourceUuid) ? this.targetResourceUuid = [this.resourceUuid] : this.targetResourceUuid = this.vmUuidList;
        if (this.volumeUuidList.length !== 0) (this.resourceType === 'volume' && this.resourceUuid) ? this.targetResourceUuid = [this.resourceUuid] : this.targetResourceUuid = this.volumeUuidList
        let paramList = []
        let uuidList = this.targetResourceUuid
        uuidList.forEach((uuid) => {
          let obj = {
            name: this.name,
            type: this.type
          }
          if (this.isVm && this.type === 'volumeSnapshot') obj.targetResourceUuid = this.dbData.vm[uuid].rootVolumeUuid
          else obj.targetResourceUuid = uuid
          if (this.type.indexOf('Snapshot') > -1 && this.maxSnapshot) {
            let parameters = { snapshotMaxNumber: String(this.maxSnapshot).trim() }
            obj.parameters = parameters
          }
          paramList.push(obj)
        })
        return {
          paramList,
          triggerUuid: this.timerUuid
        }
      },
      confirm(){
        let self = this;
        self.validateAll();
        self.canCreate = false;
        if(self.invalidInput) return;
        self.create(self.createParam())
            .then(() => {
              self.$router.push({name: 'schedulerjob'});
            }).catch(() => {
              self.canCreate = true;
            })
      }
    }
  }
</script>

<style scoped>

</style>
