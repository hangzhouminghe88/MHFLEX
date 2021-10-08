<template>
  <dialog-template width="1000px">
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">{{$t('hybridvirtualborderrouter.select')}}</span>
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
  import HybridVRInterfaceList from 'src/alicloud/hybridVirtualRouterInterface/List';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import _ from 'lodash';

  export default {
    name: "SingleSelectList",

    mixins: [WindowBase, HybridVRInterfaceList, MultiSelectList],

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
							field: 'name',
							sortable: true,
							tooltip: true
						},
						{
							getContent: item => self.getField('routerInterfaceId', item),
							getHeaderContent: self.$t('hybridrouterinterfacepair.id'),
							field: 'routerInterfaceId',
							sortable: true,
							tooltip: true
						},
						{
							getContent: item => self.getField('spec', item),
							getHeaderContent: self.$t('hybridrouterinterfacepair.spec'),
							field: 'spec',
							sortable: true,
							tooltip: true
						},
						{
							getContent: item => self.getField('role', item),
							getHeaderContent: self.$t('hybridrouterinterfacepair.role'),
							field: 'role',
							sortable: true,
							tooltip: true
						},
						{
							getContent: item => self.getField('accessPointName', item),
							getHeaderContent: self.$t('hybridrouterinterfacepair.accessPoint'),
							field: 'accessPointUuid',
							sortable: true,
							tooltip: true
						},
						{
							getContent: item => self.getField('oppositeInterfaceName', item),
							getHeaderContent: self.$t('hybridrouterinterfacepair.oppositeInterfaceUuid'),
							field: 'oppositeInterfaceUuid',
							sortable: true,
							tooltip: true
						},
						{
							getContent: item => self.getField('dataCenterName', item),
							getHeaderContent: self.$t('common.hybriddatacenter'),
							field: 'dataCenterUuid',
							sortable: true,
							tooltip: true
						},
						{
							getContent: item => self.getField('status', item),
							getHeaderContent: self.$t('common.status'),
							field: 'status',
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
     //填充数据
    getField(field, item) {
			let self = this, normalFields= ['name', 'routerInterfaceId', 'spec','status', 'oppositeInterfaceName', 'accessPointName', 'dataCenterName'];
			if(_.includes(normalFields, field)) return item[field];
			if(field === 'role') return self.$t(`hybridrouterinterfacepair.${(item[field]).toLowerCase()}`);
			if(field === 'createDate') return formatDatetime(new Date(item[field]));
		},
     //单选
      handleSingleSelect(row) {
        let self = this;
        self.templateRadio = row.uuid;
      }
    }
  }
</script>

<style scoped>

</style>
