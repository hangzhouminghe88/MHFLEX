<template>
   <page-template>
     <template slot="page-header">
        <el-row :gutter="10">
          <el-col :span="2.2"  class="page-header-title">
             {{$t('common.hybrididentityzone')}}
          </el-col>
          <el-col :span="2.2">
            <el-tabs>
              <el-tab-pane :label="$t('common.available') + `(${windowData.availableCount ? windowData.availableCount: '0'})`"></el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
     </template>
     <div slot="page-toolbar" class="page-toolbar-container">
       <el-row type="flex">
         <div class="page-toolbar-left">
           <!--添加可用区-->
           <span class="btn-success" @click="goToCreate()">
           <i class="el-icon-plus icon"></i>
           <span class="text">{{$t('hybrididentityzone.addidentityzone')}}</span>
         </span>
           <!--删除可用区-->
           <span class="btn-primary" :class="{'disabled': !isSelected}" @click="isSelected && pageDelete()">
           <i class="el-icon-remove-outline icon"></i>
           <span class="text">{{$t('hybrididentityzone.Deleteidentityzone')}}</span>
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
     <div slot="page-table-content">
        <!--表格-->
        <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
       <div class="page-table-pagination">
         <el-pagination v-show="windowData.availableCount > 0"
                        :page-sizes="[10,20,50,100]"
                        :page-size="windowData.pageSize"
                        :total="windowData.availableCount"
                        @size-change="pageSizeChange"
                        :current-page="windowData.pageIndex"
                        layout="total, sizes, jumper, prev, pager, next"
                        @current-change="pageCurrentChange"></el-pagination>
       </div>
     </div>
   </page-template>
</template>

<script>
  //搜索、刷新、排序等公共方法
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import PageTemplate from "src/component/PageTemplate";
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  //列表公共方法
  import List from  './List';
  export default {
    name: "HybridHuaweiIdentityZonePage",
    mixins: [WindowBase, MultiSelectList, List],
    components: {
      PageTemplate
    },
    data() {
      let self = this;
      return {
        searchStr: '',//所属条件
        selectVal: 'name',//搜索key
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
        itemList:[],
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,//多选回调
          handleSort: self.handleSort,//排序回调
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('zoneName', item),
              getHeaderContent: self.$t('hybrididentityzone.identityzone'),
              className:  'link',
              onClick: (item) => {
                self.$router.push({name: 'detailHybridHuaweiIdentityZone', params: {uuid: item.uuid}});
              },
              field: 'zoneName',
              sortable: true
            },
            {
              getContent: item => self.getField('zoneId', item),
              getHeaderContent: self.$t('hybrididentityzone.zoneId'),
              field: 'zoneId'
            },
            {
              getContent: item => self.getField('dataCenterName', item),
              getHeaderContent: self.$t('common.hybridDatacenter'),
              field: 'dataCenterName'
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
      }).then(() => {
        self.queryList();
      })
    },
    methods: {
      //填充表格数据
      getField(field, item) {
        let  normalFields = ['zoneName', 'zoneId', 'dataCenterName', 'description'];
        if(normalFields.includes(field)) return item[field];
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },
      //添加可用区
      goToCreate() {
        let self = this;
        self.$router.push({name: 'createHybridHuaweiIdentityZone'})
      }
    }
  }
</script>

<style scoped>

</style>
