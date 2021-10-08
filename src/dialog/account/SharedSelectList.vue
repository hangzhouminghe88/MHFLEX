<template>
  <dialog-template>
    <div class="modal-plain-header" slot="title">
      <span class="title">{{$t('common.account')}}</span>
      <span @click="cancel()" class="el-icon-close dialog-close"></span>
    </div>
    <div slot="body" class="dialog-body-container">
      <div style="padding: 30px">
        <div class="page-toolbar-container" style="padding: 10px 0px;">
          <el-row>
            <el-col :span="24" style="text-align: right; float: right">
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
        <div>
          <el-table
            :data="shareItemList"
            @selection-change="handleSelect">
             <span slot="empty" class="table-nodata">
              <p class="empty-text" v-text="$t('common.noData')"></p>
            </span>
            <el-table-column type="selection" width="50px;"></el-table-column>
            <el-table-column :label="$t('common.name')" prop="name">
              <template slot-scope="scope">
                <span class="link">{{scope.row.name}}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('image.imageType')" prop="type"></el-table-column>
            <el-table-column :label="$t('common.vmNum')">
              <template slot-scope="scope">
                {{(dbData.account[scope.row.uuid] && dbData.account[scope.row.uuid].vmNum) ?
                dbData.account[scope.row.uuid].vmNum : 0}}
              </template>
            </el-table-column>
            <el-table-column :label="$t('common.volumeNum')">
              <template slot-scope="scope">
                {{(dbData.account[scope.row.uuid] && dbData.account[scope.row.uuid].volumeNum) ?
                dbData.account[scope.row.uuid].volumeNum : 0}}
              </template>
            </el-table-column>
            <el-table-column :label="$t('common.createDate')">
              <template slot-scope="scope">
                {{new Date(scope.row.createDate) | formatDatetime}}
              </template>
            </el-table-column>
          </el-table>
          <div class="page-table-pagination">
            <el-pagination v-if="windowData.total > 0"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="windowData.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="windowData.total"
              class="page-table-pagination"
              @current-change="pageCurrentChange"
              @size-change="pageSizeChange"
              :current-page="windowData.pageIndex">
            </el-pagination>
          </div>
        </div>
      </div>
    </div>
    <div slot="footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  import DialogTemplate from "../DialogTemplate";
  import {mapGetters} from 'vuex'
  export default {
    name: "SharedSelectList",
    components: {DialogTemplate},
    mixins: [WindowBase, PageBase],
    data(){
      return {
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
      }
    },
    created(){
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-',
        selectUuidList: [],
        methods: {
          queryList: this.queryList
        }
      }).then(() => {
        this.init()
      })
    },
    computed:{
      ...mapGetters({
        get: 'account/getList'
      }),
      shareItemList(){
        let self = this;
        return self.get(self.windowData.uuidList);
      },
      selectedList(){
        let self = this;
        return self.windowData && self.windowData.selectUuidList;
      },
      isSelected(){
        let self = this;
        return self.windowData && self.windowData.selectUuidList.length >= 1;
      }
    },
    methods: {
      //初始化查询参数
      async init() {
        let uuid = this.dialogData.param.uuid
        let shareUuidList = []
        if (uuid !== '') {
          let accountRefResp = await rpc.query('accounts/resources', {  // get shared account
            q: `resourceUuid=${uuid}`
          })
          accountRefResp.inventories.forEach((item) => {
            if (!item.toPublic) shareUuidList.push(item.receiverAccountUuid)
          })
          let ownerResp = await rpc.query('accounts/resources/refs', { // get AccountResourceRef
            q: `resourceUuid=${uuid}`
          })
          if (ownerResp.inventories.length > 0) {
            shareUuidList.push(ownerResp.inventories[0].accountUuid)
          }
          // await this.updateWindow({ shareUuidList })
        }
        let accountUuidList = []
        let tasks = []
        let p = null
        if (this.dbData.common.isAdmin) {
          p = rpc.query('iam2/projects', {
            limit: 100000000
          }).then((resp) => {
            accountUuidList = accountUuidList.concat(resp.inventories.map(it => it.linkedAccountUuid))
          })
          tasks.push(p)
        }
        Promise.all(tasks).then(() => {
          shareUuidList = shareUuidList.concat(accountUuidList)
          this.updateWindow({ shareUuidList })
            .then(() => {
              this.queryList()
            })
        })
      },
      //查询条件
      getCondition () {
        let conditionList = []
        conditionList.push(`name!=admin`)
        conditionList.push(`uuid!?=${this.windowData.shareUuidList}`)
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}25%`)
        }
        return conditionList
      },
      queryList () {
        let self = this;
        self.dispatchAction('account/query', {
           sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
           start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
           limit: this.windowData.pageSize,
           q: this.getCondition()
         })
        .then((resp) => {
          return this.updateWindow({
            uuidList: resp.uuidList,
            table: Utils.createTableObjFromUuidList(resp.uuidList),
            total: resp.total
          })
        })
      },
      confirm() {
        let self = this;
        if (!this.isSelected || this.selectedList.length <= 0) return
        this.dialogData.param.share(this.selectedList)
        self.closeDialog(self.windowId);
      },
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      search(){

      },
      //处理表格多选
      handleSelect(rows){
        let self = this, uuidList = [];
        uuidList = rows.map((item) => {
          return item.uuid;
        })
        self.updateWindow({
          selectUuidList: uuidList
        })
      },
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
    }
  }
</script>

<style scoped>

</style>
