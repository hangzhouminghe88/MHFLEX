<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">{{ $t('common.vm') }}{{$t("common.colon")}}</span>
          <drop-down class="detail-dropdown">
              <span slot="title">
                <span id="common-actions" class="text">{{$t('common.actions')}}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">
                  <a id="securityGroup-attachVmNic" v-permission="'SG_VMNIC.ADD'" style="padding-top: 12px;" @click="!isSelected && attachVmNic()" :class="{'disabled-text': isSelected}">{{$t("securityGroup.attachVmNic")}}</a>
                  <a id="securityGroup-detachVmNic" style="padding-bottom:12px;" v-permission="'SG_VMNIC.DELETE'" @click="isSelected && deleteVmNic_Dlg()" :class="{'disabled-text': !isSelected}">{{$t("securityGroup.detachVmNic")}}</a>
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
                :label="$t('securityGroup.vm')"
                width="120"
                prop="name"
                show-overflow-tooltip
                >
          <template slot-scope="scope">
            <span class="link" @click="$router.push({name: 'detailVm', params: {uuid: dbData.vmNicRefs[scope.row.uuid].vmInstanceUuid}})">{{dbData.vmNicRefs[scope.row.uuid] && dbData.vmNicRefs[scope.row.uuid].vmInstanceUuid && dbData.vm[dbData.vmNicRefs[scope.row.uuid].vmInstanceUuid] && dbData.vm[dbData.vmNicRefs[scope.row.uuid].vmInstanceUuid].name}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.defaultIp')" prop="">
          <template slot-scope="scope">
            {{dbData.vmNicRefs[scope.row.uuid] && dbData.vmNicRefs[scope.row.uuid].ip}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.physicalInterface')" prop="">
          <template slot-scope="scope">
            {{dbData.vmNicRefs[scope.row.uuid] && dbData.vmNicRefs[scope.row.uuid].internalName}}
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
    name: "VmInstanceTabListForSecurityGroup",
    mixins:[Root,WindowBase,MultiSelectList],
    props:['param'],
    components:{
      PageTemplate,
      TableBodyItemState
    },
    created() {
      window.addEventListener('click', this.onWindowClick)
      this.updateWindow({
        selectUuidList: []
      })
      this.init()
    },
    updated() {
    },
    destroyed() {
      window.removeEventListener('click', this.onWindowClick)
    },
    data(){
      return{
        searchStr: '',
        selectVal: 'vmInstance.name',
        conditionNameList:[
          {
            name: 'common.name',
            value: 'vmInstance.name'
          },
          {
            name: 'common.ip',
            value: 'ip'
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
      init: function () {
        let nicList = []
        let taskList = []
        if (this.param) {
          let dataUuid = this.param
          this.updateWindow({ dataUuid })
          let p = rpc.query(`security-groups/vm-instances/nics`, {
            q: `securityGroupUuid=${this.windowData.dataUuid}`
          })
            .then((resp) => {
              nicList = nicList.concat(resp.inventories)
            })
          taskList.push(p)
          return Promise.all(taskList).then(() => {
            _.uniqBy(nicList, 'vmNicUuid')
            this.vmNicList = nicList
            this.updateWindow({
              pageIndex: 1,
              pageCount: 1,
              pageSize: 20,
              sortBy: 'createDate',
              sortDirection: '-',
              currItemUuid: '',
              selectUuidList: [],
              methods: {
                queryList: this.queryList
              }
            }).then(() => {
              return this.queryList()
            }).then(() => {
              this.queryForAssistant()
            })
          })
        }
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({ showMoreDropdown: false })
      },
      getCondition: function () {
        let conditionList = []
        conditionList.push(`uuid?=${this.vmNicList.map(it => it.vmNicUuid).join()}`)
        conditionList = conditionList.concat('vmInstance.type=UserVm')
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      queryList: function () {
        let vmNicInventories
        let uuidList
        let table = {}
        let vmUuidList = []
        rpc.query('vm-instances/nics', {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
          q: this.getCondition()
        })
          .then((resp) => {
            this.updateWindow({
              pageCount: resp.total === 0 ? 1 : resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
              availableCount: resp.total
            })
            vmNicInventories = resp.inventories
            uuidList = vmNicInventories.map((item) => item.uuid)
            uuidList.forEach((uuid) => {
              table[uuid] = {
                selected: false
              }
            })
            vmUuidList = _.uniq(vmNicInventories.map((item) => item.vmInstanceUuid))
            return rpc.queryResourceNames(this, 'vm', vmUuidList)
          })
          .then(() => {
            this.updateWindow({ uuidList, table })
            return this.updateDbTable({
              tableName: 'vmNicRefs',
              list: vmNicInventories
            })
          }).then(() => {
          return rpc.query('vm-instances', {
            q: `uuid?=${vmUuidList}`
          })
        }).then((resp) => {
          this.updateDbTable({
            tableName: 'vm',
            list: resp.inventories
          })
          this.itemList = this.getData()
        })
      },
      getData(){
        let self = this;
        if (!_.isArray(this.windowData.uuidList)) return []
        // sometimes, uuid will not exist. so should be excluded firstly.
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.vmNicRefs[uuid])
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.vmNicRefs[uuid]
          }
        )
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({ showMoreDropdown: !this.windowData.showMoreDropdown })
        $event.stopPropagation()
      },
      attachVmNic: function () {
        let self = this
        rpc.query(`security-groups/${self.windowData.dataUuid}/vm-instances/candidate-nics`)
          .then((resp) => {
            let uuidList = resp.inventories.map(it => it.uuid)
            self.openDialog('LoadBalancerListenerVmNicSelect', {
              conditions: [`uuid?=${uuidList}`],
              type: 'selection',
              select: (uuidList) => self.selectVmNic(uuidList)
            })
          })
      },
      queryForAssistant () {
        let self = this
        let newAssistant = () => {
          let id = `assistant-${self.genUniqueId()}`
          self.createAssistant({
            id,
            title: 'securitygroupTitle',
            ownerId: self.windowData.id,
            content: `noL3NetworkAttached`,
            operation: 'noResource'
          })
        }
        let securitygroup = self.dbData.securitygroup[self.windowData.dataUuid]
        if (securitygroup.attachedL3NetworkUuids.length === 0) {
          newAssistant()
        }
      },
      selectVmNic: function (vmNicUuidList) {
        let self = this
        let event = self.createEvent('vm.action.addVmNicToSecurityGroup', self.dbData.securitygroup[self.windowData.dataUuid].name)
        rpc.create(`security-groups/${this.windowData.dataUuid}/vm-instances/nics`, {
          vmNicUuids: vmNicUuidList
        }, event)
          .then((resp) => {
            self.incEventSuccess(event)
            this.init()
          }, () => {
            self.incEventFail(event)
          })
      },
      deleteVmNic_Dlg: function () {
        let uuidList = [];
        let self = this;
        uuidList =  this.selectedList;
        if (uuidList.length > 0) {
          this.openDialog('ConfirmDlg', {
            uuidList,
            title:  'securityGroup.detachVmNic',
            description: 'securityGroup.info.detachVmNicConfirm',
            icon: 'vm_plain',
            ok: () => {
              self.deleteVmNic()
                .then(() => {
                  self.queryList();
                })
            },
            getName: (uuid) => {
              return self.dbData.vm[self.dbData.vmNicRefs[uuid].vmInstanceUuid].name;
            }
          })
        }
      },
      deleteVmNic: function () {
        let self = this
        if (this.selectedList.length <= 0) return
        let selectedUuidList = self.selectedList
        let event = self.createEvent('vm.action.deleteVmNicFromSecurityGroup', self.dbData.securitygroup[self.windowData.dataUuid].name)
        return rpc._delete(`security-groups/${this.windowData.dataUuid}/vm-instances/nics`, {
          vmNicUuids: this.selectedList
        }, event)
          .then((resp) => {
            self.incEventSuccess(event)
            let newUuidList = _.difference(self.windowData.uuidList, selectedUuidList)
            let newTable = _.cloneDeep(self.windowData.table)
            selectedUuidList.map((uuid) => {
              delete newTable[uuid]
            })
            self.updateWindow({
              uuidList: newUuidList,
              table: newTable
            })
          }, () => {
            self.incEventFail(event)
          })
      }
    },
    beforeDestroy(){
      let self = this;
      self.deleteAllAssistant();
    },
    watch: {
      'param': function (newValue, oldValue) {
        if (!_.isEqual(newValue, oldValue)) {
          this.updateWindow({ dataUuid: this.param }).then(() => this.init())
          this.destroyDialogs()
        }
      },
      'windowData.pageSize': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList() // skip init status
      },
      'windowData.pageIndex': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.queryList() // skip init status
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

