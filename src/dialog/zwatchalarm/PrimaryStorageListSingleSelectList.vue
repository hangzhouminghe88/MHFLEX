<template>
  <dialog-template width="1000px">
    <span slot="title" class="modal-plain-header">
      <span>{{ $t("loadbalancer.select") }}</span>
      <span class="el-icon-close dialog-close" @click="cancel()"></span>
    </span>
    <div slot="body">
      <div style="margin: 30px 20px;">
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
            @row-click="handleSingleSelect"
            :data="itemList">
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
              :label="$t('visualizationEditor.Type')"
              prop="type"></el-table-column>
            <el-table-column
              label="URL"
              prop="url"></el-table-column>
            <el-table-column
              :label="$t('common.availableCapacity')">
              <template slot-scope="scope">
                {{bytesToSize(scope.row.availableCapacity)}}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('home.total')">
              <template slot-scope="scope">
                {{bytesToSize(scope.row.totalCapacity)}}
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
    <div slot="footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import PrimaryStorageList from 'src/storage/primarystorage/List';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  export default {
    name: "PrimaryStorageListSingleSelectList",
    mixins: [WindowBase,PrimaryStorageList, MultiSelectList],
    data(){
      return{
        templateRadio: '',
        selectVal: 'name',
        searchStr:  '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        itemList:[]
      }
    },
    mounted(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        selectedUuidList: [],
        sortDirection: '-'
      }).then(()=>{
        self.queryList();
      })
    },
    methods: {
      ...Utils,
      getCondition: function () {
        let conditionList = []
        if (this.dialogData.param.conditions) conditionList = conditionList.concat(this.dialogData.param.conditions)
        conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`)
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      handleSingleSelect(row){
        let self = this;
        self.templateRadio = row.uuid;
      },
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      confirm(){
        let self = this;
        if(!self.templateRadio){
          self.$message('您还没有选择资源');
          return;
        }
        self.dialogData.param.select(self.templateRadio);
        self.cancel();
      }
    },
    watch: {
      model(newVal, oldVal){
        if(newVal, oldVal){
          this.visiabled = newVal;
        }
      }
    }
  }
</script>

<style scoped>

</style>
