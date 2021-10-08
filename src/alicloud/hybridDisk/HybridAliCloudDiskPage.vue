<template>
 <page-template>
   <div slot="page-header">
     <el-row :gutter="5">
       <el-col :span="2">
         <div class="page-header-title">{{$t('common.hybridaliyundisk')}}</div>
       </el-col>
       <el-col :span="2">
         <el-tabs v-model="currTab">
           <el-tab-pane :label="$t('common.available')+`(${windowData.total ? windowData.total : '0'})`"
                        name="available"></el-tab-pane>
         </el-tabs>
       </el-col>
     </el-row>
   </div>

   <div slot="page-toolbar" class="page-toolbar-container">
     <el-row type="flex">
       <div class="page-toolbar-left">
       <span class="btn-success" @click="goToCreate()">
         <i class="el-icon-plus icon"></i>
         <span class="text">{{$t('hybridAliyunDisk.create')}}</span>
       </span>
         <drop-down class="dropdown btn-primary more" :enabled="isSelected"
                    :class="{'disabled': !isSelected}">
         <span slot="title">
           <i class="el-icon-more"></i>
           <span class="text">{{$t('common.moreActions')}}</span>
         </span>
           <span slot="content">
           <div class="dropdown-content">
              <a :class="{'disabled-text': !isSingleSelected || !canDetachEcsInstance()}" @click="isSingleSelected && canDetachEcsInstance() && pageAttach()">{{$t('common.attach')}}</a>
              <a style="padding-bottom: 12px;" :class="{'disabled-text': !canDetach()}" @click="canDetach() && pageDetach()">{{$t('common.detach')}}</a>
              <a style="padding-bottom: 12px;" :class="{'disabled-text': !isSelected}" @click="isSelected && pageDelete()">{{$t('common.destroy')}}</a>
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

   <div slot="page-table-content">
     <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
     <div class="page-table-pagination">
       <el-pagination v-if="windowData.total > 0"
                      :page-size="windowData.pageSize"
                      :page-sizes="[10, 20, 50, 100]"
                      @current-change="pageCurrentChange"
                      layout="total, sizes, prev, pager, next, jumper"
                      @size-change="pageSizeChange"
                      :current-page="windowData.pageIndex"
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
  import List from './List';
  import _ from 'lodash'

  export default {
    name: "HybridAliCloudDiskPage",

    components: {PageTemplate},

    mixins: [WindowBase, MultiSelectList, PageBase, List],

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

    data() {
      let self = this;
      return {
        currTab: 'available',
        itemList: [],
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              className: 'link',
              onClick: (item) => {
                self.$router.push({name: 'detailHybridAliCloudDisk', params: {uuid: item.uuid}})
              },
              field: 'name',
              sortable: true,
              tooltip: true
            },
            {
              getContent: item => self.getField('diskId', item),
              getHeaderContent: self.$t('hybridAliyunDisk.diskId'),
              field: 'diskId',
              sortable: true,
              tooltip: true
            },
            {
              getContent: item => self.getField('diskCategory', item),
              getHeaderContent: self.$t('hybridAliyunDisk.diskCategory'),
              field: 'diskCategory',
              sortable: true
            },
            {
              getContent: item => self.getField('ecsName', item),
              getHeaderContent: self.$t('hybridecsinstance.instance'),
              field: 'ecsInstanceUuid',
              sortable: true
            },
            {
              getContent: item => self.getField('sizeWithGB', item),
              getHeaderContent: self.$t('common.size'),
              field: 'sizeWithGB',
              sortable: true
            },
            {
              getContent: item => self.getField('diskChargeType', item),
              getHeaderContent: self.$t('hybridAliyunDisk.billingMethod'),
              field: 'diskChargeType',
              sortable: true,
              tooltip: true
            },
            {
              getContent: item => self.getField('diskType', item),
              getHeaderContent: self.$t('hybridAliyunDisk.diskType'),
              field: 'diskType',
              sortable: true
            },
            {
              getContent: item => self.getField('identityZoneName', item),
              getHeaderContent: self.$t('common.hybrididentityzone'),
              field: 'identityZoneName',
              tooltip: true,
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate',
              sortable: true,
              tooltip: true
            }
          ]
        }
      }
    },

    methods: {
      getField(field, item){
        let self = this, normalFields = ['diskId','name', 'identityZoneName'];
        if(_.includes(normalFields, field)) return item[field];
        if(field === 'diskCategory') return self.$t(`hybridAliyunDisk.${(item.diskCategory).toLowerCase()}`);
        if(field === 'sizeWithGB') return `${item[field]}G`;
        if(field === 'diskChargeType') return item[field] ? self.$t(`hybridAliyunDisk.${item[field]}`) : self.$t('hybridAliyunDisk.afterPayment');
        if(field === 'diskType') return self.$t(`hybridAliyunDisk.${item[field]}`);
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
        if(field === 'ecsName') return item.ecsName ? item[field] : self.$t('common.noAttach');
      },

      goToCreate() {
        let self = this;
        self.$router.push({name: 'createHybridAliCloudDisk'});
      }
    }
  }
</script>

<style scoped>

</style>
