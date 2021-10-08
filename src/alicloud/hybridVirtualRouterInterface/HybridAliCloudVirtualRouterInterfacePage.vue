<template>
	<page-template>
		<div slot="page-header">
			<el-row :gutter="10">
				<el-col :span=2.2>
					<span class="page-header-title">
						{{$t('common.hybridrouterinterface')}}
					</span>
				</el-col>
				<el-col :span="2.2">
					<el-tabs v-model="currSelectTab" @tab-click="changeCurrTab">
						<el-tab-pane :label="$t('common.hybridvirtualborderrouter')+`(${windowData.vbrCount ? windowData.vbrCount : '0'})`" name="vbr"></el-tab-pane>
						<el-tab-pane :label="$t('common.vpcvrouter')+`(${windowData.vrouterCount ? windowData.vrouterCount : '0'})`" name="vrouter"></el-tab-pane>
					</el-tabs>
				</el-col>
			</el-row>
		</div>

		<div slot="page-toolbar" class="page-toolbar-container">
			<el-row type="flex">
        <div class="page-toolbar-left">
				 <span class="btn-success" @click="pageCreate()">
          <i class="icon el-icon-plus"></i>
          <span class="text">{{$t('hybridrouterinterfacepair.add')}}</span>
        </span>
          <help-trigger name="routerInterface" style="left: 175px;position: absolute;top: 100px;"/>
        </div>
        <div class="page-toolbar-center"></div>
        <div class="page-toolbar-right">
				<span style="padding: 0px 15px;display: inline-block;">
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
			<mh-table :data-source="dataSource" :lading="windowData.loading"></mh-table>
			<div class="page-table-pagination">
				 <el-pagination v-if="windowData.total > 0"
                       :page-size="windowData.pageSize"
                       :page-sizes="[10, 20, 50, 100]"
                       @current-change="pageCurrentChange"
                       @size-change="pageSizeChange"
                       layout="total, sizes, prev, pager, next"
                       :total="windowData.total"
        ></el-pagination>
			</div>
		</div>
	</page-template>
</template>

<script>
import HybridAliCloudVirtaulRouterInterfaceList from './List';
import MultiSelectList from 'src/windows/Base/MultiSelectList';
import PageTemplate from 'src/component/PageTemplate';
import { formatDatetime } from 'src/utils/utils';
import WindowBase from 'src/windows/Window';
import PageBase from 'src/windows/PageBase';
import _ from 'lodash'

export default {
	components: {
		PageTemplate
	},

	mixins: [MultiSelectList, PageBase, WindowBase, HybridAliCloudVirtaulRouterInterfaceList],

	data() {
		let self = this;
		return {
			  currSelectTab: 'vbr',
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
							onClick: (item) => {
                self.$router.push({name: 'detailhybridalicloudvirtualrouterinterface', params: {
									uuid: item.uuid,
									currTab: self.currSelectTab
								}})
							},
							className: 'link',
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

	created() {
		let self = this;
		self.currSelectTab = self.$route.params.currTab ? self.$route.params.currTab : 'vbr';
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

	methods: {
		getField(field, item) {
			let self = this, normalFields= ['name', 'routerInterfaceId', 'spec','status', 'oppositeInterfaceName', 'accessPointName', 'dataCenterName'];
			if(_.includes(normalFields, field)) return item[field];
			if(field === 'role') return self.$t(`hybridrouterinterfacepair.${(item[field]).toLowerCase()}`);
			if(field === 'createDate') return formatDatetime(new Date(item[field]));
		},

		changeCurrTab() {
			let self = this;
			self.itemList = [];
		  self.updateWindow({
			pageIndex: 1,
			pageSize: 10,
			sortBy: 'createDate',
			sortDirection: '-',
			selectedUuidList: [],
			loading: false,
		  }).then(() => {
			self.queryList();
		  })
		}
	}
}
</script>
