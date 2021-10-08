<template>
  <detail-template>
    <div class="detail-header" slot="header">
      <span class="detail-title">弹性IP详情</span>
            <span @click="$router.push({name:'eip'})" class="create-back detail-header-item"
                 >
                <i class="el-icon-back"></i>
              回到弹性IP列表
            </span>
            <span class="detail-header-item">
                <drop-down class="detail-dropdown">
                    <span slot="title">
                        <span class="text">{{$t("eip.eipActions")}}</span>
                    </span>
                    <span slot="content">
                      <div class="dropdown-content">
                        <a id="eip-attach" v-permission="'EIP.ATTACH'" @click="!dbData.eip[windowData.dataUuid].vmNicUuid && attachEip()" v-if="dbData.eip[windowData.dataUuid]" :class="{ 'disabled-text': dbData.eip[windowData.dataUuid].vmNicUuid }" style="padding-top: 12px;">{{$t("eip.attach")}}</a>
                        <a id="eip-detach" v-permission="'EIP.DETACH'" @click="detachOneEip()" v-if="dbData.eip[windowData.dataUuid]" :class="{ 'disabled-text': !dbData.eip[windowData.dataUuid].vmNicUuid }">{{$t("eip.detach")}}</a>
                        <a id="common-changeResourceOwner" v-if="dbData.common.isAdmin" v-permission="'LICENSE_BASIC_PAID'" @click="detailChangeResourceOwner(dbData.eip[windowData.dataUuid].accountUuid)">{{$t("common.changeResourceOwner")}}</a>
                        <a id="common-destroy" @click="deleteEip()" v-permission="'EIP.DELETE'" style="padding-bottom: 12px;">{{$t("common.destroy")}}</a>
                      </div>
                    </span>
                </drop-down>
            </span>
                <el-tabs class="detail-tab" v-model="activeName" @tab-click="handleTabChange" tabPosition="bottom"
                         >
                    <el-tab-pane :label="$t('common.basicAttributes')" name="info"
                                ></el-tab-pane>
                     <el-tab-pane v-permission="'LICENSE_BASIC_PAID'" :label="$t('common.log')" name="log"
                                 ></el-tab-pane>
                </el-tabs>
    </div>

      <div slot="body" class="detail-body" v-if="activeName === 'info'">
        <div class="left">
          <div class="detail-info-left-top-blank"></div>
          <div class="left-header">
            <base-icon name="eip_large"/>
            <div class="after-icon">
              <detail-info-state outer-class-name="detail-page-state" :state="dbData.eip[windowData.dataUuid] && dbData.eip[windowData.dataUuid].state" />
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
                    content: dbData.eip[windowData.dataUuid] && dbData.eip[windowData.dataUuid].vipIp
                  }" />
            <detail-row :param="{
                    title: $t('common.privateNetworkIP'),
                    content: dbData.eip[windowData.dataUuid] && dbData.eip[windowData.dataUuid].guestIp
                  }" />

            <detail-row :param="{
                    title: $t('common.owner'),
                    content: getResourceOwner(windowData.dataUuid)
                  }" />
            <detail-row :param="{
                    title: $t('common.createDate'),
                    content: dbData.eip[windowData.dataUuid] && formatDatetime(new Date(dbData.eip[windowData.dataUuid] && dbData.eip[windowData.dataUuid].createDate))
                  }"/>
            <detail-row :param="{
                    title: $t('common.lastOpDate'),
                    content: dbData.eip[windowData.dataUuid] && formatDatetime(new Date(dbData.eip[windowData.dataUuid] && dbData.eip[windowData.dataUuid].lastOpDate))
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
              }" />
          <detail-row :param="{
                title: 'common.vip',
                content:  dbData.eip[windowData.dataUuid] && getVipName(windowData.dataUuid),
                handler: () => {
                  $router.push({name:'detailvip', params: {uuid: dbData.eip[windowData.dataUuid].vipUuid}})
                }
              }" />
          <detail-row :param="{
                title: 'common.vm',
                content:  dbData.eip[windowData.dataUuid] && getVmInstanceName(windowData.dataUuid),
                handler: () => {
                  $router.push({name:'detailVm', params: {uuid: this.dbData.vmNicVmInstanceRef[dbData.eip[windowData.dataUuid].vmNicUuid].uuid}})
                }
              }" />
          <detail-row :param="{
                title: 'common.publicNetwork',
                content:  dbData.eip[windowData.dataUuid] && getPublicNetworkName()
              }" />
        </div>
      </div>

      <div slot="body" class="detail-body" v-if="activeName === 'log'">
        <log-list :param="{ uuid: windowData.dataUuid }" />
      </div>

    <div slot="footer">
      <eip-attachable-vm-nics-single-select-list v-if="showAttachNic" :param="attachEiptoVmParam" @close="showAttachNic = false;"/>
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
  import ChangeResourceOwnerDlg from 'src/utils/changeResourceOwner'
  import EipAttachableVmNicsSingleSelectList from "./component/EipAttachableVmNicsSingleSelectList";

  export default {
    name: "EipDetailPage",
    mixins: [WindowBase, Root, Methods],
    components: {
      EipAttachableVmNicsSingleSelectList,
      DetailLongContent,
      DetailInfoState,
      DetailTemplate,
      PageTemplate,
      LogList
    },
    created() {
      this.getProjectAdmin = IAM2ProjectMethods.methods.getProjectAdmin.bind(this)
      this.changeResourceOwnerDlg = ChangeResourceOwnerDlg.changeResourceOwnerDlg.bind(this)
      this.updateWindow({currTab: 'info'})
      let dataUuid = this.$route.params ? this.$route.params.uuid : ''
      this.updateWindow({
        dataUuid,
        methods: { query: this.query }
      })
        .then(() => {
          return this.query()
        })
        .then(() => {
          this.$forceUpdate()
        })
    },
    mounted(){

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
        this.updateWindow({dataUuid: this.param.uuid})
          .then(() => {
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
        showAttachNic: false,
        attachEiptoVmParam: {}
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
            if (this.dbData.eip[this.windowData.dataUuid]) {
              return this.dbData.eip[this.windowData.dataUuid].name
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('eips', 'updateEip', 'name', 'eip', value)
          }
        }
      },
      getDescriptionParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.eip[self.windowData.dataUuid]) {
              return this.dbData.eip[self.windowData.dataUuid].description
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('eips', 'updateEip', 'description', 'eip', value)
          }
        }
      },
      attachEip () {
        const self = this;
        self.attachEiptoVmParam = {
          eipUuid: self.windowData.dataUuid,
          ok: (vmNicIpUuid, vmNicUuid) => {
            this.attachEipToVm(self.windowData.dataUuid, vmNicUuid).then(() => {
              this.query()
            })
          }
        }
        self.showAttachNic = true;
      },
      query: function () {
        const self = this
        let eipInventory
        rpc.query(`eips/${self.windowData.dataUuid}`)
          .then((resp) => {
            self.updateDbTable({
              tableName: 'eip',
              list: resp.inventories
            })
            // eipInventory = resp.inventories[0]
            eipInventory = _.cloneDeep(self.dbData.eip[self.windowData.dataUuid])
            let tasks = []
            let p = null
            p = rpc.getResourceAccount([self.windowData.dataUuid], self)
            tasks.push(p)
            p = rpc.query('vips', {
              q: `eip.uuid=${self.windowData.dataUuid}`
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
              l3networkList = _.uniq(l3networkList)
              l3networkList.forEach(l3NetworkUuid => {
                rpc.query('hosts', {
                  q: `cluster.l2Network.l3Network.uuid=${l3NetworkUuid}`,
                  limit: 1,
                  fields: 'hypervisorType'
                }).then((l3host) => {
                  if (l3host.inventories.length === 0) l3host.inventories = [{ 'hypervisorType': '' }]
                  self.forceUpdateDbRow({
                    tableName: 'l3NetworkOfHost',
                    id: vips.inventories[0].l3NetworkUuid,
                    data: l3host.inventories
                  })
                })
              })
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

            if (eipInventory.vmNicUuid) {
              p = rpc.query('vm-instances', {
                q: `vmNics.uuid?=${eipInventory.vmNicUuid}`
              }).then((result) => {
                self.updateDbTable({
                  tableName: 'vm',
                  list: result.inventories
                })
              })
              tasks.push(p)
            }
            return Promise.all(tasks)
          })
      },
      canAttach: function () {
        return !(this.dbData.eip[this.windowData.dataUuid] && this.dbData.eip[this.windowData.dataUuid].vmNicUuid)
      },
      canDetach: function () {
        return this.dbData.eip[this.windowData.dataUuid] && this.dbData.eip[this.windowData.dataUuid].vmNicUuid
      },
      canLinkToKvm: function () {
        const self = this
        let value = true
        let vmNicUuid = self.dbData.eip[self.windowData.dataUuid].vmNicUuid
        if (_.get(_.find(self.dbData.vm, item => { return _.find(item.vmNics, it => { return it.uuid === vmNicUuid }) }), 'hypervisorType') === 'ESX') {
          value = false
        }
        return value
      },
      getVmInstanceUuid: function (uuid) {
        const self = this
        let vmNicUuid = self.dbData.eip[uuid].vmNicUuid
        return _.get(_.find(self.dbData.vm, item => { return _.find(item.vmNics, it => { return it.uuid === vmNicUuid }) }), 'uuid')
      },
      canLinkToKvmL3: function () {
        const self = this
        let value = true
        if (_.get(self.dbData.l3NetworkOfHost, [_.get(self.dbData.vip, [_.get(self.dbData.eip, [self.windowData.dataUuid, 'vipUuid']), 'l3NetworkUuid']), '0', 'hypervisorType']) === 'ESX') {
          value = false
        }
        return value
      },
      getPublicNetworkName: function () {
        let value = ''
        try {
          let vipUuid = this.dbData.eip[this.windowData.dataUuid].vipUuid
          let l3NetworkUuid = this.dbData.vip[vipUuid].l3NetworkUuid
          value = this.dbData.l3network[l3NetworkUuid].name
        } catch (e) {
          value = ''
        }
        return value
      },
      detailChangeResourceOwner: async function () {
        const self = this
        self.changeResourceOwnerDlg(self.windowData.dataUuid, self.changeResourceToAccountOrProject, self.query)
      },
      changeOwner: function (eipaccountUuid) {
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
          let uuidList = [this.windowData.dataUuid]
          return this.openSideWindow('AccountListDlg', {
            uuid: eipaccountUuid,
            select: (uuid) => {
              return self.changeResourceOwner(uuidList, uuid).then(() => {
                return self.query()
              })
            }
          })
        }
      },
      changeCurrTab: function (tabName) {
        if (this.windowData.currTab !== tabName) {
          this.updateWindow({currTab: tabName})
        }
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({ showMoreDropdown: !this.windowData.showMoreDropdown })
        $event.stopPropagation()
      },
      deleteEip: function () {
        let self = this
        let uuidList = []
        uuidList.push(this.windowData.dataUuid);
        self.openDialog('DeleteEipConfirmDlg',{
          title: 'eip.deleteEip',
          description: 'eip.delete',
          uuidList: uuidList,
          icon: 'eip_popupico',
          ok: (deleteVip) => {
            self.delete(uuidList, deleteVip)
              .then(() => {
                self.$router.push({name: 'eip'})
              })
          },
          getName: (uuid) => {
            return self.dbData.eip[uuid].name;
          }
        })
      },
      delete: function (uuid, deleteVip) {
        const self = this
        let event = self.createEvent('eip.action.delete', self.dbData.eip[uuid].name)
        console.log(rpc)
        let tasks = []
        let p = null
        if (deleteVip) {
          let vip = _.cloneDeep(self.dbData.eip[uuid])
          p = rpc._delete(`vips/${vip.vipUuid}`, null, event)
            .then((resp) => {
              if (self.param.refresh) self.param.refresh(uuid)
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
        } else {
          p = rpc._delete(`eips/${uuid}`, null, event)
            .then((resp) => {
              if (self.param.refresh) self.param.refresh(uuid)
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
        }
        return Promise.all(tasks)
      },

      outboundBandwidthEditEnd: function (newValue) {
        this.editOutboundBandwidth = false
        if (_.isEqual(newValue, this.windowData.outboundBandwidth)) return
        this.setboundBandwidth(newValue, this.dbData.eip[this.windowData.dataUuid].vipUuid, 'outboundBandwidth').then(() => this.query())
      },
      inboundBandwidthEditEnd: function (newValue) {
        this.editInboundBandwidth = false
        if (_.isEqual(newValue, this.windowData.inboundBandwidth)) return
        this.setboundBandwidth(newValue, this.dbData.eip[this.windowData.dataUuid].vipUuid, 'inboundBandwidth').then(() => this.query())
      },
      setboundBandwidth: function (msg, uuid, type) {
        let event = this.createEvent('vip.action.setQos', this.dbData.vip[uuid].name)
        if (msg <= 0) {
          return rpc._delete(`vips/${uuid}/vip-qos`, {
            direction: type === 'inboundBandwidth' ? 'in' : 'out'
          }, event)
            .then((resp) => {
              this.incEventSuccess(event)
              return new Promise((resolve, reject) => { resolve() })
            }, () => {
              this.incEventFail(event)
              return new Promise((resolve, reject) => { resolve() })
            })
        } else {
          let obj = {}
          obj.setVipQos = {}
          obj.setVipQos[type] = msg
          return rpc.put(`vips/${uuid}/actions`, obj, event)
            .then((resp) => {
              this.incEventSuccess(event)
              return new Promise((resolve, reject) => { resolve() })
            }, () => {
              this.incEventFail(event)
              return new Promise((resolve, reject) => { resolve() })
            })
        }
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
