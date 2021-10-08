<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">{{ $t('common.netRange') }}{{$t("common.colon")}}</span>
          <drop-down class="detail-dropdown">
              <span slot="title">
                <span id="common-actions" class="text">{{$t('common.actions')}}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">
                  <a id="common-addIpRange" style="padding-top: 12px;" :class="{'disabled-text': isSelected}" @click="!isSelected && pageAddIpRange()">{{$t("common.addIpRange")}}</a>
                  <a id="common-deleteIpRange" style="padding-bottom:12px;" @click="isSelected && pageDestroy()" :class="{'disabled-text': !isSelected}">{{$t("common.deleteIpRange")}}</a>
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
      <el-table :data="itemList" @selection-change="handleSelection">
        <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection" width="55" style="padding-left: 15px;"></el-table-column>
        <el-table-column
                :label="$t('common.startIp')"
                width="120"
                prop="startIp"
                show-overflow-tooltip
                sortable>
        </el-table-column>
        <el-table-column :label="$t('common.endIp')" prop="endIp">
        </el-table-column>
        <el-table-column :label="$t('common.endIp')" prop="netmask">
        </el-table-column>
        <el-table-column :label="$t('common.endIp')" prop="gateway">
        </el-table-column>
        <el-table-column label="CIDR" prop="networkCidr">
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
  import List from '../List';
  import Controller from '../Controller';

  export default {
    name: "L3networkIpRangesTabList",
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
        selectUuidList:[],
        methods: {
          queryList: this.queryList
        }
      }).then(() => {
        this.queryList()
        this.hasPermission()
      })
      // window.addEventListener('resize', this.resizeHeader)
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
        selectVal: 'startIp',
        conditionNameList:[
          {
            name: 'common.startIp',
            value: 'startIp'
          },
          {
            name: 'common.endIp',
            value: 'endIp'
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
      isSingleSelected(){
        let self = this;
        if(self.windowData.selectUuidList.length !==1) return false;
        return self.windowData.selectUuidList.length === 1;
      },
      isSelected() {
        let self = this;
        if(self.windowData.selectUuidList.length <=0) return false;
        return self.windowData.selectUuidList.length > 0;
      },
      selectedList(){
        let self = this;
        return self.windowData && self.windowData.selectUuidList;
      }
    },
    methods:{
      ...Utils,
      pageSizeChange(val) {
        this.updateWindow({
          pageSize: val
        })
      },
      pageCurrentChange(val) {
        this.updateWindow({
          pageIndex: val
        })
      },
      handleSelection(val) {
        this.selectList = val;
        this.updateWindow({
          selectList: this.selectList
        })
      },
      handleSelectAll(val) {
        this.selectList = [];
        this.selectList = val;
        this.updateWindow({
          selectList: this.selectList
        })
      },
      handleSort(e) {
        if (e.order === 'ascending') {
          this.updateWindow({
            sortBy: e.prop,
            sortDirection: '+'
          })
        } else {
          this.updateWindow({
            sortBy: e.prop,
            sortDirection: '-'
          })
        }
        this.queryList();
      },
      refresh: function (uuid) {
        this.updateWindow({
          pageIndex: 1,
          searchStr:'',
          currItemUuid: '',
        })
        this.queryList()
        this.updateWindow()
      },
      search() {
        let self = this;
        self.updateWindow({
          pageIndex: 1
        })
        if(self.windowData.pageIndex ===1 ) self.queryList();
      },
      handleSelection(row) {
        let selectUuidList = [], self  = this;
        selectUuidList =  row.map((item) => item.uuid);
        self.updateWindow({
          selectUuidList
        })
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
      queryList: async function () {
        let resp = await rpc.query('l3-networks/ip-ranges', {
          count: false,
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          q: this.getCondition(),
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
        })
        this.updateWindow({
          pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
          availableCount: resp.total
        })
        let uuidList = resp.inventories.map((item) => item.uuid)
        this.updateWindow({ uuidList})
        this.updateDbTable({
          tableName: 'ipRange',
          list: resp.inventories
        }).then(() => {
          this.itemList = this.getItemList();
        })
      },

      getItemList(){
        let self = this;
        return self.windowData.uuidList.map(uuid => {
          return self.dbData.ipRange[uuid];
        })
      },

      hasPermission: function () {
        return Controller.hasPermission(this)
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({ showMoreDropdown: !this.windowData.showMoreDropdown })
        $event.stopPropagation()
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({ showMoreDropdown: false })
      },
      pageAddIpRange: function () {
        let self = this;
        self.param.addIpRange(self.queryList);
      },
      addIpRange: function (l3NetworkUuid, params) {
        let event = this.createEvent('l3network.action.addIpRange', this.dbData.l3network[l3NetworkUuid].name)
        if (!params.showMethod) {
          rpc.create(`l3-networks/${l3NetworkUuid}/ip-ranges`, {
            'name': this.dbData.l3network[l3NetworkUuid].name,
            'startIp': params.startIp,
            'endIp': params.endIp,
            'netmask': params.netmask,
            'gateway': params.gateway
          }, event).then((resp) => {
            this.getIpAddressCapacity(l3NetworkUuid)
            this.detailQuery()
            this.incEventSuccess(event)
          }, () => this.incEventFail(event))
        } else {
          this.addIpRangeByNetworkCidr(l3NetworkUuid, params, event).then(() => this.detailQuery())

        }
      },
      deleteIpRange: function (uuidList) {
        const self = this
        let event = self.createEvent('l3network.action.deleteIpRange', uuidList.length === 1 ? self.dbData.l3network[self.windowData.dataUuid].name : '', uuidList.length)
        let tasks = []
        let p = null
        uuidList.forEach(function (uuid) {
          ((uuid) => {
            p = rpc._delete(`l3-networks/ip-ranges/${uuid}`, null, event)
              .then((resp) => {
                self.getIpAddressCapacity(self.windowData.dataUuid)
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
      },
      pageDestroy: function () {
        let self = this
        let selectedUuidList = this.selectedList
        if (selectedUuidList.length === 0) return
        let warningText = 'common.warningForDeleteIpRange'
        if (this.dbData.l3network[this.windowData.dataUuid] && this.dbData.l3network[this.windowData.dataUuid].category === 'Public') {
          warningText = 'common.warningForDeleteIpRangeWithPub'
        }
        let lowerCase = () => {
          return this.dbData.l3network[this.param.uuid].category.replace(/\b(\w)|\s(\w)/g, (m) => {
            return m.toLowerCase();
          })
        }
        this.openDialog('ConfirmDlg', {
          title: 'l3network.deleteIpRange',
          description: 'l3network.info.deleteIpRangeConfirm',
          icon: lowerCase() + '_network_n',
          uuidList: selectedUuidList,
          ok: () => self.deleteIpRange(selectedUuidList).then(() => self.detailQuery()),
          warning: warningText,
          getName: () => {
            return self.dbData.l3network[self.param.uuid].name;
          }
        })
      },
      detailQuery: function () {
        let self = this
        let uuid = this.windowData.dataUuid
        rpc.query('l3-networks', {
          q: `uuid=${uuid}`
        })
          .then((resp) => {
            if (resp.success === true) {
              self.updateDbRow({
                tableName: 'l3network',
                id: uuid,
                data: resp.inventories[0]
              })
              self.queryList()
            }
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
      'dbData.ipRange': function (conditions, oldConditions) {
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

