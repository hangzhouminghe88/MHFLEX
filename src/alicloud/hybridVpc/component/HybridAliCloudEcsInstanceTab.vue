<template>
  <div class="container">
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-left">
          <span>{{$t('common.hybridecsinstance') + $t('common.colon')}}</span>
          <drop-down class="detail-dropdown">
						<span slot="title">
							<span class="text">
								{{$t('common.actions')}}
							</span>
						</span>
            <span slot="content">
							<div class="dropdown-content">
                <a style="padding-top: 12px;" :class="{'disabled-text': !isSelected || inStates('Running')}" @click="isSelected && !inStates('Running') && pageEnableOrDisable('Running')">{{$t('common.start')}}</a>
                <a :class="{'disabled-text': !isSelected || inStates('Stopped')}" @click="isSelected && !inStates('Stopped') && pageEnableOrDisable('Stopped')">{{$t('common.stop')}}</a>
								<a @click="isSelected && !inStates('Stopped') && pageReboot()"  :class="{'disabled-text': !(isSelected && !inStates('Stopped'))}">{{$t("common.reboot")}}</a>
                <a @click="isSingleSelected && inStates('Running') && pageOpenConsole()" :class="{ 'disabled-text': !(isSingleSelected && inStates('Running'))}">{{ $t("vm.console") }}</a>
                <a @click="isSingleSelected && pageSetVmConsolePassword()" :class="{ 'disabled-text': !(isSingleSelected)}">{{$t("common.setConsolePassword")}}</a>
                <a @click="isSingleSelected && pageUpdateEcsRootPassword()" :class="{ 'disabled-text': !(isSingleSelected)}">{{$t("hybridecsinstance.updateRootPassword")}}</a>
                <a @click="isSelected && pageDelete()" style="padding-bottom: 12px;" :class="{'disabled-text': !isSelected}">{{$t("common.destroy")}}</a>
							</div>
						</span>
          </drop-down>
        </div>
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
          <span @click="refresh()" class="btn-refresh">
            <i class="el-icon-refresh icon"></i>
          </span>
        </div>
      </el-row>
    </div>

    <div slot="page-table-content">
      <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData.availableCount > 0"
                       :page-sizes="[5, 10]"
                       :page-size="5"
                       :total="windowData.availableCount"
                       class="page-table-pagination"
                       layout="total, sizes, prev, pager, next"
                       @current-change="pageCurrentChange"
                       @size-change="pageSizeChange"
                       :current-page="windowData.pageIndex"></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import HybridAliCloudEcsList from 'src/alicloud/hybridEcs/List';
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';

  export default {
    name: "HybridAliCloudEcsInstanceTab",

    mixins: [HybridAliCloudEcsList, WindowBase, MultiSelectList],

    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },

    created() {
      let self = this, dataUuid = '';
      dataUuid = self.param.uuid ? self.param.uuid : '';
      self.updateWindow({
        dataUuid,
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
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
                debugger
                if(self.$router.currentRoute.name === 'detailHybridAliCloudEcs') self.$emit('close')
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
              getHeaderContent: self.$t('hybridecsinstance.paymentInformation')
            },
            {
              getContent: item => self.getField('vpc', item),
              getHeaderContent: 'VPC'
            },
            {
              getContent: item => self.getField('identityZone', item),
              getHeaderContent: self.$t('hybridvswitch.identityZone'),
              sortable: true,
              field: 'identityZoneUuid'
            },
            {
              getContent: item => self.getField('ecsSecurityGroupUuid', item),
              getHeaderContent: self.$t('hybridesecuritygroup.securitygroup'),
              sortable: true,
              field: 'ecsSecurityGroupUuid'
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
      formatDatetime,

      getCondition() {
        let self = this, conditionList = [];
        if(self.param.conditions)
        conditionList = conditionList.concat(self.param.conditions)
        if (self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${self.searchStr}%25`)
        }
        return conditionList
      },

      getField (field, item) {
        let self = this, normalFields= ['name', 'ecsStatus', 'cpuCores', 'ecsInstanceId', 'privateIpAddress', 'publicIpAddress'];
        if(normalFields.includes(field)) return item[field]
        if(field === 'memorySize') return item[field] + 'G';
        if(field === 'paymentInformation') return item.chargeType ? self.$t(`hybridecsinstance.${item.chargeType}`) : self.$t('hybridecsinstance.afterPayment');
        if(field === 'vpc') return self.getEcsVpcName(item.uuid).replace(/-ZStack/g, '');
        if(field === 'identityZone') return self.getIdentityZone(item.uuid);
        if(field === 'ecsSecurityGroupUuid') return self.getSecurityGroupName(item.uuid).replace(/-ZStack/g, '');
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },
    }
  }
</script>

<style scoped>

</style>
