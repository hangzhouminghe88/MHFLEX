<template>
  <div class="container">
	   <div slot="page-toolbar" class="page-toolbar-container" style="display: flex;">
      <div class="page-toolbar-left">
        <span class="title">{{$t('common.volume') + $t('common.colon')}}</span>
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.actions')}}</span>
          </span>
          <span slot="content">
           <div class="dropdown-content">
              <a style="padding-top: 12px;" @click="$router.push({name: 'createHybridTencentDisk'})">{{$t('common.create')}}</a>
              <a  :class="{'disabled-text': isSingleSelected}" @click="!isSingleSelected && pageTencentAttach(windowData.dataUuid)">{{$t('common.attach')}}</a>
              <a style="padding-bottom: 12px;" @click="isSelected && !canDetachEcsInstance() && pageTencentDetach()" :class="{'disabled-text': !(isSelected && !canDetachEcsInstance())}">{{$t('common.detach')}}</a>
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
import TencentDiskList from 'src/tencent/disk/List';
import { formatDatetime } from 'src/utils/utils';
import WindowBase from 'src/windows/Window';
import PageBase from 'src/windows/PageBase';

export default {
	name: 'HybridTencentDiskTab',

	mixins: [WindowBase, PageBase, TencentDiskList, MultiSelectList],

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
			  itemList: [],
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              className: 'link',
              onClick: (item) => {
                self.$router.push({name: 'detailHybridTencentDisk', params: {uuid: item.uuid}})
              },
              field: 'name',
              sortable: true,
              tooltip: true
            },
            {
              getContent: item => self.getField('diskId', item),
              getHeaderContent: self.$t('hybridAliyunDisk.diskId'),
              field: 'diskId',
              sortable: true,
              tooltip: true
            },
            {
              getContent: item => self.getField('diskCategory', item),
              getHeaderContent: self.$t('hybridAliyunDisk.diskCategory'),
              field: 'diskCategory',
              sortable: true
            },
            {
              getContent: item => self.getField('ecsName', item),
              getHeaderContent: self.$t('hybridecsinstance.instance'),
              field: 'ecsInstanceUuid',
              sortable: true
            },
            {
              getContent: item => self.getField('sizeWithGB', item),
              getHeaderContent: self.$t('common.size'),
              field: 'sizeWithGB',
              sortable: true
            },
            {
              getContent: item => self.getField('diskChargeType', item),
              getHeaderContent: self.$t('hybridAliyunDisk.billingMethod'),
              field: 'diskChargeType',
              sortable: true,
              tooltip: true
            },
            {
              getContent: item => self.getField('diskType', item),
              getHeaderContent: self.$t('hybridAliyunDisk.diskType'),
              field: 'diskType',
              sortable: true
            },
            {
              getContent: item => self.getField('identityZoneName', item),
              getHeaderContent: self.$t('common.hybrididentityzone'),
              field: 'identityZoneName',
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

	created() {
		let self = this, dataUuid = '';
		dataUuid = self.param.uuid ? self.param.uuid : '';
		self.updateWindow({
			dataUuid,
			pageIndex: 1,
			pageSize: 10,
			sortBy: 'createDate',
			sortDirection: '-',
			loading: true,
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
			self.param.conditions ? conditionList = conditionList.concat(self.param.conditions) : conditionList = condtionList;
			if(self.selectVal !== '' && self.searchStr !== '') {
				conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
			}
			return conditionList;
		},

		 getField(field, item){
        let self = this, normalFields = ['diskId','name', 'identityZoneName'];
        if(_.includes(normalFields, field)) return item[field];
        if(field === 'diskCategory') return self.$t(`hybridTencentDisk.${(item.diskCategory)}`);
        if(field === 'sizeWithGB') return `${item[field]}G`;
        if(field === 'diskChargeType') return item[field] ? self.$t(`hybridTencentDisk.${item[field]}`) : self.$t('hybridTencentDisk.afterPayment');
        if(field === 'diskType') return self.$t(`hybridTencentDisk.${item[field]}`);
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
        if(field === 'ecsName') return item.ecsName ? item[field] : self.$t('common.noAttach');
      },
	}
}
</script>

<style scoped>

</style>
