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
          {{$t("common.createEip")}}
        </span>
      <span class="create-back" @click="$router.push('ipsec')"><i class="el-icon-back"></i>回到IPsec隧道列表</span>
    </div>
    <div slot="body" class="create-body">
      <div id="common-name" class="operation-row">
        <div class="title required">
          {{$t("common.name")}}
        </div>
        <help-trigger name="ipsec"/>
        <input v-model="windowData.name" :class="{'is-error': windowData.emptyname}"
               @input="(e) => { updateWindow({ 'name': e.target.value }) }" @blur="validate('name')"
               @keydown.enter="validate('name')"/>
        <div v-if="windowData.emptyname" class="error error-text">
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

      <div id="ipsec-selectVip" class="operation-block-header" style="margin-top: 40px;">
        {{ $t("ipsec.selectVip") }}
      </div>
      <div id="ipsec-vipMethod" class="operation-row">
        <div class="title">
          {{ $t("ipsec.vipMethod") }}
        </div>
        <el-radio-group v-model="windowData.isCreateVip">
          <el-radio :label="true" v-permission="'VIP.CREATE'">{{ $t("loadbalancer.createNewVip") }}</el-radio>
          <el-radio :label="false">{{ $t("loadbalancer.useExistingVip") }}</el-radio>
        </el-radio-group>
      </div>

      <div id="common-network" class="operation-row" v-if="windowData.isCreateVip">
        <div class="title required">
          {{$t("common.network")}}
        </div>
        <div v-if="windowData.publicL3NetworkUuid.length > 0">
          <add-or-delete-input
            :value="dbData.l3network[windowData.publicL3NetworkUuid] && dbData.l3network[windowData.publicL3NetworkUuid].name"
            @remove="removeNetwork()"></add-or-delete-input>
        </div>
        <div class="content" @click="openPublicL3NetworkDlg();" v-if="windowData.publicL3NetworkUuid === ''">
          <div class="add"></div>
        </div>
        <div v-if="windowData.isCreateVip && windowData.emptypublicL3NetworkUuid" class="error error-text">
          {{$t('error.unselected')+$t('common.network')}}
        </div>
      </div>

      <div id="vip-requiredIP" class="operation-row" v-if="windowData.isCreateVip">
        <div class="title">
          {{ $t("vip.requiredIP") }}
        </div>
        <input @blur="validate('requiredIp')" :class="{'is-error': windowData.invalidrequiredIp}"
               @keydown.enter="validate('requiredIp')" v-model="windowData.requiredIp"
               @input="(e) => { updateWindow({ 'requiredIp': e.target.value }) }" list="windowData.requiredIPList"/>
        <datalist id="windowData.requiredIPList">
          <option v-for="(requiredIp, index) in windowData.requiredIPList" :value="requiredIp" :key="index">
            {{requiredIp}}
          </option>
        </datalist>
        <div class="error error-text"
             v-if="windowData.isCreateVip && windowData.requiredIp && windowData.invalidrequiredIp">
          {{$t('error.invalid')+$t('vip.requiredIP')}}
        </div>

      </div>

      <div id="common-vip" class="operation-row" v-if="!windowData.isCreateVip">
        <div class="title required">
          {{ $t("common.vip") }}
        </div>
        <div v-if="windowData.vipUuid.length > 0">
          <add-or-delete-input :value="dbData.vip[windowData.vipUuid] && dbData.vip[windowData.vipUuid].name"
                               @remove="removeVip()"></add-or-delete-input>
        </div>
        <div class="content" @click="eipSelectVip();" v-if="windowData.vipUuid === ''">
          <div class="add"></div>
        </div>
        <div class="error error-text" v-if="!windowData.isCreateVip && windowData.emptyvipUuid">
          {{$t('error.unselected')+$t('common.vip')}}
        </div>
      </div>

      <div id="common-localCidr" class="operation-row">
        <div class="title required">
          {{$t("common.localCidr")}}
        </div>
        <div v-if="windowData.privateL3NetworkUuidList.length > 0" v-for="uuid in windowData.privateL3NetworkUuidList">
          <add-or-delete-input :value="dbData.l3network[uuid] && dbData.l3network[uuid].name"
                               @remove="removePrivateL3NetworkUuid(uuid)"></add-or-delete-input>
        </div>
        <div class="content" @click="pageOpenSubNetwork();">
          <div class="add"></div>
        </div>
        <div class="error error-text" v-if="windowData.emptyprivateL3NetworkUuidList">
          {{$t('error.unselected')+$t('common.localCidr')}}
        </div>
      </div>

      <div id="common-peerAddress" class="operation-row">
        <div class="title required">
          {{$t("common.peerAddress")}}
        </div>
        <input v-model="windowData.peerAddress"
               :class="{'is-error': windowData.emptypeerAddress || windowData.invalidpeerAddress}"
               @blur="validate('peerAddress')" @keydown.enter="validate('peerAddress')"
               @input="(e) => { updateWindow({ 'peerAddress': e.target.value }) }"/>
        <div class="error error-text" v-if="windowData.emptypeerAddress">
          {{$t('error.emptyInput')+$t('common.peerAddress')}}
        </div>
        <div class="error error-text" v-if="!windowData.emptypeerAddress && windowData.invalidpeerAddress">
          {{$t('error.invalid')+$t('common.peerAddress')}}
        </div>
      </div>

      <div id="common-peerCidr" class="operation-row">
        <div class="title required">
          {{$t("common.peerCidr")}}
        </div>
        <input v-model="windowData.peerCidrs" placeholder="192.168.1.0/24, 192.168.2.0/24, 192.168.3.0/24 ..."
               :class="{'is-error': windowData.emptypeerCidrs || windowData.invalidpeerCidrs}"
               @blur="validate('peerCidrs')" @keydown.enter="validate('peerCidrs')"
               @input="(e) => { updateWindow({ 'peerCidrs': e.target.value }) }"/>
        <help-trigger name="ipsecPeerCidr"/>
        <div class="error error-text" v-if="windowData.emptypeerCidrs">
          {{$t('error.emptyInput')+$t('common.peerCidr')}}
        </div>
        <div class="error error-text" v-if="!windowData.emptypeerCidrs && windowData.invalidpeerCidrs">
          {{$t('error.invalid')+$t('common.peerCidr')}}
        </div>
      </div>

      <div id="common-authKey" class="operation-row">
        <div class="title required">
          {{$t("common.authKey")}}
        </div>
        <input v-model="windowData.authKey" @blur="validate('authKey')" :class="{'is-error': windowData.emptyauthKey}"
               @keydown.enter="validate('authKey')" @input="(e) => { updateWindow({ 'authKey': e.target.value }) }"/>
        <div class="error error-text" v-if="windowData.emptyauthKey">
          {{$t('error.emptyInput')+$t('common.authKey')}}
        </div>
      </div>

      <div id="common-moreSettings" class="operation-block-header" style="margin-top: 40px;cursor: pointer;"
           @click="toggleMoreSetting">
        {{$t("common.moreSettings")}}
        <span>
            <img class="arrow" v-if="!windowData.showMoreSetting" src="~assets/arrow_up.svg"/>
            <img class="arrow" v-if="windowData.showMoreSetting" src="~assets/arrow_down.svg"/>
          </span>
      </div>

      <div class="more-wrapper" v-if="windowData.showMoreSetting">
        <div id="common-authMode" class="operation-row zs-select">
          <div class="title">
            {{$t("common.authMode")}}
          </div>
          <el-select v-model="windowData.authMode" placeholder="请选择">
            <el-option label="psk" value="psk"></el-option>
          </el-select>
        </div>
        <div id="common-policyMode" class="operation-row zs-select">
          <div class="title">
            {{$t("common.policyMode")}}
          </div>
          <el-select v-model="windowData.policyMode" placeholder="请选择">
            <el-option label="tunnel" value="tunnel"></el-option>
          </el-select>
        </div>
        <div id="common-ikeAuthAlgorithm" class="operation-row zs-select">
          <div class="title">
            {{$t("common.ikeAuthAlgorithm")}}
          </div>
          <el-select v-model="windowData.ikeAuthAlgorithm" placeholder="请选择">
            <el-option label="md5" value="md5"></el-option>
            <el-option label="sha1" value="sha1"></el-option>
            <el-option label="sha256" value="sha256"></el-option>
            <el-option label="sha384" value="sha384"></el-option>
            <el-option label="sha512" value="sha512"></el-option>
          </el-select>

        </div>
        <div id="common-ikeEncryptionAlgorithm" class="operation-row zs-select">
          <div class="title">
            {{$t("common.ikeEncryptionAlgorithm")}}
          </div>
          <el-select v-model="windowData.ikeEncryptionAlgorithm" placeholder="请选择">
            <el-option label="3des" value="3des"></el-option>
            <el-option label="aes-128" value="aes-128"></el-option>
            <el-option label="aes-256" value="aes-256"></el-option>
          </el-select>
        </div>
        <div id="common-ikeDhGroup" class="operation-row zs-select">
          <div class="title">
            {{$t("common.ikeDhGroup")}}
          </div>
          <el-select v-model="windowData.ikeDhGroup" placeholder="请选择">
            <el-option :label="text" :value="text" v-for="(text, index) in windowData.ikeDhGroupList"
                       :key="index"></el-option>
          </el-select>
        </div>
        <div id="common-transformProtocol" class="operation-row zs-select">
          <div class="title">
            {{$t("common.transformProtocol")}}
          </div>
          <el-select v-model="windowData.transformProtocol" placeholder="请选择">
            <el-option label="esp" value="esp"></el-option>
          </el-select>
        </div>
        <div id="common-policyAuthAlgorithm" class="operation-row zs-select">
          <div class="title">
            {{$t("common.policyAuthAlgorithm")}}
          </div>
          <el-select v-model="windowData.policyAuthAlgorithm" placeholder="请选择">
            <el-option label="md5" value="md5"></el-option>
            <el-option label="sha1" value="sha1"></el-option>
            <el-option label="sha256" value="sha256"></el-option>
            <el-option label="sha384" value="sha384"></el-option>
            <el-option label="sha512" value="sha512"></el-option>
          </el-select>
        </div>
        <div id="common-policyEncryptionAlgorithm" class="operation-row zs-select">
          <div class="title">
            {{$t("common.policyEncryptionAlgorithm")}}
          </div>
          <el-select v-model="windowData.policyEncryptionAlgorithm" placeholder="请选择">
            <el-option label="3des" value="3des"></el-option>
            <el-option label="aes-128" value="aes-128"></el-option>
            <el-option label="aes-256" value="aes-256"></el-option>
          </el-select>
        </div>
        <div id="common-showMoreDropdownPfs" class="operation-row zs-select">
          <div class="title">
            {{$t("common.showMoreDropdownPfs")}}(PFS)
          </div>
          <el-select v-model="windowData.pfs" placeholder="请选择">
            <el-option label="无" value=""></el-option>
            <el-option label="dh-group2" value="dh-group2"></el-option>
            <el-option label="dh-group5" value="dh-group5"></el-option>
            <el-option label="dh-group14" value="dh-group14"></el-option>
            <el-option label="dh-group15" value="dh-group15"></el-option>
            <el-option label="dh-group16" value="dh-group16"></el-option>
            <el-option label="dh-group17" value="dh-group17"></el-option>
            <el-option label="dh-group18" value="dh-group18"></el-option>
            <el-option label="dh-group19" value="dh-group19"></el-option>
            <el-option label="dh-group20" value="dh-group20"></el-option>
            <el-option label="dh-group21" value="dh-group21"></el-option>
            <el-option label="dh-group22" value="dh-group22"></el-option>
            <el-option label="dh-group23" value="dh-group23"></el-option>
            <el-option label="dh-group24" value="dh-group24"></el-option>
            <el-option label="dh-group25" value="dh-group25"></el-option>
            <el-option label="dh-group26" value="dh-group26"></el-option>
          </el-select>
        </div>
      </div>

    </div>

    <div slot="footer" class="create-footer">
      <span class="btn-confirm" :class="{'disabled': !canCreate}" @click="canCreate && ok()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="$router.push('ipsec')">{{$t('common.cancel')}}</span>
    </div>
  </create-template>
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

  export default {
    name: "CreateIPsecPage",
    mixins: [WindowBase, Root, Methods],
    components: {
      AddOrDeleteInput,
      CreateTemplate
    },
    data() {
      return {
        vipUuidList: [],
        instanceOfferingConditions: [{
          name: 'state',
          op: '=',
          value: 'Enabled'
        }],
        canCreate: true
      }
    },
    computed: {},
    created() {
      this.deleteAllAssistant()
      let isCreateVip = true
      if (!this.getApiPermission('VIP.CREATE')) {
        isCreateVip = false
      }
      this.updateWindow({
        vipList: [],
        single: true,
        numbers: 1,
        name: '',
        description: '',
        vipUuid: '',
        requiredIp: '',
        vipAddress: '',
        l3NetworkUuid: '',
        privateL3NetworkUuidList: [],
        publicL3NetworkUuid: '',
        peerAddress: '',
        peerCidrs: '',
        authKey: '',
        authMode: 'psk',
        policyMode: 'tunnel',
        ikeAuthAlgorithm: 'sha1',
        policyAuthAlgorithm: 'sha1',
        ikeEncryptionAlgorithm: '3des',
        ikeDhGroup: '2',
        policyEncryptionAlgorithm: '3des',
        transformProtocol: 'esp',
        pfs: 'dh-group2',
        isCreateVip,
        showMoreSetting: false,
        showMoreDropdownAuthMode: false,
        showMoreDropdownPolicyMode: false,
        showMoreDropdownIkeAuthAlgorithm: false,
        showMoreDropdownIkeEncryptionAlgorithm: false,
        showMoreDropdownIkeDhGroup: false,
        showMoreDropdownTransformProtocol: false,
        showMoreDropdownPolicyAuthAlgorithm: false,
        showMoreDropdownPolicyEncryptionAlgorithm: false,
        showMoreDropdownPfs: false,
        showMoreDropdownVip: false,
        zoneUuid: window.localStorage.getItem('currZoneUuid'),
        ikeDhGroupList: [2, 5, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]
      }).then(() => {
        this.queryForAssistant()
        this.init()
      })

    },
    destroyed: function () {
      this.deleteCurrAssistant(this.windowData.id)
    },

    methods: {
      ...Validator,
      queryForAssistant() {
        let self = this
        let zoneUuid = `zone.uuid=${self.windowData.zoneUuid}`
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${this.genUniqueId()}`
          self.createAssistant({
            id,
            hide: false,
            operation,
            title: 'ipsecTitle',
            ownerId: self.windowData.id,
            content: `lackOf${resourceName}`,
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
        rpc.query('l3-networks', {count: true, q: [zoneUuid, 'system=false']}).then(resp => {
          if (resp.total === 0) newAssistant('PrivateNetwork', 'create')
        })
        if (self.windowData.isCreateVip) {
          let conditions = [zoneUuid, 'category=Public']
          if (this.dbData.common.isAdmin) conditions.push('l2Network.cluster.type!=vmware')
          rpc.query('l3-networks', {count: true, q: conditions}).then(resp => {
            if (resp.total === 0) newAssistant('PublicNetwork', 'create')
          })
        } else {
          rpc.query('vips', {count: true, q: `l3Network.${zoneUuid}`}).then(resp => {
            if (resp.total === 0) newAssistant('Vip', 'create')
          })
        }
      },
      init: async function () {
        await this.setVipUuid()
        await this.setPublicL3networkUuid()
        await this.setPrivateL3NetworkUuid()
      },
      queryVRouter: async function (c = []) {
        let conditions = [`zoneUuid=${this.windowData.zoneUuid}`]
        let resp = await rpc.query('vm-instances/appliances/virtual-routers', {
          q: conditions.concat(c)
        })
        return resp
      },
      queryPublicL3network: async function () {
        let vRouterResp = await this.queryVRouter()
        let vRouterUuidList = vRouterResp.inventories.map(item => item.uuid)
        let conditions = [`zoneUuid=${this.windowData.zoneUuid}`, 'category=Public', `vmNic.vmInstanceUuid?=${vRouterUuidList}`]
        // if (this.dbData.common.isAdmin) conditions.push('l2Network.cluster.type!=vmware')
        let l3Resp = await rpc.query('l3-networks', {
          q: conditions
        })
        this.updateDbTable({
          tableName: 'l3network',
          list: l3Resp.inventories
        })
        return l3Resp
      },
      setPublicL3networkUuid: async function () {
        let l3Resp = await this.queryPublicL3network()
        if (l3Resp.inventories.length === 1) {
          this.updateWindow({publicL3NetworkUuid: l3Resp.inventories[0].uuid})
          this.getfreeIp(l3Resp.inventories[0].uuid)
        }
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

      queryPrivateL3network: async function (vRouterUuidList) {
        let l3networkResp = await rpc.query(`l3-networks`, {
          q: [`vmNic.vmInstanceUuid?=${vRouterUuidList}`, 'category=Private']
        })
        return l3networkResp
      },
      setPrivateL3NetworkUuid: async function () {
        let vRouterResp = await this.queryVRouter()
        let vRouterUuidList = vRouterResp.inventories.map(vrouter => vrouter.uuid)
        let l3Resp = await this.queryPrivateL3network(vRouterUuidList)
        if (l3Resp.inventories.length === 1) {
          this.updateWindow({privateL3NetworkUuid: l3Resp.inventories[0].uuid})
        }
      },
      queryVip: async function () {
        let conditions = []
        if (!this.dbData.common.isAdmin) conditions.push('l3Network.l2Network.cluster.type!=vmware')
        let vipResp = await rpc.query('vips', {
          q: conditions
        })
        this.updateDbTable({
          tableName: 'vip',
          list: vipResp.inventories
        })
        return vipResp
      },
      setVipUuid: async function () {
        let vipResp = await this.queryVip()
        let vipUuidList = []
        vipResp.inventories.forEach(item => {
          if (!_.has(item, 'useFor') || item.useFor !== 'Eip') {
            vipUuidList.push(item.uuid)
          }
        })
        this.$data.vipUuidList = vipUuidList
        if (vipUuidList.length === 1) {
          this.updateWindow({vipUuid: vipUuidList[0]})
        }
      },
      createParam: function () {
        return {
          isCreateVip: this.windowData.isCreateVip,
          name: this.windowData.name,
          description: this.windowData.description,
          vipUuid: this.windowData.vipUuid,
          requiredIp: this.windowData.requiredIp,
          vipAddress: this.windowData.vipAddress,
          publicL3NetworkUuid: this.windowData.publicL3NetworkUuid,
          privateL3NetworkUuidList: this.windowData.privateL3NetworkUuidList,
          peerAddress: this.windowData.peerAddress,
          peerCidrs: _.uniq(_.trim(this.windowData.peerCidrs).split(',')),
          authKey: this.windowData.authKey,
          authMode: this.windowData.authMode,
          policyMode: this.windowData.policyMode,
          ikeAuthAlgorithm: this.windowData.ikeAuthAlgorithm,
          policyAuthAlgorithm: this.windowData.policyAuthAlgorithm,
          ikeEncryptionAlgorithm: this.windowData.ikeEncryptionAlgorithm,
          ikeDhGroup: this.windowData.ikeDhGroup,
          policyEncryptionAlgorithm: this.windowData.policyEncryptionAlgorithm,
          transformProtocol: this.windowData.transformProtocol,
          pfs: this.windowData.pfs
        }
      },
      ipSecSelectVip: function () {
        const self = this
        let vipUuidList = []
        let tasks = []
        let p = null
        let conditions = [`l3Network.zoneUuid=${window.localStorage.getItem('currZoneUuid')}`]
        if (!this.dbData.common.isAdmin) conditions.push('l3Network.l2Network.cluster.type!=vmware')
        p = rpc.query('vips', {
          q: conditions
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

            if (vipUuidList.length === 1) {
              self.updateWindow({vipUuid: vipUuidList[0]})
            }
          })
        tasks.push(p)
        return Promise.all(tasks).then(() => {
          /*
          self.openSideWindowForCreate('VipSingleSelectList', {
            conditions: [`uuid?=${vipUuidList}`],
            select: (uuid) => self.selectVip(uuid)
          })*/
        })
      },
      selectVip: function (uuid) {
        this.updateWindow({vipUuid: uuid}).then(() => {
          this.validate('vipUuid')
          this.clearRow('privateL3NetworkUuid')
        })
        // this.updateWindow({ 'showVolumeOfferingDlg': true })
      },
      selectPublicL3Network: function (uuid) {
        this.updateWindow({publicL3NetworkUuid: uuid}).then(() => {
          this.validate('publicL3NetworkUuid')
        })
        this.getfreeIp(uuid)
        // this.updateWindow({ 'showClusterDlg': true })
      },
      toggleIpMode: function () {
        let isCreateVip = !this.windowData.isCreateVip
        this.updateWindow({
          isCreateVip: isCreateVip,
          privateL3NetworkUuidList: []
        }).then(() => {
          this.deleteAllAssistant()
          this.queryForAssistant()
        })
      },
      selectPrivateL3Network: function (uuid) {
        let privateL3NetworkUuidList = _.cloneDeep(this.windowData.privateL3NetworkUuidList)
        privateL3NetworkUuidList.push(uuid)
        this.updateWindow({privateL3NetworkUuidList})
          .then(() => this.validate('privateL3NetworkUuidList'))
      },
      removePrivateL3NetworkUuid: function (uuid) {
        let privateL3NetworkUuidList = _.cloneDeep(this.windowData.privateL3NetworkUuidList)
        privateL3NetworkUuidList = privateL3NetworkUuidList.filter(item => item !== uuid)
        this.updateWindow({privateL3NetworkUuidList})

      },
      toggleMoreDropdownDlg: function ($event, show) {
        let obj = {}
        obj[show] = !this.windowData[show]
        this.updateWindow(obj)
        $event.stopPropagation()
      },


      toggleMoreSetting: function () {
        let showMoreSetting = this.windowData.showMoreSetting
        let self = this
        if (!showMoreSetting) {
          setTimeout(() => {
            self.scrollElement.scrollTop = 930
          }, 0)
        }
        this.updateWindow({showMoreSetting: !showMoreSetting})
      },
      selectNetwork: function (uuid) {
        this.updateWindow({publicL3NetworkUuid: uuid}).then(() => {
          this.validate('publicL3NetworkUuid')
        })
        this.getfreeIp(uuid)
      },
      openPublicL3NetworkDlg: function () {
        this.openDialog('L3NetworkSingleSelectListDlg', {
          conditions: ['category=Public'],
          select: (uuid) => {
            this.selectNetwork(uuid)
          }
        })
      },

      removeNetwork() {
       this.updateWindow({
         publicL3NetworkUuid: ''
       })
        this.validate('publicL3NetworkUuid');
      },

      pageOpenSubNetwork: async function () {
        const self = this
        let data = this.windowData
        let conditions = ['category=Private', 'networkServices.networkServiceType=IPsec']
        let publicL3NetworkUuid = ''
        let privateL3NetworkUuidList = this.windowData.privateL3NetworkUuidList
        let isSNATVIp = false
        let peerL3NetworkUuids = []
        let vRouterConditions = []

        if (data.isCreateVip && data.publicL3NetworkUuid) {
          publicL3NetworkUuid = data.publicL3NetworkUuid
        }
        if (!data.isCreateVip && data.vipUuid) {
          let vip = _.cloneDeep(self.dbData.vip[data.vipUuid])
          if (vip && vip.l3NetworkUuid) {
            publicL3NetworkUuid = vip.l3NetworkUuid
          }
          isSNATVIp = vip.useFor && vip.useFor === 'SNAT'
          peerL3NetworkUuids = vip.peerL3NetworkUuids
        }
        vRouterConditions.push(`vip.l3NetworkUuid?=${publicL3NetworkUuid}`)

        if (this.windowData.privateL3NetworkUuidList.length === 0 && peerL3NetworkUuids && peerL3NetworkUuids.length > 0) {
          vRouterConditions.push(`vmNics.l3NetworkUuid?=${peerL3NetworkUuids}`)
        }
        if (this.windowData.privateL3NetworkUuidList.length > 0) {
          vRouterConditions.push(`vmNics.l3NetworkUuid?=${this.windowData.privateL3NetworkUuidList}`)
        }
        let vRouterResp = await this.queryVRouter(vRouterConditions)
        let avaiableVRouters = vRouterResp.inventories
        if (isSNATVIp) {
          avaiableVRouters = vRouterResp.inventories.filter(item => item.virtualRouterVips.some(uuid => uuid === data.vipUuid))
        }
        let vRouterUuidList = avaiableVRouters.map(item => item.uuid)
        let l3networkResp = await this.queryPrivateL3network(vRouterUuidList)
        let l3NetworkUuidList = l3networkResp.inventories.map(l3 => l3.uuid)

        _.remove(l3NetworkUuidList, (uuid) => privateL3NetworkUuidList.some(item => item === uuid))
        conditions.push(`uuid?=${l3NetworkUuidList}`)

        if (this.windowData.dialogList.length > 0) {
          this.windowData.dialogList.forEach((it) => {
            this.closeDialog(it)
          })
          this.updateWindow({
            dialogList: []
          })
            .then((resp) => {
              this.openDialog('SubNetworkSingleSelectListDlg', {
                conditions: conditions,
                ok: (uuid) => {
                  this.selectPrivateL3Network(uuid)
                }
              })

            })
        } else {
          this.openDialog('SubNetworkSingleSelectListDlg', {
            conditions: conditions,
            ok: (uuid) => {
              this.selectPrivateL3Network(uuid)
            }
          })
        }
      },
      validate(name) {
        let obj = {}
        let windowData = this.windowData
        obj[`empty${name}`] = false
        if (name === 'privateL3NetworkUuidList') {
          if (this.windowData.privateL3NetworkUuidList.length === 0) {
            obj[`empty${name}`] = true
            this.updateWindow(obj)
            return
          }
        }
        let propToBeTrimed = ['name', 'requiredIp', 'peerAddress', 'peerCidrs']
        let input = propToBeTrimed.indexOf(name) > -1 ? this.trimProp(name) : windowData[name]
        if (!input) {
          obj[`empty${name}`] = true
          this.updateWindow(obj)
          return
        }
        obj[`invalid${name}`] = false
        if (name === 'peerAddress' || name === 'requiredIp') {
          if (!this.isIP(input)) {
            obj[`invalid${name}`] = true
          }
        }
        if (name === 'peerCidrs') {
          let peerCidrList = input.split(',')
          let isNotCidr = peerCidrList.some(item => !this.isCidr(item))
          if (isNotCidr) {
            obj[`invalid${name}`] = true
          }
        }
        this.updateWindow(obj)
      },
      validateAll() {
        const self = this
        let obj = {}
        obj.invalidInput = false
        let props = ['name', 'privateL3NetworkUuidList', 'peerAddress', 'peerCidrs', 'authKey']
        if (self.windowData.isCreateVip) {
          props.push('publicL3NetworkUuid')
          if (this.windowData.requiredIp) {
            props.push('requiredIp')
          }
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
      ok: function () {
        this.validateAll()
        if (this.windowData.invalidInput) return;
        this.canCreate = false;
        this.create(this.createParam())
        this.$router.push({name:'ipsec'})
      }
    }
  }
</script>
