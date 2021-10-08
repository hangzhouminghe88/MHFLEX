<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">{{ $t('common.l3network') }}{{$t("common.colon")}}</span>
          <drop-down class="detail-dropdown">
              <span slot="title">
                <span id="common-actions" class="text">{{$t('common.actions')}}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">
                  <a id="common-addIpRange" style="padding-top:12px;" @click="isSingleSelected && (selectedList.length === 1) && pageAddIpRange()" :class="{'disabled-text': !isSingleSelected}">{{$t("common.addIpRange")}}</a>
                  <a id="common-addDns" @click="isSingleSelected && pageAddDns()" :class="{'disabled-text': !isSingleSelected}">{{$t("common.addDns")}}</a>
                  <a id="common-shareToAll" v-permission="'LICENSE_BASIC_PAID'" @click="isSelected && hasNotSharedToAll() && shareResourceToAll()" :class="{ 'disabled-text': !isSelected || !hasNotSharedToAll()}" v-if="dbData.common.isAdmin">{{$t("common.shareToAll")}}</a>
                  <a id="common-recallFromAll" v-permission="'LICENSE_BASIC_PAID'" @click="isSelected && hasSharedToAll() && recallL3networkFromAll()" :class="{ 'disabled-text': !isSelected || !hasSharedToAll()}" v-if="dbData.common.isAdmin">{{$t("common.recallFromAll")}}</a>
                  <a id="common-destroy" style="padding-bottom:12px;" @click="isSelected && pageDelete()" :class="{'disabled-text': !isSelected}">{{$t("common.destroy")}}</a>
                </div>
              </span>
          </drop-down>
        </el-col>
        <el-col :span="10" style="text-align: right">
          <span style="display: inline-block;">
            <el-input :placeholder="$t('common.searchPlaceholder')" v-model="searchStr" @blur="search()"
                      @change="search()">
               <el-select v-model="selectVal" slot="prepend" :placeholder="$t('common.searchLabelPlaceholder')"
                          style="width: 105px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </el-col>
      </el-row>
    </div>
    <div slot="page-table-content" style="max-height: 400px;">
      <el-table :data="itemList" @selection-change="handleSelect">
        <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection" width="55" style="padding-left: 15px;"></el-table-column>
        <el-table-column
                :label="$t('common.name')"
                width="120"
                prop="name"
                show-overflow-tooltip
                sortable>
          <template slot-scope="scope">
            <a class="link" @click="goToDetail(scope.row.uuid)">{{scope.row.name}}</a>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.networkType')">
          <template slot-scope="scope">
            {{(dbData.l3network[scope.row.uuid].category === 'Public' || dbData.l3network[scope.row.uuid].category === 'System') ? $t(`common.${dbData.l3network[scope.row.uuid].category}`) : dbData.l3network[scope.row.uuid].networkServiceType ? $t(`l3network.type.${dbData.l3network[scope.row.uuid].networkServiceType}`) : ''}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.state')">
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="scope.row.state"/>
          </template>
        </el-table-column>

        <el-table-column :label="$t('l3network.current')">
          <template slot-scope="scope" v-if="dbData.l3network[scope.row.uuid].availableCapacity !== undefined">
            {{`${dbData.l3network[scope.row.uuid] && dbData.l3network[scope.row.uuid].availableCapacity} / ${dbData.l3network[scope.row.uuid] && dbData.l3network[scope.row.uuid].totalCapacity}`}}
          </template>
          <template slot-scope="scope" v-else>
            {{''}}
          </template>
        </el-table-column>

        <el-table-column label="CIDR">
          <template slot-scope="scope">
            {{dbData.l3network[scope.row.uuid].ipRanges.length > 0 ? dbData.l3network[scope.row.uuid].ipRanges[0].networkCidr : void 0}}
          </template>
        </el-table-column>

        <el-table-column prop="createDate" :label="$t('common.createDate')"  sortable>
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
  </div>
</template>

<script>
  import WindowBase from 'src/windows/Window'
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc'
  import _ from 'lodash'
  import PageTemplate from "../../../component/PageTemplate";
  import Root from 'src/windows/Root';
  import TableBodyItemState from 'src/component/TableBodyItemState'
  import MultiSelectList from 'src/windows/Base/MultiSelectList'
  import List from '../List'

  export default {
    name: "L3NetworkTabList",
    mixins:[Root,WindowBase,MultiSelectList,List],
    props:['param'],
    components:{
      PageTemplate,
      TableBodyItemState
    },
    created() {
      this.updateWindow({
        dataUuid:this.param.uuid,
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList:[],
        currentAccountUuid: window.localStorage.getItem('accountUuid'),
        methods: {
          queryList: this.queryList
        },
        conditions: this.param && this.param.conditions ? this.param.conditions : []
      }).then(() => this.queryList())
      window.addEventListener('click', this.onWindowClick)
    },
    updated() {
    },
    destroyed() {
      window.removeEventListener('click', this.onWindowClick)
    },
    data(){
      return{
        searchStr: '',
        selectVal: 'name',
        conditionNameList:[
          {
            name: 'common.name',
            value: 'name'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          }
        ],
        itemList: []
      }
    },
    computed:{
      networkType(){
        let uuid = this.selectedList[0]
        let type = 'publicNetwork'
        switch (this.dbData.l3network[uuid].category) {
          case 'Public':
            type = 'publicNetwork'
            break
          case 'Private':
            type = 'privateNetwork'
            break
          case 'System':
            type = 'systemNetwork'
            break
        }
        return type
      }
    },
    methods:{
      ...Utils,

      onWindowClick: function () {
        if (this.windowData.showMoreDropdown) this.updateWindow({ showMoreDropdown: false })
      },

      getCondition: function () {
        let conditionList = []
        let conditions = this.param && this.param.conditions ? this.param.conditions : []
        conditionList = conditionList.concat(conditions)
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },

      hasPermission: function () {
        let hasPermission = this.dbData.common.isAdmin || this.dbData.l3network[this.windowData.dataUuid] && this.dbData.l3network[this.windowData.dataUuid].accountUuid === this.windowData.currentAccountUuid
        return hasPermission
      },

      shareResources: function (uuid, accountUuid) {
        rpc.update(`accounts`, `resources`, {
          'shareResource': {
            'resourceUuids': uuid,
            'accountUuids': accountUuid,
            'toPublic': false
          }
        })
          .then((resp) => {
            if (resp.success === true) this.queryList()
          })
      },

      recallL3network: function (uuid, accountUuid) {
        let self = this
        let event = this.createEvent('l3network.action.recall', this.dbData.l3network[uuid].name)
        rpc.update('accounts', 'resources', {
          'revokeResourceSharing': {
            'resourceUuids': [uuid],
            'toPublic': false,
            'accountUuids': accountUuid,
            'all': false
          }
        })
          .then((resp) => {
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
      },

      getNetworkServiceTypeName: function (l3network) {
        const self = this
        if (l3network.networkServices.length === 0) return false
        let networkServices = l3network.networkServices.filter((item) => item.networkServiceType !== 'SecurityGroup')
        if (networkServices.length === 0) return false
        // let networkServiceProviderUuid = networkServices[0].networkServiceProviderUuid
        let networkServiceProviderUuid = null
        let flag = false // true = vrouter
        let type = ''
        networkServices.forEach(function (item) {
          ((item) => {
            // if (item.networkServiceType === 'Eip') networkServiceProviderUuid = item.networkServiceProviderUuid
            networkServiceProviderUuid = item.networkServiceProviderUuid
            if (self.dbData.networkServiceType[networkServiceProviderUuid]) {
              if (self.dbData.networkServiceType[networkServiceProviderUuid].type === 'vrouter' || self.dbData.networkServiceType[networkServiceProviderUuid].type === 'VirtualRouter') {
                flag = true
                type = 'vrouter'
              }
              if (self.dbData.networkServiceType[networkServiceProviderUuid].type === 'Flat') {
                type = 'Flat'
              }
            }
          })(item)
        })
        if (flag) {
          return 'vrouter'
        } else {
          return type
        }

      },

      shareResourceToAll: function (uuid) {
        let uuidList = [], self = this;
       uuidList = self.selectedList;
        if (uuidList.length > 0) {
          this.openDialog('SharetoAllConfirmDlg', {
            title: 'common.shareToAll',
            warning:  'instanceOffering.shareToAllText',
            ok: () => {
              this.shareL3NetworkToAll(uuidList)
                .then(() => {
                  this.queryList();
                })
            }
          })
        }
      },

      revokeResource: function () {
        if (this.selectedList.length !== 1) return
        this.detailOpenInplaceDialog('RecallSelectListDlg', {uuid: this.selectedList[0]}, {
          ok: (uuid) => this.recallL3network(this.selectedList[0], uuid)
        })
      },

      pageShareL3Network: function () {
        let uuidList = []
        this.windowData.uuidList.forEach((uuid) => {
          if (this.windowData.table[uuid].selected) uuidList.push(uuid)
        })
        if (uuidList.length === 1) {
          this.openInplaceDialog('SharedSelectList', {uuid: this.dbData.accountRef[uuidList[0]].accountUuid}, {
            share: (uuid) => this.shareL3Network(uuidList, uuid)
          })
        }
      },

      recallL3networkFromAll: function () {
        let uuidList = [], self = this;
        uuidList = self.selectedList;
        if (uuidList.length > 0) {
          this.openDialog('SharetoAllConfirmDlg', {
            title: 'common.recallFromAll',
            warning:  'account.recall',
            ok: () => {
              this.recallFromAll(uuidList)
                .then(() => {
                  this.queryList();
                })
            }
          })
        }
      },

      pageAddIpRange: function () {
        let self = this;
        if (!this.isSingleSelected) return;
        let param={
          uuid: self.selectedList[0],
          ok: (params) => {
            this.addIpRange(this.selectedList[0], params)
          }
        }
        self.param.addIpRange(param);
      },

      pageAddDns: function () {
        const self = this
        self.openDialog('AddDNSDlg', {
          ok: (dns) => this.addDnsToL3Network(this.selectedList[0], dns)
        })
      },

      pageDelete: function () {
        let uuidList = [], self = this;
        uuidList = self.selectedList;
        if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg', {
            title: `l3network.delete${self.dbData.l3network[uuidList[0]].category}Network`,
            description: self.$t("l3network.info.deleteConfirm", {
              length: uuidList.length,
              resourceName: self.$t(`common.${self.networkType}`)
            }),
            warning: self.$t(`l3network.info.${self.networkType}DeleteWarning`),
            icon: self.networkType.replace('N', '_n').replace(/$/, '_n'),
            uuidList,
            getName(uuid){
              return self.dbData.l3network[uuid].name;
            },
            ok: () => {
              self.delete(uuidList)
                .then(() => {
                  self.queryList()
                })
            }
          })
        }
      },

      toggleMoreDropdown: function ($event) {
        this.updateWindow({ showMoreDropdown: !this.windowData.showMoreDropdown })
        $event.stopPropagation()
      },

      //回到详情页
      //跳转到详情页
      goToDetail(uuid) {
        let self = this, router = 'detailPublicNetwork';
        switch(self.dbData.l3network[uuid].category) {
          case 'Public':
            router = 'detailPublicNetwork';
            break;
          case 'System':
            router = 'detailSystemNetwork';
            break;
          case 'Private':
            router = 'detailPrivateNetwork';
            break;
          default:
            router = 'detailPublicNetwork';
        }
        self.$router.push({name:router, params: {uuid}})
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
    watch: {
      'dbData.l3network': function (conditions, oldConditions) {

      },
      'param': function (newValue, oldValue) {
        if (!_.isEqual(newValue, oldValue)) {
          this.updateWindow({
            conditions: this.param && this.param.conditions ? this.param.conditions : []
          }).then(() => this.queryList())
          this.destroyDialogs()
        }
      }
    }

  }
</script>

<style scoped>
  .dropdown {
    display: inline-block;
    position: relative;
    background: #FFFFFF;
    border: 1px solid #D7DCE2;
    border-radius: 2px;
    top: -2px;
    height: 30px;
    color: #3C73B9;
    padding-left: 10px;
    cursor: pointer;
    font-size: 0;
  }

  .dropdown .text {
    position: relative;
    top: 2px;
    font-size: 14px;
  }
</style>

