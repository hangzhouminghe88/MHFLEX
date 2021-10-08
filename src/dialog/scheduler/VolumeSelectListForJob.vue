<template>
  <dialog-template :width="900">
    <div slot="title" class="el_dialog_header">
      <span id="cluster-deleteCluster">{{ $t('volume.select') }}</span>
      <span class="el-icon-close dialog-close" @click="cancel"></span>
    </div>
    <div slot="body">
      <div style="padding:30px;overflow: hidden">
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
          @selection-change="handleSelect">
           <span slot="empty" class="table-nodata">
            <p class="empty-text" v-text="$t('common.noData')"></p>
          </span>
          <el-table-column width="50px;" type="selection"></el-table-column>
          <el-table-column
            prop="name"
            :label="$t('common.name')"></el-table-column>
          <el-table-column
            prop="type"
            :label="$t('common.type')"></el-table-column>
          <el-table-column
            :label="$t('common.size')">
            <template slot-scope="scope">
              {{bytesToSize(scope.row.size)}}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.state')">
            <template slot-scope="scope">
              <table-body-item-state slot="item"  :state="scope.row.state"></table-body-item-state>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.status')">
            <template slot-scope="scope">
              <table-body-item-state slot="item"  :state="scope.row.status"></table-body-item-state>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.attached')">
            <template slot-scope="scope">
              {{!!dbData.volume[scope.row.uuid].vmInstanceUuid ? $t('common.yes') : $t('common.no')}}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.sharedVolume')">
            <template slot-scope="scope">
              {{dbData.volume[scope.row.uuid].isShareable ? $t('common.yes') : $t('common.no')}}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.primaryStorage')">
            <template slot-scope="scope">
              {{getPsName(scope.row.uuid)}}
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
    <div slot="footer">
      <span class="btn-confirm" @click="confirm">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import VolumeList from 'src/ecs/volume/List';
  import Utils from 'src/utils/utils';
  import TableBodyItemState from "../../component/TableBodyItemState";
  export default {
    name: "VolumeSelectListForJob",
    components: {TableBodyItemState},
    mixins: [MultiSelectList, WindowBase, VolumeList],
    data(){
      return {
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        templateRadio: '',
        itemList: []
      }
    },
    created () {
      this.updateWindow({
        sortBy: 'createDate',
        sortDirection: '-',
        pageIndex: 1,
        pageSize: 5,
        methods: {
          queryList: this.queryList
        }
      })
        .then(() => this.queryList())
    },
    methods: {
      ...Utils,
      confirm(){
        let self = this;
        if(!self.isSelected) return;
        self.dialogData.param.select(self.selectedList);
        self.closeDialog(self.windowId);
      },
      getCondition () {
        let conditionList = []
        conditionList.push('status!=Deleted')
        conditionList.push('status!=NotInstantiated')
        if (this.dialogData.param.conditions && Array.isArray(this.dialogData.param.conditions)) {
          conditionList = conditionList.concat(this.dialogData.param.conditions)
        }
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      close () {
        this.closeDialog(this.windowData.id)
      },
      handleSelect(rows){
        let self = this, uuidList = [];
        uuidList = rows.map((row) => {
          return row.uuid;
        })
        self.updateWindow({
          selectedUuidList: uuidList
        })
      },
      cancel () {
        this.close()
      }
    }
  }
</script>

<style scoped>

</style>
