<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">{{$t("hybridvirtualprivatecloud.select")}}</span>
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
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import HybridAliCloudVpcList from 'src/alicloud/hybridVpc/List';
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';

  export default {
    name: "SingleSelectList",

    mixins: [WindowBase, MultiSelectList, HybridAliCloudVpcList],

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
              field: 'name',
              className: 'link',
              sortable: true,
              tooltip: true,
              onClick: (item) => {
                self.$router.push({name: 'detailHybridAliCloudSecurityGroup', params: {uuid: item.uuid}});
              }
            },
            {
              getContent: item => self.getField('dataCenterName', item),
              getHeaderContent: self.$t('common.datacenter'),
              field: 'dataCenterName',
              sortable: true,
              tooltip: true,
            },
            {
              getContent: item => self.getField('cidrBlock', item),
              getHeaderContent: 'CIDR',
              field: 'cidrBlock',
              sortable: true,
              tooltip: true,
            },
            {
              getContent: item => self.getField('ecsInstanceNum', item),
              getHeaderContent: self.$t('hybridvirtualprivatecloud.ecsInstanceNum'),
              field: 'ecsInstanceNum'
            },
            {
              getContent: item => self.getField('status', item),
              getHeaderContent:  self.$t('common.status'),
              field: 'state',
              sortable: true,
              tooltip: true,
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
      getCondition() {
        let conditionList = [], self = this;
        if (this.dialogData.param.conditions) conditionList = conditionList.concat(self.dialogData.param.conditions)
        if (self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
        }
        return conditionList
      },

      close() {
        let self = this;
        self.closeDialog(self.windowId)
      },

      getField(field, item){
        let self = this;
        let normalFields = ['dataCenterName', 'status', 'cidrBlock'];
        if(normalFields.includes(field)) return item[field];
        if(field === 'name') return item[field].replace(/-ZStack/g, '');
        if(field === 'ecsInstanceNum') return self.getEcsInstanceNum(item.uuid);
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
