<template>
    <page-template>
      <div slot="page-header" style="height: 60px; line-height: 60px;">
        <el-row :gutter="10">
          <el-col :span="2">
            <span class="page-header-title">{{ $t(`common.ipsec`) }}</span>
          </el-col>
          <el-col :span="2.2">
            <el-tabs v-model="currTab">
              <el-tab-pane :label="`${$t('common.available')}(${windowData.availableCount ? windowData.availableCount : '0'})`" name="available" ></el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
      </div>
      <div slot="page-toolbar" class="page-toolbar-container">
        <el-row type="flex" justify="space-between">
          <div style="flex-shrink: 0;">
            <span class="btn-success" @click="updateWindow({ currItemUuid: '' }); openCreateIPsecDlg()"><i class="el-icon-plus icon"></i>{{$t('ipsec.create')}}</span>
            <span class="btn-primary" style="position: relative;" :class="{ 'disabled': !isSelected || windowData.currItemUuid !== '' }" @click="isSelected && windowData.currItemUuid === '' && pageDelete()">
              <i class="el-icon-remove-outline icon"></i>
              {{$t("common.destroy")}}
            </span>
          </div>
          <div style="text-align: right;flex-shrink: 0;">
          <span style="padding: 0 15px;display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
            <span class="btn-refresh" @click="refresh()"><i class="el-icon-refresh icon"></i></span>
          </div>
        </el-row>
      </div>

      <div slot="page-table-content" style="max-height: 400px;">
        <el-table
          ref="multipleTable"
          :data="itemList"
          tooltip-effect="dark"
          style="width: 100%"
          @selection-change="handleSelect"
          v-loading="windowData.loading"
          @sort-change="handleSort"
        >
          <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
          </span>
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            :label="$t('common.name')"
            prop="name"
          >
            <template slot-scope="scope">
              <a class="link" @click="goToDetail(scope.row.uuid)">{{scope.row.name}}</a>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.vipIp')"
            prop=""
          >
            <template slot-scope="scope">
              {{dbData.ipsec[scope.row.uuid].vipUuid && dbData.vip[dbData.ipsec[scope.row.uuid].vipUuid] && dbData.vip[dbData.ipsec[scope.row.uuid].vipUuid].ip}}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.peerAddress')"
            prop="peerAddress"
          >
          </el-table-column>

          <el-table-column
            :label="$t('common.state')"
            prop="state"
          >
            <template slot-scope="scope">
              <table-body-item-state slot="item" :state="scope.row.state"/>
            </template>
          </el-table-column>

          <el-table-column
            :label="$t('common.status')"
            prop="status"
          >
            <template slot-scope="scope">
              <table-body-item-state slot="item" :state="scope.row.status"/>
            </template>
          </el-table-column>

          <el-table-column
            :label="$t('common.createDate')"
            prop="createDate">
            <template slot-scope="scope">
              {{formatDatetime(new Date(scope.row.createDate))}}
            </template>
          </el-table-column>
        </el-table>
        <div class="page-table-pagination">
          <el-pagination v-if="windowData.availableCount > 0"
            :current-page="windowData.pageIndex"
            :page-size="windowData.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="windowData.availableCount"
            @current-change="pageCurrentChange"
            @size-change="pageSizeChange"
            class="page-table-pagination"
            layout="total, sizes, prev, pager, next, jumper">
          </el-pagination>
        </div>
      </div>
    </page-template>
</template>

<script>
  import List from './List'
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils'
  import TableBodyItemState from "../../component/TableBodyItemState";
  import MultiSelectList from 'src/windows/Base/MultiSelectList';

  export default {
    name: "IPsecPage",
    mixins: [Root,WindowBase,List, MultiSelectList, PageBase],
    components: {PageTemplate,TableBodyItemState},
    created: function () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: '',
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        loading: false,
        methods: {
          queryList: this.queryList
        },
      })
        .then(() => {
          this.queryList()
        })

    },
    computed:{
    },
    destroyed: function () {

    },
    data () {
      return {
        currTab: 'available',
        conditionNameList: [
          {
            name: 'common.name',
            value: 'name'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          },
          {
            name: 'common.vipIp',
            value: 'vip.ip'
          },
          {
            name: 'common.peerAddress',
            value: 'peerAddress'
          }
        ],
        searchStr: "",
        selectVal: 'name',
        itemList:[]
      }

    },
    methods: {
      openCreateIPsecDlg: function () {
        this.$router.push({name:'createipsec'});
      },

      goToDetail(uuid) {
        this.$router.push({name: 'detailIPsec', params: {uuid}})
      },
      ...Utils
    },
  }
</script>

<style scoped>

</style>
