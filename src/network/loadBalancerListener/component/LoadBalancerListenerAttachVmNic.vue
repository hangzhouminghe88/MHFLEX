<template>
  <create-template-no-route>
    <div slot="header">
      <span>{{$t('loadbalancer.attachVmNic')}}</span>
      <span class="create-back el-icon-back" @click="$emit('close')">返回</span>
    </div>

    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title required">{{$t('perf.networkData')}}</div>
        <add-or-delete-input  @open="openL3NetworkSelect()" :value="dbData.l3network[windowData.l3NetworkUuid]
                              && dbData.l3network[windowData.l3NetworkUuid].name"
                              :class="{'is-error': formValidator.emptyl3network}" @remove="removeUuid('l3NetworkUuid')"/>
        <div class="error error-text" v-if="formValidator.emptyl3network">
          {{$t('l3network.warning.unselected')+$t('common.network')}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.vmInstanceNic')}}</div>
        <add-or-delete-input v-if="windowData.vmNicUuidList.length > 0"
                             v-for="(uuid, index) in windowData.vmNicUuidList"
                             :key="index"
                             :value="dbData.vmNicRefs[uuid] && dbData.vmNicRefs[uuid].vmInstanceUuid && dbData.vm[dbData.vmNicRefs[uuid].vmInstanceUuid] && dbData.vm[dbData.vmNicRefs[uuid].vmInstanceUuid].name"
                             @remove="removeVmNic($event, uuid)"/>
        <add-or-delete-input @open="openVmNicSelect()" :class="{'is-error': formValidator.emptyphysicalInterface}"/>
        <div class="error error-text" v-if="formValidator.emptyphysicalInterface">
          {{$t('l3network.warning.unselected')+$t('common.physicalInterface')}}
        </div>
      </div>
    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="ok">{{$t('common.confirm')}}</span>
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
    name: "LoadBalancerListenerAttachVmNic",
    mixins: [WindowBase],
    components: {AddOrDeleteInput, CreateTemplateNoRoute},
    data(){
      return {
        formValidator: {
          emptyl3network: false,
          emptyphysicalInterface: false
        }
      }
    },

    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },

    created(){
      let self = this;
      if (self.param && this.param.uuid) {
        let dataUuid = self.param.uuid
        self.updateWindow({ dataUuid })
      }
      let curSelectZoneUuid = localStorage.getItem('currZoneUuid')
      this.updateWindow({
        cidr: '',
        clusterUuid: '',
        zoneUuid: curSelectZoneUuid,
        vmNicUuidList: []
      })
      self.checkL3Network();
    },

    methods: {
      removeUuid(uuid) {
        this.updateWindow({
          [uuid]: ''
        })
        this.createParamCheck();
      },

      openL3NetworkSelect(){
        let self = this;
        let tasks = []
        let p = null
        let l3NetworkUuidList = []
        p = rpc.query(`load-balancers/listeners/${self.windowData.dataUuid}/vm-instances/candidate-nics`)
          .then((resp) => {
            l3NetworkUuidList = resp.inventories.map(item => item.l3NetworkUuid)
          })
        tasks.push(p)
        Promise.all(tasks)
          .then(() => {
            self.openDialog('L3NetworkSingleSelectListDlg', {
              conditions: [`uuid?=${l3NetworkUuidList}`, 'category=Private', 'networkServices.networkServiceType=LoadBalancer'],
              select: (uuid) => {
                self.selectNetwork(uuid)
                if (uuid) {
                  this.formValidator.emptyl3network = false
                }
              }
            })
          })
      },

      openVmNicSelect(){
        let self = this;
        let uuidList = _.cloneDeep(self.windowData.vmNicUuidList)
        let tasks = []
        let p = null
        let vmNicUuidList = []
        p = rpc.query(`load-balancers/listeners/${self.windowData.dataUuid}/vm-instances/candidate-nics`)
          .then((resp) => {
            vmNicUuidList = resp.inventories.map(item => item.uuid)
            vmNicUuidList = _.difference(vmNicUuidList, uuidList)
          })
        tasks.push(p)
        Promise.all(tasks)
          .then(() => {
            self.openDialog('LoadBalancerListenerVmNicSelect', {
              conditions: [`uuid?=${vmNicUuidList}`, `l3NetworkUuid=${self.windowData.l3NetworkUuid}`, 'vmInstance.type=UserVm'],
              type: 'selection',
              select: (vmNicUuids) => {
                vmNicUuids = vmNicUuids.concat(_.cloneDeep(self.windowData.vmNicUuidList))
                self.updateWindow({ vmNicUuidList: vmNicUuids })
                if (vmNicUuids.length === 0) {
                  this.formValidator.emptyphysicalInterface = true
                } else {
                  this.formValidator.emptyphysicalInterface = false
                }
              }
            })
          })
      },

      checkL3Network () {
        return rpc.query(`load-balancers/listeners/${this.windowData.dataUuid}/vm-instances/candidate-nics`)
          .then((resp) => {
            let l3NetworkUuidList = resp.inventories.map(item => item.l3NetworkUuid)
            return rpc.query('l3-networks', {
              q: [`uuid?=${l3NetworkUuidList}`, 'category=Private', 'networkServices.networkServiceType=LoadBalancer']
            })
          }).then(resp => {
            if (resp.inventories.length !== 1) {
              return new Promise((resolve, reject) => { resolve() })
            }
            return this.updateDbTable({
              tableName: 'l3network',
              list: resp.inventories
            }).then(() => {
              this.selectNetwork(resp.inventories[0].uuid)
            })
          })
      },

      selectNetwork (uuid) {
        this.updateWindow({ l3NetworkUuid: uuid, vmNicUuidList: [] })
      },

      selectCluster (uuid) {
        this.updateWindow({ clusterUuid: uuid })
      },

      removeVmNic ($event, uuid) {
        let list = _.cloneDeep(this.windowData.vmNicUuidList)
        let self = this
        let uuidList = list.filter((i) => i !== uuid)
        self.updateWindow({ vmNicUuidList: uuidList })
        if (uuidList.length === 0) {
          this.formValidator.emptyphysicalInterface = true
        } else {
          this.formValidator.emptyphysicalInterface = false
        }
      },

      createParamCheck () {
        let self  = this, props =  ['emptyl3network', 'emptyphysicalInterface'];
        if(!self.windowData.l3NetworkUuid) this.formValidator.emptyl3network = true;
        if(self.windowData.vmNicUuidList.length <= 0) this.formValidator.emptyphysicalInterface = true;
        let invalid =  props.some((name) => this.formValidator[name] === true);
        return invalid;
      },

      createParam () {
        return {
          vmNicUuidList: this.windowData.vmNicUuidList
        }
      },

      ok () {
        this.createParamCheck()
        if (this.createParamCheck()) return
        this.param.ok(this.createParam())
        this.$emit('close')
      }
    }
  }
</script>

<style scoped>

</style>
