<template>
  <div class="container">
    <div class="tab-drop">
      <drop-down class="detail-dropdown">
        <span slot="title">{{$t('common.actions')}}</span>
        <span slot="content">
        <div class="dropdown-content">
          <a style="margin-top: 12px;" :class="{'disabled-text': !isSingleSelected}"
              @click="isSingleSelected && updateUbsName()">{{$t('usbDevice.updateName')}}</a>
          <a :class="{'disabled-text': !hasOnState('Disabled')}" @click="hasOnState('Disabled') && enabledOrDisabled('enable')">{{$t('common.enable')}}</a>
          <a :class="{'disabled-text': !canDisable()}" @click="canDisable() && enabledOrDisabled('disable')">{{$t('common.disable')}}</a>
          <a :class="{'disabled-text': !canAttach()}" @click="canAttach() && attachVm()">{{$t('common.attach')}}</a>
          <a style="margin-bottom: 12px;":class="{'disabled-text': !canDetach()}" @click="canDetach() && detachUsb()">{{$t('common.detach')}}</a>
        </div>
      </span>
      </drop-down>
    </div>
    <el-table
      :data="itemList"
      @selection-change="handleSelect"
      border>
       <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
      <el-table-column type="selection"></el-table-column>
      <el-table-column :label="$t('usbDevice.deviceName')" resizable>
        <template slot-scope="scope">
          {{scope.row.name ? scope.row.name : ''}}
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.host')">
        <template slot-scope="scope">
          <span class="link" @click="goToHost(scope.row.hostUuid)">{{scope.row.hostName}}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.producer')">
        <template slot-scope="scope">
          {{scope.row.iManufacturer ? scope.row.iManufacturer : ''}}
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.type')">
        <template slot-scope="scope">
          {{scope.row.iProduct ? scope.row.iProduct : ''}}
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.state')">
        <template slot-scope="scope">
          <table-body-item-state slot="item" :state="scope.row.state"/>
        </template>
      </el-table-column>
      <el-table-column :label="$t('usbDevice.version')">
        <template slot-scope="scope">
          {{scope.row.usbVersion ? scope.row.usbVersion : ''}}
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.vm')">
        <template slot-scope="scope">
          <span class="link" v-if="scope.row.uuid && scope.row.vmInstanceUuid " @click="goToVm(scope.row.vmInstanceUuid)">{{scope.row.vmName}}</span>
          <span v-else>{{$t('common.noAttach')}}</span>
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
</template>

<script>
  import TableBodyItemState from "../../../component/TableBodyItemState";
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';
  import UsbList from 'src/om/usbdevice/List';
  import Root from 'src/windows/Root';

  export default {
    name: "UsbDeviceTabList",
    components: {TableBodyItemState},
    mixins: [WindowBase, UsbList, MultiSelectList, Root],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    computed: {
    },
    data(){
      return {
        itemList: []
      }
    },
    created() {
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        methods: {
          queryList: self.queryList
        }
      })
        .then(() => {
          self.queryList();
        })
    },
    methods: {
      updateUbsName() {
        let self = this, uuid;
        uuid = self.selectedList[0];
        self.openDialog('UpdateUsbDeviceNameDlg', {
          uuid,
          ok(newName) {
            self.updateName(uuid, newName);
          }
        })
      },
      enabledOrDisabled(param){
        let self = this, enabledUuidList = [], disabledUuidList = [];
        self.selectedList.forEach(uuid => {
          if(self.dbData.usbdevice[uuid].state !== 'Disabled') disabledUuidList.push(uuid);
          if(self.dbData.usbdevice[uuid].state !== 'Enabled') enabledUuidList.push(uuid);
        })
        switch (param) {
          case 'enable':
            self.enable(enabledUuidList).then(() => self.queryList());
            break;
          case 'disable':
            let uuidList = this.getAvaiableStateList('Enabled')
            let attachedUsb = this.selectedList.filter(usb => !!this.dbData.usbdevice[usb].vmInstanceUuid)
            uuidList = _.uniq(_.difference(uuidList, attachedUsb))
            if (uuidList.length > 0) {
              self.openDialog('ConfirmDlg',{
                title: 'usbDevice.action.disable',
                description: 'usbDevice.disableUsbDevice',
                uuidList: uuidList,
                icon: 'usb_popupico',
                ok: () => {
                  self.disable(uuidList).then(() => self.queryList())
                },
                getName(uuid){
                  return self.dbData.usbdevice[uuid].name;
                }
              })
            }
            break;
        }
      },
      //或得可用它usb
      getAvaiableStateList() {
        let stateList = []
        for (let i = 0; i < arguments.length; i++) {
          stateList.push(arguments[i])
        }
        const self = this
        let uuidList = []
        this.selectedList.forEach(uuid => {
          let usb = self.dbData.usbdevice[uuid]
          let usbState = usb && usb.state
          if (stateList.indexOf(usbState) > -1) uuidList.push(uuid)
        })
        return uuidList
      },
      //卸载usb
      detachUsb(){
        let self = this, uuidList=[];
        uuidList = self.selectedList;
        let vmInstanceUuid = self.dbData.usbdevice[uuidList[0]].vmInstanceUuid;
          self.openDialog('ConfirmDlg', {
          title: 'usbDevice.action.detach',
          description: 'usbDevice.detachUsbDevice',
          icon: 'usb_popupico',
          uuidList,
          getName(uuid){
            return self.dbData.usbdevice[uuid].name
          },
          ok(){
            self.dispatchActionWithEvent('usbdevice/detach', {vmUuid: vmInstanceUuid, uuid: uuidList[0]}).then(() => self.queryList())
          }
        })
      },
      //加载云主机
      attachVm(){
        let usbuuid = this.selectedList[0], self = this;
        this.openDialog('VmSingleSelectListDlg', {
          conditions: ['state?=Running,Stopped', 'type=UserVm', `hostUuid=${this.dbData.usbdevice[usbuuid].hostUuid}`],
          ok: (vmUuid) => {
            let event = self.createEvent('usbDevice.action.attachVm', this.dbData.vm[vmUuid].name);
            self.dispatchActionWithEvent('usbdevice/attach', {vmUuid, uuid: [usbuuid]}, null, event).then(() => self.queryList())
          }
        })
      },
      getCondition: function () {
        let conditionList = [], self = this;
        if (this.param.uuidList && this.param.uuidList.length > 0) {
          conditionList.push(`hostUuid?=${this.param.uuidList.join()}`)
        }
        if (this.param.conditions) conditionList = conditionList.concat(this.param.conditions)
        if (self.param.selectVal !== '' && self.param.searchStr !=='') {
          conditionList = conditionList.concat(`${self.param.selectVal}~=%25${self.param.searchStr}%25`)
        }
        return conditionList
      },
      //回到物理机详情
      goToHost(uuid){
        let self = this;
        self.$router.push({name: 'detailHost', params: {uuid}})
      },
      //回到云主机详情
      goToVm(uuid){
        let self = this;
        self.$router.push({name: 'detailVm', params: {uuid}})
      },
    },
    watch: {
      'param.searchStr': function(newVal ,oldVal){
        let self = this;
        if(newVal !== oldVal){
          self.updateWindow({
            pageIndex: 1
          })
            .then(() => {
              self.queryList();
            })
        }
      },
      'param.selectVal': function(newVal ,oldVal){
        let self = this;
        if(newVal !== oldVal){
          self.updateWindow({
            pageIndex: 1
          })
            .then(() => {
              self.queryList();
            })
        }
      },
    }
  }
</script>

<style scoped>
  .tab-drop {
    display: inline-block;
    position: absolute;
    top: 15px;
    left: 323px;
  }
</style>
