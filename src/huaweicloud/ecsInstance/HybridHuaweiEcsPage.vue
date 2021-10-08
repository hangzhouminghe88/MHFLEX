<template>
    <page-template>
      <div slot="page-header">
        <el-row :gutter="10">
          <el-col :span="2.2">
            <div class="page-header-title">
              Ecs云主机
            </div>
          </el-col>
          <el-col :span="2.2">
            <el-tabs v-model="currSelectTab">
              <el-tab-pane name="available" :label="$t(`common.available`) + `(${windowData.availableCount ? windowData.availableCount : 0})`"></el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
      </div>
      <div slot="page-toolbar" class="page-toolbar-container">
        <el-row type="flex">
          <div class="page-toolbar-left">
            <!--创建ecs云主机-->
            <span class="btn-success" @click="goToCreate()">
              <i class="el-icon-plus icon"></i>
              <span class="text">创建ecs云主机</span>
            </span>
            <!--启用-->
            <span class="btn-primary"
                  :class="{'disabled': !isSelected || !inStates(['Stopping', 'Stopped'])}"
                  @click="isSelected && inStates(['Stopping', 'Stopped']) && pageEnableOrDisable('Running')">
              <i class="el-icon-caret-right icon"></i>
              <span class="text">{{$t('common.start')}}</span>
            </span>
            <!--停用-->
            <span class="btn-primary"
                  :class="{'disabled': !isSelected ||! inStates('Running')}"
                  @click="isSelected && inStates('Running') && pageEnableOrDisable('Stopped')">
              <i class="el-icon-remove-outline icon"></i>
              <span class="text">{{$t('common.stop')}}</span>
            </span>
            <!--更多操作-->
            <drop-down class="btn-primary more dropdown"
                       :enabled="isSelected"
                       :class="{'disabled': !isSelected}">
              <span slot="title">
                <i class="el-icon-more icon"></i>
                <span class="text">{{$t('common.moreActions')}}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content">
                  <!--重启云主机-->
                  <a @click="isSelected && !inStates('Stopped') && pageReboot()" style="padding-top: 12px;" :class="{'disabled-text': !(isSelected && !inStates('Stopped'))}">{{$t("common.reboot")}}</a>
                  <!--打开控制台-->
                  <a @click="isSingleSelected && inStates('Running') && pageOpenHuaweiConsole()" :class="{ 'disabled-text': !(isSingleSelected && inStates('Running'))}">{{ $t("vm.console") }}</a>
                  <!--修改密码-->
                  <a @click="isSingleSelected && pageUpdateHuaweiEcsRootPassword()" :class="{ 'disabled-text': !(isSingleSelected)}">{{$t("hybridecsinstance.updateRootPassword")}}</a>
                  <!--删除云主机-->
                  <a @click="isSelected && pageDelete()" style="padding-bottom: 12px;" :class="{'disabled-text': !isSelected}">{{$t("common.destroy")}}</a>
                </div>
              </span>
            </drop-down>
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
        <!--表格分页-->
        <div class="page-table-pagination">
          <el-pagination v-if="windowData.availableCount > 0"
                         :page-sizes="[5, 10]"
                         :page-size="5"
                         :total="windowData.availableCount"
                         class="page-table-pagination"
                         layout="total, sizes, prev, pager, next, jumper"
                         @current-change="pageCurrentChange"
                         @size-change="pageSizeChange"
                         :current-page="windowData.pageIndex"></el-pagination>
        </div>
      </div>
    </page-template>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import PageTemplate from "src/component/PageTemplate";
  //格式化时间
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  //列表请求
  import List from './List.js';

  export default {
    name: "HybridHuaweiEcsPage",
    mixins: [MultiSelectList, WindowBase, List],
    components: {PageTemplate},
    data() {
      let self = this;
      return {
        currSelectTab:  'available',
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {
            name: 'common.name',
            value:  'name'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          }
        ],
        itemList: [],
        //数据源
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
                self.$router.push({name:'detailHybridHuaweiEcs', params: {uuid: item.uuid}})
              },
              field: 'name',
              sortable: true,
              tooltip: true,
              className: 'link'
            },
            {
              getContent: item => self.getField('ecsInstanceId',  item),
              getHeaderContent: 'Ecs云主机Id',
              sortable: true,
              field: 'ecsInstanceId',
              tooltip: true
            },
            {
              getContent: item => self.getField('cpuCores',  item),
              getHeaderContent: self.$t('common.cpu'),
              sortable: true,
              field: 'cpuCores'
            },
            {
              getContent: item => self.getField('memorySize', item),
              getHeaderContent: self.$t('common.memorySize'),
              sortable: true,
              field: 'memorySize'
            },
            {
              getContent: item => self.getField('privateIpAddress', item),
              getHeaderContent: self.$t('common.privateNetworkIP'),
              sortable: true,
              field: 'privateIpAddress',
              tooltip: true
            },
            {
              getContent: item => self.getField('publicIpAddress', item),
              getHeaderContent: self.$t('common.publicNetworkIP'),
              sortable: true,
              field: 'publicIpAddress',
              tooltip: true
            },
            {
              getContent: item => self.getField('paymentInformation', item),
              getHeaderContent: self.$t('hybridecsinstance.paymentInformation'),
              tooltip: true,
            },
            {
              getContent: item => self.getField('vpcName', item),
              getHeaderContent: 'VPC',
              tooltip: true,
            },
            {
              getContent: item => self.getField('identityZoneName', item),
              getHeaderContent: self.$t('hybridvswitch.identityZone'),
              sortable: true,
              field: 'identityZoneUuid',
              tooltip: true,
            },
            {
              getContent: item => self.getField('securityGroupName', item),
              getHeaderContent: self.$t('hybridesecuritygroup.securitygroup'),
              sortable: true,
              field: 'ecsSecurityGroupUuid',
              tooltip: true,
            },
            {
              getContent: item => self.getField('ecsStatus', item),
              getHeaderContent: self.$t('common.state'),
              field: 'ecsStatus'
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
    created() {
      //初始化表格分页以及查找、选择参数；并请求表格接口
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
        let self = this, normalFields= ['name', 'securityGroupName', 'cpuCores', 'ecsInstanceId', 'privateIpAddress', 'publicIpAddress', 'identityZoneName', 'vpcName'];
        if(normalFields.includes(field)) return item[field]
        if(field === 'ecsStatus') return item['ecsStatus'].toLowerCase().charAt(0).toUpperCase() + item['ecsStatus'].toLowerCase().slice(1);
        if(field === 'memorySize') return item[field] + 'G';
        if(field === 'paymentInformation') return item.chargeType ? self.$t(`hybridTencentEcsInstance.${item.chargeType}`) : self.$t('hybridecsinstance.afterPayment');
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },
      //跳转到添加页面
      goToCreate() {
        let self = this;
        self.$router.push({name: 'createHybridHuaweiEcs'})
      }
    }
  }
</script>

<style scoped>

</style>
