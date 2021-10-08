<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="2.2">
        <el-col :span ="2.2" class="page-header-title">
           专有网络VPC
        </el-col>
        <el-col :span="2.2">
          <el-tabs v-model="currSelectTab">
            <el-tab-pane :label="$t('common.available') + `(${windowData.availableCount ? windowData.availableCount : '0'})`"
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
          <span class="text">创建专有网络VPC</span>
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
              <a style="padding: 12px 0px;" @click="pageDelete()">{{$t('common.destroy')}}</a>
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
import HybridHuaweiVpcList from './List';

export default {
  name:'HybridHuaweiCloudVpcPage',
  mixins: [MultiSelectList, WindowBase, HybridHuaweiVpcList],
  data() {
    let _this = this;
    return {
      currSelectTab: 'available',
      selectVal: 'name',
      searchStr: '',
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
        getItemList: () => _this.itemList,
        handleSelection: _this.handleSelect,
        handleSort: _this.handleSort,
        type: 'selection',
        fields: [
          {
            getContent: item => _this.getField('name', item),
            getHeaderContent:  _this.$t('common.name'),
            field: 'name',
            onClick: (item) => {
              _this.$router.push({name:'detailHybridHuaweiVpc', params: {uuid: item.uuid}})
            },
            className: 'link',
            tooltip:  true,
            sortable: true
          },
          {
            getContent: item => _this.getField('dataCenterName', item),
            getHeaderContent: _this.$t('hybriddatacenter.region'),
            tooltip: true,
            filed: 'dataCenterUuid'
          },
          {
            getContent: item => _this.getField('cidrBlock', item),
            getHeaderContent: _this.$t('common.cidr'),
            tooltip: true,
            filed: 'cidrBlock'
          },
          {
            getContent: item => _this.getField('ecsInstanceNum', item),
            getHeaderContent: _this.$t('hybridvirtualprivatecloud.ecsInstanceNum'),
            tooltip: true
          },
          {
            getContent: item => _this.getField('status', item),
            getHeaderContent: _this.$t('common.status'),
            tooltip: true
          },
          {
            getContent: item => _this.getField('createDate', item),
            getHeaderContent: _this.$t('common.createDate'),
            tooltip: true,
            sortable: true,
            field: 'createDate'
          }
        ]
      }
    }
  },
  components: {
    PageTemplate
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
      methods: {
        queryList: _this.queryList
      }
    }).then(() => {
      _this.queryList();
    })
  },
  methods: {
    getField(field, item) {
        let self = this;
        let normalFields = ['name', 'dataCenterName', 'status', 'cidrBlock'];
        if(normalFields.includes(field)) return item[field];
        if(field === 'ecsInstanceNum') return self.getHuaweiEcsInstanceNum(item.uuid);
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
    },
    goToCreate() {
      let _this = this;
      _this.$router.push({name: 'createHybridHuaweiVpc'})
    }
  }
}
</script>

<style lang="less" scoped>

</style>
