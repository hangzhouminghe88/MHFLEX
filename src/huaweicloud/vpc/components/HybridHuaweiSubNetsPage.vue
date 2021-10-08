<template>
   <div class="container">
		 <div class="page-toolbar-container">
			  <el-row type="flex">
           <div class="page-toolbar-left">
          <span class="text">华为云子网:&nbsp&nbsp</span>
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a style="padding-top: 12px;" @click="goToCreate()">添加子网</a>
                <a style="padding-bottom: 12px;" :class="{'disabled-text': !isSelected}" @click="isSelected && pageDelete()">{{$t('common.destroy')}}</a>
              </div>
            </span>
          </drop-down>
			 </div>
			 <div class="page-toolbar-center"></div>
			 <div class="page-toolbar-right">
          <!--搜索组合框-->
            <span style="padding: 0 15px;display: inline-block;">
             <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
             </el-input>
           </span>
            <!--刷新按钮-->
            <span class="btn-refresh" @click="refresh()"><i class="el-icon-refresh icon"></i></span>
       </div>
        </el-row>
		 </div>
		 <div class="page-table">
			 <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
		 </div>
	 </div>
</template>

<script>
  import HybridHuaweiSubNetsList from 'src/huaweicloud/hybridSubNet/List';
	import MultiSelectList from 'src/windows/Base/MultiSelectList';
	import WindowBase from 'src/windows/Window';
  export default {
		name: 'HybridHuaweiSubNetsPage',
    mixins: [WindowBase, HybridHuaweiSubNetsList, MultiSelectList],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
		data() {
			let _this = this;
			return {
				 itemList: [],
				 selectVal: 'name',
				 searchStr: '',
				 conditionNameList: [
					 {
						 name: 'common.uuid',
						 value: 'uuid'
					 },
					 {
						 name: 'common.name',
						 value: 'name'
					 }
         ],
         dataSource: {
					 getItemList:() => _this.itemList,
					 handleSelection: _this.handleSelect,
           handleSort: _this.handleSort,
					 type: "selection",
					 fields: [
             {
               getHeaderContent: _this.$t('common.name'),
               getContent: item =>_this.getField('name', item),
               onClick: () => {

               },
               tooltip: true,
               sortable: true,
               className: 'link',
               field: 'name'
             },
             {
               getHeaderContent: _this.$t('common.hybrididentityzone'),
               getContent: item =>_this.getField('izoneName', item),
               tooltip: true,
             },
             {
               getHeaderContent: '子网ID',
               getContent: item =>_this.getField('subnetId', item),
               tooltip: true,
             },
             {
               getHeaderContent: _this.$t('common.state'),
               getContent: item =>_this.getField('state', item),
               tooltip: true,
             },
             {
               getHeaderContent: _this.$t('common.cidr'),
               getContent: item =>_this.getField('cidr', item),
               tooltip: true,
             },
             {
               getHeaderContent: '可用IP',
               getContent: item =>_this.getField('availableIpAddressCount', item),
               tooltip: true,
             },
             {
               getHeaderContent: _this.$t('common.createDate'),
               getContent: item =>_this.getField('createDate', item),
               tooltip: true,
               sortable: true,
               field: 'createDate'
             }
					 ]
				 }
			}
		},
		created() {
			let _this = this, dataUuid = _this.param.uuid ? _this.param.uuid : '';
			_this.updateWindow({
				pageIndex: 1,
        pageSize: 10,
        dataUuid,
				sortBy: 'createDate',
				sortDirection: '-',
				loading: false,
				selectedUuidList: [],
				methods: {
					query: _this.queryList
				}
			}).then(() => {
				_this.queryList();
			})
		},
		methods: {
      getCondition() {
        let _this = this, conditionList = [];
        if(_this.param.conditions) conditionList = conditionList.concat(_this.param.conditions);
        if(_this.selectVal !== '' && _this.searchStr !== '') {
          conditionList = conditionList.concat(`${_this.selectVal}%25${encodeURIComponent(_this.searchStr)}%25`);
        }
        return conditionList;
      },
      getField(field, item) {

      },
      goToCreate() {
        let _this = this;
        _this.param.setCreateSubNetParam({
          vpcUuid: _this.windowData.dataUuid,
          ok: (param) => {
             _this.create(param).then(()=> _this.queryList())
          }
        })
        _this.param.showCreateSubNet();
      }
		}
	}
</script>

<style lang="less" scoped>

</style>
