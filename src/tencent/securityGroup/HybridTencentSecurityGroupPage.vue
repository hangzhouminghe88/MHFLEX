<template>
	 <page-template>
		 <div slot="page-header">
			 <el-row :gutter="10">
				 <el-col :span="2.2">
					 <span class="page-header-title">
						 {{$t('common.securitygroup')}}
					 </span>
				 </el-col>
				 <el-col :span="2.2">
					 <el-tabs v-model="currTab">
						 <el-tab-pane  :label="$t('common.available')+`(${windowData.availableCount ? windowData.availableCount : '0'})`"
						               name="available"></el-tab-pane>
					 </el-tabs>
				 </el-col>
			 </el-row>
		 </div>

		 <div slot="page-toolbar" class="page-toolbar-container">
			 <el-row type="flex">
				 <div class="page-toolbar-left">
				  <!--创建-->
          <span class="btn-success" @click="goToCreate()">
             <i class="el-icon-plus icon"></i>
             <span class="text">{{$t('hybridesecuritygroup.create')}}</span>
           </span>
          <!--删除-->
          <drop-down class="icon more btn-primary dropdown"
                     :enabled="isSelected"
                     :class="{'disabled': !isSelected}">
            <span slot="title">
              <span class="text">
                 <i class="el-icon-more"></i>
                {{$t('common.moreActions')}}
              </span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a style="padding: 8px 0px;"
                   @click="pageDelete()">{{$t('common.destroy')}}</a>
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
				 <el-pagination :page-sizes="[10,20,50,100]" 
				                v-if="windowData.availableCount > 0"
				                :page-size="windowData.pageSize" 
												:current-page="windowData.pageIndex" 
												@size-change="pageSizeChange" 
												@current-change="pageCurrentChange" 
												:total="windowData.availableCount"
												layout="total, sizes, prev,  pager, ->, next, jumper">
				</el-pagination>
			 </div>
		 </div>
	 </page-template>
</template>

<script>

import MultiSelectList from 'src/windows/Base/MultiSelectList';
import PageTemplate from 'src/component/PageTemplate';
import { formatDatetime } from 'src/utils/utils';
import WindowBase from 'src/windows/Window';
import PageBase from 'src/windows/PageBase';
import List from './List';

export default {
	name: 'HybridTencentSecurityGroupPage',
	
	mixins: [WindowBase, MultiSelectList, List],

	components: {
		PageTemplate
	},
	 
	data()  {
		let self = this;
		return {
			currTab: 'available',
			itemList: [],
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
              field: 'name',
              className: 'link',
              sortable: true,
              tooltip: true,
              onClick: (item) => {
                self.$router.push({name: 'detailHybridTencentSecurityGroup', params: {uuid: item.uuid}});
              }
            },
            {
              getContent: item => self.getField('dataCenterName', item),
              getHeaderContent: self.$t('common.datacenter'),
              field: 'dataCenterName',
              sortable: true
            },
            {
              getContent: item => self.getField('securityGroupId', item),
              getHeaderContent: self.$t('hybridesecuritygroup.securityGroupId'),
              field: 'securityGroupId',
              sortable: true
            },
            {
              getContent: item => self.getField('ecsInstanceNum', item),
              getHeaderContent: self.$t('hybridvirtualprivatecloud.ecsInstanceNum'),
              field: 'ecsInstanceNum'
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate',
              sortable: true
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
			selectedUuidList: [],
	    loading: false,
			methods: {
				queryList: self.queryList
			}
		}).then( () => {
			self.queryList()
		})
	},

	methods: {
		//填充安全组列表
     getField(field, item) {
        let normalFields = ['name', 'securityGroupId', 'ecsInstanceNum', 'dataCenterName'];
        if(normalFields.includes(field)) return item[field];
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
		},
		//回到创建安全组页
		goToCreate() {
			let self = this;
			self.$router.push({name: 'createHybridTencentSecurityGroup'})
		}
	}
}
</script>
