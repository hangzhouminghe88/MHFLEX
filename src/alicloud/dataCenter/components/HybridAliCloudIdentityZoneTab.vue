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
        <span @click="refresh()" class="btn-refresh">
            <i class="el-icon-refresh icon"></i>
          </span>
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
  import HybridIdentityZoneList from 'src/alicloud/identityZone/List';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import { formatDatetime } from "../../../utils/utils";
  import PageBase from 'src/windows/PageBase';
  import WindowBase from 'src/windows/Window';

  export default {

    mixins: [HybridIdentityZoneList, WindowBase, MultiSelectList, PageBase],

    name: "HybridAliCloudIdentityZoneTab",

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
                self.$router.push({name: 'detailHybridAliCloudIdentityZone', params: {uuid: item.uuid}});
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
              getContent: item => self.getField('dataCenterUuid', item),
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
        methods: {
          query: self.queryList
        }
      }).then( () => {
        self.queryList();
      })
    },

    methods: {
      //查询条件
      getCondition () {
        let conditionList = []
        let conditions = this.param && this.param.conditions ? this.param.conditions : []
        conditionList = conditionList.concat(conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      //填充表格数据
      getField(field, item) {
        let self = this, normalFields = ['zoneName', 'zoneId', 'description'];
        if (normalFields.includes(field)) return item[field];
        if (field === 'createDate') return formatDatetime(new Date(item[field]));
        if(field === 'dataCenterUuid') return self.getDataCenterName(item.dataCenterUuid);
      },
      //回到添加列表
      goToCreate() {
        let self = this;
        self.$router.push({name: 'createHybridAliCloudIdentityZone', params: {dataCenterUuid: self.windowData.dataUuid}})
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
</style>
