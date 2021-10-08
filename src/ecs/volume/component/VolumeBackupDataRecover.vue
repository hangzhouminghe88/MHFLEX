<template>
  <create-template-no-route>
    <div slot="header">
      <span>{{$t('backupData.recoveryBackupData')}}</span>
      <span class="create-back el-icon-back" @click="$emit('close')">
        返回
      </span>
    </div>

    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">
          {{$t('backupData.recoveryPolicy')}}
        </div>
        <el-radio-group v-model="policyType">
          <el-radio label="new">{{$t('backupData.new')}}</el-radio>
          <el-radio label="overlap">{{$t('backupData.overlap')}}</el-radio>
        </el-radio-group>
      </div>
      <div class="operation-row" v-if="policyType === 'new'">
        <div class="title required">
          {{$t('common.name')}}
        </div>
        <input type="text" maxlength="255" v-model="name" :class="{'is-error': emptyname}" @blur="validate('name')"/>
        <div class="error error-text" v-if="emptyname">{{ $t('error.emptyInput') + $t('common.name')}}</div>
      </div>
      <div class="operation-row" v-if="policyType === 'new'">
        <div class="title">
          {{$t('common.description')}}
        </div>
        <textarea rows="3" maxlength="255" v-model="description"/>
      </div>
      <div class="operation-row" v-if="policyType === 'new'">
        <div class="title required">
          {{$t('common.vm')}}
        </div>
        <add-or-delete-input :value="dbData.vm[vmUuid] && dbData.vm[vmUuid].name"
                             @open="openVmSelect"
                             @remove="removeUuid('vmUuid')"
                             :class="{'is-error': emptyvmUuid}"
        />
        <div class="error error-text" v-if="emptyvmUuid">{{$t('error.unselected') + $t('common.vm')}}</div>
      </div>
      <div class="operation-row" v-if="policyType === 'new'">
        <div class="title required">
          {{$t('common.primarystorage')}}
        </div>
        <add-or-delete-input
          :value="dbData.primarystorage[primarystorageUuid] && dbData.primarystorage[primarystorageUuid].name"
          @open="openPrimaryStorageSelect"
          @remove="removeUuid('primarystorageUuid')"
          :class="{'is-error': emptyprimarystorageUuid}"
        />
        <div class="error error-text" v-if="emptyprimarystorageUuid">{{$t('error.unselected') +
          $t('common.primarystorage')}}
        </div>
      </div>
      <div class="operation-row" v-if="policyType === 'new'">
        <el-checkbox v-model="isVirtioSCSI">VirtioSCSI</el-checkbox>
      </div>
      <div class="operation-row" v-if="policyType === 'overlap'">
        <div class="title">{{$t('common.name') + $t('common.colon')}}{{dbData.backupData[dataUuid] &&
          dbData.backupData[dataUuid].metadata.name}}
        </div>
      </div>
      <div class="operation-row" v-if="policyType === 'overlap'">
        <div class="title">{{$t('common.description') + $t('common.colon')}}{{dbData.backupData[dataUuid] &&
          dbData.backupData[dataUuid].metadata.description}}
        </div>
      </div>
      <div class="operation-row" v-if="policyType === 'new' && canShow('thinProvision')">
        <el-radio-group v-model="thinProvision">
          <el-radio :label="true">{{$t('common.thinProvision')}}</el-radio>
          <el-radio :label="false">{{$t('common.thickProvision')}}</el-radio>
        </el-radio-group>
      </div>
    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</span>
    </div>
  </create-template-no-route>
</template>

<script>
  import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";
  import AddOrDeleteInput from "../../../component/AddOrDeleteInput";
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';

  export default {
    name: "VolumeBackupDataRecover",

    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },

    mixins: [WindowBase],

    components: {AddOrDeleteInput, CreateTemplateNoRoute},

    data() {
      return {
        policyType: 'new',
        name: '',
        emptyname: false,
        description: '',
        vmUuid: '',
        emptyvmUuid: false,
        primarystorageUuid: '',
        emptyprimarystorageUuid: false,
        isVirtioSCSI: false,
        dataUuid: '',
        thinProvision: true
      }
    },

    created() {
      let self = this;
      self.dataUuid = self.param.uuid;
      self.checkData();
    },

    methods: {
      validate(name) {
        let self = this, normalValidateName = ['name', 'vmUuid', 'primarystorageUuid'];
        let value = String(self[name]).trim();
        self[`empty${name}`] = false;
        if (normalValidateName.includes(name)) {
          if (/^\s*$/.test(value)) {
            self[`empty${name}`] = true;
            return;
          }
        }
      },

      openVmSelect() {
        let self = this;
        self.validate('vmUuid');
        let conditions = ['type=UserVm', 'hypervisorType=KVM', 'state?=Running,Stopped', `zoneUuid=${window.localStorage.getItem('currZoneUuid')}`]
        self.openDialog('VmSingleSelectListDlg', {
          conditions,
          ok: self.selectVm
        })
      },

      removeUuid(uuid) {
        let self = this;
        self[uuid] = '';
      },

      selectVm: async function (uuid) {
        let hostUuid
        hostUuid = await this.getLocalHostUuid(uuid)
        this.vmUuid = uuid;
        this.validate('vmUuid');
        this.hostUuid = hostUuid
        let vm = this.dbData.vm[uuid]
        let psUuid = vm && vm.allVolumes[0].primaryStorageUuid
        this.primarystorageUuid = psUuid
        this.initThinProvisionByPrimaryStorage(psUuid, true)
      },

      getLocalHostUuid: async function (vmUuid) {
        let vm = this.dbData.vm[vmUuid]
        if (!vm) return
        let resultHostUuid = ''
        let hostResp = await rpc.query('hosts', {q: `clusterUuid=${vm.clusterUuid}`})
        let hostUuids = hostResp.inventories.map(host => host.uuid)
        for (let i = 0; i < hostUuids.length; i++) {
          let vmResp = await rpc.query(`vm-instances`, {q: `rootVolume.localStorageHostRef.hostUuid=${hostUuids[i]}`})
          let vmUuids = vmResp.inventories.map(vm => vm.uuid)
          if (vmUuids.indexOf(vmUuid) > -1) {
            resultHostUuid = hostUuids[i]
            break
          }
        }
        return resultHostUuid
      },

      initPrimariyStorage: async function () {
        const self = this
        let psUuids = []
        let queryConditions = ['state=Enabled', 'status=Connected', 'availableCapacity%3E=1']
        if (self.vmInstanceUuid) {
          let vm = self.dbData.vm[self.vmUuid]
          if (!vm) return
          let clusterUuid = vm.clusterUuid
          queryConditions.push(`cluster.uuid=${clusterUuid}`)
          let psUuid = vm.allVolumes[0].primaryStorageUuid
          psUuids.push(psUuid)
          let ps = self.dbData.primarystorage[psUuid]
          if (!ps) return
          if (ps.type === 'LocalStorage') {
            self.hostUuid = vm.hostUuid
          }
          let psTypes = ['NFS', 'SharedMountPoint', 'LocalStorage', 'Ceph']
          if (psTypes.indexOf(ps.type) > -1) {
            queryConditions.push(`type?=${psTypes}`)
          }
        }
        if (this.dbData.common.isAdmin) {
          let psResp = await rpc.query(`primary-storage`, {q: queryConditions})
          psUuids = psUuids.concat(psResp.inventories.map(ps => ps.uuid))
        }
        return _.uniq(psUuids)
      },

      async openPrimaryStorageSelect() {
        let self = this;
        self.validate('primarystorageUuid');
        let primaryStorageUuids = await self.initPrimariyStorage();
        self.openDialog('PrimaryStorageListSingleSelectList', {
          conditions: [`uuid?=${primaryStorageUuids}`, 'type!=VCenter'],
          select: (uuid) => {
            self.primarystorageUuid = uuid;
            self.initThinProvisionByPrimaryStorage(uuid);
            self.validate('primarystorageUuid');
          }
        })
      },

      initThinProvisionByPrimaryStorage(psUuid) {
        return rpc.query('system-tags', {q: `resourceUuid=${psUuid}`}).then(tagsResp => {
          this.thinProvision = tagsResp.inventories.some(tag => tag.tag.indexOf('ThinProvisioning') > -1)
        })
      },

      checkData: async function () {
        let backupData = this.dbData.backupData[this.param.uuid]
        if (!backupData) return
        let volumeUuid = backupData.volumeUuid
        let volumeResp = await rpc.query('volumes', {q: [`uuid=${volumeUuid}`, 'status!=Deleted']})
        const volume = volumeResp.inventories[0]
        if (!volume) this.lostData = true
      },

      revoverParam() {
        let obj = {
          vmInstanceUuid: this.vmUuid,
          name: this.name,
          description: this.description,
          VirtioSCSI: this.isVirtioSCSI,
          primaryStorageUuid: this.primarystorageUuid
        }
        if (this.hostUuid) obj.hostUuid = this.hostUuid
        if (this.canShow('thinProvision')) {
           obj.thinProvision = this.thinProvision
        }
        return obj
      },

      canShow (item) {
        let self = this;
        let ps = _.get(self.dbData, `primarystorage[${this.primarystorageUuid}]`)
        if ((!ps || ps.type !== 'SharedBlock' || !self.dbData.common.isAdmin) && item === 'thinProvision') return false
        return true
      },

      validateField() {
       let  self = this, normalValidateName = ['name', 'vmUuid', 'primarystorageUuid'];
       normalValidateName.forEach(name => {
         self.validate(name)
       })
        let invalidate = normalValidateName.some((name) => self[`empty${name}`]);
       return invalidate;
      },

      confirm() {
        let self = this;
        if(self.policyType === 'new' && self.validateField()) return;
        self.param.ok(self.revoverParam(), self.policyType);
        self.$emit('close');
       }
    }
  }
</script>

<style scoped>

</style>
