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

  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import HybridTencentEipList from 'src/tencent/eip/List';
  import {formatDatetime} from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import { mapGetters } from 'vuex';

  export default {
    name: 'HybridTencentImageSingleSelect',

    mixins: [WindowBase, HybridTencentEipList, MultiSelectList],

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
              onClick: (item) => {
                self.$router.push({name: 'detailHybridTencentEip', params:{uuid: item.uuid} });
              },
              className: 'link',
              field: 'name',
              tooltip: true,
              sortable: true
            },
            {
              getContent: item => self.getField('eipAddress',  item),
              getHeaderContent: self.$t('common.ipAddress'),
              tooltip: true,
              field: 'eipAddress',
              sortable: true
            },
            {
              getContent: item => self.getField('bandWidth', item),
              getHeaderContent: self.$t('common.bandwidth'),
              tooltip: true,
              field: 'bandWidth',
              sortable: true
            },
            {
              getContent: item => self.getField('status', item),
              getHeaderContent: self.$t('common.status'),
              sortable: true,
              field: 'status'
            },
            {
              getContent: item => self.getField('ecsName', item),
              getHeaderContent: self.$t('common.vm'),
              sortable: true,
              tooltip: true,
              field: 'allocateResourceUuid'
            },
            {
              getContent: item => self.getField('dataCenterName', item),
              getHeaderContent: self.$t('common.hybridDatacenter'),
              sortable: true,
              tooltip: true,
              field: 'dataCenterUuid'
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
        let self = this, normalFields = ['eipAddress', 'dataCenterName'];
        if(normalFields.includes(field)) return item[field];
				if(field === 'name') return item[field].replace(/zstack/g, '');
				if(field === 'status') return item[field].charAt(0) + item[field].toLowerCase().slice(1);
        if(field === 'ecsName') {
          return item[field] === '' ? self.$t('ldapEntry.notAttachedLdap') : item[field];
        }
        if(field === 'bandWidth') return item[field] ? `${item[field]}M` : '1M';
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
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
