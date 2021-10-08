<template>
  <dialog-template width="900px">
    <div slot="title" class="modal-plain-header">
      <span class="title" v-if="networkType[0] === 'category=Private'">{{$t("common.selectPrivateNetwork")}}</span>
      <span class="title" v-if="networkType[0] === 'category=Public'">{{$t("common.selectPublicNetwork")}}</span>
      <span class="title" v-if="networkType[0] !== 'category=Public' && networkType[0] !== 'category=Private'">{{$t("common.selectL3Network")}}</span>
      <span class="el-icon-close dialog-close" @click="cancel()"></span>
    </div>
    <div slot="body" class="el-dialog__body">
      <div style="margin: 30px 20px;">
        <div class="radio-group" style="text-align: right">
          <span style="padding: 0 15px;display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </div>
        <el-table
          :data="itemList"
          highlight-current-row
          @selection-change="handleSelect">
           <span slot="empty" class="table-nodata">
            <p class="empty-text" v-text="$t('common.noData')"></p>
          </span>
          <el-table-column width="50px" type="selection"></el-table-column>
          <el-table-column :label="$t('common.name')" prop="name"></el-table-column>
          <el-table-column :label="$t('common.networkType')">
            <template slot-scope="scope">
              {{(scope.row.category === 'Public' || scope.row.category === 'System') ? $t(`common.${scope.row.category}`) : scope.row.networkServiceType ? $t(`l3network.type.${scope.row.networkServiceType}`) : ''}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.state')">
            <template slot-scope="scope">
              <table-body-item-state slot="item" :state="scope.row.state"/>
            </template>
          </el-table-column>
          <el-table-column :label="$t('l3network.current')">
            <template slot-scope="scope">
              {{`${scope.row.availableCapacity} / ${scope.row.totalCapacity}`}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.hypervisor')" prop="hypervisorType"></el-table-column>
          <el-table-column :label="'CIDR'">
            <template slot-scope="scope">
              {{dbData.l3network[scope.row.uuid].ipRanges.length > 0 ? dbData.l3network[scope.row.uuid].ipRanges[0].networkCidr : void 0}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('operationLog.result')" :render-header="handleIpVersion">
            <template slot-scope="scope">
              {{`IPv${dbData.l3network[scope.row.uuid].ipVersion}`}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.createDate')">
            <template slot-scope="scope">
              {{new Date(scope.row.createDate) | formatDatetime}}
            </template>
          </el-table-column>
        </el-table>
        <div class="page-table-pagination">
          <el-pagination v-if="windowData.availableCount > 0"
            :page-sizes="[5, 10]"
            :page-size="5"
            :total="windowData.availableCount"
            class="page-table-pagination"
            layout="total, sizes, prev, pager, next"
            @current-change="pageCurrentChange"
            @size-change="pageSizeChange"
            :current-page="windowData.pageIndex"></el-pagination>
        </div>
      </div>
    </div>
    <div slot="footer" class="el-dialog__footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import TableBodyItemState from "../../component/TableBodyItemState";
  import Utils from 'src/utils/utils'
  import {mapGetters} from 'vuex';
  export default {
    name: "L3NetWorkMultiSelectDlg",
    components: {TableBodyItemState},
    mixins: [WindowBase],
    created(){
      let self = this;

      let networkType = this.dialogData.param.conditions;
      self.networkType = networkType;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: []
      })
        .then(() => {
          this.queryList();
        })
    },
    data(){
      return {
        searchStr: '',
        selectVal: 'name',
        networkType: [],
        conditionNameList:[
          {name:'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        ipVersion: 'all',
        ipVersionList: [
          {
            name: 'message.all',
            uuid: 'all'
          }, {
            name: 'IPv4',
            uuid: 4
          }, {
            name: 'IPv6',
            uuid: 6
          }
        ],
        ipVersionCondition: '',
      }
    },
    computed: {
      ...mapGetters({
        getList: 'l3network/getList'
      }),
      itemList(){
        let self = this;
        return self.getList(self.windowData.uuidList)
      },
    },
    methods: {
      queryList(){
        let self = this;
        return self
          .dispatchAction("l3network/query", {
            start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
            limit: self.windowData.pageSize,
            q: self.getCondition(),
            sortDirection: self.windowData.sortDirection,
            sortBy: self.windowData.sortBy,
            replyWithCount: true
          })
          .then(resp => {
            let uuidList = resp.uuidList;
            return self
              .updateWindow({
                uuidList,
                table: Utils.createTableObjFromUuidList(resp.uuidList),
                total: resp.total
              })
          })
      },
      getCondition () {
        let conditionList = []
        conditionList.push(`state=Enabled`)


        if (this.dialogData.param.conditions && Array.isArray(this.dialogData.param.conditions)) {
          conditionList = conditionList.concat(this.dialogData.param.conditions)
        }
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        if (this.ipVersionCondition) conditionList.push(this.ipVersionCondition)


        return conditionList
      },
      handleSelect(rows){
        let self = this, uuidList = [];
        uuidList = rows.map((row) => {
          return row.uuid;
        })
        self.updateWindow({
          selectedUuidList:uuidList
        })
      },
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        }).then(() => {
          self.queryList();
        })
      },
      pageCurrentChange(val) {
        this.updateWindow({
          pageIndex: val
        })
      },
      pageSizeChange(val) {
        this.updateWindow({
          pageSize: val
        })
      },
      confirm() {
        let self = this;
        if(self.windowData.selectedUuidList.length <= 0) return;
        self.dialogData.param.select(self.windowData.selectedUuidList);
        self.closeDialog(self.windowId);
      },
      handleIpVersion(h, { column, $index }){
        let self = this;
        return h("div",{
          style: 'margin-left: -15px;'
        }, [
          h("el-dropdown",{
            on: {
              'command': self.handleIpVersionChange
            }
          },[
            h("span",[
                [self.$t('operationLog.result')],
                h('i', {
                  staticClass: 'el-icon-caret-bottom'
                })
              ],
            ),
            h("el-dropdown-menu",{
              attrs: {
                trigger: "click",
                placement:'bottom',
                slot:"dropdown"
              },
            },[
              h("el-dropdown-item",{
                attrs: {
                  "command": 'all',
                },
              },[self.$t('operationLog.all')]),
              h("el-dropdown-item",{
                attrs: {
                  "command": '4',
                },
              },['Ipv4']),
              h("el-dropdown-item",{
                attrs: {
                  "command": '6'
                },
              },['Ipv6'])
            ])
          ])
        ])
      },
      handleIpVersionChange(command){
        this.ipVersion = command
        if (command === 'all') this.ipVersionCondition = ''
        else this.ipVersionCondition = `ipVersion=${command}`
        this.queryList()
      }
    }
  }
</script>

<style scoped>

</style>
