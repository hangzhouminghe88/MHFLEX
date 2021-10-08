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
    display: inline-block;
    position: relative;
    width: 100%;
  }
</style>

<template>
  <create-template>
    <div slot="header" class="create-header">
        <span v-if="!windowData.showNext">
          {{$t("portforwarding.create")}}
        </span>
      <span v-if="windowData.showNext">
          {{$t("portforwarding.attachVmNic")}}
        </span>
      <span class="create-back" @click="$router.push('portforwarding')"><i class="el-icon-back"></i>回到端口转发列表</span>
    </div>
    <div slot="body" class="create-body" v-if="!windowData.showNext">
      <div id="common-name" class="operation-row">
        <div class="title required">
          {{ $t("common.name") }}
        </div>
        <help-trigger name="portForwarding"/>
        <input v-model="windowData.name" :class="{'is-error': windowData.emptyname}"
               @input="(e) => { updateWindow({ 'name': e.target.value }) }" @blur="validate('name')"
               @keydown.enter="validate('name')"/>
        <div class="error error-text" v-if="windowData.emptyname">
          {{$t('error.emptyInput')+$t('common.name')}}
        </div>
      </div>

      <div id="common-introduction" class="operation-row">
        <div class="title">
          {{$t("common.introduction")}}
        </div>
        <textarea rows="3" v-model="windowData.description"
                  @input="(e) => { updateWindow({ 'description': e.target.value }) }"/>
      </div>
      <div class="operation-block-header" style="margin-top: 40px;">
        {{ $t("portforwarding.selectVip") }}
      </div>
      <div id="portforwarding-vipMethod" class="operation-row">
        <div class="title">
          {{ $t("portforwarding.vipMethod") }}
        </div>
        <el-radio-group v-model="windowData.ipMode">
          <el-radio :label="true" v-permission="'VIP.CREATE'">{{ $t("portforwarding.createNewVip") }}</el-radio>
          <el-radio :label="false">{{ $t("portforwarding.useExistingVip") }}</el-radio>
        </el-radio-group>
      </div>

      <div id="common-network" class="operation-row" v-if="windowData.ipMode">
        <div class="title required">
          {{$t("common.network")}}
        </div>
        <div v-if="windowData.l3NetworkUuid.length > 0">
          <add-or-delete-input
            :value="dbData.l3network[windowData.l3NetworkUuid] && dbData.l3network[windowData.l3NetworkUuid].name"
            @remove="removeNetwork()"></add-or-delete-input>
        </div>
        <div class="content" @click="portForwardingSelectPublicNetwork();" v-if="windowData.l3NetworkUuid === ''">
          <div class="add"></div>
        </div>
        <div class="error error-text" v-if="windowData.ipMode && windowData.emptyl3NetworkUuid">
          {{$t('error.unselected')+$t('common.network')}}
        </div>
      </div>

      <div id="vip-requiredIP" class="operation-row" v-if="windowData.ipMode">
        <div class="title">
          {{ $t("vip.requiredIP") }}
        </div>
        <input v-model="windowData.requiredIp" :class="{'is-error': windowData.invalidrequiredIp}"
               @blur="validate('requiredIp')" @keydown.enter="validate('requiredIp')"
               @input="(e) => { updateWindow({ 'requiredIp': e.target.value }) }" list="windowData.requiredIPList"/>
        <datalist id="windowData.requiredIPList">
          <option v-for="requiredIp in windowData.requiredIPList" :value="requiredIp">
            {{requiredIp}}
          </option>
        </datalist>
        <div class="error error-text" v-if="windowData.ipMode && windowData.requiredIp && windowData.invalidrequiredIp">
          {{$t('error.invalid')+$t('vip.requiredIP')}}
        </div>
      </div>

      <div id="common-vip" class="operation-row" v-if="!windowData.ipMode">
        <div class="title required">
          {{ $t("common.vip") }}
        </div>
        <div v-if="windowData.vipUuid.length > 0">
          <add-or-delete-input :value="dbData.vip[windowData.vipUuid] && dbData.vip[windowData.vipUuid].name"
                               @remove="removeVip()"></add-or-delete-input>
        </div>
        <div class="content" @click="portforwardingSelectVip();" v-if="windowData.vipUuid === ''">
          <div class="add"></div>
        </div>
        <div class="error error-text" v-if="!windowData.ipMode && windowData.emptyvipUuid">
          {{$t('error.unselected')+$t('common.vip')}}
        </div>
      </div>

      <div id="common-protocol" class="operation-row zs-select">
        <div class="title required">
          {{ $t("common.protocol") }}
        </div>
        <help-trigger name="protocol"/>
        <el-select v-model="windowData.protocolType" placeholder="请选择">
          <el-option label="TCP" value="TCP"></el-option>
          <el-option label="UDP" value="UDP"></el-option>
        </el-select>
      </div>

      <div id="common-port" class="operation-row">
        <div class="operation-block-header" style="margin-top: 40px;margin-bottom: 10px">
          {{ $t("common.port") }}
        </div>
        <help-trigger name="port" :style="{ 'marginTop': '40px'}"/>
        <!--<div class="title required">端口</div>-->
        <el-radio-group v-model="windowData.portMode">
          <el-radio :label="true">{{ $t("portforwarding.specifiesThePort") }}</el-radio>
          <el-radio :label="false">{{ $t("portforwarding.portRange") }}</el-radio>
        </el-radio-group>
      </div>

      <div id="portforwarding-sourceStartPort" class="operation-row" v-if="windowData.portMode">
        <div class="title required">
          {{ $t("portforwarding.sourceStartPort") }}
        </div>
        <input v-model="windowData.vipPortStart" @blur="validate('vipPortStart')"
               :class="{'is-error': windowData.emptyvipPortStart || windowData.invalidvipPortStart || windowData.usedvipPortStart}"
               @keydown.enter="validate('vipPortStart')" type="number" step="any"
               @input="(e) => { updateWindow({ 'vipPortStart': e.target.value, 'vipPortEnd': e.target.value }) }"/>
        <div class="error error-text" v-if="windowData.portMode && windowData.emptyvipPortStart">
          {{$t('error.emptyInput')+$t('portforwarding.sourceStartPort')}}
        </div>
        <div class="error error-text"
             v-if="windowData.portMode && !windowData.emptyvipPortStart && windowData.invalidvipPortStart">
          {{$t('error.invalid')+$t('portforwarding.sourceStartPort')}}
        </div>
        <div id="error-usedPort"
             v-if="windowData.portMode && !windowData.emptyvipPortStart && !windowData.invalidvipPortStart && windowData.usedvipPortStart"
             class="error error-text">
          {{$t('error.usedPort')}}
        </div>
      </div>

      <div class="operation-row" v-if="!windowData.portMode">
        <div class="title required">
          {{ $t("portforwarding.sourceStartPort") }}
        </div>
        <input v-model="windowData.vipPortStart" type="number" step="any"
               :class="{'is-error': windowData.emptyvipPortStart || windowData.invalidvipPortStart || windowData.usedvipPortStartInRange}"
               @blur="validate('vipPortStart')" @keydown.enter="validate('vipPortStart')"
               @input="(e) => { updateWindow({ 'vipPortStart': e.target.value, 'privatePortStart': e.target.value  }) }"/>
        <div class="error error-text" v-if="!windowData.portMode && windowData.emptyvipPortStart">
          {{$t('error.emptyInput')+$t('portforwarding.sourceStartPort')}}
        </div>
        <div class="error error-text"
             v-if="!windowData.portMode && !windowData.emptyvipPortStart && windowData.invalidvipPortStart">
          {{$t('error.invalid')+$t('portforwarding.sourceStartPort')}}
        </div>
        <div
          v-if="!windowData.portMode && !windowData.emptyvipPortStart && !windowData.invalidvipPortStart && windowData.usedvipPortStartInRange"
          class="error error-text">
          {{$t('error.usedPortInRange')}}
        </div>
      </div>

      <div id="portforwarding-sourceEndPort" class="operation-row" v-if="windowData.portMode">
        <div class="title required">
          {{ $t("portforwarding.sourceEndPort") }}
        </div>
        <input disabled class="disable-input" type="number" step="any" v-model="windowData.vipPortStart"/>
      </div>
      <div class="operation-row" v-if="!windowData.portMode">
        <div class="title required">
          {{ $t("portforwarding.sourceEndPort") }}
        </div>
        <input v-model="windowData.vipPortEnd" type="number" step="any" @blur="validate('vipPortEnd')"
               @keydown.enter="validate('vipPortEnd')"
               @input="(e) => { updateWindow({ 'vipPortEnd': e.target.value, 'privatePortEnd': e.target.value }) }"
               :class="{'is-error': windowData.emptyvipPortEnd || windowData.invalidvipPortEnd || windowData.usedvipPortEndInRange}"/>
        <div class="error error-text" v-if="!windowData.portMode && windowData.emptyvipPortEnd">
          {{$t('error.emptyInput')+$t('portforwarding.sourceEndPort')}}
        </div>
        <div class="error error-text"
             v-if="!windowData.portMode && !windowData.emptyvipPortEnd && windowData.invalidvipPortEnd">
          {{$t('error.invalid')+$t('portforwarding.sourceEndPort')}}
        </div>
        <div
          v-if="!windowData.portMode && !windowData.emptyvipPortEnd && !windowData.invalidvipPortEnd && windowData.usedvipPortEndInRange"
          class="error error-text">
          {{$t('error.usedPortInRange')}}
        </div>
      </div>

      <div id="portforwarding-vmInstanceStartPort" class="operation-row" v-if="windowData.portMode">
        <div class="title required">
          {{ $t("portforwarding.vmInstanceStartPort") }}
        </div>
        <input v-model="windowData.privatePortStart" @blur="validate('privatePortStart')"
               :class="{'is-error': windowData.emptyprivatePortStart || windowData.invalidprivatePortStart || windowData.usedprivatePortStart}"
               @keydown.enter="validate('privatePortStart')" type="number" step="any"
               @input="(e) => { updateWindow({ 'privatePortStart': e.target.value, 'privatePortEnd': e.target.value }) }"/>
        <div class="error error-text" v-if="windowData.portMode && windowData.emptyprivatePortStart">
          {{$t('error.emptyInput')+$t('portforwarding.vmInstanceStartPort')}}
        </div>
        <div class="error error-text"
             v-if="windowData.portMode && !windowData.emptyprivatePortStart && windowData.invalidprivatePortStart && !windowData.usedprivatePortStart">
          {{$t('error.invalid')+$t('portforwarding.vmInstanceStartPort')}}
        </div>
        <div
          v-if="windowData.portMode && !windowData.emptyprivatePortStart && !windowData.invalidprivatePortStart && windowData.usedprivatePortStart"
          class="error error-text">
          {{$t('error.usedPort')}}
        </div>
      </div>

      <div class="operation-row" v-if="!windowData.portMode">
        <div class="title required">
          {{ $t("portforwarding.vmInstanceStartPort") }}
        </div>
        <input disabled class="disable-input" v-model="windowData.vipPortStart"/>
      </div>

      <div class="operation-row" v-if="!windowData.portMode">
        <div class="title required">
          {{ $t("portforwarding.vmInstanceEndPort") }}
        </div>
        <input disabled class="disable-input" v-model="windowData.vipPortEnd"/>
      </div>
      <div id="portforwarding-vmInstanceEndPort" class="operation-row" v-if="windowData.portMode">
        <div class="title required">
          {{ $t("portforwarding.vmInstanceEndPort") }}
        </div>
        <input disabled class="disable-input" v-model="windowData.privatePortStart"/>
      </div>
      <div id="portforwarding-allowedCidr" class="operation-row">
        <div class="title">
          {{$t('portforwarding.allowedCidr')}}{{$t("common.colon")}}
        </div>
        <help-trigger name="allowedCidr"/>
        <input v-model="windowData.allowedCidr" placeholder="192.168.1.0/24" @blur="validate('allowedCidr')"
               :class="{'is-error': windowData.invalidallowedCidr}" @keydown.enter="validate('allowedCidr')"
               @input="(e) => { updateWindow({ 'allowedCidr': e.target.value }) }"/>
        <div id="common-cidr" v-if="windowData.invalidallowedCidr" class="error error-text">
          {{$t('error.invalid')+$t('common.cidr')}}
        </div>
      </div>
    </div>
    <div slot="body" class="create-body" v-if="windowData.showNext">
      <div id="common-vm" class="operation-row">
        <div class="title required">
          {{ $t("common.vm") }}
        </div>
        <div v-if="windowData.VmNicUuid.length > 0">
          <add-or-delete-input
            :value="dbData.vmNicRefs[windowData.VmNicUuid] && dbData.vmNicRefs[windowData.VmNicUuid].vmInstanceUuid && dbData.vm[dbData.vmNicRefs[windowData.VmNicUuid].vmInstanceUuid] && dbData.vm[dbData.vmNicRefs[windowData.VmNicUuid].vmInstanceUuid].name"
            @remove="removeVm()"></add-or-delete-input>
        </div>
        <div class="content" @click="portforwardingSelectVm();" v-if="windowData.VmNicUuid === ''">
          <div class="add"></div>
        </div>
        <div class="error error-text" v-if="windowData.showNext && windowData.emptyVmNicUuid">
          {{$t('error.unselected')+$t('common.vm')}}
        </div>
      </div>

    </div>
    <div slot="footer" class="create-footer" v-if="!windowData.showNext">
      <span class="btn-confirm" @click="next()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push('portforwarding')">{{$t('common.cancel')}}</span>
    </div>
    <div slot="footer" class="create-footer" v-if="windowData.showNext">
      <span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && ok()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push('portforwarding')">{{$t('common.cancel')}}</span>
    </div>

  </create-template>
</template>

<script>
  import _ from 'lodash';
  import rpc from 'src/utils/rpc'
  import {genUniqueId} from 'src/utils/utils'
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import Methods from './Methods';
  import Validator from 'src/utils/validator';
  import CreateTemplate from 'src/component/CreateTemplate';
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";

  export default {
    name: "CreatePortForwardingPage",
    mixins: [WindowBase, Root, Methods],
    components: {
      AddOrDeleteInput,
      CreateTemplate
    },
    data() {
      return {
        canCreate: true,
        formRules: {
          name: [
            {required: true, message: '名称不能为空', trigger: 'blur'}
          ]
        },
        vipUuidList: [],
        l3NetworkConditions: [{
          name: 'state',
          op: '=',
          value: 'Enabled'
        }],
        vmConditions: [{
          name: 'state',
          op: '=',
          value: 'Enabled'
        }]

      }
    },
    computed: {},
    created() {
      this.deleteAllAssistant()
      this.updateWindow({
        name: '',
        description: '',
        ipMode: true,
        portMode: true,
        l3NetworkUuid: '',
        protocolType: 'TCP',
        vipPortStart: '',
        vipPortEnd: '',
        privatePortStart: '',
        privatePortEnd: '',
        requiredIp: '',
        vipUuid: '',
        usedPorts: [],
        l3NetworkWindowId: `L3NetworkDlg-${genUniqueId()}`,
        showMoreDropdownProtocolType: false,
        showNext: false,
        portForwardingUuid: '',
        // attachPortForwardingToVm
        vmUuid: '',
        vmNics: [],
        selectedVmNic: '',
        VmNicUuid: '',
        allowedCidr: '',
        vmWindowId: `VmInstanceDlg-${genUniqueId()}`,
        zoneUuid: window.localStorage.getItem('currZoneUuid'),
        showMoreDropdownVmNic: false
      }).then(() => {
        this.queryL3network()
        this.queryVip()
        this.queryPortforwardingVip()
        this.queryForAssistant()
      })
      window.addEventListener('click', this.onWindowClick)

    },
    destroyed: function () {
      this.deleteCurrAssistant(this.windowData.id)
    },

    methods: {
      ...Validator,
      removeNetwork() {
        this.updateWindow({
          l3NetworkUuid: ''
        })
      },
      removeVip() {
        this.updateWindow({
          vipUuid: ''
        })
      },
      removeVm() {
        this.updateWindow({
          VmNicUuid: ''
        })
      },
      initUsedPorts(vip) {
        return rpc.query(`vips/${vip}/usedports`, {protocol: `${this.windowData.protocolType}`}).then(resp => {
          return this.updateWindow({usedPorts: resp.inventories[0].usedPorts})
        })
      },
      queryForAssistant() {
        let self = this
        let zoneUuid = `zone.uuid=${self.windowData.zoneUuid}`
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${this.genUniqueId()}`
          let content = `lackOf${resourceName}`
          let hide = false
          if (resourceName === 'PublicNetwork') {
            content = 'lackOfAvaliableNetwork'
            if (!self.dbData.common.isAdmin) {
              hide = true
              content = 'lackOfAvaliableNetwork_contact'
            }
          }
          self.createAssistant({
            id,
            hide,
            operation,
            title: 'pfTitle',
            ownerId: self.windowData.id,
            content,
            handler: () => {
              self.openFullMainWindow(`Create${resourceName}Dlg`,
                {
                  ok: (param) => {
                    self[`create${resourceName}`](param, self)
                      .then(() => {
                        self.deleteAssistant(id)
                      })
                  },
                  cancel: () => {
                    self.queryForAssistant()
                  }
                }
              )
            }
          })
        }
        if (self.windowData.ipMode) {
          let conditions = [zoneUuid, 'category=Public']
          rpc.query('l3-networks', {count: true, q: conditions}).then(resp => {
            if (resp.total === 0) newAssistant('PublicNetwork', 'create')
          })
        } else {
          rpc.query('vips', {count: true, q: `l3Network.${zoneUuid}`}).then(resp => {
            if (resp.total === 0) newAssistant('Vip', 'create')
          })
        }
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdownProtocolType) this.updateWindow({showMoreDropdownProtocolType: false})
      },
      queryL3network: function () {
        let conditions = [`zoneUuid=${this.windowData.zoneUuid}`, 'category=Public']
        rpc.query('l3-networks', {
          // q: [`zoneUuid=${this.windowData.zoneUuid}`, 'category=Public', 'l2Network.cluster.type!=vmware']
          q: conditions
        }).then((resp) => {
          this.updateDbTable({
            tableName: 'l3network',
            list: resp.inventories
          })


          if (resp.inventories.length === 1) {

            this.updateWindow({l3NetworkUuid: resp.inventories[0].uuid})
            this.getfreeIp(resp.inventories[0].uuid)
          }
        })
      },
      getfreeIp: function (l3NetworkUuid) {
        let requiredIPList = []
        rpc.query(`l3-networks/${l3NetworkUuid}/ip/free`)
          .then((resp) => {
            for (let i = 0; i < resp.inventories.length; ++i) {
              requiredIPList.push(resp.inventories[i].ip)
              if (i === 3) {
                break
              }
            }
            this.updateWindow({requiredIPList})
          })
      },
      queryVip: function () {
        rpc.query('vips', {
          q: `l3Network.zoneUuid=${window.localStorage.getItem('currZoneUuid')}`
        })
          .then((resp) => {
            this.updateDbTable({
              tableName: 'vip',
              list: resp.inventories
            })
            let vipUuidList = []
            resp.inventories.forEach(item => {
              if (!_.has(item, 'useFor') || item.useFor !== 'Eip') {
                vipUuidList.push(item.uuid)
              }
            })
            this.$data.vipUuidList = vipUuidList
            if (vipUuidList.length === 1) {
              this.updateWindow({vipUuid: vipUuidList[0]}).then(() => {
                this.initUsedPorts(this.windowData.vipUuid)
              })
            }
          })
      },
      createParam: function () {
        return {
          name: this.windowData.name,
          description: this.windowData.description,
          protocolType: this.windowData.protocolType,
          vipUuid: this.windowData.vipUuid,
          vipPortStart: parseInt(this.windowData.vipPortStart),
          vipPortEnd: parseInt(this.windowData.vipPortEnd),
          privatePortStart: parseInt(this.windowData.privatePortStart),
          privatePortEnd: parseInt(this.windowData.privatePortEnd),
          allowedCidr: (this.windowData.allowedCidr === '' || this.windowData.allowedCidr === undefined) ? undefined : this.windowData.allowedCidr
        }
      },
      openL3NetworkDlg: function () {
        // const self = this
        this.updateWindow({'showL3NetworkDlg': true})
          .then(function () {

          })
      },
      portForwardingSelectPublicNetwork: function () {
        let conditions = ['category=Public']

        this.openDialog('L3NetworkSingleSelectListDlg', {
          conditions: conditions,
          select: (uuid) => {
            this.selectNetwork(uuid)
          }
        })
      },
      queryPortforwardingVip: function () {
        const self = this
        rpc.query('vips', {
          q: `l3Network.zoneUuid=${window.localStorage.getItem('currZoneUuid')}`
        })
          .then((resp) => {
            self.updateDbTable({
              tableName: 'vip',
              list: resp.inventories
            })
            let vipUuidList = []
            if (resp.inventories.length > 0) {
              resp.inventories.forEach(item => {
                if (!_.has(item, 'useFor') || item.useFor !== 'Eip') {
                  vipUuidList.push(item.uuid)
                }
              })
            }
            self.$data.vipUuidList = vipUuidList
            if (vipUuidList.length === 1) {
              self.updateWindow({vipUuid: vipUuidList[0]}).then(() => {
                self.initUsedPorts(self.windowData.vipUuid)
              })
            }
          })
      },
      portforwardingSelectVm: function () {
        this.openDialog('PortForwardingVmNicSingleSelect', {
          portForwardingUuid: this.windowData.portForwardingUuid,
          type: 'radio',
          select: (uuid) => {
            this.selectedVmNic(uuid)
          }
        })
      },
      portforwardingSelectVip: function () {
        const self = this
        let vipUuidList = []
        let tasks = []
        let p = null
        p = rpc.query('vips', {
          q: `l3Network.zoneUuid=${window.localStorage.getItem('currZoneUuid')}`
          // q: 'l3Network.l2Network.cluster.type!=vmware'
        })
          .then((resp) => {
            if (resp.inventories.length > 0) {
              resp.inventories.forEach(item => {
                if (!_.has(item, 'useFor') || item.useFor !== 'Eip') {
                  vipUuidList.push(item.uuid)
                }
              })
            }
            self.$data.vipUuidList = vipUuidList
            self.updateDbTable({
              tableName: 'vip',
              list: resp.inventories
            })
          })
        tasks.push(p)
        return Promise.all(tasks).then(() => {
          this.openDialog('VipSingleSelectListDlg', {
            conditions: [`uuid?=${vipUuidList}`],
            select: (uuid) => {
              this.selectVip(uuid)
            }
          })
        })
      },
      selectNetwork: function (uuid) {
        this.updateWindow({l3NetworkUuid: uuid}).then(() => {
          this.validate('l3NetworkUuid')
        })
        this.getfreeIp(uuid)
      },
      validate(name) {
        let obj = {}
        let data = this.windowData
        let isPortRange = !data.ipMode && !data.portMode
        obj[`empty${name}`] = false
        let propToBeTrimed = ['name', 'requiredIp', 'allowedCidr']
        let input = propToBeTrimed.indexOf(name) > -1 ? this.trimProp(name) : data[name]
        if (!input) {
          if (isPortRange) {
            obj[`usedvipPortStartInRange`] = false
            obj[`usedvipPortEndInRange`] = false
          }
          obj[`empty${name}`] = true
          this.updateWindow(obj)
          return
        }
        obj[`invalid${name}`] = false
        if (name === 'requiredIp') {
          if (!(this.isIP(input) || this.isIPV6IP(input))) {
            obj[`invalid${name}`] = true
          }
        }
        if (name.indexOf('Port') > -1) {
          let portRange = {
            maxValue: 65535,
            minValue: 1
          }
          if (!this.isUint(input) || !this.isIn(input, portRange)) {
            obj[`invalid${name}`] = true
          }
          if (data.portMode && !data.ipMode && name === 'vipPortStart') {
            obj[`used${name}`] = false
            if (this.windowData.usedPorts.indexOf(input) > -1) {
              obj[`used${name}`] = true
            }
          }
          if (!data.portMode && name === 'vipPortEnd' && data.vipPortStart && Number(data[name]) <= Number(data.vipPortStart)) {
            obj[`invalid${name}`] = true
          }
          if (!data.portMode && name === 'vipPortStart' && data.vipPortEnd && Number(data[name]) >= Number(data.vipPortEnd)) {
            obj[`invalid${name}`] = true
          }
          if (isPortRange && (obj[`invalidvipPortStart`] || obj[`invalidvipPortEnd`])) {
            obj[`usedvipPortStartInRange`] = false
            obj[`usedvipPortEndInRange`] = false
          }
          if (!data.portMode && this.isUint(data.vipPortEnd) && this.isUint(data.vipPortStart) && this.isIn(data.vipPortEnd, portRange) && this.isIn(data.vipPortStart, portRange) && (Number(data.vipPortEnd) > Number(data.vipPortStart))) {
            obj.invalidvipPortStart = false
            obj.invalidvipPortEnd = false
            if (!data.ipMode && _.includes(['vipPortStart', 'vipPortEnd'], name)) {
              obj[`usedvipPortStartInRange`] = false
              obj[`usedvipPortEndInRange`] = false
              if (this.isPortInRange(data.vipPortStart, data.vipPortEnd)) {
                obj[`usedvipPortStartInRange`] = true
                obj[`usedvipPortEndInRange`] = true
              }
            }
          }
        }
        if (name === 'allowedCidr') {
          if (!this.isCidr(input)) {
            obj[`invalid${name}`] = true
          }
        }
        this.updateWindow(obj)
      },
      isPortInRange(start, end) {
        return this.windowData.usedPorts.some(port => {
          return Number(port) <= Number(end) && port >= Number(start)
        })
      },
      validateAll() {
        let obj = {}
        obj.invalidInput = false
        let props = ['name', 'vipPortStart']
        if (this.windowData.portMode) {
          props.push('privatePortStart')
        } else {
          props.push('vipPortEnd')
        }
        if (this.windowData.ipMode) {
          props.push('l3NetworkUuid')
        } else {
          props.push('vipUuid')
        }
        if (this.windowData.requiredIp) {
          props.push('requiredIp')
        }
        if (this.windowData.allowedCidr) {
          props.push('allowedCidr')
        }
        props.forEach(this.validate)
        let isInvalid = props.some(item => this.windowData[`empty${item}`] || this.windowData[`invalid${item}`])
        let usedPort = false
        if (!this.windowData.ipMode) {
          if (this.windowData.portMode) {
            usedPort = ['vipPortStart', 'privatePortStart'].some(item => this.windowData[`used${item}`])
          } else {
            usedPort = ['vipPortStart', 'vipPortEnd'].some(item => this.windowData[`used${item}InRange`])
          }
        }
        if (isInvalid || usedPort) obj.invalidInput = true
        this.updateWindow(obj)
      },
      toggleIpMode: function () {
        let ipMode = !this.windowData.ipMode
        this.updateWindow({ipMode: ipMode}).then(() => {
          this.deleteAllAssistant()
          this.queryForAssistant()
        })
      },
      togglePortMode: function (portMode) {
        this.updateWindow({portMode: portMode})
        this.updateWindow({
          vipPortStart: '',
          vipPortEnd: '',
          privatePortStart: '',
          privatePortEnd: '',
          emptyvipPortStart: false,
          invalidvipPortStart: false,
          usedvipPortStart: false,
          emptyvipPortEnd: false,
          invalidvipPortEnd: false,
          usedvipPortEndInRange: false,
          emptyprivatePortStart: false,
          invalidprivatePortStart: false,
          usedprivatePortStart: false
        })
      },
      toggleMoreDropdownDlg: function ($event, show) {
        let obj = {}
        obj[show] = !this.windowData[show]
        this.updateWindow(obj)
        $event.stopPropagation()
      },
      createVipForPortforwarding: function (param) {
        let event = this.createEvent('portforwarding.action.createVip', param.name, 1)
        return rpc.create('vips', param, event)
          .then((resp) => {
            this.incEventSuccess(event)
            return resp.inventory
          }, () => {
            this.incEventFail(event)
          })
      },
      selectVm: function (uuid) {
        let vmNics = this.dbData.vm[uuid].vmNics
        this.updateWindow({vmUuid: uuid, vmNics: vmNics}).then(() => {
          this.validate('VmNicUuid')
        })
      },
      next: function () {
        this.validateAll()
        if (this.windowData.invalidInput) return
        this.updateWindow({showNext: true})
        let param = this.createParam()
        if (this.windowData.ipMode === true) {
          this.createVipForPortforwarding({
            name: `vip-for-${this.windowData.name}`,
            description: `vip-for-${this.windowData.name}`,
            l3NetworkUuid: this.windowData.l3NetworkUuid,
            requiredIp: this.windowData.requiredIp === '' ? undefined : this.windowData.requiredIp
          }).then((vip) => {
            if (!vip) return
            // this.incEventSuccess(event)
            param.vipUuid = vip.uuid
            this.create(param)
              .then((uuid) => {
                this.updateWindow({portForwardingUuid: uuid})
              })
            this.updateDbTable({
              table: 'vip',
              list: [vip]
            })
          }, () => {
            // this.incEventFail(event)
          })
        }
        if (this.windowData.ipMode === false) {
          this.create(param)
            .then((uuid) => {
              this.updateWindow({portForwardingUuid: uuid})
            })
        }
      },
      selectVip: function (uuid) {
        this.updateWindow({vipUuid: uuid}).then(() => {
          this.validate('vipUuid')
        })
      },
      selectedVmNic: function (uuid) {
        this.updateWindow({VmNicUuid: uuid})
      },
      ok: function () {
        this.validate('VmNicUuid')
        if (!this.windowData.VmNicUuid) {
          return
        }
        this.canCreate = false;
        this.attachPortForwardingRule(this.windowData.portForwardingUuid, this.windowData.VmNicUuid)
          .then( () => {
            this.$router.push({name: 'portforwarding'})
          }).catch(() => {
          this.canCreate = true;
        })
      }
    }
  }
</script>
