<template>
  <create-template>
    <div slot="header" class="create-header">
      <span>{{$t('cluster.create')}}</span>
      <span @click="$router.push({name: 'cluster'})" class="create-back"><i class="el-icon-back"></i> 回到集群列表 </span>
    </div>
    <div slot="body" class="create-body">
      <div id="common-zone" class="operation-row">
        <div class="sole-title">
          {{$t('common.zone')}} {{$t('common.colon')}}
        </div>
        <div class="sole-content">
          {{dbData.zone[windowData.zoneUuid] && dbData.zone[windowData.zoneUuid].name}}
        </div>
      </div>

      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <help-trigger name="volume"></help-trigger>
        <input @blur="validate('name')" type="text" v-model="name" :class="{'is-error': emptyname}"/>
        <div class="error-text error" v-if="emptyname">{{$t('common.name')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.introduction')}}</div>
        <textarea rows="3" type="text" v-model="description"/>
      </div>
      <div class="operation-row">
        <div class="title" v-permission="'LICENSE_BASIC_PAID'">{{$t('cluster.vdiNetwork')}}</div>
        <help-trigger name="vdiNetwork"></help-trigger>
        <input v-permission="'LICENSE_BASIC_PAID'" :value="windowData.cidr"
               :class="{'is-error': invalidcidr}" placeholder="192.168.1.0/24" maxlength="255"
               @input="(e) => { updateWindow({ 'cidr': e.target.value }) }" @blur="validate('cidr')"
               @keydown.enter="validate('cidr')"/>
        <div class="error-text error" v-if="!emptycidr && invalidcidr">
          {{$t('error.invalid')+$t('common.cidr')}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title" v-permission="'CLUSTER.DISPLAYNETWORK'">{{$t('common.migrateNetworkCidr')}}</div>
        <help-trigger name="migrateNetworkCidr"/>
        <input v-permission="'CLUSTER.DISPLAYNETWORK'" :value="windowData.migrateNetworkCidr"
               :class="{'is-error': invalidmigrateNetworkCidr}" placeholder="192.168.2.0/24"
               maxlength="255" @input="(e) => { updateWindow({ 'migrateNetworkCidr': e.target.value }) }"
               @blur="validate('migrateNetworkCidr')" @keydown.enter="validate('migrateNetworkCidr')"/>
        <div class="error-text error"
             v-if="!emptymigrateNetworkCidr && invalidmigrateNetworkCidr">
          {{$t('error.invalid')+$t('common.migrateNetworkCidr')}}
        </div>
      </div>

      <div id="common-advanced" class="operation-row">
        <div class="operation-block-header" style="position: relative; margin-top: 40px;cursor: pointer;"
             @click="toggleMoreSetting()">
          {{ $t("common.advanced") }}
          <span>
              <img src="~assets/arrow_up.svg" class="arrow" v-if="showMoreSetting">
              <img src="~assets/arrow_down.svg" v-else>
          </span>
        </div>
        <div id="loadbalancer-balancerAlogorithm" class="operation-row zs-select" v-if="showMoreSetting">
          <div class="title" v-permission="'CLUSTER.DISPLAYNETWORK'">
            {{ $t("common.cpuModel") }}
          </div>
          <help-trigger name="cpuModel"/>
          <el-select v-model="cpuModel" v-permission="'LICENSE_BASIC_PAID'" style="width: 100%;">
            <el-option  v-for="(item, index) in cpuModelList" :key="index" :value="item"></el-option>
          </el-select>
        </div>
        <div id="loadbalancer-checkCpuModel" class="operation-row zs-select" v-if="showMoreSetting">
          <div class="title" v-permission="'LICENSE_BASIC_PAID'">
            {{$t('cluster.checkHostCpu')}}
          </div>
          <help-trigger name="checkCpuModel"/>
          <el-select v-model="getCheckCpuModel" style="width: 100%;">
            <el-option v-for="(item, index) in checkCpuModelList" :key="index" :value="item.displayName">{{$t(`${item.displayName}`)}}</el-option>
          </el-select>
        </div>
      </div>
    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="createCluster">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push({name: 'cluster'})">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import CreateTemplate from 'src/component/CreateTemplate';
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils';
  import ZoneMethods from 'src/om/zone/Methods';
  import Validator from 'src/utils/validator';
  import Dropdown from "../../component/Detail/Dropdown";
  import ClusterMethods from './Methods'

  export default {
    name: "CreateClusterPage",
    mixins: [WindowBase, Root, Utils, ClusterMethods],
    components: {Dropdown, CreateTemplate},
    data() {
      return {
        show: true,
        name: '',
        vdiNetwork: '',
        emptyname: false,
        emptycidr: false,
        emptymigrateNetworkCidr: false,
        showMoreSetting: false,
        description: '',
        cpuModel: 'None',
        invalidcidr: false,
        invalidmigrateNetworkCidr: false,
        checkCpuModel: 'common.useGlobalConfig',
        cpuModelList: [
          'None',
          'Haswell-noTSX',
          'Haswell',
          'Broadwell-noTSX',
          'Broadwell',
          'SandyBridge',
          'IvyBridge',
          'Conroe',
          'Penryn',
          'Nehalem',
          'Westmere',
          'host-passthrough',
          'Opteron_G1',
          'Opteron_G2',
          'Opteron_G3',
          'Opteron_G4'
        ],
        checkCpuModelList: [
          {
            displayName: 'common.check',
            value: 'true'
          },
          {
            displayName: 'common.noCheck',
            value: 'false'
          },
          {
            displayName: 'common.useGlobalConfig',
            value: 'default'
          }
        ],
        invalidInput: false,
        checkCpu: ''
      }
    },
    computed: {
      getCheckCpuModel: {
        get(){
          let self = this;
          self.checkCpuModelList.findIndex((item) => {
            if(self.checkCpuModel ===  item.displayName){
              self.checkCpu = item.value;
            }
          })
          return self.$t(self.checkCpuModel)
        },
        set(val){
          let self = this;
          self.checkCpuModel = val;
        }
      }
    },
    created() {
      debugger
      let curSelectZoneUuid = window.localStorage.getItem('currZoneUuid')
      if (this.$route.params) {
        if (typeof (this.$route.params.ZoneUuid) === 'String') curSelectZoneUuid =this.$route.params.ZoneUuid
      }

      this.updateWindow({
        description: '',
        cidr: '',
        migrateNetworkCidr: '',
        zoneUuid: curSelectZoneUuid
      })
    },
    methods: {
      ...Validator,
      ...{
        createZone: ZoneMethods.methods.create
      },
      canShow(item) {
        if (!this.showMoreSetting && _.includes(['cpuModel', 'checkCpuModel'], item.id)) return false
        return true
      },
      toggleMoreSetting: function () {
        let showMoreSetting = this.$data.showMoreSetting
        this.$data.showMoreSetting = !showMoreSetting
      },
      createParams() {
        const self = this
        let obj = {
          name: self.name,
          description: self.description,
          zoneUuid: self.windowData.zoneUuid,
          hypervisorType: 'KVM',
          systemTags: []
        }

        if (this.windowData.cidr) {
          obj.systemTags.push(`display::network::cidr::${this.windowData.cidr}`)
        }
        if (this.windowData.migrateNetworkCidr) {
          obj.systemTags.push(`cluster::migrate::network::cidr::${this.windowData.migrateNetworkCidr}`)
        }
        if (this.cpuModel !== 'None') {
          obj.systemTags.push(`clusterKVMCpuModel::${this.cpuModel}`)
        }
        if(this.checkCpu){
          obj.systemTags.push(`check::cluster::cpu::model::${this.checkCpu}`)
        }
        return obj
      },
      validate(name) {
        let self = this;
        self[`empty${name}`] = false
        let input = name === 'name' ? String(self[name]).trim() : self.windowData[name]
        if (!input) {
          self[`empty${name}`] = true
          return
        }
        self[`invalid${name}`] = false
        if (name === 'cidr' || name === 'migrateNetworkCidr') {
          if (!this.isCidr(input)) {
            self[`invalid${name}`] = true
          }
        }

      },
      validateAll() {
        const self = this
        let props = ['name']
        self.invalidInput = false;
        if (self.windowData.cidr) {
          props.push('cidr')
        }
        if (self.windowData.migrateNetworkCidr) {
          props.push('migrateNetworkCidr')
        }
        props.forEach(item => self.validate(item))
        self.invalidInput = props.some(item => self[`empty${item}`] || self[`invalid${item}`])
      },
      createCluster() {
        let self = this;
        self.validateAll()
        if (self.invalidInput) return
        self.create(self.createParams())
        self.$router.push({name: 'cluster'})
      }
    }
  }
</script>

<style scoped>
  .operation-row {
    position: relative;
    padding-top: 20px;
  }

  .operation-row .sole-title {
    font-size: 14px;
    color: #5E6978;
    margin-bottom: 10px;
    display: inline-block;
    margin-right: 10px;
  }

  .operation-row .sole-content {
    font-size: 14px;
    color: #333333;
    display: inline-block;
  }
</style>
