<template>
  <div class="container">
    <div slot="page-table-content" style="max-height: 400px;">
      <el-table :data="itemList" @selection-change="handleSelect">
        <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection" width="55" style="padding-left: 15px;"></el-table-column>
        <el-table-column
                :label="$t('l2network.vtepIp')"
                width="120"
                prop="vtepIp"
                show-overflow-tooltip
                >
        </el-table-column>
        <el-table-column :label="$t('common.host')" prop="" >
          <template slot-scope="scope">
            <a class="link" @click="$router.push({name: 'detailHost', params: {uuid: dbData.vtep[scope.row.uuid].hostUuid}})">{{dbData.vtep[scope.row.uuid].hostUuid && dbData.host[dbData.vtep[scope.row.uuid].hostUuid] && dbData.host[dbData.vtep[scope.row.uuid].hostUuid].name}}</a>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.type')"  prop="type">
        </el-table-column>
        <el-table-column :label="$t('common.port')"  prop="port">
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
    name: "VtepTabListForL2Network",
    mixins:[Root,WindowBase,MultiSelectList],
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
      getData(){
        let uuidList=[]
        if(!_.isArray(this.windowData.uuidList)) return[]

        uuidList=this.windowData.uuidList.filter(uuid=>this.dbData.vtep[uuid])

        return uuidList.map(uuid=>{
          return this.dbData.vtep[uuid]
        })
      },
      queryList: async function () {
        let self = this
        let condition = self.windowData.conditions
        let resp = await rpc.query('l2-networks/vxlan-pool', {
          q: `${condition}`,
          replyWithCount: true
        })
        let uuidList = []
        let hostUuidList = []
        if (resp.inventories.length === 1) {
          uuidList = resp.inventories[0].attachedVtepRefs.map((item) => item.uuid)
          hostUuidList = resp.inventories[0].attachedVtepRefs.map((item) => item.hostUuid)
        }
        rpc.query('hosts', {
          q: `uuid?=${hostUuidList}`
        }).then((hostresp) => {
          self.updateDbTable({
            tableName: 'host',
            list: hostresp.inventories
          })
        })
        let table = {}
        uuidList.forEach((uuid) => {
          table[uuid] = {
            selected: false
          }
        })
        self.updateWindow({ uuidList, table })
        self.updateDbTable({
          tableName: 'vtep',
          list: resp.inventories[0].attachedVtepRefs,
          availableCount: resp.inventories[0].attachedVtepRefs.length
        })
        this.itemList = this.getData();
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({ showMoreDropdown: !this.windowData.showMoreDropdown })
        $event.stopPropagation()
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({ showMoreDropdown: false })
      },
      pageAddIpRange: function () {
        this.detailOpenInplaceDialog('AddIPRangeDlg', [], (params) => this.addIpRange(this.windowData.dataUuid, params))
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
            this.detailQuery(this.windowData.dataUuid)
            this.incEventSuccess(event)
          }, () => this.incEventFail(event))
        } else {
          this.addIpRangeByNetworkCidr(l3NetworkUuid, params)
        }
      },
      pageDestroy: function () {
        let self = this
        let uuidList = []
        self.windowData.uuidList.forEach((uuid) => {
          if (self.windowData.table[uuid].selected) uuidList.push(uuid)
        })
        this.openDialog('DeleteIPRangeConfirmDlg', {
          l3NetwotkUuid: this.windowData.dataUuid,
          uuidList,
          ok: () => {
            uuidList.forEach(function (uuid) {
              ((uuid) => {
                rpc._delete(`l3-networks/ip-ranges/${uuid}`)
                  .then((resp) => {
                    self.detailQuery(self.windowData.dataUuid)
                  })
              })(uuid)
            })
          }
        })
      },
      detailQuery: function (uuid) {
        let self = this
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

