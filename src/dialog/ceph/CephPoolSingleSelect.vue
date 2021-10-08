<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">{{$t('primaryStorage.selectCephPool')}}</span>
      <span class="dialog-close el-icon-close" @click="close()"></span>
    </div>
    <div slot="body">
      <div style="padding: 30px;">
        <div class="page-toolbar-container" style="display: flex">
          <div class="page-toolbar-left"></div>
          <div class="page-toolbar-center"></div>
          <div class="page-toolbar-right">
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
        </div>
        <div class="page-body">
          <mh-table :data-source="dataSource"></mh-table>
          <el-pagination v-if="windowData.availableCount > 0"
                         :page-sizes="[5, 10]"
                         :page-size="5"
                         :total="windowData.availableCount"
                         class="page-table-pagination"
                         layout="total, sizes, prev, pager, next"
                         @current-change="pageCurrentChange"
                         @size-change="pageSizeChange"
                         :current-page="windowData.pageIndex"></el-pagination>
        </div>
      </div>
    </div>
  </dialog-template>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import _ from 'lodash';

  export default {
    name: "CephPoolSingleSelect",
    mixins: [WindowBase, MultiSelectList],
    data() {
      let self = this;
      return {
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        itemList: [],
        dataSource: {
          getItemList: () => self.itemList,
          handleSingleSelect: self.handleSingleSelect,
          handleSort: self.handleSort,
          type: 'radio',
          fields: [
            {
              getContent: item => self.getField('aliasName', item),
              getHeaderContent: self.$t('primaryStorage.aliasName'),
              field: 'aliasName',
              sortable: true
            },
            {
              getContent: item => self.getField('poolName', item),
              getHeaderContent: self.$t('common.poolName'),
              field: 'poolName',
              sortable: true
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              sortable: true
            }
          ]
        },
        templateRadio: ''
      }
    },
    created() {
      let self = this;
      this.updateWindow({
        sortBy: 'createDate',
        sortDirection: '-',
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        selectedUuidList: [],
        methods: {
          queryList: self.queryList
        }
      }).then(() => self.queryList())
    },
    methods: {
      getField(field, item) {
        let self = this;
        if (_.isUndefined(item)) return '';
        let normalField = ['poolName', 'aliasName'];
        if (normalField.includes(field)) return item[field];
        if (field === 'createDate') return self.formatDatetime(new Date(item[field]));
      },

      close() {
        let self = this;
        self.closeDialog(self.windowId);
      },
      getCondition: function () {
        let conditionList = []
        if (this.dialogData.param.conditions)
          conditionList = conditionList.concat(this.dialogData.param.conditions)
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      queryList: async function () {
        let resp = await rpc.query('primary-storage/ceph/pools', {
          count: false,
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          q: this.getCondition(),
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
        })
        this.updateWindow({
          pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
          availableCount: resp.total
        })
        let uuidList = resp.inventories.map((item) => item.uuid)
        let table = {}
        uuidList.map((uuid) => {
          table[uuid] = {
            selected: false
          }
        })
        this.updateWindow({uuidList, table})
        this.updateDbTable({
          tableName: 'pool',
          list: resp.inventories
        }).then(() => {
          this.itemList = this.getItemList();
        })
      },

      getItemList(){
        let self = this;
        return self.windowData.uuidList.map(uuid => {
          return self.dbData.pool[uuid];
        })
      },

      handleSingleSelect(row) {
        let self = this;
        self.templateRadio = row.uuid;
      },
    }
  }
</script>

<style scoped>

</style>
