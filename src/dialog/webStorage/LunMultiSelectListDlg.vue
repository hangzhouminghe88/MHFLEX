<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span>{{ $t("fc.selectLun") }}</span>
      <span class="el-icon-close dialog-close" @click="cancel()"></span>
    </div>
    <div slot="body">
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
        </div>
      <el-table
        :data="itemList"
        @selection-change="handleSelect"
         tooltip-effect="dark">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection"></el-table-column>
        <el-table-column :label="$t('common.name')">
          <template slot-scope="scope">
            <span class="link">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.vendor')" prop="vendor"></el-table-column>
        <el-table-column :label="$t('common.model')" prop="model"></el-table-column>
        <el-table-column :label="$t('common.size')">
          <template slot-scope="scope">
            {{bytesToSize(scope.row.size)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('fc.wwn')" prop="wwn"></el-table-column>
        <el-table-column :label="$t('fc.wwid')" prop="wwid"></el-table-column>
        <el-table-column :label="$t('fc.attachedVmCount')"  show-overflow-tooltip>
          <template slot-scope="scope">
            {{scope.row.scsiLunVmInstanceRefs.length}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.type')" prop="type"></el-table-column>
        <el-table-column :label="$t('common.source')" prop="source"></el-table-column>
      </el-table>
      <div class="page-table-pagination">
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
    </div>
    <div slot="footer">
      <span class="btn-confirm" @click="confirm">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList'
  import Root from 'src/windows/Root';
  import LunList from 'src/storage/sanstorage/List';
  import WindowBase from 'src/windows/Window';

  export default {
    name: "LunTabListForVm",
    mixins: [Root, LunList, WindowBase, MultiSelectList],
    props:{
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    computed: {
    },
    data(){
      return {
        selectVal: 'name',
        searchStr: '',
        currTab: 'fc',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        itemList: []
      }
    },
    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-',
        conditions: this.param && this.param.conditions ? this.param.conditions : [],
        selectedUuidList: [],
        methods: {
          queryList: self.queryList
        }
      })
        .then(() => {
          self.queryList();
        })
    },
    methods: {
      confirm(){
        let self = this;
        if(!self.isSelected) return;
        self.dialogData.param.select(self.selectedUuidList);
        self.closeDialog(self.windowId);
      },
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      //构造查询条件
      getCondition () {
        let conditionList = []
        if (this.param.conditions) conditionList.push(this.param.conditions)
        if (this.selectVal !== ''  && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      }
    }
  }
</script>

<style scoped>

</style>
