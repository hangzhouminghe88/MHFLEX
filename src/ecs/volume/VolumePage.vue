<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">{{$t('common.volume')}}</span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs @tab-click="setTabVal" v-model="currTab">
             <el-tab-pane :label="`${$t('common.available')}(${availableCount})`" name="available"></el-tab-pane>
             <el-tab-pane :label="`${$t('common.NotInstantiated')}(${notInstantiatedCount})`" name="notInstantiated"></el-tab-pane>
             <el-tab-pane :label="`${$t('common.destroyed')}(${destroyedCount})`" name="destroyed"></el-tab-pane>
           </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row style="flex-wrap: nowrap;" type="flex">
        <div style="flex-shrink: 0;">
          <span @click="$router.push({name:'createvolume'})" class="btn-success" v-if="currTab === 'available'"><i
            class="el-icon-plus icon"></i>{{$t('common.createVolume')}}</span>
          <span class="btn-primary" v-if="currTab.includes('available') || currTab.includes('notInstantiated')" :class="{'disabled': !canStart()}" @click.stop="canStart() && startVolume()"><i
            class="el-icon-caret-right icon"></i>{{$t('vm.start')}}</span>
          <span class="btn-primary" v-if="currTab.includes('available') || currTab.includes('notInstantiated')" :class="{'disabled': !canStop()}" @click.stop="canStop() && stopVolume()"><i
            class="el-icon-remove-outline icon"></i>{{$t('vm.stop')}}
          </span>
          <drop-down :class="{'disabled': !isSelected}" :enabled="isSelected" class="btn-primary more dropdown"
                     v-if="currTab.includes('available') || currTab.includes('notInstantiated')">
            <span slot="title">
               <i class="el-icon-more"></i>
               <span class="text">{{ $t("common.moreActions") }}</span>
            </span>
            <span slot="content">
              <transition name="fade" type="transition" mode="out-in">
                <div class="dropdown-content" style="padding: 4px 20px;" v-if="currTab === 'available'">
                  <a style="margin-top: 12px;" v-permission="'VOLUME_VM.ATTACH'" @click="canAttach() && attachToVolume()" :class="{'disabled-text': !canAttach()}" v-text="$t('common.attach')"></a>
                  <a v-permission="'VOLUME_VM.DETACH'" @click="canDetach() && pageDetach()" :class="{'disabled-text': !canDetach()}" v-text="$t('common.detach')"></a>
                  <a :class="{'disabled-text': !canMigrate(selectedList[0])}"
                     @click="canMigrate() && pageMigrate(selectedList[0])" v-text="$t('common.migrate')"></a>
                  <a v-if="getLicenseCapability('LICENSE_BASIC_PAID')" @click="openAttachTagPanel()">{{ $t("tag.attach") }}</a>
                  <a :class="{'disabled-text': !canDetachTag()}" @click="openDetachTagPanel()"
                     v-if="getLicenseCapability('LICENSE_BASIC_PAID')">{{ $t("tag.detach") }}</a>
                  <a :class="{'disabled-text': !canCreateImage()}" @click="canCreateImage() && createVolumeImage()"
                     v-permission="'IMAGE_DATA-VOLUME-TEMPLATE.CREATE'">
                       {{$t("volume.createImage")}}
                      <help-trigger
                        :style="{ position: 'relative', top: '0', display: 'inline-block', verticalAlign: 'middle', left: '5px' }"
                        name="createVolumeImage"/>
                  </a>
                  <a :class="{'disabled-text': !canCreateSnapshot()}"
                     @click="canCreateSnapshot() && pageCreateVolumeSnapshot()"
                     v-permission="'VOLUME_VOLUME-SNAPSHOT.CREATE'">
                     {{$t("common.createSnapshot")}}
                    <help-trigger
                      :style="{ position: 'relative', top: '0', display: 'inline-block', verticalAlign: 'middle', left: '5px' }"
                      name="createSnapshot"/>
                  </a>
                  <a :class="{ 'disabled-text': !canSetQos() }" @click="canSetQos() && pageSetVolumeQos()"
                     v-permission="['VOLUME.SET_VOLUME_QOS', 'LICENSE_BASIC_PAID']">{{ $t("vm.setVolumeQos") }}</a>
                  <a :class="{ 'disabled-text': !isSingleSelected || !isSetVolumeQos() }"
                     @click="isSingleSelected && isSetVolumeQos() && pageCancelVolumeQos()"
                     v-permission="['VOLUME.DELETE_VOLUME_QOS', 'LICENSE_BASIC_PAID']">{{ $t("vm.cancelVolumeQos") }}</a>
                  <a @click="pageChangeResourceOwner()" v-if="dbData.common.isAdmin"
                     v-permission="'LICENSE_BASIC_PAID'">{{$t("common.changeResourceOwner")}}</a>
                  <a :class="{'disabled-text': !canResizeVolume()}" @click="canResizeVolume() && pageResizeVolume()"
                     v-permission="['VOLUME.RESIZE_DATA_VOLUME', 'LICENSE_BASIC_PAID']">{{$t("volume.resizeVolume")}}</a>
                   <a :class="{ 'disabled-text': !(isSingleSelected && canStorageMigrate())}"
                      @click="isSingleSelected && canStorageMigrate() && openStorageMigrateDataVolumeDlg()"
                      v-if="dbData.common.isAdmin" v-permission="'LICENSE_BASIC_PAID'">
                     {{ $t("common.storageMigrate") }}
                    <help-trigger
                      :style="{ position: 'relative', top: '0', display: 'inline-block', verticalAlign: 'middle', left: '5px' }"
                      name="volumeStorageMigrate" triangle="bottom"/>
                  </a>
                  <a @click="pageDelete()" style="padding-bottom:12px;" v-permission="'VOLUME.DELETE'">{{$t("common.destroy")}}</a>
                </div>
                <div class="dropdown-content"  style="padding: 4px 20px;" v-if="currTab === 'notInstantiated'">
                  <a v-permission="'VOLUME.ATTACH'" @click="canAttach() && attachToVolume()" :class="{'disabled-text': !canAttach()}">{{$t("common.attach")}}</a>
                  <a v-if="getLicenseCapability('LICENSE_BASIC_PAID')" @click="openAttachTagPanel()">{{ $t("tag.attach") }}</a>
                  <a v-if="getLicenseCapability('LICENSE_BASIC_PAID')" @click="openDetachTagPanel()" :class="{'disabled-text': !canDetachTag()}">{{ $t("tag.detach") }}</a>
                  <a v-permission="['VOLUME.SET_VOLUME_QOS', 'LICENSE_BASIC_PAID']" @click="canSetQos() && pageSetVolumeQos()" :class="{ 'disabled-text': !canSetQos() }">{{ $t("vm.setVolumeQos") }}</a>
                  <a v-permission="['VOLUME.DELETE_VOLUME_QOS', 'LICENSE_BASIC_PAID']" @click="isSingleSelected && isSetVolumeQos() && pageCancelVolumeQos()" :class="{ 'disabled-text': !isSingleSelected || !isSetVolumeQos() }">{{ $t("vm.cancelVolumeQos") }}</a>
                  <a v-if="dbData.common.isAdmin && !(windowData.currTab == 'notInstantiated')" @click="pageChangeResourceOwner()">{{$t("common.changeResourceOwner")}}</a>
                  <a v-permission="'VOLUME.DELETE'" @click="pageDelete">{{$t("common.destroy")}}</a>
                </div>
              </transition>
            </span>
          </drop-down>
          <create-snap-dlg :message="createSnapMessage" :model="showCreateSnap" @close="closeCreateSnapDlg"
                           v-if="showCreateSnap"/>
          <set-volume-qos-dlg :message="setVolumeQosMessage" :model="showSetVolumeQosDlg" @close="closeSetVolumeQosDlg"
                              v-if="showSetVolumeQosDlg"/>
          <normal-volume-confirm-dlg :message="normalMessage" :model="showNormalVolumeConfirmDlg"
                                     @close="closeNormalDlg" v-if="showNormalVolumeConfirmDlg"/>
          <resize-volume-dlg :message="resizeVolumeMessage" :model="showResizeVolumeDlg" @close="closeVolumeDlg"
                             v-if="showResizeVolumeDlg"/>
          <primary-storage-single-dlg :message="primarySingleMessage" :model="showPrimarySingleDlg"
                                      @close="closePrimarySingleDlg" v-if="showPrimarySingleDlg"/>
          <span :class="{ 'disabled': !isSelected}" @click="isSelected && pageRecover()" class="btn-primary"
                v-if="currTab.includes('destroyed')"><i
            class="el-icon-d-arrow-left icon"></i>{{$t('common.recover')}}
          </span>
          <span :class="{ 'disabled': !isSelected }" @click="isSelected && expungeVolume()" class="btn-primary"
                v-if="currTab.includes('destroyed')"><i
            class="el-icon-remove-outline icon"></i>{{$t('common.expunge')}}
          </span>
        </div>
        <div style="flex-shrink: 1; flex-grow: 1; min-width: 0px;">
          <page-toolbar-tag :param="getPageToolbarTagParam()"/>
        </div>
        <div :span="10" style="text-align: right; flex-shrink: 0;">
          <span style="padding: 0 15px;display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
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
    <div slot="page-table-content">
      <el-table
        :data="itemList"
        @selection-change="handleSelection"
        @sort-change="handleSort"
        ref="multipleTable"
        style="width: 100%"
        tooltip-effect="dark"
        v-loading="windowData.loading"
       >
        <span slot="empty" class="table-nodata">
          <p class="empty-text" v-text="$t('common.noData')"></p>
        </span>
        <el-table-column
          type="selection"
          width="55"></el-table-column>
        <el-table-column :label="$t('common.name')" prop="name" sortable  show-overflow-tooltip>
          <template slot-scope="scope">
            <span @click="detailVolume(scope.row.uuid)" class="link" v-text="scope.row.name"></span>
          </template>
        </el-table-column>
        <el-table-column show-tooltip-when-overflow>
          <div slot="header" style="height: 37px;">
            <el-dropdown>
              <span>
                {{getTagTypeHeaderParam().getTitle()}}<i class="el-icon-caret-bottom"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="(item, index) in getTagTypeHeaderParam().getItemList()"
                                  :key="index"
                                  @click.native="getTagTypeHeaderParam().onSelect(index)">{{$t(item.text)}}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <template slot-scope="scope" show-tooltip-when-overflow>
            <table-body-item-tag :param="getTagParam(scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.type')" prop="type" sortable show-tooltip-when-overflow></el-table-column>
        <el-table-column :label="$t('common.size')">
          <template slot-scope="scope">
            {{scope.row.size | bytesToSize}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.state')" prop="state" sortable show-tooltip-when-overflow>
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="scope.row.state"></table-body-item-state>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.status')" prop="status" sortable show-tooltip-when-overflow>
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="scope.row.status"></table-body-item-state>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.vm')"  show-overflow-tooltip>
          <template slot-scope="scope">
            {{getAttachedVmName(scope.row)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.sharedVolume')" show-tooltip-when-overflow>
          <template slot-scope="scope">
            {{scope.row.isShareable ? $t('common.true') : $t('common.no')}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.primaryStorage')" prop="primaryStorageName" sortable show-tooltip-when-overflow>
          <template slot-scope="scope">
            {{scope.row.primaryStorageName}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.owner')" prop="ownerName" sortable show-tooltip-when-overflow></el-table-column>
        <el-table-column :label="$t('common.createDate')" prop="createDate" sortable  show-overflow-tooltip>
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
      <volume-create-image :param="createVolumeMessage" @close="closeCreateImage"
                           v-if="showCreateVolumeImage"></volume-create-image>
    </div>
  </page-template>
</template>

<script>
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from 'src/windows/Window';
  import VolumeList from 'src/ecs/volume/List';
  import TableBodyItemTag from "../../component/TableBodyItemTag";
  import TableBodyItemState from "../../component/TableBodyItemState";
  import volumeApi from '../../../store/modules/volume/apis';
  import rpc from 'src/utils/rpc';
  import CreateTemplateNoRoute from "../../component/CreateTemplateNoRoute";
  import VolumeCreateImage from "./component/VolumeCreateImage";
  import CreateSnapDlg from "../../dialog/CreateSnapDlg";
  import SetVolumeQosDlg from "../../dialog/SetVolumeQosDlg";
  import NormalVolumeConfirmDlg from "../../dialog/NormalVolumeConfirmDlg";
  import ResizeVolumeDlg from "../../dialog/ResizeVolumeDlg";
  import PrimaryStorageSingleDlg from "../../dialog/PrimaryStorageSingleDlg";
  import PageBase from 'src/windows/PageBase';
  import PageToolbarTag from "../../component/PageToolbarTag";

  export default {
    name: "VolumeList",
    mixins: [VolumeList, WindowBase, PageBase],
    components: {
      PageToolbarTag,
      PrimaryStorageSingleDlg,
      ResizeVolumeDlg,
      NormalVolumeConfirmDlg,
      SetVolumeQosDlg,
      CreateSnapDlg,
      VolumeCreateImage, CreateTemplateNoRoute, TableBodyItemState, TableBodyItemTag, PageTemplate
    },
      data(){
        return {
          currTab: 'available',
          searchStr: '',
          selectVal: 'name',
          availableCount: 0,
          destroyedCount: 0,
          notInstantiatedCount: 0,
          conditionNameList: [
            {name: 'common.name', value: 'name'},
            {name: "common.uuid", value: 'uuid'}
          ],
          selectedUuidList: [],
          showCreateVolumeImage: false,
          showCreateSnap: false,
          createSnapMessage: {},
          showSetVolumeQosDlg: false,
          setVolumeQosMessage: {},
          showNormalVolumeConfirmDlg: false,
          normalMessage: {},
          showResizeVolumeDlg: false,
          resizeVolumeMessage: {},
          showPrimarySingleDlg: false,
          primarySingleMessage: {},
          itemList: []
        }
      },
    created() {
      let self = this;
      this.updateWindow({
          pageIndex: 1,
          pageSize: 10,
          sortBy: 'createDate',
          sortDirection: '-',
          loading: false,
          methods: {
            queryList: self.queryList
          }
        })
        .then(() => {
          self.getIsOpensource()
        })
          .then(()=>{
            return self.queryList()
          })
        .then(() => {
          self.updateCount();
        });
      },
      computed:{
        isSelected(){
          let self = this;
          return self.windowData && self.selectedUuidList && self.selectedUuidList.length >= 1;
        },
        isSingleSelected(){
          let self = this;
          return self.windowData && self.selectedUuidList && self.selectedUuidList.length === 1;
        },
        selectedList(){
          let self = this;
          return self.selectedUuidList;
        }
      },
      methods: {
        //查询是否是开放资源
        getIsOpensource() {
          return rpc.query('licenses').then(licensesResp => {
            return rpc.query('meta-data/opensource').then(opensourceResp => {
              let isOpensource = false;
              if (opensourceResp.opensource || licensesResp.inventory.licenseType === 'Community') {
                isOpensource = true
              }
              return this.updateDbObject({
                name: 'common',
                data: {
                  isOpensource
                }
              })
            })
          })
        },
        setTabVal(tab){
          let self = this;
          if(_.isEqual(tab.name)) return;
           self.currTab = tab.name;
           self.queryList()
             .then(() => {
               self.updateCount();
             });
        },
        search(){
          let self = this;
          this.updateWindow({
            pageIndex: 1,
          })
            .then(() => {
              self.queryList();
            })
        },
        refresh(){
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
        updateCount () {
          volumeApi.query({
            q: this.getAvailableCondition(),
            count: true
          }).then(resp => {
            this.availableCount = resp.total
          });

          volumeApi.query({
            q: this.getNotInstantiatedCondition(),
            count: true
          }).then(resp => {
            this.notInstantiatedCount = resp.total
          });

          volumeApi.query({
            q: this.getDeletedCondition(),
            count: true
          }).then(resp => {
            this.destroyedCount = resp.total
          })
        },
        getAvailableCondition () {
          let conditionList = [];
          conditionList = conditionList.concat(['status!=Deleted', 'status!=NotInstantiated', 'type=Data', `primaryStorage.zone.uuid=${window.localStorage.getItem('currZoneUuid')}`, 'format!=vmtx']);
          if (this.getTagCondtion) {
            conditionList = conditionList.concat(this.getTagCondtion())
          }
          conditionList = conditionList.concat(this.getSearchCondition());
          return conditionList
        },
        getNotInstantiatedCondition () {
          let conditionList = [];
          conditionList = conditionList.concat('status=NotInstantiated', 'type=Data');
          if (this.getTagCondtion) {
            conditionList = conditionList.concat(this.getTagCondtion())
          }
          conditionList = conditionList.concat(this.getSearchCondition());
          return conditionList
        },
        getDeletedCondition () {
          let conditionList = [];
          conditionList = conditionList.concat(['status=Deleted', 'type=Data', `primaryStorage.zone.uuid=${window.localStorage.getItem('currZoneUuid')}`, 'format!=vmtx']);
          if (this.getTagCondtion) {
            conditionList = conditionList.concat(this.getTagCondtion())
          }
          conditionList = conditionList.concat(this.getSearchCondition());
          return conditionList
        },
        getCondition: function () {
          let funMap = {
            'available': this.getAvailableCondition,
            'notInstantiated': this.getNotInstantiatedCondition,
            'destroyed': this.getDeletedCondition
          };
          return funMap[this.currTab]()
        },
        handleSelection(row){
          let self = this;
          self.selectedUuidList = row.map((item) => {
            return item.uuid;
          });
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
      },
      watch: {
        'dbData.volume': function (newVal, oldVal) {
          this.updateCount();
        }
      }
    }
</script>

<style scoped>

</style>
