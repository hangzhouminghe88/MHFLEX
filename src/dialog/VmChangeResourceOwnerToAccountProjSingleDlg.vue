<template>
  <el-dialog :visible.async="visiabled" @close="close">
    <div slot="title">{{$t('common.selectHost')}}</div>
    <div style="padding:30px;overflow-y: hidden;">
      <div class="radio-group" v-if="getLicensePermission('LICENSE_EXTRA_COMPANY')">
         <span class="radio-btn" :class="{'is-active': windowData.currSelectTab === 'iam2project'}"
               @click="changeCurrTab('iam2project')">{{$t('common.publicNetwork')}}</span>
        <span class="radio-btn" :class="{'is-active': windowData.currSelectTab === 'account'}"
              @click="changeCurrTab('account')">{{$t('common.privateNetwork')}}</span>
      </div>
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
        highlight-current-row
        @row-click="handleSingleSelect"
        v-loading="windowData.loading">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column
          width="50px;">
          <template slot-scope="scope">
            <el-radio :label="scope.row.uuid" v-model="templateRadio">&nbsp</el-radio>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          :label="$t('common.name')"></el-table-column>
      </el-table>
      <el-pagination v-if="windowData.availableCount > 0"
        :page-sizes="[5, 10]"
        :page-size="windowData.pageSize"
        :total="windowData.availableCount"
        class="page-table-pagination"
        layout="total, sizes, prev, pager, next"
        @current-change="pageCurrentChange"
        @size-change="pageSizeChange"
        :current-page="windowData.pageIndex"></el-pagination>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirmDlg">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
    </div>
  </el-dialog>
</template>

<script>
  import Utils from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';

  export default {
    name: "HostSingleDlg",
    mixins: [WindowBase],
    props: {
      model: {
        type: Boolean,
        default: false,
      },
      message: {
        type: Object,
        default: false
      }
    },
    data() {
      return {
        visiabled: false,
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        searchStr: '',
        selectVal: 'name',
        templateRadio: "",
        vmUuid: ""
      }
    },
    computed: {
    },
    mounted() {
      let self = this;
      self.visiabled = self.model;
      let accountUuidList = []
      let projectCondition = 'state!=Deleted'
      if (this.message && this.message.accountUuidList) {
        accountUuidList = this.message.accountUuidList
      }
      if (this.message && this.message.projectCondition) {
        projectCondition = this.message.projectCondition
      }
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 5,
        currSelectTab: 'iam2project',
        sortBy: 'createDate',
        sortDirection: '-',
        accountUuidList,
        projectCondition,
        methods: {
          queryList: this.queryList
        }
      }).then(() => {
        this.queryList()
      })
    },
    methods: {
      ...Utils,
      close() {
        let self = this;
        self.$emit('close');
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
      confirmDlg() {
        let self = this;
        self.$emit('close', this.templateRadio);
      },
      handleSingleSelect(row) {
        this.templateRadio = row.uuid;
      },
      search() {
        this.queryList();
      },
      changeCurrTab(tabName){
        if(this.windowData.currSelectTab !== tabName){
          this.updateWindow({
            currSelectTab: tabName
          })
        }
      },
      queryList: function () {
        const self = this
        if (self.windowData.currSelectTab === 'iam2project') {
          self.queryProjectList()
        } else {
          self.queryAccountList()
        }
      },
      getCondition: function () { // account
        let conditionList = []
        if (this.message && this.message.conditions && this.windowData.currSelectTab !== 'iam2project') {
          conditionList = conditionList.concat(this.message.conditions)
        }
        if (this.message && this.message.pjConditions && this.windowData.currSelectTab === 'iam2project') {
          conditionList = conditionList.concat('state!=Deleted')
          conditionList = conditionList.concat(this.message.pjConditions)
        }
        if (this.searchStr !== '' && this.selectVal !== '' && this.windowData.currSelectTab !== 'iam2project') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        // if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0 && this.windowData.currSelectTab !== 'iam2project') {
        //   conditionList = conditionList.concat(this.windowData.searchConditionList)
        // }
        // if (this.windowData.searchConditionRawList && this.windowData.searchConditionRawList.length > 0 && this.windowData.currSelectTab === 'iam2project') {
        //   conditionList = conditionList.concat(this.windowData.searchConditionRawList)
        // }
        return conditionList
      },
      queryProjectList: function () {
        const self = this
        let offset = (self.windowData.pageIndex - 1) * self.windowData.pageSize
        let limit = self.windowData.pageSize
        let direction = self.windowData.sortDirection === '-' ? 'desc' : 'asc'
        let currPageCondition = self.translateConditions(this.getCondition())
        let zql = `
query iam2Project where ${currPageCondition} and ${self.windowData.projectCondition} order by ${self.windowData.sortBy} ${direction} limit ${limit} offset ${offset};
count iam2Project where ${currPageCondition} and ${self.windowData.projectCondition};`
        return rpc.query('zql', {
          zql: encodeURIComponent(zql)
        }).then((resp) => {
          let iam2project = resp.results[0].inventories
          return self.updateDbTable({
            tableName: 'iam2project',
            list: iam2project
          }).then(() => {
            let uuidList = []
            let linkedAccountUuidList = []
            if (iam2project.length > 0) {
              uuidList = iam2project.map((item) => item.uuid)
              linkedAccountUuidList = iam2project.map((item) => item.linkedAccountUuid)
            }
            let table = {}
            uuidList.forEach(uuid => {
              table[uuid] = {
                selected: false
              }
            })
            let tasks = []
            let p = null
            if (uuidList.length > 0) {
              p = self.getProjectAdmin(uuidList)
              tasks.push(p)
            }
            linkedAccountUuidList.forEach((accountUuid) => {
              let obj = {
                'uuid': accountUuid
              }
              p = rpc.query(`accounts/quota/${obj.uuid}/usages`).then((resp) => {
                obj.volumeNum = resp.usages.filter((i) => i.name === 'volume.data.num')[0].used
                obj.vmNum = resp.usages.filter((i) => i.name === 'vm.num')[0].used
              })
                .then(() => {
                  self.updateDbRow({
                    tableName: 'account',
                    id: obj.uuid,
                    data: obj
                  })
                })
              tasks.push(p)
            })
            return Promise.all(tasks).then(() => {
              return self.updateWindow({
                pageCount: resp.results[1].total === 0 ? 1 : Math.ceil(resp.results[1].total / self.windowData.pageSize),
                uuidList,
                table
              })
            })
          })
        })
      },
      queryAccountList: async function () {
        const self = this
        let resp = await rpc.query('accounts', {
          sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`,
          start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
          limit: self.windowData.pageSize,
          replyWithCount: true,
          q: self.getCondition()
        })
        self.updateWindow({
          pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / self.windowData.pageSize),
          availableCount: resp.total
        })
        let uuidList = resp.inventories.map((item) => item.uuid)
        let table = {}
        uuidList.forEach((uuid) => {
          table[uuid] = {
            selected: false
          }
        })
        let AccountInventories = resp.inventories
        self.updateDbTable({
          tableName: 'account',
          list: AccountInventories
        })
          .then(() => {
            AccountInventories.forEach((item) => {
              rpc.query(`accounts/quota/${item.uuid}/usages`).then((resp) => {
                item.volumeNum = resp.usages.filter((i) => i.name === 'volume.data.num')[0].used
                item.vmNum = resp.usages.filter((i) => i.name === 'vm.num')[0].used
              })
                .then(() => {
                  self.updateDbRow({
                    tableName: 'account',
                    id: item.uuid,
                    data: item
                  })
                })
            })
          })
          .then(() => {
            self.updateWindow({ uuidList, table })
          })
      },
    },
    watch: {
      model(newVal, oldVal) {
        if (newVal !== oldVal)
          this.visiabled = newVal;
      }
    }
  }
</script>

<style scoped>

</style>
