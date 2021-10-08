<template>
  <detail-template>
    <div class="detail-header" slot="header">
      <span class="detail-title">监听器详情</span>
      <span @click="$router.push({name:'loadbalancerlistener'})" class="create-back detail-header-item"
      >
                <i class="el-icon-back"></i>
              回到监听器列表
            </span>
      <span class="detail-header-item">
                <drop-down class="detail-dropdown">
                    <span slot="title">
                        <span class="text">{{$t("loadbalancer.listenerActions")}}</span>
                    </span>
                    <span slot="content">
                      <div class="dropdown-content">
                        <a id="loadbalancer-attachVmNic" v-permission="'LB_VMNIC.ADD'" style="padding-top: 12px;"
                           @click="addVmNic()">{{$t("loadbalancer.attachVmNic")}}</a>
                        <a id="loadbalancer-detachVmNic" v-permission="'LB_VMNIC.REMOVE'"
                           @click="dbData.loadBalancerListener[windowData.dataUuid].vmNicRefs && dbData.loadBalancerListener[windowData.dataUuid].vmNicRefs.length > 0 &&  detachVmNic(windowData.dataUuid)"
                           :class="{ 'disabled-text': !dbData.loadBalancerListener[windowData.dataUuid] || !dbData.loadBalancerListener[windowData.dataUuid].vmNicRefs || dbData.loadBalancerListener[windowData.dataUuid].vmNicRefs.length === 0 }">{{$t("loadbalancer.detachVmNic")}}</a>
                        <a id="loadbalancer-attachCertificate" v-permission="'LB_CERT.ADD_CERT_2_LISTENER'"
                           :class="{'disabled-text': !canAttachCert([windowData.dataUuid])}"
                           @click="canAttachCert([windowData.dataUuid]) && detailAttachCertificate([windowData.dataUuid])">{{$t("certificate.attach")}}</a>
                        <a id="loadbalancer-detachCertificate" v-permission="'LB_CERT.REMOVE_CERT_FROM_LISTENER'"
                           :class="{'disabled-text': !canDetachCert([windowData.dataUuid])}"
                           @click="canDetachCert([windowData.dataUuid]) && detailDetachCertificate([windowData.dataUuid])">{{$t("certificate.detach")}}</a>
                        <a id="common-destroy" v-permission="'LB_LISTENER.DELETE'" style="padding-bottom: 12px;"
                           @click="pageDelete()">{{$t("common.destroy")}}</a>
                      </div>
                    </span>
                </drop-down>
            </span>
      <el-tabs class="detail-tab" v-model="activeName" @tab-click="handleTabChange" tabPosition="bottom"
      >
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"
        ></el-tab-pane>
        <el-tab-pane :label="$t('common.vmInstanceNic')" name="vmNic"
        ></el-tab-pane>
        <el-tab-pane v-permission="'LICENSE_BASIC_PAID'" :label="$t('vm.monitor')" name="monitor"
        ></el-tab-pane>
        <el-tab-pane v-permission="'LICENSE_BASIC_PAID'" :label="$t('common.log')" name="log"
        ></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="detail-info-left-top-blank"></div>
        <div class="left-header">
          <base-icon name="detail_listener"/>
          <div class="after-icon">

          </div>
          <detail-name :param="getNameParam()" class="name"/>
          <detail-description :param="getDescriptionParam()" class="description"/>

        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t("common.overview")}}
          </div>

          <detail-row :param="{
                    title: $t('loadbalancer.loadBalancerPort'),
                    content: dbData.loadBalancerListener[windowData.dataUuid] && dbData.loadBalancerListener[windowData.dataUuid].loadBalancerPort
                  }"/>
          <detail-row :param="{
                    title: $t('loadbalancer.instancePort'),
                    content: dbData.loadBalancerListener[windowData.dataUuid] && dbData.loadBalancerListener[windowData.dataUuid].instancePort
                  }"/>
          <detail-row :param="{
                    title: $t('common.protocol'),
                    content: dbData.loadBalancerListener[windowData.dataUuid] && dbData.loadBalancerListener[windowData.dataUuid].protocol
                  }"/>
          <detail-row :param="{
                    title: $t('common.certificate'),
                    content: getCertificateName(windowData.dataUuid) === '' ? $t('common.noAttach') : $t('state.Attached')
                  }"/>
          <detail-row :param="{
                    title: $t('common.owner'),
                    content: getResourceOwner(windowData.dataUuid)
                  }"/>
          <detail-row :param="{
                    title: $t('common.createDate'),
                    content: formatDatetime(new Date(dbData.loadBalancerListener[windowData.dataUuid] && dbData.loadBalancerListener[windowData.dataUuid].createDate))
                  }"/>
          <detail-row :param="{
                    title: $t('common.lastOpDate'),
                    content: formatDatetime(new Date(dbData.loadBalancerListener[windowData.dataUuid] && dbData.loadBalancerListener[windowData.dataUuid].lastOpDate))
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
                title: 'common.loadbalancer',
                content:  dbData.loadBalancerListener[windowData.dataUuid] && getLoadBalancerName(windowData.dataUuid)
              }"/>
        <detail-row :param="{
                title: 'loadbalancer.connectionIdleTimeout',
                content: dbData.loadBalancerListener[windowData.dataUuid] && dbData.loadBalancerListener[windowData.dataUuid].connectionIdleTimeout
              }"/>
        <detail-row :param="{
                title: 'loadbalancer.healthyThreshold',
                content: dbData.loadBalancerListener[windowData.dataUuid] && dbData.loadBalancerListener[windowData.dataUuid].healthyThreshold
              }"/>
        <detail-row :param="{
                title: 'loadbalancer.healthCheckProtocol',
                content: dbData.loadBalancerListener[windowData.dataUuid] && dbData.loadBalancerListener[windowData.dataUuid].healthCheckProtocol
              }"/>
        <detail-row :param="{
                title: 'loadbalancer.healthCheckTarget',
                content: dbData.loadBalancerListener[windowData.dataUuid] && dbData.loadBalancerListener[windowData.dataUuid].healthCheckTarget
              }"/>
        <detail-row :param="{
                title: 'loadbalancer.unhealthyThreshold',
                content: dbData.loadBalancerListener[windowData.dataUuid] && dbData.loadBalancerListener[windowData.dataUuid].unhealthyThreshold
              }"/>
        <detail-row :param="{
                title: 'loadbalancer.healthCheckInterval',
                content: dbData.loadBalancerListener[windowData.dataUuid] && dbData.loadBalancerListener[windowData.dataUuid].healthCheckInterval
              }"/>
        <detail-row :param="{
                title: 'loadbalancer.maxConnection',
                content: dbData.loadBalancerListener[windowData.dataUuid] && dbData.loadBalancerListener[windowData.dataUuid].maxConnection
              }"/>
        <detail-row :param="{
                title: 'loadbalancer.balancerAlgorithm',
                content: dbData.loadBalancerListener[windowData.dataUuid] && dbData.loadBalancerListener[windowData.dataUuid].balancerAlgorithm
              }"/>
        <detail-row :param="{
                title: 'common.certificate',
                content: getCertificateName(windowData.dataUuid)
              }"
                    v-if="dbData.loadBalancerListener[windowData.dataUuid] && (dbData.loadBalancerListener[windowData.dataUuid].protocol === 'https')"/>
      </div>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'vmNic'">
      <LoadBalancerListener-VmNicRefs-tab-list
        :param="{ uuid: windowData.dataUuid, refresh: query, detachVmNic: addVmNic }"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'log'">
      <log-list :param="{ uuid: windowData.dataUuid }"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'monitor'">
      <loadbalanceListener-monitor :param="windowData.dataUuid"/>
    </div>

    <div slot="footer">
      <load-balancer-listener-attach-vm-nic v-if="showLoaderListenerAttachNic"
                                            :param="loadBalancerListenerAttachVmNicParam"
                                            @close="showLoaderListenerAttachNic = false;"/>
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
  import LoadBalancerListenerVmNicRefsTabList from './component/ListenerVmNicRefsTabList'
  import LoadbalanceListenerMonitor from './component/Monitor'
  import LoadBalancerListenerAttachVmNic from "./component/LoadBalancerListenerAttachVmNic";

  export default {
    name: "LoadBalancerListenerDetailPage",
    mixins: [WindowBase, Root, Methods],
    components: {
      LoadBalancerListenerAttachVmNic,
      DetailLongContent,
      DetailInfoState,
      DetailTemplate,
      PageTemplate,
      LogList,
      'LoadBalancerListener-VmNicRefs-tab-list': LoadBalancerListenerVmNicRefsTabList,
      'loadbalanceListener-monitor': LoadbalanceListenerMonitor
    },
    created() {
      this.TablistAssignedInit('LoadBalancerListenerVm')
      this.updateWindow({currTab: 'info'})
      let dataUuid = this.$route.params ? this.$route.params.uuid : ''
      this.updateWindow({
        dataUuid,
        methods: {query: this.query},
        justUpdateResource: false
      })
        .then(() => {
          return this.query()
        })
        .then(() => {
          return this.$nextTick(this.$forceUpdate)
        })

      window.addEventListener('click', this.onWindowClick)
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
      'param.uuid': function () {
        // pass param for desktop manager
        if (this.param) {
          this.updateWindow({dataUuid: this.param.uuid}).then(() => this.query())
        }
      },
      'windowData.currTab': function () {

      }
    },
    data() {
      return {
        activeName: 'info',
        editName: false,
        newName: '',
        editDescription: false,
        newDescription: '',
        showLoaderListenerAttachNic: false,
        loadBalancerListenerAttachVmNicParam: {}
      }
    },
    methods: {
      ...Utils,
      handleTabChange(tab, event) {
        let self = this;
        if (self.activeName === tab.name) return;
        self.activeName = tab.name;
      },
      getNameParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.loadBalancerListener[this.windowData.dataUuid]) {
              return this.dbData.loadBalancerListener[this.windowData.dataUuid].name
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResources('load-balancers/listeners', 'updateLoadBalancerListener', 'name', 'loadBalancerListener', value)
          }
        }
      },
      getDescriptionParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.loadBalancerListener[self.windowData.dataUuid]) {
              return this.dbData.loadBalancerListener[self.windowData.dataUuid].description
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResources('load-balancers/listeners', 'updateLoadBalancerListener', 'description', 'loadBalancerListener', value)
          }
        }
      },
      query: function () {
        let queryVmNicStatus = () => {
          let ipList
          rpc.query('vm-instances/nics', {
            q: `loadBalancerListener.uuid=${this.windowData.dataUuid}`,
            fields: 'ip'
          })
            .then((resp) => {
              ipList = resp.inventories.map((it) => it.ip)
              if (!this.dbData.common.isOpensource) {
                return rpc.query('zwatch/metrics', {
                  namespace: 'ZStack/LoadBalancer',
                  metricName: 'LoadBalancerBackendStatus',
                  offsetAheadOfCurrentTime: 1,
                  labels: [`ListenerUuid=${this.windowData.dataUuid}`, `NicIpAddress=~${ipList.join('%7C')}`]
                })
              } else return new Promise((resolve, reject) => {
                resolve()
              })
            })
            .then((resp) => {
              if (!resp) return
              let loadBalancerListenerA = {}
              loadBalancerListenerA[this.windowData.dataUuid] = {
                up: 0,
                total: ipList.length
              }
              resp.data.forEach((item) => {
                if (item.value > 0) loadBalancerListenerA[item.labels.ListenerUuid].up++
              })
              let data = {
                uuid: this.windowData.dataUuid,
                ...loadBalancerListenerA[this.windowData.dataUuid]
              }
              return this.updateDbRow({
                tableName: 'loadBalancerListenerA',
                id: this.windowData.dataUuid,
                data: data
              })
            })
        }
        return rpc.query(`load-balancers/listeners`, {
          q: `uuid=${this.windowData.dataUuid}`
        }).then((resp) => {
          rpc.getResourceAccount([this.windowData.dataUuid], this)
          let lBListenerInventories = resp.inventories[0]
          return this.updateDbRow({
            tableName: 'loadBalancerListener',
            id: this.windowData.dataUuid,
            data: lBListenerInventories
          })
        }).then(() => {
          return queryVmNicStatus()
        }).then(() => {
          if (this.dbData.common.isAdmin && !this.dbData.common.isOpensource) {
            return rpc.query('accounts/resources/refs', {
              q: `resourceUuid=${this.windowData.dataUuid}`
            }).then((resp) => {
              let accountInventories = resp.inventories
              return rpc.query('accounts', {
                q: `uuid=${accountInventories[0].accountUuid}`
              }).then((resp) => {
                accountInventories[0].uuid = this.windowData.dataUuid
                accountInventories[0].owner = resp.inventories[0]
                return this.updateDbTable({
                  tableName: 'accountRef',
                  list: accountInventories
                })
              })
            })
          } else {
            return new Promise((resolve, reject) => {
              resolve()
            })
          }
        }).then(() => {
          return rpc.query('system-tags', {
            q: [`resourceUuid=${this.windowData.dataUuid}`, 'resourceType=LoadBalancerListenerVO']
          }).then((resp) => {
            const self = this
            resp.inventories.forEach(function (item) {
              if (item.tag.indexOf('healthyThreshold::') > -1) {
                self.dbData.loadBalancerListener[self.windowData.dataUuid].healthyThreshold = item.tag.split('::')[1]
              }
              if (item.tag.indexOf('healthCheckTarget::') > -1) {
                self.dbData.loadBalancerListener[self.windowData.dataUuid].healthCheckTarget = item.tag.substring(item.tag.lastIndexOf(':') + 1, item.tag.length)
                self.dbData.loadBalancerListener[self.windowData.dataUuid].healthCheckProtocol = item.tag.substring(item.tag.lastIndexOf('::') + 2, item.tag.lastIndexOf(':'))
              }
              if (item.tag.indexOf('balancerAlgorithm::') > -1) {
                self.dbData.loadBalancerListener[self.windowData.dataUuid].balancerAlgorithm = item.tag.split('::')[1]
              }
              if (item.tag.indexOf('maxConnection::') > -1) {
                self.dbData.loadBalancerListener[self.windowData.dataUuid].maxConnection = item.tag.split('::')[1]
              }
              if (item.tag.indexOf('connectionIdleTimeout::') > -1) {
                self.dbData.loadBalancerListener[self.windowData.dataUuid].connectionIdleTimeout = item.tag.split('::')[1]
              }
              if (item.tag.indexOf('healthCheckInterval::') > -1) {
                self.dbData.loadBalancerListener[self.windowData.dataUuid].healthCheckInterval = item.tag.split('::')[1]
              }
              if (item.tag.indexOf('unhealthyThreshold::') > -1) {
                self.dbData.loadBalancerListener[self.windowData.dataUuid].unhealthyThreshold = item.tag.split('::')[1]
              }
            })
            this.updateDbRow({
              tableName: 'loadBalancerListener',
              id: self.windowData.dataUuid,
              data: self.dbData.loadBalancerListener[self.windowData.dataUuid]
            })
          })
        })
      },
      changeCurrTab: function (tabName) {
        if (this.windowData.currTab !== tabName) {
          this.updateWindow({currTab: tabName})
        }
      },
      updateResources: function (resourceType, actionName, propName, tabName, value) {
        if (this.windowData.justUpdateResource) return
        this.windowData.justUpdateResource = true
        setTimeout(() => {
          this.windowData.justUpdateResource = false
        }, 100)
        let obj = {}
        let self = this
        if (propName === 'name' && !String(value).trim()) return
        if (this.dbData[tabName][this.windowData.dataUuid][propName] === value) return
        obj[actionName] = {}
        obj[actionName][propName] = value
        let event = self.createEvent('common.updateInfo', self.$t('common.' + propName))
        rpc.put(`${resourceType}/${this.windowData.dataUuid}`, obj, event)
          .then((resp) => {
            self.incEventSuccess(event)
            this.updateDbRow({
              tableName: tabName,
              id: self.windowData.dataUuid,
              data: resp.inventory
            }).then(() => self.$forceUpdate())
          }, () => self.incEventFail(event))
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({showMoreDropdown: false})
      },
      addVmNic: function () {
        const self = this
        self.loadBalancerListenerAttachVmNicParam = {
          uuid: self.windowData.dataUuid,
          ok: (params) => {
            self.addListenerVmNics(params)
          }
        }
        self.showLoaderListenerAttachNic = true;
      },
      detachVmNic: function (uuid) {
        const self = this
        self.openDialog('LoadBalancerListenerVmNicSelect', {
          conditions: [`loadBalancerListener.uuid=${uuid}`],
          select: (uuidList) => {
            self.deleteListenerVmNics(uuidList)
          }
        })
      },
      deleteListenerVmNics: function (uuidList) {
        let event = this.createEvent('vm.action.detachVmNicToLoadBalancer', uuidList.length === 1 ? this.dbData.vm[this.dbData.vmNicRefs[uuidList[0]].vmInstanceUuid].name : '', uuidList.length)
        const self = this
        return rpc._delete(`load-balancers/listeners/${this.windowData.dataUuid}/vm-instances/nics`, {
          vmNicUuids: uuidList
        }, event)
          .then((resp) => {
            self.setEventSuccess(event)
            self.query()
          }, () => {
            self.setEventFail(event)
          })
      },
      addListenerVmNics: function (param) {
        if (!param || (param.vmNicUuidList.length <= 0)) return
        let event = this.createEvent('vm.action.addVmNicToLoadBalancer', param.vmNicUuidList.length === 1 ? this.dbData.vm[this.dbData.vmNicRefs[param.vmNicUuidList[0]].vmInstanceUuid].name : '', param.vmNicUuidList.length)
        let self = this
        let msg = {
          vmNicUuids: param.vmNicUuidList
        }
        return rpc.create(`load-balancers/listeners/${self.windowData.dataUuid}/vm-instances/nics`, msg, event)
          .then((resp) => {
            self.setEventSuccess(event)
            self.query()
          }, () => {
            self.setEventFail(event)
          })
      },
      detailAttachCertificate: function (listenerUuids) {
        this.attachCertificate(listenerUuids, false)
      },
      detailDetachCertificate: function (listenerUuids) {
        this.detachCertificate(listenerUuids, false)
      },
      pageDelete: function () {
        let self = this;
        self.openDialog('ConfirmDlg', {
          title: 'loadbalancer.deleteLoadBalancerListener',
          description: 'loadbalancer.info.deleteListenerConfirm',
          uuidList: [this.windowData.dataUuid],
          icon: 'listener_n',
          ok: () => {
            self.delete([this.windowData.dataUuid]).then(() => self.$router.push({name: 'loadbalancerlistener'}))
          },
          getName: (uuid) => {
            return self.dbData.loadBalancerListener[uuid].name;
          }
        })
      },
      getCertificateName: function (listenerUuid) {
        let certificates = this.dbData.loadBalancerListener[listenerUuid] && this.dbData.loadBalancerListener[listenerUuid].certificateRefs || ''
        if (certificates.length > 0) {
          let certificateUuid = certificates[0].certificateUuid
          let table = this.dbData.certificate
          if (table && table[certificateUuid]) {
            return table[certificateUuid].name
          }
        }
        return ''
      },
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
