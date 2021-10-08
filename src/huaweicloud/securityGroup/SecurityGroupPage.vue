<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2.2">
          <span class="page-header-title">{{$t('common.securitygroup')}}</span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs v-model="currSelectTab">
            <el-tab-pane :label="$t('common.available') + `(${windowData.availableCount  ? windowData.availableCount : '0'})`"
                         name="available"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-left">
          <span class="btn-success" @click="goToCreate()">
            <i class="icon el-icon-plus"></i>
            <span class="text">创建安全组</span>
          </span>
          <drop-down class="dropdown btn-primary more"
                    :class="{'disabled': !isSelected}"
                    :enabled="isSelected">
              <span slot="title">
                <i class="el-icon-more"></i>
                <span class="text">{{$t('common.moreActions')}}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content">
                  <a style="padding: 12px 0px" @click="pageDelete()">
                    {{$t('common.destroy')}}
                  </a>
                </div>
              </span>
          </drop-down>
        </div>
        <div class="page-toolbar-center"></div>
        <div class="page-toolbar-right">
           <span style="padding: 0 15px;display: inline-block;">
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
    <div slot="page-table-content" class="page-table">
      <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
      <div class="page-table-pagination">
        <el-pagination :total="windowData.availableCount"
                        v-if="windowData.availableCount > 0"
                        @size-change="pageSizeChange"
                        :page-size="windowData.pageSize"
                        :page-sizes="[5,10,20,50,100]"
                        layout="total, sizes, prev,  pager, ->, next, jumper "
                        @current-change="pageCurrentChange"></el-pagination>
      </div>
    </div>
  </page-template>
</template>

<script>
import MultiSelectList from 'src/windows/Base/MultiSelectList';
import PageTemplate from 'src/component/PageTemplate';
import { formatDatetime } from 'src/utils/utils';
import WindowBase from 'src/windows/Window';
import SecurityList from './List';

export default {
   name: "SecurityGroupPage",
   mixins: [MultiSelectList, WindowBase, SecurityList],
   components: {
     PageTemplate
   },
   data() {
     let _this = this;
     return {
       currSelectTab: 'available',
       selectVal: 'name',
       searchStr: '',
       conditionNameList: [
         {
           name: 'common.uuid',
           value: 'uuid'
         },
         {
           name: 'common.name',
           value: 'name'
         }
       ],
       itemList: [],
       dataSource: {
         getItemList: () => _this.itemList,
         handleSelection:_this.handleSelect,
         handleSort: _this.handleSort,
         type: 'selection',
         fields: [
           {
             getContent: item => _this.getField('name', item),
             getHeaderContent: _this.$t('common.name'),
             onClick: (item) => {
               _this.$router.push({name:'detailHybridHuaweiSecurityGroup', params: {uuid: item.uuid}})
             },
             className: 'link',
             tooltip: true,
             sortable: true
           },
           {
             getContent: item => _this.getField('vpcName', item),
             getHeaderContent: 'VPC',
             tooltip: true,
             sortable: true
           },
           {
             getContent: item => _this.getField('securityGroupId', item),
             getHeaderContent: '安全组ID',
             tooltip: true,
             sortable: true
           },
           {
             getContent: item => _this.getField('ecsInstanceNum', item),
             getHeaderContent: '云主机数量',
             tooltip: true,
             sortable: true
           },
           {
             getContent: item => _this.getField('createDate', item),
             getHeaderContent: _this.$t('common.createDate'),
             sortable: true,
             tooltip: true
           }
         ]
       }
     }
   },
   created() {
     let _this = this;
     _this.updateWindow({
       pageIndex: 1,
       pageSize: 10,
       sortBy: 'createDate',
       sortDirection: '-',
       selectedUuidList: [],
       loading: false,
       methdos: {
         queryList: _this.queryList
       }
     })
     .then(() => {
       _this.queryList()
     })
   },
   methods: {
      //填充安全组列表
     getField(field, item) {
        let normalFields = ['name', 'securityGroupId', 'ecsInstanceNum', 'dataCenterName'];
        if(normalFields.includes(field)) return item[field];
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
    },
    //跳转到创建华为云安全组页面
    goToCreate() {
      let _this = this;
      _this.$router.push({name: 'createHybridHuaweiSecuritygroup'})
    },
    clickBtn(data) {
      debugger
      alert(data.uuid);
    }
   }
}
</script>

<style lang="less" scoped>

</style>
