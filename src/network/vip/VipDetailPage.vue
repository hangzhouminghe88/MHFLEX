<template>
  <detail-template>
    <div class="detail-header" slot="header">
      <span class="detail-title">虚拟IP详情</span>
      <span @click="$router.push({name:'vip'})" class="create-back detail-header-item">
                <i class="el-icon-back"></i>
              回到虚拟IP列表
            </span>
      <span class="detail-header-item">
                <drop-down class="detail-dropdown">
                    <span slot="title">
                        <span class="text">{{$t("common.vipAction")}}</span>
                    </span>
                    <span slot="content">
                      <div class="dropdown-content">
                        <a id="common-changeResourceOwner" v-permission="'LICENSE_BASIC_PAID'"
                           v-show="dbData.common.isAdmin && canDisplay()" style="padding-top: 12px;"
                           @click="detailChangeResourceOwner()">{{$t("common.changeResourceOwner")}}</a>
                        <a id="common-destroy" v-permission="'VIP.DELETE'" @click="deleteOneVip()"
                           style="padding-bottom: 12px;">{{$t("common.destroy")}}</a>
                      </div>
                    </span>
                </drop-down>
            </span>
      <el-tabs class="detail-tab" v-model="activeName" @tab-click="handleTabChange" tabPosition="bottom">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane label="QoS" name="qos" v-permission="['VIP_QOS.SET', 'LICENSE_BASIC_PAID']"
                     v-if="canDisplay()"></el-tab-pane>
        <el-tab-pane v-permission="'MONITORING'" v-if="dbData.vip[windowData.dataUuid]" :label="$t('vm.monitor')"
                     name="monitor"></el-tab-pane>
        <el-tab-pane v-permission="'LICENSE_BASIC_PAID'" :label="$t('vm.monitoralarm')"
                     name="monitoralarm"></el-tab-pane>
        <el-tab-pane v-permission="'LICENSE_BASIC_PAID'" :label="$t('common.log')" name="log"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="detail-info-left-top-blank"></div>
        <div class="left-header">
          <base-icon name="virtual_ip"/>
          <div class="after-icon">
            <detail-info-state outer-class-name="detail-page-state"
                               :state="dbData.vip[windowData.dataUuid] && dbData.vip[windowData.dataUuid].state"/>
          </div>
          <detail-name :param="getNameParam()" class="name"/>
          <detail-description :param="getDescriptionParam()" class="description"/>

        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t("common.overview")}}
          </div>

          <detail-row :param="{
                    title: $t('common.ip'),
                    content: dbData.vip[windowData.dataUuid] && dbData.vip[windowData.dataUuid].ip
                  }"/>
          <detail-row :param="{
                    title: $t('common.gateway'),
                    content: dbData.vip[windowData.dataUuid] && dbData.vip[windowData.dataUuid].gateway
                  }"/>
          <detail-row :param="{
                    title: $t('common.netmask'),
                    content: dbData.vip[windowData.dataUuid] && dbData.vip[windowData.dataUuid].netmask
                  }"/>

          <detail-row :param="{
                    title: $t('common.hypervisorType'),
                    content: dbData.vip[windowData.dataUuid] && dbData.l3NetworkOfHost[dbData.vip[windowData.dataUuid].l3NetworkUuid] && (dbData.l3NetworkOfHost[dbData.vip[windowData.dataUuid].l3NetworkUuid].length > 0) && dbData.l3NetworkOfHost[dbData.vip[windowData.dataUuid].l3NetworkUuid][0] && dbData.l3NetworkOfHost[dbData.vip[windowData.dataUuid].l3NetworkUuid][0].hypervisorType
                  }"/>
          <detail-row :param="{
                    title: $t('common.owner'),
                    content: getResourceOwner(windowData.dataUuid)
                  }"/>
          <detail-row :param="{
                    title: $t('common.createDate'),
                    content: dbData.vip[windowData.dataUuid] && dbData.vip[windowData.dataUuid].createDate && formatDatetime(new Date(dbData.vip[windowData.dataUuid] && dbData.vip[windowData.dataUuid].createDate))
                  }"/>
          <detail-row :param="{
                    title: $t('common.lastOpDate'),
                    content: dbData.vip[windowData.dataUuid] && dbData.vip[windowData.dataUuid].lastOpDate && formatDatetime(new Date(dbData.vip[windowData.dataUuid] && dbData.vip[windowData.dataUuid].lastOpDate))
                  }"/>
          <div class="detail-splitter"></div>
        </div>
      </div>
      <div class="right">
        <div style="height: 40px"></div>
        <div id="common-moreInformation" class="detail-block-header">
          {{$t("common.moreInformation")}}
        </div>
        <detail-row :param="{
                title: 'common.uuid',
                content: windowData.dataUuid,
                copy: true
              }"/>
        <detail-row :param="{
                title: 'common.publicNetwork',
                content: dbData.vip[windowData.dataUuid] && dbData.l3network[dbData.vip[windowData.dataUuid].l3NetworkUuid] && dbData.l3network[dbData.vip[windowData.dataUuid].l3NetworkUuid].name,
              }"/>
        <div style="height: 40px"></div>
        <div id="common-networkService" class="detail-block-header network-service-icon">
          {{$t("common.networkService")}}
        </div>
        <div id="vip-useFor-Eip"
             v-if="dbData.eipOfVip[windowData.dataUuid] && dbData.eipOfVip[windowData.dataUuid].length !== 0"
             v-for="(eip, index) in dbData.eipOfVip[windowData.dataUuid]" class="detail-row">
          <div class="detail-title" v-show="index === 0">
            {{ $t("vip.useFor.Eip") }}{{$t("common.colon")}}
          </div>
          <div class="detail-content">
            <span class="link"
                  @click="$router.push({name:'detaileip', params: { uuid: eip.uuid }})">{{ eip.name }}</span>
          </div>
        </div>
        <div id="vip-useFor-SNAT"
             v-if="dbData.snatOfVip[windowData.dataUuid] && dbData.snatOfVip[windowData.dataUuid].length !== 0"
             v-for="(it, index) in dbData.snatOfVip[windowData.dataUuid]" class="detail-row">
          <div class="detail-title" v-show="index === 0">
            {{ $t("vip.useFor.SNAT") }}{{$t("common.colon")}}
          </div>
          <div class="detail-content">
            <span class="link" @click="openVRouterDetail(it.uuid)">{{ it.name }}</span>
          </div>
        </div>
        <div id="common-loadBalancer"
             v-if="dbData.loadBalancerOfVip[windowData.dataUuid] && dbData.loadBalancerOfVip[windowData.dataUuid].length !== 0"
             v-for="(it, index) in dbData.loadBalancerOfVip[windowData.dataUuid]" class="detail-row">
          <div class="detail-title" v-show="index === 0">
            {{ $t("common.loadBalancer") }}{{$t("common.colon")}}
          </div>
          <div class="detail-content">
            <span class="link" @click="$router.push({name: 'detailloadbalancer', params: { uuid: it.uuid }})">{{ it.name }}</span>
          </div>
        </div>
        <div id="common-ipsec"
             v-if="dbData.iPsecOfVip[windowData.dataUuid] && dbData.iPsecOfVip[windowData.dataUuid].length !== 0"
             v-for="(it, index) in dbData.iPsecOfVip[windowData.dataUuid]" class="detail-row">
          <div class="detail-title" v-show="index === 0">
            {{ $t("common.ipsec") }}{{$t("common.colon")}}
          </div>
          <div class="detail-content">
            <span class="link"
                  @click="$router.push({name: 'detailipsec', params: { uuid: it.uuid }})">{{ it.name }}</span>
          </div>
        </div>
        <div id="common-portForwarding"
             v-if="dbData.portForwardingOfVip[windowData.dataUuid] && dbData.portForwardingOfVip[windowData.dataUuid].length !== 0"
             v-for="(it, index) in dbData.portForwardingOfVip[windowData.dataUuid]" class="detail-row">
          <div class="detail-title" v-show="index === 0">
            {{ $t("common.portForwarding") }}{{$t("common.colon")}}
          </div>
          <div class="detail-content">
            <span class="link" @click="$router.push({name: 'detailportforwarding', params: { uuid: it.uuid }})">{{ it.name }}</span>
          </div>
        </div>

      </div>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'qos'">
      <qos-tab-list :param="{ uuid: windowData.dataUuid, vipAddVipQos: vipAddVipQos}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'monitor'">
      <vip-monitor :param="windowData.dataUuid"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'monitoralarm'">
      <zwatch-alarm-tab-list-for-resource :param="{ resourceUuid: windowData.dataUuid, type: 'vip' }"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'log'">
      <log-list :param="{ uuid: windowData.dataUuid }"/>
    </div>

    <div slot="footer">
      <vip-add-vip-qos v-if="showAddVipQos" :param="addVipQosParam" @close="showAddVipQos = false;"/>
    </div>
  </detail-template>
</template>

<script>
  import WindowBase from 'src/windows/Window'
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  import _ from 'lodash';
  import PageTemplate from "../../component/PageTemplate";
  import DetailTemplate from "../../component/DetailTemplate";
  import Root from 'src/windows/Root';
  import Methods from './Methods';
  import LogList from "../../component/LogList";
  import DetailInfoState from "../../component/DetailInfoState";
  import DetailLongContent from "../../main-component/DetailLongContent";
  import IAM2ProjectMethods from 'src/IAM2Project/Methods'
  import ZWatchAlarmTabListForResource from "src/om/zwatchalarm/TabListForResource";
  import ChangeResourceOwnerDlg from 'src/utils/changeResourceOwner'
  import QosTabList from './component/QosTabList'
  import Monitor from './component/Monitor'
  import VipAddVipQos from "./component/VipAddVipQos";

  export default {
    name: "VipDetailPage",
    mixins: [WindowBase, Root, Methods],
    components: {
      VipAddVipQos,
      DetailLongContent,
      DetailInfoState,
      DetailTemplate,
      PageTemplate,
      LogList,
      'zwatch-alarm-tab-list-for-resource': ZWatchAlarmTabListForResource,
      QosTabList,
      'vip-monitor': Monitor
    },
    created() {
      this.getProjectAdmin = IAM2ProjectMethods.methods.getProjectAdmin.bind(this)
      this.changeResourceOwnerDlg = ChangeResourceOwnerDlg.changeResourceOwnerDlg.bind(this)
      this.updateWindow({currTab: 'info'})
      let dataUuid = this.$route.params ? this.$route.params.uuid : ''
      this.updateWindow({
        dataUuid,
        methods: {query: this.query}
      })
        .then(() => {
          return this.query()
        })
        .then(() => {
          this.$forceUpdate()
        })
    },
    mounted() {

    },
    computed: {
      itemData: function () {
        return this.dbData.vm[this.windowData.dataUuid]
      }
    },
    destroyed: function () {
      window.removeEventListener('click', this.onWindowClick)
    },
    watch: {
      'param.uuid': function (newValue, oldValue) {
        if (_.isEqual(newValue, oldValue)) return
        this.updateWindow({
          dataUuid: this.param.uuid
        }).then(() => {
          if (this.windowData.currTab === 'qos' && !this.canDisplay()) {
            this.updateWindow({currTab: 'info'})
          }
          this.query()
        })
      }
    },
    data() {
      return {
        activeName: 'info',
        editName: false,
        newName: '',
        editDescription: false,
        newDescription: '',
        editOutboundBandwidth: false,
        editInboundBandwidth: false,
        networkServiceTyps: ['Eip', 'LoadBalancer', 'PortForwarding', 'SNAT', 'IPsec'],
        EipList: [],
        LoadBalancerList: [],
        PortForwardingList: [],
        SNATList: [],
        IPsecList: [],
        showAddVipQos: false,
        addVipQosParam: {}
      }
    },
    methods: {
      ...Utils,

      vipAddVipQos(param) {
        let self = this;
        self.addVipQosParam = param;
        self.showAddVipQos = true;
      },
      handleTabChange(tab, event) {
        let self = this;
        if (self.activeName === tab.name) return;
        self.activeName = tab.name;
      },
      getNameParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.vip[this.windowData.dataUuid]) {
              return this.dbData.vip[this.windowData.dataUuid].name
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('vips', 'updateVip', 'name', 'vip', value)
          }
        }
      },
      getDescriptionParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.vip[self.windowData.dataUuid]) {
              return this.dbData.vip[self.windowData.dataUuid].description
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('vips', 'updateVip', 'description', 'vip', value)
          }
        }
      },
      openVRouterDetail: function (uuid) {
        let dlg = 'VirtualRouterDetailDlg'
        if (this.dbData.vm[uuid].applianceVmType === 'vpcvrouter') {
          dlg = 'VpcVRouterDetailDlg'
        }
        this.openSideWindow(dlg, {uuid: uuid})
      },
      query: function () {
        const self = this
        let vipInventories
        return rpc.query(`vips/${this.windowData.dataUuid}`)
          .then((resp) => {
            rpc.getResourceAccount([self.windowData.dataUuid], self)
            vipInventories = resp.inventories[0]
            let tasks = []
            let p = null
            // query account
            if (self.dbData.common.isAdmin && vipInventories) {
              p = rpc.query(`accounts/resources/refs`, {
                q: `resourceUuid=${vipInventories.uuid}`
              }).then((respAccount) => {
                if (respAccount.inventories.length > 0) {
                  vipInventories.accountUuid = respAccount.inventories[0].accountUuid
                  return rpc.query(`accounts`, {
                    q: `uuid=${vipInventories.accountUuid}`
                  }).then((accountsResp) => {
                    if (accountsResp.inventories.length > 0) {
                      self.updateDbRow({
                        tableName: 'account',
                        id: accountsResp.inventories[0].uuid,
                        data: accountsResp.inventories[0]
                      })
                    }
                  })
                }
              })
              tasks.push(p)
            }

            if (vipInventories && vipInventories.l3NetworkUuid) {
              p = rpc.query('hosts', {
                q: `cluster.l2Network.l3Network.uuid=${vipInventories.l3NetworkUuid}`,
                limit: 1,
                fields: 'hypervisorType'
              }).then((l3host) => {
                if (l3host.inventories.length === 0) l3host.inventories = [{'hypervisorType': ''}]
                self.forceUpdateDbRow({
                  tableName: 'l3NetworkOfHost',
                  id: vipInventories.l3NetworkUuid,
                  data: l3host.inventories
                })
              })
              tasks.push(p)
            }

            if (_.has(vipInventories, 'useFor')) {
              let useForList = vipInventories.useFor.split(',')
              let useForAPIPath = {
                'Eip': 'eips',
                'PortForwarding': 'port-forwarding',
                'IPsec': 'ipsec',
                'LoadBalancer': 'load-balancers',
                'SNAT': 'vm-instances/appliances/virtual-routers'
              }
              let useFordbData = {
                'Eip': 'eip',
                'PortForwarding': 'portforwarding',
                'IPsec': 'ipsec',
                'SNAT': 'vm',
                'LoadBalancer': 'loadBalancer'
              }
              let useForOfVip = {
                'Eip': 'eipOfVip',
                'PortForwarding': 'portForwardingOfVip',
                'IPsec': 'iPsecOfVip',
                'SNAT': 'snatOfVip',
                'LoadBalancer': 'loadBalancerOfVip'
              }
              let differenceUseForList = _.difference(['Eip', 'PortForwarding', 'IPsec', 'LoadBalancer', 'SNAT'], useForList)
              differenceUseForList.forEach(function (useFor) {
                ((useFor) => {
                  self.deleteDbRow({
                    tableName: `${useForOfVip[useFor]}`,
                    id: self.windowData.dataUuid
                  })
                })(useFor)
              })
              useForList.forEach(function (useFor) {
                ((useFor) => {
                  p = rpc.query(`${useForAPIPath[useFor]}`, {q: `vip.uuid=${self.windowData.dataUuid}`})
                    .then((useForResp) => {
                      vipInventories[`${useFor}List`] = useForResp.inventories
                      self.forceUpdateDbRow({
                        tableName: `${useForOfVip[useFor]}`,
                        id: self.windowData.dataUuid,
                        data: useForResp.inventories
                      })
                      return self.updateDbTable({
                        tableName: `${useFordbData[useFor]}`,
                        list: useForResp.inventories
                      })
                    })
                  tasks.push(p)
                })(useFor)
              })
            }
            return Promise.all(tasks)
              .then(() => {
                // update vip dbdata
                self.updateDbRow({
                  tableName: 'vip',
                  id: self.windowData.dataUuid,
                  data: vipInventories
                })
              })
          })
      },
      canDisplay: function () {
        const self = this
        let value = true
        if (self.dbData.vip[self.windowData.dataUuid] && self.dbData.l3NetworkOfHost[self.dbData.vip[self.windowData.dataUuid].l3NetworkUuid] && (self.dbData.l3NetworkOfHost[self.dbData.vip[self.windowData.dataUuid].l3NetworkUuid].length > 0) && self.dbData.l3NetworkOfHost[self.dbData.vip[self.windowData.dataUuid].l3NetworkUuid][0] && self.dbData.l3NetworkOfHost[self.dbData.vip[self.windowData.dataUuid].l3NetworkUuid][0].hypervisorType === 'ESX') {
          value = false
        }
        return value
      },
      changeCurrTab: function (tabName) {
        if (this.windowData.currTab !== tabName) {
          this.updateWindow({currTab: tabName})
        }
      },
      isSystem() {
        let vip = this.dbData.vip[this.windowData.dataUuid]
        if (vip && _.has(vip, 'useFor') && vip.useFor.indexOf('SNAT') > -1) {
          return true
        }
        return false
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({showMoreDropdown: !this.windowData.showMoreDropdown})
        $event.stopPropagation()
      },
      delete: function (uuid) {
        const self = this
        let event = self.createEvent('vip.action.delete', self.dbData.vip[uuid].name)
        rpc._delete(`vips/${uuid}`, null, event)
          .then((resp) => {
            self.incEventSuccess(event)
            if (self.param.refresh) self.param.refresh(uuid)
          }, () => self.incEventFail(event))
      },
      detailChangeResourceOwner: async function () {
        const self = this
        self.changeResourceOwnerDlg(self.windowData.dataUuid, self.changeResourceToAccountOrProject, self.query)
      },
      changeOwner: function () {
        const self = this
        let currZoneUuid = window.localStorage.getItem('currZoneUuid')
        if (self.getLicensePermission('LICENSE_EXTRA_COMPANY')) {
          let accountUuid = self.dbData.resourceOwner[self.windowData.dataUuid] ? self.dbData.resourceOwner[self.windowData.dataUuid].uuid : ''
          let relatedZoneProjectUuidList = []
          let notEnabledIAM2ProjectUuidList = []
          let accountUuidList = []
          let zoneUuidList = []
          let allProjectAccountUuidList = []
          let projectAccountUuidList = []
          let projectUuidList = []
          let allIAM2ProjectUuidList = []
          let taskList = []
          let q = null
          let tasks = []
          let p = null
          q = rpc.query('iam2/projects', {// all project
            limit: 100000000
          }).then((resp) => {
            allProjectAccountUuidList = allProjectAccountUuidList.concat(resp.inventories.map(it => it.linkedAccountUuid))
            allIAM2ProjectUuidList = allIAM2ProjectUuidList.concat(resp.inventories.map(it => it.uuid))
            resp.inventories.forEach(function (item) {
              ((item) => {
                item.projectUuid = item.uuid
                item.projectName = item.name
                self.updateDbRow({
                  tableName: 'accountA',
                  id: item.linkedAccountUuid,
                  data: item
                })
              })(item)
            })
            self.getProjectAdmin(allIAM2ProjectUuidList)
            self.updateDbTable({
              tableName: 'iam2project',
              list: resp.inventories
            })
          })
          taskList.push(q)
          q = rpc.query('zones', {
            fields: 'uuid'
          }).then((zoneResp) => {
            zoneUuidList = zoneUuidList.concat(zoneResp.inventories.map(it => it.uuid))
            p = rpc.query('iam2/projects', {
              q: ['attributes.name=__ProjectRelatedZone__'],
              limit: 100000000,
              fields: 'uuid'
            }).then((resp) => {
              relatedZoneProjectUuidList = relatedZoneProjectUuidList.concat(resp.inventories.map(it => it.uuid))
              projectUuidList = projectUuidList.concat(_.difference(allIAM2ProjectUuidList, relatedZoneProjectUuidList))
            })
            tasks.push(p)
            p = rpc.query('iam2/projects', {
              q: ['attributes.name=__ProjectRelatedZone__', `attributes.value=${currZoneUuid}`],
              limit: 100000000,
              fields: 'uuid'
            }).then((resp) => {
              projectUuidList = projectUuidList.concat(resp.inventories.map(it => it.uuid))
            })
            tasks.push(p)
            p = rpc.query('iam2/projects', {
              q: 'state!=Enabled',
              limit: 100000000,
              fields: 'uuid'
            }).then((resp) => {
              notEnabledIAM2ProjectUuidList = notEnabledIAM2ProjectUuidList.concat(resp.inventories.map(it => it.uuid))
            })
            tasks.push(p)
          })
          taskList.push(q)
          q = rpc.query('accounts').then((resp) => {
            accountUuidList = accountUuidList.concat(resp.inventories.map(it => it.uuid))
            if (accountUuid) accountUuidList = _.difference(accountUuidList, [accountUuid])
          })
          taskList.push(q)
          return Promise.all(taskList).then(() => {
            return Promise.all(tasks).then(() => {
              accountUuidList = _.difference(accountUuidList, allProjectAccountUuidList)
              projectUuidList = _.difference(projectUuidList, notEnabledIAM2ProjectUuidList)
              if (projectUuidList.length > 0) {
                let project = ''
                projectUuidList.forEach(function (projectUuid) {
                  ((projectUuid) => {
                    project = _.cloneDeep(self.dbData.iam2project[projectUuid])
                    if (project && project.linkedAccountUuid) {
                      projectAccountUuidList.push(project.linkedAccountUuid)
                    }
                  })(projectUuid)
                })
                if (accountUuid) projectAccountUuidList = _.difference(projectAccountUuidList, [accountUuid])
              }
              self.openSideWindow('ChangeResourceOwnerToAccountProjectSingleSelectListDlg', {
                accountUuidList,
                projectAccountUuidList,
                select: (uuid) => self.changeResourceToAccountOrProject([self.windowData.dataUuid], uuid).then(() => self.query())
              })
            })
          })
        } else {
          return self.openSideWindow('AccountListDlg', {
            uuid: self.dbData.vip[self.windowData.dataUuid].accountUuid,
            select: (uuid) => {
              return self.changeResourceOwner([self.windowData.dataUuid], uuid).then(() => {
                return self.query()
              })
            }
          })
        }
      },
      outboundBandwidthEditEnd: function (newValue) {
        this.editOutboundBandwidth = false
        if (_.isEqual(newValue, this.windowData.outboundBandwidth)) return
        this.setboundBandwidth(newValue, this.windowData.dataUuid, 'outboundBandwidth').then(() => this.query())
      },
      inboundBandwidthEditEnd: function (newValue) {
        this.editInboundBandwidth = false
        if (_.isEqual(newValue, this.windowData.inboundBandwidth)) return
        this.setboundBandwidth(newValue, this.windowData.dataUuid, 'inboundBandwidth').then(() => this.query())
      },
      setboundBandwidth: function (msg, uuid, type) {
        let event = this.createEvent('vip.action.setQos', this.dbData.vip[uuid].name)
        if (msg <= 0) {
          return rpc._delete(`vips/${uuid}/vip-qos`, {
            direction: type === 'inboundBandwidth' ? 'in' : 'out'
          }, event)
            .then((resp) => {
              this.incEventSuccess(event)
              return new Promise((resolve, reject) => {
                resolve()
              })
            }, () => {
              this.incEventFail(event)
              return new Promise((resolve, reject) => {
                resolve()
              })
            })
        } else {
          let obj = {}
          obj.setVipQos = {}
          obj.setVipQos[type] = msg
          return rpc.put(`vips/${uuid}/actions`, obj, event)
            .then((resp) => {
              this.incEventSuccess(event)
              return new Promise((resolve, reject) => {
                resolve()
              })
            }, () => {
              this.incEventFail(event)
              return new Promise((resolve, reject) => {
                resolve()
              })
            })
        }
      }
    }
  }
</script>

<style scoped>
  .icon {
    position: absolute;
    display: inline-block;
    /*left: -2px;*/
    width: 58px;
    height: 60px;
  }

  .disabled-text {
    color: #97A4B6;
  }

  .disabled-text:hover {
    color: #97A4B6;
  }
</style>
