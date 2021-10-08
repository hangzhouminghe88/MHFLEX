<template>
  <dialog-template width="900px">
    <div slot="title" class="modal-plain-header">
      <span class="title">{{$t("common.selectImage")}}</span>
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
            highlight-current-row
            @row-click="handleSingleSelect"
            :data="affinitygroupList">
             <span slot="empty" class="table-nodata">
               <p class="empty-text" v-text="$t('common.noData')"></p>
            </span>
            <el-table-column>
              <template slot-scope="scope">
                <el-radio :label="scope.row.uuid" v-model="templateRadio">&nbsp</el-radio>
              </template>
            </el-table-column>
            <el-table-column
              prop="name"
              :label="$t('common.name')"></el-table-column>
            <el-table-column
              prop=""
              :label="$t('affinityGroup.affinityGroup')">
              <template slot-scope="scope">
                {{$t(`affinityGroup.${dbData.affinitygroup[scope.row.uuid].policy}`)}}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('affinityGroup.vmNums')">
              <template slot-scope="scope">
                {{scope.row.usages.length}}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('common.status')"></el-table-column>
            <el-table-column
              :label="$t('visualizationEditor.Type')"
              prop="type"></el-table-column>
            <el-table-column
              :label="$t('common.owner')">
              <template slot-scope="scope">
                {{dbData.affinitygroupA[scope.row.uuid].accountName}}
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('common.createDate')">
              <template slot-scope="scope">
                {{formatDatetime(new Date(scope.row.createDate))}}
              </template>
            </el-table-column>
          </el-table>
        <div class="page-table-pagination">
          <el-pagination v-if="windowData.pageCount > 0"
            :page-sizes="[5, 10]"
            :page-size="5"
            :total="windowData.pageCount"
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
  import WindowBase from 'src/windows/Window';
  import TableBodyItemState from "../../component/TableBodyItemState";
  import VirtualRouterImageList from "src/ecs/image/List";
  export default {
    name: "VirtualRouterImageListSingleSelectDlg",
    components: {TableBodyItemState},
    mixins: [WindowBase, VirtualRouterImageList],
    created(){
      let self = this;

      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-'
      })
        .then(() => {
          this.queryList();
        })
    },
    data(){
      return {
        searchStr: '',
        selectVal: 'name',
        templateRadio: '',
        conditionNameList:[
          {name:'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        affinitygroupList:[]
      }
    },
    methods: {
      getCondition: function () {
        let conditionList = []
        conditionList.push(`appliance=customer`)
        if (this.dialogData.param && this.dialogData.param.conditions) conditionList = conditionList.concat(this.message.conditions)
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}=${encodeURIComponent(this.searchStr)}`)
        }
        return conditionList
      },
      handleSingleSelect(rows){
        let self = this;
        self.templateRadio = rows.uuid;
      },
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        }).then(() => {
          self.queryList();
        })
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
      confirm() {
        let self = this;
        self.dialogData.param.select(self.templateRadio);
        self.closeDialog(self.windowId);
      }
    }
  }
</script>

<style scoped>

</style>
