<template>
  <detail-template>
    <div class="detail-header" slot="header">
      <span class="detail-title">镜像详情</span>
       <span @click="$router.push({name: 'image'})" class="create-back detail-header-item"><i
         class="el-icon-back"></i>
         <span style="font-size: 12px">回到镜像列表</span>
      </span>
      <span class="detail-header-item">
        <drop-down class="detail-dropdown">
          <span slot="title">
           <span class="text">{{$t('common.moreActions')}}</span>
          </span>
          <span slot="content">
           <div class="dropdown-content">
               <a v-permission="'IMAGE_STATE.CHANGE'" style="padding-top: 12px;" @click="canEnabled && pageStart()" :class="{ 'disabled-text':!canEnabled }" v-if="(model && model.status!=='Deleted') && imageState !== 'exported'">{{$t("common.enable")}}</a>
               <a v-permission="'IMAGE_STATE.CHANGE'"
                  @click="model.state !== 'Disabled' && model.status !== 'Deleted' && pageStop()"
                  :class="{ 'disabled-text': (model.state === 'Disabled' || model.status === 'Deleted') }"
                  v-if="model && model.status!='Deleted' &&  imageState !== 'exported'">{{$t("common.disable")}}</a>
               <a v-permission="'BS.EXPORT_IMAGE'"
                  @click="canExport() && exportImage()"
                  :class="{'disabled-text': !canExport()}"
                  v-if="(model && model.status!=='Deleted') && imageState !== 'exported'"
                  >{{$t("common.export")}}</a>
               <a v-permission="'LICENSE_BASIC_PAID'"
                  @click="model.status !== 'Deleted' && !model.toPublic && pageShareImageToAll()"
                  :class="{ 'disabled-text': model.status === 'Deleted' || model.toPublic}"
                  v-if="dbData.common.isAdmin && model.status!='Deleted' && imageState !== 'exported'"
                  >{{$t("common.shareToAll")}}</a>
               <a v-permission="'LICENSE_BASIC_PAID'"
                  @click="model.status !== 'Deleted' && model.toPublic && pageRecallImageFromAll()"
                  :class="{ 'disabled-text': model.status === 'Deleted' || !model.toPublic}"
                  v-if="dbData.common.isAdmin && model.status!='Deleted' && imageState !== 'exported'"
                  >{{$t("common.recallFromAll")}}</a>
               <a v-permission="'LICENSE_BASIC_PAID'"
                  @click="model.status !== 'Deleted' && detailChangeResouceOwner()"
                  :class="{ 'disabled-text': model.status === 'Deleted'}"
                  v-if="dbData.common.isAdmin && model.status!=='Deleted' && imageState !== 'exported'"
                  >{{$t("common.changeResourceOwner")}}</a>
               <a id="common-download" style="padding-top:12px;"
                  @click="pageDownload"
                  v-if="imageState === 'exported' && model.exportUrl">{{$t("common.download")}}</a>
               <a @click="pageCopyUrl" v-if="model.exportUrl">
                  {{$t("common.copyUrl")}}
                 <div class="urlText" ref="valueElm" :title="model.exportUrl">
                  {{ model.exportUrl }}
                 </div>
               </a>
               <a v-if="model.status!='Deleted' && imageState !== 'exported'" v-permission="'LICENSE_BASIC_PAID'" @click="canMigrate(dataUuid) && pageStorageMigrateImage()" :class="{ 'disabled-text': !canMigrate(dataUuid)}">
                {{$t("common.storageMigrate")}}
                <help-trigger name="imageStorageMigrate" :style="{ position: 'relative', top: '0', display: 'inline-block', verticalAlign: 'middle', left: '5px' }" />
               </a>
               <a id="common-syncImage" v-permission="'LICENSE_BASIC_PAID'"  v-if="model.status!='Deleted' && imageState !== 'exported'" @click="canSyncImage() && pageSyncImage()" :class="{ 'disabled-text': !canSyncImage()}">
                 {{$t("image.syncImage")}}
                 <help-trigger name="synchronousMirroring" :style="{ position: 'relative', top: '0', display: 'inline-block', verticalAlign: 'middle', left: '5px' }" />
               </a>
               <a style="padding-bottom:12px;" v-permission="'IMAGE.DELETE'" @click="!(model.status === 'Deleted') && canDelete(dataUuid) && deleteImage()" :class="{'disabled-text':!canDelete(dataUuid)}" v-if="model.status !== 'Deleted' && imageState !== 'exported'">{{$t("common.destroy")}}</a>
               <a style="padding-bottom:12px;" v-permission="'IMAGE.DELETE'" @click="pagedeleteExportImage()" v-if="imageState === 'exported' && model.exportUrl">{{$t("common.destroy")}}</a>
               <a style="padding-top:12px;" v-permission="'IMAGE.RECOVER'" @click="model.status === 'Deleted' && recoverImage()" :class="{ 'disabled-text': model.status !== 'Deleted'}" v-if="model.status === 'Deleted'">{{$t("common.recover")}}</a>
               <a style="padding-bottom:12px;" v-permission="'IMAGE.EXPUNGE'" @click="model.status === 'Deleted' && expunge(dataUuid)" v-if="model.status === 'Deleted'">{{$t("common.expunge")}}</a>
           </div>
          </span>
        </drop-down>
      </span>
      <span class="detail-tab">
        <el-tabs @tab-click="handleTabChange" tab-position="bottom"
                 v-model="activeName">
         <el-tab-pane :label="$t('common.basicAttributes')" name="info"></el-tab-pane>
         <el-tab-pane :label="$t('common.share')" name="share"
                      v-if="model.status!=='Deleted' && dbData.common.isAdmin && imageState !== 'exported'"></el-tab-pane>
         <el-tab-pane :label="$t('common.log')" name="log"
                      v-if="windowData.hasPermission && imageState !== 'exported'"></el-tab-pane>
        </el-tabs>
      </span>
    </div>
    <div slot="body"  class="detail-body" v-if="activeName === 'info'">
        <div class="left">
          <div class="left-header">
            <base-icon name="image_large"/>
            <div class="after-icon">
              <detail-info-state outer-class-name="detail-page-state" v-if="model && model.state" :state="model && model.state"></detail-info-state>
              <detail-info-state outer-class-name="detail-page-state" v-if="model && model.status" :state="model && model.status"></detail-info-state>
            </div>
            <detail-name class="name" :param="getNameParam()"></detail-name>
            <detail-description class="description" :param="getDescription()"></detail-description>
          </div>
          <div class="left-body">
            <div class="detail-block-header">
              {{$t("common.overview")}}
            </div>
            <detail-row :param="{
              title:'common.size',
              content: bytesToSize(model.size)
            }"/>
            <div class="detail-row editable">
              <div class="detail-title">
                {{ $t("common.actualSize") }}{{$t("common.colon")}}
              </div>
              <div class="detail-container">
                <span class="detail-content">{{model && bytesToSize(model.actualSize) }}</span>
                <span class="edit-icon" v-show="model && model.status !== 'Deleted'">
                  <i @click="refreshActualSize()" class="el-icon-refresh"></i>
                </span>
              </div>
            </div>
            <detail-row
              v-if="dbData.common.isAdmin && imageState !== 'exported'"
              :param="{
              title: 'common.shareToAll',
              content: $t(`common.${model.toPublic}`)
            }"/>
            <detail-row
             :param="{
              title: 'image.imageType',
              content: $t(`image.${model && model.mediaType === 'DataVolumeTemplate' ? 'volumeImage' : 'systemImage'}`)
             }"
            />
            <detail-dropdown :param="{
                  getTitle: () => $t('image.format'),
                  getOptionList: () => imageTypeList,
                  getIndex: () => imageTypeList.findIndex((num) =>{
                      return model && num === model.format
                    }
                  ),
                  setIndex: index => { setImageFormat(model.uuid, imageTypeList[index]) },
                }"/>
            <detail-dropdown :param="{
                  getTitle: () => $t('vm.bootMode'),
                  getOptionList: () => BIOSList,
                  getIndex: () =>BIOSList.findIndex((num) =>{
                      return model && num === getBootMode();
                    }
                  ),
                  setIndex: index => { setImageBootMode(BIOSList[index]) },
                }"/>
            <detail-switch
              :param="{
                  getTitle: () => 'QGA',
                  getLeftText: () => $t('common.qemugaOff'),
                  getRightText: () => $t('common.qemugaOn'),
                  getValue: () => windowData.QGA,
                  setValue: val => { windowData.hasPermission && setQGA() },
                  permission: ['VM.SET_RDP', 'LICENSE_BASIC_PAID'],
                  disabled:!windowData.hasPermission
                }"/>
            <detail-dropdown v-if="model && model.mediaType === 'RootVolumeTemplate'"
              :param="{
                getTitle: () => $t('common.platform'),
                  getOptionList: () => platformList,
                  getIndex: () =>platformList.findIndex((num) =>{
                      return model && num === model.platform;
                    }
                  ),
                  setIndex: index => { updateImage('platform',platformList[index]) },
              }"
            />
            <detail-row
              :param="{
                title: 'common.owner',
                content: getResourceOwner(dataUuid),
                handler: () => {
                  $router.push({name: 'detailAccount', params: {uuid: model.ownerUuid}});
                }
              }"
            />
            <detail-row
              :param="{
                title: 'common.createDate',
                content: model.createDate && formatDatetime(new Date(model.createDate))
              }"
            />
            <detail-row
             :param="{
               title:'common.lastOpDate',
               content: model.lastOpDate && formatDatetime(new Date(model.lastOpDate))
             }"
            />
          </div>
        </div>
        <div class="right">
          <div style="height: 40px"></div>
          <div id="common-moreInformation" class="detail-block-header">
            {{$t("common.moreInformation")}}
          </div>
          <detail-row
            :param="{
              title: 'common.uuid',
              copy: true,
              content: model.uuid
            }"
          />
          <detail-row v-if="windowData.isFromCephPs"
            :param="{
              title: 'image.imageSource',
              copy: true,
              content: 'Ceph'
            }"
          />
          <detail-row v-if="imageState !== 'exported'"
            :param = "{
              title: 'common.url',
              copy: true,
              content: model.url
            }"
          />
          <detail-row v-if="imageState !== 'exported'"
            :param="{
              title:'common.imageInstallPath',
              copy: true,
              content: model.backupStorageRefs && model.backupStorageRefs[0] && model.backupStorageRefs[0].installPath
            }"
          />
          <detail-row v-if="imageState !== 'exported'"
            :param="{
              title: 'common.backupStorage',
              content: model.backupStorageRefs
              && dbData.backupstorage[model.backupStorageRefs[0].backupStorageUuid]
              && dbData.backupstorage[dbData.image[dataUuid].backupStorageRefs[0].backupStorageUuid].name,
              handler: () => {
                 $router.push({name: 'detailbackupstorage', params: {uuid: model.backupStorageRefs[0].backupStorageUuid}});
              }
            }"
          />
          <detail-row v-if="model.exportUrl" v-show="imageState !== 'exported'"
            :param="{
              title: 'common.ExportedImage',
              content: model.name,
              handler: () => {

              }
            }"
          />
          <detail-row v-if="model.exportUrl"
            :param = "{
              title: 'common.ExportedImageURL',
              content: model.exportUrl
            }"
          />
       </div>
      </div>
      <div v-if="activeName === 'share'" slot="body" class="detail-body">
        <share-tab-list :param="{conditions: `resourceUuid=${dataUuid}`, uuid: dataUuid, tableName: 'image'}"/>
      </div>
      <div v-if="activeName === 'log'"  slot="body" class="detail-body">
        <log-list :param="{ uuid: dataUuid }" />
      </div>
    <div class="detail-footer" slot="footer"></div>
  </detail-template>
</template>

<script>
    import DetailTemplate from "../../../component/DetailTemplate";
    import {changeResourceOwnerDlg} from 'src/utils/changeResourceOwner';
    import WindowBase from '../../../windows/Window';
    import ImageMethods from '../Methods';
    import Utils from '../../../utils/utils';
    import rpc from '../../../utils/rpc';
    import DetailInfoState from "../../../component/DetailInfoState";
    import LogList from "../../../component/LogList";
    import ShareTabList from "../component/ShareTabList";
    export default {
      name: "ImageDetailPage",
      mixins: [WindowBase, ImageMethods],
      components: {ShareTabList, LogList, DetailInfoState, DetailTemplate},
      data(){
          return {
            activeName: 'info',
            dataUuid: '',
            imageState: '',
            model: {},
            imageTypeList: [
              'qcow2',
              'iso',
              'raw'
            ],
            BIOSList: [
              'Legacy',
              'UEFI',
            ],
            platformList: [
              'Linux',
              'Windows',
              'WindowsVirtio',
              'Other',
              'Paravirtualization',
            ]
          }
      },
      computed: {
        value:{
          get(){

          },
          set(val){
            let self = this;
            self.model = val[self.$route.params.uuid];
          },
          deep: true
        },
        //是否可以启用
        canEnabled(){
          let self = this;
          return self.model.state!=='Enabled'
        },
      },
      created(){
        let self = this;
        self.dataUuid = self.$route.params.uuid ? self.$route.params.uuid : '';
        // this.getProjectAdmin = IAM2ProjectMethods.methods.getProjectAdmin.bind(this)
        this.changeResourceOwnerDlg = changeResourceOwnerDlg.bind(this)
        let currentAccountUuid = window.localStorage.getItem('accountUuid')
        self.imageState = self.$route.params.currTab ? self.$route.params.currTab : '';
        this.updateWindow({
          QGA: false,
          currentAccountUuid,
          isFromCephPs: false,
          isNotSetUEFI: false,
          methods: {
            query: this.query
          }
        })
          .then(() => {
            return this.query()
          }).then(() => {
          return this.isImageStoreInZone()
        }).then(() => {
          return this.isCephImage()
        }).then(() => {
          return this.isNotSetUEFI()
        }).then(() => {
          this.$forceUpdate()
        })
      },
      methods: {
        ...Utils,
        query: function () {
          let imageInventories, self = this;
          return rpc.query(`images/${self.dataUuid}`)
            .then((resp) => {
              imageInventories = resp.inventories[0]
              if (self.dbData.common.isAdmin) {
                return rpc.query('accounts/resources/refs', {
                  q: `resourceUuid=${resp.inventories[0].uuid}`
                })
              } else {
                return new Promise((resolve, reject) => { resolve() })
              }
            })
            .then((resp) => {
              if (self.dbData.common.isAdmin) {
                imageInventories.accountUuid = resp.inventories[0].accountUuid
                return rpc.query('accounts', {
                  q: `uuid=${resp.inventories[0].accountUuid}`
                })
              } else {
                return new Promise((resolve, reject) => { resolve() })
              }
            })
            .then((resp) => {
              if (self.dbData.common.isAdmin && resp.inventories.length > 0) {
                return self.updateDbRow({
                  tableName: 'account',
                  id: resp.inventories[0].uuid,
                  data: resp.inventories[0]
                })
              } else {
                return self.getResourceAccount()
                // return new Promise((resolve, reject) => { resolve() })
              }
            })
            .then(() => {
              let uuid = imageInventories.uuid
              let bootMode = {}
              return rpc.query(`system-tags`, {q: `resourceUuid=${uuid}`})
                .then(resp => {
                  let mode = resp.inventories.find((item) => item.tag.indexOf('bootMode') > -1)
                  // console.log('mode', mode)
                  if (mode) {
                    bootMode = {
                      systemTagUuid: mode.uuid,
                      value: mode.tag.split('::')[1]
                    }
                  }
                  return self.updateDbRow({
                    tableName: 'imageA',
                    id: uuid,
                    data: {
                      bootMode: bootMode
                    }
                  })
                })
            })
            .then(() => {
              if (self.dbData.common.isAdmin) {
                return rpc.query('backup-storage', {fields: 'type', q: [`image.uuid=${self.dataUuid}`]}).then((resp) => {
                  let canMigrate = resp.inventories[0].type === 'Ceph'
                  return self.updateDbRow({
                    tableName: 'imageMigrate',
                    id: self.dataUuid,
                    data: {
                      canMigrate: canMigrate
                    }
                  })
                })
              } else {
                return self.updateDbRow({
                  tableName: 'imageMigrate',
                  id: self.dataUuid,
                  data: {
                    canMigrate: false
                  }
                })
              }
            })
            .then(() => {
              if (self.dbData.common.isAdmin) {
                return rpc.query('backup-storage', {
                  q: `uuid=${imageInventories.backupStorageRefs[0].backupStorageUuid}`
                })
                  .then((resp) => {
                    return self.updateDbRow({
                      tableName: 'backupstorage',
                      id: resp.inventories[0].uuid,
                      data: resp.inventories[0]
                    })
                  })
              } else {
                return new Promise((resolve, reject) => { resolve() })
              }
            })
            .then(() => {
              if (!self.dbData.common.isOpensource) {
                return rpc.query(`images/${self.dataUuid}/qga`)
                  .then((resp) => {
                    return self.updateWindow({ QGA: resp.enable })
                  })
              } else {
                return new Promise((resolve, reject) => { resolve() })
              }
            })
            .then(() => {
              if (self.dbData.common.isAdmin) {
                return self.isShareToAll(imageInventories.uuid)
                  .then((resp) => {
                    imageInventories.toPublic = resp
                    return new Promise((resolve, reject) => { resolve() })
                  })
              } else {
                return new Promise((resolve, reject) => { resolve() })
              }
            })
            .then((resp) => {
              rpc.getResourceAccount([imageInventories.uuid], self)
              this.hasPermission()
              return self.updateDbRow({
                tableName: 'image',
                id: imageInventories.uuid,
                data: imageInventories
              }).then(() =>{
                return self.value = self.dbData.image;
              })
            })
        },
        //判断是否是ceph镜像
        isCephImage () {
          let imageUuid = this.dataUuid
          return rpc.query(`system-tags`, {q: `resourceUuid=${imageUuid}`}).then(resp => {
            let imageTag = resp.inventories[0]
            if (imageTag && imageTag.tag && imageTag.tag.indexOf('Ceph') > -1) {
              return this.updateWindow({isFromCephPs: true})
            } else {
              return this.updateWindow({isFromCephPs: false})
            }
          })
        },
        //是否有权限
        hasPermission() {
          let self = this;
          let hasPermission = self.dbData.common.isAdmin || self.dbData.account[self.dataUuid] && (self.dbData.account[self.dataUuid].uuid === this.currentAccountUuid)
          this.updateWindow({ hasPermission })
        },
        handleTabChange(){

        },
        //判断是否可以导出镜像
        canExport() {
          let self = this;
          let uuid = self.model && self.model.uuid;
          let image = self.dbData.image[uuid]
          if (!image) return false
          let backupStorage = image.backupStorageRefs && self.dbData.backupstorage[image.backupStorageRefs[0].backupStorageUuid]
          return backupStorage && backupStorage.type === 'ImageStoreBackupStorage' && image.status === 'Ready' && !image.exportUrl
        },
        //导出镜像
        exportImage(){
          let event = this.createEvent('image.action.export', self.model.name)
          let self = this
          let selectedUuidList = [self.model.uuid];
          rpc.put(`backup-storage/${this.dbData.image[selectedUuidList[0]].backupStorageRefs[0].backupStorageUuid}/actions`, {
            exportImageFromBackupStorage: {
              imageUuid: selectedUuidList[0]
            }
          }, event)
            .then((resp) => {
              let image = _.cloneDeep(this.dbData.image[selectedUuidList[0]])
              image.exportUrl = resp.imageUrl
              self.incEventSuccess(event)
              this.updateDbRow({
                tableName: 'image',
                id: selectedUuidList[0],
                data: image
              })
            }, () => {
              self.incEventFail(event)
            })
        },
        //下载镜像
        pageDownload() {
          this.download([this.dataUuid])
        },
        //全局共享
        pageShareImageToAll(){
          let uuidList = [], self = this;
          uuidList = [self.model.uuid];
          if (uuidList.length > 0) {
            this.openDialog('SharetoAllConfirmDlg', {
              title: 'common.shareToAll',
              warning: 'instanceOffering.shareToAllText',
              ok: () => {
                this.shareToAll(uuidList)
                  .then(() => {
                    self.query();
                  })
              }
            })
          }
        },
        //全局召回
        pageRecallImageFromAll(){
          let uuidList = [], self = this;
          uuidList = [self.model.uuid];
          if (uuidList.length > 0) {
            this.openDialog('SharetoAllConfirmDlg', {
              title: 'common.recallFromAll',
              warning: 'account.recall',
              ok: () => {
                self.recallFromAll(uuidList)
                  .then(() => {
                    self.query();
                  })
              }
            })
          }
        },
        //改变所有者
        detailChangeResouceOwner: async function () {
          const self = this
          self.changeResourceOwnerDlg(self.dataUuid, self.changeResourceToAccountOrProject, self.query);
        },
        hasSharedToAll(){

        },
        //存储迁移
        pageStorageMigrateImage: function () {
          let imageUuid = this.dataUuid, self = this;
          let srcBackupStorageUuid = self.model.backupStorageRefs[0].backupStorageUuid
          rpc.query(`backup-storage/${srcBackupStorageUuid}/migration-candidates`)
            .then((resp) => {
              let backupStorageUuidList = resp.inventories.map((item) => item.uuid)
              self.openDialog('BackupStorageSelectListConfirmDlg', {
                action: 'storageMigrate',
                conditions: [`uuid?=${backupStorageUuidList}`, '__systemTag__!=remote'],
                ok: (backupStorageUuid) => self.storageMigrateImage(backupStorageUuid, imageUuid, srcBackupStorageUuid).then(() => self.query())
              })
            }, () => {
              self.openDialog('BackupStorageSelectListConfirmDlg', {
                conditions: `uuid?=[]`,
                action: 'storageMigrate',
                ok: (backupStorageUuid) => self.storageMigrateImage(backupStorageUuid, imageUuid, srcBackupStorageUuid)
              })
            })
        },
        pageDelete(){

        },
        //启用
        pageStart(){
          let self = this;
          self.start([self.dataUuid])
            .then(() => {
              self.query();
            })
        },
        pageStop(){
          let self = this;
          this.stop([self.dataUuid])
            .then(() => {
              self.query();
          })
        },
        //复制url
        pageCopyUrl() {
          if (typeof InstallTrigger !== 'undefined') { // firefox
            var range = document.createRange()
            range.selectNode(this.$refs.valueElm)
            window.getSelection().addRange(range)
            document.execCommand('copy')
            window.getSelection().removeAllRanges()
          } else {
            this.$nextTick(() => {
              var range = document.createRange()
              range.selectNode(this.$refs.valueElm)
              window.getSelection().removeAllRanges()
              this.$nextTick(() => {
                // var range = document.createRange()
                range.selectNode(this.$refs.valueElm)
                window.getSelection().addRange(range)
                document.execCommand('copy')
                window.getSelection().removeAllRanges()
              })
            })
          }
        },
        //是否可以同步镜像
        canSyncImage () {
          let imageUuid = this.dataUuid
          let backupStorage = this.dbData.backupstorage
          let imageTable = this.dbData.image
          let backupStorageUuid = _.get(imageTable, `${imageUuid}.backupStorageRefs[0].backupStorageUuid`)
          let hasNotImageStore = backupStorage[backupStorageUuid] && backupStorage[backupStorageUuid].type !== 'ImageStoreBackupStorage'
          if (hasNotImageStore) return false
          return true
        },
        //同步镜像
        pageSyncImage () {
          let imageUuid = this.dataUuid
          let srcBackupStorageUuid = _.get(this.dbData.image, `${imageUuid}.backupStorageRefs[0].backupStorageUuid`)
          let name = _.get(this.dbData.image, `${imageUuid}.name`)
          let description = _.get(this.dbData.image, `${imageUuid}.description`)
          this.openDialog('BackupStorageForSyncImageSelectListConfirmDlg', {
            conditions: [`uuid!=${srcBackupStorageUuid}`, 'type=ImageStoreBackupStorage', '__systemTag__!?=remote,onlybackup,aliyun,remotebackup'],
            action: 'storageMigrate',
            ok: (backupStorageUuid) => {
              let param = {
                name: name,
                description: description,
                srcBackupStorageUuid,
                dstBackupStorageUuid: backupStorageUuid
              }
              let obj = {
                imageUuid,
                param
              }
              return this.syncImageToBackupStoragesInSameMn([obj]).then(() => this.refresh())
            }
          })
        },
        //删除镜像
        deleteImage() {
          let uuidList = []
          const self = this
          uuidList = [self.model.uuid];
          if (uuidList.length > 0) {
            return self.openDialog('ConfirmDlg', {
              title: 'image.deleteImage',
              description: 'image.info.deleteConfirm',
              getName: (uuid) => {
                return self.dbData.image[uuid].name;
              },
              icon: 'image_popupico',
              uuidList,
              ok: () => {
                return self.delete(uuidList).then(() => {
                  self.$router.push({name: 'image'});
                })
              }
            })
          }
        },
        //删除导出镜像
        pagedeleteExportImage () {
          let self = this
          let uuidList = [this.dataUuid]
          if (uuidList.length > 0) {
            return self.openDialog('ConfirmDlg', {
              title: 'image.deleteImage',
              description: 'image.info.deleteConfirm',
              getName: (uuid) => {
                return self.dbData.image[uuid].name;
              },
              icon: 'image_popupico',
              uuidList,
              ok: () => {
                return  self.deleteExportImage(uuidList).then(() => {
                  self.$router.push({name: 'image'});
                })
              }
            })
          }
        },
        //恢复镜像
        recoverImage () {
          let event = this.createEvent('image.action.recover', this.dbData.image[this.dataUuid].name)
          let self = this
          rpc.update('images', [self.dataUuid], {
            'recoverImage': {
              'backupStorageUuids': [
                self.dbData.image[self.dataUuid].backupStorageRefs[0].backupStorageUuid
              ]
            }
          }, event)
            .then(() => {
              self.incEventSuccess(event)
              self.query();
            }, () => {
              self.incEventFail(event)
            })
        },
        //彻底删除镜像
        expunge(uuid) {
          let event = this.createEvent('image.action.expunge', this.dbData.image[this.dataUuid].name)
          const self = this
          rpc.update('images', uuid, {
            'expungeImage': {
              'backupStorageUuids': [`${self.dbData.image[uuid].backupStorageRefs[0].backupStorageUuid}`]
            }
          }, event)
            .then((resp) => {
              self.incEventSuccess(event);
              self.$router.push({name: 'image'});
            }, () => {
              self.incEventFail(event)
            })
        },
        //获得名称
        getNameParam() {
          return {
            getValue: () => {
              let self = this;
              if (this.model) {
                return this.model.name
              } else {
                return ''
              }
            },
            canEdit: () => {
              return true
            },
            getPermission: () => {
              return 'IMAGE.UPDATE'
            },
            setValue: (value) => {
              this.updateImage('name', value)
            }
          }
        },
        //获得描述
        getDescription(){
          return {
            getValue: () => {
              let self = this;
              if (this.model) {
                return this.model.description
              } else {
                return ''
              }
            },
            canEdit: () => {
              return true
            },
            getPermission: () => {
              return 'IMAGE.UPDATE'
            },
            setValue: (value) => {
              this.updateImage('description', value)
            }
          }
        },
        //更新镜像信息
        updateImage(key, newValue){
            let oldValue = String(this.model[key]);
            if (oldValue === String(newValue)) return;
            if (key === 'name' && !String(newValue).trim()) return;
            let param = {};
            param[key] = newValue;
            let event = this.createEvent('common.updateInfo' + key, newValue);
            this.dispatchActionWithEvent('image/update', {
              uuid: this.model.uuid,
              param
            }, undefined, event)
        },
        //刷新真实容量
        refreshActualSize() {
          let self = this;
          let event = this.createEvent('image.action.refreshActualSize', self.model.name)
          rpc.update(`images`, this.dataUuid, {
            syncImageSize: {}
          }, event)
            .then((resp) => {
              this.incEventSuccess(event)
              this.updateDbRow({
                tableName: 'image',
                id: resp.uuid,
                data: resp.inventory
              })
            }, () => {
              this.incEventFail(event)
            })
        },
        //是指镜像格式
        setImageFormat(uuid, format){
          if (format === 'iso') {
            let self = this
            let event = self.createEvent('common.updateInfoformat', format)
            rpc.update('images', self.windowData.dataUuid, {
              updateImage: {
                mediaType: 'ISO',
                format
              }
            }, event)
              .then((resp) => {
                self.incEventSuccess(event)
                return this.updateDbRow({
                  tableName: 'image',
                  id: self.dataUuid,
                  data: resp.inventory
                })
              }, () => self.incEventFail(event))
          } else if (this.model.format === 'iso') {
            let self = this
            let event = self.createEvent('common.updateInfoformat', format)
            rpc.update('images', self.dataUuid, {
              updateImage: {
                mediaType: 'RootVolumeTemplate',
                format
              }
            }, event)
              .then((resp) => {
                self.incEventSuccess(event)
                return this.updateDbRow({
                  tableName: 'image',
                  id: self.dataUuid,
                  data: resp.inventory
                })
              }, () => self.incEventFail(event))
          } else {
            this.updateImage('format', format)
          }
        },
        //得到默认BISO模式
        getBootMode() {
          let uuid = this.dataUuid
          if (!this.dbData.imageA[uuid]) return ''
          let mode = _.get(this.dbData.imageA, [`${uuid}`, 'bootMode', 'value'])
          return mode || 'Legacy'
        },
        //设置BISO模式
        setImageBootMode(value){
          if (this.getBootMode() === value || (!this.getBootMode() && value === 'Legacy')) return
          let self = this
          let uuid = self.dataUuid
          // let currBootMode = this.getBootMode()
          rpc.query(`system-tags`, {q: [`resourceUuid=${uuid}`, 'resourceType=ImageVO', 'tag~=bootMode::%25']})
            .then(resp => {
              let event = self.createEvent('vm.action.updateBootMode', value)
              let p = Promise.resolve()
              if (resp.inventories.length > 0) {
                p = rpc.update('system-tags', resp.inventories[0].uuid, {
                  updateSystemTag: {
                    tag: `bootMode::${value}`
                  }
                }, event)
              } else {
                p = rpc.create('system-tags', {
                  resourceType: 'ImageVO',
                  resourceUuid: uuid,
                  tag: `bootMode::${value}`
                }, event)
              }
              return p.then(resp => {
                self.incEventSuccess(event)
                self.query()
              }, () => {
                self.incEventFail(event)
              })
            })
        },
        //设置setQGA
        setQGA () {
          let event = this.createEvent(`${this.windowData.QGA ? 'image.action.closeQGA' : 'image.action.openQGA'}`, this.dbData.image[this.dataUuid].name)
          rpc.put(`images/${this.dataUuid}/actions`, {
            setImageQga: {
              enable: !this.windowData.QGA
            }
          }, event)
            .then((resp) => {
              this.incEventSuccess(event)
              this.togglePermission()
            }, () => {
              this.incEventFail(event)
            })
        },
        togglePermission: function () {
          if (this.windowData.QGA) {
            this.switchOffPermission()
          } else {
            this.switchOnPermission()
          }
        },
        switchOnPermission: function () {
          if (this.windowData.QGA) return
          this.updateWindow({ QGA: true })
        },
        switchOffPermission: function () {
          if (!this.windowData.QGA) return
          this.updateWindow({ QGA: false })
        },
        //设置镜像平台
        setImagePlatform(){

        },
        getResourceAccount: function () {
          let self = this
          return rpc.query(`resources/accounts`, {
            resourceUuids: [self.dataUuid]
          }).then((resp) => {
            return self.updateDbRow({
              tableName: 'account',
              id: self.dataUuid,
              data: resp.inventories[self.dataUuid]
            })
          })
        },
      }
    }
</script>

<style scoped>
  .icon {
    position: absolute;
    display: inline-block;
    /*left: -2px;*/
    width: 62px;
    height: 60px;
    background-repeat: no-repeat;
  }
  .urlText{
    width: 1px;
    height: 1px;
    position: absolute;
    font-size: 0px;
  }
</style>
