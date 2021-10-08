<template>
  <dialog-template>
    <span slot="title">
       <span id="cluster-deleteCluster">{{ $t('common.selectCluster') }}</span>
       <span class="el-icon-close dialog-close" @click="cancel"></span>
    </span>
    <div slot="body">
      <div style="padding:30px;overflow-y: hidden;">
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
          :highlight-current-row="dialogData.param.type==='radio' ? true : false"
          :data="itemList"
          @selection-change="handleSelect"
           @row-click="handleSingleSelect">
           <span slot="empty" class="table-nodata">
             <p class="empty-text" v-text="$t('common.noData')"></p>
           </span>
          <el-table-column width="50px" v-if="dialogData.param.type==='selection'" type="selection"></el-table-column>
          <el-table-column width="50px" v-if="dialogData.param.type==='radio'">
            <template slot-scope="scope">
              <el-radio :label="scope.row.uuid" v-model="templateRadio">&nbsp</el-radio>
            </template>
          </el-table-column>
          <el-table-column
            prop="name"
            :label="$t('common.name')"></el-table-column>
          <el-table-column
            prop="hypervisorType"
            :label="$t('common.hypervisorType')"></el-table-column>
          <el-table-column
            :label="$t('common.createDate')">
            <template slot-scope="scope">
              {{formatDatetime(new Date(scope.row.createDate))}}
            </template>
          </el-table-column>
        </el-table>
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
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirmDlg">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';
  import ClusterList from 'src/om/cluster/List';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  export default {
    name: "PrimaryStorageAttachClusterDlg",
    mixins: [WindowBase, ClusterList, MultiSelectList],
    data(){
      return {
        zoneUuid: '',
        templateRadio: '',
        searchStr: '',
        selectVal: 'name',
        conditionNameList:[
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        itemList: []
      }
    },
    computed:{
    },
    mounted(){
      let self = this;
      self.zoneUuid = localStorage.getItem('currZoneUuid')
      if (self.dialogData.param.zoneUuid) self.zoneUuid = self.dialogData.param.zoneUuid
      self.updateWindow({
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        pageIndex: 1,
        pageSize: 5,
        methods: {
          queryList: this.queryList
        }
      }).then(() => this.queryList())
        .then(() => self.queryForAssistant())
    },
    methods: {
      ...Utils,
      async queryForAssistant(){
        let self = this
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${this.genUniqueId()}`
          let content = `lackOf${resourceName}`
          let hide = false
          self.createAssistant({
            id,
            hide,
            operation,
            title: 'clusterTitle',
            ownerId: self.windowData.id,
            content,
            handler: () => {
              self.closeDialog(self.windowId);
              self.deleteAllAssistant();
              self.$router.push({name: 'createCluster'})
            }
          })
        }
        rpc.query('clusters', {count: true, q: this.getCondition()}).then(resp => {
          if (resp.total === 0) newAssistant('Cluster', 'create')
        })
      },
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      confirmDlg(){
        let self = this;
        if(self.dialogData.param.type === 'selection' && self.selectedList.length > 0){
          self.dialogData.param.select(self.selectedList);
          self.closeDialog(self.windowId);
        }else if(self.dialogData.param.type==='radio'){
          self.dialogData.param.select(self.templateRadio);
          self.closeDialog(self.windowId);
        }
      },
      getCondition: function () {
        let conditionList = []
        if (this.dialogData.param.conditions) conditionList = conditionList.concat(this.dialogData.param.conditions)
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      handleSingleSelect(row){
        let self = this;
        self.templateRadio = row.uuid;
      }
    },
    destroyed(){
      let self = this;
      self.deleteAllAssistant();
    }
  }
</script>

<style scoped>

</style>
