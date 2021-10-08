<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">
            {{`${$t('common.volume')}${$t('common.colon')}`}}
          </span>
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t(`common.${windowData.selectZone}`)}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a @click="changeZone('currZone')">{{$t('home.currentZone')}}</a>
                <a @click="changeZone('allZone')">{{$t('common.allZone')}}</a>
              </div>
            </span>
          </drop-down>
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
            </span>
            <span slot="content">
                <transition name="fade" type="transition" mode="out-in">
                <div class="dropdown-content" style="padding: 4px 20px;">
                  <a v-permission="'VOLUME.CHANGE-STATE'" @click="!isRoot() && !inStates('Enabled') && startVolume()" :class="{ 'disabled-text': isRoot() || !isSelected || inStates('Enabled') }">{{$t("common.enable")}}</a>
                  <a v-permission="'VOLUME.CHANGE-STATE'" @click="!isRoot() && !inStates('Disabled') && stopVolume()" :class="{ 'disabled-text':isRoot() || !isSelected || inStates('Disabled') }">{{$t("common.disable")}}</a>
                  <a style="margin-top: 12px;" v-permission="'VOLUME_VM.ATTACH'"
                     @click="canAttach() && attachToVolume()" :class="{'disabled-text': !canAttach()}"
                     v-text="$t('common.attach')"></a>
                  <a v-permission="'VOLUME_VM.DETACH'" @click="canDetach() && pageDetach()"
                     :class="{'disabled-text': !canDetach()}" v-text="$t('common.detach')"></a>
                  <a :class="{'disabled-text': !canMigrate(selectedList[0])}"
                     @click="canMigrate() && pageMigrate(selectedList[0])" v-text="$t('common.migrate')"></a>
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
                  <a @click="isSelected && pageChangeResourceOwner()" v-if="dbData.common.isAdmin" :class="{'disabled-text': !isSelected}"
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
                  <a :class="{'disabled-text': !isSelected}" @click="isSelected && pageDelete()" style="padding-bottom:12px;" v-permission="'VOLUME.DELETE'">{{$t("common.destroy")}}</a>
                </div>
              </transition>
            </span>
          </drop-down>
        </el-col>
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
        <el-table-column :label="$t('common.name')" prop="name" sortable>
          <template slot-scope="scope">
            <span @click="detailVolume(scope.row.uuid)" class="link" v-text="scope.row.name"></span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.type')" prop="type" sortable></el-table-column>
        <el-table-column :label="$t('common.size')">
          <template slot-scope="scope">
            {{scope.row.size | bytesToSize}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.state')" prop="state" sortable>
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="scope.row.state"></table-body-item-state>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.status')" prop="status" sortable>
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="scope.row.status"></table-body-item-state>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.vm')">
          <template slot-scope="scope">
            {{getAttachedVmName(scope.row)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.sharedVolume')">
          <template slot-scope="scope">
            {{scope.row.isShareable ? $t('common.true') : $t('common.no')}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.primaryStorage')" prop="primaryStorageName" sortable>
          <template slot-scope="scope">
            {{scope.row.primaryStorageName}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.owner')" prop="ownerName" sortable></el-table-column>
        <el-table-column :label="$t('common.createDate')" prop="createDate" sortable>
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
  import WindowBase from 'src/windows/Window';
  import VolumeList from 'src/ecs/volume/List';
  import TableBodyItemState from "src/component/TableBodyItemState";
  import volumeApi from '../../../../store/modules/volume/apis';
  import rpc from 'src/utils/rpc';
  import CreateTemplateNoRoute from "src/component/CreateTemplateNoRoute";
  import CreateSnapDlg from "src/dialog/CreateSnapDlg";
  import SetVolumeQosDlg from "src/dialog/SetVolumeQosDlg";
  import NormalVolumeConfirmDlg from "src/dialog/NormalVolumeConfirmDlg";
  import ResizeVolumeDlg from "src/dialog/ResizeVolumeDlg";
  import PrimaryStorageSingleDlg from "src/dialog/PrimaryStorageSingleDlg";
  export default {
    name: "VolumeForZoneTabList",
    mixins: [VolumeList, WindowBase],
    components: {
      PrimaryStorageSingleDlg,
      ResizeVolumeDlg,
      NormalVolumeConfirmDlg,
      SetVolumeQosDlg,
      CreateSnapDlg,
      CreateTemplateNoRoute, TableBodyItemState
    },
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      },
      showVolumeCreateImageFun: Function
    },
    data(){
      return {
        volumeUuidList: [],
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        selectVal: 'name',
        searchStr: '',
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
        createVolumeMessage:{},
        itemList: []
      }
    },
    computed:{
      isSelected(){
        let self = this;
        return self.windowData && self.windowData.selectedUuidList && self.windowData.selectedUuidList.length >= 1;
      },
      isSingleSelected(){
        let self = this;
        return self.windowData && self.windowData.selectedUuidList && self.windowData.selectedUuidList.length === 1;
      },
      selectedList(){
        let self = this;
        return self.windowData.selectedUuidList;
      }
    },
    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        currTab: 'available',
        pageSize: 20,
        sortBy: 'createDate',
        selectZone: 'currZone',
        showMoreZone: false,
        sortDirection: '-',
        uuid: this.param.uuid,
        selectedUuidList: [],
        methods: {
          queryList: this.init
        }
      }).then(() => {
        return this.init()
      })
    },
    methods: {
      changeZone: function (selectedZone) {
        this.updateWindow({
          selectZone: selectedZone
        }).then(this.queryList)
      },
      init () {
        return rpc.query('accounts/resources/refs', {
          q: [`accountUuid=${this.param.uuid}`, 'resourceType=VolumeVO'],
          fields: 'resourceUuid'
        })
          .then((volumeResp) => {
            if (volumeResp.inventories.length > 0) {
              this.$data.volumeUuidList = _.uniq(volumeResp.inventories.map((item) => item.resourceUuid))
            }
            return this.queryList()
          })
      },
      getCondition: function () {
        let conditionList = [], self = this;
        //if (this.windowData.selectZone === 'currZone') conditionList.push(`primaryStorage.zoneUuid=${localStorage.getItem('currZoneUuid')}`)
        conditionList.push(`uuid?=${this.$data.volumeUuidList}`)
        conditionList.push('type=Data')
        conditionList.push('status!=Deleted')
        if (self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
        }
        return conditionList
      },
      isRoot () {
        let self = this
        if (!self.isSelected) return
        let state = true
        self.selectedList.forEach((uuid) => {
          if (self.dbData.volume[uuid].type === 'Data') state = false
        })
        return state
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
      handleSelection(rows){
        let self = this, uuidList = [];
        uuidList = rows.map((row) => {
          return row.uuid;
        })
        self.updateWindow({
          selectedUuidList: uuidList
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
    },
    watch: {
      'param.showVolumeCreateImage': (newVal , oldVal) => {
        let self = this;
        if(newVal !== oldVal){
          self.showCreateImage = newVal;
        }
      }
    }
  }
</script>

<style scoped>

</style>
