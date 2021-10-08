<template>
  <div class="container">
    <div slot="page-toolbar" class="page-toolbar-container" style="display: flex;">
      <div class="page-toolbar-left">
        <span class="title">{{$t('hybridvirtualrouterentry.virtualrouterentry') + $t('common.colon')}}</span>
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">
              {{$t('common.actions')}}
            </span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="padding-top: 12px;" @click="goToCreate()">
                {{$t('common.add')}}
              </a>
              <a style="padding-bottom: 12px;" :class="{'disabled-text': !isSelected }"
                 @click="isSelected && pageDelete('router')">
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
  import HybridTencentVirtualRouterEntryList from 'src/tencent/virtualEntry/List';
  import  MultiSelectList from 'src/windows/Base/MultiSelectList';
  import { formatDatetime } from 'src/utils/utils';
  import PageBase from 'src/windows/PageBase';
  import WindowBase from 'src/windows/Window';

  export default {
    name: "HybridTencentVirtualEntryTab",

    mixins: [MultiSelectList, PageBase, WindowBase, HybridTencentVirtualRouterEntryList],

    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },

    inject: ['detailTencentVpc'],

    data() {
      let self = this;
      return {
        selectVal: 'destinationCidrBlock',
        searchStr: '',
        itemList: [],
        conditionNameList: [
          {
            name: 'hybridvirtualrouterentry.destinationCidrBlock',
            value: 'destinationCidrBlock'
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
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('destinationCidrBlock', item),
              getHeaderContent: self.$t('hybridvirtualrouterentry.destinationCidrBlock'),
              field: 'destinationCidrBlock',
              sortable: true,
              tooltip: true
            },
            {
              getContent: item => self.getField('nextHopType', item),
              getHeaderContent: self.$t('hybridvirtualrouterentry.nextHopType'),
              field: 'nextHopType',
              tooltip: true
            },
            {
              getContent: item => self.getField('nextHop', item),
              getHeaderContent: self.$t('hybridvirtualrouterentry.nextHop'),
              field: 'nextHop',
              tooltip: true
            },
            {
              getContent: item => self.getField('type', item),
              getHeaderContent: self.$t('hybridvirtualrouterentry.type'),
              field: 'type',
              tooltip: true
            },
            {
              getContent: item => self.getField('status', item),
              getHeaderContent: self.$t('common.status'),
              field: 'status',
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
      let self = this, dataUuid = '';
      dataUuid = self.param.uuid ? self.param.uuid : '';
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList:[],
        loading: false,
        dataUuid,
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
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
        }
        return conditionList
      },

      getField(field, item) {
        let normalProps = ['destinationCidrBlock', 'nextHopType', 'nextHopId', 'status'];
        if(!item[field]) return '';
        if(_.includes(normalProps, field)) return item[field];
        if(field === 'type') return this.$t(`hybridvirtualrouterentry.${item[field].toLocaleLowerCase()}`) + this.$t('common.route');
        if(field ===  'createDate') return formatDatetime(new Date(item[field]));
      },

      goToCreate() {
        let self = this;
        self.detailTencentVpc.createVurtualRouterEntryParam = {
          vRouterType: 'vrouter',
          ok: (param) => {
            let obj = {
              params: {
                vRouterUuid: self.windowData.dataUuid,
                vRouterType: 'vrouter',
                ...param
              }
            }
            self.create(obj).then(() => self.queryList())
          }
        }

        self.detailTencentVpc.showCreateVrEntry = true;
      }
    }
  }
</script>

<style scoped>

</style>
