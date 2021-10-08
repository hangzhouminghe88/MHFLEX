<template>
  <dialog-template width="900px">
    <div slot="title" class="modal-plain-header">
      <span class="title">{{$t("common.selectBackupStorage")}}</span>
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
          @selection-change="handleSelect"
          :data="backupStorageItemList">
           <span slot="empty" class="table-nodata">
            <p class="empty-text" v-text="$t('common.noData')"></p>
          </span>
          <el-table-column width="50px" type="selection"></el-table-column>
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
        <el-pagination v-if="windowData.availableCount > 0"
          :current-page="windowData.pageIndex"
          :page-size="5"
          :page-sizes="[5, 10]"
          :total="windowData.availableCount"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          class="page-table-pagination"
          layout="total, sizes, prev, pager, next"></el-pagination>
      </div>
    </div>
    <div slot="footer" class="el-dialog__footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import BSList from 'src/storage/backupstorage/List';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import _ from 'lodash';

  export default {
    name: "BackupStorageListMultiSelectListDlg",
    mixins: [WindowBase,BSList, MultiSelectList],
    computed: {
      backupStorageItemList(){
        if (!_.isArray(this.windowData.uuidList)) return [];
        // sometimes, uuid will not exist. so should be excluded firstly.
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.backupstorage[uuid]
        );
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.backupstorage[uuid]
          }
        )
      }
    },
    data(){
      return{
        visiabled: false,
        templateRadio: '',
        selectVal: 'name',
        searchStr:  '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        isVCenter: false
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
        selectedUuidList: [],
      }).then(()=>{
        self.queryList();
      });
    },
    methods: {
      ...Utils,
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      confirm(){
        if (!this.isSelected || this.selectedList.length <= 0) return
        this.dialogData.param.select(this.selectedList)
        this.closeDialog(this.windowId)
      },
      getCondition: function () {
        let conditionList = [];
        conditionList.push(`zone.uuid=${window.localStorage.getItem('currZoneUuid')}`);

        if (this.dialogData.param.conditions && Array.isArray(this.dialogData.param.conditions)) {
          conditionList = conditionList.concat(this.dialogData.param.conditions)
        }
        conditionList.push('__systemTag__!?=remote,onlybackup,aliyun,remotebackup');
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      handleSelect(rows){
        let self = this, uuidList = [];
        uuidList = rows.map((row) => {
          return row.uuid;
        })
        self.updateWindow({
          selectedUuidList:uuidList
        })
      },
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
