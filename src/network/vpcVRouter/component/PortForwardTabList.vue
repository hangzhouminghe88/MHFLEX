<template>
  <div class="container">
    <div class="detail-page-toolbar">
      <div class="detail-page-toolbar-left">
        <span class="detail-page-toolbar-title" style="margin-right: 30px;">{{$t('common.portforwarding') + $t('common.colon')}}</span>
        <help-trigger name="portForwarding" style="position: absolute;top: 5px;right: 5px;left: 70px;"/>
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="padding-top: 12px;" v-permission="['PF.CREATE', 'PF.ATTACH']" @click="pageCreate()">{{$t("common.create")}}</a>
              <a style="padding-bottom: 12px;" v-permission="'PF.DELETE'" @click="isSelected && pageDelete()" :class="{ 'disabled-text': !isSelected}">{{$t("common.destroy")}}</a>
            </div>
          </span>
        </drop-down>
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
  import PortforwardList from 'src/network/portforwarding/List';
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';

  export default {
    name: "VipTabListPage",

    mixins: [PortforwardList, PageBase, WindowBase, MultiSelectList],
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
                 self.$router.push({name: 'detailportforwarding', params: {uuid: item.uuid}})
              },
              sortable: true,
              tooltip: true
            },
            {
              getContent: item => self.getField('vipIp', item),
              getHeaderContent: self.$t('common.publicNetworkIP'),
              field: 'vipIp',
              tooltip: true
            },
            {
              getContent: item => self.getField('guestIp', item),
              getHeaderContent: self.$t('common.privateNetworkIP'),
              field: 'guestIp',
              tooltip: true
            },
            {
              getContent: item => self.getField('protocolType', item),
              getHeaderContent: self.$t('common.protocolType'),
              field: 'protocolType',
              tooltip: true
            },
            {
              getContent: item => self.getField('vipPortStart', item),
              getHeaderContent: self.$t('common.vipPortStart'),
              field: 'vipPortStart',
              tooltip: true
            },
            {
              getContent: item => self.getField('vm', item),
              getHeaderContent: self.$t('common.vm'),
              field: 'vm',
              tooltip: true
            },
            {
              getContent: item => self.getField('privatePortStart', item),
              getHeaderContent: self.$t('common.privatePortStart'),
              field: 'privatePortStart',
              tooltip: true
            },
            {
              getContent: item => self.getField('state', item),
              getHeaderContent: self.$t('common.state'),
              field: 'state',
              tooltip: true
            },
            {
              getContent: item => self.getField('owner', item),
              getHeaderContent: self.$t('common.owner'),
              field: 'owner',
              tooltip: true
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
        let conditions = this.param && this.param.conditions ? this.param.conditions : []
        conditionList = conditionList.concat(conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },

      getField(field, item) {
        let self = this, normalFields = ['name', 'state', 'vipIp', 'guestIp', 'netmask', 'gateway', 'protocolType'];
        if(_.includes(normalFields, field)) return item[field];
        if(field === 'vipPortStart') return (item.vipPortEnd - item.vipPortStart) == 0 ? item.vipPortStart: item.vipPortStart +'~'+ item.vipPortEnd;
        if(field === 'privatePortStart') return (item.privatePortEnd - item.privatePortStart) == 0 ? item.privatePortStart: item.privatePortStart +'~'+ item.privatePortEnd
        if(field === 'vm') return self.getVmUuid(item.uuid) && self.dbData.vm[self.getVmUuid(item.uuid)].name;
        if(field === 'owner') return  self.dbData.accountRef[item.uuid] && self.dbData.accountRef[item.uuid].owner.name;
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },

      //创建网络
      pageCreate() {
        let self = this;
        self.$router.push({name: 'createportforwarding'})
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
