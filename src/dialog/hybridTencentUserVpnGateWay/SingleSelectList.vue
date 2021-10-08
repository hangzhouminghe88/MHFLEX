<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">{{$t('hybridvpcuservpngateway.select')}}</span>
      <span class="dialog-close el-icon-close" @click="close()"></span>
    </div>

    <div slot="body" class="dialog-body">
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

    <div slot="footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import UserVpnGatewayList from 'src/tencent/vpnUserGateWay/List';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import _ from 'lodash';

  export default {
    name: "SingleSelectList",

    mixins: [WindowBase, UserVpnGatewayList, MultiSelectList],

    created() {
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList:[],
        loading: false
      }).then( () => {
        self.queryList();
      })
    },

    data() {
      let self = this;
      return {
        selectVal: 'name',
        searchStr: '',
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
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          handSingleSelect: self.handleSingleSelect,
          type: 'radio',
          templateRadio:() => self.templateRadio,
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              field: 'name'
            },
            {
              getContent: item => self.getField('dataCenterName', item),
              getHeaderContent: self.$t('common.hybridDatacenter'),
              sortable: true,
              tooltip: true,
              field: 'dataCenterUuid'
            },
            {
              getContent: item => self.getField('ip', item),
              getHeaderContent: 'MHFLEX' + self.$t('common.ip'),
              sortable: true,
              tooltip: true,
              field: 'ip'
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
      close() {
        let self = this;
        self.closeDialog(self.windowId);
      },

      getCondition () {
        let conditionList = []
        conditionList = conditionList.concat(this.dialogData.param.conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}25%`)
        }
        return conditionList
      },

      confirm() {
        let self = this;
        if(!self.templateRadio){
          self.$message('请选择资源!');
        }
        self.dialogData.param.ok(self.templateRadio);
        self.close();
      },

      getField(field, item) {
        let self = this, normalFields = ['name', 'ip', 'dataCenterName'];
        if(_.includes(normalFields, field)) return item[field];
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },

      handleSingleSelect(row) {
        let self = this;
        self.templateRadio = row.uuid;
      }
    }
  }
</script>

<style scoped>

</style>
