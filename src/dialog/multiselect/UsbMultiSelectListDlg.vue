<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span>{{ $t("usbDevice.selectUsbDevice") }}</span>
      <span class="el-icon-close dialog-close" @click="cancel()"></span>
    </div>
    <div slot="body">
      <div style="margin: 30px 20px;">
        <div class="radio-group" style="text-align: right">
          <span style="padding: 0 15px;display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </div>
        <el-table
          :data="itemList"
          @selection-change="handleSelect">
           <span slot="empty" class="table-nodata">
            <p class="empty-text" v-text="$t('common.noData')"></p>
          </span>
          <el-table-column type="selection"></el-table-column>
          <el-table-column :label="$t('usbDevice.deviceName')">
            <template slot-scope="scope">
              {{dbData.usbdevice[scope.row.uuid] && dbData.usbdevice[scope.row.uuid].name}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.host')"></el-table-column>
          <el-table-column :label="$t('common.producer')" prop="iManufacturer">
            <template slot-scope="scope">
              {{dbData.usbdevice[scope.row.uuid] && dbData.usbdevice[scope.row.uuid].iManufacturer}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.type')" prop="iProduct">
            <template slot-scope="scope">
              {{dbData.usbdevice[scope.row.uuid] && dbData.usbdevice[scope.row.uuid].iProduct}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.state')" >
            <template slot-scope="scope">
              <table-body-item-state slot="item" :state="dbData.usbdevice[scope.row.uuid] && dbData.usbdevice[scope.row.uuid].state" />
            </template>
          </el-table-column>
          <el-table-column :label="$t('usbDevice.version')" prop="usbVersion">
            <template slot-scope="scope">
              {{dbData.usbdevice[scope.row.uuid] && dbData.usbdevice[scope.row.uuid].usbVersion}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.createDate')">
            <template slot-scope="scope">
              {{new Date(dbData.usbdevice[scope.row.uuid] && dbData.usbdevice[scope.row.uuid].createDate)| formatDatetime}}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div slot="footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import DialogTemplate from "../DialogTemplate";
  import UsbList from 'src/om/usbdevice/List';
  import rpc from 'src/utils/rpc';
  import TableBodyItemState from "../../component/TableBodyItemState";

  export default {
    name: "UsbMultiSelectListDlg",
    components: {TableBodyItemState, DialogTemplate},
    mixins: [WindowBase, UsbList],
    data(){
      return {
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
       itemList: []
      }
    },
    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-',
        selectUuidList:[],
        methods: {
          queryList: self.queryList,
        }
      })
        .then(() => {
          return this.init()
        }).then(() => {
        return this.queryList()
      })
    },
    methods: {
      getCondition: function () {
        let conditionList = []
        if (this.dialogData.param.conditions && Array.isArray(this.dialogData.param.conditions)) {
          conditionList = conditionList.concat(this.dialogData.param.conditions)
        }
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        conditionList.push(`uuid?=${this.$data.usbdeviceList}`)
        return conditionList
      },
      init: async function () {
        if (this.dbData.common.isOpensource) {
          this.updateWindow({ uuidList: [], table: {} })
          return
        }
        let vmInstanceUuid = this.dialogData.param.vmInstanceUuid
        let resp = await rpc.query(`vm-instances/${vmInstanceUuid}/candidate-usb-devices`)
        let uuidList = resp.inventories.map(item => item.uuid)
        this.$data.usbdeviceList = uuidList
      },
      cancel() {
        let self = this;
        self.closeDialog(self.windowId);
      },
      confirm(){
        let self = this;
        if (self.windowData.selectUuidList.length <= 0) return
        this.dialogData.param.select(self.windowData.selectUuidList);
        this.closeDialog(this.windowId);
      },
      search(){

      },
      handleSelect(rows){
        let self = this, uuidList = [];
        uuidList = rows.map((row) => {
          return row.uuid;
        })
        self.updateWindow({
          selectUuidList: uuidList
        })
      }
    }
  }
</script>

<style scoped>

</style>
