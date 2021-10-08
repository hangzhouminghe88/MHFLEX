<template>
  <dialog-template>
    <div slot="title" class="modal-plain-block">
      <span class="model-title">{{$t('hybriddatacenter.select')}}</span>
      <span class="dialog-close el-icon-close" @click="close()"></span>
    </div>

    <div slot="body" class="dialog-body">
      <div style="padding: 20px 30px;">
        <div class="page-toolbar-container">
          <div class="page-toolbar-left"></div>
          <div class="page-toolbar-center"></div>
          <div class="page-toolbar-right">
						 <span style="padding: 0 15px;display: inline-block;">
              <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
                <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                  <el-option
                    v-for="(item, index ) in conditionNameList"
                    :label="$t(`${item.name}`)"
                    :key="index"
                    :value="item.value"
                  ></el-option>
                </el-select>
              <span slot="append">
                <i class="el-icon-search icon"></i>
              </span>
             </el-input>
            </span>
          </div>
        </div>
        <div class="page-table">
          <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
          <div class="page-table-pagination">
            <el-pagination v-if="windowData.availableCount >0"
                           :page-size="windowData.pageSize"
                           :page-sizes="[5, 10]"
                           @size-change="pageSizeChange"
                           @current-change="pageCurrentChange"
                           layout="total, sizes, prev, pager, next"
                           :total="windowData.availableCount"
            ></el-pagination>
          </div>
        </div>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirm">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import {formatDatetime} from '../../utils/utils';
  import List from 'src/huaweicloud/dataCenter/List';
  import WindowBase from 'src/windows/Window';
  import _ from 'lodash';

  export default {
    name: "HybridHuaweiDataCenterSingleSelect",
    mixins: [WindowBase, MultiSelectList, List],

    data() {
      let self = this;
      return {
        itemList: [],
        selectVal: 'regionName',
        searchStr: '',
        templateRadio: '',
        conditionNameList: [
          {
            name: 'hybridbucket.region',
            value: 'regionName'
          },
          {
            name: 'common.uuid',
            value: 'uuid'
          }
        ],
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          handSingleSelect: self.handleSingleSelect,
          type: 'radio',
          templateRadio: () => self.templateRadio,
          fields: [
            {
              getContent: item => self.getField('regionName', item),
              getHeaderContent: self.$t('hybriddatacenter.region'),
              field: 'regionName',
              sortable: true
            },
            {
              getContent: item => self.getField('regionId', item),
              getHeaderContent: self.$t('hybriddatacenter.regionId'),
              field: 'regionId'
            },
            {
              getContent: item => self.getField('description', item),
              getHeaderContent: self.$t('common.description'),
              field: 'description'
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate',
              sortable: true
            }
          ]
        }
      }
    },

    created() {
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-',
        loading: false,
        selectedUuidList: [],
      }).then(() => {
        self.queryList();
      })
    },

    methods: {
      close() {
        let self = this;
        self.closeDialog(self.windowId);
      },

      getCondition() {
        let conditionList = [], self = this;
        if (self.dialogData.param.conditions)
          conditionList = conditionList.concat(self.dialogData.param.conditions)
        if (self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
        }
        return conditionList
      },

      getField(field, item) {
        let self = this, normalFields = ['regionName', 'regionId', 'description'];
        if (_.isUndefined(item)) return '';
        if (normalFields.includes(field)) return item[field];
        if (field === 'createDate') return formatDatetime(new Date(item[field]));
      },

      confirm() {
        let self = this;
        if (!self.templateRadio) {
          self.$message({message: '请选择资源'})
          return;
        }
        self.dialogData.param.select(self.templateRadio);
        self.close();
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
