<template>
  <page-template>
	  <div slot="page-header">
			<el-row :gutter="10">
				<el-col :span="2.2" class="page-header-title">
					{{$t('common.eip')}}
				</el-col>
				<el-col :span="2.2">
					<el-tabs v-model="currTab">
						<el-tab-pane :label="$t('common.available') + `(${windowData.availableCount ? windowData.availableCount : '0'})`"  
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
         <span class="text">{{$t('hybrideip.create')}}</span>
       </span>
        <!--更多操作-->
        <drop-down class="dropdown more btn-primary" :class="{'disabled': !isSelected}" :enabled="isSelected">
         <span slot="title">
           <i class="el-icon-more icon"></i>
           <span class="text">{{$t('common.moreActions')}}</span>
         </span>
          <span slot="content">
           <div class="dropdown-content">
             <a :class="{'disabled-text':isAttachEip}"
                @click="!isAttachEip && pageAttach()"
                style="padding-top: 12px;">{{$t('common.attach')}}</a>
             <a @click="isAttachEip && pageDetach()"
                :class="{ 'disabled-text': !isAttachEip}"
             >{{$t('common.detach')}}</a>
             <a  @click="pageDelete()" style="padding-bottom: 12px;">
               {{$t('common.destroy')}}
             </a>
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
				<el-pagination :total="windowData.availableCount" 
                       v-if="windowData.availableCount > 0"
				               :page-size="windowData.pageSize" 
											 :page-sizes="[10, 20, 50, 100]" 
											 :current-page="windowData.pageIndex" 
											 @size-change="pageSizeChange" 
											 @current-change="pageCurrentChange" 
											 layout="total, sizes, jumper,prev, pager, next"></el-pagination>
			</div>
		</div>
	</page-template>	
</template>

<script>

import MultiSelectList from 'src/windows/Base/MultiSelectList';
import PageTemplate from 'src/component/PageTemplate';
import { formatDatetime } from 'src/utils/utils';
import PageBase from 'src/windows/PageBase';
import WindowBase from 'src/windows/Window';
import List from './List';

export default {
	 mixins: [PageBase, WindowBase, MultiSelectList, List],

	 components: {
		 PageTemplate
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
		 }).then(() => {
			 self.queryList();
		 })
	 },

	 data() {
		 let self = this;
		 return {
			 currTab: 'available',
			 selectVal: 'name',
			 searchStr: '',
			 conditionNameList: [
				 {name: 'common.uuid', value: 'uuid'},
				 {name: 'common.name', value: 'name'}
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
                self.$router.push({name: 'detailHybridTencentEip', params:{uuid: item.uuid} });
              },
              className: 'link',
              field: 'name',
              tooltip: true,
              sortable: true
            },
            {
              getContent: item => self.getField('eipAddress',  item),
              getHeaderContent: self.$t('common.ipAddress'),
              tooltip: true,
              field: 'eipAddress',
              sortable: true
            },
            {
              getContent: item => self.getField('bandWidth', item),
              getHeaderContent: self.$t('common.bandwidth'),
              tooltip: true,
              field: 'bandWidth',
              sortable: true
            },
            {
              getContent: item => self.getField('status', item),
              getHeaderContent: self.$t('common.status'),
              sortable: true,
              field: 'status'
            },
            {
              getContent: item => self.getField('ecsName', item),
              getHeaderContent: self.$t('common.vm'),
              sortable: true,
              tooltip: true,
              field: 'allocateResourceUuid'
            },
            {
              getContent: item => self.getField('dataCenterName', item),
              getHeaderContent: self.$t('common.hybridDatacenter'),
              sortable: true,
              tooltip: true,
              field: 'dataCenterUuid'
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              sortable: true,
              tooltip: true,
              field: 'createDate'
            }
				 ]
			 }
		 }
	 },

	 methods: {
		 getField(field, item) {
        let self = this, normalFields = ['eipAddress', 'dataCenterName'];
        if(normalFields.includes(field)) return item[field];
				if(field === 'name') return item[field].replace(/zstack/g, '');
				if(field === 'status') return item[field].charAt(0) + item[field].toLowerCase().slice(1);
        if(field === 'ecsName') {
          return item[field] === '' ? self.$t('ldapEntry.notAttachedLdap') : item[field];
        }
        if(field === 'bandWidth') return item[field] ? `${item[field]}M` : '1M';
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
			},
			
			goToCreate() {
				let self = this;
				self.$router.push({name: 'createHybridTencentEip'})
			}
	 }
}
</script>

<style scoped>

</style>
