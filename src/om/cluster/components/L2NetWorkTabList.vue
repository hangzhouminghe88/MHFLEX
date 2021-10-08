<template>
  <div class="container">
    <div class="page-toolbar-container" style="display: flex">
      <div class="page-toolbar-left">
        <span>{{$t('common.l2network')}}{{$t('common.colon')}}</span>
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="margin-top: 12px;" :class="{'disabled-text': isSelected}" @click="!isSelected && attachL2NetWork();">{{$t('common.attach')}}</a>
              <a style="margin-bottom: 12px" :class="{'disabled-text': !isSelected}" @click="isSelected && detachL2Network();">{{$t('common.detach')}}</a>
            </div>
          </span>
        </drop-down>
      </div>
      <div class="page-toolbar-center"></div>
      <div class="page-toolbar-right">
       <span style="padding: 0 15px;display: inline-block;">
            <el-input :placeholder="$t('common.searchPlaceholder')" v-model="searchStr" @blur="search()"
                      @change="search()">
               <el-select v-model="selectVal" slot="prepend" :placeholder="$t('common.searchLabelPlaceholder')"
                          style="width: 105px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
      </div>
    </div>
    <div class="page-table">
      <el-table :data="itemList" @selection-change="handleSelect" @sort-change="handleSort">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection"></el-table-column>
        <el-table-column :label="$t('common.name')" prop="name" sortable>
          <template slot-scope="scope">
            <div class="link" @click="goToL2Network(scope.row.uuid)">{{scope.row.name}}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.physicalInterface')" prop="physicalInterface" sortable></el-table-column>
        <el-table-column :label="$t('common.vlan')" prop="vlan"></el-table-column>
        <el-table-column :label="$t('common.type')" prop="type" sortable></el-table-column>
        <el-table-column :label="$t('common.createDate')" prop="createDate" sortable>
          <template slot-scope="scope">
            {{formatDatetime(new Date(scope.row.createDate))}}
          </template>
        </el-table-column>
      </el-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData.availableCount > 0"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="windowData.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="windowData.availableCount"
          class="page-table-pagination"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          :current-page="windowData.pageIndex">
        </el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import L2NetWorkList from 'src/network/l2network/List';
  import ClusterMethods from '../Methods';
  import rpc from 'src/utils/rpc';
  export default {
    name: "L2NetWorkTabList",
    mixins: [MultiSelectList, L2NetWorkList, ClusterMethods],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data(){
      return {
        selectVal: 'name',
        searchStr: '',
        itemList: [],
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ]
      }
    },
    created(){
      let self = this, dataUuid = '';
      dataUuid = self.param.clusterUuid;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        dataUuid
      }).then(() => {
        return self.queryList();
      })
    },
    methods: {
      //获得查询条件
      getCondition: function () {
        let conditionList = [], self = this;
        conditionList.push(this.param.conditions)
        if (self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
        }
        return conditionList
      },
      //绑定二层网络
      async attachL2NetWork(){
        let l2networkList = await this.getClusterAttachableL2Network(this.windowData.dataUuid)
        const self = this
        let zoneResp = await rpc.query('zones', {q: self.param.conditions});
        await this.openDialog('L2NetworkSingleSelectListDlg', {
          conditions: [`uuid?=${l2networkList}`, `zoneUuid=${zoneResp.inventories[0].uuid}`],
          ok: (l2networkList) => {
            let l2network = _.cloneDeep(self.dbData.l2network[l2networkList])
            if (l2network.type !== 'VxlanNetworkPool') {
              this.attachl2(this.windowData.dataUuid, [l2networkList])
                .then(() => {
                  self.queryList().then(() => self.GetisAttachL2network())
                })
            } else {
              this.openDialog('ClusterAttachVxlanPoolInputCidrPopupDlg', {
                ok: (cidr) => self.attachVxlanNetworkPoolToCluster(l2network.uuid, this.windowData.dataUuid, cidr)
              })
            }
          }
        })
      },
      //解绑二层网络
      detachL2Network(){
        let self = this, uuidList = [];
        if(!self.isSelected) return;
        uuidList = self.selectedList;
        let _cb = (uuidList) => {
          let i18nContext = 'cluster.action.l2Detach'
          if (self.dbData.cluster[self.windowData.dataUuid] && self.dbData.cluster[self.windowData.dataUuid].hypervisorType === 'baremetal') {
            i18nContext = 'baremetalCluster.action.l2Detach'
          }
          let event = self.createEvent(i18nContext, uuidList.length === 1 ? self.dbData.l2network[uuidList[0]].name : '', uuidList.length)
          if (uuidList.length > 0) {
            uuidList.forEach(
              (l2network) => {
                ((l2network) =>{
                  return rpc._delete(`l2-networks/${l2network}/clusters/${self.windowData.dataUuid}`, null, event)
                    .then((resp) => {
                      self.incEventSuccess(event)
                      this.queryList()
                    }, () => {
                      self.incEventFail(event)
                    })
                })(l2network)
              }
            )}
        }
        self.openDialog('ConfirmDlg',{
          title: 'common.detachl2',
          description: 'l2network.info.detachConfirm',
          warning: 'l2network.info.detachWarning',
          icon: 'vxlanpool_n',
          uuidList: self.selectedList,
          getName(uuid){
            return self.dbData.l2network[uuid].name;
          },
          ok(){
            _cb(uuidList);
          }
        })
      },
      //帮顶vxlan
      attachVxlanNetworkPoolToCluster (uuid, clusterUuid, cidr) {
        const self = this
        let systemTags = []
        systemTags.push(`l2NetworkUuid::${uuid}::clusterUuid::${clusterUuid}::cidr::{${cidr}}`)
        let i18nContext = 'l2network.action.attach'
        if (self.dbData.cluster[clusterUuid] && self.dbData.cluster[clusterUuid].hypervisorType === 'baremetal') {
          i18nContext = 'l2network.action.attachBaremetalCluster'
        }
        let event = self.createEvent(i18nContext, self.dbData.l2network[uuid].name)
        rpc.post(`l2-networks/${uuid}/clusters/${clusterUuid}`, {
          systemTags: systemTags
        }, event)
          .then((resp) => {
            self.queryList()
            self.incEventSuccess(event)
          }, () => self.incEventFail(event))
      },
      goToL2Network(uuid){
        let self = this;
        self.$router.push({name: 'detaill2network', params: {uuid}})
      }
    }
  }
</script>

<style scoped>

</style>
