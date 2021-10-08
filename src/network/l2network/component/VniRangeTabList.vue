<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">{{ $t('l2network.vniRanges') }}{{$t("common.colon")}}</span>
          <drop-down class="detail-dropdown" v-if="dbData.l2network[windowData.dataUuid].type !== 'VxlanNetwork'">
              <span slot="title">
                <span id="common-actions" class="text">{{$t('common.actions')}}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">
                  <a id="l2network-createVniRange" style="padding-top: 12px;" @click="pageAddVniRange()">{{$t("l2network.createVniRange")}}</a>
                  <a id="l2network-deleteVniRange" style="padding-bottom: 12px;" @click="isSelected && pageDestroy()" :class="{'disabled-text': !isSelected}">{{$t("l2network.deleteVniRange")}}</a>
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
            <a>{{scope.row.name}}</a>
          </template>
        </el-table-column>
        <el-table-column :label="$t('l2network.startVni')" prop="startVni" >
        </el-table-column>
        <el-table-column :label="$t('l2network.endVni')"  prop="endVni">
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
    name: "VniRangesTabListForL2Network",
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
      getCondition() {
        let self = this, conditionList = [];
        conditionList = self.windowData.conditions;
        if(self.selectVal !== "" && self.searchStr !== "") {
          conditionList = conditionList.concat(`${self.selectVal}%25${encodeURIComponent((self.searchStr))}%25`)
        }
        return conditionList;
      },
      queryList: async function () {
        let self = this
        let resp = await rpc.query('l2-networks/vxlan-pool/vni-range', {
          q: self.getCondition(),
          replyWithCount: true
        })
        let uuidList = resp.inventories.map((item) => item.uuid)
        let table = {}
        uuidList.forEach((uuid) => {
          table[uuid] = {
            selected: false
          }
        })
        self.updateWindow({ uuidList, table,  availableCount: resp.total });
        self.updateDbTable({
          tableName: 'vniRange',
          list: resp.inventories,
        })
        this.itemList = this.getData();
      },
      getData(){
        let uuidList=[]
        if(!_.isArray(this.windowData.uuidList)) return[]

        uuidList=this.windowData.uuidList.filter(uuid=>this.dbData.vniRange[uuid])

        return uuidList.map(uuid=>{
          return this.dbData.vniRange[uuid]
        })
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({ showMoreDropdown: !this.windowData.showMoreDropdown })
        $event.stopPropagation()
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({ showMoreDropdown: false })
      },
      pageAddVniRange: function () {
        const self = this;
        let param = {
          ok: (params) => this.addVniRange(this.windowData.dataUuid, params)
        }
        self.param.addVniRange(param)
      },
      addVniRange: function (l2NetworkUuid, params) {
        let event = this.createEvent('l2network.action.addVniRange', this.dbData.l2network[l2NetworkUuid].name)
        rpc.create(`l2-networks/vxlan-pool/${l2NetworkUuid}/vni-ranges`, {
          'name': params.name,
          'startVni': params.startVni,
          'endVni': params.endVni,
          'l2NetworkUuid': l2NetworkUuid
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
          title: 'l2network.deleteVniRange',
          description: 'l2network.info.deleteVniRange',
          warning:'l2network.info.deleteVniRangeWarning',
          l2NetworkUuid: self.windowData.dataUuid,
          uuidList,
          icon: 'l2_popupico',
          ok: () => {
            let event = self.createEvent('l2network.action.deleteVniRange', uuidList.length === 1 ? self.dbData.vniRange[uuidList[0]].name : '', uuidList.length)
            uuidList.forEach(function (uuid) {
              ((uuid) => {
                rpc._delete(`l2-networks/vxlan-pool/vni-ranges/${uuid}`, null, event)
                  .then((resp) => {
                    self.incEventSuccess(event)
                    self.detailQuery(self.windowData.dataUuid)
                  }, () => self.incEventFail(event))
              })(uuid)
            })
          },
          getName: (uuid) => {
            return self.dbData.vniRange[uuid].name
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

