<template>
  <detail-template>
    <div class="detail-header" slot="header">
      <span class="detail-title">镜像服务器详情</span>
      <span @click="$router.push({name:'backupstorage'})" class="create-back detail-header-item"
      >
                <i class="el-icon-back"></i>
              回到镜像服务器列表
            </span>
      <span class="detail-header-item">
                <drop-down class="detail-dropdown">
                    <span slot="title">
                        <span class="text">{{$t('common.primaryStorageActions')}}</span>
                    </span>
                    <span slot="content">
                        <div class="dropdown-content">
                          <a id="common-start" style="padding-top: 12px;" disabled="true"
                             @click="!inStates('Enabled') && detilStart(windowData.dataUuid)"
                             :class="{ 'disabled-text': inStates('Enabled')}">{{ $t("common.start") }}</a>
                          <a id="common-stop" @click="!inStates('Disabled') && detailStop(windowData.dataUuid)"
                             :class="{'disabled-text': inStates('Disabled')}">{{ $t("common.stop") }}</a>
                          <a id="common-reconnect" @click="detailReconnect(windowData.dataUuid)">{{$t('common.reconnect')}}</a>
                          <a id="common-clear" v-permission="'LICENSE_BASIC_PAID'"
                             @click="model.type === 'ImageStoreBackupStorage' && model.status !== 'Disconnected' && reclaimSpaceFromImageStore(windowData.dataUuid) && canClear"
                             :class="{'disabled-text': model && (model.type!== 'ImageStoreBackupStorage' || model.status === 'Disconnected') }">{{$t('common.clear')}}
                            <help-trigger name="clearBackUpStorage"
                                          :style="{ position: 'relative', top: '0', display: 'inline-block', verticalAlign: 'middle', left: '5px' }"/>
                          </a>
                          <a id="common-destroy" @click="detailDelete(windowData.dataUuid)"
                             style="padding-bottom: 12px;">{{$t('common.destroy')}}</a>
                        </div>
                    </span>
                </drop-down>
            </span>
      <el-tabs class="detail-tab" v-model="activeName" @tab-click="handleTabChange" tabPosition="bottom"
      >
        <el-tab-pane :label="$t('common.basicAttributes')" name="info"
        ></el-tab-pane>
        <el-tab-pane :label="$t('common.monitoringNode')" name="mon"
                     v-if="model && (model.type === 'Ceph' || model.type === 'Fusionstor')"
        ></el-tab-pane>
        <el-tab-pane :label="$t('common.image')" name="image"
        ></el-tab-pane>
        <el-tab-pane :label="$t('vm.monitor')" name="monitor" v-permission="'LICENSE_BASIC_PAID'"
        ></el-tab-pane>
        <el-tab-pane :label="$t('vm.monitoralarm')" name="monitoralarm" v-permission="'LICENSE_BASIC_PAID'"
        ></el-tab-pane>
        <el-tab-pane :label="$t('common.clear')" name="trash" v-permission="'LICENSE_BASIC_PAID'"
                     v-if="model && model.type === 'Ceph'"
        ></el-tab-pane>
        <el-tab-pane :label="$t('common.log')" name="log" v-permission="'LICENSE_BASIC_PAID'"
        ></el-tab-pane>
      </el-tabs>
    </div>

    <div slot="body" class="detail-body" v-if="activeName === 'info'">
      <div class="left">
        <div class="detail-info-left-top-blank"></div>
        <div class="left-header">
          <base-icon name="primary_storage_large"/>
          <div class="after-icon">
            <detail-info-state v-if="model.state" outer-class-name="detail-page-state" :state="model.state"/>
            <detail-info-state v-if="model.status" outer-class-name="detail-page-state" :state="model.status"/>
          </div>

          <detail-name :param="getNameParam()" class="name"/>
          <detail-description :param="getDescriptionParam()" class="description"/>

        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t("common.overview")}}
          </div>
          <detail-row v-if="isImageStoreOrSftp || model.type === 'AliyunEBS'" :param="{
                    title: 'URL',
                    content: model.url
                  }"/>
          <row-input-editor v-if="model.type === 'ImageStoreBackupStorage'" :data="{
                    doc: 'syncImage',
                    getTitle: () => $t('backupStorage.syncImageNetwork'),
                    getValue: () => getSyncImageNetwork(),
                    setValue: value => updateSyncImageNetwork(value)
                  }"/>
          <row-input-editor v-if="isImageStoreOrSftp" :data="{
                    getTitle: () => $t('common.backupStorageIp'),
                    getValue: () => model.hostname,
                    setValue: value => updateBS('hostname', value)
                  }"/>
          <row-input-editor v-if="isImageStoreOrSftp" :data="{
                    getTitle: () => $t('common.username'),
                    getValue: () => model.username,
                    setValue: value => updateBS('username', value)
                  }"/>
          <row-input-editor v-if="isImageStoreOrSftp" :data="{
                    getTitle: () => $t('common.password'),
                    getValue: () => model.password,
                    setValue: value => updateBS('password', value),
                    isPassword: true
                  }"/>
          <row-input-editor v-if="isImageStoreOrSftp" :data="{
                    getTitle: () => $t('common.sshPort'),
                    getValue: () => model.sshPort,
                    setValue: value => updateBS('sshPort', Number(value))
                  }"/>
          <detail-row :param="{
                    title: 'common.type',
                    content: getType(windowData.dataUuid)
                  }"/>
          <detail-row :param="{
                    title: 'common.totalCapacity',
                    content: bytesToSize(model.totalCapacity)
                  }"/>
          <detail-row :param="{
                    title: 'globalConfig.backupStorage_reservedCapacity',
                    content: reservedCapacity
                  }"/>
          <detail-row :param="{
                    title: 'common.availableCapacity',
                    content: bytesToSize(model.availableCapacity)
                  }"/>
          <detail-row :param="{
                    title: 'common.createDate',
                    content: model.createDate && formatDatetime(new Date(model.createDate))
                  }"/>
          <detail-row :param="{
                    title: 'common.lastOpDate',
                    content: model.lastOpDate && formatDatetime(new Date(model.lastOpDate))
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
        <detail-row v-if="model.type === 'Ceph'" :param="{
                title: 'common.poolName',
                content: dbData.backupstorage[windowData.dataUuid].poolName
              }"/>
        <detail-row v-if="model.type === 'Ceph'" :param="{
                title: 'backupStorage.pollallCapacity',
                content: bytesToSize(dbData.backupstorage[windowData.dataUuid].poolAvailableCapacity)
              }"/>
        <detail-row v-if="model.type === 'Ceph'" :param="{
                title: 'backupStorage.poolUsedCapacity',
                content: bytesToSize(dbData.backupstorage[windowData.dataUuid].poolUsedCapacity)
              }"/>
        <detail-row v-if="model.type === 'Ceph'" :param="{
                title: 'backupStorage.poolReplicatedSize',
                content: dbData.backupstorage[windowData.dataUuid].poolReplicatedSize
              }"/>
        <detail-row :param="{
                title: 'common.zone',
                content: model.attachedZoneUuids && dbData.zone[model.attachedZoneUuids[0]] && dbData.zone[model.attachedZoneUuids[0]].name,
                handler: () => { $router.push({name: 'detailZone', params:{uuid: model.attachedZoneUuids[0]}})}
              }"/>
      </div>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'mon'">
      <mon-tab-list
        :param="{conditions: `backup-storage.uuid=${windowData.dataUuid}`, backupStorageUuid: windowData.dataUuid, resourceType: 'BS', refresh: query}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName ==='image'">
      <image-tab-list :param="{backupStorageUuid: windowData.dataUuid}"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'monitor'">
      <backupstorage-monitor :param="windowData.dataUuid"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'monitoralarm'">
      <zwatch-alarm-tab-list-for-resource :param="{ resourceUuid: windowData.dataUuid, type: 'backupStorage' }"/>
    </div>
    <div slot="body" class="detail-body" v-if="activeName === 'trash'">
      <trash-on-backup-storage :param="{ uuid: windowData.dataUuid, refresh: query }"/>
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
  import BackupstorageMonitor from "./component/Monitor";
  import TrashOnBackupStorage from "./component/TrashOnBackupStorage";
  import MonTabList from "src/ecs/mons/MonTabList";
  import ImageTabList from "src/ecs/image/component/ImageTabList";
  import ZwatchAlarmTabListForResource from "src/om/zwatchalarm/TabListForResource";
  import Monitor from "src/storage/backupstorage/component/Monitor";

  export default {
    name: "BackupStorageDetailPage",
    mixins: [WindowBase, Root, Methods],
    components: {
      'backupstorage-monitor': Monitor,
      DetailLongContent,
      DetailInfoState,
      DetailTemplate,
      PageTemplate,
      LogList,
      MonTabList,
      ZwatchAlarmTabListForResource,
      BackupstorageMonitor,
      TrashOnBackupStorage,
      ImageTabList
    },
    created() {
      window.addEventListener('click', this.onWindowClick)

      this.updateWindow({
        currTab: 'info',
        dataUuid: this.$route.params ? this.$route.params.uuid : '',
        methods: {
          query: this.query
        }
      }).then(() => {
        return this.query()
      }).then(() => {
        this.$forceUpdate()
      })
    },
    mounted() {


    },
    computed: {
      isImageStoreOrSftp() {
        let bs = this.model
        return ['ImageStoreBackupStorage', 'SftpBackupStorage'].indexOf(bs.type) > -1
      },
      model: {
        get() {
          let self = this;
          return self.backupStorage;
        },
        set(value) {
          let self = this;
          self.backupStorage = value;
        }
      }
    },
    destroyed: function () {
      window.removeEventListener('click', this.onWindowClick)
    },
    watch: {
      'param.uuid': function (newValue, oldValue) {
        if (_.isEqual(newValue, oldValue)) return
        this.updateWindow({dataUuid: this.param.uuid})
        if (this.windowData.currTab === 'mon') {
          let type = this.dbData.backupstorage[this.windowData.dataUuid].type
          if (type !== 'Ceph' && type !== 'Fusionstor') this.updateWindow({currTab: 'info'})
        }
        this.destroyDialogs()
      },
      'windowData.currTab': function () {
        setTimeout(this.drawChart, 0)
      }
    },
    data() {
      let self = this;
      return {
        activeName: 'info',
        reservedCapacity: '',
        justUpdateResource: false,
        backupStorage: {}
      }
    },
    methods: {
      ...Utils,
      getNameParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.backupstorage[this.windowData.dataUuid]) {
              return this.dbData.backupstorage[self.windowData.dataUuid].name
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('backup-storage', 'updateBackupStorage', 'name', 'backupstorage', value)
          }
        }
      },
      getDescriptionParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.backupstorage[self.windowData.dataUuid]) {
              return this.dbData.backupstorage[self.windowData.dataUuid].description
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('backup-storage', 'updateBackupStorage', 'description', 'backupstorage', value)
          }
        }
      },
      handleTabChange(tab, event) {
        let self = this;
        if (self.activeName === tab.name) return;
        self.activeName = tab.name;
      },
      getSyncImageNetwork: function () {
        return _.get(this.dbData.backupstorageA[this.windowData.dataUuid], 'syncImageNetwork.value') || ''
      },
      updateSyncImageNetwork: function (value) {
        let isJustUpdate = this.isJustUpdate()
        if (isJustUpdate) return
        let currSyncImageNetwork = this.getSyncImageNetwork()
        if (value === currSyncImageNetwork) return
        let self = this
        let event = self.createEvent('backupStorage.action.updateSyncImageNetwork', value)
        let uuid = self.windowData.dataUuid
        let p = Promise.resolve()
        if (!currSyncImageNetwork) {
          p = rpc.create('system-tags', {
            resourceType: 'ImageStoreBackupStorageVO',
            resourceUuid: uuid,
            tag: `sync::network::cidr::${value}`
          }, event)
        } else {
          let tagId = self.dbData.backupstorageA[uuid].syncImageNetwork && self.dbData.backupstorageA[uuid].syncImageNetwork.systemTagUuid
          p = rpc.update('system-tags', tagId, {
            updateSystemTag: {
              tag: `sync::network::cidr::${value}`
            }
          }, event)
        }
        return p.then(resp => {
          self.incEventSuccess(event)
          self.query()
        }, () => {
          self.incEventFail(event)
        })
      },
      query: function () {
        let uuid = this.windowData.dataUuid
        return rpc.query(`backup-storage/${uuid}`).then(resp => {
          return rpc.query(`system-tags`, {q: `resourceUuid=${uuid}`})
            .then(resp => {
              let tags = resp.inventories
              if (tags.length === 0) return
              let syncImageNetwork = {}
              tags.forEach(item => {
                if (item.tag.indexOf('sync::network::cidr') > -1) {
                  syncImageNetwork = {
                    systemTagUuid: item.uuid,
                    value: item.tag.split('::')[3]
                  }
                }
              })
              return this.updateDbRow({
                tableName: 'backupstorageA',
                id: uuid,
                data: {
                  syncImageNetwork: syncImageNetwork
                }
              })
            }).then(() => {

              return this.updateDbRow({
                tableName: 'backupstorage',
                id: uuid,
                data: resp.inventories[0]
              }).then(() => {
                this.backupStorage = _.get(this.dbData.backupstorage, [this.windowData.dataUuid]);
              })

            })
        }).then(() => {
          return rpc.query('global-configurations', {q: ['category=backupStorage', 'name=reservedCapacity']}).then(resp => {
            this.reservedCapacity = resp.inventories[0].value
          })
        })
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({showMoreDropdown: !this.windowData.showMoreDropdown})
        $event.stopPropagation()
      },
      inStates: function () {
        let stateList = []
        for (let i = 0; i < arguments.length; i++) {
          stateList.push(arguments[i])
        }
        return !stateList.every(item => item !== this.backupStorage.state)

        return false;
      },
      isJustUpdate() {
        let self = this
        if (self.justUpdateResource) return true
        self.justUpdateResource = true
        setTimeout(() => {
          self.justUpdateResource = false
        }, 100)
        return false
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({showMoreDropdown: false})
      },
      updateBS: function (propName, value) {
        let self = this
        let uuid = this.windowData.dataUuid
        if (propName === 'password' && value.trim() === '') return

        let isJustUpdate = self.isJustUpdate()
        if (isJustUpdate) return
        if (self.dbData.backupstorage[uuid][propName] === value) return
        let type = self.dbData.backupstorage[uuid].type
        let obj = {}
        obj[`update${type}`] = {}
        obj[`update${type}`][propName] = value
        let event = self.createEvent(`common.updateInfo${propName}`, value)
        let path = {
          'ImageStoreBackupStorage': 'image-store',
          'SftpBackupStorage': 'sftp'
        }
        return rpc.update(`backup-storage/${path[type]}`, `${uuid}`, obj, event).then(() => {
          self.incEventSuccess(event)
          return self.detailReconnect(uuid, self)
        }, () => {
          self.incEventFail(event)
        })

      },
      reclaimSpaceFromImageStore(imageStorageUuid) {
        let self = this
        let uuid = [imageStorageUuid]
        self.openDialog('ConfirmDlg', {
          title: 'backupStorage.clear',
          description: 'backupStorage.clearBS',
          warning: 'backupStorage.clearWarning',
          uuidList: uuid,
          icon: 'primary_storage_popupico',
          ok: () => {
            self.clear(uuid).then(({residualSize, releaseSize, imageStoreList}) => {
              self.openDialog('ClearBsMessageDlg', {
                imageStoreList,
                releaseSize,
                residualSize,
                ok: () => {
                  if (self.query) {
                    self.query().then(() => self.$forceUpdate())
                  }
                }
              })
            })
          },
          getName: (uuid) => {
            return self.dbData.backupstorage[uuid].name;
          }
        })
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
