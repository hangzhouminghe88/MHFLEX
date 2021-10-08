<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span class="modal-title"></span>
      <span class="dialog-close el-icon-close" @click="close()"></span>
    </div>

    <div slot="body">
      <div style="padding: 20px 30px">
        <div class="page-toolbar-container" style="display: flex">
          <div class="page-toolbar-left"></div>
          <div class="page-toolbar-center"></div>
          <div class="page-toolbar-right">
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
        <mh-table :data-source="dataSource" type="radio"></mh-table>
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
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import Utils from 'src/utils/utils';
  import _ from 'lodash';
  export default {
    name: 'BackUpDataBaseDataSelect',
    mixins: [MultiSelectList, WindowBase],
    created: function () {
      this.updateWindow({
        sortBy: 'createDate',
        sortDirection: '-',
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        originalStr: '',
        searchConditionRawList:[`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`],
        selectedList: [],
        methods: {
          queryList: this.queryList
        }
      }).then(() => this.queryList())
    },
    destroyed: function () {
    },
    updated: function () {
    },
    data() {
      let self = this;
      return {
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
          {
            name: 'common.name',
            value: 'name'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          }
        ],
        itemList: [],
        templateRadio: '',
        dataSource: {
          getItemList: () => self.itemList,
          handleSingleSelect: self.handleSingleSelect,
          handleSort: self.handleSort,
          templateRadio: () => self.templateRadio,
          type: 'radio',
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              field: 'name',
              sortable: true,
            },
            {
              getContent: item => self.getField('version', item),
              getHeaderContent: self.$t('common.version'),
              field: 'version'
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate',
              sortable: true,
            }
          ]
        }
      }
    },
    methods: {

      getField(field, item) {
        let self = this;
        if (_.isUndefined(item)) return '';
        let normalFields = ['name', 'version'];
        if (_.includes(normalFields, item)) return item[field];
        if (field === 'createDate') return self.formatDatetime(new Date(item[field]));
      },

      filterDatabaseBackup(list) {
        let conditions = this.windowData.searchConditionRawList
        if (conditions.length === 0) return list
        let conditionName = conditions[0].split('~=')[0]
        let val = this.windowData.originalStr
        return list.filter(it => _.includes(it[conditionName], val))
      },
      queryList() {
        let data = this.windowData, self = this;
        let url = this.dialogData.param.backupStorageUrl
        return rpc.query('database-backups/image-store', {url}).then(resp => {
          let result = resp.backups
          result.forEach(it => {
            it.uuid = it.installPath
          })
          result = this.filterDatabaseBackup(result)
          result.sort((a, b) => {
            return new Date(b.createdTime) - new Date(a.createdTime)
          })
          if (result.length === 0) return this.updateWindow({table: {}, uuidList: []})
          let uuidList = result.map(it => it.uuid)
          let list = _.chunk(uuidList, data.pageSize)
          let table = {}
          uuidList.forEach(uuid => {
            table[uuid] = {
              selected: false
            }
          })
          return this.updateDbTable({
            tableName: 'backupData',
            list: result
          }).then(() => {
            return this.updateWindow({
              table,
              availableCount: result.length,
              uuidList: list[data.pageIndex - 1]
            }).then(() => {
              self.itemList = self.getItemList();
            })
          })
        })
      },


      handleSingleSelect(row){
       let self = this;
       self.templateRadio = row.uuid;
      },

      getItemList(){
        let self = this;
        return self.windowData.uuidList.map(uuid => {
          return self.dbData.backupData[uuid];
        })
      },

      close: function () {
        this.closeDialog(this.windowData.id)
      },

      confirm(){
        let self = this;
        if(!self.templateRadio) return;
        this.dialogData.param.select(self.templateRadio);
      },
      ...Utils
    }
  }
</script>

<style scoped>

</style>
