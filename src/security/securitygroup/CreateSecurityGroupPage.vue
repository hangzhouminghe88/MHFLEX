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
 <div style="height: 100%;background: #fff;">
    <create-template>
    <div slot="header" class="create-header">
        <span>
          {{$t("common.createSecurityGroup")}}
        </span>
      <span class="create-back" @click="$router.push('securitygroup')"><i class="el-icon-back"></i>回到安全组列表</span>
    </div>
    <div slot="body" class="create-body">
      <div id="common-name" class="operation-row">
        <div class="title required">
          {{$t("common.name")}}
        </div>
        <help-trigger name="securityGroup"/>
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
      <div id="common-method" class="operation-row">
        <div class="title">
          {{ $t("common.ipType") }}
        </div>
        <el-radio-group v-model="useIpv6">
          <el-radio :label="false">IPv4</el-radio>
          <el-radio :label="true" v-permission="'LICENSE_BASIC_PAID'">IPv6</el-radio>
        </el-radio-group>
      </div>
      <div id="common-network" class="operation-row">
        <div class="title required">
          {{$t("common.network")}}
        </div>
        <div v-if="windowData.l3NetworkUuidList.length > 0" v-for="uuid in windowData.l3NetworkUuidList">
          <add-or-delete-input :value="dbData.l3network[uuid] && dbData.l3network[uuid].name"
                               @remove="removeNetwork(uuid)"></add-or-delete-input>
        </div>
        <div class="content" @click="openSelectL3NetworkDlg();"
             :class="{'is-error': windowData.emptyl3NetworkUuidList}">
          <div class="add"></div>
        </div>
        <div class="error error-text" v-if="windowData.emptyl3NetworkUuidList">
          {{$t('error.unselected')+$t('common.network')}}
        </div>
      </div>

      <div id="common-rule" class="operation-row">
        <div class="title">
          {{$t("common.rule")}}
        </div>
        <div style="margin-bottom:10px;" v-show="windowData.ruleList.length > 0"
             v-for="(item, index) in windowData.ruleList">
          <div class="rule-body">
            <div id="common-type" class="rule-content">
              {{$t("common.type")}}{{($t("common.colon"))}}{{ $t(`securityGroup.${item.type}`) }}
              <div class="delete" @click="deleteRule(index)"></div>
            </div>
            <div id="common-protocol" class="rule-content">
              {{$t("common.protocol")}}{{$t("common.colon")}}{{ item.protocol }}
            </div>
            <div id="common-startPort" class="rule-content">
              {{$t("common.startPort")}}{{$t("common.colon")}} {{ item.startPort }}
            </div>
            <div id="common-endPort" class="rule-content">
              {{$t("common.endPort")}}{{$t("common.colon")}} {{ item.endPort }}
            </div>
            <div class="rule-content">
              CIDR: {{ item.allowedCidr }}
            </div>
            <div id="securityGroup-remoteSecurityGroup" class="rule-content">
              {{$t("securityGroup.remoteSecurityGroup")}}{{$t("common.colon")}}
              <span v-for="uuid in item.remoteSecurityGroupUuids">{{ dbData.securitygroup[uuid].name }}</span>
            </div>
          </div>
        </div>
        <div class="content" @click="openRuleDlg" :class="{'is-error': windowData.emptyl3NetworkUuidList}">
          <div class="add"></div>
        </div>
      </div>

      <div id="common-physicalInterface" class="operation-row">
        <div class="title">
          {{$t("common.physicalInterface")}}
        </div>
        <div class="wrapper vmList" v-if="windowData.vmNicUuidList.length > 0" v-for="uuid in windowData.vmNicUuidList">
          <div class="content">
            {{ dbData.vmNicRefs[uuid] && dbData.vmNicRefs[uuid].internalName }}
            <div class="delete" @click="removeVm($event, uuid)"></div>
          </div>
        </div>
        <div class="content" @click="openSelectVmNicDlg();">
          <div class="add"></div>
        </div>
      </div>

    </div>
    <div slot="footer" class="create-footer">
      <span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && ok()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push('securitygroup')">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
  <div class="add-rule" v-if="showRuleDlg">
   <create-rule-dlg v-if="showRuleDlg" :param="addRuleParam" @close="showRuleDlg=false"/>
  </div>
 </div>
</template>

<script>
  import _ from 'lodash';
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils';
  import SecurityGroupList from './List';
  import CreateTemplate from 'src/component/CreateTemplate';
  import NetWorkSelectListConfirmDlg from "../../dialog/NetWorkSelectListConfirmDlg";
  import CreateRuleDlg from "src/security/securitygroup/component/CreateRule";
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";

  export default {
    name: "CreateSecurityGroupPage",
    mixins: [WindowBase, Root, SecurityGroupList],
    components: {
      AddOrDeleteInput,
      CreateTemplate,
      NetWorkSelectListConfirmDlg,
      CreateRuleDlg
    },
    data() {
      return {
        useIpv6: false,
        networkType: 'IPV4',
        showNetWorkSelectDlg: false,
        showRuleDlg: false,
        message: {},
        canCreate: true,
        addRuleParam: {}
      }
    },
    computed: {},
    mounted() {
      this.updateWindow({
        name: '',
        description: '',
        ruleList: [],
        vmNicUuidList: [],
        l3NetworkUuidList: []
      })
    },
    methods: {
      ...Utils,
      queryForAssistant() {
        let self = this
        let zoneUuid = `zone.uuid=${window.localStorage.getItem('currZoneUuid')}`
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${genUniqueId()}`
          let content = self.dbData.common.isAdmin ? `lackOf${resourceName}` : `lackOfL3Network`
          self.createAssistant({
            id,
            hide: false,
            operation,
            title: 'sgTitle',
            ownerId: self.windowData.id,
            content,
            handler: () => {

            }
          })
        }
        rpc.query('l3-networks', {count: true, q: [zoneUuid, 'system=false']}).then(resp => {
          if (resp.total === 0) newAssistant('PrivateNetwork', 'create')
        })
      },
      checkMethods(useIpv6) {
        if (this.useIpv6 !== useIpv6) {
          this.useIpv6 = useIpv6
          this.updateWindow({
            ruleList: [],
            l3NetworkUuidList: [],
            vmNicUuidList: []
          })
        }
      },
      queryL3network: function () {
        rpc.query('l3-networks', {
          q: ['system=false', 'networkServices.networkServiceType=SecurityGroup', 'l2Network.cluster.type=zstack']
        }).then((resp) => {
          this.updateDbTable({
            tableName: 'l3network',
            list: resp.inventories
          })
          this.queryForAssistant()
          if (resp.inventories.length === 1) {
            this.updateWindow({l3NetworkUuidList: [resp.inventories[0].uuid]})
          }
        })
      },
      createParam: function () {
        return {
          name: this.windowData.name,
          description: this.windowData.description,
          ipVersion: this.useIpv6 ? 6 : 4,
          l3NetworkUuidList: this.windowData.l3NetworkUuidList,
          ruleList: this.windowData.ruleList,
          vmNicUuidList: this.windowData.vmNicUuidList
        }
      },
      openSelectL3NetworkDlg: function () {
        const self = this
        let conditions = ['system=false', 'networkServices.networkServiceType=SecurityGroup', 'l2Network.cluster.type=zstack']
        if (this.useIpv6) conditions.push('ipVersion=6')
        else conditions.push('ipVersion=4')
        if (self.windowData.l3NetworkUuidList.length > 0) {
          conditions.push(`uuid!?=${self.windowData.l3NetworkUuidList}`)
        }

        self.openDialog('L3NetworkMultiSelectListDlg', {
          conditions: conditions,
          select: (uuidList) => {
            self.selectL3Network(uuidList)
          }
        })
      },
      selectL3Network: function (uuidList) {
        if (this.windowData.l3NetworkUuidList.length === 0) {
          this.updateWindow({l3NetworkUuidList: uuidList}).then(() => {
            this.validate('l3NetworkUuidList')
          })
        } else {
          let newUuidList = _.cloneDeep(this.windowData.l3NetworkUuidList)
          this.updateWindow({l3NetworkUuidList: newUuidList.concat(uuidList)})
            .then(() => {
              this.validate('l3NetworkUuidList')
            })
        }
      },
      deleteRule: function (index) {
        let rulesBody = _.cloneDeep(this.windowData.ruleList)
        rulesBody.splice(rulesBody, 1)
        this.updateWindow({ruleList: rulesBody})
      },
      openSelectVmNicDlg: function () {
        const self = this
        self.openDialog('PortForwardingVmNicSingleSelect', {
          conditions: [`usedIp.l3NetworkUuid?=${self.windowData.l3NetworkUuidList}`, 'vmInstance.type=UserVm', `uuid!?=${self.windowData.vmNicUuidList}`, 'vmInstance.state?=Stopped,Running'],
          select: (uuidList) => self.selectVmNic(uuidList)
        })
      },
      selectVmNic: function (uuidList) {
        if (this.windowData.vmNicUuidList.length === 0) {
          this.updateWindow({vmNicUuidList: uuidList})
        } else {
          let newUuidList = _.cloneDeep(this.windowData.vmNicUuidList)
          this.updateWindow({vmNicUuidList: newUuidList.concat(uuidList)})
        }
      },
      removeVm: function ($event, uuid) {
        let list = _.cloneDeep(this.windowData.vmNicUuidList)
        let uuidList = list.filter((i) => i !== uuid)
        this.updateWindow({vmNicUuidList: uuidList})
      },
      removeL3Network: function ($event, uuid) {
        let list = _.cloneDeep(this.windowData.l3NetworkUuidList)
        let uuidList = list.filter((i) => i !== uuid)
        this.updateWindow({l3NetworkUuidList: uuidList}).then(() => {
          this.validate('l3NetworkUuidList')
        })
      },
      validate(name) {
        let obj = {}
        obj[`empty${name}`] = false
        if (name === 'l3NetworkUuidList' && this.windowData.l3NetworkUuidList.length === 0) {
          obj[`empty${name}`] = true
        } else {
          let input = name === 'name' ? String(this.windowData[name]).trim() : this.windowData[name]
          if (!input) {
            obj[`empty${name}`] = true
          }
        }
        this.updateWindow(obj)
      },
      validateAll() {
        let obj = {}
        obj.invalidInput = false
        let props = ['name', 'l3NetworkUuidList']
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => this.windowData[`empty${item}`])
        if (isInvalid) obj.invalidInput = true
        this.updateWindow(obj)
      },
      ok: function () {
        this.validateAll()
        if (this.windowData.invalidInput) {
          return
        }
        this.canCreate = false;
        this.create(this.createParam())
        .then(() => {
          this.$router.push({name:'securitygroup'})
        }).catch(() => {
          this.canCreate = true;
        });
      },

      //===========================================================


      setShowOrFalse(uuidList) {
        this.showNetWorkSelectDlg = false;
        if (!uuidList || uuidList.length <= 0) return;
        if (this.networkType === 'IPV4')
          this.add(uuidList)
        /*if (this.networkType === 'IPV6')
          this.addIPV6(uuidList);*/
      },
      add(uuidList) {
        //let self = this;
        if (this.windowData.networkUuidList.length === 0) {
          this.updateWindow({networkUuidList: uuidList}).then(() => {
            this.validate('networkUuidList')
          })
        } else {
          let newUuidList = _.cloneDeep(this.windowData.networkUuidList)
          uuidList.forEach(function (uuid) {
            let bool = newUuidList.indexOf(uuid);
            if (bool === -1) {
              newUuidList.push(uuid);
            }
          })
          this.updateWindow({networkUuidList: newUuidList}).then(() => {
            this.validate('networkUuidList')
          })

        }
      },
      removeNetwork(uuid) {
        this.windowData.l3NetworkUuidList = this.windowData.l3NetworkUuidList.filter(t => t != uuid)
      },
      removeRule(n) {
        this.windowData.ruleList = this.windowData.ruleList.filter(function (item, index) {
          if (index != n)
            return item;
        })
      },
      openRuleDlg() {
        let self = this;
        this.addRuleParam = {
          isIpv6: self.useIpv6,
          ok: (msg) => {
           let rulesBody = _.cloneDeep(self.windowData.ruleList);
           rulesBody.push(msg);
           rulesBody = _.uniqWith(rulesBody, _.isEqual);
            self.updateWindow({ruleList: rulesBody});
            this.showRuleDlg = false;
          }
        },
        this.showRuleDlg = true;
      },

    }
  }
</script>

<style scoped>
 .add-rule{
   width: 100%;
    height: 100%;
    position: absolute;
    top: 0px;
    right: 0px;
    left: 400px;
    box-shadow: -1px 0px 1px #dae0e6;
 }
</style>
