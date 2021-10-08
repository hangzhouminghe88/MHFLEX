<template>
  <div class="container">
    <div class="detail-page-toolbar">
      <div class="detail-page-toolbar-left">
        <span class="detail-page-toolbar-title" style="margin-right: 30px;">{{$t('common.eip') + $t('common.colon')}}</span>
        <help-trigger name="eip" style="position: absolute;top: 5px;right: 5px;left: 55px;"/>
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a @click="pageCreate()">{{$t("common.create")}}</a>
              <a @click="isSelected &&  detailPageDelete()" :class="{'disabled-text': !isSelected}">{{$t("common.destroy")}}</a>
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
  import { formatDatetime, checkBounce} from 'src/utils/utils';
  import EipList from 'src/network/eip/List';
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import rpc from 'src/utils/rpc';

  export default {
    name: "VpcVrouterEipTab",

    mixins: [EipList, PageBase, WindowBase, MultiSelectList],
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
               self.$router({name: 'detaileip', params: {uuid: item.uuid}})
              },
              sortable: true,
              tooltip: true
            },
            {
              getContent: item => self.getField('vipIp', item),
              getHeaderContent: self.$t('common.publicNetwork'),
              field: 'vipIp',
            },
            {
              getContent: item => self.getField('guestIp', item),
              getHeaderContent: self.$t('common.privateNetwork'),
              field: 'guestIp',
              tooltip: true
            },
            {
              getContent: item => self.getField('vm', item),
              getHeaderContent: self.$t('common.vm'),
              field: 'vm',
              tooltip: true
            },
            {
              getContent: item => self.getField('state', item),
              getHeaderContent: self.$t('common.state'),
              field: 'state',
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
        let conditionList = []
        let conditions = this.param && this.param.conditions ? this.param.conditions : []
        conditionList = conditionList.concat(conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      getField(field, item) {
        let self = this, normalFields = ['name', 'state', 'vipIp', 'guestIp'];
        if(_.includes(normalFields, field)) return item[field];
        if(field === 'vm' && item.vmNicUuid) return self.getVmInstanceName(item.uuid);
        if(field === 'owner') return self.getAccountName(item.uuid);
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },

      //删除网络
      detailPageDelete() {

      },
      //创建Eip
      pageCreate() {
        let self = this;
        let vpcVRouterUuid = self.windowData.dataUuid
        let create = async (param) => {
          let uuid = await self.create(param)
          return uuid
        }
        self.param.createEip({
          vpcVRouterUuid: vpcVRouterUuid,
          refresh: self.param.init,
          ok: create
        })
      },
      //获得账户名
      getAccountName(uuid){
        let value = '', self = this;
        try {
          value = self.dbData.account[self.dbData.eip[uuid].accountUuid].name
        } catch (e) {
          if (checkBounce(`getAccountName-${uuid}`)) return ''
          value = ''
          rpc.query('accounts/resources/refs', {
            q: `resourceUuid?=${uuid}`
          }).then((accountRefResp) => {
            if (accountRefResp.inventories.length <= 0) return
            self.dbData.vm[uuid].accountUuid = accountRefResp.inventories[0].accountUuid
            rpc.queryResourceNames(self, 'account', accountRefResp.inventories[0].accountUuid)
              .then(() => this.$nextTick(this.$forceUpdate))
          })

        }
        return value
      },
      //获得云主机名称
      getVmInstanceName (uuid) {
        let value = ''
        try {
          let vmNicUuid = this.dbData.eip[uuid].vmNicUuid
          let vmInstanceUuid = this.dbData.vmNicVmInstanceRef[vmNicUuid].uuid
          value = this.dbData.vm[vmInstanceUuid].name
        } catch (e) {
          if (this.checkBounce(`getVmInstanceName-${uuid}`)) return ''
          value = ''
          let vmNicUuid = this.dbData.eip[uuid].vmNicUuid
          rpc.query('vm-instances', {
            q: `vmNics.uuid?=${vmNicUuid}`
          }).then((result) => {
            if (result.inventories.length <= 0) return
            let uuid = result.inventories[0].uuid
            this.updateDbRow({
              tableName: 'vmNicVmInstanceRef',
              id: vmNicUuid,
              data: {
                uuid: result.inventories[0].uuid
              }
            })
            this.updateDbRow({
              tableName: 'vm',
              id: uuid,
              data: result.inventories[0]
            })
          }).then(() => this.$nextTick(this.$forceUpdate))
        }
        return value
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
