<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">{{ $t('common.rule') }}{{$t("common.colon")}}</span>
          <drop-down class="detail-dropdown">
              <span slot="title">
                <span id="common-actions" class="text">{{$t('common.actions')}}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">
                  <a id="securityGroup-addRule" v-permission="'SG_RULE.ADD'" style="padding-top: 12px;" @click="!isSelected && pageAddRule()" :class="{'disabled-text': isSelected}">{{$t("securityGroup.addRule")}}</a>
                  <a id="securityGroup-deleteRule" style="padding-bottom:12px;" v-permission="'SG_RULE.DELETE'" @click="isSelected && deleteRules_Dlg()" :class="{'disabled-text': !isSelected}">{{$t("securityGroup.deleteRule")}}</a>
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
                :label="$t('common.type')"
                width="120"
                prop="name"
                show-overflow-tooltip
                >
          <template slot-scope="scope">
              {{$t(`securityGroup.${dbData.securitygrouprule[scope.row.uuid].type}`)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.protocol')" prop="protocol">
        </el-table-column>
        <el-table-column :label="$t('common.startPort')" prop="startPort">
          <template slot-scope="scope">
            {{dbData.securitygrouprule[scope.row.uuid].startPort === -1 ? '-' : dbData.securitygrouprule[scope.row.uuid].startPort}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.endPort')" prop="endPort">
          <template slot-scope="scope">
            {{dbData.securitygrouprule[scope.row.uuid].endPort === -1 ? '-' : dbData.securitygrouprule[scope.row.uuid].endPort}}
          </template>
        </el-table-column>
        <el-table-column label="CIDR" prop="allowedCidr">
        </el-table-column>
        <el-table-column :label="$t('common.ipVersion')" prop="">
          <template slot-scope="scope">
            {{`IPv${dbData.securitygrouprule[scope.row.uuid].ipVersion}`}}
          </template>
        </el-table-column>
        <el-table-column prop="createDate" :label="$t('securityGroup.remoteSecurityGroup')">
          <template slot-scope="scope">
            {{getRemoteSecurityGroupName(scope.row.uuid)}}
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
    name: "SecurityGroupRuleTabList",
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
        selectUuidList: [],
        uuidList:[],
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
        selectVal: 'allowedCidr',
        conditionNameList:[
          {
            name: 'CIDR',
            value: 'allowedCidr'
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
        if (this.param.conditions) conditionList.push(this.param.conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      queryList: function () {
        rpc.query(`security-groups/rules`, {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
          q: this.getCondition()
        }).then((resp) => {
          this.updateWindow({
            pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
            availableCount: resp.total
          })
          let table = {}
          let uuidList = resp.inventories.map((item) => item.uuid)
          this.updateWindow({ uuidList })
          uuidList.forEach((uuid) => {
            table[uuid] = {
              selected: false
            }
          })
          this.updateDbTable({
            tableName: 'securitygrouprule',
            list: resp.inventories
          })

          this.updateWindow({ uuidList, table })
          this.itemList = this.getData();

        })
      },
      getData(){
        let self = this;
        if (!_.isArray(this.windowData.uuidList)) return []
        // sometimes, uuid will not exist. so should be excluded firstly.
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.securitygrouprule[uuid])
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.securitygrouprule[uuid]
          }
        )
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({ showMoreDropdown: !this.windowData.showMoreDropdown })
        $event.stopPropagation()
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({ showMoreDropdown: false })
      },
      deleteRules_Dlg: function () {
        let uuidList = this.selectedList
        let self = this
        if (uuidList.length > 0) {
          this.openDialog('SimpleConfirmDlg', {
            uuidList,
            title: self.$t('securityGroup.deleteRule'),
            text: self.$t('securityGroup.info.deleteRuleConfirm'),
            ok: () => {
              self.deleteRules()
                .then(() => {
                  self.queryList();
                })
            },
          })
        }
      },
      deleteRules: function () {
        let self = this
        let selectedUuidList = self.selectedList
        let event = self.createEvent('securityGroup.action.deleteRule', self.dbData.securitygroup[self.windowData.dataUuid].name)
        return rpc._delete('security-groups/rules', {
          ruleUuids: selectedUuidList
        }, event)
          .then((resp) => {
            let newUuidList = _.difference(self.windowData.uuidList, selectedUuidList)
            let newTable = _.cloneDeep(self.windowData.table)
            selectedUuidList.map((uuid) => {
              delete newTable[uuid]
            })
            self.updateWindow({
              uuidList: newUuidList,
              table: newTable
            })
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
      },
      addRule: function (param) {
        let self = this
        let event = self.createEvent('securityGroup.action.addRule', self.dbData.securitygroup[self.windowData.dataUuid].name)
        let msg = {
          rules: [param],
          remoteSecurityGroupUuids: param.remoteSecurityGroupUuids
        }
        rpc.create(`security-groups/${self.windowData.dataUuid}/rules`, msg, event)
          .then((resp) => {
            let uuidList = resp.inventory.rules.map((item) => item.uuid)
            let table = {}
            uuidList.forEach((uuid) => {
              table[uuid] = {
                selected: false
              }
            })
            self.updateWindow({ uuidList, table })
            self.updateDbTable({
              tableName: 'securitygrouprule',
              list: resp.inventory.rules
            })
            self.incEventSuccess(event)
            self.queryList()
          }, () => {
            self.incEventFail(event)
          })
      },
      getRemoteSecurityGroupName: function (uuid) {
        let value = ''
        try {
          if (this.dbData.securitygrouprule[uuid].remoteSecurityGroupUuid) {
            value = this.dbData.securitygroup[this.dbData.securitygrouprule[uuid].remoteSecurityGroupUuid].name
          } else {
            value = ''
          }
        } catch (e) {
          if (this.checkBounce(`getRemoteSecurityGroupName-${uuid}`)) return ''
          value = ''
          return rpc.queryResourceNames(this, 'securitygroup', this.dbData.securitygrouprule[uuid].remoteSecurityGroupUuid)
        }
        return value
      },

      pageAddRule(){
        let self = this;
        self.param.createRule({ ok: self.addRule, isIpv6: self.dbData.securitygroup[self.windowData.dataUuid].ipVersion === 6 })
      }
    },
    filters: {

    },
    watch: {
      'dbData.securitygrouprule': function (conditions, oldConditions) {
        // this.$nextTick(this.resizeHeader)
      },
      'param': function (newValue, oldValue) {
        if (!_.isEqual(newValue, oldValue)) {
          this.updateWindow({ dataUuid: this.param.uuid }).then(() => this.queryList())
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

