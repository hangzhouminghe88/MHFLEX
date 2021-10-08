<template>
  <el-dialog :visible.async="visiabled" @close="close">
    <div slot="title">{{$t('gpuDevice.selectGpuDevice')}}</div>
    <div style="padding:30px;overflow-y: hidden;">
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
        :data="gpuItemList"
        highlight-current-row
        @row-click="handleSingleSelect">
        <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column width="50px">
          <template slot-scope="scope">
            <el-radio :label="scope.row.uuid" v-model="selectedUuid">&nbsp</el-radio>
          </template>
        </el-table-column>
        <el-table-column
        :label="$t('pciDevice.deviceName')"
        prop="description"></el-table-column>
        <el-table-column
        :label="$t('pciDevice.pciAddress')"
        prop="pciDeviceAddress"></el-table-column>
        <el-table-column
        :lable="$t('common.type')"
        >
          <template slot-scope="scope">
            {{getGpuType(scope.row.uuid)}}
          </template>
        </el-table-column>
        <el-table-column
        :label="$t('common.host')"
        >
          <template slot-scope="scope">
            {{getHostName(scope.row.uuid)}}
          </template>
        </el-table-column>
        <el-table-column
        :label="$t('common.state')"
        prop="state"></el-table-column>
        <el-table-column
        :label="$t('common.status')"></el-table-column>
        <el-table-column
          :label="$t('common.createDate')">
          <template slot-scope="scope">
            {{formatDatetime(new Date(scope.row.createDate))}}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-if="windowData.availableCount > 0"
        :page-sizes="[5, 10]"
        :page-size="5"
        :total="windowData.availableCount"
        class="page-table-pagination"
        layout="total, sizes, prev, pager, next"
        @current-change="pageCurrentChange"
        @size-change="pageSizeChange"
        :current-page="windowData.pageIndex"></el-pagination>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click.stop="confirmDlg">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click.stop="close">{{$t('common.cancel')}}</span>
    </div>
  </el-dialog>
</template>

<script>
  import GpuList from 'src/ecs/gpuDevice/List';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import _ from 'lodash';
  export default {
    name: "GpuDeviceSingleDlg",
    mixins: [WindowBase, GpuList],
    props: {
      message: {
        type: Object,
        default: {}
      },
      model: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        visiabled: false,
        gpuUuidList: [],
        selectedUuid: '',
        selectVal: '',
        searchStr:  '',
        conditionNameList: [
          {
            name: 'pciDevice.deviceName',
            value: 'description'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          }
        ]
      }
    },
    computed:{
      gpuItemList(){
        if (!_.isArray(this.windowData.uuidList)) return []
        // sometimes, uuid will not exist. so should be excluded firstly.
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.pcidevice[uuid]
        )
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.pcidevice[uuid]
          }
        )
      }
    },
    mounted(){
      let self = this;
      self.visiabled = self.model;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-'
      }).then(()=>{
        this.initCandidateGpuUuids();
      })
    },
    methods: {
      confirmDlg() {
        let self = this;
        self.$emit('close');
      },
      close() {
        let self = this;
        self.visiabled = false;
        self.$emit('close')
      },
      initCandidateGpuUuids () {
        let conditions = {}
        conditions.types = ['GPU_Video_Controller', 'GPU_Audio_Controller', 'GPU_3D_Controller']
        _.assign(conditions, this.message.conditions)
        return rpc.query('pci-device/candidate-pci-devices-for-new-create-vm', conditions).then(resp => {
          this.gpuUuidList = resp.inventories.map(it => it.uuid)
          if (this.message.selectedUuids.length > 0) {
            this.gpuUuidList = this.gpuUuidList.filter(uuid => {
              return !_.includes(this.message.selectedUuids, uuid)
            })
          }
          return this.queryList()
        })
      },
      getCondition: function () {
        let conditionList = []
        let type = ['GPU_Video_Controller', 'GPU_Audio_Controller', 'GPU_3D_Controller']
        conditionList.push(`type?=${type.join()}`)
        // conditionList = conditionList.concat(this.param.conditions)
        conditionList.push(`uuid?=${this.gpuUuidList}`)
        if (this.selectVal !=='' && this.searchStr!=='' ) {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      handleSingleSelect(row){
        let self = this;
        self.selectUuid = row.uuid;
      },
      pageCurrentChange(val){
        this.updateWindow({
          pageIndex: val
        })
      },
      pageSizeChange(val){
        this.updateWindow({
          pageSize:val
        })
      },
      getGpuType (uuid) {
        let gpu = this.dbData.pcidevice[uuid]
        if (gpu.type === 'GPU_Video_Controller') {
          return this.$t('gpuDevice.desktopGpu')
        }
        return this.$t('gpuDevice.computeGpu')
      },
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        })
        self.queryList();
      }
    },
    watch: {
      model(newVal, oldVal){
        if(newVal !== oldVal){
          this.visiabled = newVal;
        }
      }
    }
  }
</script>

<style scoped>

</style>
