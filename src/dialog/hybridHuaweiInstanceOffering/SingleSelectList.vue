<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <div class="modal-title">{{$t('common.selectInstanceOffering')}}</div>
      <div class="dialog-close el-icon-close" @click="close()"></div>
    </div>

    <div slot="body" style="padding: 20px 20px">
      <div class="page-toolbar-container" style="display: flex; justify-content: space-between">
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

    <div slot="footer" class="modal-footer">
      <div class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</div>
      <div class="btn-cancel" @click="close()">{{$t('common.cancel')}}</div>
    </div>
  </dialog-template>
</template>

<script>
  import HuaweiInstanceOfferingList from 'src/huaweicloud/instanceOffering/List';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';

  export default {
    name: "SingleSelectList",

    mixins: [HuaweiInstanceOfferingList, MultiSelectList, WindowBase],

    data() {
      let self = this;
      return {
        itemList:[],
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
          handleSelection: self.handleSelect,
          handSingleSelect: self.handleSingleSelect,
          type: 'radio',
          templateRadio: () => self.templateRadio,
          handleSort: self.handleSort,
          fields: [
            {
              getContent: item => self.getField('instanceType', item),
              getHeaderContent: self.$t('hybridEcsInstanceType.typeId'),
              field: 'typeId',
              sortable: true,
              tooltip: true
            },
            {
              getContent: item => self.getField('cpu', item),
              getHeaderContent: self.$t('common.cpuNum'),
              field: 'cpu'
            },
            {
              getContent: item => self.getField('memory', item),
              getHeaderContent: self.$t('common.memorySize'),
              field: 'memory'
            },
            {
              getContent: item => self.getField('instanceFamily', item),
              getHeaderContent: self.$t('hybridEcsInstanceType.typeFamily'),
              field: 'instanceFamily'
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
      }).then ( () => {
        self.queryList();
      })
    },

    methods: {
      getCondition() {
        let conditionList = [], self = this;
        if(self.dialogData.param.conditions)
          conditionList = conditionList.concat(self.dialogData.param.conditions);
        if(self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${self.searchStr}=%25`)
        }
        return conditionList;
      },

      getIZoneUuid () {
        return this.dialogData.param.iZoneUuid
      },

      close() {
        let self = this;
        self.closeDialog(self.windowId);
      },

      getField(field, item) {
        let normalFields = ['instanceType', 'cpu', 'instanceFamily'];
        if(!item[field]) return '';
        if(normalFields.includes(field)) return item[field];
        if(field === 'memory') return `${item[field]}G`
      },

      handleSingleSelect(row) {
        let self = this;
        self.templateRadio = row.uuid;
      },

      confirm() {
        let self = this;
        if(!self.templateRadio) {
          self.$message('您还没有选择资源！');
          return;
        }
        self.dialogData.param.ok(self.templateRadio);
        self.close();
      }
    }
  }
</script>

<style scoped>

</style>
