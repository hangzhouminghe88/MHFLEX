<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">
            {{$t("common.usbDevice")}}{{$t("common.colon")}}
            <help-trigger name="vmUsb" :style="{ position: 'absolute', top: 0, right: '2px' }"/>
          </span>
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a  v-permission="'PCI.ATTACH_PCI_TO_VM'" style="padding-top:12px;" @click="inStates('Running', 'Stopped') && !isSelected && pageAttach()" :class="{'disabled-text': !(inStates('Running', 'Stopped') && !isSelected)}">{{ $t("common.attach") }}</a>
                <a v-permission="'PCI.DETACH_PCI_FROM_VM'" style="padding-bottom:12px;" @click="isSelected && inStates('Running', 'Stopped') && pageDetach()" :class="{'disabled-text': !(isSelected && inStates('Running', 'Stopped'))}">{{ $t("common.detach") }}</a>
              </div>
            </span>
          </drop-down>
        </el-col>
      </el-row>
    </div>
    <el-table
    :data="itemList"
    @selection-change="handleSelect">
       <span slot="empty" class="table-nodata">
        <p class="empty-text" v-text="$t('common.noData')"></p>
      </span>
      <el-table-column type="selection"></el-table-column>
      <el-table-column :label="$t('usbDevice.deviceName')"
        prop="name">
        <template slot-scope="scope">
          {{dbData.usbdevice[scope.row.uuid] && dbData.usbdevice[scope.row.uuid].name}}
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.host')" prop="hostName"></el-table-column>
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
</template>

<script>
  import Root from 'src/windows/Root';
  import UsbList from 'src/om/usbdevice/List';
  import TableBodyItemState from "../../../component/TableBodyItemState";
  export default {
    name: "UsbDeviceTabList",
    components: {TableBodyItemState},
    mixins: [Root, UsbList],
    props: {
      param: {
        type: Object,
        default: {}
      }
    },
    data(){
      return {
        itemList: []
      }
    },
    computed:{
      isSelected(){
        let self = this;
        if(self.windowData.selectUuidList){
          return self.windowData.selectUuidList.length >= 1;
        }
      }
    },
    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectUuidList: [],
        vmUuid: self.param.uuid,
        methods: {
          queryList: self.queryList
        },
        conditions: this.param && this.param.conditions ? this.param.conditions : []
      })
        .then(() => {
          self.queryList()
        })
    },
    methods:{
      inStates: function () {
        let stateList = []
        for (let i = 0; i < arguments.length; i++) {
          stateList.push(arguments[i])
        }
        if(this.dbData.vm  && this.dbData.vm[this.windowData.vmUuid]){
          return !stateList.every((item, index, array) => {
            return item !== this.dbData.vm[this.windowData.vmUuid].state
          })
        }
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
