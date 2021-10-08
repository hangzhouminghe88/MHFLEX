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
</style>

<template>
  <create-template>
    <div slot="header" class="create-header">
        <span>
          {{$t("l2network.createVxlanPoolNetwork")}}
        </span>
      <span class="create-back" @click="$router.push('vxlanpool')"><i class="el-icon-back"></i>回到VXLAN Pool列表</span>
    </div>
    <div slot="body" class="create-body">
      <div class="operation-row">
        <div class="title">
          {{$t('common.zone')}}{{$t('common.colon')}}{{dbData.zone[windowData.zoneUuid] &&
          dbData.zone[windowData.zoneUuid].name}}
        </div>
      </div>

      <div id="common-name" class="operation-row">
        <div class="title required">
          {{$t("common.name")}}
        </div>
        <help-trigger name="VxlanNetworkPool"/>
        <input v-model="windowData.name" maxlength="255" :class="{'is-error': windowData.emptyname}"
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

      <div id="l2network-startVni" class="operation-row" v-if="windowData.type === 'VxlanNetworkPool'">
        <div class="title required">
          {{$t("l2network.startVni")}}
        </div>
        <input type="number" step="any" v-model="windowData.startVni" maxlength="255"
               :class="{'is-error': windowData.emptystartVni || windowData.invalidstartVni}"
               @input="(e) => { updateWindow({ 'startVni': e.target.value }) }" @blur="validate('startVni')"
               @keydown.enter="validate('startVni')"/>
        <div class="error error-text" v-if="windowData.type === 'VxlanNetworkPool' && windowData.emptystartVni">
          {{$t('error.emptyInput')+$t('l2network.startVni')}}
        </div>
        <div class="error error-text"
             v-if="windowData.type === 'VxlanNetworkPool' && !windowData.emptystartVni && windowData.invalidstartVni">
          {{$t('error.invalid')+$t('l2network.startVni')}}
        </div>
      </div>

      <div id="l2network-endVni" class="operation-row" v-if="windowData.type === 'VxlanNetworkPool'">
        <div class="title required">
          {{$t("l2network.endVni")}}
        </div>
        <input type="number" step="any" v-model="windowData.endVni" maxlength="255"
               :class="{'is-error': windowData.emptyendVni || windowData.invalidendVni}"
               @input="(e) => { updateWindow({ 'endVni': e.target.value }) }" @blur="validate('endVni')"
               @keydown.enter="validate('endVni')"/>
        <div class="error error-text" v-if="windowData.type === 'VxlanNetworkPool' && windowData.emptyendVni">
          {{$t('error.emptyInput')+$t('l2network.endVni')}}
        </div>
        <div class="error error-text"
             v-if="windowData.type === 'VxlanNetworkPool' && !windowData.emptyendVni && windowData.invalidendVni">
          {{$t('error.invalid')+$t('l2network.endVni')}}
        </div>
      </div>

      <div class="operation-row" v-if="windowData.type === 'L2VlanNetwork'">
        <div class="title required">
          Vlan ID
        </div>
        <input type="number" step="any" v-model="windowData.vlan" maxlength="255"
               :class="{'is-error': windowData.emptyvlan || windowData.invalidvlan}"
               @input="(e) => { updateWindow({ 'vlan': e.target.value }) }" @blur="validate('vlan')"
               @keydown.enter="validate('vlan')"/>
        <div class="error error-text" v-if="windowData.type === 'L2VlanNetwork' && windowData.emptyvlan">
          {{$t('error.emptyInput')+$t('common.vlan')}}
        </div>
        <div class="error error-text"
             v-if="windowData.type === 'L2VlanNetwork'  && !windowData.emptyvlan && windowData.invalidvlan">
          {{$t('error.invalid')+$t('common.vlan')}}
        </div>
      </div>

      <div id="l2network-vxlanNetworkPools" class="operation-row" v-if="windowData.type === 'VxlanNetwork'">
        <div class="title required">
          {{$t("l2network.vxlanNetworkPools")}}
        </div>
        <div class="content" :class="{'is-error': windowData.emptyl2NetworkUuid, 'highlight': isFocus('row0')}"
             @click="openSelectL2Network(); setFocus('row0');">
          {{ dbData.l2network[windowData.l2NetworkUuid] && dbData.l2network[windowData.l2NetworkUuid].name }}
          <div class="add" v-if="!windowData.l2NetworkUuid"></div>
          <div class="delete" v-else @click="clearRow('l2NetworkUuid'); validate('l2NetworkUuid')"></div>
        </div>
        <div class="error error-text" v-if="windowData.type === 'VxlanNetwork' && windowData.emptyl2NetworkUuid">
          {{$t('l3network.warning.unselected')+$t('l2network.vxlanNetworkPools')}}
        </div>
      </div>

      <div class="operation-row" v-if="windowData.type === 'VxlanNetwork' && dbData.common.isAdmin">
        <div class="title">
          Vni
        </div>
        <input type="number" step="any" v-model="windowData.vni" :class="{'is-error': windowData.invalidvni}"
               @input="(e) => { updateWindow({ 'vni': e.target.value }) }" @blur="validate('vni')"
               @keydown.enter="validate('vni')"/>
        <div id="common-vni" class="error error-text"
             v-if="windowData.type === 'VxlanNetwork' && dbData.common.isAdmin && windowData.invalidvni">
          {{$t('error.invalid')+$t('common.vni')}}
        </div>
      </div>

      <div id="l2network-nicName" class="operation-row"
           v-if="windowData.type === 'L2VlanNetwork' || windowData.type === 'L2NoVlanNetwork'">
        <div class="title required">
          {{$t("l2network.nicName")}}
        </div>
        <input v-model="windowData.physicalInterface" maxlength="255"
               :class="{'is-error': windowData.emptyphysicalInterface || windowData.invalidphysicalInterface}"
               @input="(e) => { updateWindow({ 'physicalInterface': e.target.value }) }"
               @blur="validate('physicalInterface')" @keydown.enter="validate('physicalInterface')" placeholder="eth0"/>
        <div class="error error-text"
             v-if="(windowData.type === 'L2VlanNetwork' || windowData.type === 'L2NoVlanNetwork') && windowData.emptyphysicalInterface">
          {{$t('error.emptyInput')+$t('l2network.nicName')}}
        </div>
      </div>

      <div id="common-cluster" class="operation-row" v-if="windowData.type !== 'VxlanNetwork' && dbData.common.isAdmin">
        <div class="title">
          {{$t("common.cluster")}}
        </div>
        <add-or-delete-input @open="openSelectClusterDlg()"
                             :value="this.dbData.cluster[windowData.clusterUuid] && this.dbData.cluster[windowData.clusterUuid].name"
                             @remove="removeUuid('clusterUuid')"></add-or-delete-input>
        <cluster-single-dlg :message="message" :model="showClusterSelectDlg" @close="close">
        </cluster-single-dlg>
      </div>

      <div class="operation-row" v-if="windowData.type === 'VxlanNetworkPool' && windowData.clusterUuid !== ''">
        <div class="title required">
          VTEP CIDR
        </div>
        <input v-model="windowData.cidr" :class="{'is-error': windowData.emptycidr || windowData.invalidcidr}"
               placeholder="192.168.1.0/24" maxlength="255" @input="(e) => { updateWindow({ 'cidr': e.target.value }) }"
               @blur="validate('cidr')" @keydown.enter="validate('cidr')"/>
        <div class="error error-text"
             v-if="windowData.type === 'VxlanNetworkPool' && windowData.clusterUuid !== '' && windowData.emptycidr">
          {{$t('error.emptyInput')+$t('common.cidr')}}
        </div>
        <div class="error error-text"
             v-if="windowData.type === 'VxlanNetworkPool' && windowData.clusterUuid !== '' && !windowData.emptycidr && windowData.invalidcidr">
          {{$t('error.invalid')+$t('common.cidr')}}
        </div>
      </div>

    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm" @click="ok">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push('vxlanpool')">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
</template>

<script>
  import _ from 'lodash';
  import rpc from 'src/utils/rpc'
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils';
  import VxlanpoolList from './List';
  import CreateTemplate from 'src/component/CreateTemplate';
  import ClusterSingleDlg from "../../dialog/ClusterSingleDlg";
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";
  import FullPanel from 'src/windows/Base/FullPanel'
  import Validator from 'src/utils/validator';

  export default {
    name: "CreateVxlanpoolPage",
    mixins: [WindowBase, Root, VxlanpoolList, FullPanel],
    components: {
      AddOrDeleteInput,
      CreateTemplate,
      ClusterSingleDlg
    },
    data() {
      return {
        clusterUuid: '',
        formRules: {
          name: [
            {required: true, message: '名称不能为空', trigger: 'blur'}
          ],
          startVni: [
            {required: true, message: '起始Vni不能为空', trigger: 'blur'}
          ],
          endVni: [
            {required: true, message: '结束Vni不能为空', trigger: 'blur'}
          ]
        },
        showClusterSelectDlg: false,
        message: {}
      }
    },
    computed: {},
    created() {
      //this.deleteAllAssistant()
      let curSelectZoneUuid = localStorage.getItem('currZoneUuid')
      if (!this.dbData.common.isAdmin) {
        this.types = ['VxlanNetwork']
      }

      this.updateWindow({
        name: '',
        description: '',
        physicalInterface: '',
        vlan: '',
        cidr: '',
        l2NetworkUuid: '',
        startVni: '',
        vni: '',
        endVni: '',
        type: this.dbData.common.isAdmin ? 'VxlanNetworkPool' : 'VxlanNetwork',
        zoneUuid: curSelectZoneUuid,
        showMoreDropdownType: false,
        clusterUuid: ''
      }).then(() => {
        this.queryCluster()
      })
      this.queryForAssistant()
      window.addEventListener('click', this.onWindowClick)
    },
    destroyed: function () {
      this.deleteCurrAssistant(this.windowData.id)
      window.removeEventListener('click', this.onWindowClick)
    },

    methods: {
      close(uuid) {
        this.showClusterSelectDlg = false;

        if (!uuid || uuid.length <= 0) return;
        this.updateWindow({
          clusterUuid: uuid
        })


      },
      openSelectClusterDlg() {
        this.showClusterSelectDlg = true;
        this.message.selectType = 'selection';
      },
      queryCluster: function () {
        const self = this
        if (self.dbData.common.isAdmin) {
          rpc.query('clusters', {
            q: [`zoneUuid=${self.windowData.zoneUuid}`, 'type=zstack', 'state=Enabled']
          }).then((resp) => {
            if (resp.inventories.length === 1) {
              self.updateWindow({clusterUuid: resp.inventories[0].uuid})
              self.updateDbRow({
                tableName: 'cluster',
                id: resp.inventories[0].uuid,
                data: resp.inventories[0]
              })
            }
          })
        }
      },
      initVxlanPool: function () {
        const self = this
        let zoneUuid = self.windowData.zoneUuid
        if (this.windowData.type === 'VxlanNetwork') {
          rpc.query('l2-networks/vxlan-pool', {q: `zoneUuid=${zoneUuid}`}).then(resp => {
            if (resp.inventories.length === 1) {
              self.updateWindow({l2NetworkUuid: resp.inventories[0].uuid, poolUuid: resp.inventories[0].uuid})
              self.updateDbRow({
                tableName: 'l2network',
                id: resp.inventories[0].uuid,
                data: resp.inventories[0]
              })
            }
          })
        }
      },
      ...Validator,
      queryForAssistant() {
        let self = this
        let zoneUuid = `${localStorage.getItem('currZoneUuid')}`
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${genUniqueId()}`
          let content, hide
          let handler = () => {
            self.openFullMainWindow(`Create${resourceName}Dlg`,
              {
                ok: (param) => {
                  self[`create${resourceName}`](param)
                    .then(() => {
                      self.queryForAssistant()
                      this.windowData.zoneUuid = zoneUuid
                    })
                },
                cancel: () => {
                  self.queryForAssistant()
                }
              }
            )
          }
          if (!this.dbData.common.isAdmin) {
            content = 'lackOfHardWare'
            if (resourceName === 'VxlanNetworkPool') {
              content = 'lackOfVxlanNetworkPool'
            }
            hide = true
          } else {
            content = `lackOf${resourceName}`
            hide = false
          }
          self.createAssistant({
            id,
            operation,
            title: 'l2Title',
            ownerId: self.windowData.id,
            content,
            hide,
            handler
          })
        }
        rpc.query('zones', {count: true}).then(resp => {
          if (resp.total === 0) newAssistant('Zone', 'create')
        })
        if (this.windowData.type === 'VxlanNetwork') {
          rpc.query('l2-networks/vxlan-pool', {count: true, q: [`zoneUuid=${zoneUuid}`]}).then(resp => {
            if (resp.total === 0) {
              newAssistant('VxlanNetworkPool', 'noResource')
            }
          })
        }
      },
      createParam: function () {
        let data = this.windowData
        let hash = {
          'L2NoVlanNetwork': 'no-vlan',
          'L2VlanNetwork': 'vlan',
          'VxlanNetworkPool': 'vxlan-pool',
          'VxlanNetwork': 'vxlan'
        }
        return {
          name: data.name,
          description: data.description,
          type: hash[data.type],
          vlan: data.vlan === '' ? undefined : data.vlan,
          startVni: data.startVni === '' ? undefined : data.startVni,
          endVni: data.endVni === '' ? undefined : data.endVni,
          cidr: data.cidr === '' ? undefined : data.cidr,
          vni: data.vni === '' ? undefined : data.vni,
          poolUuid: data.l2NetworkUuid,
          zoneUuid: data.zoneUuid,
          physicalInterface: (data.type === 'L2NoVlanNetwork' || data.type === 'L2VlanNetwork') ? data.physicalInterface : undefined,
          clusterUuid: this.clusterUuid || data.clusterUuid
        }
      },
      validate(name) {
        let obj = {}
        obj[`empty${name}`] = false
        let propToBeTrimed = ['name', 'cidr']
        let input = propToBeTrimed.indexOf(name) > -1 ? this.trimProp(name) : this.windowData[name]
        if (input === undefined || input === '' || input === null) {
          obj[`empty${name}`] = true
          this.updateWindow(obj)
          return
        }
        obj[`invalid${name}`] = false
        let numbers = ['vni', 'startVni', 'endVni']
        let range = {
          maxValue: 16777214,
          minValue: 1
        }
        let vlanRange = {
          maxValue: 4094,
          minValue: 1
        }
        if (name === 'vlan') {
          if (!this.isUint(input) || !this.isIn(input, vlanRange)) {
            obj[`invalid${name}`] = true
            this.updateWindow(obj)
            return
          }
        }
        if (numbers.indexOf(name) > -1) {
          if (!Number.isInteger(Number(input)) || !this.isIn(input, range)) {
            obj[`invalid${name}`] = true
            this.updateWindow(obj)
            return
          }
          let isInvalid
          if (name === 'startVni' && this.windowData.endVni) {
            let endVni = this.windowData.endVni
            isInvalid = (input - endVni) > 0
          }
          if (name === 'endVni' && this.windowData.startVni) {
            let startVni = this.windowData.startVni
            isInvalid = (input - startVni) < 0
          }
          if (isInvalid) {
            obj[`invalid${name}`] = true
          }
        }
        if (name === 'cidr') {
          if (!this.isCidr(input)) {
            obj[`invalid${name}`] = true
            this.updateWindow(obj)
            return
          }
        }
        this.updateWindow(obj)
      },
      changeType(e) {
        this.updateWindow({'type': e.target.text}).then(() => {
          this.deleteAllAssistant()
          if (this.windowData.type === 'VxlanNetwork') {
            this.queryForAssistant()
            this.initVxlanPool()
          }
        })
      },
      validateAll() {
        let obj = {}
        obj.invalidInput = false
        let type = this.windowData.type
        let props
        switch (type) {
          case 'L2NoVlanNetwork':
            props = ['name', 'physicalInterface']
            break
          case 'L2VlanNetwork':
            props = ['name', 'vlan', 'physicalInterface']
            break
          case 'VxlanNetworkPool':
            props = ['name', 'startVni', 'endVni']
            if (this.windowData.clusterUuid !== '') {
              props.push('cidr')
            }
            break
          case 'VxlanNetwork':
            props = ['name', 'l2NetworkUuid']
            if (String(this.windowData.vni).trim()) {
              props.push('vni')
            }
            break
        }
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => this.windowData[`empty${item}`] || this.windowData[`invalid${item}`])
        if (isInvalid) obj.invalidInput = true
        this.updateWindow(obj)
      },
      ok: function () {
        this.validateAll()
        if (this.windowData.invalidInput || !this.windowData.zoneUuid) return

        this.create(this.createParam());
        this.$router.push({name: 'vxlanpool'});
      },
      toggleMoreDropdownDlg: function ($event, show) {
        let obj = {}
        obj[show] = !this.windowData[show]
        this.updateWindow(obj)
        $event.stopPropagation()
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdownType) this.updateWindow({showMoreDropdownType: false})
      },
      selectZone: function (uuid) {
        this.updateWindow({zoneUuid: uuid})
      },
      openSelectCluster: function () {
        const self = this
        let conditions = ['state=Enabled', `zoneUuid=${self.windowData.zoneUuid}`]
        let dlg = 'ClusterListSingleSelectList'
        if (getLicensePermission('LICENSE_EXTRA_BAREMETAL', self)) {
          dlg = 'KVMClusterAndBaremetalClusterListSingleSelectList'
        } else {
          conditions.push('hypervisorType=KVM')
        }
        self.openSideWindowForCreate(dlg, {
          conditions: conditions,
          select: (uuid) => {
            self.selectCluster(uuid)
          }
        })
      },
      selectCluster: function (uuid) {
        this.updateWindow({clusterUuid: uuid})
      },
      openSelectL2Network: function () {
        this.openSideWindowForCreate('L2NetworkSingleSelectListDlg', {
          VxlanNetworkPool: true,
          conditions: ['type=VxlanNetworkPool', 'cluster.type=zstack'],
          select: (uuid) => this.selectVxlanNetworkPool(uuid)
        })
      },
      selectVxlanNetworkPool: function (uuid) {
        this.updateWindow({l2NetworkUuid: uuid})
        this.validate('l2NetworkUuid')
      },
      removeUuid(uuid) {
        let self = this;
        self[uuid] = ''
      }
    }
  }
</script>
