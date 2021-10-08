<template>
  <div style="height: 100%; background: #fff;">
    <create-template>
      <div slot="header" class="create-header">
        <span>{{ $t("loadbalancer.create") }}</span>
        <span @click="$router.push({name: 'loadbalancer'})" class="create-back"><i class="el-icon-back"></i> 回到负载均衡器列表 </span>
      </div>

      <div slot="body" class="create-body">
        <div class="operation-row">
          <div class="title required">{{$t('common.name')}}</div>
          <help-trigger name="loadBalance"></help-trigger>
          <input @blur="validate('name')" type="text" v-model="name" :class="{'is-error':emptyname}"/>
          <div class="error-text error" v-if="emptyname">{{$t('common.name')}}{{$t('error.noEmpty')}}</div>
        </div>
        <div class="operation-row">
          <div class="title">{{$t('common.description')}}</div>
          <textarea rows="3" type="text" v-model="description"/>
        </div>
        <div class="operation-row">
          <div class="title required"> {{ $t("loadbalancer.vipMethod") }}</div>
          <el-radio-group v-model="ipMode">
            <el-radio :label="true">{{ $t("loadbalancer.createNewVip") }}</el-radio>
            <el-radio :label="false">{{ $t("loadbalancer.useExistingVip") }}</el-radio>
          </el-radio-group>
        </div>
        <div class="operation-row" v-if="ipMode">
          <div class="title required">{{$t("common.network")}}</div>
          <add-or-delete-input @open="openL3NetworkDlg()" @remove="removeUuid('l3NetworkUuid');"
                               :value="l3NetworkUuid && dbData.l3network[l3NetworkUuid] && dbData.l3network[l3NetworkUuid].name"
                               :class="{'is-error': emptyl3NetworkUuid}"></add-or-delete-input>
          <div class="error error-text" v-if="emptyl3NetworkUuid">{{$t('error.unselected')+$t('common.network')}}</div>
        </div>
        <div class="operation-row" v-if="ipMode">
          <div class="title">{{ $t("vip.requiredIP") }}</div>
          <input v-model="requiredIp" :class="{'error-input': requiredIp && invalidrequiredIp}"
                 @blur="validate('requiredIp')" @keydown.enter="validate('requiredIp')" list="requiredIPList"/>
          <datalist id="requiredIPList">
            <option v-for="requiredIp in requiredIPList" :value="requiredIp">{{requiredIp}}</option>
          </datalist>
        </div>
        <div class="error" v-if="ipMode && requiredIp && invalidrequiredIp">
          {{$t('error.invalid')+$t('vip.requiredIP')}}
        </div>
        <div class="operation-row" v-if="!ipMode">
          <div class="title required">{{ $t("common.vip") }}</div>
          <add-or-delete-input @open="loadBalancerSelectVip();"
                               @remove="removeUuid('vipUuid'); $event.stopPropagation(); validate('vipUuid')"
                               :class="{'is-error': emptyvipUuid}"
                               :value="dbData.vip[vipUuid] && dbData.vip[vipUuid].name">
          </add-or-delete-input>
          <div class="error error-text" v-if="emptyvipUuid">{{$t('error.unselected')+$t('common.vip')}}</div>
        </div>
        <div class="operation-row" v-if="listenersList.length>0" style="margin-top: 40px;">
          {{ $t("loadbalancer.listener") }}
        </div>
        <div class="operation-row" v-show="listenersList.length >0" v-for="(item,index) in listenersList">
          <div class="rule-body">
            <div class="rule-content">
              {{$t("common.name")}}{{$t("common.colon")}}{{ item.name }}
              <div class="delete" @click="deleteListener(index)"></div>
            </div>
            <div class="rule-content">
              {{$t("common.description")}}{{$t("common.colon")}}{{ item.description }}
            </div>
            <div class="rule-content">
              {{$t("common.protocol")}}{{$t("common.colon")}}{{ item.protocol }}
            </div>
            <div class="rule-content" v-if="item.protocol === 'https'">
              {{$t("common.certificate")}}{{$t("common.colon")}}
              {{item.certificateUuid === '' ? $t("common.noAttach") : $t("state.Attached")}}
            </div>
            <div id="loadbalancer-loadBalancerPort" class="rule-content">
              {{ $t("loadbalancer.loadBalancerPort") }}{{$t("common.colon")}} {{ item.loadBalancerPort }}
            </div>
            <div id="loadbalancer-instancePort" class="rule-content">
              {{ $t("loadbalancer.instancePort") }}{{$t("common.colon")}} {{ item.instancePort }}
            </div>
          </div>
        </div>
        <div class="operation-block-header" v-if="listenersList.length<=0" style="margin-top: 40px;">
          {{ $t("loadbalancer.listener") }}
        </div>
        <div style="margin-top: 20px;">
          <span style="color: #3C73B9;cursor: pointer;" @click="showCreateBalancerListener('isCreatebalancerListener')">+{{ $t('loadbalancer.createListener') }}</span>
          <!--<component v-if="isCreatebalancerListener" class="item-container" style="margin-top: 20px;" :param="createlistener.param" :is="createlistener.ctrl"></component>-->
        </div>
        <!--<set-load-balancer-listener-dlg :params="createListenersparams()" v-if="isCreatebalancerListener" @close="closelistenDlg" :param="balancerListenerList"></set-load-balancer-listener-dlg>-->
      </div>

      <div class="create-footer" slot="footer">
        <span :class="{'disabled': !canCreate}" @click="canCreate && confirm()" class="btn-confirm">{{$t('common.ok')}}</span>
        <span class="btn-cancel" @click="$router.push({name:'loadbalancer'})">{{$t('common.cancel')}}</span>
      </div>
    </create-template>
    <set-load-balancer-listener-dlg v-if="isCreatebalancerListener" @close="closelistenDlg"
                                    :param="createlistener.param"></set-load-balancer-listener-dlg>
  </div>
</template>

<script>
  import CreateTemplate from "../../component/CreateTemplate";
  import AddOrDeleteInput from "../../component/AddOrDeleteInput";
  import WindowBase from 'src/windows/Window';
  import validator from 'src/utils/validator';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc'
  import Methods from 'src/network/loadBalancer/Methods'
  import SetLoadBalancerListenerDlg from 'src/network/loadBalancer/dialog/CreateLoadBalancerListenerInLoadBalancer'
  import _ from 'lodash'
  import FullPanel from "../../windows/Base/FullPanel";
  import CreateLoadBalancerListenerInLoadBalancerDlg
    from 'src/network/loadBalancer/dialog/CreateLoadBalancerListenerInLoadBalancer'
  import FullPanelHelper from 'src/component/FullPanel/heplers';

  export default {
    name: "CreateLoadBalancer",
    mixins: [WindowBase, Methods],
    data() {
      return {
        name: '',
        description: '',
        emptyname: false,
        requiredIp: '',
        vipUuid: '',
        l3NetworkUuid: '',
        ipMode: true,
        emptyvipUuid: false,
        isCreatebalancerListener: false,
        balancerListenerList: [],
        emptyl3NetworkUuid: false,
        invalidrequiredIp: false,
        listenersList: [],
        requiredIPList: [],
        canCreate: true,
        createlistener: {
          param: {
            vipUuid: this.getvipUuid,
            createVip: this.getipMode,
            portList: this.getportList,
            doc: 'selectNetwork'
          },
          ctrl: ''
        }
      }
    },
    created() {
      this.deleteAllAssistant()
      let ipMode = true
      if (!this.getApiPermission('VIP.CREATE')) {
        ipMode = false
      }
      this.updateWindow({
        zoneUuid: window.localStorage.getItem('currZoneUuid')
      }).then(() => {
        this.queryL3network()
        this.queryVip()
        this.queryForAssistant()
      })
    },
    destroyed() {
      this.deleteCurrAssistant(this.windowData.id)
    },
    components: {
      'set-load-balancer-listener-dlg': SetLoadBalancerListenerDlg,
      AddOrDeleteInput,
      CreateTemplate,
    },
    methods: {
      ...Utils,
      ...validator,
      getvipUuid() {
        return this.vipUuid
      },
      getipMode() {
        return this.ipMode
      },
      getportList() {
        return this.listenersList.map((item) => parseInt(item.loadBalancerPort))
      },
      getCreateListener() {
        return this.isCreatebalancerListener
      },
      closelistenDlg(param) {
        this.isCreatebalancerListener = false
        if (param != null) {
          let listenersBody = _.cloneDeep(this.windowData.listenersList)
          listenersBody.push(param)
          this.updateWindow({listenersList: listenersBody})
        }
      },

      removeUuid(uuid) {
        let self = this;
        self[uuid] = '';
        self.validate('vipUuid');
      },

      loadBalancerSelectVip: function () {
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

            if (vipUuidList.length === 1) {
              self.vipUuid = vipUuidList[0];
              self.validate('vipUuid')
            }
          })
        tasks.push(p)
        return Promise.all(tasks).then(() => {
          self.openDialog('VipSingleSelectListDlg', {
            conditions: [`uuid?=${vipUuidList}`],
            select: (uuid) => self.selectVip(uuid)
          })
        })
      },
      selectVip: function (uuid) {
        let self = this;
        self.vipUuid = uuid
        self.validate('vipUuid')
      },
      showCreateBalancerListener(param) {
        this[param] = true
      },
      queryForAssistant() {
        let self = this
        let zoneUuid = `zone.uuid=${self.windowData.zoneUuid}`
        let hide
        let content
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${this.genUniqueId()}`
          if (!this.dbData.common.isAdmin && resourceName === 'PublicNetwork') {
            content = 'lackOfPublicNetworlInAccount'
            hide = true
          } else {
            hide = false
            content = `lackOf${resourceName}`
          }
          self.createAssistant({
            id,
            hide,
            operation,
            title: 'lbTitle',
            ownerId: self.windowData.id,
            content,
            handler: () => {

            }
          })
        }
        if (self.ipMode) {
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
      queryL3network: function () {
        let conditions = [`zoneUuid=${this.windowData.zoneUuid}`, 'category=Public']
        rpc.query('l3-networks', {
          q: conditions
        }).then((resp) => {
          this.updateDbTable({
            tableName: 'l3network',
            list: resp.inventories
          })
          if (resp.inventories.length === 1) {
            this.l3NetworkUuid = resp.inventories[0].uuid;
            this.getfreeIp(resp.inventories[0].uuid)
          }
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
              if (!_.has(item, 'useFor') || item.useFor !== 'Eip') {
                vipUuidList.push(item.uuid)
              }
            })
            this.$data.vipUuidList = vipUuidList
            if (vipUuidList.length === 1) {
              this.vipUuid = vipUuidList[0]
            }
          })
      },
      deleteListener: function (index) {
        let listenersBody = _.cloneDeep(this.listenersList)
        listenersBody.splice(listenersBody, 1)
        this.listenersList = listenersBody;
      },
      openL3NetworkDlg() {
        //let conditions=['category=Public']
        this.openDialog('L3NetworkSingleSelectListDlg', {
          conditions: ['category=Public'],
          type: 'radio',
          select: (uuid) => this.selectNetwork(uuid)
        })
      },
      validate(name) {
        let self = this;
        let windowData = this.windowData
        self[`empty${name}`] = false
        let propToBeTrimed = ['name', 'requiredIp']
        let input = propToBeTrimed.indexOf(name) > -1 ? String(self[name]).trim() : self[name]
        if (!input) {
          self[`empty${name}`] = true
        }
        self[`invalid${name}`] = false
        if (name === 'requiredIp') {
          if (!this.isIP(input)) {
            self[`invalid${name}`] = true
          }
        }
      },
      selectNetwork: function (uuid) {
        this.l3NetworkUuid = uuid
        this.getfreeIp(uuid)
        this.validate('l3NetworkUuid')
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
            this.requiredIPList = requiredIPList
          })
      },
      removeUuid(value) {
        let self = this;
        this[value] = '';
      },
      createParam: function () {
        return {
          name: this.name,
          description: this.description,
          requiredIp: this.requiredIp,
          l3NetworkUuid: this.l3NetworkUuid,
          vipUuid: this.vipUuid,
          ipMode: this.ipMode,
          listenersList: this.listenersList
        }
      },
      validateAll() {
        const self = this
        let invalidInput = false
        let props = ['name']
        if (self.ipMode) {
          if (self.requiredIp) {
            props.push('requiredIp')
          }
          props.push('l3NetworkUuid')
        } else {
          props.push('vipUuid')
        }
        props.forEach(item => this.validate(item))
        let isInvalid = props.some(item => {
          return this[`empty${item}`] || this[`invalid${item}`]
        })
        if (isInvalid) invalidInput = true;
        return invalidInput;
      },
      confirm: function () {
        if (this.validateAll()) return
        this.canCreate = false;
        this.create(this.createParam())
          .then(() => {
            this.$router.push({name: 'loadbalancer'});
          })
          .catch(() => {
            this.canCreate = true;
          })
      }
    }
  }
</script>

<style scoped>
  .operation-block-header {
    border-bottom: 1px solid #adb0b8;
    padding-bottom: 8px;
    color: #1A2736;
    font-size: 16px;
    cursor: pointer;
    max-width: 350px;
  }

  .rule-content {
    height: 30px;
    font-size: 14px;
    color: #333333;
    width: 100%;
    padding: 10px;
    border-radius: 2px;
    position: relative;
  }

  .options {
    width: 420px;
    height: 40px;
  }

  .option {
    float: left;
    margin-right: 50px;
    cursor: pointer;
  }

  .option span img, .network span img {
    vertical-align: middle;
  }

  .rule-body {
    width: 100%;
    border: 1px solid #adb0b8;
    border-radius: 2px;
    padding-bottom: 10px;
  }
</style>
