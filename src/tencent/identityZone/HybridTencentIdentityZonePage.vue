<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2.2" class="page-header-title">
          {{$t('common.hybrididentityzone')}}
        </el-col>
        <el-col :span="2.2">
          <el-tabs v-model="currTab">
            <el-tab-pane :label="$t('common.available') +
                          `(${windowData.availableCount ?
                          windowData.availableCount : '0'})`"
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
          <span class="text">{{$t('hybrididentityzone.addidentityzone')}}</span>
        </span>
          <span class="btn-primary" @click="isSelected && pageDelete()"
                :class="{'disabled': !isSelected}">
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
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import PageTemplate from "src/component/PageTemplate";
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import List from './List';

  export default {
    name: "HybridTencentIdentityZonePage",

    mixins: [MultiSelectList, WindowBase, List],

    components: {PageTemplate},

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
        itemList: [],
        currTab: 'available',
        selectVal: 'zoneName',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'zoneName'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('zoneName', item),
              getHeaderContent: self.$t('hybrididentityzone.name'),
              sortable: true,
              tooltip: true,
              className: 'link',
              onClick: (item) => {
                this.$router.push({name: 'detailHybridTencentIdentityZone', params: {uuid: item.uuid}})
              },
              field: 'zoneName'
            },
            {
              getContent: item => self.getField('zoneId', item),
              getHeaderContent: self.$t('hybrididentityzone.zoneId'),
              tooltip: true,
            },
            {
              getContent: item => self.getField('dataCenterName', item),
              getHeaderContent: self.$t('common.hybridDatacenter'),
              tooltip: true,
              field: 'dataCenterUuid'
            },
            {
              getContent: item => self.getField('description', item),
              getHeaderContent: self.$t('common.description'),
              tooltip: true,
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              tooltip: true,
              sortable: true,
              field: 'createDate'
            }
          ]
        }
      }
    },

    methods: {
      getField(field, item) {
        let  normalFields = ['zoneName', 'zoneId', 'dataCenterName', 'description'];
        if(normalFields.includes(field)) return item[field];
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },

      goToCreate() {
        let self = this;
        self.$router.push({name: 'createHybridTencentIdentityZone'})
      }
    }
  }
</script>

<style scoped>

</style>
