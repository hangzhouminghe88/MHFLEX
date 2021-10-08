<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2.2">
          <span class="page-header-title">{{$t('common.hybridvirtualborderrouter')}}</span>
        </el-col>
        <el-col :span="2">
          <el-tabs v-model="currTab">
            <el-tab-pane :label="$t('common.available') + `(${windowData.total ? windowData.total : '0'})`"
                         name="available"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>

    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-left">
        <span class="btn-success" @click="pageAsync()">
          <i class="icon el-icon-plus"></i>
          <span class="text">{{$t('hybridvirtualborderrouter.sync')}}</span>
        </span>
        </div>
        <div class="page-toolbar-center"></div>
        <div class="page-toolbar-right">
         <span style="padding: 0px 15px;display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
              <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                <el-option
                  v-for="(item, index ) in conditionNameList"
                  :label="$t(`${item.name}`)"
                  :key="index"
                  :value="item.value"
                ></el-option>
              </el-select>
              <span slot="append">
                <i class="el-icon-search icon"></i>
              </span>
            </el-input>
         </span>
          <span @click="refresh()" class="btn-refresh">
            <i class="el-icon-refresh icon"></i>
           </span>
        </div>
      </el-row>
    </div>

    <div slot="page-table-content">
      <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData.total > 0"
                       :page-size="windowData.pageSize"
                       :page-sizes="[10, 20, 50, 100]"
                       @current-change="pageCurrentChange"
                       @size-change="pageSizeChange"
                       layout="total, sizes, prev, pager, next"
                       :total="windowData.total"
        ></el-pagination>
      </div>
    </div>
  </page-template>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import PageTemplate from "src/component/PageTemplate";
  import HybridVirtualBorderRouterList from './List';
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import _ from 'lodash'

  export default {

    name: "HybridAliCloudVirtualBorderRouterPage",

    components: {PageTemplate},

    mixins: [MultiSelectList, WindowBase, PageBase, HybridVirtualBorderRouterList],

    data() {
      let self = this;
      return {
        selectVal: 'name',
        searchStr: '',
        currTab:'available',
        conditionNameList: [
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
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              onClick: (item) => {
                self.$router.push({name: 'detailHybridAliCloudVirtualBorderRouter', params: {uuid: item.uuid}})
              },
              className: 'link',
              field: 'name'
            },
            {
              getContent: item => self.getField('vbrId', item),
              getHeaderContent: self.$t('hybridvirtualborderrouter.vbrId'),
              sortable: true,
              tooltip: true,
              field: 'vbrId'
            },
            {
              getContent: item => self.getField('physicalConnectionId', item),
              getHeaderContent: self.$t('hybridvirtualborderrouter.physicalConnectionId'),
              sortable: true,
              tooltip: true,
              field: 'physicalConnectionId'
            },
            {
              getContent: item => self.getField('physicalConnectionStatus', item),
              getHeaderContent: self.$t('hybridvirtualborderrouter.physicalConnectionStatus'),
              sortable: true,
              tooltip: true,
              field: 'physicalConnectionStatus'
            },
            {
              getContent: item => self.getField('vlanInterfaceId', item),
              getHeaderContent: self.$t('hybridvirtualborderrouter.vlanInterfaceId'),
              sortable: true,
              tooltip: true,
              field: 'vlanInterfaceId'
            },
            {
              getContent: item => self.getField('peeringSubnetMask', item),
              getHeaderContent: self.$t('hybridvirtualborderrouter.peeringSubnetMask'),
              sortable: true,
              tooltip: true,
              field: 'peeringSubnetMask'
            },
            {
              getContent: item => self.getField('peerGatewayIp', item),
              getHeaderContent: self.$t('hybridvirtualborderrouter.peerGatewayIp'),
              sortable: true,
              tooltip: true,
              field: 'peerGatewayIp'
            },
            {
              getContent: item => self.getField('localGatewayIp', item),
              getHeaderContent: self.$t('hybridvirtualborderrouter.localGatewayIp'),
              sortable: true,
              tooltip: true,
              field: 'localGatewayIp'
            },
            {
              getContent: item => self.getField('accessPointName', item),
              getHeaderContent: self.$t('hybridvirtualborderrouter.accessPoint'),
              sortable: true,
              tooltip: true,
              field: 'accessPointUuid'
            },
            {
              getContent: item => self.getField('dataCenterName', item),
              getHeaderContent: self.$t('hybridvirtualborderrouter.dataCenter'),
              sortable: true,
              tooltip: true,
              field: 'dataCenterUuid'
            },
            {
              getContent: item => self.getField('status', item),
              getHeaderContent: self.$t('hybridvirtualborderrouter.status'),
              sortable: true,
              tooltip: true,
              field: 'status'
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              sortable: true,
              tooltip: true,
              field: 'createDate'
            }
          ]
        }
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
        loading: false,
        methods: {
          query: self.queryList
        }
      }).then( () => {
        self.queryList();
      })
    },

    methods: {
      getField(field, item) {
        let self = this, normalFields = ['name', 'vbrId', 'physicalConnectionId', 'vlanInterfaceId', 'peeringSubnetMask',
          'peerGatewayIp', 'localGatewayIp', 'status', 'accessPointName', 'dataCenterName'];
        if(_.includes(normalFields, field)) return item[field];
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      }
    },
  }
</script>

<style scoped>

</style>
