<template>
  <el-dialog :visible.async="visiabled" @close="close">
    <div slot="title">{{$t('common.selectVolumeOffering')}}</div>
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
        :label="$t('volumeoffering.diskSize')">
          <template slot-scope="scope">
            {{ bytesToSize(scope.row.diskSize)}}
          </template>
        </el-table-column>
        <el-table-column
          prop="createDate"
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
  import VolumeList from 'src/ecs/volumeOffering/List';
  import Utils from 'src/utils/utils';

  export default {
    name: "DataVolumeInstanceOfferSingleDlg",
    mixins: [VolumeList],
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
        dataVolumeSelectList: [],
        volumeUuidList: [],
        itemList: []
      }
    },
    mounted() {
      this.visiabled = this.model;
      let self = this;
      if(self.message.uuid){
        let vmInstanceUuid = this.message.uuid
        let volumeUuidList = []
        let taskList = []
        let p = rpc.query(`vm-instances/${vmInstanceUuid}/data-volume-candidates`)
          .then((resp) => {
            volumeUuidList = volumeUuidList.concat(resp.inventories.map(it => it.uuid))
          })
        taskList.push(p)
        Promise.all(taskList).then(() => {
          this.volumeUuidList = volumeUuidList
          this.updateWindow({
            pageIndex: 1,
            pageCount: 1,
            pageSize: 20,
            currItemUuid: '',
            sortBy: 'createDate',
            sortDirection: '-',
            methods: {
              queryList: this.queryList
            }
          }).then(() => {
            this.queryList()
          })
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
          self.$message('您还没有选择云盘规格')
        }
        self.$emit('close', this.templateRadio);
      },
      getCondition: function () {
        let conditionList = []
        this.volumeUuidList.length >=1 ? conditionList.push(`uuid?=${this.volumeUuidList.join()}`): conditionList;
        if (this.message && this.message.conditions) {
          conditionList = conditionList.concat(this.message.conditions)
        }
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      handleSingleSelect(row){
        this.templateRadio = row.uuid;
        this.dataVolumeSelectList = row;
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
