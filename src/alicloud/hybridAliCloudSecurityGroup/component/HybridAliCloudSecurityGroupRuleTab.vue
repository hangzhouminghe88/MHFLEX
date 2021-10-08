<template>
  <div class="container">
    <div class="page-toolbar-container">
      <div class="toolbar-left">
        <div class="title">{{$t('common.rule') + $t('common.colon')}}</div>
        <div class="tab-container">
          <div class="tab-item" :class="{'is-active': currSelectTab === 'ingress'}" @click="changeCurrTab('ingress')">入方向</div>
          <div class="tab-item" :class="{'is-active': currSelectTab === 'egress'}" @click="changeCurrTab('egress')">出方向</div>
        </div>
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
                 @click="!isSelected && pageCreate()">
                {{$t('hybridSecurityGroupRule.action.addRule')}}
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
  import HybridAliCloudSGRList from  'src/alicloud/hybridAliCloudSecurityGroupRule/List';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import { formatDatetime } from "../../../utils/utils";
  import PageBase from 'src/windows/PageBase';
  import WindowBase from 'src/windows/Window';

  export default {

    name: "HybridAliCloudSecurityGroupRuleTab",

    mixins: [HybridAliCloudSGRList, WindowBase, MultiSelectList, PageBase],

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
        selectVal: 'portRange',
        searchStr: '',
        currSelectTab: 'ingress',
        itemList: [],
        conditionNameList: [
          {
            name: 'hybridSecurityGroupRule.portRange',
            value: 'portRange'
          },
          {
            name: 'CIDR',
            value: 'cidrIp'
          }
        ],
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('policy', item),
              getHeaderContent: self.$t('hybridSecurityGroupRule.policy'),
              field: 'policy',
              tooltip: true,
              sortable: true
            },
            {
              getContent: item => self.getField('protocol', item),
              getHeaderContent: self.$t('hybridSecurityGroupRule.protocol'),
              field: 'protocol'
            },
            {
              getContent: item => self.getField('portRange', item),
              getHeaderContent: self.$t('hybridSecurityGroupRule.portRange'),
              field: 'portRange'
            },
            {
              getContent: item => self.getField('cidrIp', item),
              getHeaderContent: self.$t('hybridSecurityGroupRule.cidrIp'),
              field: 'cidrIp'
            },
            {
              getContent: item => self.getField('priority', item),
              getHeaderContent: self.$t('hybridSecurityGroupRule.priority'),
              field: 'priority'
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate',
              tooltip: true,
              sortable: true
            }
          ]
        }
      }
    },

    created() {
      let self =  this, dataUuid = '';
      dataUuid = self.param.uuid ? self.param.uuid : '';
      self.updateWindow({
        dataUuid,
        loading: false,
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
      getCondition() {
        let conditionList = [], self = this;
        conditionList.push(`ecsSecurityGroupUuid=${self.windowData.dataUuid}`)
        if (self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}=%25${self.searchStr}%25`)
        }
        return conditionList
      },
      changeCurrTab(tabName) {
        let self = this;
        if(tabName && tabName === self.currSelectTab) return;
        self.currSelectTab = tabName;
        self.updateWindow({
          pageIndex: 1,
          pageSize: 10,
          sortBy: 'createDate',
          sortDirection: '-',
          selectedUuidList: []
        }).then(() => {
          self.queryList();
        })
      },
      getField(field, item) {
        if(!item[field]) return;
        let self = this, normalFields = ['protocol', 'portRange', 'cidrIp', 'priority'];
        if(normalFields.includes(field)) return item[field];
        if(field === 'policy') return self.$t(`hybridSecurityGroupRule.${item[field].toLocaleLowerCase()}`);
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },

      pageCreate() {
        let self = this;
        self.param.pageCreateRule({
          ok: (msg) => {
            return self.create(msg, self.queryList);
          }
        });
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
   .tab-item{
    display: inline-block;
    padding: 10px 20px;
    font-size: 12px;
  }
  .tab-container{
    display: inline-block;
    border-radius: 3px;
    cursor: pointer;
    transition: all ease-out 0.5s;
    margin-right: 20px;
    background-color: #e9edfa;
  }
  .is-active{
     background-color: #5e7ce0;
    transition: background-color cubic-bezier(0.5, 0.8, 0.5, 1) 0.5s,
      background-color ease-in 0.5s;
    color: #fff;
  }
</style>
