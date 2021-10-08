<template>
  <dialog-template>
	  <div slot="title" class="modal-block-plain">
			<span class="modal-title">{{$t('hybridesecuritygroup.selectSecurityGroup')}}</span>
			<span class="dialog-close el-icon-close" @click="close"></span>
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
		</div>

		<div slot="footer">
			<span class="btn-confirm" @click="confirm">{{$t('common.confirm')}}</span>
			<span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
		</div>
	</dialog-template>
</template>

<script>
import HybridAliCloudSecurityList from 'src/alicloud/hybridAliCloudSecurityGroup/List';
import MultiSelectList from 'src/windows/Base/MultiSelectList';
import { formatDatetime } from 'src/utils/utils';
import WindowBase from 'src/windows/Window';
import _ from 'lodash';

export default {
	name: 'HybridAliCloudSingleSelect',

	mixins: [WindowBase, MultiSelectList, HybridAliCloudSecurityList],

	data () {
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
				handSingleSelect: self.handleSingleSelect,
				handleSort: self.handleSort,
				type: 'radio',
				templateRadio: () => self.templateRadio,
				fields: [
					{
						getContent: item => self.getField('name', item),
						getHeaderContent: self.$t('common.name'),
						field: 'name',
						sortable: true,
            tooltip: true
					},
					{
						getContent: item => self.getField('ecsVpcUuid', item),
						getHeaderContent: self.$t('hybridesecuritygroup.vpc'),
						field: 'ecsVpcUuid'
					},
					{
						getContent: item => self.getField('securityGroupId', item),
						getHeaderContent: self.$t('hybridesecuritygroup.securityGroupId'),
						field: 'securityGroupId',
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

	created () {
		let self = this;
		self.updateWindow({
			pageIndex: 1,
			pageSize: 5,
			sortBy: 'createDate',
			sortDirection: '-',
			loading: false,
			selectedUuidList: []
		}).then ( () => {
			self.queryList();
		})
	},

	methods: {
		getCondition () {
			let conditionList = [], self = this;
			conditionList = conditionList.concat(self.dialogData.param.conditions);
			if(self.selectVal !== '' && self.searchStr !== ''){
				conditionList = conditionList.concat(`${self.selectVal}~=%25${self.searchStr}%25`);
			}
			return conditionList;
		},

		close () {
			let self = this;
			self.closeDialog(self.windowId);
		},

		confirm () {
		 let self = this;
		 if(!self.templateRadio){
			 self.$message('您还没有选择资源！');
			 return;
		 }
		 self.dialogData.param.ok(self.templateRadio);
		 self.close();
		},

		handleSingleSelect (row) {
			let self = this;
			self.templateRadio = row.uuid;
		},

		getField (field, item) {
			let  normalFields=['securityGroupId'];
			// if(!item[field]) return '';
      if(_.includes(normalFields, field)) return item[field];
      if(field === 'name') return item['name'].replace(/-ZStack/g, '');
			if(field === 'createDate') return formatDatetime(new Date(item[field]));
			if(field === 'ecsVpcUuid') return item['vpcName'].replace(/-ZStack/g, '');
		}
	}
}
</script>

<style lang="less" scoped>

</style>
