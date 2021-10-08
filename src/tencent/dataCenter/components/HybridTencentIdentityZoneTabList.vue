<template>
  <div class="container">
    <div class="page-toolbar-container">
      <div class="toolbar-left">
        <div class="title">{{$t('common.hybrididentityzone') + $t('common.colon')}}</div>
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">
              {{$t('common.actions')}}
            </span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="padding-top: 12px;"
                 :class="{'disabled-text': isSelected}"
                 @click="!isSelected && goToCreate()">
                {{$t('common.create')}}
              </a>
              <a :class="{'disabled-text': !isSelected}"
                 @click="isSelected && pageDelete()"
                 style="padding-bottom: 12px;">
                {{$t('common.destroy')}}
              </a>
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
  import iZoneList from 'src/tencent/identityZone/List';
  import { formatDatetime } from "src/utils/utils";
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';

  export default {
    name: "HybridTencentIdentityZoneTabList",

    mixins: [MultiSelectList, iZoneList, WindowBase, PageBase],

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
        selectVal: 'zoneName',
        searchStr: '',
        conditionNameList: [
          {name: 'hybrididentityzone.identityzone', value: 'zoneName'},
          {name: 'UUID', value: 'uuid'}
        ],
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSelect,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('zoneName', item),
              getHeaderContent: self.$t('hybrididentityzone.identityzone'),
              className: 'link',
              onClick: (item) => {
                this.$router.push({name: 'detailHybridTencentIdentityZone', params: {uuid: item.uuid}})
              },
              field: 'zoneName',
              sortable: true
            },
            {
              getContent: item => self.getField('zoneId', item),
              getHeaderContent: self.$t('hybrididentityzone.zoneId'),
              field: ' zoneId'
            },
            {
              getContent: item => self.getField('dataCenterName', item),
              getHeaderContent: self.$t('hybriddatacenter.region'),
              field: 'dataCenterUuid',
              sortable: true
            },
            {
              getContent: item => self.getField('description', item),
              getHeaderContent: self.$t('common.description'),
              field: 'description',
              sortable: true
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
      let self = this, dataUuid = '';
      dataUuid = self.param.uuid ? self.param.uuid : '';
      self.updateWindow({
        dataUuid,
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        loading: false,
        methods: {
          query: self.queryList
        }
      }).then( () => {
        self.queryList();
      })
    },

    methods: {
      //构造查询条件
      getCondition() {
        let self = this, conditionList = [];
        conditionList = self.param.conditions ?  conditionList.concat(self.param.conditions) : conditionList;
        if(self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
        }
        return conditionList;
      },
      //获取查询数据
      getField(field, item) {
        let  normalFields = ['zoneName', 'zoneId', 'dataCenterName', 'description'];
        if(normalFields.includes(field)) return item[field];
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },
      //添加可用区
      goToCreate() {
        this.$router.push({name: 'createHybridTencentIdentityZone', params: {dataCenterUuid: this.windowData.dataUuid}});
      }
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
