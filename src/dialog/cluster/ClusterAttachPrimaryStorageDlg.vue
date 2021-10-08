<template>
  <dialog-template>
    <span slot="title">
       <span id="cluster-deleteCluster">{{ $t('common.selectPrimaryStorage') }}</span>
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
         @row-click="handleSingleSelect"
         :data="primaryItemList"
         @selection-change="handleSelect">
          <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
         <el-table-column width="50px"  v-if="dialogData.param.type==='radio'">
           <template slot-scope="scope" >
             <el-radio :label="scope.row.uuid" v-model="templateRadio">&nbsp</el-radio>
           </template>
         </el-table-column>
         <el-table-column width="50px" v-if="dialogData.param.type==='selection'" type="selection"></el-table-column>
         <el-table-column
           prop="name"
           :label="$t('common.name')"></el-table-column>
         <el-table-column
           :label="$t('visualizationEditor.Type')"
           prop="type"></el-table-column>
         <el-table-column
           label="URL"
           prop="url"></el-table-column>
         <el-table-column
           :label="$t('common.availableCapacity')">
           <template slot-scope="scope">
             <div class="text">
               <span class="available">{{bytesToSize(scope.row.availableCapacity)}} {{$t( 'common.enabled')}}</span>
               <span class="total">({{$t('common.total')}} {{bytesToSize(scope.row.totalCapacity) }})</span>
             </div>
             <el-progress :percentage="parsePercent(scope.row.availableCapacity, scope.row.totalCapacity)"></el-progress>
           </template>
         </el-table-column>
         <el-table-column
           :label="$t('common.createDate')">
           <template slot-scope="scope">
             {{formatDatetime(new Date(scope.row.createDate))}}
           </template>
         </el-table-column>
       </el-table>
     </div>
     <el-pagination v-if="windowData.availableCount > 0"
       :page-sizes="[5, 10]"
       :page-size="windowData.pageSize"
       layout="total, sizes, prev, pager, next, jumper"
       :total="windowData.availableCount"
       class="page-table-pagination"
       @current-change="pageCurrentChange"
       @size-change="pageSizeChange"
       :current-page="windowData.pageIndex">
     </el-pagination>
   </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirmDlg">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import PrimaryStorageList from 'src/storage/primarystorage/List';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import Utils from 'src/utils/utils';
  import _ from 'lodash';
  export default {
    name: "ClusterAttachPrimaryStorageDlg",
    mixins: [WindowBase,PrimaryStorageList],
    computed: {
      primaryItemList(){
        if (!_.isArray(this.windowData.uuidList)) return []
        // sometimes, uuid will not exist. so should be excluded firstly.
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.primarystorage[uuid]
        )
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.primarystorage[uuid]
          }
        )
      },
      parsePercent(){
        return function(availableSize,totalSize) {
          if(Number(totalSize)<=0) return 0;
          let availablePercent = Number(availableSize) / Number(totalSize);
          if (Number(availableSize) <=0) return 0;
          return parseInt((1-availablePercent.toFixed(2))*100)
        }
      },
    },
    data(){
      return{
        templateRadio: '',
        selectVal: 'name',
        searchStr:  '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ]
      }
    },
    mounted(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-',
        action: this.dialogData.param.action,
        selectedUuidList: []
      }).then(()=>{
        self.queryList();
      }).then(() => {
        if (this.windowData.action === 'storageMigrate') {
          this.deleteAllAssistant()
          this.$nextTick(this.queryForAssistant)
        }
      })
    },
    methods: {
      ...Utils,
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      queryForAssistant () {
        let self = this
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${self.genUniqueId()}`
          self.createAssistant({
            id,
            title: 'migrateTitle',
            operation,
            hide: false,
            ownerId: self.windowData.id,
            content: `disabledTargetStorage`,
            handler: () => {
              return self.$router.push({name: 'primarystorage'})
            }
          })
        }
        rpc.query('primary-storage', {count: true}).then(resp => {
          if (resp.total !== 0 && self.windowData.uuidList.length === 0) newAssistant('PrimaryStorage', 'check')
        })
      },
      confirmDlg(){
        let self = this;
        if(self.dialogData.param.type === 'radio' && self.templateRadio){
          self.dialogData.param.select([self.templateRadio]);
          self.closeDialog(self.windowId);
        }
        if(self.dialogData.param.type === 'selection' && self.windowData.selectedUuidList.length >=1){
          self.dialogData.param.select(self.windowData.selectedUuidList);
          self.closeDialog(self.windowId);
        }
      },
      getCondition: function () {
        let conditionList = []
        if (this.dialogData.param.conditions) conditionList = conditionList.concat(this.dialogData.param.conditions)
        if (this.dialogData.param.zoneUuid) conditionList.push(this.dialogData.param.zoneUuid)
        else conditionList.push(`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      handleSingleSelect(row){
        let self = this;
        self.templateRadio = row.uuid;
      },
      handleSelect(rows){
        let self = this, uuidList =  [];
        if(self.dialogData.param.type !== 'selection') return;
        uuidList = rows.map((item) => {
          return item.uuid;
        })
        self.updateWindow({
          selectedUuidList: uuidList
        })
      },
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        })
        self.queryList();
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
    },
    destroyed() {
      this.deleteAllAssistant()
    },
    watch: {
    }
  }
</script>

<style scoped>

</style>
