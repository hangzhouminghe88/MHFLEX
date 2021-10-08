<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">
            {{`${$t('common.volume')}${$t('common.colon')}`}}
            <help-trigger name="volume" :style="{ position: 'absolute', top: 0, right: '2px' }"/>
          </span>
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a  style="padding-top: 12px;" @click="!isSelected && !inStates('Paused') && volumeCreate()" :class="{'disabled-text':isSelected || inStates('Paused')}">{{ $t("common.create") }}</a>
                <a v-permission="'VOLUME.ATTACH'" @click="!isSelected && !inStates('Paused') && !isRootVolume() && volumeAttach()" :class="{ 'disabled-text': !(!isSelected && !inStates('Paused') && !isRootVolume()) }">{{ $t("common.attach") }}</a>
                <a v-permission="'VOLUME.DETACH'" @click="canDetachList() && volumeDetach()" :class="{ 'disabled-text': !canDetachList() || inStates('Paused') }">{{ $t("common.detach") }}</a>
                <a v-permission="'VOLUME.RESIZE'" @click="canResizeVolume() && resizeVolume()" :class="{ 'disabled-text':  !canResizeVolume() }">{{ $t("volume.resizeVolume") }}</a>
                <a @click="canCreateImage() && createVolumeImage()" :class="{ 'disabled-text': !canCreateImage()}">{{$t("volume.createImage")}}</a>
                <a v-permission="'VOLUME.SET-VOLUME.QOS'" @click="canSetQos() && detailSetVolumeQos()" :class="{ 'disabled-text': !canSetQos() }">{{ $t("vm.setVolumeQos") }}</a>
                <a v-permission="'VOLUME.SET-VOLUME.QOS'" @click="canRemoveQos() && isSetVolumeQos() && detailCancelVolumeQos()" :class="{'disabled-text': !canRemoveQos()}">{{ $t("vm.cancelVolumeQos") }}</a>
                <a style="padding-bottom:12px;" v-permission="'VOLUME.DELETE'" @click="canDeleteList() && detailDeleteVolume()" :class="{ 'disabled-text': !canDeleteList() }">{{ $t("common.destroy") }}</a>
              </div>
            </span>
          </drop-down>
        </el-col>
      </el-row>
    </div>
    <resize-volume-dlg v-if="showResizeVolumeDlg" :model="showResizeVolumeDlg" :message="resizeVolumeMessage" @close="closeResizeVolumeDlg"/>
    <set-volume-qos-dlg v-if="showSetVolumeQosDlg" :model="showSetVolumeQosDlg" :message="volumeQosMessage" @close="closeVolumeQosDlg"/>
    <normal-volume-confirm-dlg v-if="showNormalVolumeConfirmDlg" :model="showNormalVolumeConfirmDlg" :message="normalVolumeConfirmMessage" @close="closeNormalVolumeDlg"/>
    <attach-volume-select-dlg v-if="showAttachVolumeDlg" :model="showAttachVolumeDlg" :message="attachVolumeMessage" @close="closeAttachVolumeDlg"/>
    <el-table
    :data="itemList"
    @sort-change="handleSortChange"
    @selection-change="handleSelectChange">
      <span slot="empty" class="table-nodata">
        <p class="empty-text" v-text="$t('common.noData')"></p>
      </span>
      <el-table-column type="selection"></el-table-column>
      <el-table-column :label="$t('common.name')"
        prop="name" sortable  show-overflow-tooltip>
        <template slot-scope="scope">
          <div class="link" @click="goToVolume(scope.row.uuid)">{{scope.row.name}}</div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.type')"
      prop="type"></el-table-column>
      <el-table-column :label="$t('common.size')">
        <template slot-scope="scope">
          {{bytesToSize(scope.row.size)}}
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.state')"
        prop="state" sortable>
        <template slot-scope="scope">
          <table-body-item-state  :state="dbData.volume[scope.row.uuid].state"/>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.status')"
        prop="status" sortable>
        <template slot-scope="scope">
          <table-body-item-state :state="dbData.volume[scope.row.uuid].status"/>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.sharedVolume')">
        <template slot-scope="scope">
          {{dbData.volume[scope.row.uuid].isShareable ? $t('common.yes') : $t('common.no')}}
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.primaryStorage')">
        <template slot-scope="scope">
          {{getPsName(scope.row.uuid)}}
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.createDate')"
      prop="createDate" sortable  show-overflow-tooltip>
        <template slot-scope="scope">
          {{formatDatetime(new Date(scope.row.createDate))}}
        </template>
      </el-table-column>
    </el-table>
    <!--<div class="page-table-pagination">-->
      <!--<el-pagination-->
        <!--:page-sizes="[10, 20, 50, 100]"-->
        <!--:page-size="windowData.pageSize"-->
        <!--layout="total, sizes, prev, pager, next, jumper"-->
        <!--:total="windowData.total"-->
        <!--class="page-table-pagination"-->
        <!--@current-change="pageCurrentChange"-->
        <!--@size-change="pageSizeChange"-->
        <!--:current-page="windowData.pageIndex">-->
      <!--</el-pagination>-->
    <!--</div>-->
  </div>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import VolumeList from 'src/ecs/volume/List';
  import Utils from 'src/utils/utils';
  import TableBodyItemState from "../../../component/TableBodyItemState";
  import ResizeVolumeDlg from "../../../dialog/ResizeVolumeDlg";
  import SetVolumeQosDlg from "../../../dialog/SetVolumeQosDlg";
  import NormalVolumeConfirmDlg from "../../../dialog/NormalVolumeConfirmDlg";
  import DataVolumeInstanceOfferSingleDlg from "../../../dialog/DataVolumeInstanceOfferSingleDlg";
  import AttachVolumeSelectDlg from "../../../dialog/AttachVolumeSelectDlg";

  export default {
    name: "VolumeTabList",
    components: {
      AttachVolumeSelectDlg,
      DataVolumeInstanceOfferSingleDlg,
      NormalVolumeConfirmDlg, SetVolumeQosDlg, ResizeVolumeDlg, TableBodyItemState},
    mixins: [WindowBase, VolumeList],
    props: {
      param: {
        type: Object,
        default: {}
      }
    },
    data() {
      return {
        showResizeVolumeDlg: false,
        resizeVolumeMessage: {},
        showSetVolumeQosDlg: false,
        volumeQosMessage: {},
        showNormalVolumeConfirmDlg: false,
        normalVolumeConfirmMessage: {},
        showAttachVolumeDlg: false,
        attachVolumeMessage: {},
        super: {},
        itemList: []
      }
    },
    created(){
      let self = this;
      this.super.queryList = VolumeList.methods.queryList.bind(this)
      self.updateWindow({
        vmInstanceUuid: self.param.uuid,
        sortBy: 'createDate',
        sortDirection: '-',
        selectUuidList: [],
        selectList: [],
        methods: {
          queryList: self.queryList
        }
      })
        .then(() => {
          self.queryList();
        })
    },
    methods: {
      ...Utils,
      queryList () {
        let volumeList = []
        let taskList = []
        let p = rpc.query('volumes', {
          q: `vmInstanceUuid=${this.windowData.vmInstanceUuid}`,
          fields: 'uuid'
        }).then((resp) => {
          volumeList = volumeList.concat(resp.inventories)
        })
        taskList.push(p)
        p = rpc.query('volumes/vm-instances/refs', {
          q: `vmInstanceUuid=${this.windowData.vmInstanceUuid}`,
          fields: 'volumeUuid'
        }).then((resp) => {
          resp.inventories.forEach((item) => {
            item.uuid = item.volumeUuid
            delete item.volumeUuid
          })
          volumeList = volumeList.concat(resp.inventories)
        })
        taskList.push(p)
        Promise.all(taskList).then(() => {
          _.uniqBy(volumeList, 'uuid')
          this.volumeList = volumeList
          return this.super.queryList()
        })
      },
      //查询条件
      getCondition() {
        let conditionList = []
        let volumeUuidList = this.volumeList.map((item) => item.uuid)
        conditionList.push(`uuid?=${volumeUuidList}`)
        return conditionList
      },
      //创建云盘
      volumeCreate() {
        let self = this;
        self.$router.push({name: 'createvolume'})
      },
      //创建云盘镜像
      createVolumeImage(){
        let self = this;
        let volumeUuid = self.selectedList[0]
        // let volume = self.volume[volumeUuid]
        let volume = _.get(self.volume, `${volumeUuid}`)
        // let volumeType = volume && volume.type
        let volumeType = _.get(self.volume, `${volumeUuid}.type`)
        // let primaryStorage = volume && volume.primaryStorageUuid && self.dbData.primarystorage[volume.primaryStorageUuid]
        let primaryStorageType = _.get(self.dbData.primarystorage, `${volume.primaryStorageUuid}.type`)
        if (_.includes(['Ceph'], primaryStorageType)) {
          let availableBackupStorageUuidList = []
          let zql = "query BackupStorage where uuid in (query BackupStorage.uuid where type='ImageStoreBackupStorage') or uuid in (query CephBackupStorage.uuid where type='Ceph' and fsid in (query CephPrimaryStorage.fsid where uuid='" + `${volume.primaryStorageUuid}` + "'))"
          let tasks = []
          let p = rpc.query('/zql', {
            zql: encodeURIComponent(zql)
          }).then((resp) => {
            if (resp.results && resp.results.length > 0) {
              availableBackupStorageUuidList = _.map(resp.results[0].inventories, (item) => item.uuid)
            }
          })
          tasks.push(p)
          return Promise.all(tasks).then(() => {
            let volumeMessage = {
              volumeType,
              availableBackupStorageUuidList: availableBackupStorageUuidList,
              primaryStorageType,
              volumeUuid,
            }
            self.param.showCreateVmImage(volumeMessage)
          })
        } else {
          let volumeMessage = {
            volumeType,
            primaryStorageType,
            volumeUuid,
          }
          self.param.showCreateVmImage(volumeMessage);
        }
      },
      pageSizeChange(val) {
        this.updateWindow({
          pageSize: val
        })
      },
      pageCurrentChange(val) {
        this.updateWindow({
          pageIndex: val
        })
      },
      //加载云盘
      volumeAttach(){
        let self = this;
        self.attachVolumeMessage ={
          uuid: [self.windowData.vmInstanceUuid],
          type: 'load'
        }
        self.showAttachVolumeDlg = true;
      },
      //卸载云盘
      volumeDetach() {
        let self = this;
        self.normalVolumeConfirmMessage = {
          uuidList: self.selectedList,
          confirmType: 'detach'
        }
        self.showNormalVolumeConfirmDlg = true;
      },
      //云盘扩容
      resizeVolume() {
        let self = this;
        let uuid = self.selectedList[0]
        let volume = self.dbData.volume[uuid];
        self.resizeVolumeMessage = {
          volume
        }
        self.updateWindow({
          volume
        })
        self.showResizeVolumeDlg = true;
      },
      //设置云盘Qos
      detailSetVolumeQos() {
        let self = this;
        self.volumeQosMessage = {
          uuidList: self.windowData.selectUuidList
        }
        self.showSetVolumeQosDlg = true;
      },
      //取消云盘Qos
      detailCancelVolumeQos(){
        let self = this;
        self.normalVolumeConfirmMessage = {
          confirmType: 'cancelQos',
          uuidList: self.windowData.selectUuidList,
        }
        self.showNormalVolumeConfirmDlg = true;
      },
      //删除云盘
      detailDeleteVolume(){
        let uuidList = this.selectedList;
        let self = this;
        if (uuidList.length === 0) return;
        self.normalVolumeConfirmMessage ={
          confirmType:'delete',
          uuidList
        }
        self.showNormalVolumeConfirmDlg = true;
      },
      //云盘扩容回调
      closeResizeVolumeDlg(param) {
        let self = this;
        if(param){
          if (self.windowData.volume.type === 'Root') {
            return self.resizeRootVolume(param.uuid, param.size).then(() => {
              self.queryList();
              return self.refresh()
            })
          } else {
            return self.resizeVolume(param.uuid, param.size).then(() => {
              self.queryList();
              return self.refresh()
            })
          }
        }
        self.showResizeVolumeDlg = false;
      },
      //设置云盘Qos回调
      closeVolumeQosDlg(param) {
        let self = this, uuidList = [];
        self.windowData.selectUuidList.forEach((uuid) => {
          if (self.dbData.volume[uuid].vmInstanceUuid) {
            uuidList.push(uuid)
          }
        })
        let p = null, tasks = [];
        if(param){
           param.msg.forEach((msg) => {
            self.setVolumeQos(msg, param.uuidList)
           })
        }
        self.showSetVolumeQosDlg = false;
      },
      //取消云盘os回调
      closeNormalVolumeDlg(param){
        let self = this;
          if(param){
            switch (param.type) {
              case 'cancelQos':
                self.cancelVolumeQos(param.uuidList).then(() => {
                  self.$forceUpdate()
                });
              case 'delete':
                self.delete(param.uuidList)
                  .then(() => {
                    self.queryList();
                    self.param.refresh()
                  });
              case 'detach':
                let normalVolumeList = _.filter(param.uuidList, it => !self.volume[it].isShareable)
                let shareableVolumeList = _.filter(param.uuidList, it => self.volume[it].isShareable)
                let tasks = []
                if (normalVolumeList.length > 0) {
                  let p = self.detach(normalVolumeList)
                  tasks.push(p)
                }
                if (shareableVolumeList.length > 0) {
                  let p = self.detachSharebelVolume(shareableVolumeList, [self.windowData.vmInstanceUuid])
                  tasks.push(p)
                }
                Promise.all(tasks).then(() => {
                  self.param.refresh()
                  this.queryList()
                })
               break;
            }
        }
        self.showNormalVolumeConfirmDlg = false;
      },
      //卸载云盘回调
      closeAttachVolumeDlg(param) {
        let self = this;
        if(param){
          self.multipleAttachToVm(param.volumeUuidList, self.windowData.vmInstanceUuid)
            .then(() =>{
              self.queryList();
              self.param.refresh();
            })
        }
        self.showAttachVolumeDlg = false;
      },
      //表格排序
      handleSortChange(row) {
        let self = this;
        if (row) {
          let sortDirection = row.order === 'ascending' ? '+' : '-';
          self.updateWindow({
            sortDirection: sortDirection,
            sortBy: row.prop
          }).then(() => {
            self.queryList();
          })
        }
      },
      //判断选中的云盘是否是root盘
      isRootVolume(){
        let self = this;
        if(self.isSelected && self.windowData.selectUuidList){
          return self.windowData.selectUuidList.some((uuid) => this.dbData.volume[uuid].type === 'Root')
        }
        return false;
      },
      //是否可以设置Qos，如果不是单选或者状态为停止的时候不能设置
      canSetQos () {
        if (!this.isSingleSelected || this.inStates('Paused')) return false
        let volume = this.dbData.volume[this.selectedList[0]]
        return volume && !volume.isShareable
      },
      //判断操作权限
      inStates () {
        let stateList = []
        for (let i = 0; i < arguments.length; i++) {
          stateList.push(arguments[i])
        }
        let uuid = this.windowData.vmInstanceUuid
        let resp = false
        if(!this.dbData.vm[uuid] || !this.dbData.vm[uuid].state) return false;
        if (!stateList.every((item, index, array) => { return item !== this.dbData.vm[uuid].state })) resp = true
        return resp
      },
      //表格多选
      handleSelectChange(row) {
        let self = this, selectUuidList = [];
        selectUuidList = row.map((item) => {
          return item.uuid
        });
        self.updateWindow({
          selectList: row,
          selectUuidList: selectUuidList
        })
      },
      //是否可以扩容
      canResizeVolume () {
        if (!this.isSingleSelected) return false
        return !this.inStates('Stopped')
      },
      goToVolume(uuid){
        let self = this;
        self.$router.push({name: 'detailVolume', params: {uuid: uuid}})
      }
    },
    computed: {
      itemVolumeDateList() {
        if(!_.isArray(this.windowData.uuidList)) return;
        this.windowData.uuidList = this.windowData.uuidList.filter((uuid) => this.dbData.volume[uuid]);
        return this.windowData.uuidList.map((uuid) =>{
          return this.dbData.volume[uuid];
        })
      },
      //判断是否选中
      isSelected () {
        let self = this;
        if (self.windowData.selectUuidList.length <= 0) return false;
        return true;
      },
      isSingleSelected() {
        let self = this;
        if (self.windowData.selectUuidList.length !== 1) return false;
        return self.windowData.selectUuidList.length === 1;
      },
      selectedList() {
        let self = this;
        if(self.windowData)
           return self.windowData.selectUuidList;
        return [];
      }
    },
    watch: {
      'param': function (newValue, oldValue) {
        if (newValue.uuid !== oldValue.uuid) {
          this.updateWindow({
            vmInstanceUuid: this.param.uuid
          })
          .then(() => {
             return this.refresh()
          })
        }
      }
    }
  }
</script>

<style scoped>

</style>
