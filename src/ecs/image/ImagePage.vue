<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">{{$t('common.image')}}</span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs  @tab-click="setTabVal" v-model="windowData.currTab ">
            <el-tab-pane
              :label="`${$t('common.available')}(${windowData.availableCount ? windowData.availableCount : '0'})`"
              name="available" v-if="dbData.common.isAdmin"></el-tab-pane>
            <el-tab-pane :label="`${$t('common.mine')}(${windowData.mineCount ? windowData.mineCount : '0'})`"
                         name="mine" v-if="!dbData.common.isAdmin"></el-tab-pane>
            <el-tab-pane :label="`${$t('common.share')}(${windowData.shareCount ? windowData.shareCount : '0'})`"
                         name="share" v-if="!dbData.common.isAdmin"></el-tab-pane>
            <el-tab-pane :label="`${$t('common.deleted')}(${windowData.destroyedCount ? windowData.destroyedCount : '0'})`"
                         name="destroyed"></el-tab-pane>
            <el-tab-pane :label="`${$t('common.exported')}(${windowData.exportedCount ? windowData.exportedCount : '0'})`" name="exported"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div class="page-toolbar-container" slot="page-toolbar">
      <el-row style="flex-wrap: nowrap;" type="flex">
        <div style="flex-shrink: 0;">
          <span @click="createImage()" class="btn-success"
                v-if="windowData.currTab.includes('available') || windowData.currTab.includes('mine')"><i
            class="el-icon-plus icon"></i>{{$t('common.addImage')}}</span>
          <span class="btn-primary"
                :class="{ 'disabled': !isSelected || inStates('Enabled')}"
                @click="isSelected && !inStates('Enabled') && pageStart()"
                v-if="windowData.currTab.includes('available') || windowData.currTab.includes('mine')"
                v-permission="'IMAGE_STATE.CHANGE'"><i
            class="el-icon-caret-right icon"></i>{{$t('common.enable')}}</span>
          <span class="btn-primary"
                :class="{ 'disabled': !isSelected || inStates('Disabled')}"
                @click="isSelected && !inStates('Disabled') && pageStop()"
                v-if="windowData.currTab.includes('available') || windowData.currTab.includes('mine')"
                v-permission="'IMAGE_STATE.CHANGE'"><i
            class="el-icon-remove-outline icon"></i>{{$t('common.disable')}}
          </span>
          <drop-down :class="{'disabled': !isSelected}" :enabled="isSelected" class="dropdown more btn-primary"
                     v-if="windowData.currTab.includes('available') || windowData.currTab.includes('mine')">
            <span slot="title">
              <i class="el-icon-more"></i>
               <span class="text">{{ $t("common.moreActions") }}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
               <a :class="{ 'disabled-text': !canExport()}" @click="canExport() && exportImage()"
                  style="padding-top:12px;" v-permission="'BS.EXPORT_IMAGE'">{{$t("common.export")}}</a>
               <a :class="{ 'disabled-text': !isSelected || !hasNotSharedToAll()}"
                  @click="isSelected && hasNotSharedToAll() && pageShareImageToAll()" v-if="dbData.common.isAdmin"
                  v-permission="'LICENSE_BASIC_PAID'">{{$t("common.shareToAll")}}</a>
               <a :class="{ 'disabled-text': !isSelected || !hasSharedToAll()}"
                  @click="isSelected && hasSharedToAll() && pageRecallImageFromAll()" v-if="dbData.common.isAdmin"
                  v-permission="'LICENSE_BASIC_PAID'">{{$t("common.recallFromAll")}}</a>
               <a v-if="dbData.common.isAdmin"
                  v-permission="'LICENSE_BASIC_PAID'" @click="pageChangeResourceOwner()">{{$t("common.changeResourceOwner")}}</a>
               <a :class="{'disabled-text':!isSingleSelected || !canMigrate(selectedList[0])}"
                  @click="isSingleSelected && canMigrate(selectedList[0]) && pageStorageMigrateImage()"
                  v-permission="'BS.MIGRATE_IMAGE'">
                {{$t("common.storageMigrate")}}
                <help-trigger
                  :style="{ position: 'relative', top: '0', display: 'inline-block', verticalAlign: 'middle', left: '5px' }"
                  name="imageStorageMigrate"/>
               </a>
               <a :class="{'disabled-text': !pageCanDelete()}" @click="pageDelete" style="padding-bottom: 12px;"
                  v-permission="'IMAGE.DELETE'">{{$t("common.destroy")}}</a>
              </div>
            </span>
          </drop-down>
          <span :class="{ 'disabled': !isSelected}" @click="isSelected && pageRecover()" class="btn-primary"
                v-if="windowData.currTab.includes('destroyed')"><i
            class="el-icon-d-arrow-left icon"></i>{{$t('common.recover')}}
          </span>
          <span :class="{ 'disabled': !isSelected }" @click="isSelected && expungeImage()" class="btn-primary"
                v-if="windowData.currTab.includes('destroyed')"><i
            class="el-icon-remove-outline icon"></i>{{$t('common.expunge')}}
          </span>
          <span class="btn-primary" v-permission="'BS.EXPORT_IMAGE'" :class="{ 'disabled': !isSelected || !canExport() }" v-if="windowData.currTab == 'share'" @click="isSelected && canExport() && exportImage()">
              <i class="el-icon-download"></i>
             {{ $t("common.export") }}
          </span>
          <span class="btn-primary" :class="{ 'disabled': !isSelected }" v-if="windowData.currTab === 'exported'" @click="isSelected && pageDownload()">
             <i class="el-icon-download icon"></i>
            {{$t("common.download")}}
          </span>
          <span class="btn-primary" :class="{ 'disabled': !isSelected || !isSingleSelected}" v-if="windowData.currTab === 'exported'" @click="isSingleSelected && pageCopyUrl()">
            <div class="copy-icon icon"></div>
            {{$t("common.copyUrl")}}
            <div class="urlText" ref="valueElm" :title="isSingleSelected ? dbData.image[selectedList[0]].exportUrl : ''">
             {{ isSingleSelected ? dbData.image[selectedList[0]].exportUrl : '' }}
            </div>
          </span>
          <span class="btn-primary" v-permission="'IMAGE.DELETE'" v-if="windowData.currTab === 'exported'" :class="{ 'disabled': !isSelected }" @click="isSelected && pageDeleteExportImage()">
            <i class="el-icon-remove-outline icon"></i>
            {{$t("common.destroy")}}
          </span>
        </div>
        <backup-storage-single-dlg :message="bsSingleMessage" :model="showBsSingleDlg" @close="closeBsSingleDlg"
                                   v-if="showBsSingleDlg"/>
        <div style="flex-shrink: 1; flex-grow: 1"></div>
        <div style="text-align: right; flex-shrink: 0;">
          <span style="padding: 0 15px;display: inline-block;">
            <el-input @blur="search()" @change="search()" placeholder="请输入内容" v-model="searchStr">
               <el-select placeholder="请选择" slot="prepend" style="width: 100px" v-model="selectVal">
                   <el-option :key="index" :label="$t(`${item.name}`)" :value="item.value"
                              v-for="(item, index ) in conditionNameList"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
          <span @click="refresh()" class="btn-refresh"><i class="el-icon-refresh icon"></i></span>
        </div>
      </el-row>
    </div>
    <div slot="page-table-content">
      <el-table
        :data="itemList"
        @selection-change="handleChangeSelect"
        @sort-change="handleSort"
        v-loading="windowData.loading">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection" width="50px"></el-table-column>
        <el-table-column :label="$t('common.name')" prop="name"  show-tooltip-when-overflow>
          <template slot-scope="scope">
            <span class="link" @click="goToPath(scope.row.uuid)">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.backupStorage')"   show-tooltip-when-overflow>
          <template slot-scope="scope">
            {{dbData.image[scope.row.uuid] && dbData.image[scope.row.uuid].backupStorageRefs && dbData.image[scope.row.uuid].backupStorageRefs[0] &&
            dbData.backupstorage[dbData.image[scope.row.uuid].backupStorageRefs[0].backupStorageUuid] &&
            dbData.backupstorage[dbData.image[scope.row.uuid].backupStorageRefs[0].backupStorageUuid].name}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('image.imageType')" prop="mediaType" sortable   show-tooltip-when-overflow>
          <template slot-scope="scope">
            {{dbData.image[scope.row.uuid] && dbData.image[scope.row.uuid].mediaType === 'DataVolumeTemplate' ? $t('image.volumeImage') :
            $t('image.systemImage')}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('image.mediaType')" prop="format" sortable  show-tooltip-when-overflow>
          <template slot-scope="scope">
            {{dbData.image[scope.row.uuid] && dbData.image[scope.row.uuid].format}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.state')" prop="state" sortable  show-tooltip-when-overflow>
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
        <el-table-column :label="$t('common.status')" prop="status" sortable  show-tooltip-when-overflow>
          <template slot-scope="scope">
            <table-body-item-state :state="dbData.image[scope.row.uuid] && dbData.image[scope.row.uuid].status" slot="item"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.size')" prop="size" sortable  show-tooltip-when-overflow>
          <template slot-scope="scope">
            {{dbData.image[scope.row.uuid] && dbData.image[scope.row.uuid].size | bytesToSize}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.platform')" prop="platform" sortable  show-tooltip-when-overflow>
          <template slot-scope="scope">
            {{dbData.image[scope.row.uuid] && dbData.image[scope.row.uuid].mediaType === 'DataVolumeTemplate' ? '' :
            (dbData.image[scope.row.uuid] && dbData.image[scope.row.uuid].platform)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.owner')" prop="ownerName"  show-tooltip-when-overflow>
          <template slot-scope="scope">
            {{dbData.image[scope.row.uuid] && getResourceOwner(scope.row.uuid)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.createDate')" prop="createDate" sortable  show-tooltip-when-overflow>
          <template slot-scope="scope">
            {{new Date(scope.row.createDate) | formatDatetime}}
          </template>
        </el-table-column>
      </el-table>
      <div class="page-table-pagination">
        <el-pagination v-if="getTotal() > 0"
          :current-page="windowData.pageIndex"
          :page-size="windowData.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="getTotal()"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          class="page-table-pagination"
          layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
      </div>
    </div>
    <template slot="page-footer">
      <create-image-page class="create_image__container" v-if="showCreateImage" :param="createImageParam" @close="showCreateImage = false;"></create-image-page>
    </template>
  </page-template>
</template>

<script>
  import PageTemplate from "../../component/PageTemplate";
  import ImageList from 'src/ecs/image/List';
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import TableBodyItemState from "../../component/TableBodyItemState";
  import BackupStorageSingleDlg from "../../dialog/BackupStorageSingleListDlg";
  import CreateImagePage from "./CreateImagePage";

  export default {
    name: "ImagePage",
    mixins: [ImageList, WindowBase, PageBase],
    components: {CreateImagePage, BackupStorageSingleDlg, TableBodyItemState, PageTemplate},
    data() {
      return {
        searchStr: '',
        selectVal: 'name',
        showBsSingleDlg: false,
        showCreateImage: false,
        createImageParam: {},
        bsSingleMessage: {},
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        conditions: {
          available: ['format!=vmtx', 'system=false', 'status!=Deleted'],
          mine: ['format!=vmtx', 'system=false', 'status!=Deleted'],
          share: ['format!=vmtx', 'system=false', 'status!=Deleted'],
          destroyed: ['format!=vmtx', 'system=false', 'status=Deleted'],
          exported: ['format!=vmtx', 'system=false', 'exportUrl+not+null']
        },
        itemList: []
      }
    },
    computed: {
      isSelected() {
        let self = this;
        return self.windowData && self.windowData.selectUuidList.length >= 1;
      },
      selectedList() {
        let self = this;
        if (self.windowData && self.windowData.selectUuidList) {
          return self.windowData.selectUuidList;
        }
      },
      isSingleSelected() {
        let self = this;
        if (self.windowData && self.windowData.selectUuidList) {
          return self.windowData.selectUuidList.length === 1;
        }
      }
    },
    created() {
      let self = this;
      let initTab
      if (self.dbData.common.isAdmin) {
        initTab = 'available'
      } else {
        initTab = 'mine'
      }
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        currTab: initTab,
        loading: false,
        selectUuidList: [],
        methods: {
          queryList: self.queryList
        }
      })
        .then(() => {
          this.queryList().then(() => {
            if (!this.checkImageUploading) {
              this.checkUploadingStatus()
            }
            this.queryResourceProgress()
          })
        })
    },
    methods: {
      //是否展示进度条
      showProgress (uuid) {
        let image = this.dbData.image[uuid]
        let isInJobUuidTable = this.isInJobUuidTable(uuid)
        return image && isInJobUuidTable && (image.status === 'Downloading' || image.status === 'Creating')
      },
      //进度条信息
      getProgressInfos (uuid) {
        let obj = {}
        obj.content = this.dbData.imageProgress[uuid] && this.dbData.imageProgress[uuid].content
        obj.status = this.dbData.image[uuid].status
        if (this.isUploading(uuid)) obj.status = 'Uploading'
        return obj
      },
      getTotal() {
        let self = this;
        switch (self.windowData && self.windowData.currTab) {
          case 'available':
            return self.windowData.availableCount;
          case 'mine':
            return self.windowData.mineCount;
          case 'share':
            return self.windowData.shareCount;
          case 'destroyed':
            return self.windowData.destroyedCount;
          case 'exported':
            return self.windowData.exportedCount;
        }

      },
      handleSort(e) {
        if (e.order === 'ascending') {
          this.updateWindow({
            sortBy: e.prop,
            sortDirection: '+'
          })
            .then(() => {
             this.queryList();
          })
        } else {
          this.updateWindow({
            sortBy: e.prop,
            sortDirection: '-'
          })
            .then(() => {
              this.queryList();
            })
        }
      },
      setTabVal(tab) {
        let self = this;
        if (_.isEqual(tab.name)) return;
        self.windowData.currTab = tab.name;
        self.queryList();
      },
      handleChangeSelect(val) {
        let self = this, uuidList = [];
        uuidList = val.map((item) => {
          return item.uuid;
        })
        self.updateWindow({
          selectUuidList: uuidList
        })
      },
      canExport() {
        let self = this;
        if (!self.isSingleSelected) return false
        let uuid = self.selectedList[0]
        let image = self.dbData.image[uuid]
        if (!image) return false
        let backupStorage = image.backupStorageRefs && self.dbData.backupstorage[image.backupStorageRefs[0].backupStorageUuid]
        return backupStorage && backupStorage.type === 'ImageStoreBackupStorage' && image.status === 'Ready' && !image.exportUrl
      },
      search() {
        let self = this;
        this.updateWindow({
          pageIndex: 1,
        })
          .then(() => {
            self.queryList();
          })
      },
      refresh() {
        let self = this;
        self.updateWindow({
          pageIndex: 1
        })
          .then(() => {
            return self.queryList();
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
      //复制url;
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
      //删除导出镜像
      pageDeleteExportImage() {
        let uuidList = [], self = this;
        uuidList  = self.selectedList
        if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg', {
            title: 'image.deleteExportedImage',
            uuidList,
            description: 'image.info.deleteExportedConfirm',
            icon: 'image_popupico',
            getName:(uuid) => {
              return self.dbData.image[uuid].name
            },
            ok: () => {
              self.deleteExportImage(uuidList)
                .then(() => {
                  self.queryList();
                })
            }
          })
        }
      },
      //跳转到详情页
      goToPath(uuid){
        let self = this;
        self.$router.push({
          name:  `detailImage`,
          path: 'detailImage',
          params: {
            uuid: uuid,
            currTab: self.windowData.currTab
          }
        })
      },
      //跳转到添加镜像页面
      createImage() {
        let self  = this;
        self.createImageParam = {
          ok: (param) => {
             return self.create(param)
          }
        }
        self.showCreateImage = true;
      }
    }
  }
</script>

<style scoped lang="less">
  .copy-icon{
    display: inline-block;
    width: 16px;
    height: 20px;
    background-image: url('~assets/copy_d.svg');
    position: relative;
  }
  .urlText{
    width: 1px;
    height: 1px;
    position: absolute;
    font-size: 0px;
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
