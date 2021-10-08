<template>
  <dialog-template>
    <div slot="title" class="modal-block-plain">
      <span class="modal-title">选择云盘</span>
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

    <div slot="footer">
      <span class="btn-confirm" @click="confirm">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import { formatDatetime } from 'src/utils/utils';
  import TencentDiskList from 'src/tencent/disk/List';
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import _ from 'lodash';
  export default {
    name: "MultiSelectList",

    mixins: [WindowBase, MultiSelectList, PageBase, TencentDiskList],

    created() {
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        loading: false,
        methods: {
          queryList: self.queryList
        }
      }).then(() => {
        self.queryList();
      })
    },

    data() {
      let self = this;
      return {
        itemList: [],
        searchStr:  "",
        selectVal: 'name',
        conditionNameList: [{
          name: 'common.name',
          value: 'name'
        }, {
          name: 'common.uuid',
          value: 'uuid'
        }],
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              field: 'name',
              sortable: true,
              tooltip: true
            },
            {
              getContent: item => self.getField('diskId', item),
              getHeaderContent: self.$t('hybridAliyunDisk.diskId'),
              field: 'diskId',
              sortable: true,
              tooltip: true
            },
            {
              getContent: item => self.getField('diskCategory', item),
              getHeaderContent: self.$t('hybridAliyunDisk.diskCategory'),
              field: 'diskCategory',
              sortable: true,
              tooltip: true
            },
            {
              getContent: item => self.getField('sizeWithGB', item),
              getHeaderContent: self.$t('common.size'),
              field: 'sizeWithGB',
              sortable: true,
              tooltip: true
            },
            {
              getContent: item => self.getField('diskChargeType', item),
              getHeaderContent: self.$t('hybridAliyunDisk.billingMethod'),
              field: 'diskChargeType',
              sortable: true
            },
            {
              getContent: item => self.getField('diskType', item),
              getHeaderContent: self.$t('hybridAliyunDisk.diskType'),
              field: 'diskType',
              sortable: true,
              tooltip: true
            },
            {
              getContent: item => self.getField('identityZoneName', item),
              getHeaderContent: self.$t('common.hybrididentityzone'),
              field: 'identityZoneName',
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

    methods: {
      getCondition: function () {
        let conditionList = []
        if (this.dialogData.param.conditions) conditionList = conditionList.concat(this.dialogData.param.conditions)
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },
      getField(field, item){
        let self = this, normalFields = ['diskId','name', 'identityZoneName'];
        if(_.includes(normalFields, field)) return item[field];
        if(field === 'diskCategory') return self.$t(`hybridTencentDisk.${(item.diskCategory)}`);
        if(field === 'sizeWithGB') return `${item[field]}G`;
        if(field === 'diskChargeType') return item[field] ? self.$t(`hybridTencentDisk.${item[field]}`) : self.$t('hybridTencentDisk.afterPayment');
        if(field === 'diskType') return self.$t(`hybridTencentDisk.${item[field]}`);
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
        if(field === 'ecsName') return item.ecsName ? item[field] : self.$t('common.noAttach');
      },

      close() {
        let self = this;
        self.closeDialog(self.windowId);
      },
      confirm() {
        let self = this;
        if(!self.isSelected) {
          self.$message('您还没有选择资源！')
          return;
        }
        self.dialogData.param.select(self.selectedList);
        self.close();
      }
    }
  }
</script>

<style scoped>

</style>
