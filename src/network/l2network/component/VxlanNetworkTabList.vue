<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">{{ $t('l2network.vxlanNetwork') }}{{$t("common.colon")}}</span>
          <drop-down class="detail-dropdown">
              <span slot="title">
                <span id="common-actions" class="text">{{$t('common.actions')}}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">
                  <a id="l2network-createVxlanNetwork" style="padding-top: 12px;" @click="canCreateVxlanNetwork() && pageCreateVxlanNetwork()" :class="{'disabled-text': !canCreateVxlanNetwork()}">{{$t("l2network.createVxlanNetwork")}}</a>
                  <a id="l2network-deleteVxlanNetwork" style="padding-bottom: 12px;" @click="isSelected && pageDestroy()" :class="{'disabled-text': !isSelected}">{{$t("l2network.deleteVxlanNetwork")}}</a>
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
                >
          <template slot-scope="scope">
            <a class="link" @click="goToDetail(scope.row)">{{scope.row.name}}</a>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.type')" prop="type" >
        </el-table-column>
        <el-table-column label="Vni"  prop="vni">
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

  export default {
    name: "VxlanNetworkTabListForL2Network",
    mixins:[Root,WindowBase,MultiSelectList],
    props:['param'],
    created() {
      this.updateWindow({
        dataUuid:this.param.uuid,
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        currPageUuid: '',
        methods: {
          queryList: this.queryList
        },
        conditions: this.param ? this.param.conditions : []
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
    },
    methods:{
      ...Utils,
      getData(){
        let uuidList=[]
        if(!_.isArray(this.windowData.uuidList)) return[]

        uuidList=this.windowData.uuidList.filter(uuid=>this.dbData.l2network[uuid])

        return uuidList.map(uuid=>{
          return this.dbData.l2network[uuid]
        })
      },
      getCondition: function () {
        let conditionList = []
        conditionList.push(`zone.uuid=${localStorage.getItem('currZoneUuid')}`)
        let conditions = this.param && this.param.conditions ? this.param.conditions : []
        conditionList = conditionList.concat(conditions)
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      queryList: async function () {
        let self = this
        let resp = await rpc.query('l2-networks/vxlan', {
          start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
          limit: self.windowData.pageSize,
          replyWithCount: true,
          sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`,
          q: self.getCondition()
        })
        this.updateWindow({
          pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
          availableCount: resp.total
        })
        let uuidList = resp.inventories.map((item) => item.uuid)
        let table = {}
        uuidList.forEach((uuid) => {
          table[uuid] = {
            selected: false
          }
        })
        self.updateWindow({ uuidList, table })
        self.updateDbTable({
          tableName: 'l2network',
          list: resp.inventories
        })
        this.itemList = this.getData();
      },
      canCreateVxlanNetwork: function () {
        const self = this
        let l2network = _.cloneDeep(self.dbData.l2network[self.windowData.dataUuid])
        if (l2network && l2network.attachedClusterUuids && l2network.attachedClusterUuids.length > 0) return true
        else return false
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({ showMoreDropdown: !this.windowData.showMoreDropdown })
        $event.stopPropagation()
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({ showMoreDropdown: false })
      },
      pageCreateVxlanNetwork: function () {
        let self = this,
          param = {
            ok: (params) => {
              self.createVxlanNetwork(self.windowData.dataUuid, params)
                .then(() => {
                  self.refreshMainPageL2Network()
                })
            }
          }

        self.param.createVxlanNetworkforVxlanPool(param);
      },
      refreshMainPageL2Network: function () {
        const self = this
        let listPageId
        Object.keys(self.$store.state.windowManager.windows).forEach((_id) => {
          if (_id.indexOf('MainPage-') > -1) {
            listPageId = self.$store.state.windowManager.windows[_id].currPageWindowId
          }
        })
        if (listPageId !== undefined) {
          _.forIn(self.$store.state.windowManager.windows[listPageId], (item) => {
            if (item && item.refreshL2Network) {
              item.refreshL2Network()
            }
          })
        }
      },
      createVxlanNetwork: function (l2NetworkUuid, params) {
        let event = this.createEvent('l2network.action.create', params.name)
        return rpc.create('l2-networks/vxlan', {
          'name': params.name,
          'description': params.description,
          'vni': params.vni,
          'poolUuid': this.windowData.dataUuid,
          'zoneUuid': localStorage.getItem('currZoneUuid')
        }, event).then((resp) => {
          this.detailQuery(this.windowData.dataUuid)
          this.incEventSuccess(event)
        }, () => this.incEventFail(event))
      },
      pageDestroy: function () {
        let self = this
        let uuidList = []
        uuidList = self.selectedList;
        this.openDialog('ConfirmDlg', {
          l2NetwotkUuid: this.windowData.dataUuid,
          title: 'l2network.deleteL2Network',
          description: 'l2network.info.deleteConfirm',
          icon: 'l2_popupico',
          warning: 'l2network.info.deleteConfirmWarning',
          uuidList,
          ok: () => {
            let event = self.createEvent('l2network.action.delete', uuidList.length === 1 ? self.dbData.l2network[uuidList[0]].name : '', uuidList.length)
            uuidList.forEach(function (uuid) {
              ((uuid) => {
                rpc._delete(`l2-networks/${uuid}`, null, event)
                  .then((resp) => {
                    self.incEventSuccess(event)
                    self.detailQuery(self.windowData.dataUuid)
                    self.refreshMainPageL2Network()
                  }, () => self.incEventFail(event))
              })(uuid)
            })
          },
          getName: (uuid) => {
            return self.dbData.l2network[uuid].name
          }
        })
      },
      detailQuery: function (uuid) {
        let self = this
        rpc.query('l2-networks', {
          q: `uuid=${uuid}`
        })
          .then((resp) => {
            if (resp.success === true) {
              self.updateDbRow({
                tableName: 'l2network',
                id: uuid,
                data: resp.inventories[0]
              })
              self.queryList()
            }
          })
      },
      //vxlan详情
      goToDetail(item) {
        let self = this;
        self.$router.push({name: 'detaill2network', params: {uuid: item.uuid}})
      }
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
      'dbData.l2network': function (conditions, oldConditions) {
        // this.$nextTick(this.resizeHeader)
      },
      'param': function (newValue, oldValue) {
        if (!_.isEqual(newValue, oldValue)) {
          this.updateWindow({
            conditions: this.param ? this.param.conditions : []
          }).then(() => this.queryList())
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

