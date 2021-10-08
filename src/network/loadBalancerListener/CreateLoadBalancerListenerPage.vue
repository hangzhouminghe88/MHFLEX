<style scoped>
  .content {
    height: 40px;
    font-size: 14px;
    color: #333;
    border: 1px solid #adb0b8;
    border-radius: 2px;
    cursor: pointer;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 40px;
    box-sizing: border-box;
    width: 303px
  }

  .add {
    position: absolute;
    background-image: url('~assets/add.svg');
    height: 23px;
    width: 23px;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }

  .delete {
    position: absolute;
    background-image: url('~assets/delete.svg');
    height: 21px;
    width: 21px;
    cursor: pointer;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }

  .rule-body {
    width: 100%;
    border: 1px solid #adb0b8;
    border-radius: 2px;
    padding-bottom: 20px;
  }

  .rule-content {
    height: 30px;
    font-size: 14px;
    color: #333;
    width: 100%;
    padding: 10px;
    border-radius: 2px;
    position: relative;
    box-sizing: border-box;
  }

  .operation-block-header {
    border-bottom: 1px solid #adb0b8;
    padding-bottom: 8px;
    margin-bottom: 15px;
    color: #1a2736;
    font-size: 16px;
    cursor: pointer;
    max-width: 300px;
  }

  .el-radio-group {
    line-height: 40px;
    padding-top: 5px
  }

  .content-size {
    width: 300px;
  }

  .content-size input {
    width: calc(100% - 70px);
    position: relative;
  }

  .content-size .text {
    display: inline-block;
    left: 18px;
    line-height: 40px;
    position: relative;
  }

  .content-size .arrow {
    top: 3px;
    position: relative;
    left: 12px;
  }

  .content-size .size {
    float: right;
    height: 40px;
    width: 60px;
    position: relative;
    border: 1px solid #adb0b8;
    border-radius: 0 2px 2px 0;
    box-sizing: border-box;
  }

  .content-size .drop-size {
    position: relative;
    font-size: 0;
    top: -41px;
    right: 1px;
    width: 60px;
    z-index: 3000;
    background: #fff;
    border-radius: 0 2px 2px 2px;
    border: 1px solid #adb0b8;
    padding: 9px 0;
  }

  .content-size .drop-size a {
    padding: 5px 20px;
    text-decoration: none;
    display: block;
    font-size: 14px;
    color: #1a2736;
    letter-spacing: 0;
    line-height: 20px;
    text-align: center;
  }

  .el-select {
    width: 100%;
  }
</style>

<template>
  <create-template>
    <div slot="header" class="create-header">
        <span>
          {{$t("loadbalancer.createListener")}}
        </span>
      <span class="create-back" @click="$router.push('loadbalancerlistener')"><i class="el-icon-back"></i>回到监听器列表</span>
    </div>
    <div slot="body" class="create-body">
      <div id="common-name" class="operation-row ">
        <div class="title required">
          {{$t("common.name")}}
        </div>
        <help-trigger name="loadBalanceListener"/>
        <input maxlength="255" v-model="windowData.name" :class="{'is-error': windowData.emptyname}"
               @blur="validate('name')" @keydown.enter="validate('name')"/>
        <div v-if="windowData.emptyname" class="error error-text">
          {{$t('loadbalancer.warning.emptyname')}}
        </div>
      </div>

      <div id="common-introduction" class="operation-row">
        <div class="title">
          {{$t("common.introduction")}}
        </div>
        <textarea rows="3" v-model="windowData.description"
                  @input="(e) => { updateWindow({ 'description': e.target.value }) }"/>
      </div>

      <div id="common-protocol" class="operation-row zs-select">
        <div class="title required">
          {{$t("common.protocol")}}
        </div>
        <el-select v-model="windowData.protocol" placeholder="请选择">
          <el-option label="TCP" value="TCP"></el-option>
          <el-option label="HTTP" value="HTTP"></el-option>
          <el-option label="HTTPS" value="HTTPS"></el-option>
          <el-option label="UDP" value="UDP"></el-option>
        </el-select>
      </div>

      <div id="common-certificate" class="operation-row" v-if="windowData.protocol === 'HTTPS'">
        <div class="title">
          {{$t("common.certificate")}}
        </div>
        <div class="content" @click="openSelectCertificate(); setFocus('row0');">
          {{ dbData.certificate && dbData.certificate[windowData.certificateUuid] &&
          dbData.certificate[windowData.certificateUuid].name }}
          <div class="add" v-if="!windowData.certificateUuid"></div>
          <div class="delete" v-else @click.stop="clearRow('certificateUuid');"></div>
        </div>
      </div>

      <div id="loadbalancer-loadBalancerPort" class="operation-row">
        <div class="title required">
          {{ $t("loadbalancer.loadBalancerPort") }}
        </div>
        <input type="number" step="any" @blur="validate('loadBalancerPort')"
               :class="{'is-error': windowData.emptyloadBalancerPort || windowData.invalidloadBalancerPort || windowData.usedloadBalancerPort}"
               @keydown.enter="validate('loadBalancerPort')" v-model="windowData.loadBalancerPort"
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

      <div id="loadbalancer-instancePort" class="operation-row">
        <div class="title required">
          {{ $t("loadbalancer.instancePort")}}
        </div>
        <input type="number" step="any" @blur="validate('instancePort')"
               :class="{'is-error': windowData.emptyinstancePort || windowData.invalidinstancePort || windowData.usedinstancePort}"
               @keydown.enter="validate('instancePort')" v-model="windowData.instancePort"
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

      <div id="common-loadbalancer" class="operation-row">
        <div class="title required">
          {{$t("common.loadbalancer")}}
        </div>
        <div class="content" :class="{'is-error': windowData.emptyloadbalancerUuid}" @click="openSelectLoadbalancer();">
          {{ windowData.loadbalancerUuid && dbData.loadBalancer[windowData.loadbalancerUuid] &&
          dbData.loadBalancer[windowData.loadbalancerUuid].name }}
          <div class="add" v-if="!windowData.loadbalancerUuid"></div>
          <div class="delete" v-else
               @click="clearRow('loadbalancerUuid'); $event.stopPropagation(); validate('loadbalancerUuid')"></div>
        </div>
        <div class="error error-text" v-if="windowData.emptyloadbalancerUuid">
          {{$t('error.unselected')+$t('common.loadbalancer')}}
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
        <div id="loadbalancer-connectionIdleTimeout" class="operation-row" v-if="windowData.showMoreSetting">
          <div class="title required">
            {{ $t("loadbalancer.connectionIdleTimeout") }}
          </div>
          <input type="number" step="any" @blur="validate('connectionIdleTimeout')"
                 :class="{'is-error': windowData.emptyconnectionIdleTimeout}"
                 @keydown.enter="validate('connectionIdleTimeout')" v-model="windowData.connectionIdleTimeout"
                 @input="(e) => { updateWindow({ 'connectionIdleTimeout': e.target.value }) }"/>
          <div v-show="windowData.emptyconnectionIdleTimeout" class="error error-text">
            {{$t('loadbalancer.warning.emptyconnectionIdleTimeout')}}
          </div>
          <div v-show="!windowData.emptyconnectionIdleTimeout && windowData.invalidconnectionIdleTimeout"
               class="error error-text">
            {{$t('error.invalid') + $t('loadbalancer.connectionIdleTimeout')}}
          </div>
        </div>

        <div id="loadbalancer-healthyThreshold" class="operation-row" v-if="windowData.showMoreSetting">
          <div class="title required">
            {{ $t("loadbalancer.healthyThreshold") }}
          </div>
          <input type="number" step="any" @blur="validate('healthyThreshold')"
                 :class="{'is-error': windowData.emptyhealthyThreshold}" @keydown.enter="validate('healthyThreshold')"
                 v-model="windowData.healthyThreshold"
                 @input="(e) => { updateWindow({ 'healthyThreshold': e.target.value }) }"/>
          <div v-show="windowData.emptyhealthyThreshold" class="error error-text">
            {{$t('loadbalancer.warning.emptyhealthyThreshold')}}
          </div>
          <div v-show="!windowData.emptyhealthyThreshold && windowData.invalidhealthyThreshold"
               class="error error-text">
            {{$t('error.invalid') + $t('loadbalancer.healthyThreshold')}}
          </div>
        </div>


        <div id="loadbalancer-healthCheckProtocol" class="operation-row" v-if="windowData.showMoreSetting">
          <div class="title required">
            {{ $t("loadbalancer.healthCheckProtocol") }}
          </div>
          <input disabled class="disable-input" step="any" v-model="windowData.protocol === 'UDP' ? 'UDP' : 'TCP'"/>
        </div>

        <div id="loadbalancer-healthCheckTarget" class="operation-row" v-if="windowData.showMoreSetting">
          <div class="title required">
            {{ $t("loadbalancer.healthCheckTarget") }}
          </div>
          <input step="any" @blur="validate('healthCheckTarget')"
                 :class="{'is-error': windowData.emptyhealthCheckTarget}" @keydown.enter="validate('healthCheckTarget')"
                 v-model="windowData.healthCheckTarget"
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
                 @keydown.enter="validate('unhealthyThreshold')" v-model="windowData.unhealthyThreshold"
                 @input="(e) => { updateWindow({ 'unhealthyThreshold': e.target.value }) }"/>
          <div v-show="windowData.emptyunhealthyThreshold" class="error error-text">
            {{$t('loadbalancer.warning.emptyunhealthyThreshold')}}
          </div>
          <div v-show="!windowData.emptyunhealthyThreshold && windowData.invalidunhealthyThreshold"
               class="error error-text">
            {{$t('error.invalid') + $t('loadbalancer.unhealthyThreshold')}}
          </div>
        </div>

        <div id="loadbalancer-healthCheckInterval" class="operation-row" v-if="windowData.showMoreSetting">
          <div class="title required">
            {{ $t("loadbalancer.healthCheckInterval") }}
          </div>
          <input type="number" step="any" @blur="validate('healthCheckInterval')"
                 :class="{'is-error': windowData.emptyhealthCheckInterval}"
                 @keydown.enter="validate('healthCheckInterval')" v-model="windowData.healthCheckInterval"
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
                 :class="{'is-error': windowData.emptymaxConnection}" v-model="windowData.maxConnection"
                 @input="(e) => { updateWindow({ 'maxConnection': e.target.value }) }"/>
          <div v-show="windowData.emptymaxConnection" class="error error-text">
            {{$t('loadbalancer.warning.emptymaxConnection')}}
          </div>
          <div v-show="!windowData.emptymaxConnection && windowData.invalidmaxConnection" class="error error-text">
            {{$t('error.invalid') + $t('loadbalancer.maxConnection')}}
          </div>
        </div>

        <div id="loadbalancer-balancerAlgorithm" class="operation-row zs-select" v-if="windowData.showMoreSetting">
          <div class="title">
            {{ $t("loadbalancer.balancerAlgorithm") }}
          </div>
          <el-select v-model="windowData.balancerAlgorithm" placeholder="请选择">
            <el-option label="roundrobin" value="roundrobin"></el-option>
            <el-option label="leastconn" value="leastconn"></el-option>
            <el-option label="source" value="source"></el-option>
          </el-select>
        </div>
      </div>


    </div>


    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="ok()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push('loadbalancerlistener')">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import rpc from 'src/utils/rpc'
  import Utils from 'src/utils/utils'
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import Methods from './Methods';
  import Validator from 'src/utils/validator';
  import CreateTemplate from 'src/component/CreateTemplate';
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";

  export default {
    name: "CreateEipPage",
    mixins: [WindowBase, Root, Methods],
    components: {
      AddOrDeleteInput,
      CreateTemplate
    },
    data() {
      return {
        portList: []
      }
    },
    computed: {},
    watch: {
      'windowData.protocol': function (newValue, oldValue) {
        if (newValue === 'HTTPS') {
          this.showAssistant()
        } else {
          this.deleteCurrAssistant(this.windowData.id)
        }
        if (newValue !== oldValue) {
          if (this.windowData.vipUuid) this.initUsedPorts(this.windowData.vipUuid)
          if (this.windowData.loadbalancerUuid) this.getLoadBalancerPort(this.windowData.loadbalancerUuid)
        }
      }
    },
    created() {
      this.createdCallback()
      this.deleteAllAssistant()
      this.queryForAssistant()

    },
    destroyed: function () {
      window.removeEventListener('click', this.onWindowClick)
      this.deleteCurrAssistant(this.windowData.id)
    },

    methods: {
      ...Validator,
      queryForAssistant() {
        let self = this
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${this.genUniqueId()}`
          let content, hide, handler
          handler = () => {
            let dlgName = `Create${resourceName}Dlg`
            self.openFullMainWindow(dlgName,
              {
                ok: (param) => {
                  self[`create${resourceName}`](param, self).then(() => {
                    self.deleteAllAssistant()
                    self.queryForAssistant()
                  }, () => {
                    self.deleteAllAssistant()
                    self.queryForAssistant()
                  })
                },
                cancel: () => {
                  self.queryForAssistant()
                }
              }
            )
          }
          content = `lackOf${resourceName}`
          hide = false
          if (operation === 'check') {
            content = `disabled${resourceName}`
            let table = {
              LoadBalancer: '/main/loadbalancer'
            }
            handler = () => {
              this.$router.push(table[resourceName])
            }
          }
          self.createAssistant({
            id,
            hide,
            title: 'loadBalancerListenerTitle',
            ownerId: self.windowData.id,
            content,
            operation,
            handler
          })
        }
        rpc.query('load-balancers', {count: true}).then(resp => {
          if (resp.total === 0) newAssistant('LoadBalancer', 'add')
          else this.deleteAllAssistant()
        })
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
      openSelectCertificate: function () {
        const self = this
        self.openDialog('CertificateListSingleSelectList', {
          conditions: [],
          select: (uuid) => {
            self.updateWindow({
              certificateUuid: uuid
            })
          }
        })
      },
      createdCallback() {
        let self = this;
        if(self.$route.params.portList) {
          self.portList = self.$route.params.portList;
        }
        return rpc.query('global-configurations', {
          q: ['category=loadBalancer']
        }).then((resp) => {
          let obj = {
            showMoreDropdownProtocol: false,
            showMoreDropdownbalancerAlgorithm: false,
            protocol: 'TCP',
            name: '',
            vipUuid: this.$route.params.vipUuid ? this.$route.params.vipUuid : '',
            createVip: this.$route.params.createVip ? this.$route.params.createVip : '',
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
          this.queryCertificateList()
          if (vip && !createVip) {
            return this.initUsedPorts(vip)
          }
        })
      },
      ...Validator,
      cancel: function () {
        this.closeDialog(this.windowId)
      },
      toggleMoreDropdownDlg: function ($event, show) {
        let obj = {}
        obj[show] = !this.windowData[show]
        this.updateWindow(obj)
        $event.stopPropagation()
      },
      initUsedPorts(vipUuid) {
        return rpc.query(`vips/${vipUuid}/usedports`, {protocol: this.windowData.protocol === 'UDP' ? 'UDP' : 'TCP'}).then(resp => {
          return this.updateWindow({usedPorts: resp.inventories[0].usedPorts})
        })
      },
      toggleMoreSetting: function () {
        let showMoreSetting = this.windowData.showMoreSetting
        this.updateWindow({showMoreSetting: !showMoreSetting})
      },
      clearRow(name) {
        let obj = {}
        obj[name] = ''
        this.updateWindow(obj)
      },
      validate(name) {
        let obj = {}
        obj[`empty${name}`] = false
        let input = name === 'name' ? String(this.windowData[name]).trim() : this.windowData[name]
        if (!input) {
          obj[`empty${name}`] = true
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
          if (this.windowData.usedPorts && this.windowData.usedPorts.indexOf(input) > -1) {
            obj[`used${name}`] = true
          }
          // obj[`used${name}`] = !(this.portList.every((item) => item !== parseInt(this.windowData[name])))
        }
        this.updateWindow(obj)
      },
      validateAll() {
        let obj = {}
        obj.invalidInput = false
        let props = ['name', 'loadBalancerPort', 'instancePort', 'connectionIdleTimeout', 'healthyThreshold', 'healthCheckTarget', 'unhealthyThreshold', 'maxConnection', 'healthCheckInterval', 'loadbalancerUuid']
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => this.windowData[`empty${item}`] || this.windowData[`invalid${item}`] || this.windowData[`used${item}`])
        if (isInvalid) obj.invalidInput = true
        this.updateWindow(obj)
      },
      openSelectLoadbalancer: function () {
        const self = this
        self.openDialog('LoadBalancerSingleSelectDlg', {
          ok: (uuid) => self.selectLoadbalancer(uuid),
          conditions: [`vip.l3Network.zoneUuid=${window.localStorage.getItem('currZoneUuid')}`]
        })
      },
      selectLoadbalancer: function (uuid) {
        this.updateWindow({loadbalancerUuid: uuid, vipUuid: this.dbData.loadBalancer[uuid].vipUuid})
        this.validate('loadbalancerUuid')
        this.getLoadBalancerPort(uuid)
        this.initUsedPorts(this.dbData.loadBalancer[uuid].vipUuid)
      },
      getLoadBalancerPort: function (uuid) {
        const self = this
        self.portList = []
        if (self.dbData.loadBalancer[uuid] && self.dbData.loadBalancer[uuid].listeners && self.dbData.loadBalancer[uuid].listeners.length > 0) {
          self.portList = self.dbData.loadBalancer[uuid].listeners.map((item) => {
            if (self.windowData.protocol === 'UDP') {
              if (item.protocol === 'udp') return item.loadBalancerPort
            } else {
              if (item.protocol !== 'udp') return item.loadBalancerPort
            }
          })
        }
        return self.portList
      },
      ok: function () {
        this.validateAll()
        if (this.windowData.invalidInput) return
        let msg = {
          name: this.windowData.name,
          description: this.windowData.description,
          protocol: this.windowData.protocol.toLowerCase(),
          loadBalancerPort: this.windowData.loadBalancerPort,
          instancePort: this.windowData.instancePort,
          connectionIdleTimeout: this.windowData.connectionIdleTimeout,
          healthyThreshold: this.windowData.healthyThreshold,
          healthCheckTarget: this.windowData.healthCheckTarget || this.windowData.instancePort,
          unhealthyThreshold: this.windowData.unhealthyThreshold,
          healthCheckInterval: this.windowData.healthCheckInterval,
          maxConnection: this.windowData.maxConnection,
          balancerAlgorithm: this.windowData.maxConnection,
          loadbalancerUuid: this.windowData.loadbalancerUuid,
          systemTags: [`balancerAlgorithm::${this.windowData.balancerAlgorithm}`,
            `connectionIdleTimeout::${this.windowData.connectionIdleTimeout}`,
            `healthyThreshold::${this.windowData.healthyThreshold}`,
            `unhealthyThreshold::${this.windowData.unhealthyThreshold}`,
            `healthCheckInterval::${this.windowData.healthCheckInterval}`,
            `maxConnection::${this.windowData.maxConnection}`
          ],
          certificateUuid: this.windowData.certificateUuid
        }
        if (msg.protocol === 'udp') {
          msg.systemTags.push(`healthCheckTarget::udp:${this.windowData.healthCheckTarget}`)
        } else {
          msg.systemTags.push(`healthCheckTarget::tcp:${this.windowData.healthCheckTarget}`)
        }
        this.addListener(msg)
      },
      showAssistant: function () {
        let id = `assistant-${this.genUniqueId()}`
        this.createAssistant({
          id,
          hide: false,
          operation: 'noResource',
          title: 'tips',
          ownerId: this.windowData.id,
          content: 'lbListenerHttps',
          handler: null
        })
      },
      ...Utils
    }
  }
</script>
