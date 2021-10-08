<template>
  <dialog-template>
    <div slot="title" class="modal-block-plain">
      <span class="modal-title">{{$t('common.selectImage')}}</span>
      <span class="dialog-close el-icon-close" @click="close"></span>
    </div>

    <div slot="body" style="padding: 20px 20px">
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

    <div slot="footer">
      <span class="btn-confirm" @click="confirm">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import HybridTencentImageList from 'src/tencent/hybridImage/List';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import {formatDatetime} from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import { mapGetters } from 'vuex';
  import _ from 'lodash';

  export default {
    name: 'HybridTencentImageSingleSelect',

    mixins: [WindowBase, HybridTencentImageList, MultiSelectList],

    data() {
      let self = this;
      return {
        itemList: [],
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
        templateRadio: '',
        dataSource: {
          getItemList: () => self.itemList,
          handSingleSelect: self.handleSingleSelect,
          type: 'radio',
          handleSort: self.handleSort,
          templateRadio: () => self.templateRadio,
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              field: 'name',
              sortable: true,
              tooltip: true
            },
            {
              getContent: item => self.getField('platform', item),
              getHeaderContent: self.$t('hybridimage.platform'),
              field: 'platform',
              tooltip: true
            },
            {
              getContent: item => self.getField('type', item),
              getHeaderContent: self.$t('hybridimage.type'),
              field: 'type'
            },
            {
              getContent: item => self.getField('ecsImageSize', item),
              getHeaderContent: self.$t('hybridimage.ecsImageSize'),
              field: 'ecsImageSize'
            },
            {
              getContent: item => self.getField('ecsImageId', item),
              getHeaderContent: self.$t('hybridimage.ecsImageId'),
              field: 'ecsImageId',
              tooltip: true
            },
            {
              getContent: item => self.getField('dataCenterName', item),
              getHeaderContent: self.$t('hybridimage.dataCenter'),
              field: 'dataCenter',
              tooltip: true
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate',
              sortable: true,
              tooltip: true
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
        selectedUuidList: [],
        loading: false,
      }).then(() => {
        self.queryList();
      })
    },

    methods: {
      close() {
        let self = this;
        self.closeDialog(self.windowId);
      },

      handleSingleSelect(row) {
        let self = this;
        self.templateRadio = row.uuid;
      },

      getField(field, item) {
        let normalFields = ['name', 'platform','ecsImageId', 'dataCenterName'];
        if (!item[field]) return '';
        if (_.includes(normalFields, field)) return item[field];
        if (field === 'type') return this.$t(`hybridTencentImage.${item[field]}`);
        if (field === 'ecsImageSize') return `${item['ecsImageSize']}G`;
        if (field === 'createDate') return formatDatetime(new Date(item[field]));
      },

      getCondition() {
        let conditionList = []
        conditionList = conditionList .concat(this.dialogData.param.conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList .concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`);
        }
        return conditionList
      },

      confirm() {
        let self = this;
        if (!self.templateRadio) {
          self.$message('您还没有选择任何资源！');
          return;
        }
        self.dialogData.param.ok(self.templateRadio);
        self.close();
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
