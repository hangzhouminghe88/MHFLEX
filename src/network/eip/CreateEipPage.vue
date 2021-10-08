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
    width:303px
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
  .delete{
    position: absolute;
    background-image: url('~assets/delete.svg');
    height: 21px;
    width: 21px;
    cursor: pointer;
    top: 50%;
    transform: translateY(-50%);
    right: 8px;
  }
  .rule-body{
    width: 100%;
    border: 1px solid #adb0b8;
    border-radius: 2px;
    padding-bottom: 20px;
  }
  .rule-content{
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
  .el-radio-group{line-height: 40px;padding-top: 5px}

.content-size{width:300px;}
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
</style>

<template>
  <div style="height: 100%; background: #fff;">
    <create-template>
      <div slot="header" class="create-header">
        <span>
          {{$t("common.createEip")}}
        </span>
        <span class="create-back" @click="$router.push('eip')"><i class="el-icon-back"></i>回到弹性IP列表</span>
      </div>
      <div slot="body" class="create-body" v-if="windowData.step == 'createEip'">
        <div id="common-name" class="operation-row">
          <div class="title required">
            {{$t("common.name")}}
          </div>
          <help-trigger name="eip" />
          <input v-model="windowData.name" :class="{'is-error': windowData.emptyname}" @input="(e) => { updateWindow({ 'name': e.target.value }) }" @blur="validate('name')" @keydown.enter="validate('name')" />
          <div class="error error-text" v-if="windowData.emptyname">
            {{$t('error.emptyInput')+$t('common.name')}}
          </div>
        </div>

        <div id="common-introduction" class="operation-row">
          <div class="title">
            {{$t("common.introduction")}}
          </div>
          <textarea rows="3" v-model="windowData.description" @input="(e) => { updateWindow({ 'description': e.target.value }) }" />
        </div>

        <div id="portforwarding-selectVip" class="operation-block-header" style="margin-top: 40px;">
          {{ $t("portforwarding.selectVip") }}
        </div>
        <div id="portforwarding-vipMethod" class="operation-row">
          <div class="title">
            {{ $t("portforwarding.vipMethod") }}
          </div>
          <el-radio-group v-model="windowData.ipMode">
            <el-radio :label="true" v-permission="'VIP.CREATE'">{{ $t("portforwarding.createNewVip") }}</el-radio>
            <el-radio :label="false" >{{ $t("portforwarding.useExistingVip") }}</el-radio>
          </el-radio-group>
        </div>

        <div id="common-network" class="operation-row" v-if="windowData.ipMode">
          <div class="title required">
            {{$t("common.network")}}
          </div>
          <div v-if="windowData.l3NetworkUuid.length > 0">
            <add-or-delete-input :value="dbData.l3network[windowData.l3NetworkUuid] && dbData.l3network[windowData.l3NetworkUuid].name" @remove="removeNetwork()"></add-or-delete-input>
          </div>
          <div class="content" @click="eipSelectL3Network();" v-if="windowData.l3NetworkUuid === ''">
            <div class="add" ></div>
          </div>
          <div class="error error-text" v-if="windowData.ipMode && windowData.emptyl3NetworkUuid">
            {{$t('error.unselected')+$t('common.network')}}
          </div>
        </div>

        <div id="vip-requiredIP" class="operation-row" v-if="windowData.ipMode">
          <div class="title">
            {{ $t("vip.requiredIP") }}
          </div>
          <input v-model="windowData.requiredIp" :class="{'is-error': windowData.requiredIp && windowData.invalidrequiredIp}" @blur="validate('requiredIp')" @keydown.enter="validate('requiredIp')" @input="(e) => { updateWindow({ 'requiredIp': e.target.value }) }" list="windowData.requiredIPList" />
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
            <add-or-delete-input :value="dbData.vip[windowData.vipUuid] && dbData.vip[windowData.vipUuid].name" @remove="removeVip()"></add-or-delete-input>
          </div>
          <div class="content" @click="eipSelectVip();" v-if="windowData.vipUuid === ''">
            <div class="add" ></div>
          </div>
          <div class="error error-text" v-if="!windowData.ipMode && windowData.emptyvipUuid">
            {{$t('error.unselected')+$t('common.vip')}}
          </div>
        </div>

      </div>
      <div slot="body" class="create-body" v-if="windowData.step == 'attachVm'">
        <div id="common-vm" class="operation-row">
          <div class="title required">
            {{$t("common.vm")}}
          </div>
          <add-or-delete-input @open="openVmNicIPSelectListDlg()" :value="getVMNicName()" @remove="removeVmNic()"></add-or-delete-input>
          <div class="error error-text" v-if="windowData.step == 'attachVm' && windowData.emptyVmNicUuid">
            {{$t('error.unselected')+$t('common.vm')}}
          </div>
        </div>
      </div>

      <div slot="footer" class="create-footer">
      <span class="step-item-container">
        <span class="btn-confirm" @click="okCreateEip()" v-if="windowData.step == 'createEip'">{{$t('common.nextStep')}}(1/2)</span>
        <span class="btn-confirm" @click="okAttachVm()" v-if="windowData.step == 'attachVm'">{{$t('common.ok')}}</span>
        <span class="btn-cancel" @click="$router.push('eip')">{{$t('common.cancel')}}</span>
      </span>
      </div>
    </create-template>
    <div style="position: absolute;
    width: calc(100% - 370px);
    top: 0px;
    height: 100%;
    left: 370px;
    "  v-if="showAttachNic">
     <eip-attachable-vm-nics-single-select-list style="box-shadow: -1px 1px #eee;" v-if="showAttachNic" :param="attachEiptoVmParam" @close="showAttachNic = false"></eip-attachable-vm-nics-single-select-list>
    </div>
  </div>
</template>

<script>
  import _ from 'lodash';
  import rpc from 'src/utils/rpc'
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import Methods from './Methods';
  import Validator from 'src/utils/validator';
  import CreateTemplate from 'src/component/CreateTemplate';
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";
  import EipVmNicSelect from "./component/EipVmNicSelect";
  import EipAttachableVmNicsSingleSelectList from "./component/EipAttachableVmNicsSingleSelectList";

  export default {
    name: "CreateEipPage",
    mixins: [WindowBase, Root,Methods],
    components: {
      EipAttachableVmNicsSingleSelectList,
      EipVmNicSelect,
      AddOrDeleteInput,
      CreateTemplate
    },
    data() {
      return {
        showAttachNic: false,
        attachEiptoVmParam: {},
        formRules: {
          name: [
            {required: true, message: '名称不能为空', trigger: 'blur'}
          ]
        },
        clickCeateEipButton: false
      }
    },
    computed: {

    },
    created(){
      this.deleteAllAssistant()
      let ipMode = true
      if (!this.getApiPermission('VIP.CREATE')) {
        ipMode = false
      }
      this.updateWindow({
        name: '',
        ipMode,
        description: '',
        vipUuid: '',
        vmInstanceUuid: '',
        VmNicUuid: '',
        ipUuid: '',
        eipUuid: '',
        requiredIp: '',
        l3NetworkUuid: '',
        // listenersList: [],
        step: 'createEip',
        zoneUuid: window.localStorage.getItem('currZoneUuid')
      }).then(() => {
        this.queryForAssistant()
        this.queryL3network()
        this.queryVip()
      })

    },
    destroyed: function () {
      this.deleteCurrAssistant(this.windowData.id)
    },

    methods: {
      ...Validator,
      removeNetwork()
      {
        this.updateWindow({
          l3NetworkUuid: ''
        })
      },
      removeVmNic ($event) {
       this.updateWindow({VmNicUuid:'', ipUuid: ''})
      },
      queryForAssistant () {
        let self = this
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
            title: 'eipTitle',
            ownerId: self.windowData.id,
            content,
            handler: () => {

            }
          })
        }
        if (self.windowData.ipMode) {
          let l3networkUuidList = []
          let taskList = []
          let conditions = ['category=Public', `zone.uuid=${self.windowData.zoneUuid}`]
          // if (!this.dbData.common.isAdmin) conditions.push('l2Network.cluster.type!=vmware')
          let p = rpc.query('l3-networks', {
            q: conditions
          }).then((resp) => {
            l3networkUuidList = l3networkUuidList.concat(resp.inventories.map(it => it.uuid))
          })
          taskList.push(p)

          conditions = ['networkServices.serviceProvider.type=Flat', 'category=Private', 'networkServices.networkServiceType=Eip', `zone.uuid=${self.windowData.zoneUuid}`]
          // if (!this.dbData.common.isAdmin) conditions.push('l2Network.cluster.type!=vmware')
          p = rpc.query('l3-networks', {
            q: conditions
          }).then((resp) => {
            l3networkUuidList = l3networkUuidList.concat(resp.inventories.map(it => it.uuid))
          })
          taskList.push(p)
          Promise.all(taskList).then(() => {
            if (l3networkUuidList.length === 0) newAssistant('PublicNetwork', 'create')
          })
        } else {
          rpc.query('vips', {count: true, q: `l3Network.zoneUuid=${self.windowData.zoneUuid}`}).then(resp => {
            if (resp.total === 0) newAssistant('Vip', 'create')
          })
        }
      },
      queryL3network: function () {
        const self = this
        let l3networkUuidList = []
        let taskList = []
        let tasks = []
        let q = null
        let conditions = ['category=Public', `zoneUuid=${self.windowData.zoneUuid}`]
        // if (!this.dbData.common.isAdmin) conditions.push('l2Network.cluster.type!=vmware')
        let p = rpc.query('l3-networks', {
          // q: ['l2Network.cluster.type!=vmware', 'category=Public', `zoneUuid=${self.windowData.zoneUuid}`]
          q: conditions
        }).then((resp) => {
          l3networkUuidList = l3networkUuidList.concat(resp.inventories.map(it => it.uuid))
          return self.updateDbTable({
            tableName: 'l3network',
            list: resp.inventories
          })
        })
        taskList.push(p)

        // p = rpc.query('l3-networks', {
        //   q: ['networkServices.serviceProvider.type=Flat', 'system=false', 'networkServices.networkServiceType=Eip', 'category=Private']
        // }).then((resp) => {
        //   l3networkUuidList = l3networkUuidList.concat(resp.inventories.map(it => it.uuid))
        //   return self.updateDbTable({
        //     tableName: 'l3network',
        //     list: resp.inventories
        //   })
        // })
        // taskList.push(p)
        p = rpc.query('l3-networks', {
          q: ['networkServices.serviceProvider.type?=vrouter,VirtualRouter']
        }).then((resp) => {
          let vrouterL3networkUuidList = []
          vrouterL3networkUuidList = vrouterL3networkUuidList.concat(resp.inventories.map(it => it.uuid))
          let conditions = ['networkServices.serviceProvider.type=Flat', 'system=false', 'networkServices.networkServiceType=Eip', 'category=Private', `zoneUuid=${self.windowData.zoneUuid}`]
          if (vrouterL3networkUuidList.length > 0) {
            conditions.push(`uuid!?=${vrouterL3networkUuidList}`)
          }
          q = rpc.query('l3-networks', {
            q: conditions
          }).then((resp) => {
            l3networkUuidList = l3networkUuidList.concat(resp.inventories.map(it => it.uuid))
            return self.updateDbTable({
              tableName: 'l3network',
              list: resp.inventories
            })
          })
          tasks.push(q)
        })
        taskList.push(p)
        return Promise.all(taskList).then(() => {
          return Promise.all(tasks).then(() => {
            if (l3networkUuidList.length === 1) {
              this.updateWindow({ l3NetworkUuid: l3networkUuidList[0] })
              this.getfreeIp(l3networkUuidList[0])
            }
          })
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
            resp.inventories.forEach((item) => {
              if (item.useFor === undefined) {
                vipUuidList.push(item)
              }
            })
            if (vipUuidList.length === 1) {
              this.updateWindow({ vipUuid: vipUuidList[0].uuid })
            }
          })
      },
      createParam: function () {
        return {
          name: this.windowData.name,
          description: this.windowData.description,
          vipUuid: this.windowData.vipUuid,
          requiredIp: this.windowData.requiredIp,
          l3NetworkUuid: this.windowData.l3NetworkUuid,
          ipMode: this.windowData.ipMode
        }
      },
      toggleIpMode: function () {
        let ipMode = !this.windowData.ipMode
        this.updateWindow({ ipMode: ipMode }).then(() => {
          this.deleteAllAssistant()
          this.queryForAssistant()
        })
      },
      eipSelectVip: function () {
        this.openDialog('VipSingleSelectListDlg', {
          conditions:['useFor%20is%20null', `l3Network.zoneUuid=${window.localStorage.getItem('currZoneUuid')}`],
          selectedByEip: true,
          select: (uuid) => {
            this.selectVip(uuid)
          }
        })
      },
      openVmNicIPSelectListDlg: function () {
        let self = this
        let uuid = this.windowData.eipUuid
        self.attachEiptoVmParam = {
          eipUuid: uuid,
          ok: (ipUuid,VmNicUuid) => {
            this.updateWindow({ VmNicUuid, ipUuid }).then(() => {
              this.validate('VmNicUuid')
            })
          }
        }
        self.showAttachNic = true;
      },
      eipSelectL3Network: function () {
        const self = this
        let l3networkUuidList = []
        let taskList = []
        let tasks = []
        let q = null
        let conditions = ['category=Public']
        let p = rpc.query('l3-networks', { // 'l2Network.cluster.type!=vmware',
          q: conditions
        }).then((resp) => {
          l3networkUuidList = l3networkUuidList.concat(resp.inventories.map(it => it.uuid))
        })
        taskList.push(p)

        p = rpc.query('l3-networks', {
          q: ['networkServices.serviceProvider.type?=vrouter,VirtualRouter']
        }).then((resp) => {
          let vrouterL3networkUuidList = []
          vrouterL3networkUuidList = vrouterL3networkUuidList.concat(resp.inventories.map(it => it.uuid))
          let conditions = ['networkServices.serviceProvider.type=Flat', 'system=false', 'networkServices.networkServiceType=Eip', 'category=Private']
          if (vrouterL3networkUuidList.length > 0) {
            conditions.push(`uuid!?=${vrouterL3networkUuidList}`)
          }
          q = rpc.query('l3-networks', {
            q: conditions
          }).then((resp) => {
            l3networkUuidList = l3networkUuidList.concat(resp.inventories.map(it => it.uuid))
          })
          tasks.push(q)
        })
        taskList.push(p)
        return Promise.all(taskList).then(() => {
          return Promise.all(tasks).then(() => {
            self.openDialog('L3NetworkSingleSelectListDlg', {
              conditions:[`uuid?=${l3networkUuidList.join(',')}`],
              select: (uuid) => {
                self.selectNetwork(uuid)
              }
            })
          })
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
            this.updateWindow({ requiredIPList })
          })
      },
      selectNetwork: function (uuid) {
        this.updateWindow({ l3NetworkUuid: uuid }).then(() => {
          this.validate('l3NetworkUuid')
        })
        this.getfreeIp(uuid)
      },

      selectVip: function (uuid) {
        this.updateWindow({ vipUuid: uuid }).then(() => {
          this.validate('vipUuid')
        })
      },
      getVMNicName: function () {
        if (this.windowData.ipUuid && this.windowData.VmNicUuid) {
          return `${this.dbData.vmNicRefs[this.windowData.VmNicUuid].internalName}(${this.dbData.ip[this.windowData.ipUuid].ip})`
        } else return ''
      },

      okCreateEip: function () {
        const self = this
        if (self.clickCeateEipButton) return
        self.clickCeateEipButton = true
        setTimeout(() => {
          self.clickCeateEipButton = false
        }, 1000)
        self.validateAll()
        if (self.windowData.invalidInput) return
        self.updateWindow({step: 'attachVm'})
        self.create(self.createParam())
          .then((uuid) => {
            if (!uuid) return
            self.updateWindow({ eipUuid: uuid })
          })
      },
      attachEip: function (uuid, vmNicIPUuid, vmNicUuid) {
        const self = this
        let event = self.createEvent('eip.action.attach', self.dbData.eip[uuid].name)
        return rpc.post(`eips/${uuid}/vm-instances/nics/${vmNicUuid}`, {
          params: {
            usedIpUuid: vmNicIPUuid
          }
        }, event)
          .then((resp) => {
            let eip = resp.inventory
            rpc.query('vm-instances', {
              q: `vmNics.uuid?=${vmNicUuid}`
            }).then((result) => {
              if (result.inventories.length > 0) {
                eip.vmInstanceUuid = result.inventories[0].uuid
                eip.vmInstanceName = result.inventories[0].name
              }
              self.updateDbRow({
                tableName: 'eip',
                id: uuid,
                data: eip
              })
            })
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
      },
      validate (name) {
        let obj = {}
        let windowData = this.windowData
        obj[`empty${name}`] = false
        let propToBeTrimed = ['name', 'requiredIp']
        let input = propToBeTrimed.indexOf(name) > -1 ? this.trimProp(name) : windowData[name]
        if (!input) {
          obj[`empty${name}`] = true
        }
        obj[`invalid${name}`] = false
        if (name === 'requiredIp') {
          let isIPv6 = this.windowData.l3NetworkUuid && this.dbData.l3network[this.windowData.l3NetworkUuid].ipVersion === 6
          let fuc = isIPv6 ? this.isIPV6IP : this.isIP
          if (!fuc(input)) {
            obj[`invalid${name}`] = true
          }
        }
        this.updateWindow(obj)
      },
      validateAll () {
        const self = this
        let obj = {}
        obj.invalidInput = false
        let props = ['name']
        if (self.windowData.ipMode) {
          if (this.windowData.requiredIp) {
            props.push('requiredIp')
          }
          props.push('l3NetworkUuid')
        } else {
          props.push('vipUuid')
        }
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => {
          return this.windowData[`empty${item}`] || this.windowData[`invalid${item}`]
        })
        if (isInvalid) obj.invalidInput = true
        self.updateWindow(obj)
      },
      okAttachVm: function () {
        this.validate('VmNicUuid')
        if (!this.windowData.ipUuid) {
          return
        }
        this.attachEip(this.windowData.eipUuid, this.windowData.ipUuid, this.windowData.VmNicUuid)
          .then(() => {
            this.$router.push({name: 'eip'})
          })
      },
      ok: function () {
        const self = this
        /*
        if (self.clickCeateEipButton) return
        self.clickCeateEipButton = true
        setTimeout(() => {
          self.clickCeateEipButton = false
        }, 1000)*/

        self.validateAll()
        if (self.windowData.invalidInput) return

        self.updateWindow({step: 'attachVm'})
        self.create(self.createParam())
          .then((uuid) => {
            if (!uuid) return
            self.updateWindow({ eipUuid: uuid })
          })

      }
    }
  }
</script>
