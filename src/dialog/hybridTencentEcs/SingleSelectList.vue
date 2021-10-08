<template>
  <dialog-template width="1000px">
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">{{$t('common.selectVmInstance')}}</span>
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
  import TencentEcsList from 'src/tencent/ecs/List';
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';

  export default {
    name: "TencentEcsSingleSelect",

    mixins: [WindowBase, MultiSelectList, PageBase, TencentEcsList],

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

    data () {
      let self = this;
      return {
        selectVal: 'name',
        searchStr: '',
        itemList: [],
        conditionNameList: [{
          name: 'common.name',
          value: 'name'
        }, {
          name: 'common.uuid',
          value: 'uuid'
        }],
        templateRadio: '',
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          handSingleSelect: self.handleSingleSelect,
          type: 'radio',
          templateRadio: () => self.templateRadio,
          fields: [
            {
						getContent: item => self.getField('name', item),
						getHeaderContent: self.$t('common.name'),
						onClick: (item) => {
              self.$router.push({name:'detailHybridTencentEcs', params: {uuid: item.uuid}})
						},
						field: 'name',
						sortable: true,
						tooltip: true,
						className: 'link'
					},
					{
						getContent: item => self.getField('ecsInstanceId',  item),
						getHeaderContent: self.$t('hybridecsinstance.ecsinstanceId'),
						sortable: true,
						field: 'ecsInstanceId',
						tooltip: true
					},
					{
						getContent: item => self.getField('cpuCores',  item),
						getHeaderContent: self.$t('common.cpu'),
						sortable: true,
						field: 'cpuCores'
					},
					{
						getContent: item => self.getField('memorySize', item),
						getHeaderContent: self.$t('common.memorySize'),
						sortable: true,
						field: 'memorySize'
					},
					{
						getContent: item => self.getField('privateIpAddress', item),
						getHeaderContent: self.$t('common.privateNetworkIP'),
						sortable: true,
						field: 'privateIpAddress',
            tooltip: true
					},
					{
						getContent: item => self.getField('publicIpAddress', item),
						getHeaderContent: self.$t('common.publicNetworkIP'),
						sortable: true,
						field: 'publicIpAddress',
            tooltip: true
					},
					{
						getContent: item => self.getField('paymentInformation', item),
						getHeaderContent: self.$t('hybridecsinstance.paymentInformation'),
						tooltip: true,
					},
					{
						getContent: item => self.getField('vpcName', item),
						getHeaderContent: 'VPC',
						tooltip: true,
					},
					{
						getContent: item => self.getField('identityZoneName', item),
						getHeaderContent: self.$t('hybridvswitch.identityZone'),
						sortable: true,
						field: 'identityZoneUuid',
						tooltip: true,
					},
					{
						getContent: item => self.getField('securityGroupName', item),
						getHeaderContent: self.$t('hybridesecuritygroup.securitygroup'),
						sortable: true,
						field: 'ecsSecurityGroupUuid',
						tooltip: true,
					},
					{
						getContent: item => self.getField('ecsStatus', item),
						getHeaderContent: self.$t('common.state'),
						field: 'ecsStatus'
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

     getField (field, item) {
			let self = this, normalFields= ['name', 'securityGroupName', 'cpuCores', 'ecsInstanceId', 'privateIpAddress', 'publicIpAddress', 'identityZoneName', 'vpcName'];
			if(normalFields.includes(field)) return item[field]
			if(field === 'ecsStatus') return item['ecsStatus'].toLowerCase().charAt(0).toUpperCase() + item['ecsStatus'].toLowerCase().slice(1);
			if(field === 'memorySize') return item[field] + 'G';
			if(field === 'paymentInformation') return item.chargeType ? self.$t(`hybridTencentEcsInstance.${item.chargeType}`) : self.$t('hybridecsinstance.afterPayment');
			if(field === 'createDate') return formatDatetime(new Date(item[field]));
		},

      handleSingleSelect(row) {
        let self = this;
        self.templateRadio = row.uuid;
      },

      close() {
        let self = this;
        self.closeDialog(self.windowId);
      },
      confirm() {
        let self = this;
        if(!self.templateRadio) {
          self.$message('您还没有选择资源！')
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
