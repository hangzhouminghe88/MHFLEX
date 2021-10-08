<template>
  <el-dialog :visible.async="visiabled" @close="close">
    <div slot="title">{{$t('common.instanceoffering')}}</div>
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
        :data="itemList"
        highlight-current-row
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
          :label="$t('common.name')"
          prop="name"
        ></el-table-column>
        <el-table-column
          label="CPU"
          prop="cpuNum">
        </el-table-column>
        <el-table-column
          :label="$t('common.memory')"
          prop="size">
          <template slot-scope="scope">
            {{bytesToSize(scope.row.memorySize)}}
          </template>
        </el-table-column>
        <el-table-column
         :label="$t('common.state')">
          <template slot-scope="scope">
             <table-body-item-state  :state="scope.row.state"></table-body-item-state>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('common.createDate')">
          <template slot-scope="scope">
            {{formatDatetime(new Date(scope.row.createDate))}}
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-if="windowData.total > 0"
        :page-sizes="[5, 10]"
        :page-size="5"
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
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils';
  import InstanceOfferingList from 'src/ecs/intanceOffing/List';
  import {mapState, mapGetters} from 'vuex';
  import TableBodyItemState from "../component/TableBodyItemState";
  export default {
    name: "InstanceOfferingSingleDlg",
    components: {TableBodyItemState},
    mixins: [InstanceOfferingList,WindowBase, Root],
    props: {
      model: {
        type: Boolean,
        default:false
      },
      message:{
        type: Object,
        default:{}
      }
    },
    computed:{
    ...mapState({
        instanceOffering: state => state.instanceOffering
      }),
    ...mapGetters({
        getList: 'instanceOffering/getList'
      }),
    },
    data(){
      return{
        visiabled: false,
        selectVal: 'name',
        searchStr:'',
        conditionNameList: [
          {name:'common.name', value: 'name'},
          {name:'UUID', value: 'uuid'}
        ],
        templateRadio: '',
        itemList: []
      }
    },
    created(){
      let self = this;
      self.visiabled = this.model;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-',
        methods: {
          queryList: self.queryList
        }
      })
        .then(()=>{
          self.queryList();
        })
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
        self.$emit('close',{uuid: this.templateRadio, index: this.message.index});
      },
      handleSingleSelect(row){
        let self = this;
        self.templateRadio = row.uuid;
      },
      getCondition: function () {
        let conditionList = [], self = this;
        conditionList = conditionList.concat(self.message.conditions)
        if (this.selectVal !=='' && this.searchStr!=='' ) {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        })
        self.queryList();
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
    },
    watch: {
      model(newVal, oldVal){
        if(newVal !== oldVal){
          this.visiabled = newVal;
        }
      },
      'windowData.pageIndex': function(newVal, oldVal){
        if(newVal !== oldVal){
          this.queryList();
        }
      },
      'windowData.pageSize': function(newVal, oldVal){
        if(newVal !== oldVal){
          this.queryList();
        }
      }
    }
  }
</script>

<style scoped>

</style>
