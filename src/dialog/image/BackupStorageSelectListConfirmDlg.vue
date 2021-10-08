<template>
  <dialog-template>
    <div class="modal-plain-header" slot="title">
      <span class="title" v-if="!dialogData.param.title">{{$t('common.selectBackupStorage')}}</span>
      <span class="title" v-else>{{$t(`${dialogData.param.title}`)}}</span>
      <span @click="cancel()" class="el-icon-close dialog-close"></span>
    </div>
    <div class="dialog-body-container" slot="body">
      <div style="padding:30px;">
        <div class="radio-group" style="text-align: right">
       <span style="padding: 0 15px;display: inline-block;">
            <el-input @blur="search()" @change="search()" placeholder="请输入内容" v-model="searchStr">
               <el-select placeholder="请选择" slot="prepend" style="width: 100px" v-model="selectVal">
                   <el-option :key="index" :label="$t(`${item.name}`)" :value="item.value"
                              v-for="(item, index ) in conditionNameList"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </div>
        <el-table
          :data="backupStorageItemList"
          @selection-change="handleSelect"
          highlight-current-row>
          <span slot="empty" class="table-nodata">
            <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
          <el-table-column type="selection" width="50px">
          </el-table-column>
          <el-table-column
            :label="$t('common.name')"
            prop="name"></el-table-column>
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
    <div class="dialog-footer" slot="footer">
      <span @click="confirm()" class="btn-confirm" style="margin: 13px 12px;">{{$t('common.ok')}}</span>
      <span @click="cancel()" class="btn-cancel">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import DialogTemplate from "../DialogTemplate";
  import WindowBase from 'src/windows/Window';
  import BSList from 'src/storage/backupstorage/List'
  import Utils from 'src/utils/utils';
  import _ from 'lodash';

  export default {
    name: "BackupStorageSelectListConfirmDlg",
    components: {DialogTemplate},
    mixins: [WindowBase, BSList],
    computed: {
      backupStorageItemList() {
        if (!_.isArray(this.windowData.uuidList)) return [];
        // sometimes, uuid will not exist. so should be excluded firstly.
        this.windowData.uuidList = this.windowData.uuidList.filter(uuid => this.dbData.backupstorage[uuid]
        );
        return this.windowData.uuidList.map(uuid => {
            return this.dbData.backupstorage[uuid]
          }
        )
      },
      selectedList() {
        let self = this;
        if (self.windowData && self.windowData.selectedUuidList) {
          return self.windowData.selectedUuidList;
        }
      }
    },
    data() {
      return {
        templateRadio: '',
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        isVCenter: false,
      }
    },
    created() {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-',
        action: this.dialogData.param.action,
        methods: {
          queryList: this.queryList
        }
      }).then(() => {
        return this.queryList()
      }).then(() => {
        if (this.windowData.action === 'storageMigrate') {
          // this.deleteAllAssistant()
          // this.$nextTick(this.queryForAssistant)
        }
      })
    },
    methods: {
      ...Utils,
      cancel() {
        let self = this;
        self.closeDialog(self.windowId);
      },
      confirm() {
        let self = this;
        if (!self.selectedList) return;
        self.dialogData.param.ok(self.selectedList);
        self.closeDialog(self.windowId);
      },
      getCondition: function () {
        let conditionList = [];
        conditionList.push(`zone.uuid=${window.localStorage.getItem('currZoneUuid')}`);
        conditionList = conditionList.concat(this.dialogData.param.conditions);
        conditionList.push('__systemTag__!?=remote,onlybackup,aliyun,remotebackup');
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      handleSelect(row) {
        let self = this, uuidList;
        uuidList = row.map((item) => {
          return item.uuid;
        });
        self.updateWindow({
          selectedUuidList: uuidList
        })
      },
      search() {
        let self = this;
        self.updateWindow({
          pageIndex: 1
        });
        self.queryList();
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
    },
    watch: {
      model(newVal, oldVal) {
        if (newVal, oldVal) {
          this.visiabled = newVal;
        }
      }
    }
  }
</script>

<style scoped>

</style>
