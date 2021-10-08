<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">DNS{{$t("common.colon")}}</span>
          <drop-down class="detail-dropdown">
              <span slot="title">
                <span id="common-actions" class="text">{{$t('common.actions')}}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">
                  <a id="common-addDns" style="padding-top: 12px;" @click="pageAddDns()">{{$t("common.addDns")}}</a>
                  <a id="common-deleteDns" style="padding-bottom:12px;" @click="isSelected && pageDeleteDns(windowData.dataUuid)" :class="{'disabled-text': !isSelected}">{{$t("common.deleteDns")}}</a>
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
      <el-table :data="windowData.uuidList" @selection-change="handleSelect">
        <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection" width="55" style="padding-left: 15px;"></el-table-column>
        <el-table-column label="DNS" show-overflow-tooltip>
          <template slot-scope="scope">
            {{scope.row}}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-if="windowData.uuidList.length > 0"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="windowData.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="windowData.uuidList.length"
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
  import Root from 'src/windows/Root';
  import MultiSelectList from 'src/windows/Base/MultiSelectList'
  import List from '../List'

  export default {
    name: "L3networkDnsTabList",
    mixins:[Root,WindowBase,MultiSelectList,List],
    props:['param'],
    components:{
    },
    created() {

      this.updateWindow({
        dataUuid:this.param.uuid,
        selectedUuidList:[],
        uuidList: [],
        methods: {
          queryList: this.queryList
        }
      }).then(() => {
        this.queryList()
        this.hasPermission()
      })

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
        selectVal: 'dns',
        conditionNameList:[
          {
            name: 'common.name',
            value: 'dns'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          }
        ],
        selectList: []
      }
    },
    computed:{
      isSingleSelected: function () {
        let self = this;
        return self.selectList.length === 1;
      },
      isSelected: function () {
        let self = this;
        return self.selectList.length >= 1
      },
    },
    methods:{
      ...Utils,
      handleSelect(rows){
       let self = this;
       self.selectList = rows;
      },

      getCondition() {
        let self = this, conditionList = [];
        if (self.searchStr !== '' && self.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
        }
        return conditionList;
      },

      queryList: function () {
        const self = this
        rpc.query(`l3-networks/${self.windowData.dataUuid}`, {
          q: self.getCondition()
        })
          .then((resp) => {
            if (resp.inventories.length <= 0) return
            let uuidList = resp.inventories[0].dns === undefined ? [] : resp.inventories[0].dns
            let table = {}
            uuidList.forEach((dns) => {
              table[dns] = {
                selected: false
              }
            })
            self.updateWindow({ uuidList, table })
          })
      },
      hasPermission: function () {
        let self=this
        let currentAccountUuid = self.browserLocalStorageGetItem('accountUuid')
        let hasPermission = self.dbData.common.isAdmin || self.dbData.l3network[self.windowData.dataUuid] && (self.dbData.l3network[self.windowData.dataUuid].accountUuid === currentAccountUuid)
        return self.updateWindow({ hasPermission })
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({ showMoreDropdown: !this.windowData.showMoreDropdown })
        $event.stopPropagation()
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({ showMoreDropdown: false })
      },
      detailQuery: function () {
        let self = this
        let uuid = this.windowData.dataUuid
        rpc.query('l3-networks', {
          q: `uuid=${uuid}`
        })
          .then((resp) => {
            if (resp.success === true) {
              if (!_.has(resp.inventories[0], 'dns')) resp.inventories[0].dns = []
              self.updateDbRow({
                tableName: 'l3network',
                id: uuid,
                data: resp.inventories[0]
              })
              self.queryList()
            }
          })
      },
      pageAddDns: function () {
        this.openDialog('AddDNSDlg', {
          ok: (dns) => this.addDnsToL3Network(this.windowData.dataUuid, dns)
        })
      },
      addDnsToL3Network: function (l3NetworkUuid, dns) {
        let event = this.createEvent('l3network.action.addDns', this.dbData.l3network[l3NetworkUuid].name)
        let self = this
        rpc.create(`l3-networks/${l3NetworkUuid}/dns`, {
          'dns': dns
        }, event).then((resp) => {
          self.detailQuery()
          self.incEventSuccess(event)
        }, () => self.incEventFail(event))
      },
      pageDeleteDns: function (l3NetworkUuid) {
        let self = this
        let uuidList = []
        uuidList = self.selectList;
        this.openDialog('ConfirmDlg', {
          title:'l3network.deleteDns',
          description: 'l3network.info.deleteDns',
          icon: 'dns',
          uuidList,
          ok: () => {
            self.removeDnsFromL3Network(l3NetworkUuid, uuidList, self.queryList)
          },
          getName: (dns) => {
            return dns;
          }
        })
        // this.detailOpenInplaceDialog('DnsListConfirmDlg', this.windowData.dataUuid, (dnsList) => this.removeDnsFromL3Network(this.windowData.dataUuid, dnsList))
      },
      removeDnsFromL3Network: function (l3NetworkUuid, dnsList) {
        let event = this.createEvent('l3network.action.deleteDns', this.dbData.l3network[l3NetworkUuid].name)
        const self = this
        dnsList.forEach(function (dns) {
          ((dns) => {
            rpc._delete(`l3-networks/${l3NetworkUuid}/dns/${dns}`, null, event)
              .then((resp) => {
                self.detailQuery()
                self.setEventSuccess(event)
              }, () => self.setEventFail(event))
          })(dns)
        })
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
        // this.$nextTick(this.resizeHeader)
      },
      'param': function (newValue, oldValue) {
        if (!_.isEqual(newValue, oldValue)) {
          this.updateWindow({
            conditions: this.param && this.param.conditions ? this.param.conditions : [],
            dataUuid: this.param.uuid
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

