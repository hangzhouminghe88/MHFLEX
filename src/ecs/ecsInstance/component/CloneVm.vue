<template>
  <div>
    <create-template-no-route>
      <div slot="header">
        <span>
          {{$t('vm.clone')}}
        </span>
        <span class="create-back" @click="$emit('close')"><i class="el-icon-back"></i>返回</span>
      </div>
      <div slot="body">
        <div class="clone-container">
          <el-form :model="cloneFormConfig" :rules="rules" ref="cloneForm">
            <el-form-item :label="$t('common.name')" class="operation-row" prop="name">
              <el-input type="text" v-model="cloneFormConfig.name"/>
            </el-form-item>
            <el-form-item :label="$t('common.number')" class="operation-row" prop="number">
              <el-input type="text" v-model="cloneFormConfig.number"/>
            </el-form-item>
          </el-form>
          <div class="operation-row">
            <div class="title">
              {{$t('common.affinitygroup')}}
            </div>
            <add-or-delete-input :value="dbData.affinitygroup[windowData.affinityGroupUuid] && dbData.affinitygroup[windowData.affinityGroupUuid].name" @open="openAffinityGroupDlg" @remove="clearAffinityGroup"></add-or-delete-input>
          </div>
          <component class="item-container operation-row" style="margin-top: 20px;" v-for="(item, index) in policyItemList"
                     :key="index" v-if="canShow(item)" :param="item.param" :is="item.ctrl"></component>
        </div>
      </div>
      <div slot="footer">
        <span class="btn-confirm" @click="confirm">{{$t('common.ok')}}</span>
        <span class="btn-cancel" @click="$emit('close')">{{$t('common.cancel')}}</span>
      </div>
    </create-template-no-route>
    <primary-storage-single-dlg v-if="showPrimarySingleDlg" :model="showPrimarySingleDlg" :message="primaryMessage"
                                @close="closePrimarySingleDlg"></primary-storage-single-dlg>
    <ceph-pool-single-dlg v-if="showCephPool" :model="showCephPool" :message="cephPoolMessage"
                          @close="closeCephPoolDlg"></ceph-pool-single-dlg>
    <affinity-group-single-dlg v-if="showAffinitySingleDlg" :model="showAffinitySingleDlg" :message="affinityMessage"
                               @close="closeAffinitySingleDlg"></affinity-group-single-dlg>
  </div>
</template>

<script>
  import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";
  import AddOrDeleteInput from "../../../component/AddOrDeleteInput";
  import AffinityGroupSingleDlg from "../../../dialog/AffinityGroupSingleDlg";
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import PrimaryStorageSingleDlg from "../../../dialog/PrimaryStorageSingleDlg";
  import RadioButtonGroup from 'src/component/FullPanel/RadioButtonGroup';
  import SinglePicker from 'src/component/FullPanel/SinglePicker';
  import CheckBox from 'src/component/FullPanel/CheckBox';
  import CephPoolSingleDlg from "../../../dialog/CephPoolSingleDlg";

  export default {
    name: "CloneVm",
    props: {
      param: {
        type: Object,
        default: {}
      }
    },
    mixins: [WindowBase],
    components: {
      CephPoolSingleDlg,
      PrimaryStorageSingleDlg, AffinityGroupSingleDlg, AddOrDeleteInput, CreateTemplateNoRoute},
    data(){
      return {
        cloneFormConfig:{
          name: '',
          number: 1,
          strategy: 'InstantStart'
        },
        rules: {
          name: [
            { required: true, message: '名称不能为空', trigger: 'blur' },
          ],
          number: [
            { required: true, message: '数量至少为1', trigger: 'blur' },
          ]
        },
        isCloneVmVolume: false,
        showAffinitySingleDlg: false,
        affinityMessage: {},
        showPrimarySingleDlg: false,
        primaryMessage: {},
        primaryStorageUuid: '',
        clone: false,
        canClone: false,
        showAttachedChecked: true,//是否绑定checked,
        showCephPool: false,
        cephPoolMessage: {},
        dataVolumePrimaryStorageUuid: '',
        rootVolumePrimaryStorageUuid: '',
        dataPoolName: '',
        rootPoolName: '',
        policyItemList: [{
          id: 'clone',
          param: {
            getTitle: () => {},
            getDescription: () => this.$t('vm.cloneVmVolume'),
            getValue: () => this.clone,
            doc: 'cloneVm',
            getDisabled: () => !this.canClone,
            setValue: value => {
              this.thinProvisionForPrimaryStorage = false
              this.thinProvisionForRootPrimaryStorage = false
              this.thinProvisionForDataPrimaryStorage = false
              this.dataVolumePrimaryStorageUuid = ''
              this.rootVolumePrimaryStorageUuid = ''
              this.primaryStorageUuid = ''
              this.rootPoolName = ''
              this.dataPoolName = ''
              this.clone = value
            }
          },
          ctrl: CheckBox
        }, {
          id: 'primaryStorageUuid',
          param: {
            getTitle: () => this.$t(`common.primaryStorage`),
            getValue: () => this.primaryStorageUuid && this.dbData.primarystorage[this.primaryStorageUuid].name,
            canShowStar: () => false,
            open: this.openPrimaryStorageDlg,
            delete: () => {
              this.primaryStorageUuid = ''
              this.rootPoolName = ''
            }
          },
          ctrl: SinglePicker
        }, {
          id: 'thinProvisionForPrimaryStorage',
          param: {
            getTitle: () => {},
            optionList: [
              {
                getDisplayName: () => this.$t('common.thinProvision'),
                value: true
              },
              {
                getDisplayName: () => this.$t('common.thickProvision'),
                value: false
              }
            ],
            getValue: () => this.thinProvisionForPrimaryStorage,
            setValue: value => { this.thinProvisionForPrimaryStorage = value }
          },
          ctrl: RadioButtonGroup
        }, {
          id: 'rootVolumePrimaryStorageUuid',
          param: {
            getTitle: () => this.$t(`common.rootVolumePrimaryStorage`),
            getValue: () => this.rootVolumePrimaryStorageUuid && this.dbData.primarystorage[this.rootVolumePrimaryStorageUuid].name,
            canShowStar: () => false,
            open: this.openRootPrimaryStorageDlg,
            delete: () => {
              this.rootVolumePrimaryStorageUuid = ''
              this.rootPoolName = ''
            }
          },
          ctrl: SinglePicker
        }, {
          id: 'rootPoolName',
          param: {
            getTitle: () => this.$t(`vm.${this.clone ? 'rootPool' : 'cephPool'}`),
            getValue: () => this.rootPoolName,
            open: this.openCephPoolList,
            delete: () => { this.rootPoolName = '' }
          },
          ctrl: SinglePicker
        }, {
          id: 'thinProvisionForRootPrimaryStorage',
          param: {
            getTitle: () => {},
            optionList: [
              {
                getDisplayName: () => this.$t('common.thinProvision'),
                value: true
              },
              {
                getDisplayName: () => this.$t('common.thickProvision'),
                value: false
              }
            ],
            getValue: () => this.thinProvisionForRootPrimaryStorage,
            setValue: value => { this.thinProvisionForRootPrimaryStorage = value }
          },
          ctrl: RadioButtonGroup
        }, {
          id: 'dataVolumePrimaryStorageUuid',
          param: {
            getTitle: () => this.$t(`common.dataVolumePrimaryStorage`),
            getValue: () => this.dataVolumePrimaryStorageUuid && this.dbData.primarystorage[this.dataVolumePrimaryStorageUuid].name,
            canShowStar: () => false,
            open: this.openDataPrimaryStorageDlg,
            delete: () => {
              this.dataVolumePrimaryStorageUuid = ''
              this.dataPoolName = ''
            }
          },
          ctrl: SinglePicker
        }, {
          id: 'dataPoolName',
          param: {
            getTitle: () => this.$t(`vm.dataPool`),
            getValue: () => this.dataPoolName,
            open: () => this.openCephPoolList('Data'),
            delete: () => { this.dataPoolName = '' }
          },
          ctrl: SinglePicker
        }, {
          id: 'thinProvisionForDataPrimaryStorage',
          param: {
            getTitle: () => {},
            optionList: [
              {
                getDisplayName: () => this.$t('common.thinProvision'),
                value: true
              },
              {
                getDisplayName: () => this.$t('common.thickProvision'),
                value: false
              }
            ],
            getValue: () => this.thinProvisionForDataPrimaryStorage,
            setValue: value => { this.thinProvisionForDataPrimaryStorage = value }
          },
          ctrl: RadioButtonGroup
        }]
      }
    },
    created(){
      let self = this;
      let availableCephPrimaryStorageUuidList = []
      if (this.param && this.param.availableCephPrimaryStorageUuidList) {
        availableCephPrimaryStorageUuidList = this.param.availableCephPrimaryStorageUuidList
      }
      this.updateWindow({
        name: '',
        numbers: 1,
        dataUuid: this.param && this.param.vmUuid,
        affinityGroupUuid: '',
        availableCephPrimaryStorageUuidList,
        strategy: 'InstantStart',
        psType: 'PrimaryStorage'
      }).then(() => {
        this.hasShareableVolume()
      })
      if (this.param && this.param.showAttachedChecked === false) {
        self.showAttachedChecked = false
      }
    },
    methods: {
      //是否有共享云盘
      hasShareableVolume () {
        rpc.query('volumes/vm-instances/refs', {
          q: [`vmInstanceUuid=${this.windowData.dataUuid}`],
          count: true
        }).then(resp => {
          this.canClone = resp.total === 0
        })
      },
      openCephPoolList(type){
        let self = this
        let isData = type === 'Data'
        let primaryStorageUuid = isData ? self.dataVolumePrimaryStorageUuid : (self.primaryStorageUuid || self.rootVolumePrimaryStorageUuid)
        if (!primaryStorageUuid) return
        self.cephPoolMessage.conditions = [`primaryStorageUuid=${primaryStorageUuid}`, `type=${isData ? 'Data' : 'Root'}`];
        self.cephPoolMessage.type= type;
        self.showCephPool = true;
      },
      closeCephPoolDlg(param){
        let self = this;
        if(param){
          let pool = self.dbData.pool[param.uuid]
          self[param.type === 'Data' ? 'dataPoolName' : 'rootPoolName'] = pool.poolName
        }
        self.showCephPool = false;
      },
      openDataPrimaryStorageDlg () {
        const self = this
        let conditions = ['type!=VCenter']
        if (self.windowData.availableCephPrimaryStorageUuidList && self.windowData.availableCephPrimaryStorageUuidList.length > 0) {
          conditions.push(`uuid?=${self.windowData.availableCephPrimaryStorageUuidList}`)
        }
        self.primaryMessage.conditions = conditions;
        self.updateWindow({
          psType: 'DataPrimaryStorage'
        })
        self.showPrimarySingleDlg = true;
      },
      async openAffinityGroupDlg(){
        let self = this;
        let affinityGroupUuids = await self.getCandidateAffinityGroupForVmAttaching()
        let conditions = [`uuid?=${affinityGroupUuids}`]
        self.affinityMessage.conditions = conditions;
        self.showAffinitySingleDlg = true;
      },
      closeAffinitySingleDlg(param){
        let self = this;
        if(param){
          this.updateWindow({
            affinityGroupUuid: param
          })
        }
        self.showAffinitySingleDlg = false;
      },
      //判断显示哪个添加项
      canShow (item) {
        if (!this.dbData.common.isAdmin) return false
        if (item.id === 'thinProvisionForPrimaryStorage') return this.showThinProvision(this.primaryStorageUuid, item, item.id) && this.showAttachedChecked
        if (item.id === 'thinProvisionForRootPrimaryStorage') return this.showThinProvision(this.rootVolumePrimaryStorageUuid, item, item.id)
        if (item.id === 'thinProvisionForDataPrimaryStorage') return this.showThinProvision(this.dataVolumePrimaryStorageUuid, item, item.id)
        if (!this.showAttachedChecked && item.id === 'clone') return false
        if (this.param.isVmware && item.id === 'primaryStorageUuid') return false
        if (!this.clone && _.includes(['dataVolumePrimaryStorageUuid', 'rootVolumePrimaryStorageUuid'], item.id)) return false
        if (this.clone && item.id === 'primaryStorageUuid') return false
        if (item.id === 'rootPoolName') return this.showPoolName(this.primaryStorageUuid || this.rootVolumePrimaryStorageUuid, item, item.id)
        if (item.id === 'dataPoolName') return this.clone && this.showPoolName(this.dataVolumePrimaryStorageUuid, item, item.id)
        return true
      },
      clearAffinityGroup() {
        let self = this;
        self.updateWindow({
          affinityGroupUuid: ''
        })
      },
      openPrimaryStorageDlg(){
        const self = this
        let conditions = ['type!=VCenter']
        if (self.windowData.availableCephPrimaryStorageUuidList && self.windowData.availableCephPrimaryStorageUuidList.length > 0) {
          conditions.push(`uuid?=${self.windowData.availableCephPrimaryStorageUuidList}`)
        }
        self.primaryMessage.conditions = conditions;
        self.updateWindow({
          psType: 'PrimaryStorage'
        })
        self.showPrimarySingleDlg = true;
      },
      openRootPrimaryStorageDlg () {
        const self = this
        let conditions = ['type!=VCenter']
        if (self.windowData.availableCephPrimaryStorageUuidList && self.windowData.availableCephPrimaryStorageUuidList.length > 0) {
          conditions.push(`uuid?=${self.windowData.availableCephPrimaryStorageUuidList}`)
        }
        self.updateWindow({
          psType: 'RootPrimaryStorage'
        })
        self.primaryMessage.conditions = conditions;
        self.showPrimarySingleDlg = true;
      },
      closePrimarySingleDlg(param){
        let self = this;
        if(param){
          switch(self.windowData.psType){
            case 'PrimaryStorage':
              self.primaryStorageUuid = param;
              break;
            case 'DataPrimaryStorage':
              self.dataVolumePrimaryStorageUuid = param;
              break;
            case 'RootPrimaryStorage':
              self.rootVolumePrimaryStorageUuid = param;
              break;
          }
          self.initThinProvisionByPrimaryStorage(param, self.windowData.psType)
        }
        self.showPrimarySingleDlg = false;
      },
      initThinProvisionByPrimaryStorage (psUuid, psType) {
        return rpc.query('system-tags', {q: `resourceUuid=${psUuid}`}).then(tagsResp => {
          this[`thinProvisionFor${psType}`] = tagsResp.inventories.some(tag => tag.tag.indexOf('ThinProvisioning') > -1)
        })
      },
      showThinProvision (uuid, item, id) {
        let primaryStorage = _.get(this.dbData, `primarystorage[${uuid}]`)
        if ((!primaryStorage || primaryStorage.type !== 'SharedBlock') && item.id === id) return false
        return true
      },
      showPoolName (uuid, item, id) {
        let primaryStorage = _.get(this.dbData, `primarystorage[${uuid}]`)
        if ((!primaryStorage || primaryStorage.type !== 'Ceph') && item.id === id) return false
        return true
      },
      getCandidateAffinityGroupForVmAttaching: async function () {
        let affinityGroupResp = await rpc.query(`affinity-groups`, {q: 'state=Enabled'})
        let affinityGroupUuids = affinityGroupResp.inventories.map(affinityGroup => affinityGroup.uuid)
        if (affinityGroupUuids.length === 0) return []
        if (!this.dbData.common.isAdmin) return affinityGroupUuids
        function getAccountRelatedAffinityGroup (affinityGroupUuids, accountUuid) {
          let result = []
          let tasks = []
          let p = null
          affinityGroupUuids.forEach(affinityGroupUuid => {
            p = rpc.query(`accounts/resources/refs`, {
              q: [`resourceUuid=${affinityGroupUuid}`, `accountUuid=${accountUuid}`]
            }).then(resp => {
              if (resp.inventories.length !== 0) result.push(affinityGroupUuid)
            })
            tasks.push(p)
          })
          return Promise.all(tasks).then(() => {
            return result
          })
        }
        let accountUuid = window.localStorage.getItem('accountUuid')
        let result = await getAccountRelatedAffinityGroup(affinityGroupUuids, accountUuid)
        return result
      },
      createParam() {
        let self = this;
        let obj = {
          name: self.cloneFormConfig.name,
          numbers: self.cloneFormConfig.number,
          strategy: self.cloneFormConfig.strategy,
          systemTags: [],
          dataVolumeSystemTags: [],
          rootVolumeSystemTags: []
        }
        if (self.showAttachedChecked) {
          obj.full = self.clone
        }
        if (self.windowData.affinityGroupUuid) {
          obj.systemTags.push(`affinityGroupUuid::${self.windowData.affinityGroupUuid}`)
        }
        let rootPsUuid = self.primaryStorageUuid || self.rootVolumePrimaryStorageUuid
        let dataPsUuid = self.dataVolumePrimaryStorageUuid
        if (rootPsUuid) obj.primaryStorageUuidForRootVolume = rootPsUuid
        if (dataPsUuid) obj.primaryStorageUuidForDataVolume = dataPsUuid
        if (this.canShow(self.getItemById('thinProvisionForPrimaryStorage'))) {
          let tag = self.thinProvisionForPrimaryStorage ? 'ThinProvisioning' : 'ThickProvisioning'
          obj.rootVolumeSystemTags.push(`volumeProvisioningStrategy::${tag}`)
        }
        if (this.canShow(self.getItemById('thinProvisionForRootPrimaryStorage'))) {
          let tag = this.thinProvisionForRootPrimaryStorage ? 'ThinProvisioning' : 'ThickProvisioning'
          obj.rootVolumeSystemTags.push(`volumeProvisioningStrategy::${tag}`)
        }
        if (this.canShow(self.getItemById('thinProvisionForDataPrimaryStorage'))) {
          let tag = self.thinProvisionForDataPrimaryStorage ? 'ThinProvisioning' : 'ThickProvisioning'
          obj.dataVolumeSystemTags.push(`volumeProvisioningStrategy::${tag}`)
        }
        if (this.canShow(self.getItemById('rootPoolName')) && self.rootPoolName) obj.rootVolumeSystemTags.push(`ceph::rootPoolName::${self.rootPoolName}`)
        if (this.canShow(self.getItemById('dataPoolName')) && self.dataPoolName) obj.dataVolumeSystemTags.push(`ceph::pool::${self.dataPoolName}`);
        obj.uuid = self.param.vmUuid;
        return obj
      },
      getItemById (id) {
        return _.find(this.policyItemList, item => item.id === id)
      },
      confirm(){
        let self  = this;
        this.$refs.cloneForm.validate((valid) =>{
          if(valid){
            self.$emit('close', self.createParam());
          }
        })
      }
    }
  }
</script>

<style scoped>
  .el-form-item {
    margin-bottom: 0;
  }
</style>
