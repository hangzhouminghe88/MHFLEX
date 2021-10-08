<template>
  <div class="container">
    <div class="page-toolbar-container" style="display: flex; justify-content: space-between;">
      <div class="detail-page-toolbar-left">
         <span class="text">云主机:&nbsp;&nbsp;</span>
         <drop-down class="detail-dropdown">
           <span slot="title">
             <span class="text">{{$t('common.actions')}}</span>
           </span>
           <span slot="content">
             <div class="dropdown-content">
               <a style="padding-top: 12px"
                 :class="{'disabled-text': isSelected}"
                  @click="!isSelected && pageAttach()">{{$t('common.attach')}}</a>
               <a style="padding-bottom: 12px;"
                  @click="isSelected && pageDetach()"
                  :class="{'disabled-text': !isSelected}">{{$t('common.detach')}}</a>
             </div>
           </span>
         </drop-down>
      </div>
      <div class="detail-page-toolbar-right">
          <span style="padding: 0 15px;display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
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
     <div style="padding-top: 10px;">
        <mh-table :data-source="dataSource" :loading="windowData.loading">
          <template  slot="tableSlot" slot-scope="scope">
            <table-body-item-list :content="scope.data.defaultL3NetworkIp"/>
          </template>
        </mh-table>
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
  import vmList from 'src/ecs/ecsInstance/List';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';
  import { formatDatetime } from '../../../utils/utils';
  import TableBodyItemList from 'src/component/TableBodyItemList';
  import rpc from 'src/utils/rpc';

  export default {
    name: 'vmTabList',
    mixins: [MultiSelectList, WindowBase, vmList],
    components: {
      'table-body-item-list': TableBodyItemList
    },
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data() {
      let _this = this;
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
           getItemList: () => _this.itemList,
           handleSelection: _this.handleSelect,
           handleSort: _this.handleSort,
           type: 'selection',
           fields: [
             {
               getContent: item => _this.getField('name', item),
               getHeaderContent: _this.$t('common.name'),
               onClick: (item) => {

               },
               className: 'link',
               tooltip: true,
               sortable: true,
               field: 'name'
             },
             {
               getContent: item => _this.getField('defaultL3NetworkIp', item),
               getHeaderContent: _this.$t('common.defaultIp'),
               tooltip: true,
               type: 'slot'
             },
             {
               getContent: item => _this.getField('currNetIp', item),
               getHeaderContent: _this.$t('common.currNetIp'),
               tooltip: true,
             },
             {
               getContent: item => _this.getField('state', item),
               getHeaderContent: _this.$t('common.state'),
               tooltip: true,
             },
             {
               getContent: item => _this.getField('ownerName', item),
               getHeaderContent: _this.$t('common.owner'),
               tooltip: true,
             },
             {
               getContent: item => _this.getField('createDate', item),
               getHeaderContent: _this.$t('common.createDate'),
               tooltip: true,
                sortable: true,
                field: 'createDate'
             }
           ]
        }
      }
    },
    //初始化请求参数并发出请求
    created()  {
      let _this = this,
          dataUuid = _this.param.uuid ? _this.param.uuid : '';
      _this.updateWindow({
        pageIndex: 1,
        dataUuid,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        loading: false,
        methods: {
          query: _this.queryList
        }
      }).then(() => {
        _this.queryList();
      })
    },
    methods: {
      //设置请求条件
      getCondition() {
        let _this = this,
            conditionList = [];
        if(_this.param.conditions) {
          conditionList = conditionList.concat(_this.param.conditions);
        }
        if(_this.selectVal !== '' && _this.searchStr !== '') {
          conditionList = conditionList.concat(`${_this.selectVal}~=%25${encodeURIComponent(_this.searchStr)}%25`);
        }
        return conditionList;
      },
      //填充表格数据
      getField(field, item) {
        let _this = this, normalFields = ['name', 'ownerName', 'state'];
        if(normalFields.includes(field)) return item[field];
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
        if(field === 'currNetIp') return _this.getCurrNetIp(item.uuid);
      },
      //获得当前使用Ip
      getCurrNetIp (uuid) {
        const _this = this
        let netUuid = _this.windowData.dataUuid
        let ipList = []
        _this.dbData.vm[uuid].vmNics.forEach((vmNic) => {
          ipList = ipList.concat(vmNic.usedIps.filter(it => it.l3NetworkUuid === netUuid))
        })
        if (ipList.length > 0) {
          return ipList[0].ip
        }
        return ''
      },
      //绑定云主机
      pageAttach() {
        let _this = this,
        uuid = _this.windowData.dataUuid,
        l2NetworkUuid = _this.dbData.l3network[uuid].l2NetworkUuid,
        clusterUuidList = _this.dbData.l2network[l2NetworkUuid] ? _this.dbData.l2network[l2NetworkUuid].attachedClusterUuids : undefined, // APIQueryL2NetworkMsg is admin only
        uuidList = [],
        tasks = [],
        unableConditions = ['type=UserVm', 'hypervisorType=KVM', `vmNics.usedIp.l3NetworkUuid=${uuid}`];
        if (_this.dbData.common.isAdmin && clusterUuidList) {
          unableConditions.push(`rootVolume.primaryStorage.cluster.uuid?=${clusterUuidList}`)
        }
        let p = rpc.query('vm-instances', {
          q: unableConditions
        }).then((resp) => {
          let unableUuidList = resp.inventories.map(it => it.uuid)
          let conditions = ['type=UserVm', 'hypervisorType=KVM', `uuid!?=${unableUuidList}`]
          if (_this.dbData.common.isAdmin && clusterUuidList) {
            conditions.push(`rootVolume.primaryStorage.cluster.uuid?=${clusterUuidList}`)
          }
          return rpc.query('vm-instances', {
            q: conditions
          }).then((resp) => {
            uuidList = uuidList.concat(resp.inventories.map(it => it.uuid))
          })
        })
        tasks.push(p)
        return Promise.all(tasks).then(() => {
          return _this.openDialog('VmInstanceMultiSelectListDlg', {
            conditions: [`uuid?=${_.uniq(uuidList)}`, 'state?=Running,Stopped'],
            select: (vmUuidList) => {
              return _this.attachL3NetworkToVm(vmUuidList).then(() => {
                return _this.queryList()
              })
            }
          })
        })
      },
      //绑定云主机
       attachL3NetworkToVm: function (vmInstanceUuidList) {
        const _this = this
        let uuid = _this.windowData.dataUuid
        let event = _this.createEvent('l3network.action.attachVm', _this.dbData.l3network[uuid].name || '', vmInstanceUuidList.length)
        let tasks = []
        vmInstanceUuidList.forEach(vmInstanceUuid => {
          let p = rpc.post(`vm-instances/${vmInstanceUuid}/l3-networks/${uuid}`, {}, event)
            .then(() => {
              _this.incEventSuccess(event)
            }, () => {
              _this.incEventFail(event)
            })
          tasks.push(p)
        })
        return Promise.all(tasks)
      },
      //解绑云主机
      pageDetach() {
        let _this = this,
            uuidList = [];
        if(!_this.isSelected) return;
        uuidList = _this.selectedList;
         let vmNicUuidList = uuidList
          .map(uuid => _this.dbData.vm[uuid].vmNics.filter(it => it.l3NetworkUuid === _this.windowData.dataUuid)[0].uuid)
        _this.openDialog('ConfirmDlg', {
          title: 'vpcNetwork.detach',
          description: 'vpcNetwork.detachConfirm',
          uuidList,
          icon: 'vm_popupico',
          getName: (uuid) => {
            return _this.dbData.vm[uuid].name;
          },
          ok: () => {
            return _this.detachL3NetworkFromVm(vmNicUuidList).then(() => {
              return _this.queryList()
            })
          }
        })
      }
    }
  }
</script>

<style lang="less" scoped>
 .detail-page-toolbar-left{
   padding: 10px;
 }

 .text{
   line-height: 25px;
 }
</style>
