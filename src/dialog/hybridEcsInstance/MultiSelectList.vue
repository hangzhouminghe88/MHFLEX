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
  import List from 'src/alicloud/hybridEcs/List';
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';

  export default {
    name: "MultiSelectList",

    mixins: [WindowBase, MultiSelectList, PageBase, List],

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
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              onClick: (item) => {
                self.$router.push({name:'detailHybridAliCloudEcs', params: {uuid: item.uuid}})
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
              field: 'cpuCores',
              tooltip: true,
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
              getContent: item => self.getField('vpc', item),
              getHeaderContent: 'VPC',
              tooltip: true,
            },
            {
              getContent: item => self.getField('identityZone', item),
              getHeaderContent: self.$t('hybridvswitch.identityZone'),
              sortable: true,
              field: 'identityZoneUuid',
              tooltip: true,
            },
            {
              getContent: item => self.getField('ecsSecurityGroupUuid', item),
              getHeaderContent: self.$t('hybridesecuritygroup.securitygroup'),
              sortable: true,
              field: 'ecsSecurityGroupUuid',
              tooltip: true,
            },
            {
              getContent: item => self.getField('ecsStatus', item),
              getHeaderContent: self.$t('common.state'),
              field: 'ecsStatus',
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

      getCondition: function () {
        let conditionList = []
        if (this.dialogData.param.conditions) conditionList = conditionList.concat(this.dialogData.param.conditions)
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },

      getField (field, item) {
        let self = this, normalFields= ['name', 'ecsStatus', 'cpuCores', 'ecsInstanceId', 'privateIpAddress', 'publicIpAddress'];
        if(normalFields.includes(field)) return item[field]
        if(field === 'memorySize') return item[field] + 'G';
        if(field === 'paymentInformation') return item.chargeType ? self.$t(`hybridecsinstance.${item.chargeType}`) : self.$t('hybridecsinstance.afterPayment');
        if(field === 'vpc') return self.getEcsVpcName(item.uuid);
        if(field === 'identityZone') return self.getIdentityZone(item.uuid);
        if(field === 'ecsSecurityGroupUuid') return self.getSecurityGroupName(item.uuid);
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
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
