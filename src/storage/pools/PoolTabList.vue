<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">{{ $t('common.pools') }}{{$t("common.colon")}}</span>
          <drop-down class="detail-dropdown">
              <span slot="title">
                <span id="common-actions" class="text">{{$t('common.actions')}}</span>
              </span>
              <span slot="content">
                <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">
                  <a id="common-createPools" style="padding-top: 12px;" @click="!isSelected && createPools()" :class="{'disabled-text': isSelected}">{{ $t("common.createPools") }}</a>
                  <a id="primaryStorage-updateAliasName" @click="isSingleSelected && upsatePoolsAliasName()" :class="{'disabled-text': !isSingleSelected}">{{ $t("primaryStorage.updateAliasName") }}</a>
                  <a id="common-deletePools" @click="isSelected && canDeletePools() && deletePools()" :class="{'disabled-text': !(isSelected && canDeletePools())}">{{ $t("common.deletePools") }}</a>
                </div>
              </span>
          </drop-down>
        </el-col>
        <el-col :span="10" style="text-align: right">
          <span style="padding: 0 15px;display: inline-block;">
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
                :label="$t('primaryStorage.aliasName')"
                width="120"
                prop="name"
                show-overflow-tooltip
                sortable>
          <template slot-scope="scope">
            <span>{{scope.row.aliasName}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.name')" prop="poolName">
        </el-table-column>
        <el-table-column :label="$t('primaryStorage.UsedCapacity')" prop="usedCapacity">
          <template slot-scope="scope">
            {{bytesToSize(scope.row.usedCapacity)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('primaryStorage.allCapacity')" prop="allCapacity">
          <template slot-scope="scope">
            {{bytesToSize(scope.row.availableCapacity)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('primaryStorage.ReplicatedSize')" prop="replicatedSize">
        </el-table-column>
        <el-table-column :label="$t('common.type')" prop="type">
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
  import PageTemplate from "../../component/PageTemplate";
  import Root from 'src/windows/Root';
  import TableBodyItemState from 'src/component/TableBodyItemState'
  import MultiSelectList from 'src/windows/Base/MultiSelectList'

  export default {
    name: "PoolTabList",
    mixins:[Root,WindowBase,MultiSelectList],
    props:['param'],
    components:{
      PageTemplate,
      TableBodyItemState
    },
    created() {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        selectedUuidList: [],
        curPrimaryStorageUuid: this.param.curPrimaryStorageUuid,
        methods: {
          queryList: this.queryList
        }
      }).then(() => this.queryList())
      window.addEventListener('click', this.onWindowClick)
    },
    updated() {
    },
    destroyed() {
      window.addEventListener('click', this.onWindowClick)
    },
    data(){
      return{
        searchStr: '',
        selectVal: 'name',
        conditionNameList:[
          {
            name: 'common.name',
            value: 'poolName'
          }
        ],
        itemList: []
      }
    },
    computed:{
    },
    methods:{
      ...Utils,
      getCondition: function () {
        let conditionList = []
        if (this.param.conditions) conditionList = conditionList.concat(this.param.conditions)
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },
      queryList: async function () {
        let self = this
        let resp = await rpc.query(`primary-storage/ceph/pools`, {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          q: this.getCondition()
        })
        let pageCount = resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize)
        let uuidList = resp.inventories.map(item => item.uuid)
        let table = {}
        uuidList.forEach((uuid) => {
          table[uuid] = {
            selected: false
          }
        })
        self.updateWindow({ uuidList, table, availableCount: resp.total })
        self.updateDbTable({
          tableName: 'pool',
          list: resp.inventories
        })
        this.itemList = this.getItemList();
      },

      getItemList(){
        let self = this;
        return self.windowData.uuidList.map(uuid => {
          return self.dbData.pool[uuid];
        })
      },

      create: function (param) {
        let event = this.createEvent('primaryStorage.action.addPool', param.name, 1)
        rpc.create(`primary-storage/ceph/${this.windowData.curPrimaryStorageUuid}/pools`, {
          poolName: param.name,
          aliasName: !param.aliasName ? undefined : param.aliasName,
          isCreate: param.isCreate,
          type: param.type
        }, event).then((resp) => {
          this.incEventSuccess(event)
          this.queryList()
        }, () => {
          this.incEventFail(event)
        })
      },
      createPools: function () {
        let self = this;
        self.param.createPool( {ok: this.create});
      },
      upsatePoolsAliasName: function () {
        const self = this
        if (!self.selectedList || self.selectedList.length <= 0) return
        let pool = _.cloneDeep(self.dbData.pool[self.selectedList[0]])
        self.openDialog('SetPoolAliasNameDlg', {
          aliasName: !pool.aliasName ? undefined : pool.aliasName,
          ok: (aliasName) => {
            let event = this.createEvent('primaryStorage.action.updateAliasName', self.selectedList.length > 1 ? '' : this.dbData.pool[self.selectedList[0]].poolName, self.selectedList.length)
            rpc.update('primary-storage/ceph/pools', self.selectedList[0], {
              'updateCephPrimaryStoragePool': {
                'aliasName': aliasName
              }
            }, event).then(() => {
              self.incEventSuccess(event)
              self.queryList()
            }, () => {
              self.incEventFail(event)
            })
          }
        })
      },
      canDeletePools: function () {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          if (this.dbData.pool[uuid].type === 'Data') uuidList.push(uuid)
        })
        return uuidList.length > 0
      },
      deletePools: function () {
        let uuidList = []
        this.selectedList.forEach((uuid) => {
          if (this.dbData.pool[uuid].type === 'Data') uuidList.push(uuid)
        })
        this.openDialog('ConfirmDlg', {
          title: 'pool.delete',
          description: 'pool.deleteConfirm',
          warning:'pool.deleteWarning',
          icon: 'primary_storage_popupico',
          uuidList,
          ok: () => {
            let event = this.createEvent('primaryStorage.action.deletePool', uuidList.length > 1 ? '' : this.dbData.pool[uuidList[0]].poolName, uuidList.length)
            uuidList.forEach((uuid) => {
              rpc._delete(`primary-storage/ceph/pools/${uuid}`, null, event)
                .then(() => {
                  this.incEventSuccess(event)
                  this.queryList()
                }, () => {
                  this.incEventFail(event)
                })
            })
          },
          getName: (uuid) => {
            return this.dbData.pool[uuid].poolName;
          }
        })
      },
      onWindowClick: function (event) {
        if (this.windowData.showMoreDropdown) this.updateWindow({ showMoreDropdown: false })
      },
      toggleMoreDropdown: function ($event) {
        this.updateWindow({ showMoreDropdown: !this.windowData.showMoreDropdown })
        $event.stopPropagation()
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
      'dbData.pool': function (conditions, oldConditions) {
        this.$nextTick(this.resizeHeader)
      },
      'param': function (newValue, oldValue) {
        if (!_.isEqual(newValue, oldValue)) {
          this.updateWindow({
            curPrimaryStorageUuid: this.param.curPrimaryStorageUuid
          }).then(() => this.queryList())
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

