<template>
	<page-template>
    <div slot="page-header">
			<el-row :gutter="10">
        <el-col :span="2.2">
					<span class="page-table-title">
						{{$t('common.hybridecsinstance')}}
					</span>
				</el-col>
				<el-col :span="2.2">
					<el-tabs v-model="currTab">
						<el-tab-pane :label="$t('common.available')+`(${windowData.availableCount ? windowData.availableCount : '0'})`" name="available"></el-tab-pane>
					</el-tabs>
				</el-col>
			</el-row>
		</div>

		<div slot="page-toolbar" class="page-toolbar-container">
			<el-row type="flex">
        <div class="page-toolbar-left">
					<span class="btn-success" @click="goToCreate()">
						<i class="el-icon-plus icon"></i>
						<span class="text" v-text="$t('hybridecsinstance.createecsinstance')"></span>
					</span>
					<span class="btn-primary" :class="{'disabled': !isSelected || inStates('Running')}" @click="isSelected && !inStates('Running') && pageEnableOrDisable('Running')">
						<i class="el-icon-caret-right icon"></i>
						<span class="text" v-text="$t('common.start')"></span>
					</span>
					<span class="btn-primary" :class="{'disabled': !isSelected || inStates('Stopped')}" @click="isSelected && !inStates('Stopped') && pageEnableOrDisable('Stopped')">
						<i class="el-icon-remove-outline icon"></i>
						<span class="text" v-text="$t('common.stop')"></span>
					</span>
					<drop-down class="btn-primary more dropdown" :enabled="isSelected" :class="{'disabled': !isSelected}">
						<span slot="title">
							<span class="text">
                <i class="el-icon-more"></i>
								{{$t('common.moreActions')}}
							</span>
						</span>
						<span slot="content">
							<div class="dropdown-content">
								<a @click="isSelected && !inStates('Stopped') && pageReboot()" style="padding-top: 12px;" :class="{'disabled-text': !(isSelected && !inStates('Stopped'))}">{{$t("common.reboot")}}</a>
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
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="pageCurrentChange"
            @size-change="pageSizeChange"
            :current-page="windowData.pageIndex"></el-pagination>
        </div>
		</div>
	</page-template>
</template>

<script>
import MutiSelectList from 'src/windows/Base/MultiSelectList';
import PageTemplate from 'src/component/PageTemplate';
import { formatDatetime } from 'src/utils/utils';
import WindowBase from 'src/windows/Window';
import List from './List';

export default {
	name: 'HybridAliCloudEcsPage',

	mixins: [WindowBase, MutiSelectList, List],

	components: {
		PageTemplate
	},

	created () {
		let self = this;
		self.updateWindow({
			pageIndex: 1,
			pageSize: 10,
			sortBy: 'createDate',
			sortDirection: '-',
			selectedUuidList: [],
			loading: false,
		}).then ( () => {
			self.queryList();
		})
	},

	data () {
		let self = this;
		return {
			currTab: 'available',
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
		getField (field, item) {
			let self = this, normalFields= ['name', 'ecsStatus', 'cpuCores', 'ecsInstanceId', 'privateIpAddress', 'publicIpAddress'];
			if(normalFields.includes(field)) return item[field]
			if(field === 'memorySize') return item[field] + 'G';
			if(field === 'paymentInformation') return item.chargeType ? self.$t(`hybridecsinstance.${item.chargeType}`) : self.$t('hybridecsinstance.afterPayment');
			if(field === 'vpc') return self.getEcsVpcName(item.uuid).replace(/ZStack-/ig,  '');
			if(field === 'identityZone') return self.getIdentityZone(item.uuid);
			if(field === 'ecsSecurityGroupUuid') return self.getSecurityGroupName(item.uuid);
			if(field === 'createDate') return formatDatetime(new Date(item[field]));
		},

		goToCreate () {
			let self = this;
			self.$router.push({name: 'createHybridAliCloudEcs'})
		}
	}
}
</script>

<style lang="less" scoped>

</style>
