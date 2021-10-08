<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">
            {{$t('common.hybriddatacenter')}}
          </span>
        </el-col>
        <el-col :span="2">
          <el-tabs v-model="currTab">
            <el-tab-pane :label="$t('common.available') + `(${windowData.availableCount ? windowData.availableCount : '0'})`"
                         name="available"
            ></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>

    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-left">
        <span class="btn-success" @click.stop="goToCreate()">
          <i class="el-icon-plus icon"></i>
          <span class="text">{{$t('hybriddatacenter.Adddatacenter')}}</span>
        </span>
        <span class="btn-primary" :class="{'disabled': !isSelected}"
              @click.stop="isSelected && pageDelete()"
        >
          <i class="el-icon-remove-outline icon"></i>
          <span class="text">{{$t('common.destroy')}}</span>
        </span>
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
      <mh-table :data-source="dataSource"></mh-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData.availableCount > 0"
                       :page-size="windowData.pageSize"
                       :page-sizes="[10, 20, 50, 100]"
                       @current-change="pageCurrentChange"
                       layout="total, sizes, prev, pager, next, jumper"
                       @size-change="pageSizeChange"
                       :current-page="windowData.pageIndex"
                       :total="windowData.availableCount"
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
  import List from './List';
  import _ from 'lodash'

  export default {
    name: "HybridAliCloudDataCenterPage",

    mixins: [WindowBase, MultiSelectList, List],

    components: {
      PageTemplate
    },

    data () {
      let self = this;
      return {
        currTab: 'available',
        itemList: [],
        selectVal: 'regionName',
        searchStr: '',
        conditionNameList: [
          {name: 'hybridbucket.region', value: 'regionName'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('regionName', item),
              getHeaderContent: self.$t('hybridbucket.region'),
              className:  'link',
              onClick: (item) => {
                self.$router.push({name: 'detailHybridAliCloudDataCenter', params: {uuid: item.uuid}});
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

    created () {
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: []
      }).then( () => {
        self.queryList();
      })
    },

    methods: {
      getField (field, item) {
        if(_.isUndefined(item)) return '';
        let normalFields = ['regionName', 'regionId', 'description'];
        if(normalFields.includes(field)) return item[field];
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },

      goToCreate () {
        let self = this;
        self.$router.push({name: 'createHybridAliCloudDataCenter'})
      }
    }
  }
</script>

<style scoped>

</style>
