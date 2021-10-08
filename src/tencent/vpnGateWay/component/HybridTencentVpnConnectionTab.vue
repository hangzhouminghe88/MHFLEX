<template>
  <div class="container">
    <div class="detail-page-toolbar">
      <div class="detail-page-toolbar-left">
        <span class="detail-page-toolbar-title" style="margin-right: 30px;">{{$t('common.hybridvpcvpnconnection') + $t('common.colon')}}</span>
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="padding: 12px;" v-permission="'PF.DELETE'" @click="isSelected && pageDelete()" :class="{ 'disabled-text': !isSelected}">{{$t("common.destroy")}}</a>
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
        <el-pagination v-if="windowData.total > 0"
                       :current-page="windowData.pageIndex"
                       :page-size="windowData.pageSize"
                       :page-sizes="[10, 20, 50, 100]"
                       :total="windowData.total"
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
  import TencentVpnConnectionList from 'src/tencent/vpnConnection/List';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';

  export default {
    name: "HybridAliCloudVpcConnectionTab",

    mixins: [TencentVpnConnectionList, PageBase, WindowBase, MultiSelectList],
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
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              sortable: true,
              tooltip: true,
              onClick: (item) => {
                self.$router.push({name: 'detailHybridTencentVpnConnection', params: {uuid: item.uuid}})
              },
              className: 'link',
              field: 'name'
            },
            {
              getContent: item => self.getField('localSubnet', item),
              getHeaderContent: 'Mhflex网段',
              sortable: true,
              tooltip: true,
              field: 'localSubnet'
            },
            {
              getContent: item => self.getField('remoteSubnet',  item),
              getHeaderContent: '腾讯云网段',
              sortable: true,
              tooltip: true,
              field: 'remoteSubnet'
            },
            {
              getContent: item => self.getField('type',  item),
              getHeaderContent: self.$t('common.type'),
              sortable: true,
              tooltip: true,
              field: 'type'
            },
            {
              getContent: item => self.getField('createDate',  item),
              getHeaderContent: self.$t('common.createDate'),
              sortable: true,
              tooltip: true,
              field: 'createDate'
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
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },

      //填充表格数据
      getField(field, item) {
        let self = this, normalFields = ['name', 'localSubnet', 'remoteSubnet', 'type'];
        if(!item[field]) return '';
        if(_.includes(normalFields, field)) return item[field];
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },
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
      line-height: 25px;
    }

    &-item{
      padding: 0px 20px;
      font-size: 12px;
      display: inline-block;
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
