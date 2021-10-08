<template>
  <el-dialog :visible.async="visiabled" @close="close">
    <div slot="title">{{$t('common.selectHost')}}</div>
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
        highlight-current-row
        :data="itemList"
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
        <el-table-column
        prop="managementIp"
        :label="$t('common.managementIp')"></el-table-column>
        <el-table-column
        :label="$t('common.cluster')">
         <template slot-scope="scope">
           {{dbData.cluster[dbData.host[scope.row.uuid].clusterUuid].name}}
         </template>
        </el-table-column>
        <el-table-column
        :label="$t('common.hypervisorType')"
        prop="hypervisorType"></el-table-column>
      </el-table>
      <el-pagination v-if="windowData.total > 0"
        :page-sizes="[5, 10]"
        :page-size="windowData.pageSize"
        :total="windowData.total"
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
  import HostList from 'src/om/host/List';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  export default {
    name: "HostSingleDlg",
    mixins: [HostList, WindowBase],
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
        vmUuid: "",
        itemList: []
      }
    },
    computed:{

    },
    mounted() {
      let self = this;
      self.visiabled = self.model;
      if(self.message.type === 'start' && self.message.uuid){
        rpc.query(`vm-instances/${self.message.uuid}/starting-target-hosts`)
          .then((resp) => {
            let hostUuidList = []
            resp.hosts.forEach((item) => {
              hostUuidList.push(item.uuid)
            })
            return this.updateWindow({
              hostUuidList: hostUuidList,
              loading: false,
              sortBy: 'createDate',
              sortDirection: '-',
              pageIndex: 1,
              pageSize: 5,
              methods: {
                queryList: this.queryList
              }
            })
          }).then(() => {
            self.queryList();
        })
      }else{
        this.updateWindow({
          loading: false,
          sortBy: 'createDate',
          sortDirection: '-',
          pageIndex: 1,
          pageSize: 5
        }).then(()=>{
          this.queryList();
        })
      }
    },
    methods: {
      ...Utils,
      close() {
        let self = this;
        self.$emit('close');
      },
      pageCurrentChange(val){
        this.updateWindow({
          pageIndex: val
        })
      },
      pageSizeChange(val){
        this.updateWindow({
          pageSize:val
        })
      },
      confirmDlg() {
        let self = this;
        if(self.templateRadio === ''){
          self.$message('您还没有选择物理机')
        }
        if(this.message.type==='migrate'){
          self.$emit('close', {uuid: this.templateRadio, vmUuid: this.vmUuid, type: 'migrate'});
        }else if(this.message.type==='codeMigrate'){
          self.$emit('close', {uuid: this.templateRadio, vmUuid: this.vmUuid, type: 'codeMigrate'});
        }else if(this.message.type==='start'){
          self.$emit('close', {uuid: this.templateRadio, type: 'start'});
        }else {
          self.$emit('close', this.templateRadio);
        }
      },
      getCondition() {
        let conditionList = []
        if (this.message && this.message.conditions) {
          conditionList = conditionList.concat(this.message.conditions)
        }
        if(this.windowData.hostUuidList){
          conditionList.push(`uuid?=${this.windowData.hostUuidList}`)
        }
        //当单vm迁移时查找条件
        if(this.message && (this.message.type === 'migrate' || this.message.type === 'coldMigrate')){
          this.vmUuid = "";
          conditionList.push(`uuid?=${this.message.hostUuidList}`);
          conditionList.push('state=Enabled')
          conditionList.push('status=Connected')
          this.vmUuid = this.message.vmUuid;
        }
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      handleSingleSelect(row){
        this.templateRadio = row.uuid;
      },
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        })
        this.queryList();
      }
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
