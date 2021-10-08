<template>
  <page-template>
    <!--列表页面头部-->
    <template slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2.2" class="page-header-title">
          地域
        </el-col>
        <el-col :span="2.2">
          <el-tabs v-model="currTab">
            <el-tab-pane :label="`${$t('common.available')}`+`(${windowData.availableCount ? windowData.availableCount : '0'})`"
                         name="available"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </template>
    <template slot="page-toolbar">
      <div class="page-toolbar-container">
        <el-row type="flex">
          <div class="page-toolbar-left">
            <!--添加地域-->
            <span class="btn-success" @click="goToCreate()">
            <i class="el-icon-plus icon"></i>
            <span class="text">{{$t('hybriddatacenter.Adddatacenter')}}</span>
          </span>
            <!--删除地域-->
            <span class="btn-primary" :class="{'disabled': !isSelected}" @click="isSelected && pageDelete()">
              <i class="el-icon-remove-outline icon"></i>
            <span class="text">{{$t('hybriddatacenter.Deletedatacenter')}}</span>
          </span>
          </div>
          <div class="page-toolbar-center"></div>
          <div class="page-toolbar-right">
            <!--搜索组合框-->
            <span style="padding: 0 15px;display: inline-block;">
             <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
             </el-input>
           </span>
            <!--刷新按钮-->
            <span class="btn-refresh" @click="refresh()"><i class="el-icon-refresh icon"></i></span>
          </div>
        </el-row>
      </div>
    </template>
    <template slot="page-table-content">
      <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
      <!--表格分页-->
      <el-pagination @size-change="pageSizeChange" v-show="windowData.availableCount > 0"
                     @current-change="pageCurrentChange"
                     layout="total, sizes, prev, pager, next, jumper, ->"
                     :total="windowData.availableCount"
                     :current-page="windowData.pageIndex"
                     :page-sizes="[10,20,50,100]"
                     :page-size="windowData.pageSize"></el-pagination>
    </template>
  </page-template>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import PageTemplate from "src/component/PageTemplate";
  import {formatDatetime} from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  //列表页面请求
  import HuaweiDataCenterList from './List';
  export default {
    name: "HuaweiDataCenterPage",
    mixins: [WindowBase, MultiSelectList, HuaweiDataCenterList],
    components: {
      PageTemplate
    },
    //初始化数据
    data() {
      let self = this;
      return {
        currTab: 'available',
        searchStr: '',
        selectVal: 'regionName',
        conditionNameList: [
          {
            name: 'common.regionName',
            value: 'regionName'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          }
        ],
        itemList: [],//表格数据数组
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,//多选回调
          handleSort: self.handleSort,//排序回调
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('regionName', item),
              getHeaderContent: self.$t('hybridbucket.region'),
              className:  'link',
              onClick: (item) => {
                self.$router.push({name: 'detailHybridHuaweiDataCenter', params: {uuid: item.uuid}});
              },
              field: 'regionName',
              sortable: true
            },
            {
              getContent: item => self.getField('regionId', item),
              getHeaderContent: self.$t('hybridbucket.regionId'),
              field: 'regionId'
            },
            {
              getContent: item => self.getField('description', item),
              getHeaderContent: self.$t('common.description'),
              field: 'description'
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate',
              sortable: true
            }
          ]
        }
      }
    },
    created() {
      //初始化请求参数
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        selectedUuidList: [],
        sortDirection: '-',
        loading: false,
        methods: {
          queryList: self.queryList
        }
      }).then(() => {
        //查询列表
         self.queryList()
      })
    },
    methods: {
      //填充数据
      getField(field, item) {
        let normalFields = ['regionName', 'regionId', 'description'];
        if(normalFields.includes(field)) return item[field];
        //格式化创建日期，格式为yyy-MM-dd hh:mm
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },
      //添加华为云地域
      goToCreate() {
        let self = this;
        self.$router.push({name: 'createHybridHuaweiDataCenter'})
      }
    }
  }
</script>

<style scoped>

</style>
