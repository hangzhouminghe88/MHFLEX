<template>
  <div class="container">
    <div class="detail-page-toolbar">
      <div class="detail-page-toolbar-left">
        <span class="detail-page-toolbar-title" style="margin-right: 30px;">{{$t('common.vip') + $t('common.colon')}}</span>
        <help-trigger name="vip" style="position: absolute;top: 5px;right: 5px;left: 55px;"/>
        <drop-down class="detail-dropdown"
                   :enabled="currSelectTab !== 'system'"
                   :class="{'disabled': currSelectTab === 'system'}">
          <span slot="title">
            <span class="text">{{$t('common.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a @click="pageCreate()">{{$t("common.create")}}</a>
              <a @click="isSelected &&  pageDelete()" :class="{'disabled-text': !isSelected}">{{$t("common.destroy")}}</a>
            </div>
          </span>
        </drop-down>
        <div class="tab-container">
          <span class="tab-item" v-for="(item, index) in ['customized', 'system']"
                :key="index" :class="{'is-active': currSelectTab === item}"
                @click="changeCurrTab(item)">{{$t(`common.${item}`)}}</span>
        </div>
      </div>
      <div class="detail-page-toolbar-right">
        <span style="padding: 0 15px;display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        <span class="btn-refresh" @click="refresh()"><i class="el-icon-refresh icon"></i></span>
      </div>
    </div>

    <div class="page-table">
      <mh-table :data-source="dataSource" v-loading="windowData.loading"></mh-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData.availableCount > 0"
                       :current-page="windowData.pageIndex"
                       :page-size="windowData.pageSize"
                       :page-sizes="[10, 20, 50, 100]"
                       :total="windowData.availableCount"
                       @current-change="pageCurrentChange"
                       @size-change="pageSizeChange"
                       class="page-table-pagination"
                       layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import VipList from 'src/network/vip/List';
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';

  export default {
    name: "VipTabListPage",

    mixins: [VipList, PageBase, WindowBase, MultiSelectList],
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
        currSelectTab: 'customized',
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
              onClick: (item) => {
                self.$router.push({name: 'detailvip', params: {uuid: item.uuid}})
              },
              sortable: true,
              tooltip: true
            },
            {
              getContent: item => self.getField('ip', item),
              getHeaderContent: self.$t('common.ip'),
              field: 'ip',
            },
            {
              getContent: item => self.getField('gateway', item),
              getHeaderContent: self.$t('common.gateway'),
              field: 'gateway',
              tooltip: true
            },
            {
              getContent: item => self.getField('netmask', item),
              getHeaderContent: self.$t('common.netmask'),
              field: 'netmask',
              tooltip: true
            },
            {
              getContent: item => self.getField('state', item),
              getHeaderContent: self.$t('common.state'),
              field: 'state',
            },
            {
              getContent: item => self.getField('useFor', item),
              getHeaderContent: self.$t('common.useFor'),
              field: 'useFor',
            },
            {
              getContent: item => self.getField('owner', item),
              getHeaderContent: self.$t('common.owner'),
              field: 'owner',
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
      getCondition () {
        let conditionList = [];
        switch (this.currSelectTab) {
          case 'customized':
            conditionList = [`uuid?=${this.param.customizedVips}`]
            break
          case 'system':
            conditionList = [`uuid?=${this.param.systemVips}`]
            break
        }
        let conditions = this.param && this.param.conditions ? this.param.conditions : []
        conditionList = conditionList.concat(conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      //切换tab
      changeCurrTab(tabName) {
        let self = this;
        self.itemList = [];
        if(tabName === self.currSelectTab) return;
        self.currSelectTab = tabName;
        self.updateWindow({
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

      getField(field, item) {
        let self = this, normalFields = ['name', 'state', 'ip', 'netmask', 'gateway'];
        if(_.includes(normalFields, field)) return item[field];
        if(field === 'owner') return  self.getResourceOwner(item.uuid)
        if(field === 'userFor') return self.getVipUseFor(item.uuid);
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },

      //创建网络
      pageCreate() {
        let self = this;
        self.$router.push({name: 'createvip'})
      }
    }
  }
</script>

<style scoped lang="less">
  .tab{
    &-container{
      display: inline-block;
      border: 1px solid #409EFF;
      border-radius: 2px;
      cursor: pointer;
      height: 25px;
    }

    &-item{
      padding: 5px 20px;
      font-size: 12px;
      display: inline-block;
    }
  }

  @-moz-document url-prefix() {
    .tab-item{
      padding: 4px 20px!important;
    }
  }

  .is-active{
    background: #409EFF;
    color: #fff;
  }
  .disabled {
    background: #f1f4f7!important;
    border: 1px solid #dae0e6!important;
    color: #97a4b6;
    cursor: not-allowed !important;
  }
</style>
