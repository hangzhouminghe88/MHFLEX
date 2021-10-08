<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">{{$t('common.image')}}{{$t('common.colon')}}</span>
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content" v-if="windowData.currSelectTab == 'image'" :class="{ 'show': windowData.showMoreDropdown }">
                <a id="common-addImage" style="padding-top: 12px;" @click="!isSelected && pageAddImage()" :class="{'disabled-text':isSelected }">{{$t("common.addImage")}}</a>
                <a id="common-enable" v-permission="'IMAGE_STATE.CHANGE'" @click="!inStates('Enabled') && pageStart()" :class="{'disabled-text':!isSelected || inStates('Enabled') }">{{$t("common.enable")}}</a>
                <a id="common-disable" v-permission="'IMAGE_STATE.CHANGE'" @click="!inStates('Disabled') && pageStop()" :class="{'disabled-text':!isSelected || inStates('Disabled') }">{{$t("common.disable")}}</a>
                <a id="common-export" @click="isSingleSelected && canExport() && exportImage()" :class="{ 'disabled-text': !canExport()}">{{$t("common.export")}}</a>
                <a id="common-shareToAll" v-permission="'LICENSE_BASIC_PAID'" @click="isSelected && hasNotSharedToAll() && pageShareImageToAll()" :class="{ 'disabled-text': !isSelected || !hasNotSharedToAll()}" v-if="dbData.common.isAdmin">{{$t("common.shareToAll")}}</a>
                <a id="common-recallFromAll" v-permission="'LICENSE_BASIC_PAID'" @click="isSelected && hasSharedToAll() && pageRecallImageFromAll()" :class="{ 'disabled-text': !isSelected || !hasSharedToAll()}" v-if="dbData.common.isAdmin">{{$t("common.recallFromAll")}}</a>
                <a id="common-changeResourceOwner" v-permission="'LICENSE_BASIC_PAID'" @click="pageChangeResourceOwner()" :class="{'disabled-text':!isSelected }">{{$t("common.changeResourceOwner")}}</a>
                <a id="common-storageMigrate" v-permission="'STORAGE-MIGRATE'" @click="isSingleSelected && canMigrate(selectedList[0]) && pageStorageMigrateImage()" :class="{'disabled-text':!isSingleSelected || !canMigrate(selectedList[0]) }">
                  {{$t("common.storageMigrate")}}
                  <help-trigger name="imageStorageMigrate" :style="{ position: 'relative', top: '0', display: 'inline-block', verticalAlign: 'middle', left: '5px' }" />
                </a>
                <a id="common-destroy" style="padding-bottom:12px;" v-permission="'IMAGE.DELETE'" @click="pageDelete()" :class="{'disabled-text': !pageCanDelete()}">{{$t("common.destroy")}}</a>
              </div>
              <div class="dropdown-content" v-if="windowData.currSelectTab == 'virtualRouterImage'" :class="{ 'show': windowData.showMoreDropdown }">
                <a id="common-enable" style="padding-top:12px;" v-permission="'IMAGE_STATE.CHANGE'" @click="!inStates('Enabled') && pageStart()" :class="{'disabled-text':!isSelected || inStates('Enabled') }">{{$t("common.enable")}}</a>
                <a id="common-disable" v-permission="'IMAGE_STATE.CHANGE'" @click="!inStates('Disabled') && pageStop()" :class="{'disabled-text':!isSelected || inStates('Disabled') }">{{$t("common.disable")}}</a>
                <a id="common-export" @click="canExport() && exportImage()" :class="{ 'disabled-text': !canExport()}">{{$t("common.export")}}</a>
                <a id="common-destroy" style="padding-bottom:12px;" v-permission="'IMAGE.DELETE'" @click="pageCanDelete() && pageDelete()" :class="{'disabled-text': !pageCanDelete()}">{{$t("common.destroy")}}</a>
              </div>
            </span>
          </drop-down>
          <span class="tab-container">
            <span class="tab-item" :class="{'active': windowData.currSelectTab === 'image'}" @click="changeTab('image')">{{$t('common.vmImage')}}</span>
            <span class="tab-item" :class="{'active': windowData.currSelectTab === 'virtualRouterImage'}" @click="changeTab('virtualRouterImage')">{{$t('common.virtualRouterImage')}}</span>
          </span>
        </el-col>
        <el-col :span="10" style="text-align: right">
          <span style="display: inline-block;">
            <el-input :placeholder="$t('common.searchPlaceholder')" v-model="searchStr" @blur="search()"
                      @change="search()">
               <el-select v-model="selectVal" slot="prepend" :placeholder="$t('common.searchLabelPlaceholder')"
                          style="width: 105px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </el-col>
      </el-row>
    </div>
    <div slot="page-table-content" style="max-height: 400px;">
      <el-table
        :data="itemList"
        @selection-change="handleSelect">
        <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection" width="50px;"></el-table-column>
        <el-table-column :label="$t('common.name')" prop="name">
          <template slot-scope="scope">
            <span class="link" @click="linkToDetail(scope.row.uuid)">{{scope.row.name}}</span>
          </template>
        </el-table-column>

        <el-table-column :label="$t('common.backupStorage')" prop="">
          <template slot-scope="scope">
            {{dbData.backupstorage[scope.row.backupStorageRefs[0].backupStorageUuid].name}}
          </template>
        </el-table-column>

        <el-table-column :label="$t('image.imageType')">
          <template slot-scope="scope">
            {{scope.row.mediaType === 'DataVolumeTemplate' ? $t('image.volumeImage') : $t('image.systemImage')}}
          </template>
        </el-table-column>

        <el-table-column :label="$t('image.mediaType')" prop="format">
        </el-table-column>

        <el-table-column :label="$t('common.state')">
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="scope.row.state"/>
          </template>
        </el-table-column>

        <el-table-column :label="$t('common.status')">
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="scope.row.status"/>
          </template>
        </el-table-column>

        <el-table-column :label="$t('common.platform')" prop="">
          <template slot-scope="scope">
          {{scope.row.mediaType === 'DataVolumeTemplate' ? '' : scope.row.platform}}
          </template>
        </el-table-column>

        <el-table-column :label="$t('common.size')" prop="">
          <template slot-scope="scope" v-if="['Downloading', 'Creating'].indexOf(scope.row.status) === -1">
            {{bytesToSize(scope.row.size)}}
          </template>
          <template slot-scope="scope" v-else>
            {{isUploading(uuid) ? $t('state.Uploading') : $t(`state.${scope.row.status}`)}}
          </template>
        </el-table-column>

        <el-table-column :label="$t('common.owner')" prop="">
          <template slot-scope="scope">
          {{getAccountName(scope.row.uuid)}}
          </template>
        </el-table-column>

        <el-table-column :label="$t('common.createDate')">
          <template slot-scope="scope">
            {{new Date(scope.row.createDate) | formatDatetime}}
          </template>
        </el-table-column>
      </el-table>

      <div class="page-table-pagination">
        <el-pagination v-if="windowData.total > 0"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="windowData.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="windowData.total"
          class="page-table-pagination"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          :current-page="windowData.pageIndex">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
  import Root from 'src/windows/Root';
  import WindowBase from 'src/windows/Window';
  import MultiSelectList from 'src/windows/Base/MultiSelectList'
  import Utils from 'src/utils/utils';
  import ImageList from 'src/ecs/image/List'
  import PageTemplate from "../../../component/PageTemplate";
  import TableBodyItemState from 'src/component/TableBodyItemState'

  export default {
    name: "ImageTabList",
    mixins: [Root,WindowBase, ImageList,MultiSelectList],
    components: {
      PageTemplate,
      TableBodyItemState
    },
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    created() {
      window.addEventListener('click', this.onWindowClick)
      this.updateWindow({
        sortBy: 'createDate',
        sortDirection: '-',
        currSelectTab: 'image',
        selectedUuidList: [],
        conditions: this.param && this.param.conditions ? this.param.conditions : [],
        methods: {
          queryList: this.queryList
        }
      }).then(() => this.queryList())

    },
    data() {
      return {
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        itemList: [],
      }
    },
    methods: {
      ...Utils,
      getCondition: function () {
        let conditionList = []
        switch (this.windowData.currSelectTab) {
          case 'image':
            conditionList = ['system=false']
            break
          case 'virtualRouterImage':
            conditionList = ['system=true']
            break
        }
        conditionList.push(`backupStorage.uuid=${this.param.backupStorageUuid}`)
        conditionList.push('status!=Deleted')
        conditionList.push('__systemTag__!=remote')
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      changeTab: function (tabName) {
        if (this.windowData.currSelectTab !== tabName) {
          this.updateWindow({
            currItemUuid: '',
            currSelectTab: tabName,
            pageIndex: 1,
            pageCount: 1,
            pageSize: 20,
            sortBy: 'createDate',
            sortDirection: '-',
            selectedUuidList: [],
            availableCount: 0
          })
          this.queryList()
        }
      },
      openImageDetail: function (uuid) {
        let dlg = 'detailImage'
        if (this.windowData.currSelectTab === 'virtualRouterImage') {
          dlg = 'VirtualRouterImageDetailDlg'
        }
        this.$router.push({name: dlg, params: { uuid: uuid }})
      },
      pageAddImage () {
        const self = this
        self.$router.push({name: 'createImage', params: { backupStorageUuid: this.param.backupStorageUuid}})
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({ showMoreDropdown: !this.windowData.showMoreDropdown })
        $event.stopPropagation()
      },
      inStates: function () {
        if (!this.isSelected) return
        let statesList = []
        if (arguments) {
          for (var i = 0; i < arguments.length; i++) {
            statesList.push(arguments[i])
          }
        }
        let selectedStatesList = []
        this.selectedList.forEach((uuid) => {
          if (this.windowData.table[uuid].selected) selectedStatesList.push(this.dbData.image[uuid].state)
        })
        let isInStates = selectedStatesList.every((item) => {
          return statesList.some((state) => { return state === item })
        })
        return isInStates
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({ showMoreDropdown: false })
      },
      //跳转到详情
      linkToDetail(uuid) {
        if(this.currSelectTab === 'image') {
          this.$router.push({name: 'detailImage', params: {uuid}})
        }else {
          this.$router.push({name: 'detailvirtualrouterimage', params: {uuid}})
        }
      }
    },
    filters: {
      dateFormat(val, fmt) { //author: meizz
        let value = new Date(val);
        var o = {
          "M+": value.getMonth() + 1,                 //月份
          "d+": value.getDate(),                    //日
          "h+": value.getHours(),                   //小时
          "m+": value.getMinutes(),                 //分
          "s+": value.getSeconds(),                 //秒
          "q+": Math.floor((value.getMonth() + 3) / 3), //季度
          "S": value.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt))
          fmt = fmt.replace(RegExp.$1, (value.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
          if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
      }
    },
    watch: {
      'windowData.pageIndex': function (newVal, oldVal) {
        let self = this;
        if (newVal !== oldVal) {
          self.queryList();
        }
      },
      'windowData.pageSize': function (newVal, oldVal) {
        let self = this;
        if (newVal !== oldVal) {
          self.queryList();
        }
      }
    }
  }
</script>

<style scoped>
  .tab-container{
     display: inline-block;
    border-radius: 3px;
    cursor: pointer;
    transition: all ease-out 0.5s;
    margin-right: 20px;
    background-color: #e9edfa;
  }
  .tab-item{
    display: inline-block;
    padding: 10px 20px;
    border-radius: 2px;
    font-size: 12px;
  }
  .active{
    background-color: #5e7ce0;
     transition: background-color cubic-bezier(0.5, 0.8, 0.5, 1) 0.5s,
      background-color ease-in 0.5s;
     color: #fff;
  }
</style>
