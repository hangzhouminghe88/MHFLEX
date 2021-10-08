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
</style>

<template>
  <create-template>
    <div slot="header" class="create-header">
        <span>
          {{$t("common.createSystemNetwork")}}
        </span>
      <span class="create-back" @click="$router.push('systemnetwork')"><i class="el-icon-back"></i>回到系统网络列表</span>
    </div>
    <div slot="body" class="create-body">
      <div id="common-name" class="operation-row">
        <div class="title required">
          {{$t("common.name")}}
        </div>
        <help-trigger name="systemNetwork"/>
        <input v-model="windowData.name" :class="{'is-error': windowData.emptyname}"
               @input="(e) => { updateWindow({ 'name': e.target.value }) }" @blur="validate('name')"
               @keydown.enter="validate('name')"/>
        <div class="error error-text" v-if="windowData.emptyname">
          {{$t("error.emptyInput")+$t("common.name")}}
        </div>
      </div>

      <div id="common-introduction" class="operation-row">
        <div class="title">
          {{$t("common.introduction")}}
        </div>
        <textarea rows="3" v-model="windowData.description"
                  @input="(e) => { updateWindow({ 'description': e.target.value }) }"/>
      </div>

      <div id="common-l2network" class="operation-row">
        <div class="title required">
          {{$t("common.l2network")}}
        </div>
        <div v-if="windowData.l2NetworkUuid.length > 0">
          <add-or-delete-input
            :value="dbData.l2network[windowData.l2NetworkUuid] && dbData.l2network[windowData.l2NetworkUuid].name"
            @remove="removeL2network()"></add-or-delete-input>
        </div>
        <div class="content" @click="openSelectL2Network();" v-if="windowData.l2NetworkUuid.length===0">
          <div class="add" v-if="!windowData.l2NetworkUuid"></div>
        </div>
        <div class="error error-text" v-if="windowData.emptyl2NetworkUuid">
          {{$t("error.unselected")+$t("common.l2network")}}
        </div>
      </div>

      <div id="common-addIpRange" class="operation-block-header" style="margin-top: 40px;">
        {{ $t("common.addIpRange") }}
      </div>
      <div id="common-method" class="operation-row">
        <div class="title">
          {{ $t("common.method") }}
        </div>
        <el-radio-group v-model="windowData.showMethod">
          <el-radio :label="false" v-permission="'L3_IP-RANGE.ADD'">{{ $t("common.ipRange ") }}</el-radio>
          <el-radio :label="true" v-permission="'LICENSE_BASIC_PAID'">{{ $t("common.cidr") }}</el-radio>
        </el-radio-group>
        <help-trigger name="networkRange"/>
      </div>

      <div id="common-cidr" class="operation-row" v-if="windowData.showMethod">
        <div class="title required">
          {{$t("common.cidr")}}
        </div>
        <input v-model="windowData.cidr" :class="{'is-error': windowData.emptycidr || windowData.invalidcidr}"
               @input="(e) => { updateWindow({ 'cidr': e.target.value }) }" @blur="validate('cidr')"
               placeholder="192.168.1.0/24" @keydown.enter="validate('cidr')"/>
        <div class="error error-text" v-if="windowData.showMethod && windowData.emptycidr">
          {{$t("error.emptyInput")+$t("common.cidr")}}
        </div>
        <div class="error error-text" v-if="windowData.showMethod && !windowData.emptycidr && windowData.invalidcidr">
          {{$t("error.invalid")+$t("common.cidr")}}
        </div>
      </div>

      <div id="common-startIp" class="operation-row" v-if="!windowData.showMethod">
        <div class="title required">
          {{$t("common.startIp")}}
        </div>
        <input v-model="windowData.startIp"
               :class="{'is-error': windowData.emptystartIp || windowData.invalidstartIp || showInvalidIPRangeError()}"
               @input="(e) => { updateWindow({ 'startIp': e.target.value }) }" @blur="validate('startIp')"
               @keydown.enter="validate('startIp')"/>
        <div class="error error-text" v-if="!windowData.showMethod && windowData.emptystartIp">
          {{$t("error.emptyInput")+$t("common.startIp")}}
        </div>
        <div class="error error-text"
             v-if="!windowData.showMethod && !windowData.emptystartIp && windowData.invalidstartIp">
          {{$t("error.invalid")+$t("common.startIp")}}
        </div>
        <div class="error error-text" v-if="showInvalidIPRangeError()">
          {{$t("error.invalid")+$t("common.ipRange")}}
        </div>
      </div>

      <div id="common-endIp" class="operation-row" v-if="!windowData.showMethod">
        <div class="title required">
          {{$t("common.endIp")}}
        </div>
        <input v-model="windowData.endIp"
               :class="{'is-error': windowData.emptyendIp || windowData.invalidendIp || showInvalidIPRangeError()}"
               @input="(e) => { updateWindow({ 'endIp': e.target.value }) }" @blur="validate('endIp')"
               @keydown.enter="validate('endIp')"/>
        <div class="error error-text" v-if="!windowData.showMethod && windowData.emptyendIp">
          {{$t("error.emptyInput")+$t("common.endIp")}}
        </div>
        <div class="error error-text"
             v-if="!windowData.showMethod && !windowData.emptyendIp && windowData.invalidendIp">
          {{$t("error.invalid")+$t("common.endIp")}}
        </div>
        <div class="error error-text" v-if="showInvalidIPRangeError()">
          {{$t("error.invalid")+$t("common.ipRange")}}
        </div>
      </div>

      <div id="common-netmask" class="operation-row" v-if="!windowData.showMethod">
        <div class="title required">
          {{$t("common.netmask")}}
        </div>
        <input v-model="windowData.netmask" :class="{'is-error': windowData.emptynetmask || windowData.invalidnetmask}"
               @input="(e) => { updateWindow({ 'netmask': e.target.value }) }" @blur="validate('netmask')"
               @keydown.enter="validate('netmask')"/>
        <div class="error error-text" v-if="!windowData.showMethod && windowData.emptynetmask">
          {{$t("error.emptyInput")+$t("common.netmask")}}
        </div>
        <div class="error error-text"
             v-if="!windowData.showMethod && !windowData.emptynetmask && windowData.invalidnetmask">
          {{$t("error.invalid")+$t("common.netmask")}}
        </div>
      </div>

      <div id="common-gateway" class="operation-row" v-if="!windowData.showMethod">
        <div class="title required">
          {{$t("common.gateway")}}
        </div>
        <input v-model="windowData.gateway" :class="{'is-error': windowData.emptygateway || windowData.invalidgateway}"
               @input="(e) => { updateWindow({ 'gateway': e.target.value }) }" @blur="validate('gateway')"
               @keydown.enter="validate('gateway')"/>
        <div class="error error-text" v-if="!windowData.showMethod && windowData.emptygateway">
          {{$t("error.emptyInput")+$t("common.gateway")}}
        </div>
        <div class="error error-text"
             v-if="!windowData.showMethod && !windowData.emptygateway && windowData.invalidgateway">
          {{$t("error.invalid")+$t("common.gateway")}}
        </div>
      </div>

      <div id="common-addDns" class="operation-block-header" style="margin-top: 40px;">
        {{ $t("common.addDns") }}
      </div>
      <div class="operation-row">
        <div class="title">
          DNS
        </div>
        <help-trigger name="dns"/>
        <input v-model="windowData.dns" placeholder="223.5.5.5"
               :class="{'is-error': !windowData.emptydns && windowData.invaliddns}"
               @input="(e) => { updateWindow({ 'dns': e.target.value }) }" @blur="validate('dns')"
               @keydown.enter="validate('dns')"/>
        <div id="common-dns" class="error error-text" v-if="!windowData.emptydns && windowData.invaliddns">
          {{$t("error.invalid")+$t("common.dns")}}
        </div>
      </div>


    </div>


    <div slot="footer" class="create-footer">
      <span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && ok()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push('systemnetwork')">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import _ from 'lodash';
  import rpc from 'src/utils/rpc'
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import Methods from './Methods';
  import L2NetworkMethods from 'src/network/l2network/Methods';
  import CreateTemplate from 'src/component/CreateTemplate';
  import ClusterSingleDlg from "../../dialog/ClusterSingleDlg";
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";
  import FullPanel from 'src/windows/Base/FullPanel'
  import Validator from 'src/utils/validator';
  import Utils from 'src/utils/utils'

  export default {
    name: "CreateSystemNetworkPage",
    mixins: [WindowBase, Root, Methods],
    components: {
      AddOrDeleteInput,
      CreateTemplate,
      ClusterSingleDlg
    },
    data() {
      return {
        canCreate: true,
        instanceOfferingConditions: [{
          name: 'state',
          op: '=',
          value: 'Enabled'
        }],
        vmwareL2NetworkList: []
      }
    },
    computed: {
      cidrPlaceholder() {
        return this.useIpv6 ? '234e:0:4567::3d/64' : '192.168.1.0/24'
      },
      ipPlaceholder() {
        return this.useIpv6 ? 'CDCD:910A:2222:5498:8475:1111:3900:2020' : '192.168.0.100'
      },
      dnsPlaceholder() {
        return this.useIpv6 ? '240c::6644' : '223.5.5.5'
      },
      gateWayPlaceholder() {
        return this.useIpv6 ? 'CDCD:910A:2222:5498:8475:1111:3900:2020' : '172.20.0.1'
      }
    },
    created() {
      this.deleteAllAssistant()
      let showMethod = false
      if (!this.getApiPermission('L3_IP-RANGE.ADD')) {
        showMethod = true
      }
      this.updateWindow({
        name: '',
        type: 'L3BasicNetwork',
        l2NetworkUuid: '',
        system: true,
        cidr: '',
        startIp: '',
        endIp: '',
        netmask: '',
        gateway: '',
        networkServiceTypes: ['SecurityGroup'],
        selectedServices: [],
        showPrivate: false,
        showMethod,
        showNetworkServiceType: 'vrouter',
        showMoreDropdownNetworkServiceType: false
      }).then(() => {
        return this.getVmwareL2Network()
      }).then(() => {
        this.initL2Network()
        return this.queryForAssistant()
      })
    },
    destroyed: function () {
      this.deleteCurrAssistant(this.windowData.id)
    },

    methods: {
      ...Utils,
      ...Validator,
      ...{
        setVxlanPoolSystemTags: L2NetworkMethods.methods.setVxlanPoolSystemTags,
        createL2Network: L2NetworkMethods.methods.create
      },
      removeL2network() {
        this.updateWindow({
          l2NetworkUuid: ''
        })
      },
      showInvalidIPRangeError: function () {
        if (!this.windowData.showMethod && !this.windowData.emptyendIp && !this.windowData.emptystartIp && !this.windowData.invalidstartIp && !this.windowData.invalidendIp && this.windowData.invalidipRange) return true
        else return false
      },
      initL2Network: function () {
        const self = this
        let l2NetworkUuidList = []
        let conditions = [`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`, 'cluster.type=zstack']
        let l2Path = 'l2-networks'
        let l2Inventories
        if (!this.dbData.common.isAdmin) {
          l2Path = 'l2-networks/vxlan'
        }
        conditions.push('type!=VxlanNetworkPool')
        return rpc.query('l3-networks', {
          q: [`l2Network.cluster.type!=vmware`, `zoneUuid=${window.localStorage.getItem('currZoneUuid')}`],
          fields: 'l2NetworkUuid'
        }).then((l2resp) => {
          l2NetworkUuidList = l2NetworkUuidList.concat(l2resp.inventories.map(it => it.l2NetworkUuid))
          conditions.push(`uuid!?=${l2NetworkUuidList}`)
          return rpc.query(l2Path, {q: conditions}).then(resp => {
            l2Inventories = resp.inventories
            return self.updateDbTable({
              tableName: 'l2network',
              list: resp.inventories
            })
          }).then(() => {
            if (l2Inventories.length === 1) {
              self.updateWindow({l2NetworkUuid: l2Inventories[0].uuid})
            }
          })
        })
      },
      queryForAssistant() {
        let self = this
        let zoneUuid = `zone.uuid=${localStorage.getItem('currZoneUuid')}`
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${this.genUniqueId()}`
          self.createAssistant({
            id,
            operation,
            title: 'systemNetTitle',
            ownerId: self.windowData.id,
            content: `lackOf${resourceName}`,
            handler: () => {
              if(resourceName === 'L2Network') {
                self.$router.push({name: 'createl2network'})
              }
            }
          })
        }
        let l2Path = 'l2-networks'
        if (!this.dbData.common.isAdmin) {
          l2Path = 'l2-networks/vxlan'
        }
        rpc.query(l2Path, {
          count: true,
          q: [zoneUuid, `uuid!?=${this.$data.vmwareL2NetworkList}`, 'type!=VxlanNetworkPool']
        }).then(resp => {
          if (resp.total === 0) newAssistant('L2Network', 'create')
        })
      },
      getVmwareL2Network() {
        return rpc.query(`l3-networks`, {q: `l2Network.cluster.type=vmware`}).then(resp => {
          let vmwareL2NetworkList = resp.inventories.map(l2 => l2.l2NetworkUuid)
          this.$data.vmwareL2NetworkList = vmwareL2NetworkList
        })
      },
      clearRow: function (resourceName) {
        let obj = {}
        obj[resourceName] = ''
        this.updateWindow(obj)
      },
      toggleMoreDropdownDlg: function ($event, show) {
        let obj = {}
        obj[show] = !this.windowData[show]
        this.updateWindow(obj)
        $event.stopPropagation()
      },
      createParam: function () {
        return {
          name: this.windowData.name,
          type: 'L3BasicNetwork',
          l2NetworkUuid: this.windowData.l2NetworkUuid,
          system: true,
          startIp: this.windowData.startIp,
          endIp: this.windowData.endIp,
          netmask: this.windowData.netmask,
          gateway: this.windowData.gateway,
          cidr: this.windowData.cidr,
          ipRangeOrcidr: this.windowData.showMethod,
          category: 'System'
          // networkServices: this.windowData.networkServices
        }
      },
      toggleMethod: function () {
        this.updateWindow({showMethod: this.windowData.showMethod})
      },
      openInstanceOfferingDlg: function () {
        // const self = this
        this.updateWindow({'showInstanceOfferingDlg': true})
          .then(function () {

          })
      },
      validate(name) {
        let obj = {}
        let windowData = this.windowData
        obj[`empty${name}`] = false
        let input = name === 'name' ? String(windowData[name]).trim() : windowData[name]
        if (!input) {
          obj[`empty${name}`] = true
          this.updateWindow(obj)
          return
        }
        obj[`invalid${name}`] = false
        let IPs = ['startIp', 'endIp', 'netmask', 'gateway']
        if (IPs.indexOf(name) > -1) {
          if (!this.isIP(input)) {
            obj[`invalid${name}`] = true
            this.updateWindow(obj)
            return
          }
          let parts = input.split('.')
          let isInvalid = false
          if (name === 'startIp' && windowData.endIp) {
            obj.invalidipRange = false
            let endIpParts = windowData.endIp.split('.')
            for (let i = 0; i < endIpParts.length; i++) {
              if (Number(endIpParts[i]) > Number(parts[i])) {
                break
              }
              if (Number(endIpParts[i]) < Number(parts[i])) {
                obj.invalidipRange = true
                break
              }
            }
          }
          if (name === 'endIp' && windowData.startIp) {
            obj.invalidipRange = false
            let startIpParts = windowData.startIp.split('.')
            for (let i = 0; i < startIpParts.length; i++) {
              if (Number(startIpParts[i]) < Number(parts[i])) {
                break
              }
              if (Number(startIpParts[i]) > Number(parts[i])) {
                obj.invalidipRange = true
                break
              }
            }
          }

          obj[`invalid${name}`] = isInvalid
          if (name === 'netmask' && !this.isValidNetMask(input)) {
            obj[`invalid${name}`] = true
          }
        }
        if (name === 'cidr') {
          if (!this.isCidr(input)) {
            obj[`invalid${name}`] = true
          }
        }
        if (name === 'gateway' && this.windowData.startIp && this.windowData.endIp) {
          obj.invalidgateway = false
          if (this.validateGateway(this.windowData.gateway, this.windowData.startIp, this.windowData.endIp, false)) obj.invalidgateway = true
        }
        this.updateWindow(obj)
      },
      validateAll() {
        let obj = {}
        obj.invalidInput = false
        let props = ['name', 'l2NetworkUuid']
        if (this.windowData.showMethod) {
          props.push('cidr')
        } else {
          props = props.concat(['startIp', 'endIp', 'netmask', 'gateway'])
        }
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => {
          return this.windowData[`empty${item}`] || this.windowData[`invalid${item}`]
        })
        if (isInvalid) obj.invalidInput = true
        if (!this.windowData.showMethod && this.windowData.invalidipRange) obj.invalidInput = true
        this.updateWindow(obj)
      },
      selectInstanceOffering: function (uuid) {
        this.updateWindow({instanceOfferingUuid: uuid})
      },
      selectImage: function (uuid) {
        this.updateWindow({imageUuid: uuid})
      },
      openSelectL2Network: function () {
        let self = this

        this.openDialog('SingleSelectListForL3CreatingDlg', {
          conditions: [`uuid!?=${self.$data.vmwareL2NetworkList}`, 'type!=VxlanNetworkPool'],
          ok: (uuid) => {
            this.selectNetwork(uuid)
          }
        })
      },
      selectNetwork: function (uuid) {
        this.updateWindow({l2NetworkUuid: uuid})
        this.validate('l2NetworkUuid')
      },
      ok: function () {
        this.validateAll()
        if (this.windowData.invalidInput) return
        this.canCreate = false;
        this.create(this.createParam())
          .then(() => {
            this.$router.push({name: 'systemnetwork'})
          })
          .catch(() => {
            this.canCreate = true;
          });
      }
    }
  }
</script>
