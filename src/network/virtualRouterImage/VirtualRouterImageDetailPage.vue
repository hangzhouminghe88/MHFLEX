<template>
  <detail-template>
    <div class="detail-header" slot="header">
            <span @click="$router.push({name:'virtualrouterimage'})" class="create-back detail-header-item">
                <i class="el-icon-back"></i>
              回到云路由镜像列表
            </span>
      <span class="detail-header-item">
                <drop-down class="detail-dropdown">
                    <span slot="title">
                        <span class="text">{{$t('virtualRouterImage.actions')}}</span>
                    </span>
                    <span slot="content">
                      <div class="dropdown-content">
                        <a id="common-enable" v-permission="'IMAGE_STATE.CHANGE'" style="padding-top: 12px;"
                           @click="model && model.state !== 'Enabled' && enableImage()"
                           :class="{ 'disabled-text': model && model.state === 'Enabled' }"
                           v-if="windowData.imageState === 'available'">{{ $t("common.enable") }}</a>
                        <a id="common-disable" v-permission="'IMAGE_STATE.CHANGE'"
                           @click="model.state && model.state !== 'Disabled' && model.status !== 'Deleted' && disableImage()"
                           :class="{ 'disabled-text': model && (model.state === 'Disabled' || dbData.image[windowData.dataUuid].status === 'Deleted') }"
                           v-if="windowData.imageState === 'available'">{{ $t("common.disable") }}</a>
                        <a id="common-export" @click="canExported(windowData.dataUuid) && exportImage()"
                           v-if="model && dbData.backupstorage[model.backupStorageRefs[0].backupStorageUuid] && dbData.backupstorage[model.backupStorageRefs[0].backupStorageUuid].type === 'ImageStoreBackupStorage' && model.status !== 'Deleted' && windowData.imageState === 'available'"
                           :class="{ 'disabled-text': !canExported(this.windowData.dataUuid) }">{{$t("common.export")}}</a>
                        <a id="common-download" style="padding-top:12px;" @click="pageDownload()"
                           v-if="windowData.imageState === 'exported'">{{$t("common.download")}}</a>
                        <a id="common-copyUrl" @click="pageCopyUrl()" v-if="windowData.imageState === 'exported'">
                          {{$t("common.copyUrl")}}
                          <div class="urlText" ref="valueElm" :title="dbData.image[windowData.dataUuid].exportUrl">
                            {{ dbData.image[windowData.dataUuid].exportUrl }}
                          </div>
                        </a>
                        <a id="common-recover" style="padding-top:12px;" v-permission="'IMAGE.RECOVER'"
                           :class="{ 'disabled-text': model && model.status !== 'Deleted'}"
                           v-if="windowData.imageState === 'destroyed'"
                           @click=" model && model.status === 'Deleted' && recoverImage()">{{$t("common.recover")}}</a>
                        <a id="common-destroy" style="padding-bottom:12px;" v-permission="'IMAGE.DELETE'"
                           v-if=" model && model.status !== 'Deleted' && windowData.imageState !== 'exported'"
                           @click="!( model && model.status === 'Deleted') && deleteImage()">{{ $t("common.destroy") }}</a>
                        <a id="common-destroy" style="padding-bottom:12px;" @click="pagedeleteExportImage()"
                           v-if="windowData.imageState === 'exported'">{{$t("common.destroy")}}</a>
                        <a id="common-expunge" style="padding-bottom:12px;" v-permission="'IMAGE.EXPUNGE'"
                           @click=" model && model.status === 'Deleted' && expungeImage()"
                           v-if="windowData.imageState === 'destroyed'">{{ $t("common.expunge") }}</a>
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
          <base-icon name="image_large"/>
          <div class="after-icon">
            <detail-info-state outer-class-name="detail-page-state" v-if="model && model.state" :state="model.state"/>
            <detail-info-state outer-class-name="detail-page-state" v-if="model && model.status && !isInUploading()"
                               :state="model.status"/>
            <detail-info-state outer-class-name="detail-page-state" :state="'Uploading'" v-if="isInUploading()"/>
          </div>
          <detail-name :param="getNameParam()" class="name"/>
          <detail-description :param="getDescriptionParam()" class="description"/>

        </div>
        <div class="left-body">
          <div class="detail-block-header">
            {{$t("common.overview")}}
          </div>
          <detail-row :param="{
                    title: $t('common.size'),
                    content: model && bytesToSize(model.size)
                  }"/>
          <detail-row :param="{
                    title: $t('common.actualSize'),
                    content:  model && bytesToSize(model.actualSize)
                  }"/>
          <detail-row :param="{
                    title: $t('image.imageType'),
                    content: $t(`image.${model && model.mediaType === 'DataVolumeTemplate' ? 'volumeImage' : 'systemImage'}`)
                  }" v-if="dbData.common.isAdmin && windowData.imageState !== 'exported'"/>
          <detail-row :param="{
                    title: $t('image.format'),
                    content: model &&  model.format
                  }"/>
          <detail-row :param="{
                    title: $t('common.platform'),
                    content: model &&  model.platform
                  }"/>
          <detail-row :param="{
                    title: $t('common.owner'),
                    content: model &&  dbData.account[model.accountUuid] && dbData.account[model.accountUuid].name
                  }"
                      v-if="dbData.common.isAdmin && windowData.imageState !== 'exported' && !dbData.common.isOpensource"/>

          <detail-row :param="{
                    title: $t('common.createDate'),
                    content: model && formatDatetime(new Date(model.createDate))
                  }"/>
          <detail-row :param="{
                    title: $t('common.lastOpDate'),
                    content: model && formatDatetime(new Date(model.lastOpDate))
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
                title: 'image.imageSource',
                content: 'Ceph'
              }"/>
        <detail-row :param="{
                title: 'URL',
                content:  model && model.url,
                copy: true
              }" v-show="windowData.imageState !== 'exported'"/>
        <detail-row :param="{
                title: 'common.installPath',
                content:  model && model.backupStorageRefs[0].installPath,
                copy: true
              }" v-show="windowData.imageState !== 'exported'"/>
        <detail-row :param="{
                title: 'common.backupStorage',
                content:  model && dbData.backupstorage[model.backupStorageRefs[0].backupStorageUuid].name,
                handler: () => {
                  $router.push({name: 'detailbackupstorage', params: {uuid: model.backupStorageRefs[0].backupStorageUuid}})
                }
              }" v-show="windowData.imageState !== 'exported'"/>
        <detail-row :param="{
                title: 'common.ExportedImage',
                content: model &&  model.name
              }" v-if="model && model.exportUrl" v-show="windowData.imageState !== 'exported'"/>
        <detail-row :param="{
                title: 'common.ExportedImageURL',
                content: model &&  model.exportUrl,
                copy: true
              }" v-if="model && model.exportUrl"/>

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
    name: "VirtualRouterImageDetailPage",
    mixins: [WindowBase, Root, Methods],
    components: {
      DetailLongContent,
      DetailInfoState,
      DetailTemplate,
      PageTemplate,
      LogList
    },
    created() {
      this.updateWindow({currTab: 'info'})

      let imageState = 'available'
      this.updateWindow({
        currTab: 'info',
        dataUuid: this.$route.params ? this.$route.params.uuid : '',
        imageState,
        isFromCephPs: false,
        methods: {
          query: this.query
        }
      })
        .then(() => {
          return this.query()
        }).then(() => {
        return this.isCephImage()
      }).then(() => {
        this.$forceUpdate()
      })
      window.addEventListener('click', this.onWindowClick)
    },
    mounted() {

    },
    destroyed: function () {
      window.removeEventListener('click', this.onWindowClick)
    },
    watch: {
      'param.uuid': function (newValue, oldValue) {
        if (_.isEqual(newValue, oldValue)) return
        return this.updateWindow({dataUuid: this.param.uuid}).then(() => {
          return this.query()
        }).then(() => {
          return this.isCephImage()
        }).then(() => {
          this.$forceUpdate()
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
        image: null
      }
    },
    computed: {
      model: {
        get() {
          let self = this;
          if (self.image) {
            return self.image;
          }
        },
        set(val) {
          let self = this;
          return self.image = val;
        }
      }
    },
    methods: {
      ...Utils,
      getNameParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.image[this.windowData.dataUuid]) {
              return this.dbData.image[this.windowData.dataUuid].name
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('images', 'updateImage', 'name', 'image', value)
          }
        }
      },
      getDescriptionParam() {
        return {
          getValue: () => {
            let self = this;
            if (this.dbData.image[self.windowData.dataUuid]) {
              return this.dbData.image[self.windowData.dataUuid].description
            } else {
              return ''
            }
          },
          canEdit: () => {
            return true;
          },
          setValue: (value) => {
            this.updateResource('images', 'updateImage', 'description', 'image', value)
          }
        }
      },
      handleTabChange(tab, event) {
        let self = this;
        if (self.activeName === tab.name) return;
        self.activeName = tab.name;
      },
      isInUploading() {
        let image = this.dbData.image[this.windowData.dataUuid]
        let isDownloading = image && ['Downloading', 'Creating'].indexOf(image.status) > -1
        return isDownloading && this.isUploading(this.windowData.dataUuid)
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({showMoreDropdown: false})
      },
      isCephImage: function () {
        let imageUuid = this.windowData.dataUuid
        return rpc.query(`system-tags`, {q: `resourceUuid=${imageUuid}`}).then(resp => {
          let imageTag = resp.inventories[0]
          if (imageTag && imageTag.tag && imageTag.tag.indexOf('Ceph') > -1) {
            return this.updateWindow({isFromCephPs: true})
          } else {
            return this.updateWindow({isFromCephPs: false})
          }
        })
      },
      query: function () {
        let imageInventories
        return rpc.query(`images/${this.windowData.dataUuid}`)
          .then((resp) => {
            imageInventories = resp.inventories[0]
            return rpc.query(`accounts/resources/refs`, {
              q: `resourceUuid=${resp.inventories[0].uuid}`
            })
          })
          .then((resp) => {
            if (this.dbData.common.isAdmin) {
              imageInventories.accountUuid = resp.inventories[0].accountUuid
              return rpc.query('accounts', {
                q: `uuid=${resp.inventories[0].accountUuid}`
              })
            } else {
              return new Promise((resolve, reject) => {
                resolve()
              })
            }
          })
          .then((resp) => {
            if (this.dbData.common.isAdmin) {
              return this.updateDbRow({
                tableName: 'account',
                id: resp.inventories[0].uuid,
                data: resp.inventories[0]
              })
            } else {
              return this.getResourceAccount()
              // return new Promise((resolve, reject) => { resolve() })
            }
          })
          .then(() => {
            return rpc.query(`backup-storage`, {
              q: `uuid=${imageInventories.backupStorageRefs[0].backupStorageUuid}`
            })
          })
          .then((resp) => {
            return this.updateDbRow({
              tableName: 'backupstorage',
              id: resp.inventories[0].uuid,
              data: resp.inventories[0]
            })
          })
          .then(() => {
            this.updateDbRow({
              tableName: 'image',
              id: this.windowData.dataUuid,
              data: imageInventories
            }).then(() => {
              this.model = _.get(this.dbData.image, this.windowData.dataUuid)
            })
          })
      },
      enableImage: function () {
        let self = this
        let uuidList = [this.windowData.dataUuid]
        self.enable(uuidList, this.query)
      },
      disableImage: function () {
        let self = this
        let uuidList = [this.windowData.dataUuid]
        self.disable(uuidList, this.query)
      },
      close() {
        this.$router.push({name:'virtualrouterimage'});
      },
      deleteImage: function () {
        let self = this
        let uuidList = [this.windowData.dataUuid]
        self.openDialog('ConfirmDlg', {
          title: "virtualRouterImage.delete",
          description: "virtualRouterImage.info.deleteConfirm",
          icon: 'image_popupico',
          warning: 'virtualRouterImage.deleteWarning',
          uuidList,
          getName: (uuid) => {
            return self.dbData.image[uuid].name;
          },
          ok: () => {
            self.delete(uuidList)
            .then(() => self.close() )
          }
        })
      },
      getResourceAccount: function () {
        let self = this
        return rpc.query(`resources/accounts`, {
          resourceUuids: [self.windowData.dataUuid]
        }).then((resp) => {
          return self.updateDbRow({
            tableName: 'account',
            id: self.windowData.dataUuid,
            data: resp.inventories[self.windowData.dataUuid]
          })
        })
      },
      pagedeleteExportImage: function () {
        let self = this
        let uuidList = [this.windowData.dataUuid]
        this.openDialog('DeleteImageConfirm', {
          uuidList,
          ok: () => {
            self.deleteExportImage(uuidList)
            .then(() => {
              self.close()
            })
          }
        })
      },
      expungeImage: function () {
        let uuidList = [this.windowData.dataUuid]
        let self = this
        this.openDialog('DeleteImageConfirm', {
          uuidList,
          ok: () => {
            self.expunge(uuidList)
            .then(() => {
              self.queryList();
            })
          }
        })
      },
      deleteExportImage: function (uuid) {
        let event = this.createEvent('virtualRouterImage.action.delete', this.dbData.image[uuid].name)
        const self = this
        rpc._delete(`backup-storage/${self.dbData.image[uuid].backupStorageRefs[0].backupStorageUuid}/exported-images/${uuid}`, null, event)
          .then((resp) => {
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
      },
      canExported: function (uuid) {
        let image = this.dbData.image[uuid]
        return image && image.backupStorageRefs && this.dbData.backupstorage[image.backupStorageRefs[0].backupStorageUuid] && this.dbData.backupstorage[image.backupStorageRefs[0].backupStorageUuid].type === 'ImageStoreBackupStorage' && image.status !== 'Deleted' && !image.exportUrl
      },
      pageDownload: function () {
        this.download([this.windowData.dataUuid])
      },
      pageCopyUrl: function () {
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
      recoverImage: function () {
        let self = this
        rpc.update('images', [self.windowData.dataUuid], {
          'recoverImage': {
            'backupStorageUuids': [
              self.dbData.image[self.windowData.dataUuid].backupStorageRefs[0].backupStorageUuid
            ]
          }
        })
          .then(() => {
            if (self.param.refresh) self.param.refresh(self.windowData.dataUuid)
          })
      },
      expunge: function (uuid) {
        const self = this
        rpc.update('images', uuid, {
          'expungeImage': {
            'backupStorageUuids': [`${self.dbData.image[uuid].backupStorageRefs[0].backupStorageUuid}`]
          }
        })
          .then((resp) => {
            if (self.param.refresh) self.param.refresh(uuid)
          })
      },
      delete: function (uuid) {
        const self = this
        let event = self.createEvent('virtualRouterImage.action.delete', self.dbData.image[self.windowData.dataUuid].name)
        return rpc._delete(`images/${uuid}`)
          .then((resp) => {
             self.incEventSuccess(event);
             self.close();
          }).catch(() =>{
             self.incEventFail(event);
          })
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({showMoreDropdown: !this.windowData.showMoreDropdown})
        $event.stopPropagation()
      },
      updateImage: function (name, newValue) {
        let obj = {updateImage: {}}
        obj.updateImage[name] = newValue
        rpc.update('images', `${this.windowData.dataUuid}`, obj)
          .then((resp) => {
            this.updateDbRow({
              tableName: 'image',
              id: this.windowData.dataUuid,
              data: resp.inventories[0]
            })
          })
      },
      exportImage: function () {
        let event = this.createEvent('virtualRouterImage.action.export', this.dbData.image[this.windowData.dataUuid].name)
        let self = this
        rpc.put(`backup-storage/${this.dbData.image[this.windowData.dataUuid].backupStorageRefs[0].backupStorageUuid}/actions`, {
          exportImageFromBackupStorage: {
            imageUuid: this.windowData.dataUuid
          }
        }, event)
          .then((resp) => {
            let image = _.cloneDeep(this.dbData.image[this.windowData.dataUuid])
            image.exportUrl = resp.imageUrl
            self.incEventSuccess(event)
            this.updateDbRow({
              tableName: 'image',
              id: this.windowData.dataUuid,
              data: image
            })
          }, () => {
            self.incEventFail(event)
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
