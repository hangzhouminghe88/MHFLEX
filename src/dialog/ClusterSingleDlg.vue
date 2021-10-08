<template>
  <el-dialog :visible.async="visiabled" @close="close">
    <div slot="title">{{$t('common.selectCluster')}}</div>
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
        @row-click="handleSingleSelect">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column width="50px">
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
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirmDlg">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
    </div>
  </el-dialog>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import ClusterList from 'src/om/cluster/List';
  import Utils from 'src/utils/utils';
  export default {
    name: "ClusterSingleDlg",
    mixins: [WindowBase, ClusterList],
    props: {
      message: {
        type: Object,
        default: {}
      },
      model: {
        type: Boolean,
        default: false
      }
    },
    data(){
      return {
        visiabled: false,
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
      self.visiabled = self.model;
      self.updateWindow({
        sortBy: 'createDate',
        sortDirection: '-',
        methods: {
          queryList: this.queryList
        }
      }).then(() => this.queryList())
    },
    methods: {
      ...Utils,
      close(){
        let self = this;
        self.visiabled = false;
        self.$emit('close');
      },
      confirmDlg(){
        let self = this;
        self.$emit('close', this.templateRadio);
      },
      getCondition: function () {
        let conditionList = []
        conditionList.push(`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
        conditionList = conditionList.concat(this.message.conditions)
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      handleSingleSelect(row){
        let self = this;
        if(row)
        self.templateRadio = row.uuid;
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
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        })
        self.queryList();
      }
    },
    watch: {
      model(newVal, oldVal){
        let self = this;
        if(newVal !== oldVal){
          self.visiabled =  newVal;
        }
      }
    }
  }
</script>

<style scoped>

</style>
