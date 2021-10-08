<template>
  <create-template-no-route>
    <div slot="header">
      <span></span>
      <span class="btn-confirm" @click="ok()"><i class="el-icon-plus"></i>{{$t("common.ok")}}</span>
      <span class="create-back" @click="close()"><i class="el-icon-back"></i>返回</span>
    </div>
    <div slot="body">
      <div class="operation-row">
        <div class="title required">{{$t('common.name')}}</div>
        <help-trigger name="volume"></help-trigger>
        <input @blur="validate('name')" type="text" v-model="windowData.name" :class="{'is-error':windowData.emptyname}"/>
        <div class=" error error-text" v-if="windowData.emptyname">{{$t('common.name')}}{{$t('error.noEmpty')}}</div>
      </div>
      <div class="operation-row">
        <div class="title">{{$t('common.description')}}</div>
        <textarea rows="3" type="text" v-model="description"/>
      </div>
      <div class="operation-row">
        <div class="title required">{{$t('common.protocol')}}</div>
        <drop-down class="dropdown create-dropdown">
                   <span slot="title">
                       <span class="text">{{protocol}}</span>
                   </span>
          <span slot="content">
                       <div class="dropdown-content" style="padding: 4px 20px;">
                           <a :index="index" @click="(e) => {protocol = e.target.text}"
                              v-for="(item, index) in protocolTypeList">{{item}}</a>
                       </div></span>
        </drop-down>
      </div>
      <div class="operation-row" v-if="protocol=== 'HTTPS'">
        <div class="title">
          {{$t("common.certificate")}}
        </div>
        <add-or-delete-input
          :value="windowData.certificate && dbData.certificate[windowData.certificateUuid] && dbData.certificate[windowData.certificateUuid].name"
          @open="openSelectCertificate()" @remove="clearRow('certificateUuid')"
          :class="{'is-error':windowData.emptycertificateUuid}"></add-or-delete-input>
        <div class="error error-text-text" v-if="windowData.emptycertificateUuid">
          {{$t('error.unselected')+$t('common.vip')}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title required">
          {{ $t("loadbalancer.loadBalancerPort") }}
        </div>
        <input type="number" step="any" @blur="validate('loadBalancerPort')"
               :class="{'is-error error-text': windowData.emptyloadBalancerPort || windowData.invalidloadBalancerPort || windowData.usedloadBalancerPort}"
               @keydown.enter="validate('loadBalancerPort')" :value="windowData.loadBalancerPort"
               @input="(e) => { updateWindow({ 'loadBalancerPort': e.target.value }) }"/>
        <div v-if="windowData.emptyloadBalancerPort" class="error error-text">
          {{$t('loadbalancer.warning.emptyloadBalancerPort')}}
        </div>
        <div v-if="!windowData.emptyloadBalancerPort && windowData.invalidloadBalancerPort" class="error error-text">
          {{$t('error.invalid')+$t('loadbalancer.loadBalancerPort')}}
        </div>
        <div
          v-if="!windowData.emptyloadBalancerPort && !windowData.invalidloadBalancerPort && windowData.usedloadBalancerPort"
          class="error error-text">
          {{$t('error.usedPort')}}
        </div>
      </div>
      <div class="operation-row">
        <div class="title required">
          {{ $t("loadbalancer.instancePort")}}
        </div>
        <input type="number" step="any" @blur="validate('instancePort')"
               :class="{'is-error': windowData.emptyinstancePort || windowData.invalidinstancePort || windowData.usedinstancePort}"
               @keydown.enter="validate('instancePort')" :value="windowData.instancePort"
               @input="(e) => { updateWindow({ 'instancePort': e.target.value }) }"/>
        <div v-if="windowData.emptyinstancePort" class="error error-text">
          {{$t('loadbalancer.warning.emptyinstancePort')}}
        </div>
        <div v-if="!windowData.emptyinstancePort && windowData.invalidinstancePort" class="error error-text">
          {{$t('error.invalid')+$t('loadbalancer.instancePort')}}
        </div>
        <div v-if="!windowData.emptyinstancePort && !windowData.invalidinstancePort && windowData.usedinstancePort"
             class="error error-text">
          {{$t('error.usedPort')}}
        </div>
      </div>
      <div id="common-advanced" class="operation-row">
        <div class="operation-block-header" style="position: relative; margin-top: 40px;cursor: pointer;"
             @click="toggleMoreSetting()">
          {{ $t("common.advanced") }}
          <span>
                       <img class="arrow" v-if="windowData.showMoreSetting" src="~assets/arrow_up.svg"/>
                       <img class="arrow" v-else src="~assets/arrow_down.svg"/>
                   </span>
          <help-trigger name="listenerAdvancedSetting"
                        :style="{ position: 'absolute', display: 'inline-block', top: '5px' }"/>
        </div>
        <div class="operation-row" v-if="windowData.showMoreSetting">
          <div class="title required">
            {{ $t("loadbalancer.connectionIdleTimeout") }}
          </div>
          <input type="number" step="any" @blur="validate('connectionIdleTimeout')"
                 :class="{'is-error': windowData.emptyconnectionIdleTimeout}"
                 @keydown.enter="validate('connectionIdleTimeout')" :value="windowData.connectionIdleTimeout"
                 @input="(e) => { updateWindow({ 'connectionIdleTimeout': e.target.value }) }"/>
          <div v-show="windowData.emptyconnectionIdleTimeout" class="error error-text">
            {{$t('loadbalancer.warning.emptyconnectionIdleTimeout')}}
          </div>
          <div v-show="!windowData.emptyconnectionIdleTimeout && windowData.invalidconnectionIdleTimeout"
               class="error error-text">
            {{$t('error error-text.invalid') + $t('loadbalancer.connectionIdleTimeout')}}
          </div>
        </div>
        <div id="loadbalancer-healthyThreshold" class="operation-row" v-if="windowData.showMoreSetting">
          <div class="title required">
            {{ $t("loadbalancer.healthyThreshold") }}
          </div>
          <input step="any" @blur="validate('healthyThreshold')" :class="{'is-error': windowData.emptyhealthyThreshold}"
                 @keydown.enter="validate('healthyThreshold')" :value="windowData.healthyThreshold"
                 @input="(e) => { updateWindow({ 'healthyThreshold': e.target.value }) }"/>
          <div v-show="windowData.emptyhealthyThreshold" class="error error-text">
            {{$t('loadbalancer.warning.emptyhealthyThreshold')}}
          </div>
          <div v-show="!windowData.emptyhealthyThreshold && windowData.invalidhealthyThreshold"
               class="error error-text">
            {{$t('error error-text.invalid') + $t('loadbalancer.healthyThreshold')}}
          </div>
        </div>
        <div id="loadbalancer-healthCheckProtocol" class="operation-row" v-if="windowData.showMoreSetting">
          <div class="title required">
            {{ $t("loadbalancer.healthCheckProtocol") }}
          </div>
          <input disabled class="disable-input" step="any" :value="windowData.protocol === 'UDP' ? 'UDP' : 'TCP'"/>
        </div>
        <div id="loadbalancer-healthCheckTarget" class="operation-row" v-if="windowData.showMoreSetting">
          <div class="title required">
            {{ $t("loadbalancer.healthCheckTarget") }}
          </div>
          <input step="any" @blur="validate('healthCheckTarget')"
                 :class="{'is-error': windowData.emptyhealthCheckTarget}" @keydown.enter="validate('healthCheckTarget')"
                 :value="windowData.healthCheckTarget"
                 @input="(e) => { updateWindow({ 'healthCheckTarget': e.target.value }) }"/>
          <div v-show="windowData.emptyhealthCheckTarget" class="error error-text">
            {{$t('loadbalancer.warning.emptyhealthCheckTarget')}}
          </div>
          <div v-show="!windowData.emptyhealthCheckTarget && windowData.invalidhealthCheckTarget"
               class="error error-text">
            {{$t('error.invalid') + $t('loadbalancer.healthCheckTarget')}}
          </div>
        </div>
        <div id="loadbalancer-unhealthyThreshold" class="operation-row" v-if="windowData.showMoreSetting">
          <div class="title required">
            {{ $t("loadbalancer.unhealthyThreshold") }}
          </div>
          <input type="number" step="any" @blur="validate('unhealthyThreshold')"
                 :class="{'is-error': windowData.emptyunhealthyThreshold}"
                 @keydown.enter="validate('unhealthyThreshold')" :value="windowData.unhealthyThreshold"
                 @input="(e) => { updateWindow({ 'unhealthyThreshold': e.target.value }) }"/>
          <div v-show="windowData.emptyunhealthyThreshold" class="error error-text">
            {{$t('loadbalancer.warning.emptyunhealthyThreshold')}}
          </div>
          <div v-show="!windowData.emptyunhealthyThreshold && windowData.invalidunhealthyThreshold"
               class="error error-text">
            {{$t('error error-text.invalid') + $t('loadbalancer.unhealthyThreshold')}}
          </div>
        </div>
        <div id="loadbalancer-healthCheckInterval" class="operation-row" v-if="windowData.showMoreSetting">
          <div class="title required">
            {{ $t("loadbalancer.healthCheckInterval") }}
          </div>
          <input type="number" step="any" @blur="validate('healthCheckInterval')"
                 :class="{'is-error': windowData.emptyhealthCheckInterval}"
                 @keydown.enter="validate('healthCheckInterval')" :value="windowData.healthCheckInterval"
                 @input="(e) => { updateWindow({ 'healthCheckInterval': e.target.value }) }"/>
          <div v-show="windowData.emptyhealthCheckInterval" class="error error-text">
            {{$t('loadbalancer.warning.emptyhealthCheckInterval')}}
          </div>
          <div v-show="!windowData.emptyhealthCheckInterval && windowData.invalidhealthCheckInterval"
               class="error error-text">
            {{$t('error.invalid') + $t('loadbalancer.healthCheckInterval')}}
          </div>
        </div>
        <div id="loadbalancer-maxConnection" class="operation-row" v-if="windowData.showMoreSetting">
          <div class="title required">
            {{ $t("loadbalancer.maxConnection") }}
          </div>
          <input type="number" step="any" @blur="validate('maxConnection')" @keydown.enter="validate('maxConnection')"
                 :class="{'is-error': windowData.emptymaxConnection}" :value="windowData.maxConnection"
                 @input="(e) => { updateWindow({ 'maxConnection': e.target.value }) }"/>
          <div v-show="windowData.emptymaxConnection" class="error error-text">
            {{$t('loadbalancer.warning.emptymaxConnection')}}
          </div>
          <div v-show="!windowData.emptymaxConnection && windowData.invalidmaxConnection" class="error error-text">
            {{$t('error.invalid') + $t('loadbalancer.maxConnection')}}
          </div>
        </div>
        <div class="operation-row" v-if="windowData.showMoreSetting">
          <div class="title">{{ $t("loadbalancer.balancerAlgorithm") }}</div>
          <drop-down class="dropdown create-dropdown">
            <span slot="title"/>
            <span slot="title">
                           <span class="text">{{balancerAlgorithm}}</span>
                       </span>
            <span slot="content">
                           <div class="dropdown-content" style="padding: 4px 20px;">
                           <a :index="index" @click="(e) => {balancerAlgorithm = e.target.text}"
                              v-for="(item, index) in balancerAlgorithmList">{{item}}</a>
                       </div></span>
          </drop-down>
        </div>
      </div>
    </div>
  </create-template-no-route>
</template>

<script>
  import AddOrDeleteInput from "../../../component/AddOrDeleteInput";
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils';
  import validator from 'src/utils/validator';
  import rpc from 'src/utils/rpc'
  import CreateTemplateNoRoute from "../../../component/CreateTemplateNoRoute";
  import Dropdown from "../../../ecs/autoScalingGroup/component/Dropdown";

  export default {
    name: "SetLoadBalancerListenerDlg",
    mixins: [WindowBase, Root],
    components: {
      Dropdown,
      CreateTemplateNoRoute,
      AddOrDeleteInput
    },
    props: {
      param: {
        type: Object,
        default: {}
      }
    },
    data() {
      return {
        loadbalancerUuid: '',
        protocolTypeList: [
          'TCP',
          'HTTP',
          'HTTPS',
          'UDP'
        ],
        protocol: 'TCP',
        loadBalancerPort: '',
        instancePort: '',
        invalidprotocolType: '',
        connectionIdleTimeout: 60,
        healthyThreshold: 2,
        healthCheckTarget: '',
        unhealthyThreshold: 2,
        healthCheckInterval: 5,
        maxConnection: 5000,
        usedPorts: [],
        balancerAlgorithmList: [
          'roundrobin',
          'source',
          'leastconn',
        ],
        balancerAlgorithm: 'roundrobin',
        systemTags: [],
        certificateUuid: '',
        emptycertificateUuid: '',
        description: '',
        loadbalancerUuid: '',
        portList: []
      }
    },
    created() {
      if (this.param.portList) this.portList = this.param.portList
      else this.portList = []
      if (this.param && this.param.uuid) {
        this.loadbalancerUuid = this.param.uuid
      }
      this.createdCallback()
    },
    methods: {
      ...Utils,
      ...validator,
      openSelectCertificate() {
        this.openDialog('CertificateListSingleSelectList', {
          conditions: [],
          select: (uuid) => this.updateWindow({
            certificateUuid: uuid
          })
        })
      },
      ok: function () {
        let self = this;
        let msg = {
          name: this.windowData.name,
          description: this.description,
          protocol: this.protocol.toLowerCase(),
          loadBalancerPort: this.windowData.loadBalancerPort,
          instancePort: this.windowData.instancePort,
          connectionIdleTimeout: this.windowData.connectionIdleTimeout,
          healthyThreshold: this.windowData.healthyThreshold,
          healthCheckTarget: this.windowData.healthCheckTarget || this.windowData.instancePort,
          unhealthyThreshold: this.windowData.unhealthyThreshold,
          healthCheckInterval: this.windowData.healthCheckInterval,
          maxConnection: this.windowData.maxConnection,
          balancerAlgorithm: this.windowData.maxConnection,
          systemTags: [`balancerAlgorithm::${this.windowData.balancerAlgorithm}`,
            `connectionIdleTimeout::${this.windowData.connectionIdleTimeout}`,
            `healthyThreshold::${this.windowData.healthyThreshold}`,
            `unhealthyThreshold::${this.windowData.unhealthyThreshold}`,
            `healthCheckInterval::${this.windowData.healthCheckInterval}`,
            `maxConnection::${this.windowData.maxConnection}`
          ],
          certificateUuid: this.certificateUuid
        }
        if (msg.protocol === 'udp') {
          msg.systemTags.push(`healthCheckTarget::udp:${this.windowData.healthCheckTarget}`)
        } else {
          msg.systemTags.push(`healthCheckTarget::tcp:${this.windowData.healthCheckTarget}`)
        }
        self.validateAll()
        if (this.windowData.invalidInput) return
        //this.dialogData.param.ok(msg)

        this.$emit('close', msg)
      },
      close() {
        this.$emit('close')
      },
      validateAll() {
        let obj = {}, self = this;
        obj.invalidInput = false
        let props = ['name', 'loadBalancerPort', 'instancePort', 'connectionIdleTimeout', 'healthyThreshold', 'healthCheckTarget', 'unhealthyThreshold', 'maxConnection', 'healthCheckInterval']
        props.forEach(item => self.validate(item))
        let isInvalid = props.some(item => self.windowData[`empty${item}`] || self.windowData[`invalid${item}`] || self.windowData[`used${item}`])
        if (isInvalid) obj.invalidInput = true
        this.updateWindow(obj)
      },
      validate(name) {
        let obj = {}
        obj[`empty${name}`] = false
        let input = name === 'name' ? this.trimProp(name) : this.windowData[name]
        if (!input) {
          obj[`empty${name}`] = true;
        }
        obj[`invalid${name}`] = false

        if (name.indexOf('Port') > -1) {
          let portRange = {
            maxValue: 65535,
            minValue: 1
          }
          if (!this.isUint(input) || !this.isIn(input, portRange)) {
            obj[`invalid${name}`] = true
          }
          obj[`used${name}`] = false
          // if (this.windowData.usedPorts.indexOf(input) > -1) {
          //   obj[`used${name}`] = true
          // }
        }
        let iNames = ['connectionIdleTimeout', 'healthyThreshold', 'healthCheckTarget', 'unhealthyThreshold', 'healthCheckInterval', 'maxConnection']
        if (iNames.indexOf(name) > -1) {
          if (input < 0) {
            obj[`invalid${name}`] = true
          }
          if (name === 'healthCheckTarget') {
            if (!this.isNumber(input) && this.windowData.healthCheckTarget !== 'default') {
              obj[`invalid${name}`] = true
            }
          }
        }
        if (name === 'loadBalancerPort') {
          if (this.windowData.usedPorts.indexOf(input) > -1) {
            obj[`used${name}`] = true
          }
          // obj[`used${name}`] = !(this.portList.every((item) => item !== parseInt(this.windowData[name])))
        }
        this.updateWindow(obj)
      },
      queryCertificateList: function () {
        const self = this
        rpc.query('certificates').then((resp) => {
          if (resp.inventories.length === 1) {
            self.updateWindow({certificateUuid: resp.inventories[0].uuid})
            self.updateDbRow({
              tableName: 'certificate',
              id: resp.inventories[0].uuid,
              data: resp.inventories[0]
            })
          }
        })
      },
      toggleMoreSetting: function () {
        let showMoreSetting = this.windowData.showMoreSetting
        this.updateWindow({showMoreSetting: !showMoreSetting})
      },
      createdCallback() {
        return rpc.query('global-configurations', {
          q: ['category=loadBalancer']
        }).then((resp) => {
          let obj = {
            loadbalancerUuid: this.loadbalancerUuid,
            showMoreDropdownProtocol: false,
            showMoreDropdownbalancerAlgorithm: false,
            name: '',
            vipUuid: this.param.vipUuid,
            createVip: this.param.createVip,
            loadBalancerPort: '',
            instancePort: '',
            connectionIdleTimeout: 60,
            healthyThreshold: 2,
            healthCheckTarget: '',
            unhealthyThreshold: 2,
            healthCheckInterval: 5,
            maxConnection: 5000,
            usedPorts: [],
            balancerAlgorithm: 'roundrobin',
            systemTags: [],
            certificateUuid: ''
          }
          resp.inventories.forEach(it => {
            obj[it.name] = it.value
            if (it.name === 'healthCheckTarget') {
              obj[it.name] = it.value.substring(it.value.lastIndexOf(':') + 1, it.value.length)
            }
          })
          return this.updateWindow(obj)
        }).then(() => {
          let vip = this.windowData.vipUuid
          let createVip = this.windowData.createVip
          if (this.windowData.loadbalancerUuid) {
            this.queryLoadBalancer()
          }
          this.queryCertificateList()
          if (vip && !createVip) {
            return this.initUsedPorts(vip)
          }
        })
      },
      initUsedPorts(vipUuid) {
        return rpc.query(`vips/${vipUuid}/usedports`, {protocol: this.windowData.protocol === 'UDP' ? 'UDP' : 'TCP'}).then(resp => {
          return this.updateWindow({usedPorts: resp.inventories[0].usedPorts})
        })
      },
    }
  }
</script>

<style scoped>
  .operation-block-header {
    border-bottom: 1px solid #DAE0E6;
    padding-bottom: 8px;
    color: #1A2736;
    font-size: 16px;
    cursor: pointer;
    max-width: 350px;
  }

  .title {
    color: #5E6978;
    font-size: 14px;
  }

  .input-rule input {
    height: 40px;
    font-size: 14px;
    color: #333333;
    width: 420px;
    border: 1px solid #DAE0E6;
    padding: 12px;
    border-radius: 2px;
  }

  .input-rule textarea {
    font-size: 14px;
    color: #333333;
    width: 420px;
    border: 1px solid #DAE0E6;
    padding: 10px;
    border-radius: 2px;
  }

  .input-rule .title.required::after {
    content: '*';
    color: #003A00;
    margin-left: 3px;
  }

  .disable-input {
    background-image: url('~assets/start_disabled.svg');
    background: #F4F7F9;
  }

  .disable-input:hover {
    cursor: not-allowed;
  }

  .dropdown-content {
    display: none;
    position: absolute;
    top: 100%;
    left: -1px;
    min-width: 180px;
    z-index: 3000;
    padding-left: 20px;
    padding-right: 20px;
    background: #FFFFFF;
    border: 1px solid #DAE0E6;
    border-radius: 2px;
    cursor: initial;
  }
</style>
