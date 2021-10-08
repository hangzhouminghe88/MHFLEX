<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">
            {{$t('backupTask.data')}}{{$t('common.colon')}}
          </span>
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a id="common-attach" style="padding-top: 12px;" :class="{ 'disabled-text': !isSingleSelected}" @click="isSingleSelected && pageRecovery()">{{ $t("backupData.recovery") }}</a>
                <a id="common-destroy" :class="{ 'disabled-text': !canSync() }" @click="canSync() && pageSync()">{{$t("backupData.sync")}}</a>
                <a id="common-detach" style="padding-bottom:12px;"  @click="isSelected && pageDelete()" :class="{'disabled-text': !isSelected}">{{$t("common.destroy")}}</a>
              </div>
            </span>
          </drop-down>
        </el-col>
        <el-col :span="10" style="text-align: right">
          <span style="display: inline-block;">
            <el-input :placeholder="$t('common.searchPlaceholder')" v-model="searchStr" @blur="search()"
                      @change="search()">
               <el-select v-model="selectVal" slot="prepend" :placeholder="$t('common.searchLabelPlaceholder')"
                          style="width: 105px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </el-col>
      </el-row>
    </div>
    <el-table
    :data="itemBackupDateList"
    @selection-change="handleSelect">
      <span slot="empty" class="table-nodata">
        <p class="empty-text" v-text="$t('common.noData')"></p>
      </span>
      <el-table-column
      type="selection"></el-table-column>
      <el-table-column
      :label="$t('common.name')"
      show-overflow-tooltip>
        <template slot-scope="scope">
          <span class="link" @click.stop="goToDetail(scope.row.uuid)"> {{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column
      :label="$t('backupData.fileSize')">
        <template slot-scope="scope">
          {{bytesToSize(dbData.backupData[scope.row.uuid].size)}}
        </template>
      </el-table-column>
      <el-table-column
      :label="$t('backupServer.title')">
        <template slot-scope="scope">
          {{getBackupStorageName(scope.row.uuid)}}
        </template>
      </el-table-column>
      <el-table-column
      :label="$t('backupData.vmBackup')">
        <template slot-scope="scope">
          {{$t(`common.${dbData.backupData[scope.row.uuid].metadata.dataVolumeUuids ? 'yes' : 'no'}`)}}
        </template>
      </el-table-column>
      <el-table-column
      :label="$t('backupData.sync')">
        <template slot-scope="scope">
          {{$t(`common.${isRemoteSynced(scope.row.uuid) ? 'yes' : 'no'}`)}}
        </template>
      </el-table-column>
      <el-table-column
      :label="$t('common.createDate')">
        <template slot-scope="scope">
          {{(new Date(dbData.backupData[scope.row.uuid].createDate)) | formatDatetime}}
        </template>
      </el-table-column>
    </el-table>
    <div class="page-table-pagination">
      <el-pagination v-if="windowData.total > 0"
        :page-sizes="[10, 20, 50, 100]"
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
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import BackDataList from 'src/backupdata/List';
  import _ from 'lodash'

  export default {
    name: "BackupDataNomalTabList",
    mixins: [WindowBase, MultiSelectList, BackDataList],
    props: {
      param: {
        type: Object,
        default: {}
      }
    },
    data() {
      return {
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
          {name:'common.name', value: 'name'},
          {name: 'common.uuid', value:  'uuid'}
        ]
      }
    },
    computed: {
      itemBackupDateList() {
        if(!_.isArray(this.windowData.uuidList)) return;
        this.windowData.uuidList = this.windowData.uuidList.filter((uuid) => this.dbData.backupData[uuid]);
        return this.windowData.uuidList.map((uuid) =>{
          return this.dbData.backupData[uuid];
        })
      }
    },
    created() {
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 20,
        sortBy: 'direction',
        sortDirection: '-',
        selectedUuidList: [],
        methods: {
          queryList: self.queryList
        }
      }).then(() =>{
        self.queryList();
      })
    },
    methods: {
      ...Utils,
      pageRecovery() {
        let self = this, uuid = '';
        uuid = self.selectedList[0];
        if (this.currTab === 'db') return this.pageRecoverDbBackup()
        let backupData = this.dbData.backupData[uuid]
        let type = backupData && backupData.type
        self.param.showBDRecover({
          uuid,
          type,
          ok:  (param, policyType, whole) => {
            if (policyType === 'new') {
              if (type !== 'Data') {
                if (whole) {
                  return this.createVmFromVmBackup(param, uuid)
                }
                return this.newVmByBackup(param, uuid)
              }
              return this.newVolumeByBackup(param, uuid)
            }
            return this.overlap(uuid, whole)
          }
        });
      },
      pageSync () {
        let uuidList = this.selectedList.filter(uuid => !this.isRemoteSynced(uuid))
        return this.sync(uuidList).then(() => {
          return this.queryList()
        })
      },

      pageDelete() {
        let self = this, uuidList = self.selectedList;
        self.openDialog('DeleteBackupDataConfirm', {
          uuidList,
          title: 'backupData.delete',
          description: 'backupData.delteLocalConfirm',
          icon: 'pop_backup_data_n',
          getName: (uuid) => {
            return self.dbData.backupData[uuid].name;
          },
          ok: (remote, whole) => {
            return self.delete(uuidList, null, remote, whole).then(() => {
              return self.queryList()
            })
          }
        })
      },

      getBackupStorageName (backupUuid) {
        let backupData = this.dbData.backupData[backupUuid]
        if (!backupData) return ''
        let bsUuids = backupData.backupStorageRefs.map(bs => bs.backupStorageUuid)
        let remoteBackupStorageUuids = _.keys(this.dbData.remoteBackupStorage)
        let localBackupStorageUuids = _.keys(this.dbData.localBackupStorage)
        let tempLocalBsUuids = _.difference(bsUuids, remoteBackupStorageUuids)
        let result = ''
        if (tempLocalBsUuids.length > 0) {
          for (let i = tempLocalBsUuids.length - 1; i >= 0; i--) {
            if (_.includes(localBackupStorageUuids, tempLocalBsUuids[i])) {
              result = this.dbData.backupstorage[tempLocalBsUuids[i]].name
              break
            }
          }
        } else {
          let remoteBackupStorage = this.dbData.backupstorage[remoteBackupStorageUuids[0]]
          if (remoteBackupStorage) result = remoteBackupStorage.name
        }
        return result
      },

      getCondition: function () {
        let conditionList = []
        if (this.param.conditions) conditionList.push(this.param.conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%${encodeURIComponent(this.searchStr)}%`)
        }
        return conditionList
      },

      goToDetail(uuid) {
        let self = this;
        self.param.showDetail({uuid});
      }
    }
  }
</script>

<style scoped>

</style>
