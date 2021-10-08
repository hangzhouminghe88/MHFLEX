<template>
  <dialog-template width="900px">
    <div slot="title" class="modal-plain-header">
      <span>{{ $t("zwatchEndpoint.select") }}</span>
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
          <el-table-column :label="$t('common.name')" prop="name">
            <template slot-scope="scope">
              {{getEndpointName(scope.row.uuid)}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('zwatchEndpoint.type')">
            <template slot-scope="scope">
              {{getZWatchEndpointType(scope.row.uuid)}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('zwatchEndpoint.address')">
            <template slot-scope="scope">
              {{getZWatchEndpointAddress(scope.row.uuid)}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.state')">
            <template slot-scope="scope">
              <table-body-item-state slot="item" :state="scope.row.state"/>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.createDate')">
            <template slot-scope="scope">
              {{(new Date(scope.row.createDate)) | formatDatetime}}
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
  import TableBodyItemState from "../../component/TableBodyItemState";
  import ZwatchEndPointList from 'src/om/zwatchEndPoint/List';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  export default {
    name: "MultiSelectList",
    mixins: [ZwatchEndPointList, WindowBase],
    components: {TableBodyItemState},
    data(){
      return {
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        itemList: []
      }
    },
    computed: {
      selectedList(){
        let self = this;
        return self.windowData && self.windowData.selectUuidList;
      },
    },
    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-',
        selectUuidList: [],
      })
        .then(() => {
          self.queryList();
        })
        .then(() => {
          self.queryForAssistant()
        })
    },
    methods: {
      pageCurrentChange(val){
        let self = this;
        self.updateWindow({
          pageIndex: val
        })
      },
      pageSizeChange(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        })
      },
      confirm(){
        let self = this;
        if(self.selectedList.length <=0) return;
        self.dialogData.param.select(self.selectedList);
        self.closeDialog(self.windowId);
      },
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      handleSelect(rows){
        let self = this, uuidList = [];
        uuidList = rows.map((item) => {
          return item.uuid;
        })
        self.updateWindow({
          selectUuidList: uuidList
        })
      },
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        }).then(() => {
          self.queryList();
        })
      },
      getCondition () {
        let conditionList = []
        if (this.dialogData.param.conditions) conditionList = conditionList.concat(this.dialogData.param.conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      queryForAssistant () {
        let self = this
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${this.genUniqueId()}`
          self.createAssistant({
            id,
            operation,
            title: 'zwatchEndpointTitle',
            ownerId: self.windowData.id,
            content: `lackOf${resourceName}`,
            handler: () => {
              self.$router.push({name:  'zwatchendpoint'});
              self.closeDialog(self.windowId);
            }
          })
        }
        rpc.query('sns/application-endpoints', {
          q: this.getCondition(),
          count: true
        }).then((resp) => {
          if (resp.total === 0) newAssistant('zwatchEndpoint', 'create')
        })
      },
    },
    destroyed(){
      let self = this;
      self.deleteAllAssistant();
    }
  }
</script>

<style scoped>

</style>
