<template>
  <div class="container">
    <div slot="page-toolbar" class="page-toolbar-container" style="display: flex;">
      <div class="page-toolbar-left">
        <span class="title">{{$t('hybridaliyunvirtualrouter.virtualrouter') + $t('common.colon')}}</span>
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
        <el-pagination v-if="windowData.total > 0"
                       :page-sizes="[10, 20, 50, 100]"
                       :page-size="windowData.pageSize"
                       :total="windowData.total"
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
  import HybridVirtualRouterList from 'src/alicloud/hybridVirtualRouter/List';
  import  MultiSelectList from 'src/windows/Base/MultiSelectList';
  import { formatDatetime } from 'src/utils/utils';
  import PageBase from 'src/windows/PageBase';
  import WindowBase from 'src/windows/Window';
  import _ from 'lodash'

  export default {
    name: "HybridAliCloudVirtualRouteTab",

    mixins: [MultiSelectList, PageBase, WindowBase, HybridVirtualRouterList],

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
        itemList: [],
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
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              field: 'name',
              sortable: true,
              onClick: (item) => {
                self.param.goToAliCloudVRouter({uuid: item.uuid});
              },
              className: 'link',
              tooltip: true
            },
            {
              getContent: item => self.getField('vrId', item),
              getHeaderContent: self.$t('hybridaliyunvirtualrouter.virtualrouterId'),
              field: 'vrId',
              tooltip: true
            },
            {
              getContent: item => self.getField('vpcName', item),
              getHeaderContent: self.$t('hybridvswitch.vpc'),
              field: 'vpcName',
              tooltip: true
            },
            {
              getContent: item => self.getField('createDate',  item),
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
        selectedUuidList:[],
        loading: false,
        methods: {
          queryList: self.queryList
        }
      }).then( () => {
        self.queryList();
      })
    },

    methods: {
      formatDatetime,

      getCondition: function () {
        let conditionList = [],self = this;
        let conditions = this.param && this.param.conditions ? this.param.conditions : []
        conditionList = conditionList.concat(conditions)
        if(self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${self.searchStr}%25`)
        }
        return conditionList
      },

      getField(field, item) {
        let normalProps = ['name', 'vrId'];
        if(!item[field]) return '';
        if(_.includes(normalProps, field)) return item[field];
        if(field === 'vpcName') return item[field].replace(/ZStack-/ig,  '');
        if(field ===  'createDate') return formatDatetime(new Date(item[field]));
      }
    }
  }
</script>

<style scoped>

</style>
