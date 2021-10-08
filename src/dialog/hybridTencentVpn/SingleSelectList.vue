<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">选择Vpn</span>
      <span class="dialog-close el-icon-close"
            @click="close()"></span>
    </div>

    <div slot="body">
      <div style="padding: 20px 30px">
        <div class="page-toolbar-container" style="display: flex;justify-content: space-between;">
          <div class="left"></div>
          <div class="right">
            <el-input @blur="search()" @change="search()" placeholder="请输入内容" v-model="searchStr">
              <el-select placeholder="请选择" slot="prepend" style="width: 100px" v-model="selectVal">
                <el-option :key="index" :label="$t(`${item.name}`)" :value="item.value"
                           v-for="(item, index ) in conditionNameList"></el-option>
              </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </div>
        </div>
        <div class="page-table">
          <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
          <el-pagination v-if="windowData.total > 0"
                         :current-page="windowData.pageIndex"
                         :page-size="5"
                         :page-sizes="[5, 10]"
                         :total="windowData.total"
                         @current-change="pageCurrentChange"
                         @size-change="pageSizeChange"
                         class="page-table-pagination"
                         layout="total, sizes, prev, pager, next"></el-pagination>
        </div>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirm">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>

  import HybridTencentVpnGateWayList from 'src/tencent/vpnGateWay/List';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import _ from 'lodash';

  export default {
    name: "SingleSelectList",

    mixins: [WindowBase, MultiSelectList, HybridTencentVpnGateWayList],

    created() {
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        loading: false,
      }).then( () => {
        self.queryList();
      })
    },

    data() {
      let self = this;
      return {
        itemList: [],
        selectVal: 'name',
        searchStr: '',
        templateRadio: '',
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
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handSingleSelect: self.handleSingleSelect,
          handleSort: self.handleSort,
          type: 'radio',
          templateRadio: () => self.templateRadio,
          fields: [
             {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              field: 'name'
            },
            {
              getContent: item => self.getField('publicIp', item),
              getHeaderContent: self.$t('hybridTencentvirtualrouterentry.ip'),
              sortable: true,
              tooltip: true,
              field: 'publicIp'
            },
            {
              getContent: item => self.getField('spec', item),
              getHeaderContent: self.$t('hybridvpcvpngateway.spec'),
              sortable: true,
              tooltip: true,
              field: 'spec'
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              sortable: true,
              tooltip: true,
              field: 'createDate'
            }
          ]
        }
      }
    },

    methods: {
      getCondition() {
        let conditionList = [], self = this;
        if (this.dialogData.param.conditions) conditionList = conditionList.concat(self.dialogData.param.conditions)
        if (self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${self.searchStr}%25`)
        }
        return conditionList
      },

      close() {
        let self = this;
        self.closeDialog(self.windowId)
      },

      getField(field, item) {
        let self = this, normalFields = ['name', 'publicIp', 'spec'];
        if(_.includes(normalFields, field)) return item[field];
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },

      handleSingleSelect(row) {
        let self = this;
        self.templateRadio = row.uuid;
      },
      confirm() {
        let self = this;
        if(!self.templateRadio) {
          self.$message('请选择资源!');
          return;
        }
        self.dialogData.param.select(self.templateRadio);
        self.close();
      }
    }
  }
</script>

<style scoped>

</style>
