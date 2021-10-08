<template>
  <dialog-template>
    <div class="modal-plain-block" slot="title">
      <div class="modal-title">选择vpc</div>
      <div class="dialog-close el-icon-close" @click="close()"></div>
    </div>
    <div slot="body" class="el_dialog__body" style="padding: 30px;">
      <div class="page-toolbar-container" style="display: flex; justify-content: space-between;">
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
          <mh-table :dataSource="dataSource" :loading="windowData.loading"></mh-table>
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
    <div slot="footer" class="dialog-footer">
       <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
       <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
     </div>
  </dialog-template>
</template>

<script>
import MultiSelectList from 'src/windows/Base/MultiSelectList';
import WindowBase from 'src/windows/Window';
import { formatDatetime } from 'src/utils/utils';
import hybridHuaweiVpcList from 'src/huaweicloud/vpc/List';
import _ from 'lodash';

export default {
  name: 'hybridHuaweiVpcSingleSelect',
  mixins: [MultiSelectList, WindowBase, hybridHuaweiVpcList],
  data() {
    let _this = this;
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
         getItemList: () => _this.itemList,
         handSingleSelect: _this.handleSingleSelect,
         type: 'radio',
         handleSort: _this.handleSort,
         templateRadio: () => _this.templateRadio,
         fields: [
           {
             getContent: item => _this.getField('name', item),
             getHeaderContent: _this.$t('common.name'),
             tooltip: true,
             sortable: true
           },
           {
             getContent: item => _this.getField('dataCenterName', item),
             getHeaderContent: _this.$t('common.hybridDatacenter'),
             tooltip: true
           },
           {
             getContent: item => _this.getField('cidrBlock', item),
             getHeaderContent: 'CIDR',
             tooltip: true
           },
           {
             getContent: item => _this.getField('status', item),
             getHeaderContent: _this.$t('common.status'),
             tooltip: true
           },
           {
             getContent: item => _this.getField('createDate', item),
             getHeaderContent: _this.$t('common.createDate'),
             tooltip: true,
             sortable: true
           }
         ]
      }
    }
  },
  created() {
    let _this = this;
    _this.updateWindow({
      pageIndex: 1,
      pageSize: 5,
      sortBy: 'createDate',
      sortDirection: '-',
      selectedUuidList: [],
      loading: false,
      methods: {
        query: _this.queryList
      }
    }).then(() => {
      _this.queryList();
    })
  },
  methods: {
    getField(field, item) {
      let _this = this, normalFields = ['name', 'status', 'cidrBlock'];
      if(normalFields.includes(field)) return item[field];
      if(field === 'createDate') return formatDatetime(new Date(item[field]));
    },
    close() {
      let _this = this;
      _this.closeDialog(_this.windowId);
    },
    getCondition() {
      let conditionList = []
      conditionList = conditionList.concat(this.dialogData.param.conditions)
      if (this.selectVal !== '' && this.searchStr !== '') {
         conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`);
      }
      return conditionList
    },
    handleSingleSelect(item) {
      let _this = this;
      _this.templateRadio = item.uuid;
    },
      //确定选择
        confirm() {
          let self = this;
          if (!self.templateRadio) {
            self.$message('您还没有选择任何资源！');
            return;
          }
          self.dialogData.param.select(self.templateRadio);
          self.close();
        }
  }
}
</script>

<style lang="less" scoped>

</style>
