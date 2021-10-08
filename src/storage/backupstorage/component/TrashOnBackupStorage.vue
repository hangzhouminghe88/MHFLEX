<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">{{ $t('common.trash') }}{{$t("common.colon")}}</span>
          <span class="button" @click="pageCleanUp" :class="{'disabled': !canCleanUp()}">
                <span class="text">{{$t('common.cleanUp')}}</span>
          </span>

        </el-col>
        <el-col :span="10" style="text-align: right">
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
                :label="$t('common.uuid')"
                width="120"
                prop="name"
                show-overflow-tooltip
                >
          <template slot-scope="scope">
            <a class="link" @click="$router.push({name:'cluster/clusterdetail/${scope.row.uuid}'})">{{scope.row.resourceUuid}}</a>
          </template>
        </el-table-column>
        <el-table-column :label="$t('trash.fileSize')" prop="size">
          <template slot-scope="scope">
            {{bytesToSize(scope.row.size)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.installPath')" prop="installPath">
        </el-table-column>
        <el-table-column prop="createDate" :label="$t('common.createDate')" >
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
    name: "BackupStorageTrashTabList",
    mixins:[Root,WindowBase,MultiSelectList],
    props:['param'],
    components:{
      PageTemplate,
      TableBodyItemState
    },
    created() {
      let self = this
      let backupStorageUuid = this.param.uuid
      self.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        sortBy: 'createDate',
        sortDirection: '-',
        backupStorageUuid,
        selectedUuidList:[],
        methods: {
          queryList: this.queryList
        }
      }).then(() => self.getTrashList())
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
            name: 'common.uuid',
            value: 'uuid'
          }
        ],
        storageTrashSpecs: [],
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
      getCondition () {
        let conditionList = []
        if (this.param.conditions) conditionList.push(this.param.conditions)
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },
      getTrashList () {
        return rpc.query('backup-storage/trash', {
          uuid: this.windowData.backupStorageUuid
        })
          .then((resp) => {
            this.storageTrashSpecs = resp.storageTrashSpecs.map(item => {
              return {
                ...item,
                uuid: `${item.trashId}`
              }
            })
            this.queryList()
          })
      },
      getItem (uuid) {
        return _.find(this.itemList, (item) => item.uuid === uuid)
      },
      queryList () {
        let conditions = this.windowData.originalStr
        let storageTrashSpecs = _.cloneDeep(this.storageTrashSpecs)
        if (conditions) {
          conditions = conditions.trim()
          storageTrashSpecs = _.filter(storageTrashSpecs, item => {
            let value = item.resourceUuid.indexOf(conditions) > -1
            return value
          })
        }
        let list = _.chunk(storageTrashSpecs, this.windowData.pageSize)
        let pageCount = storageTrashSpecs.length === 0 ? 1 : Math.ceil(storageTrashSpecs.length / this.windowData.pageSize)
        let itemList = list[this.windowData.pageIndex - 1] ? list[this.windowData.pageIndex - 1] : []
        let uuidList = itemList.map(item => item.uuid)
        let table = {}
        uuidList.forEach((uuid) => {
          table[uuid] = {
            selected: false
          }
        })
        this.updateWindow({
          uuidList,
          table,
          pageCount
        })
        this.itemList = itemList
      },
      canCleanUp: function () {
        return this.selectedList.length > 0
      },
      pageCleanUp: function () {
        const self = this
        let itemList = self.selectedList.map((uuid) => self.getItem(uuid))
        let _releaseSize = 0
        if (itemList.length > 0) {
          return this.openDialog('CleanUpTrashConfirmDlg', {
            itemList,
            ok: () => {
              return self.cleanUp(itemList)
                .then((releaseSize) => {
                  _releaseSize = releaseSize
                  return this.param.refresh()
                })
                .then(() => {
                  self.openDialog('ClearBsMessageDlg', {
                    releaseSize: _releaseSize,
                    residualSize: self.dbData.backupstorage[self.windowData.backupStorageUuid].availableCapacity,
                    ok: () => {
                      if (self.getTrashList) {
                        self.getTrashList().then(() => self.$forceUpdate())
                      }
                    }
                  })
                })
            }
          })
        }
      },
      cleanUp (itemList) {
        const self = this
        let event = self.createEvent('primaryStorage.action.cleanUpTrash', '', itemList.length)
        let tasks = []
        let releaseSize = 0
        itemList.forEach(function (uuid) {
          ((item) => {
            let p = rpc.put(`backup-storage/${self.windowData.backupStorageUuid}/trash/actions?`, {
              cleanUpTrashOnBackupStorage: {
                trashId: item.trashId
              }
            }, event)
              .then((resp) => {
                releaseSize += resp.result.size
                self.incEventSuccess(event)
              }, () => {
                self.incEventFail(event)
              })
            tasks.push(p)
          })(uuid)
        })
        return Promise.all(tasks)
          .then(() => Promise.resolve(releaseSize))
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
      'param': function (newValue, oldValue) {
        if (_.isEqual(newValue, oldValue)) return
        this.updateWindow({
          backupStorageUuid: this.param && this.param.uuid ? this.param.uuid : ''
        }).then(() => this.getTrashList())
        this.destroyDialogs()
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
  .button.disabled{
    background: #f1f4f7;
    border: 1px solid #dae0e6;
    color: #97a4b6;

  }
  .button{
    display: inline-block;
    position: relative;
    background: #fff;
    border: 1px solid #3c73b9;
    border-radius: 2px;
    height: 34px;
    color: #3c73b9;
    padding-left: 7px;
    padding-right: 10px;
    margin-right: 10px;
    cursor: pointer;
    line-height: 34px;
  }
</style>

