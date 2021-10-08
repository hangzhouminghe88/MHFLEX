<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">{{ $t('common.volume') }}{{$t("common.colon")}}</span>
          <drop-down class="detail-dropdown">
              <span slot="title">
                <span id="common-actions" class="text">{{$t('common.actions')}}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">
                  <a id="common-createVolume" v-permission="'VOLUME.CREATE'" style="padding-top: 12px;" :class="{ 'disabled-text': isSelected || !candidatePrimaryStorageToCreateVolume()}" @click="!isSelected && candidatePrimaryStorageToCreateVolume() && openCreateVolumeDlg()">{{$t("common.createVolume")}}</a>
                  <a id="common-enable" v-permission="'VOLUME.CHANGE-STATE'" @click="!isRoot() && !inStates('Enabled') && startVolume()" :class="{ 'disabled-text': isRoot() || (!isSelected ||inStates('Enabled')) }">{{$t("common.enable")}}</a>
                  <a id="common-disable" v-permission="'VOLUME.CHANGE-STATE'" @click="!isRoot() && !inStates('Disabled') && stopVolume()" :class="{ 'disabled-text':isRoot() || (!isSelected ||inStates('Disabled')) }">{{$t("common.disable")}}</a>
                  <a id="common-vm" v-permission="'VOLUME.ATTACH'" @click="canAttach() && attachToVolume()" :class="{ 'disabled-text': !canAttach()}">{{$t("common.attach")}}{{ $t("common.vm")}}</a>
                  <a id="common-vm" v-permission="'VOLUME.DETACH'" @click="!isRoot() && canDetach() && pageDetach()" :class="{ 'disabled-text': !(!isRoot() && canDetach()) }">{{$t("common.detach")}}{{ $t("common.vm")}}</a>
                  <a id="common-migrate" @click="isSingleSelected && canMigrate(selectedList[0]) && pageMigrate(selectedList[0])" :class="{'disabled-text': !(isSingleSelected && canMigrate(selectedList[0])) }">{{$t("common.migrate")}}</a>
                  <a id="common-createSnapshot" @click="!isRoot() && isSingleSelected && pageCreateVolumeSnapshot()" :class="{ 'disabled-text':!(!isRoot() && isSingleSelected) }">{{$t("common.createSnapshot")}}</a>
                  <a id="common-changeResourceOwner" v-permission="'SHARE-RESOURCE'" v-if="dbData.common.isAdmin" @click="!isRoot() && isSelected && pageChangeResourceOwner()" :class="{ 'disabled-text': !(!isRoot() && isSelected) }">{{$t("common.changeResourceOwner")}}</a>
                  <a id="volume-resizeVolume" v-permission="'VOLUME.RESIZE'" @click="canResizeVolume() && pageResizeVolume()" :class="{'disabled-text': !canResizeVolume()}">{{$t("volume.resizeVolume")}}</a>
                  <a id="common-storageMigrate" v-permission="'STORAGE-MIGRATE'" v-if="dbData.common.isAdmin" @click="isSingleSelected && canStorageMigrate() && openStorageMigrateDataVolumeDlg()" :class="{ 'disabled-text': !(isSingleSelected && canStorageMigrate())}">
                    {{ $t("common.storageMigrate") }}
                    <help-trigger name="volumeStorageMigrate" :style="{ position: 'relative', top: '0', display: 'inline-block', verticalAlign: 'middle', left: '5px' }" />
                  </a>
                  <a id="common-destroy" style="padding-bottom:12px;" v-permission="'VOLUME.DELETE'" @click="isSelected && !isRoot() && pageDelete()" :class="{ 'disabled-text': !(isSelected && !isRoot()) }">{{$t("common.destroy")}}</a>
                </div>
              </span>
          </drop-down>
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
      <el-table :data="itemList" @selection-change="handleSelect" @sort-change="handleSort">
        <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection" width="55" style="padding-left: 15px;"></el-table-column>
        <el-table-column
                :label="$t('common.name')"
                width="120"
                prop="name"
                show-overflow-tooltip
                sortable>
          <template slot-scope="scope">
            <a class="link" @click="$router.push({name:'detailVolume', params: {uuid: scope.row.uuid}})">{{scope.row.name}}</a>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.type')" prop="type">
        </el-table-column>
        <el-table-column :label="$t('common.size')" prop="size">
          <template slot-scope="scope">
            {{bytesToSize(scope.row.size)}}
          </template>
        </el-table-column>
        <el-table-column  prop="state" :label="$t('common.state')" >
          <template slot-scope="scope">
            <table-body-item-state :state="scope.row.state"></table-body-item-state>
          </template>
        </el-table-column>
        <el-table-column  prop="status" :label="$t('common.status')" >
          <template slot-scope="scope">
            <table-body-item-state :state="scope.row.status"></table-body-item-state>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.attach')" prop="">
          <template slot-scope="scope">
            {{!!dbData.volume[scope.row.uuid].vmInstanceUuid ? $t('common.yes') : $t('common.no')}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.primaryStorage')" prop="" v-if="dbData.common.isAdmin">
          <template slot-scope="scope">
            {{getPsName(scope.row.uuid)}}
          </template>
        </el-table-column>
        <el-table-column prop="createDate" :label="$t('common.createDate')"  sortable>
          <template slot-scope="scope">
            {{scope.row.createDate | dateFormat('yyyy-MM-dd hh:mm:ss')}}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-if="windowData.total  > 0"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="windowData.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="windowData.total"
              class="page-table-pagination"
              @current-change="pageCurrentChange"
              @size-change="pageSizeChange"
              :current-page="windowData.pageIndex">
      </el-pagination>
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
    </div>
  </div>
</template>

<script>
  import WindowBase from 'src/windows/Window'
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import PageTemplate from "../../../component/PageTemplate";
  import Root from 'src/windows/Root';
  import VolumeList from '../List';
  import TableBodyItemState from 'src/component/TableBodyItemState'
  import MultiSelectList from 'src/windows/Base/MultiSelectList'
  import VolumeCreateImage from "./VolumeCreateImage";
  import CreateSnapDlg from "../../../dialog/CreateSnapDlg";
  import SetVolumeQosDlg from "../../../dialog/SetVolumeQosDlg";
  import NormalVolumeConfirmDlg from "../../../dialog/NormalVolumeConfirmDlg";
  import ResizeVolumeDlg from "../../../dialog/ResizeVolumeDlg";
  import PrimaryStorageSingleDlg from "../../../dialog/PrimaryStorageSingleDlg";

  export default {
    name: "VolumeTabList",
    mixins:[Root,WindowBase,VolumeList,MultiSelectList],
    props:['param'],
    components:{
      PrimaryStorageSingleDlg,
      ResizeVolumeDlg,
      NormalVolumeConfirmDlg,
      SetVolumeQosDlg,
      CreateSnapDlg,
      VolumeCreateImage,
      PageTemplate,
      TableBodyItemState
    },
    created() {
      let primaryStorageUuid = ''
      if (this.param.primaryStorageUuid) {
        primaryStorageUuid = this.param.primaryStorageUuid
      }
      this.updateWindow({
        primaryStorageUuid,
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        conditions: this.param && this.param.conditions ? this.param.conditions : [],
        methods: {
          queryList: this.queryList
        }
      }).then(() => this.queryList())
      //window.addEventListener('resize', this.resizeHeader)
      //window.addEventListener('click', this.onWindowClick)
    },
    updated() {
    },
    destroyed() {
      //window.removeEventListener('resize', this.resizeHeader)
      //window.removeEventListener('click', this.onWindowClick)
    },
    data(){
      return{
        searchStr: '',
        selectVal: 'name',
        conditionNameList:[
          {
            name: 'common.name',
            value: 'name'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          }
        ],
        itemList: [],
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
      }
    },
    methods:{
      ...Utils,
      getCondition: function () {
        let conditionList = []
        conditionList.push(`primaryStorageUuid=${this.param.primaryStorageUuid}`)
        let conditions = this.param && this.param.conditions ? this.param.conditions : []
        conditionList = conditionList.concat(conditions)
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({ showMoreDropdown: false })
      },
      candidatePrimaryStorageToCreateVolume: function () {
        const self = this
        if (!self.param.primaryStorageUuid) return true
        else if (self.param.primaryStorageUuid) {
          if (self.dbData.common.isAdmin) {
            if (self.dbData.primarystorage[self.param.primaryStorageUuid].state === 'Enabled' && self.dbData.primarystorage[self.param.primaryStorageUuid].status === 'Connected') return true
            else return false
          } else {
            return true
          }
        }
      },
      openCreateVolumeDlg: function () {
        let self = this;
        self.$router.push({name: 'createvolume'})
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
          selectedStatesList.push(this.dbData.volume[uuid].state)
        })
        let isInStates = selectedStatesList.every((item) => {
          return statesList.some((state) => { return state === item })
        })
        return isInStates
      },
      isRoot: function () {
        let self = this
        if (!self.isSelected) return
        let state = true
        self.selectedList.forEach((uuid) => {
          if (self.dbData.volume[uuid].type === 'Data') state = false
        })
        return state
      },
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
      'dbData.volume': function (conditions, oldConditions) {
        this.$nextTick(this.resizeHeader)
      },
      'param': function (newValue, oldValue) {
        if (_.isEqual(newValue, oldValue)) return
        this.updateWindow({
          conditions: this.param && this.param.conditions ? this.param.conditions : []
        }).then(() => this.queryList())
        this.destroyDialogs()
      }
    }

  }
</script>

<style scoped>
  .dropdown {
    display: inline-block;
    position: relative;
    background: #FFFFFF;
    border: 1px solid #D7DCE2;
    border-radius: 2px;
    top: -2px;
    height: 30px;
    color: #3C73B9;
    padding-left: 10px;
    cursor: pointer;
    font-size: 0;
  }

  .dropdown .text {
    position: relative;
    top: 2px;
    font-size: 14px;
  }
</style>

