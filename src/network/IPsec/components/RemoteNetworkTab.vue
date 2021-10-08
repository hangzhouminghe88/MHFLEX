<template>
  <div style="width: 100%;">
    <div class="detail-page-toolbar">
      <div class="detail-page-toolbar-left" style="position: relative;">
        <span class="detail-page-toolbar-title" style="margin-right: 30px;">{{$t('common.peerCidr') + $t('common.colon')}}</span>
        <help-trigger name="peerCidrSetting" style="position: absolute;top: 5px;right: 5px;left: 100px;"/>
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a id="common-add" :class="{'disabled-text': !isVpcNetwork}" style="padding-top: 12px;" @click="isVpcNetwork && pageCreate()">{{$t("common.add")}}</a>
              <a id="common-destroy" @click="isSelected && isVpcNetwork && pageDestroy()" :class="{'disabled-text': !isSelected || !isVpcNetwork}">{{$t("common.destroy")}}</a>
            </div>
          </span>
        </drop-down>
      </div>
      <div class="detail-page-toolbar-right"></div>
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

  export default {
    name: "RemoteNetworkTab",

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
          query: self.init
        }
      }).then( () => {
        self.init();
      })
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
              getContent: item => self.getField('cidr', item),
              getHeaderContent: self.$t('common.name'),
              field: 'cidr',
              tooltip: true
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate',
              tooltip: true
            }
          ]
        },
        isVpcNetwork: false,
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
        let self = this, normalFields = ['cidr'];
        if(_.includes(normalFields, field)) return item[field];
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },
      //初始化远端网络
      init () {
        let peerCidrs = this.dbData.ipsec[this.windowData.dataUuid].peerCidrs
        let uuidList = peerCidrs.map((item) => item.uuid)
        this.updateWindow({ peerCidrs, uuidList })
          .then(() => this.itemList = this.windowData.peerCidrs)
      },
      //添加远端网络
      pageCreate() {
        let self = this;
        self.openDialog('AddRemoteNetWorkDlg',  {
          ok: (peerCidrs) => {
            this.addRemoteCidrToIPsec(peerCidrs, this.windowData.dataUuid).then(() => this.param.refresh().then(() => this.init()))
          }
        })
      },
      //删除远端网络
      pageDestroy() {
        const self = this
        let selectedUuidList = self.selectedList
        let peerCidrs = this.dbData.ipsec[self.windowData.dataUuid].peerCidrs
        let selectedPeerCidrs = peerCidrs.filter(item => selectedUuidList.some(uuid => uuid === item.uuid)).map(item => item.cidr);
        let cidrObj = {};
         peerCidrs.forEach((item) => {
          cidrObj = {
            [item.uuid]: item
          }
        })
        self.openDialog('ConfirmDlg', {
          uuidList: selectedUuidList,
          title: 'ipsec.deleteRemoteCidrFromIPsec',
          description: 'ipsec.deleteRemoteCidrFromIPsecConfirm',
          icon: 'ipsec_popupico',
          ok: () => {
            self.deleteRemoteCidrFromIPsec(selectedPeerCidrs, self.windowData.dataUuid).then(() => this.param.refresh().then(() => this.init()))
          },
          getName: (uuid) => {
            return cidrObj[uuid].cidr;
          }
        })

      }
    }
  }
</script>

<style scoped>

</style>
