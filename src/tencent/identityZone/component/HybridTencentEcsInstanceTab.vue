<template>
	 <div class="container">
		   <div class="page-toolbar-container">
      <div class="toolbar-left">
        <div class="title">{{$t('common.hybridecsinstance') + $t('common.colon')}}</div>
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">
              {{$t('common.actions')}}
            </span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
							 <a style="padding-top: 12px;" :class="{'disabled-text': inStates('RUNNING')}" @click="!inStates('RUNNING') && pageEnableOrDisable('Running')">{{$t('common.start')}}</a>
							 <a :class="{'disabled-text': inStates('STOPPED')}" @click="!inStates('STOPPED') && pageEnableOrDisable('Stopped')">{{$t('common.stop')}}</a>
               <a @click="isSelected && !inStates('STOPPED') && pageReboot()" :class="{'disabled-text': !(isSelected && !inStates('STOPPED'))}">{{$t("common.reboot")}}</a>
               <a @click="isSingleSelected && inStates('RUNNING') && pageOpenConsole()" :class="{ 'disabled-text': !(isSingleSelected && inStates('RUNNING'))}">{{ $t("vm.console") }}</a>
               <a @click="isSingleSelected && pageSetVmConsolePassword()" :class="{ 'disabled-text': !(isSingleSelected)}">{{$t("common.setConsolePassword")}}</a>
               <a @click="isSingleSelected && pageUpdateEcsRootPassword()" :class="{ 'disabled-text': !(isSingleSelected)}">{{$t("hybridecsinstance.updateRootPassword")}}</a>
               <a @click="isSelected && pageDelete()" style="padding-bottom: 12px;" :class="{'disabled-text': !isSelected}">{{$t("common.destroy")}}</a>
            </div>
          </span>
        </drop-down>
      </div>
      <div class="toolbar-right">
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
        <div class="btn-refresh" @click="refresh">
          <span class="refresh-icon"></span>
        </div>
      </div>
    </div>
    <div class="page-table">
      <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData.availableCount > 0"
                       :page-size="windowData.pageSize"
                       :page-sizes="[10, 20, 50, 100]"
                       @current-change="pageCurrentChange"
                       layout="total, sizes, prev, pager, next, jumper"
                       @size-change="pageSizeChange"
                       :current-page="windowData.pageIndex"
                       :total="windowData.availableCount"
        ></el-pagination>
      </div>
    </div>
	 </div>
</template>

<script>
import MultiSelectList from 'src/windows/Base/MultiSelectList';
import TencentEcsList from 'src/tencent/ecs/List';
import { formatDatetime } from 'src/utils/utils';
import WindowBase from 'src/windows/Window';
import PageBase from 'src/windows/PageBase';
import { mapGetters } from 'vuex';

export default {
	name: 'HybridTencentEcsInstanceTab',
	
	mixins: [WindowBase, PageBase, MultiSelectList, TencentEcsList],

	props: {
		param: {
			type: Object,
			default: () => {
				return {}
			}
		}
	},

	data() {
		let self = this;
		return {
			selectVal: 'name',
			searchStr: '',
			conditionNameList: [
				{name: 'common.name', value: 'name'},
				{name: 'common.uuid', value: 'uuid'}
			],
			itemList: [],
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

	created() {
		let self = this;
		self.updateWindow({
			pageIndex: 1,
			pageSize: 10,
			sortBy: 'createDate',
			sortDirection: '-',
			loading: false,
			selectedUuidList: [],
			methods: {
				query: self.queryList
			}
		}).then( () => {
			self.queryList();
		})
	},

	methods: {
     getCondition() {
			 let self = this, conditionList = [];
			 if(self.param.conditions) conditionList = conditionList.concat(self.param.conditions);
			 if(self.selectVal !== '' && self.searchStr !== '') {
				 conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
			 }
			 return conditionList;
		 },

		 //填充腾讯云tab数据
		 getField (field, item) {
			let self = this, normalFields= ['name', 'securityGroupName', 'cpuCores', 'ecsInstanceId', 'privateIpAddress', 'publicIpAddress', 'identityZoneName', 'vpcName'];
			if(normalFields.includes(field)) return item[field]
			if(field === 'ecsStatus') return item['ecsStatus'].toLowerCase().charAt(0).toUpperCase() + item['ecsStatus'].toLowerCase().slice(1);
			if(field === 'memorySize') return item[field] + 'G';
			if(field === 'paymentInformation') return item.chargeType ? self.$t(`hybridTencentEcsInstance.${item.chargeType}`) : self.$t('hybridecsinstance.afterPayment');
			if(field === 'createDate') return formatDatetime(new Date(item[field]));
		},
	}
}
</script>

<style scoped>
 .toolbar-left{
    flex: 1 1 auto;
  }

  .title{
    display: inline-flex;
    font-size: 14px;
    padding-right:5px;
  }
  .page-toolbar-container{
    display: flex;
    justify-content: space-between;
  }
  .refresh-icon{
    height: 11px;
    width: 11px;
    border-radius: 100%;
    border: 1px solid #ccc;
    display: inline-block;
  }
  .refresh-icon:before{
    height: 10px;
    width: 10px;
    border-radius: 100%;
    border: 1px solid #ccc;
    display: inline-block;
  }

  .search{
    display: inline-block;
    padding-right: 10px;
  }

  .btn-refresh{
    border: 1px solid #DCDFE6;
    padding: 11px 13px;
  }
</style>
