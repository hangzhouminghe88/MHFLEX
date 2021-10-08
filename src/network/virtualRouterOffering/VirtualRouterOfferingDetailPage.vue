<template>
  <detail-template>
    <div class="detail-header" slot="header">
            <span @click="$router.push({name:'virtualrouteroffering'})" class="create-back detail-header-item">
                <i class="el-icon-back"></i>
              回到云路由规格列表
            </span>
      <span class="detail-header-item">
                <drop-down class="detail-dropdown">
                    <span slot="title">
                        <span class="text">{{$t('common.virtualRouterOfferingActions')}}</span>
                    </span>
                    <span slot="content">
                      <div class="dropdown-content">
                        <a id="common-enable" @click="inStates('Disabled') && pageStart()"
                           :class="{ 'disabled-text': !inStates('Disabled')}" style="padding-top: 12px;">{{$t('common.enable')}}</a>
                        <a id="common-disable" @click="inStates('Enabled') && pageStop()"
                           :class="{ 'disabled-text': !inStates('Enabled')}">{{$t('common.disable')}}</a>
                        <a id="common-shareToAll" v-permission="'LICENSE_BASIC_PAID'"
                           v-if="dbData.instanceOffering[windowData.dataUuid] && !isVCenterVirtualRouterOffering(windowData.dataUuid)"
                           @click="!dbData.instanceOffering[windowData.dataUuid].toPublic && pageShareInstanceOfferingToAll()"
                           :class="{ 'disabled-text': dbData.instanceOffering[windowData.dataUuid] && dbData.instanceOffering[windowData.dataUuid].toPublic}">{{$t("common.shareToAll")}}</a>
                        <a id="common-recallFromAll" v-permission="'LICENSE_BASIC_PAID'"
                           v-if="dbData.instanceOffering[windowData.dataUuid] && !isVCenterVirtualRouterOffering(windowData.dataUuid)"
                           @click="dbData.instanceOffering[windowData.dataUuid].toPublic && pageRecallInstanceOfferingFromAll()"
                           :class="{ 'disabled-text': dbData.instanceOffering[windowData.dataUuid] && !dbData.instanceOffering[windowData.dataUuid].toPublic}">{{$t("common.recallFromAll")}}</a>
                        <a id="common-destroy" style="padding-bottom:12px;" v-show="dbData.common.isAdmin"
                           @click="deleteInstanceOffering()">{{ $t("common.destroy") }}</a>
                      </div>
                    </span>
                </drop-down>
            </span>
      <el-tabs class="detail-tab" v-model="activeName" @tab-click="handleTabChange" tabPosition="bottom">
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
        <el-tab-pane v-permission="'LICENSE_BASIC_PAID'" :label="$t('common.share')" name="share"
                     v-if="dbData.common.isAdmin && !isVCenterVirtualRouterOffering(windowData.dataUuid)"></el-tab-pane>
        <el-tab-pane v-permission="'LICENSE_BASIC_PAID'" :label="$t('common.log')" name="log"></el-tab-pane>
      </el-tabs>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="detail-info-left-top-blank"></div>
        <div class="left-header">
          <base-icon name="instance_offering_large"/>
          <div class="after-icon">
            <detail-info-state outer-class-name="detail-page-state"
                               :state="dbData.instanceOffering[windowData.dataUuid] && dbData.instanceOffering[windowData.dataUuid].state"/>
          </div>
          <detail-name :param="getNameParam()" class="name"/>
          <detail-description :param="getDescriptionParam()" class="description"/>

        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t("common.overview")}}
          </div>
          <detail-row :param="{
                    title: $t('common.memory'),
                    content: dbData.instanceOffering[windowData.dataUuid] && bytesToSize(dbData.instanceOffering[windowData.dataUuid].memorySize)
                  }"/>
          <detail-row :param="{
                    title: $t('common.shareToAll'),
                    content: dbData.instanceOffering[windowData.dataUuid] && $t(`common.${dbData.instanceOffering[windowData.dataUuid].toPublic}`)
                  }" v-if="dbData.common.isAdmin && !isVCenterVirtualRouterOffering(windowData.dataUuid)"/>
          <detail-row :param="{
                    title: 'CPU',
                    content: dbData.instanceOffering[windowData.dataUuid] && dbData.instanceOffering[windowData.dataUuid].cpuNum
                  }"/>
          <detail-row :param="{
                    title: $t('common.createDate'),
                    content: dbData.instanceOffering[windowData.dataUuid] && formatDatetime(new Date(dbData.instanceOffering[windowData.dataUuid].createDate))
                  }"/>
          <detail-row :param="{
                    title: $t('common.lastOpDate'),
                    content: dbData.instanceOffering[windowData.dataUuid] && formatDatetime(new Date(dbData.instanceOffering[windowData.dataUuid].lastOpDate))
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
                content: windowData.dataUuid
              }"/>
        <detail-row :param="{
                title: 'common.virtualRouterImage',
                content: dbData.instanceOffering[windowData.dataUuid] && dbData.image[dbData.instanceOffering[windowData.dataUuid].imageUuid] && dbData.image[dbData.instanceOffering[windowData.dataUuid].imageUuid].name,
                handler: () => {
                  $router.push({name: 'detailvirtualrouterimage', params: {uuid: dbData.instanceOffering[windowData.dataUuid].imageUuid}})
                }
              }"/>
        <detail-row :param="{
                title: 'common.managementNetwork',
                content: dbData.instanceOffering[windowData.dataUuid] && dbData.l3network[dbData.instanceOffering[windowData.dataUuid].managementNetworkUuid] && dbData.l3network[dbData.instanceOffering[windowData.dataUuid].managementNetworkUuid].name,
                handler: () => {
                  goToL3NetWorkDetail(dbData.instanceOffering[windowData.dataUuid].managementNetworkUuid);
                }
              }"/>
        <detail-row :param="{
                title: 'common.publicNetwork',
                content:dbData.instanceOffering[windowData.dataUuid] &&  dbData.l3network[dbData.instanceOffering[windowData.dataUuid].publicNetworkUuid] && dbData.l3network[dbData.instanceOffering[windowData.dataUuid].publicNetworkUuid].name,
                handler: () => {
                 goToL3NetWorkDetail(dbData.instanceOffering[windowData.dataUuid].publicNetworkUuid);
                }
              }"/>

      </div>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'share'">
      <virtual-router-offering-account-tab-list
        :param="{conditions: `resourceUuid=${windowData.dataUuid}`, uuid: windowData.dataUuid, tableName: 'instanceOffering'}"/>
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
  import LogList from "../../component/LogList";
  import DetailInfoState from "../../component/DetailInfoState";
  import DetailLongContent from "../../main-component/DetailLongContent";
  import VirtualRouterOfferingAccountTabList from 'src/om/account/component/ShareTabList'
  import Methods from './Methods'

  export default {
    name: "VirtualRouterOfferingDetailPage",
    mixins: [WindowBase, Root, Methods],
    components: {
      DetailLongContent,
      DetailInfoState,
      DetailTemplate,
      PageTemplate,
      LogList,
      'virtual-router-offering-account-tab-list': VirtualRouterOfferingAccountTabList
    },
    created() {


      this.updateWindow({
        currTab: 'info',
        dataUuid: this.$route.params ? this.$route.params.uuid : '',
        methods: {query: this.query}
      })
        .then(() => {
          this.updateDbRow({
            tableName: 'instanceOffering',
            id: this.windowData.dataUuid,
            data: []
          })

          return this.query()
        })
        .then(() => {
          this.$forceUpdate()
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
        newDescription: ''
      }
    },
    methods: {
      ...Utils,
      getNameParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.instanceOffering[this.windowData.dataUuid]) {
              return this.dbData.instanceOffering[this.windowData.dataUuid].name
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('instance-offerings', 'updateInstanceOffering', 'name', 'instanceOffering', value)
          }
        }
      },
      getDescriptionParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.instanceOffering[self.windowData.dataUuid]) {
              return this.dbData.instanceOffering[self.windowData.dataUuid].description
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('instance-offerings', 'updateInstanceOffering', 'description', 'instanceOffering', value)
          }
        }
      },
      handleTabChange(tab, event) {
        let self = this;
        if (self.activeName === tab.name) return;
        self.activeName = tab.name;
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({showMoreDropdown: false})
      },
      query: function () {
        let instanceOfferingInventories = {}

        return rpc.query(`instance-offerings/virtual-routers/${this.windowData.dataUuid}`)
          .then((resp) => {
            rpc.getResourceAccount([this.windowData.dataUuid], this)
            instanceOfferingInventories = resp.inventories[0]
            let queryImages = () => {
              return rpc.query('images')
                .then((resp) => {
                  return this.updateDbTable({
                    tableName: 'image',
                    list: resp.inventories
                  })
                })
            }
            let resourceIsShareToAll = () => {
              if (this.dbData.common.isAdmin) {
                return this.isShareToAll(instanceOfferingInventories.uuid)
                  .then((resp) => {
                    instanceOfferingInventories.toPublic = resp
                  })
              }
            }
            let queryL3Network = () => {
              let uuid = instanceOfferingInventories.managementNetworkUuid
              return rpc.query(`l3-networks`, {q: [`uuid=${uuid}`]})
                .then(resp => {
                  return this.updateDbRow({
                    tableName: 'l3network',
                    id: uuid,
                    data: resp.inventories[0]
                  })
                })
            }
            let tasks = [queryImages(), resourceIsShareToAll(), queryL3Network()]
            return Promise.all(tasks).then((resp) => {
              this.updateDbRow({
                tableName: 'instanceOffering',
                id: this.windowData.dataUuid,
                data: instanceOfferingInventories
              })
            })
          })
      },
      isShareToAll: function (uuid) {
        return rpc.query('accounts/resources', {
          q: `resourceUuid=${uuid}`
        })
          .then((resp) => {
            let toPublic = false
            resp.inventories.forEach((item) => {
              if (item.toPublic) toPublic = true
            })
            return toPublic
          })
      },
      changeCurrTab: function (tabName) {
        if (this.windowData.currTab !== tabName) {
          this.updateWindow({currTab: tabName})
        }
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({showMoreDropdown: !this.windowData.showMoreDropdown})
        $event.stopPropagation()
      },
      deleteInstanceOffering: function () {
        let uuidList = []
        uuidList.push(this.windowData.dataUuid)
        let self = this
        this.openDialog('ConfirmDlg', {
          uuidList,
          title: "virtualRouterOffering.delete",
          description: 'virtualRouterOffering.info.deleteConfirm',
          icon: 'instance_offering_popupico',
          warning: 'virtualRouterOffering.deleteWarning',
          ok: () => {
            this.delete(uuidList)
          },
          getName: (uuid) => {
            return self.dbData.instanceOffering[uuid].name;
          }
        })
      },
      delete: function (uuidList) {
        const self = this
        let event = self.createEvent('instanceOffering.vrdestory', uuidList.length === 1 ? self.dbData.instanceOffering[uuidList[0]].name : '', uuidList.length)
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            rpc._delete(`instance-offerings/${uuid}`, null, event)
              .then((resp) => {
                self.$router.push({name: 'virtualrouteroffering'})
                self.incEventSuccess(event)
              }, () => self.incEventFail(event))
          })(uuid)
        })
      },
      pageRecallInstanceOfferingFromAll: function () {
        this.openDialog('SharetoAllConfirmDlg', {
          title: 'common.recallFromAll',
          warning: 'account.recall',
          ok: () => {
            this.recallFromAll([this.windowData.dataUuid])
              .then(() => this.query())
          }
        })
      },
      pageShareInstanceOfferingToAll: function () {
        this.openDialog('SharetoAllConfirmDlg', {
          title: 'common.shareToAll',
          warning: 'instanceOffering.shareToAllText',
          ok: () => {
            this.shareInstanceOfferingToAll([this.windowData.dataUuid])
              .then(() => this.query())
          }
        })
      },
      pageStart: function () {
        this.start([this.windowData.dataUuid])
      },
      pageStop: function () {
        this.stop([this.windowData.dataUuid])
      },
      inStates: function () {
        let stateList = []
        if (!this.dbData.instanceOffering[this.windowData.dataUuid] || !this.dbData.instanceOffering[this.windowData.dataUuid].state) return;
        for (let i = 0; i < arguments.length; i++) {
          stateList.push(arguments[i])
        }
        return !stateList.every((item, index, array) => {
          return item !== this.dbData.instanceOffering[this.windowData.dataUuid].state
        })
        return true;
      },
      //回到三层层网络详情
      goToL3NetWorkDetail(uuid) {
        this.$router.push({name: `detail${this.dbData.l3network[uuid].category}Network`, params: {uuid}})
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
