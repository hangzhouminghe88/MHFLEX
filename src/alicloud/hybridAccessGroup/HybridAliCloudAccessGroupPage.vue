<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2.2">
          <span class="page-header-title">
            权限组
          </span>
        </el-col>
        <el-col :span="2.2">
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
          <div class="btn-success" @click="goToCreate()">
            <i class="el-icon-plus icon"></i>
            <span class="text">创建权限组</span>
          </div>
          <div class="btn-primary" :class="{'disabled': !isSelected}" @click="isSelected && pageDelete()">
            <i class="el-icon-remove-outline icon"></i>
            <span class="text">{{$t('common.destroy')}}</span>
          </div>
        </div>
        <div class="page-toolbar-center"></div>
        <div class="page-toolbar-right">
        <span style="padding: 0px 15px;display: inline-block;">
         <el-input placeholder="请输入内容" v-model="searchStr"  @change="search()">
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
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import SystemFileList from './List';
  import rpc from 'src/utils/rpc';
  import _ from 'lodash'


  export default {

    name: "HybridVpnAliCloudConnectionPage",

    mixins: [MultiSelectList, PageBase, WindowBase, SystemFileList],

    components: {PageTemplate},

    data() {
      let self = this;
      return {
        currTab: 'available',
        selectVal: 'name',
        searchStr: '',
        itemList: [],
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
        regionList: [],
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              sortable: true,
              tooltip: true,
              onClick: (item) => {
                self.$router.push({name: 'detailHybridAliCloudFileSystem', params: {uuid: item.uuid}})
              },
              className: 'link',
              field: 'name'
            },
            {
              getContent: item => self.getField('type', item),
              getHeaderContent: self.$t('common.networkType'),
              sortable: true,
              tooltip: true,
              field: 'type'
            },
            {
              getContent: item => self.getField('rules',  item),
              getHeaderContent: self.$t('nasAccessGroup.info.ruleCount'),
              sortable: true,
              tooltip: true,
              field: 'rules'
            },
            {
              getContent: item => self.getField('regionName',  item),
              getHeaderContent: self.$t('common.hybridDatacenter'),
              tooltip: true,
              field: 'regionName'
            },
            {
              getContent: item => self.getField('createDate',  item),
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
          queryList: self.queryList
        }
      }).then( () => {
        self.queryRegionList();
        self.queryList();
      })
    },

    methods: {
        async queryRegionList () {
        let param = {
          q: ['dcType=privateAliyun']
        }
        let resp = await rpc.query('hybrid/data-center', param);
        this.regionList = resp.inventories
      },
      //填充表格数据
      getField(field, item) {
        let self = this, normalFields = ['name', 'type'];
        if(_.includes(normalFields, field)) return item[field];
        if(field === 'rules') return item[field].length;
        if(field === 'regionName') return self.getRegion();
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },
      //回到创建页
      goToCreate() {
        let self = this;
        self.$router.push({name:'createHybridAliCloudAccessgroup'})
      }
    }
  }
</script>

<style scoped>

</style>
