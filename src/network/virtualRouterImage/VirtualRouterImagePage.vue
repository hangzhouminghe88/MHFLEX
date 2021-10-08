<template>
  <page-template>
    <div slot="page-header" style="height: 60px; line-height: 60px;">
      <el-row :gutter="10">
        <el-col :span="2.2">
          <span class="page-header-title">{{ $t(`common.virtualrouterimage`) }}</span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs v-model="windowData.currTab" @tab-click="changeCurrTab">
            <el-tab-pane
              :label="`${$t('common.available')}(${windowData.availableCount ? windowData.availableCount : '0'})`"
              name="available"></el-tab-pane>
            <el-tab-pane
              :label="`${$t('common.deleted')}(${windowData.destroyedCount ? windowData.destroyedCount : '0'})`"
              name="destroyed"></el-tab-pane>
            <el-tab-pane
              :label="`${$t('common.exported')}(${windowData.exportedCount ? windowData.exportedCount : '0'})`"
              name="exported"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex" justify="space-between">
        <div style="flex-shrink: 0;" v-if="windowData.currTab == 'available'">
          <span class="btn-success" @click="updateWindow({ currItemUuid: '' }); openCreateVirtualRouterImageDlg()"><i
            class="el-icon-plus icon"></i>{{$t('virtualRouterImage.add')}}</span>
          <span class="btn-primary" :class="{ 'disabled': !isSelected || windowData.currItemUuid !== '' }"
                @click="isSelected && windowData.currItemUuid === '' && pageEnable()"><i
            class="el-icon-caret-right icon"></i>{{$t('common.enable')}}</span>
          <span class="btn-primary" :class="{ 'disabled': !isSelected || windowData.currItemUuid !== '' }"
                @click="isSelected && windowData.currItemUuid === '' && pageDisable()"><i
            class="el-icon-remove-outline icon"></i>{{$t('common.disable')}}
            </span>
          <drop-down class="btn-primary more dropdown"
                     :class="{'disabled': !isSelected || windowData.currItemUuid !== ''}"
                     :enabled="isSelected && windowData.currItemUuid === ''">
            <span slot="title">
               <i class="el-icon-more"></i>
               <span class="text">{{ $t("common.moreActions") }}</span>
            </span>
            <span slot="content">
              <transition name="fade" type="transition" mode="out-in">
                <div class="dropdown-content" style="padding: 4px 20px;">
                  <a id="common-export" style="padding-top: 12px;"
                     @click="isSingleSelected && canExported(selectedList[0]) && exportImage()"
                     :class="{ 'disabled-text': !(isSingleSelected && canExported(selectedList[0]))}">{{$t("common.export")}}</a>
                  <a id="common-destroy" v-permission="'IMAGE.DELETE'" @click="pageDelete"
                     style="padding-bottom: 12px;">{{ $t("common.destroy") }}</a>
                </div>
              </transition>
            </span>
          </drop-down>
        </div>
        <div style="flex-shrink: 0;" v-if="windowData.currTab == 'destroyed'">
            <span v-permission="'IMAGE.RECOVER'" class="btn-primary"
                  :class="{ 'disabled': !isSelected || windowData.currItemUuid !== '' }"
                  @click="isSelected && pageRecover()"><i
              class="el-icon-caret-right icon"></i>{{$t('common.recover')}}</span>
          <span v-permission="'IMAGE.EXPUNGE'" class="btn-primary"
                :class="{ 'disabled': !isSelected || windowData.currItemUuid !== '' }"
                @click="isSelected && expungeImage()"><i
            class="el-icon-remove-outline icon"></i>{{$t('common.expunge')}}</span>
        </div>
        <div style="flex-shrink: 0;" v-if="windowData.currTab == 'exported'">
              <span class="btn-primary" :class="{ 'disabled': !isSelected || windowData.currItemUuid !== '' }"
                    @click="isSelected  && pageDownload()"><i
                class="el-icon-caret-right icon"></i>{{$t('common.download')}}</span>
          <span class="btn-primary" :class="{ 'disabled': !isSelected || windowData.currItemUuid !== '' }"
                @click="isSelected  && pageCopyUrl()">
                <i class="el-icon-caret-right icon"></i>
                <span>{{$t('common.copyUrl')}}</span>
                <div class="urlText" ref="valueElm" :title="isSingleSelected ? dbData.image[selectedList[0]].exportUrl : ''">
                  {{ isSingleSelected ? dbData.image[selectedList[0]].exportUrl : '' }}
                </div>
           </span>
          <span v-permission="'IMAGE.DELETE'" class="btn-primary"
                :class="{ 'disabled': !isSelected || windowData.currItemUuid !== '' }"
                @click="isSelected && pageDeleteExportImage()"><i
            class="el-icon-caret-right icon"></i>{{$t('common.destroy')}}</span>
        </div>

        <div style="text-align: right;flex-shrink: 0;">
            <span style="padding: 0 15px;display: inline-block;">
              <el-input placeholder="请输入内容" v-model="searchStr" @change="search()">
                 <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                     <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                                :value="item.value"></el-option>
                 </el-select>
                <span slot="append"><i class="el-icon-search icon"></i></span>
              </el-input>
            </span>
          <span class="btn-refresh" @click="refresh()"><i class="el-icon-refresh icon"></i></span>
        </div>
      </el-row>
    </div>

    <div slot="page-table-content" style="max-height: 400px;">
      <el-table
        ref="multipleTable"
        :data="itemList"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelect"
        v-loading="windowData.loading"
        @sort-change="handleSort"
      >
          <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
          </span>
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          :label="$t('common.name')"
          prop="name"
        >
          <template slot-scope="scope">
            <a class="link" @click="$router.push(`detailvirtualrouterimage/${scope.row.uuid}`);">{{scope.row.name}}</a>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.backupStorage')"
          prop="backupStorage" v-if="windowData.currTab !== 'exported'"
        >
          <template slot-scope="scope">
            {{dbData.backupstorage[scope.row.backupStorageRefs[0].backupStorageUuid].name}}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('image.imageType')"
          prop="imageType"
        >
          <template slot-scope="scope">
            {{scope.row.mediaType === 'DataVolumeTemplate' ? $t('image.volumeImage') : $t('image.systemImage')}}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('image.mediaType')"
          prop="format"
        >
        </el-table-column>
        <el-table-column
          :label="$t('common.state')"
          prop="state" v-if="windowData.currTab !== 'exported'"
        >
         <template slot-scope="scope">
           <template v-if="showProgress(scope.row.uuid)">
             <div class="progress-container" v-if="dbData.image[scope.row.uuid] && dbData.image[scope.row.uuid].status==='Downloading'">
               <div class="progress-bar">
                 <div class="progress-bar-item" :style="{width: `${0 || getProgressInfos(scope.row.uuid).content}%`}"></div>
               </div>
               <div class="progress-text" :title="`下载中${getProgressInfos(scope.row.uuid).content ? '(' + getProgressInfos(scope.row.uuid).content + '%)' : ''}`">
                 下载中{{`${getProgressInfos(scope.row.uuid).content ? '(' + getProgressInfos(scope.row.uuid).content + '%)' : ""}`}}
               </div>
             </div>
             <div v-else>上传中</div>
           </template>
           <table-body-item-state v-else
                                  :state="dbData.image[scope.row.uuid] && dbData.image[scope.row.uuid].state"
                                  slot="item"/>
         </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.status')"
          prop="status" v-if="windowData.currTab !== 'exported'"
        >
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="scope.row.status"/>
          </template>
        </el-table-column>

        <el-table-column
          :label="$t('common.size')"
          prop="size"
        >
          <template slot-scope="scope">
            {{bytesToSize(scope.row.size)}}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.platform')"
          prop="platform"
        >
        </el-table-column>
        <el-table-column
          :label="$t('common.owner')"
          prop="owner" v-if="dbData.common.isAdmin && windowData.currTab !== 'exported' && !dbData.common.isOpensource"
        >
          <template slot-scope="scope">
            {{dbData.accountRef[scope.row.uuid].owner.name}}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.createDate')"
          prop="createDate">
          <template slot-scope="scope">
            {{formatDatetime(new Date(scope.row.createDate))}}
          </template>
        </el-table-column>
      </el-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData[`${windowData.currTab}Count`] > 0"
                       :current-page="windowData.pageIndex"
                       :page-size="windowData.pageSize"
                       :page-sizes="[10, 20, 50, 100]"
                       :total="windowData.availableCount"
                       @current-change="pageCurrentChange"
                       @size-change="pageSizeChange"
                       class="page-table-pagination"
                       layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
        <add-router-entry-dlg v-if="showRouterEntryDlg" :param="routerEntryMessage"
                              @close="closeRouterEntry"></add-router-entry-dlg>
      </div>
    </div>
    <template slot="page-footer">
      <create-virtual-router-image-page class="create_image__container" v-if="showCreateImage" :param="createImageParam" @close="showCreateImage = false;"></create-virtual-router-image-page>
    </template>
  </page-template>
</template>

<script>
  import rpc from 'src/utils/rpc'
  import List from 'src/network/virtualRouterImage/List'
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import Root from 'src/windows/Root';
  import AddRouterEntryDlg from 'src/network/virtualRouterTable/component/AddRouterEntry'
  import TableBodyItemState from "../../component/TableBodyItemState";
  import CreateVirtualRouterImagePage from "./CreateVirtualRouterImagePage";

  export default {
    name: "VirtualRouterImagePage",
    mixins: [Root, WindowBase, List, PageBase],
    components: {CreateVirtualRouterImagePage, PageTemplate, TableBodyItemState, AddRouterEntryDlg},
    created: function () {
      this.self = this
      const initTab = 'available'
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: '',
        sortBy: 'createDate',
        sortDirection: '-',
        currTab: initTab,
        selectUuidList: [],
        conditions: this.conditions[initTab],
        system: true,
        uuidList: [],
        showMoreDropdown: false,
        loading: false,
        methods: {
          queryList: this.queryList
        }
      }).then(() => {
        this.queryList().then(() => {
          if (!this.checkImageUploading) {
            this.checkUploadingStatus()
          }
          this.queryResourceProgress()
        })
      })
      rpc.query('images', {
        count: true,
        q: [this.conditions.destroyed, 'system=true', `backupStorage.zone.uuid=${localStorage.getItem('currZoneUuid')}`]
      }).then((resp) => {
        this.updateWindow({destroyedCount: resp.total})
      })
      rpc.query('images', {
        count: true,
        q: ['exportUrl+not+null', 'system=true', `backupStorage.zone.uuid=${localStorage.getItem('currZoneUuid')}`]
      })
        .then((resp) => {
          this.updateWindow({exportedCount: resp.total})
        })

    },
    computed: {
      isSelected() {
        let self = this;
        return self.windowData && self.windowData.selectUuidList.length >= 1;
      },
      selectedList() {
        let self = this;
        return self.windowData && self.windowData.selectUuidList;
      },
      isSingleSelected() {
        let self = this;
        return self.windowData && self.windowData.selectUuidList.length === 1;
      }
    },
    destroyed: function () {
      this.deleteCurrAssistant(this.windowData.id)
    },
    data() {
      return {
        createImageParam: {},
        showCreateImage: false,
        showRouterEntryDlg: false,
        routerEntryMessage: {},
        conditions: {
          'available': 'status!=Deleted',
          'destroyed': 'status=Deleted',
          'exported': 'exportUrl+not+null'
        },
        conditionNameList: [
          {
            name: 'common.name',
            value: 'name'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          }
        ],
        searchStr: "",
        selectVal: 'name',
        itemList: []
      }

    },
    methods: {
      closeRouterEntry() {
        this.showRouterEntryDlg = false;
      },
      search() {
        let self = this;
        self.updateWindow({
          pageIndex: 1
        }).then(() => {
          self.queryList()
        })
      },
      refresh() {
        let self = this;
        self.updateWindow({
          pageIndex: 1,
          currItemUuid: ''
        }).then(() => {

          self.queryList();
        })
      },
      handleSort(e) {
        if (e.order === 'ascending') {
          this.updateWindow({
            sortBy: e.prop,
            sortDirection: '+'
          })
        } else {
          this.updateWindow({
            sortBy: e.prop,
            sortDirection: '-'
          })
        }
        this.queryList();
      },
      handleSelect(rows) {
        let self = this, uuidList = [];
        uuidList = rows.map((item) => {
          return item.uuid;
        });
        self.updateWindow({
          selectUuidList: uuidList
        })
      },
      pageSizeChange(val) {
        this.updateWindow({
          pageSize: val,
          pageIndex: 1,
        })
      },
      pageCurrentChange(val) {
        this.updateWindow({
          pageIndex: val
        })
      },
      showProgress(uuid) {
        let image = this.dbData.image[uuid]
        let isInJobUuidTable = this.isInJobUuidTable(uuid)
        return isInJobUuidTable && (image.status === 'Downloading' || image.status === 'Creating')
      },
      getProgressInfos(uuid) {
        let obj = {}
        obj.content = this.dbData.imageProgress[uuid] && this.dbData.imageProgress[uuid].content
        obj.status = this.dbData.image[uuid].status
        if (this.isUploading(uuid)) obj.status = 'Uploading'
        return obj
      },
      createConditionForOwner: function (ownerName) {
        return rpc.query('accounts', {
          q: `name~=%25${ownerName}%25`
        }).then((resp) => {
          let uuidList = resp.inventories.map(it => {
            return it.uuid
          })
          return rpc.query('accounts/resources/refs', {
            q: [`accountUuid?=${uuidList.join()}`, 'resourceType=ImageVO']
          })
        }).then((resp) => {
          let uuidList = []
          if (resp.inventories.length > 0) uuidList = _.uniq(resp.inventories.map((item) => item.resourceUuid))
          return new Promise((resolve, reject) => {
            resolve(`uuid?=${uuidList.join()}`)
          })
        })
      },
      changeCurrTab: function (e) {
        let self = this;
        self.itemList = [];
        this.updateWindow({
          currItemUuid: '',
          pageIndex: 1,
          conditions: this.conditions[e.name]
        }).then(() => {
          this.queryList()
        })
      },
      pageDelete: function () {
        let uuidList = this.selectedList
        let self = this
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg', {
            title: 'virtualRouterImage.delete',
            description: this.$t("virtualRouterImage.info.deleteConfirm", {length: uuidList.length}),
            uuidList: uuidList,
            icon: 'image_popupico',
            warning: 'virtualRouterImage.deleteWarning',
            ok: () => {
              self.delete(uuidList)
                .then(() => {
                  self.itemList = [];
                  self.queryList();
                })
            },
            getName: (uuid) => {
              return self.dbData.image[uuid].name;
            }
          })

        }
      },
      canExported: function (uuid) {
        let image = this.dbData.image[uuid]
        return image && image.backupStorageRefs && this.dbData.backupstorage[image.backupStorageRefs[0].backupStorageUuid] && this.dbData.backupstorage[image.backupStorageRefs[0].backupStorageUuid].type === 'ImageStoreBackupStorage' && image.status !== 'Deleted' && !image.exportUrl
      },
      exportImage: function () {
        if (!this.isSingleSelected) return
        let event = this.createEvent('virtualRouterImage.action.export', this.dbData.image[this.selectedList[0]].name)
        let self = this
        let selectedUuidList = self.selectedList
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
            this.updateWindow({exportedCount: self.windowData.exportedCount + 1})
          }, () => {
            self.incEventFail(event)
          })
      },
      expungeImage: function () {
        let uuidList = [], self = this;
        uuidList = self.selectedList;
        if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg', {
            uuidList,
            title: 'virtualRouterImage.delete',
            description: this.$t("virtualRouterImage.info.deleteConfirm", {length: uuidList.length}),
            icon: 'image_popupico',
            warning: 'virtualRouterImage.deleteWarning',
            ok: () => {
              self.expunge(uuidList)
              .then(() => {
                self.itemList = [];
                self.queryList();
              })
            },
            getName: (uuid) => {
              return this.dbData.image[uuid].name;
            }
          })
        }
      },
      pageEnable: function () {
        let uuidList = this.selectedList
        if (uuidList.length > 0) this.enable(uuidList, this.queryList)
      },
      pageDisable: function () {
        let uuidList = this.selectedList

        if (uuidList.length > 0) this.disable(uuidList, this.queryList)
      },
      openCreateVirtualRouterImageDlg: function () {
        let self  = this;
        self.createImageParam = {
          ok: (param) => {
            return self.create(param)
          }
        }
        self.showCreateImage = true;
      },
      pageDownload: function () {
        let uuidList = [], self = this;
        uuidList = self.selectedList;
        if (uuidList.length > 0) this.download(uuidList);
      },
      pageRecover: function () {
        let uuidList = [], self = this;
        uuidList = self.selectedList;
        if (uuidList.length > 0) this.recover(uuidList).then(() => {
          self.itemList= [];
          self.queryList()
        })
      },
      refresh: function (uuid) {
        this.updateWindow({
          currItemUuid: ''
        })
        this.queryList()
        this.updateCount()
      },
      pageDeleteExportImage: function () {
        let uuidList = [], self = this;
        uuidList = self.selectedList;
        if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg', {
            title: 'virtualRouterImage.delete',
            description: this.$t("virtualRouterImage.info.deleteConfirm", {length: uuidList.length}),
            uuidList: uuidList,
            icon: 'image_popupico',
            warning: 'virtualRouterImage.deleteWarning',
            ok: () => {
              self.deleteExportImage(uuidList)
              .then(() => {
                self.itemList = [];
                self.queryList()
              })
            },
            getName: (uuid) => {
              return self.dbData.image[uuid].name;
            }
          })
        }
      },
      refreshAfterExport() {
        this.queryList()
        this.updateCount()
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
    },
    watch: {},
    filters: {}
  }
</script>

<style scoped lang="less">
  .urlText{
   width: 1px;
   height: 1px;
   position: absolute;
   overflow: hidden;
  }
  .progress-container{
    width: 100%;
    position: relative;
  }
  .progress-bar{
    width: 50%;
    border-radius: 10px;
    height: 8px;
    background: #dae0e6;
    display: inline-block;
    vertical-align: middle;
  }
  .progress-bar-item{
    border-radius: 10px;
    height: 8px;
    background: #409EFF;
    position: relative;
  &:after{
     content: '';
     height: 8px;
     position: absolute;
     background: linear-gradient(to right, #fff, #409EFF);
     background: -ms-linear-gradient(to right, #fff, #409EFF);
     opacity: 0.5;
     animation: progress-frame 1s infinite;
   }
  }
  .progress-text{
    display: inline-block;
    vertical-align: middle;
    line-height: 23px;
    color: #45BB79;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    position: absolute;
    height: 23px;
  }
  @keyframes progress-frame {
    0% {
      width: 0;
    }
    100% {
      width: 100%;
    }
  }
  .create_image__container{
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
  }
</style>
