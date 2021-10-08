<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2.2">
          <span class="page-header-title">{{$t('common.hybridvpcvpngateway')}}</span>
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
        <div class="page-toolbar-left" style="position: relative">
          <span class="btn-success" @click="pageAsync()">
            <i class="icon-tongbu icon"></i>
           {{$t('adLdapServer.sync')}}
         </span>

         <span class="btn-primary" :class="{'disabled': !isSelected}" @click="isSelected && pageDelete()">
          <i class="icon el-icon-remove-outline"></i>
          <span class="text">{{$t('common.destroy')}}</span>
         </span>
          <help-trigger name="vpnTencentGateway" :style="{'left': '180px', 'top': '10px'}"/>
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
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import HybridVpnGatewayList from './List';

  export default {

    name: "HybridAliCloudVpnGatewayPage",

    components: {PageTemplate},

    mixins: [MultiSelectList, WindowBase, PageBase, HybridVpnGatewayList],

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
                self.$router.push({name: 'detailHybridTencentVpcVpnGateway', params: {uuid: item.uuid}})
              },
              className: 'link',
              field: 'name'
            },
            {
              getContent: item => self.getField('publicIp', item),
              getHeaderContent: self.$t('hybridTencentvirtualrouterentry.ip'),
              sortable: true,
              tooltip: true,
              field: 'publicIp'
            },
            {
              getContent: item => self.getField('status', item),
              getHeaderContent: self.$t('common.status'),
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
        let self = this, normalFields = ['name', 'publicIp'];
        if(_.includes(normalFields, field)) return item[field];
        if(field === 'status')  return item[field].charAt(0) + item[field].slice(1).toLowerCase();
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      }
    },
  }
</script>

<style scoped>

</style>
