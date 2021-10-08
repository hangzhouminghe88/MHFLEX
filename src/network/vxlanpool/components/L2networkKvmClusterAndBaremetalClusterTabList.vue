<template>
  <div class="container">
    <div slot="page-toolbar" class="page-toolbar-container" style="display: flex;">
      <div class="page-toolbar-left">
        <span class="title">
          <span class="tab-container">
            <span class="tab-item" @click="changeCurrTab('KVM')" :class="{'is-active': currSelectTab === 'KVM'}">{{ $t('common.cluster') }}</span>
            <span class="tab-item" @click="changeCurrTab('baremetal')" :class="{'is-active': currSelectTab === 'baremetal'}">{{ $t('common.baremetalCluster') }}</span>
          </span>
          <span class="title">{{$t('common.cluster') + $t('common.colon')}}</span>
        </span>
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.actions')}}</span>
          </span>
          <span slot="content">
           <div class="dropdown-content">
              <a v-if="dbData.l2network[windowData.dataUuid].type !== 'VxlanNetworkPool'" style="padding-top: 12px;" @click="(dbData.l2network[windowData.dataUuid].type !== 'VxlanNetwork') && attachCluster(windowData.dataUuid)" :class="{'disabled-text': dbData.l2network[windowData.dataUuid].type === 'VxlanNetwork'}">{{$t('common.attach')}}</a>
              <a v-if="dbData.l2network[windowData.dataUuid].type === 'VxlanNetworkPool' " style="padding-top: 12px;" @click="pageVxlanNetworkPoolAttachCluster()">{{$t('common.attach')}}</a>
                          <a id="common-detach" style="padding-bottom:12px;" @click="(dbData.l2network[windowData.dataUuid].type !== 'VxlanNetwork') && canDetachCluster() && detachCluster_Dlg(windowData.dataUuid)" :class="{'disabled-text': !canDetachCluster() || (dbData.l2network[windowData.dataUuid].type === 'VxlanNetwork')}">{{$t('common.detach')}}</a>
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
        <el-pagination v-if="windowData.availableCount > 0"
                       :page-sizes="[10, 20, 50, 100]"
                       :page-size="windowData.pageSize"
                       :total="windowData.availableCount"
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
  import  MultiSelectList from 'src/windows/Base/MultiSelectList';
  import { formatDatetime } from 'src/utils/utils';
  import ClusterList from 'src/om/cluster/List';
  import PageBase from 'src/windows/PageBase';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';


  export default {

    name: "L2networkKvmClusterAndBaremetalClusterTabList",

    mixins: [MultiSelectList, PageBase, WindowBase, ClusterList],

    props: {
      param: {
       type: Object,
        default: () => {
          return {};
        }
      }
    },

    data() {
      let self = this;
      return {
        selectVal: 'name',
        searchStr: '',
        itemList: [],
        currSelectTab: 'KVM',
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
              className: 'link',
              onClick: (item) => {
                self.$router.push({name: 'detailCluster', params: {uuid: item.uuid}})
              },
              tooltip: true,
              field: 'name',
            },
            {
              getContent: item => self.getField('attachedCidrs', item),
              getHeaderContent: 'VTEP CIDR',
              sortable: true,
              tooltip: true,
              field: 'attachedCidrs',
            },
            {
              getContent: item => self.getField('state', item),
              getHeaderContent: self.$t('common.state'),
              field: 'state',
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate',
              sortable: true,
              tooltip: true,
            }
          ]
       }
     }
    },

    methods: {
      //获取查询条件
      getCondition() {
        let self = this, conditionList = [], conditions = '';
        conditions = self.param.conditions ? self.param.conditions : '';
        conditionList = conditionList.concat(conditions);
        if(self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
        }
        if(self.currSelectTab) {
          conditionList.push(`hypervisorType=${self.currSelectTab}`);
        }
        return conditionList;
      },
      //填充数据
      getField(field, item) {
        let self = this, normalFields = ['name', 'state'];
        if(_.includes(normalFields, field)) return item[field];
        if(field === 'attachedCidrs' && self.dbData.l2network[self.windowData.dataUuid]
          && self.dbData.l2network[self.windowData.dataUuid].type
          === 'VxlanNetworkPool') {
          return self.dbData.l2network[self.windowData.dataUuid].attachedCidrs
            && self.dbData.l2network[self.windowData.dataUuid].attachedCidrs[item.uuid]
        }
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },
      //切换tab
      changeCurrTab(tabName) {
        let self = this;
        if(_.isEqual(self.currSelectTab, tabName)) {
          return;
        }
        self.currSelectTab = tabName;
        self.updateWindow({
          pageIndex: 1,
          pageSize: 10,
          sortBy: 'createDate',
          sortDirection: '-',
          selectedUuidList: [],
          methods: {
            query: self.queryList
          }
        }).then(() => {
          self.queryList();
        })
      },
      //加载集群
      attachCluster: async function (uuid) {
        const self = this
        let conditions = ['hypervisorType=KVM']
        let dlg = 'ClusterSelectListDlg'
        if (this.currSelectTab !== 'KVM') {
          conditions = ['hypervisorType=baremetal']
          dlg = 'BaremetalClusterListMultiSelectList'
        }
        let clusterUuidList = []
        clusterUuidList = await self.getL2NetworkAttachableCluster(uuid)
        if (clusterUuidList.length > 0) conditions.push(`uuid!?=${clusterUuidList}`)
        await self.openDialog(dlg, {
          conditions: conditions,
          type: 'selection',
          select: (clusterList) => self.attach(uuid, clusterList)
        })
      },
       //加载集群
      getL2NetworkAttachableCluster: async function (uuid) {
        let clusterUuidList = []
        let l2network = _.cloneDeep(this.dbData.l2network[uuid])
        let conditions = []
        conditions.push(`type=${l2network.type}`)
        if (l2network.type === 'L2NoVlanNetwork') {
          conditions.push(`physicalInterface=${l2network.physicalInterface}`)
        }
        if (l2network.type === 'L2VlanNetwork') {
          conditions.push(`physicalInterface=${l2network.physicalInterface}`)
          conditions.push(`vlan=${l2network.vlan}`)
        }
        let resp = await rpc.query('l2-networks', { q: conditions })
        resp.inventories.forEach((item) => {
          item.attachedClusterUuids.forEach((uuid) => {
            clusterUuidList.push(uuid)
          })
        })
        return clusterUuidList
      },
      //加载集群
      pageVxlanNetworkPoolAttachCluster: function () {
        const self = this;
        self.param.attachClusterForVxlan({
          hypervisorType: self.currSelectTab,
          uuid: self.windowData.dataUuid,
          ok: (params) => {
            self.attachVxlanNetworkPoolToCluster(self.windowData.dataUuid, params)
          }
        })
      },

      attach: function (uuid, clusterList) {
        const self = this
        let i18nContext = 'l2network.action.attach'
        if (self.dbData.cluster[clusterList[0]] && self.dbData.cluster[clusterList[0]].hypervisorType === 'baremetal') {
          i18nContext = 'l2network.action.attachBaremetalCluster'
        }
        let event = self.createEvent(i18nContext, self.dbData.l2network[uuid].name, clusterList.length)
        let tasks = []
        let p = null
        clusterList.forEach(function (cluster) {
          ((cluster) => {
            p = rpc.create(`l2-networks/${uuid}/clusters/${cluster}`, null, event)
              .then((resp) => {
                self.updateDbRow({
                  tableName: 'l2network',
                  id: uuid,
                  data: resp.inventory
                })
                self.queryList()
                self.incEventSuccess(event)
              }, () => self.incEventFail(event))
            tasks.push(p)
          })(cluster)
        })
        return Promise.all(tasks)
      },
      //加载集群到vxlan
      attachVxlanNetworkPoolToCluster: function (uuid, params) {
        const self = this
        let systemTags = []
        systemTags.push(`l2NetworkUuid::${uuid}::clusterUuid::${params.clusterUuid}::cidr::{${params.cidr}}`)
        let i18nContext = 'l2network.action.attach'
        if (self.dbData.cluster[params.clusterUuid] && self.dbData.cluster[params.clusterUuid].hypervisorType === 'baremetal') {
          i18nContext = 'l2network.action.attachBaremetalCluster'
        }
        let event = self.createEvent(i18nContext, self.dbData.l2network[uuid].name)
        rpc.post(`l2-networks/${uuid}/clusters/${params.clusterUuid}`, {
          systemTags: systemTags
        }, event)
          .then((resp) => {
            self.updateDbRow({
              tableName: 'l2network',
              id: uuid,
              data: resp.inventory
            })
            self.queryList()
            self.incEventSuccess(event)
          }, () => self.incEventFail(event))
      },
      //卸载集群
      detachCluster_Dlg(uuid) {
        let self = this;
        if(!self.isSelected) return;
        let options = {};
        options = {
          title: 'common.detachCluster',
          description:'cluster.detachCluser',
          icon: 'cluster_popupico',
          uuidList: self.selectedList,
          warning: 'cluster.info.text4',
          getName: (uuid) => {
            return self.dbData.cluster[uuid].name;
          },
          ok:() => {
            self.detachCluster(uuid).then(() => {
              self.queryList()
            })
          }
        }
        if(self.dbData.cluster[self.selectedList[0]] && self.dbData.cluster[self.selectedList[0]].hypervisorType === 'baremetal') {
          options = {
            title: 'common.detachBaremetalCluster',
            description:'baremetalCluster.detachCluser',
            icon: 'cluster_popupico',
            uuidList: self.selectedList,
            getName: (uuid) => {
              return self.dbData.cluster[uuid].name;
            },
            ok:() => {
              self.detachCluster(uuid).then(() => {
                self.queryList()
              })
            }
          }
        }
        self.openDialog('ConfirmDlg',options)
      },

      canDetachCluster: function () { // can not detach vCenter Cluster
        const self = this
        if (self.selectedList.length <= 0) return false
        for (let i = self.selectedList.length - 1; i >= 0; i--) {
          if (self.dbData.cluster[self.selectedList[i]].hypervisorType === 'ESX') {
            return false
          }
        }
        return true
      },

      detachCluster: function (uuid) {
        const self = this
        if (self.selectedList.length <= 0) return
        let i18nContext = 'l2network.action.detach'
        if (self.dbData.cluster[self.selectedList[0]] && self.dbData.cluster[self.selectedList[0]].hypervisorType === 'baremetal') {
          i18nContext = 'l2network.action.detachBaremetalCluster'
        }
        let event = self.createEvent(i18nContext, self.dbData.l2network[uuid].name, self.selectedList.length)
        let tasks = []
        let q = null
        self.selectedList.forEach(function (cluster) {
          ((cluster) => {
            q = rpc._delete(`l2-networks/${uuid}/clusters/${cluster}`, null, event)
              .then((resp) => {
                let l2network = resp.inventory
                l2network.attachedClusterUuids.splice(cluster, 1)
                self.updateDbRow({
                  tableName: 'l2network',
                  id: uuid,
                  data: l2network
                })
                self.incEventSuccess(event)
              }, () => self.incEventFail(event))
            tasks.push(q)
          })(cluster)
        })
        return Promise.all(tasks)
      },

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
      }).then(() => {
        if(self.dbData.l2network[self.windowData.dataUuid] && self.dbData.l2network[self.windowData.dataUuid].type !== 'VxlanNetworkPool') {
          self.dataSource.fields.splice(1,1)
        }
         self.queryList();
      })
    }

  }
</script>

<style scoped>
.tab-container{
  display: inline-block;
  border-radius: 3px;
  cursor: pointer;
  transition: all ease-out 0.5s;
  margin-right: 20px;
  background-color: #e9edfa;
}

  .tab-item{
    display: inline-block;
    padding: 10px 20px;
    border-radius: 2px;
    font-size: 12px;
  }

  .is-active{
     background-color: #5e7ce0;
     transition: background-color cubic-bezier(0.5, 0.8, 0.5, 1) 0.5s,
      background-color ease-in 0.5s;
     color: #fff;
  }
</style>
