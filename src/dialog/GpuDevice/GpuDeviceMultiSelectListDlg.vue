<template>
  <dialog-template width="1000px">
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">{{$t('gpuDevice.selectGpuDevice')}}</span>
      <span class="dialog-close el-icon-close" @click="close()"></span>
    </div>

    <div slot="body" class="dialog-body">
      <div style="padding: 20px 30px">
        <div class="page-toolbar-container" style="display: flex;justify-content: space-between;">
          <div class="left"></div>
          <div class="right">
            <el-input @blur="search()" @change="search()" placeholder="请输入内容" v-model="searchStr">
              <el-select placeholder="请选择" slot="prepend" style="width: 100px" v-model="selectVal">
                <el-option :key="index" :label="$t(`${item.name}`)" :value="item.value"
                           v-for="(item, index ) in conditionNameList"></el-option>
              </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </div>
        </div>
        <div class="page-table">
          <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
          <el-pagination v-if="windowData.total > 0"
                         :current-page="windowData.pageIndex"
                         :page-size="5"
                         :page-sizes="[5, 10]"
                         :total="windowData.total"
                         @current-change="pageCurrentChange"
                         @size-change="pageSizeChange"
                         class="page-table-pagination"
                         layout="total, sizes, prev, pager, next"></el-pagination>
        </div>
      </div>
    </div>

    <div slot="footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import { formatDatetime } from "src/utils/utils";
  import GpuList from 'src/ecs/gpuDevice/List';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import _ from 'lodash';

  export default {
    name: "GpuDeviceMultiSelectListDlg",

    mixins: [MultiSelectList, WindowBase, GpuList],

    created() {
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        loading: false,
        methods: {
          queryList: self.getCandidateGpuDevices
        }
      }).then(() => {
        self.getCandidateGpuDevices();
      })
    },

    data() {
      let self = this;
      return {
        selectVal: 'deviceName',
        searchStr: '',
        conditionNameList: [
          {
            name: 'pciDevice.deviceName',
            value: 'deviceName'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          }
        ],
        gpuUuidList: [],
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('description', item),
              getHeaderContent: self.$t('pciDevice.deviceName'),
              tooltip: true,
              sortable: true,
              field: 'deviceName'
            },
            {
              getContent: item => self.getField('pciDeviceAddress', item),
              getHeaderContent: self.$t('pciDevice.pciAddress'),
              tooltip: true,
              field: 'pciAddress'
            },
            {
              getContent: item => self.getField('type', item),
              getHeaderContent: self.$t('common.type'),
              tooltip: true,
              field: 'type'
            },
            {
              getContent: item => self.getField('host', item),
              getHeaderContent: self.$t('common.host'),
              tooltip: true,
              sortable: true
            },
            {
              getContent: item => self.getField('state', item),
              getHeaderContent: self.$t('common.state'),
              tooltip: true,
            },
            {
              getContent: item => self.getField('status', item),
              getHeaderContent: self.$t('common.status'),
              tooltip: true,
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              tooltip: true,
              sortable: true
            }
          ]
        }
      }
    },

    methods: {
      ...formatDatetime,

      getCandidateGpuDevices () {
        if (this.dbData.common.isOpensource) {
          this.updateWindow({ uuidList: [], table: {} })
          return
        }
        let vmInstanceUuid = this.dialogData.param.vmInstanceUuid
        let types = ['GPU_Video_Controller', 'GPU_Audio_Controller', 'GPU_3D_Controller']
        return rpc.query(`vm-instances/${vmInstanceUuid}/candidate-pci-devices`, {
          types: types
        }).then(resp => {
          this.gpuUuidList = resp.inventories.map(it => it.uuid)
        }).then(() => {
          return this.queryList()
        })
      },

      getCondition() {
        let self = this, conditionList = [];
        if (self.dialogData.param.conditions && Array.isArray(self.dialogData.param.conditions)) {
          conditionList = conditionList.concat(self.dialogData.param.conditions)
        }
        conditionList.push(`uuid?=${self.gpuUuidList}`)
        if(self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
        }
        return conditionList;
      },

      getField(field, item) {
        let self = this, normalFields = ['description', 'pciAddress', 'state'];
        if(_.includes(normalFields, item)) return item[field];
        if(field === 'type') return self.getGpuType(item.uuid);
        if(field === 'host') return self.getHostName(item.uuid);
        if(field === 'status') return ['System', 'Active'].includes(item[field]) ? item['status'] = 'Ready' : item[field];
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },

      close() {
        let self = this;
        self.closeDialog(self.windowId);
      },

      confirm() {
        let self = this;
        if(!self.isSelected) {
          self.$message("请选择资源!");
          return;
        }
        self.dialogData.param.select(self.selectedList);
        self.close();
      }
    }
  }
</script>

<style scoped>

</style>
