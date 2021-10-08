<template>
  <page-template>
    <div slot="page-header" style="height: 60px; line-height: 60px;">
      <el-row :gutter="14">
        <el-col :span="2.2">
          <span class="page-header-title" v-text="$t(`common.loadbalancer`)"></span>
        </el-col>
        <el-col :span="2.2" style="padding-left: 50px;">
          <el-tabs v-model="windowData.currTab">
            <el-tab-pane :label="`${$t('common.available')}(${windowData.availableCount})`"
                         name="available"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row style="flex-wrap: nowrap;" type="flex">
        <div style="flex-shrink: 0;">
                    <span class="btn-success" v-permission="'LB.CREATE'" @click="goToCreate"
                          v-if="windowData.currTab === 'available'">
                        <i class="el-icon-plus icon"></i>{{ $t('loadbalancer.create') }}</span>
          <drop-down class="btn-primary more dropdown" v-if="windowData.currTab=== 'available'"
                     :class="{'disabled': isSelected <=0}" :enabled="isSelected >0">
                        <span slot="title">
                            <i class="el-icon-more"></i>
                            <span class="text">{{ $t("common.moreActions") }}</span>
                        </span>
            <span slot="content">
                            <transition name="fade" type="transition" mode="out-in">
                                <div class="dropdown-content" style="padding:4px 20px;" v-if="windowData.currTab === 'available'">
                                    <a style="padding-top: 12px;" v-permission="'LB_LISTENER.CREATE'"
                                       @click="isSingleSelected && createLoadBalancerListener()"
                                       :class="{ 'disabled-text': !isSingleSelected}"
                                       v-text="$t('loadbalancer.createListener')"></a>
                                    <a style="padding-bottom: 12px;" v-permission="'LB.DELETE'" @click="pageDelete()"
                                       v-text="$t('common.destroy')"></a>
                                </div>
                            </transition>
                        </span>
          </drop-down>
        </div>
        <div style="flex-shrink: 1;flex-grow: 1;"></div>
        <div style="text-align: right;flex-shrink: 0;">
                    <span style="padding: 0 15px;display: inline-block;">
                        <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
                        <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                            <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)"
                                       :key="index" :value="item.value"></el-option>
                        </el-select>
                        <span slot="append"><i class="el-icon-search icon"></i></span>
                        </el-input>
                    </span>
          <span @click="refresh()" class="btn-refresh"><i class="el-icon-refresh icon"></i></span>
        </div>
      </el-row>
    </div>
    <div slot="page-table-content">
      <el-table :data="itemList" @selection-change="handleSelect" @sort-change="handleSort" ref="multipleTable"
                style="width: 100%;" tooltip-effect="dark" v-loading="windowData.loading">
                <span slot="empty" class="table-nodata">
                 <p class="empty-text" v-text="$t('common.noData')"></p>
                </span>
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column :label="$t('common.name')" prop="name" sortable>
          <template slot-scope="scope">
            <span @click="$router.push(`detailloadbalancer/${scope.row.uuid}`);" class="link"
                  v-text="scope.row.name"></span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.vipIp')" prop="Ip">
          <template slot-scope="scope">
            <!--<table-body-item-list v-text="scope.row.ip" copy="true"></table-body-item-list>-->
            <table-body-item-list :content="dbData.vip[scope.row.vipUuid] && dbData.vip[scope.row.vipUuid].ip"
                                  copy="true"></table-body-item-list>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.state')" prop="state" sortable>
          <template slot-scope="scope">
            <table-body-item-state :state="scope.row.state"></table-body-item-state>
          </template>
        </el-table-column>
        <el-table-column
          prop="createDate"
          :label="$t('common.createDate')"
          sortable>
          <template slot-scope="scope">
            {{scope.row.createDate | dateFormat('yyyy-MM-dd hh:mm:ss')}}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-if="windowData.availableCount > 0"
                     :page-sizes="[10, 20, 50, 100]"
                     :page-size="windowData.pageSize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="windowData.availableCount"
                     class="page-table-pagination"
                     @current-change="pageCurrentChange"
                     @size-change="pageSizeChange"
                     :current-page="windowData.pageIndex">
      </el-pagination>
    </div>
  </page-template>
</template>

<script>
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils';
  import BalanceList from './List';
  import PageBase from 'src/windows/PageBase';
  import MultiSelectList from 'src/windows/Base/MultiSelectList'
  import TableBodyItemList from "../../component/TableBodyItemList";
  import TableBodyItemState from "../../component/TableBodyItemState";

  export default {
    name: "LoadBalancerPage",
    mixins: [Root, WindowBase, BalanceList, PageBase, MultiSelectList],
    components: {
      TableBodyItemState,
      TableBodyItemList,
      PageTemplate
    },
    created() {
      this.updateWindow({
        showMoreDropdown: false,
        pageIndex: 1,
        pageSize: 10,
        currItemUuid: '',
        currTab: 'available',
        sortBy: 'createDate',
        sortDirection: '-',
        loading: false,
        availableCount: 0,
        selectedUuidList: [],
        methods: {
          queryList: this.queryList
        }
      })
        .then(() => {
          this.queryList()
        });
      window.addEventListener('click', this.toggleClick, true)
    },
    data() {
      return {
        searchStr: '',
        selectVal: "name",
        availableCount: 0,
        destroyedCount: 0,
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
        showDownLoadOption: false,
        itemList: []
      }
    },
    methods: {
      ...Utils,
      toggleClick() {
        let self = this;
        self.showDownLoadOption = false;
      },
      createLoadBalancerListener(){
        let self = this;
        self.$router.push({name: 'createloadbalancerlistener', params: {portList: self.getLoadBalancerPort(self.selectedList[0])}})
      },
      goToCreate(){
        let self = this;
        self.$router.push({name: 'createloadbalancer'})
      },
      getLoadBalancerPort: function (uuid) {
        return this.dbData.loadBalancer[uuid].listeners.map((item) => item.loadBalancerPort)
      },
    },
    filters: {
      dateFormat(val, fmt) { //author: meizz
        let value = new Date(val);
        var o = {
          "M+": value.getMonth() + 1,                 //月份
          "d+": value.getDate(),                    //日
          "h+": value.getHours(),                   //小时
          "m+": value.getMinutes(),                 //分
          "s+": value.getSeconds(),                 //秒
          "q+": Math.floor((value.getMonth() + 3) / 3), //季度
          "S": value.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt))
          fmt = fmt.replace(RegExp.$1, (value.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
          if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
      }
    },

  }
</script>

<style scoped>

</style>
