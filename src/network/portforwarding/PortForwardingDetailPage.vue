<template>
  <detail-template>
    <div class="detail-header" slot="header">
      <span class="detail-title">端口转发详情</span>
      <span @click="$router.push({name:'portforwarding'})" class="create-back detail-header-item">
                <i class="el-icon-back"></i>
              回到端口转发列表
            </span>
      <span class="detail-header-item">
                <drop-down class="detail-dropdown">
                    <span slot="title">
                        <span class="text">{{$t("portforwarding.actions")}}</span>
                    </span>
                    <span slot="content">
                      <div class="dropdown-content">
                        <a id="portforwarding-attachvm" style="padding-top: 12px;" v-permission="'PF.ATTACH'"
                           @click="($data.vmUuid === '') && pageAttachPortForwardingRule()"
                           :class="{ 'disabled-text': $data.vmUuid !== ''}">{{ $t("portforwarding.attachvm") }}</a>
                        <a id="portforwarding-detachvm" v-permission="'PF.DETACH'"
                           @click="($data.vmUuid !== '') && pageDetachPortForwardingRule()"
                           :class="{ 'disabled-text': $data.vmUuid === ''}">{{ $t("portforwarding.detachvm") }}</a>
                        <a id="common-destroy" style="padding-bottom:12px;" v-permission="'PF.DELETE'"
                           @click="pageDelete">{{ $t("common.destroy") }}</a>
                      </div>
                    </span>
                </drop-down>
            </span>
      <el-tabs class="detail-tab" v-model="activeName" @tab-click="handleTabChange" tabPosition="bottom">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane v-permission="'LICENSE_BASIC_PAID'" :label="$t('common.log')" name="log"></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="detail-info-left-top-blank"></div>
        <div class="left-header">
          <base-icon name="eip_large"/>
          <div class="after-icon">
            <detail-info-state outer-class-name="detail-page-state"
                               :state="dbData.portforwarding[windowData.dataUuid] && dbData.portforwarding[windowData.dataUuid].state"/>
          </div>
          <detail-name :param="getNameParam()" class="name"/>
          <detail-description :param="getDescriptionParam()" class="description"/>

        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t("common.overview")}}
          </div>

          <detail-row :param="{
                    title: $t('common.publicNetworkIP'),
                    content: dbData.portforwarding[windowData.dataUuid] ? dbData.portforwarding[windowData.dataUuid].vipIp : ''
                  }"/>
          <detail-row :param="{
                    title: $t('common.privateNetworkIP'),
                    content: dbData.portforwarding[windowData.dataUuid] ? dbData.portforwarding[windowData.dataUuid].guestIp : ''
                  }"/>
          <detail-row :param="{
                    title: $t('common.protocolType'),
                    content: dbData.portforwarding[windowData.dataUuid] ? dbData.portforwarding[windowData.dataUuid].protocolType : void 0
                  }"/>
          <detail-row :param="{
                    title: $t('portforwarding.sourceStartPort'),
                    content: dbData.portforwarding[windowData.dataUuid] ? dbData.portforwarding[windowData.dataUuid].vipPortStart : void 0
                  }"/>
          <detail-row :param="{
                    title: $t('portforwarding.sourceEndPort'),
                    content: dbData.portforwarding[windowData.dataUuid] ? dbData.portforwarding[windowData.dataUuid].vipPortEnd : void 0
                  }"/>
          <detail-row :param="{
                    title: $t('portforwarding.vmInstanceStartPort'),
                    content: dbData.portforwarding[windowData.dataUuid] ? dbData.portforwarding[windowData.dataUuid].privatePortStart : void 0
                  }"/>
          <detail-row :param="{
                    title: $t('portforwarding.vmInstanceEndPort'),
                    content: dbData.portforwarding[windowData.dataUuid] ? dbData.portforwarding[windowData.dataUuid].privatePortEnd : void 0
                  }"/>
          <detail-row :param="{
                    title: $t('portforwarding.allowedCidr'),
                    content: dbData.portforwarding[windowData.dataUuid] ? dbData.portforwarding[windowData.dataUuid].allowedCidr : void 0
                  }"/>
          <detail-row :param="{
                    title: $t('common.owner'),
                    content: dbData.portforwarding[windowData.dataUuid] && getAccountName(windowData.dataUuid)
                  }"/>
          <detail-row :param="{
                    title: $t('common.createDate'),
                    content: dbData.portforwarding[windowData.dataUuid] && formatDatetime(new Date(dbData.portforwarding[windowData.dataUuid] && dbData.portforwarding[windowData.dataUuid].createDate))
                  }"/>
          <detail-row :param="{
                    title: $t('common.lastOpDate'),
                    content: dbData.portforwarding[windowData.dataUuid] && formatDatetime(new Date(dbData.portforwarding[windowData.dataUuid] && dbData.portforwarding[windowData.dataUuid].lastOpDate))
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
                title: 'common.vip',
                content: dbData.portforwarding[windowData.dataUuid] && getVipName(windowData.dataUuid),
                handler: () => {
                  $router.push({name: 'detailvip', params: {uuid: dbData.portforwarding[windowData.dataUuid].vipUuid}})
                }
              }"/>
        <detail-row :param="{
                title: 'common.vm',
                content: dbData.vm[$data.vmUuid] && dbData.vm[$data.vmUuid].name,
                handler: () => {
                  $router.push({name: 'detailVm', params: {uuid: $data.vmUuid}})
                }
              }"/>
        <detail-row :param="{
                title: 'common.publicNetwork',
                content: getPublicNetworkName()
              }"/>
      </div>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'log'">
      <log-list :param="{ uuid: windowData.dataUuid }"/>
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

  export default {
    name: "PortForwardingDetailPage",
    mixins: [WindowBase, Root, Methods],
    components: {
      DetailLongContent,
      DetailInfoState,
      DetailTemplate,
      PageTemplate,
      LogList
    },
    created() {
      this.updateWindow({
        accountUuid: window.localStorage.getItem('accountUuid'),
        currTab: 'info',
        dataUuid: this.$route.params ? this.$route.params.uuid : ''
      })
        .then(() => {
          return this.query()
        }).then(() => {
        let uuid = this.windowData.dataUuid
        let portforwarding = _.cloneDeep(this.dbData.portforwarding[uuid])
        let vip = _.cloneDeep(this.dbData.vip[portforwarding.vipUuid])
        this.$data.l3NetworkUuidForPublic = vip.l3NetworkUuid
        this.$data.l3NetworkForPrivate = vip.peerL3NetworkUuid
      })

      window.addEventListener('click', this.onWindowClick)

    },
    mounted() {

    },
    computed: {},
    destroyed: function () {
      window.removeEventListener('click', this.onWindowClick)
    },
    watch: {
      'param.uuid': function (newValue, oldValue) {
        if (newValue === oldValue) return
        // pass param for desktop manager
        if (this.param) {
          this.updateWindow({dataUuid: this.param.uuid}).then(() => this.query())
        }
      },
      'windowData.currTab': function () {
        setTimeout(this.drawChart, 0)
      }
    },
    data() {
      return {
        activeName: 'info',
        l3NetworkUuidForPublic: '',
        l3NetworkForPrivate: '',
        l3NetworkUuidForPublicName: '',
        vmUuid: '',
        editName: false,
        newName: '',
        editDescription: false,
        newDescription: '',
        editOutboundBandwidth: false,
        editInboundBandwidth: false
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
            if (this.dbData.portforwarding[this.windowData.dataUuid]) {
              return this.dbData.portforwarding[this.windowData.dataUuid].name
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('port-forwarding', 'updatePortForwardingRule', 'name', 'portforwarding', value)
          }
        }
      },
      getDescriptionParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.portforwarding[self.windowData.dataUuid]) {
              return this.dbData.portforwarding[self.windowData.dataUuid].description
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('port-forwarding', 'updatePortForwardingRule', 'description', 'portforwarding', value)
          }
        }
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({showMoreDropdown: false})
      },
      canLinkToKvm: function () {
        const self = this
        let value = true
        if (self.dbData.vm[self.$data.vmUuid] && self.dbData.vm[self.$data.vmUuid].hypervisorType === 'ESX') {
          value = false
        }
        return value
      },
      canLinkToKvmL3: function () {
        const self = this
        let value = true
        if (self.dbData.portforwarding[self.windowData.dataUuid] && self.dbData.vip[self.dbData.portforwarding[self.windowData.dataUuid].vipUuid] && self.dbData.l3NetworkOfHost[self.dbData.vip[self.dbData.portforwarding[self.windowData.dataUuid].vipUuid].l3NetworkUuid] && (self.dbData.l3NetworkOfHost[self.dbData.vip[self.dbData.portforwarding[self.windowData.dataUuid].vipUuid].l3NetworkUuid].length > 0) && self.dbData.l3NetworkOfHost[self.dbData.vip[self.dbData.portforwarding[self.windowData.dataUuid].vipUuid].l3NetworkUuid][0] && self.dbData.l3NetworkOfHost[self.dbData.vip[self.dbData.portforwarding[self.windowData.dataUuid].vipUuid].l3NetworkUuid][0].hypervisorType === 'ESX') {
          value = false
        }
        return value
      },
      getPublicNetworkName: function () {
        let value = ''
        try {
          let vipUuid = this.dbData.portforwarding[this.windowData.dataUuid].vipUuid
          let l3NetworkUuid = this.dbData.vip[vipUuid].l3NetworkUuid
          value = this.dbData.l3network[l3NetworkUuid].name
        } catch (e) {
          value = ''
        }
        return value
      },

      pageAttachPortForwardingRule: function () {
        this.openDialog('PortForwardingVmNicSingleSelect', {
          portForwardingUuid: this.windowData.dataUuid,
          select: (vmNicUuid) => this.addPortForwardingVmNics(vmNicUuid)
        })
        // this.detailOpenInplaceDialog('PortForwardingVmNicSingleSelect', this.windowData.dataUuid, (vmNicUuid) => this.addPortForwardingVmNics(vmNicUuid))
      },
      pageDetachPortForwardingRule: function () {
        let self = this;
        self.openDialog('ConfirmDlg', {
          uuidList: [this.$data.vmUuid],
          title: 'portforwarding.detach',
          description: 'portforwarding.detachpfVm',
          icon: 'vm_plain',
          ok: () => {
            self.detachPortForwardingRule([self.windowData.dataUuid])
              .then(() => {
                self.query()
              })
          },
          getName: (uuid) => {
            return self.dbData.vm[uuid].name;
          }
        })
      },
      query: function () {
        const self = this
        // let uuid = self.windowData.dataUuid
        return rpc.query(`port-forwarding/${self.windowData.dataUuid}`)
          .then((resp) => {
            self.updateDbTable({
              tableName: 'portforwarding',
              list: resp.inventories
            })
            let portforwarding = _.cloneDeep(self.dbData.portforwarding[self.windowData.dataUuid])
            let tasks = []
            let p = null
            p = rpc.query('vips', {
              q: `portForwarding.uuid=${self.windowData.dataUuid}`
            }).then((vips) => {
              self.updateDbTable({
                tableName: 'vip',
                list: vips.inventories
              })
              let l3networkList = []
              vips.inventories.forEach(function (item) {
                l3networkList.push(item.l3NetworkUuid)
                if (item.peerL3NetworkUuids && item.peerL3NetworkUuids.length > 0) {
                  l3networkList = l3networkList.concat(item.peerL3NetworkUuids)
                }
              })
              if (vips.inventories.length > 0 && vips.inventories[0] && vips.inventories[0].l3NetworkUuid) {
                rpc.query('hosts', {
                  q: `cluster.l2Network.l3Network.uuid=${vips.inventories[0].l3NetworkUuid}`,
                  limit: 1,
                  fields: 'hypervisorType'
                }).then((l3host) => {
                  if (l3host.inventories.length === 0) l3host.inventories = [{'hypervisorType': ''}]
                  self.forceUpdateDbRow({
                    tableName: 'l3NetworkOfHost',
                    id: vips.inventories[0].l3NetworkUuid,
                    data: l3host.inventories
                  })
                })
              }
              rpc.query('l3-networks', {
                q: `uuid?=${l3networkList}`
              }).then((l3network) => {
                return self.updateDbTable({
                  tableName: 'l3network',
                  list: l3network.inventories
                })
              })
            })
            tasks.push(p)

            if (this.dbData.common.isAdmin) {
              p = rpc.query('accounts/resources/refs', {
                q: `resourceUuid=${portforwarding.uuid}`
              }).then((account) => {
                if (account.inventories.length > 0) {
                  portforwarding.accountUuid = account.inventories[0].accountUuid
                  self.updateDbRow({
                    tableName: 'portforwarding',
                    id: portforwarding.uuid,
                    data: portforwarding
                  })
                }
              })
              tasks.push(p)
            }
            p = rpc.query('vm-instances', {
              q: `vmNics.portForwarding.uuid=${self.windowData.dataUuid}`
            }).then((vm) => {
              self.updateDbTable({
                tableName: 'vm',
                list: vm.inventories
              })
              if (vm.inventories.length <= 0) {
                self.$data.vmUuid = ''
              } else {
                self.$data.vmUuid = vm.inventories[0].uuid
              }
            })
            tasks.push(p)

            return Promise.all(tasks)
          })
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({showMoreDropdown: !this.windowData.showMoreDropdown})
        $event.stopPropagation()
      },
      pageDelete: function () {
        let self = this;
        this.openDialog('ConfirmDlg', {
          uuidList: [this.windowData.dataUuid],
          title: 'portforwarding.delete',
          description: 'portforwarding.info.deleteConfirm',
          icon: 'port_forwarding_popupico',
          ok: () => {
            self.delete([this.windowData.dataUuid]).then(() => {
              self.$router.push({name: 'portforwarding'})
            })
          },
          getName: (uuid) => {
            return self.dbData.portforwarding[uuid].name;
          }
        })
      },
      delete: function (uuid) {
        const self = this
        let event = self.createEvent('portforwarding.action.delete', self.dbData.portforwarding[uuid].name)
        rpc._delete(`port-forwarding/${uuid}`, null, event)
          .then((resp) => {
            self.incEventSuccess(event)
            if (self.param.refresh) self.param.refresh(uuid)
          }, () => {
            self.incEventFail(event)
          })
      },
      addPortForwardingVmNics: function (uuidList) {
        if (uuidList.length === 0) return
        let event = this.createEvent('vm.action.attachPortForwardingRule', uuidList.length === 1 ? this.dbData.vm[this.dbData.vmNicRefs[uuidList[0]].vmInstanceUuid].name : '', uuidList.length)
        let self = this
        rpc.create(`port-forwarding/${self.windowData.dataUuid}/vm-instances/nics/${uuidList[0]}`, null, event)
          .then((resp) => {
            self.updateDbRow({
              tableName: 'portforwarding',
              id: self.windowData.dataUuid,
              data: resp.inventory
            })
            self.incEventSuccess(event)
            self.query()
          }, () => {
            self.incEventFail(event)
          })
      },
      detachPortForwardingRule: function (uuidList) {
        const self = this
        let event = self.createEvent('portforwarding.action.detach', uuidList.length === 1 ? self.dbData.portforwarding[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc._delete(`port-forwarding/${uuid}/vm-instances/nics`, null, event)
              .then((resp) => {
                console.log(resp)
                self.updateDbTable({
                  tableName: 'portforwarding',
                  list: [resp.inventory]
                })
                self.query()
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
          })(uuid)
        })
      },
      outboundBandwidthEditEnd: function (newValue) {
        this.editOutboundBandwidth = false
        if (_.isEqual(newValue, this.windowData.outboundBandwidth)) return
        this.setboundBandwidth(newValue, this.dbData.portforwarding[this.windowData.dataUuid].vipUuid, 'outboundBandwidth').then(() => this.query())
      },
      inboundBandwidthEditEnd: function (newValue) {
        this.editInboundBandwidth = false
        if (_.isEqual(newValue, this.windowData.inboundBandwidth)) return
        this.setboundBandwidth(newValue, this.dbData.portforwarding[this.windowData.dataUuid].vipUuid, 'inboundBandwidth').then(() => this.query())
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
      },
      ...Utils
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
