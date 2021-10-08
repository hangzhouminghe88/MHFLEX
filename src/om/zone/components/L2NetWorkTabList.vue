<template>
  <div class="container">
    <div class="page-toolbar-container">
      <div style="display: flex">
        <div class="page-toolbar-left">
          <span>{{$t('common.l2network')}}{{$t('common.colon')}}</span>
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a style="margin-top: 12px;" @click="createL2Network()">{{$t('l2network.create')}}</a>
                <a :class="{'disabled-text':!canAttachCluster(selectedList)}" @click="isSingleSelected && canAttachCluster(selectedList) && attachCluster()">{{$t('common.attachCluster')}}</a>
                <a :class="{'disabled-text':!canDetachCluster(selectedList)}" @click="isSingleSelected && canDetachCluster(selectedList) && isSelected && detachCluster()">{{$t('common.detachCluster')}}</a>
                <a style="margin-bottom: 12px;" :class="{'disabled-text': !isSelected}" @click="deleteL2NetWork">{{$t('common.destroy')}}</a>
              </div>
            </span>
          </drop-down>
        </div>
        <div class="page-toolbar-center"></div>
        <div class="page-toolbar-right">
            <span style="display: inline-block;">
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
        </div>
      </div>
    </div>
    <div class="page-table">
      <el-table :data="itemList" @selection-change="handleSelect">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection"></el-table-column>
        <el-table-column :label="$t('common.name')">
          <template slot-scope="scope">
            <span class="link" @click="goToL2NetWork(scope.row.uuid)">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.physicalInterface')" prop="physicalInterface"></el-table-column>
        <el-table-column :label="$t('common.vlan')" prop="vlan"></el-table-column>
        <el-table-column :label="$t('common.type')" prop="type"></el-table-column>
        <el-table-column :label="$t('common.createDate')" prop="createDate">
          <template slot-scope="scope">
            {{formatDatetime(new Date(scope.row.createDate))}}
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="page-table-pagination">
      <el-pagination v-if="windowData.availableCount > 0"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="windowData.pageSize"
        layout="total, prev,pager, next, jumper"
        :total="windowData.availableCount"
        class="page-table-pagination"
        @current-change="pageCurrentChange"
        @size-change="pageSizeChange"
        :current-page="windowData.pageIndex"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import L2NetworkList from 'src/network/l2network/List';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  export default {
    name: "L2NetWorkTabList",
    mixins: [MultiSelectList, L2NetworkList],
    props: {
      param: {
        type: Object,
        default: () => {
          return {};
        }
      }
    },
    data(){
      return {
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        itemList: []
      }
    },
    created(){
      //初始化请求参数:
      let self = this, dataUuid = '';
      dataUuid = self.param.uuid ? self.param.uuid : '';
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        selectedUuidList: [],
        sortDirection: '-',
        dataUuid
      }).then(() => {
        self.queryList();
      })
    },
    methods: {
      ...Utils,
      //查询条件
      getCondition(){
        let conditionList = [], self = this;
        if(self.param.conditions) conditionList.push(self.param.conditions);
        if(self.selectVal !== '' && self.searchStr !== ''){
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
        }
        return conditionList;
      },
      //创建二层网络
      createL2Network(){
        let self = this;
        self.$router.push({name: 'createl2network'})
      },
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
      pageVxlanNetworkPoolAttachCluster: function (uuid) {
        const self = this
        self.$emit('getAttachClusterParam', {uuid});
      },
      //加载二层网络
      async attachCluster(){
        let  self = this, uuidList = [];
        if (!self.isSingleSelected) return
        uuidList = self.selectedList;
        let l2network = _.cloneDeep(this.dbData.l2network[uuidList[0]])
        if (l2network.type === 'VxlanNetworkPool') {
          self.pageVxlanNetworkPoolAttachCluster(uuidList[0])
        } else if (l2network.type === 'L2NoVlanNetwork' || l2network.type === 'L2VlanNetwork') {
          let clusterUuidList = []
          clusterUuidList = await self.getL2NetworkAttachableCluster(uuidList[0])
          let conditions = [`uuid!?=${clusterUuidList}`]
          let dlg = 'ClusterSelectListDlg'
          if (self.getLicensePermission('LICENSE_EXTRA_BAREMETAL', self)) {
            dlg = 'KVMClusterAndBaremetalClusterSelectListDlg'
          } else {
            conditions.push('hypervisorType=KVM')
          }
          await self.openDialog(dlg, {
            conditions: conditions,
            zoneUuid: `zoneUuid=${this.windowData.uuid}`,
            select: (clusterList) => self.attach(uuidList[0], clusterList),
            type: 'selection'
          })
        } else if (l2network.type === 'VxlanNetwork') {
          return
        }
      },
      //卸载二层网络
      detachCluster(){
        this.detailDetach(this.selectedList[0])
      },
      //是否可以加载二层网络
      canAttachCluster: function (uuidList) {
        if (!uuidList || uuidList.length !== 1) return false
        const self = this
        let l2network = _.cloneDeep(self.dbData.l2network[uuidList[0]])
        if (!l2network) return false
        if (l2network.type === 'VxlanNetwork') return false
        return true
      },
      //是否可以卸载二层网络
      canDetachCluster: function (uuidList) {
        if (!uuidList || uuidList.length !== 1) return false
        const self = this
        let l2network = _.cloneDeep(self.dbData.l2network[uuidList[0]])
        if (!l2network) return false
        if (l2network.type === 'VxlanNetwork') return false
        return true
      },
      //删除二层网络
      deleteL2NetWork(){
        let self = this, uuidList = [];
        uuidList = self.selectedList;
        if(!self.isSelected) return;
        self.openDialog('ConfirmDlg',{
          title: 'l2network.deleteL2Network',
          description: 'l2network.info.deleteConfirm',
          uuidList,
          icon: 'l2_popupico',
          warning: 'l2network.info.deleteConfirmWarning',
          getName(uuid){
            return self.dbData.l2network[uuid].name;
          },
          ok(){
            self.delete(uuidList)
              .then(() => {
                self.queryList();
              });
          }
        })
      },
      //回到l2列表详情
      goToL2NetWork(uuid){
        let self = this;
        self.$router.push({name: 'detaill2network', params: {uuid}});
      },
    }
  }
</script>

<style scoped>

</style>
