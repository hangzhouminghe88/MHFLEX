<template>
  <div style="width: 100%;">
    <div class="detail-page-toolbar">
      <div class="detail-page-toolbar-left">
        <span class="detail-page-toolbar-title" style="margin-right: 30px;">{{$t('common.localCidr') + $t('common.colon')}}</span>
        <help-trigger name="localCidrSetting" style="position: absolute;top: 5px;right: 5px;left: 73px;"/>
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
             <a id="common-attach" :class="{'disabled-text': !isVpcNetwork}" style="padding-top: 12px;" @click="isVpcNetwork && pageAttach()">{{$t("common.attach")}}</a>
             <a id="common-detach" @click="isSelected && isVpcNetwork && pageDetach()" :class="{'disabled-text': !isSelected || !isVpcNetwork}">{{$t("common.detach")}}</a>
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
    </div>
  </div>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import IPsecList from 'src/network/IPsec/List';
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import rpc from 'src/utils/rpc';

  export default {
    name: "LocalNetworkTab",

    mixins: [IPsecList, PageBase, WindowBase, MultiSelectList],

    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },

    created() {
      let self = this, dataUuid = '';
      dataUuid = self.param.uuid ? self.param.uuid : '';
      self.isVpcNetwork = self.param.isVpcNetwork();
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

    data() {
      let self = this;
      return {
        isVpcNetwork: false,
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
                 self.goToDetail(item.uuid);
              },
              sortable: true,
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

    methods: {
      formatDatetime,

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
      //得到表格数据
      getField(field, item) {
        let self = this, normalFields = ['name'];
        if(_.includes(normalFields, field)) return item[field];
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },


      queryList: async function () {
        let l3NetworkUuidList = this.dbData.ipsec[this.windowData.dataUuid].l3NetworkRefs.map(item => item.l3NetworkUuid)
        let conditionList = this.getCondition()
        conditionList.push(`uuid?=${l3NetworkUuidList}`)
        let resp = await rpc.query('l3-networks', {
          count: false,
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          q: conditionList,
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
        })
        let uuidList = resp.inventories.map((item) => item.uuid)
        let table = {}
        uuidList.map((uuid) => {
          table[uuid] = {
            selected: false
          }
        })
        this.updateWindow({ uuidList, table })
        this.updateDbTable({
          tableName: 'l3network',
          list: resp.inventories
        }).then( () => this.itemList = this.getData())
      },

      getData() {
        return this.windowData.uuidList.map((uuid) => {
          return this.dbData.l3network[uuid];
        })
      },
      //加载本地网络
      pageAttach: async function () {
        const self = this
        let conditions = ['type=L3VPCNetwork', 'category=Private']
        let hasAttachedL3NetworkUuidList = this.dbData.ipsec[self.windowData.dataUuid].l3NetworkRefs.map(item => item.l3NetworkUuid)
        let vRouterL3NetworkList = []
        if (hasAttachedL3NetworkUuidList.length === 0) {
          let vipResp = await this.queryVip([`uuid=${this.dbData.ipsec[self.windowData.dataUuid].vipUuid}`])
          let publicL3NetworkUuid = vipResp.inventories[0].l3NetworkUuid
          vRouterL3NetworkList.push(publicL3NetworkUuid)
        } else {
          vRouterL3NetworkList = hasAttachedL3NetworkUuidList
        }
        let vRouterResp = await this.queryVRouter([`vmNics.l3NetworkUuid?=${vRouterL3NetworkList}`])
        let vRouterUuidList = vRouterResp.inventories.map(item => item.uuid)
        let l3networkResp = await this.queryPrivateL3network(vRouterUuidList)
        let l3NetworkUuidList = l3networkResp.inventories.map(l3 => l3.uuid)
        _.remove(l3NetworkUuidList, (uuid) => hasAttachedL3NetworkUuidList.some(item => item === uuid))
        conditions.push(`uuid?=${l3NetworkUuidList}`)

        self.openDialog('SubNetworkMultiSelectListDlg', {
          conditions: conditions,
          select: (l3NetworkUuidList) => self.attachLocalCidrToIPsec(l3NetworkUuidList, self.windowData.dataUuid).then(() => this.param.refresh().then(() => this.queryList()))
        })
      },
      //卸载本地网络
      pageDetach: function () {
        const self = this
        let selectedUuidList = self.selectedList
        this.openDialog('ConfirmDlg',{
          title: 'ipsec.detachLocalCidrFromIPsec',
          description: 'ipsec.detachLocalCidrFromIPsecConfirm',
          icon: 'vpc_network_popupico',
          uuidList: selectedUuidList,
          ok: () => {
            self.detachLocalCidrFromIPsec(selectedUuidList, self.windowData.dataUuid).then(() => this.param.refresh().then(() => this.queryList()))
          },
          getName: (uuid) => {
            return self.dbData['l3network'][uuid].name;
          }
        })
      },

      queryVRouter: async function (c = []) {
        let conditions = [`zoneUuid=${this.windowData.zoneUuid}`]
        let resp = await rpc.query('vm-instances/appliances/virtual-routers', {
          q: conditions.concat(c)
        })
        return resp
      },

      queryPrivateL3network: async function (vRouterUuidList) {
        let l3networkResp = await rpc.query(`l3-networks`, {
          q: [`vmNic.vmInstanceUuid?=${vRouterUuidList}`, 'category=Private']
        })
        return l3networkResp
      },

      queryVip: async function (c = []) {
        let conditions = ['l3Network.l2Network.cluster.type!=vmware']
        let vipResp = await rpc.query('vips', {
          q: conditions.concat(c)
        })
        return vipResp
      },

      //回到详情页
      //跳转到详情页
      goToDetail(uuid) {
        let self = this, router = 'detailPublicNetwork';
        switch(self.dbData.l3network[uuid].category) {
          case 'Public':
            router = 'detailPublicNetwork';
            break;
          case 'System':
            router = 'detailSystemNetwork';
            break;
          case 'Private':
            router = 'detailPrivateNetwork';
            break;
          default:
            router = 'detailPublicNetwork';
        }
        self.$router.push({name:router, params: {uuid}})
      },

    }
  }
</script>

<style scoped>

</style>
