<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row type="flex">
        <el-col :span="14">
          <span class="text">{{$t(`zwatchAlarm.${getTitle()}`)}}{{$t('common.colon')}}</span>
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">
                {{$t('common.actions')}}
              </span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a style="margin-top: 12px;" @click="!isSelected && pageAdd()" :class="{'disabled-text': isSelected}">{{$t('common.add')}}</a>
                <a style="margin-bottom: 12px;" @click="isSelected && pageRemove()" :class="{ 'disabled-text': !isSelected }">{{$t('common.remove')}}</a>
              </div>
            </span>
          </drop-down>
        </el-col>
        <el-col :span="10" style="text-align: right">
           <span style="display: inline-block;">
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
        </el-col>
      </el-row>
    </div>
    <el-table
    :data="itemList"
    @selection-change="handleSelect"
    @sort-change="handleSort">
      <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
      <el-table-column type="selection"></el-table-column>
      <el-table-column :label="$t('common.name')">
        <template slot-scope="scope">
          <span class="link" @click="openResourceDetail(scope.row.uuid)">{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.createDate')" prop="createDate" sortable>
        <template slot-scope="scope">
         {{formatDatetime(new Date(scope.row.createDate))}}
        </template>
      </el-table-column>
    </el-table>
    <div class="page-table-pagination">
      <el-pagination v-if="windowData.total > 0 "
        :page-sizes="[5, 10]"
        :page-size="10"
        :total="windowData.total"
        class="page-table-pagination"
        layout="total, sizes, prev, pager, next"
        @current-change="pageCurrentChange"
        @size-change="pageSizeChange"
        :current-page="windowData.pageIndex"></el-pagination>
    </div>
  </div>
</template>

<script>
  import Dropdown from "../../../ecs/autoScalingGroup/component/Dropdown";
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';

  export default {
    name: "ResourceListTab",
    components: {Dropdown},
    mixins: [MultiSelectList, WindowBase],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data() {
      return {
        searchStr: '',
        selectVal: 'name',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        itemList: []
      }
    },
    created() {
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: []
      })
        .then(() => {
          self.queryList();
        })
    },
    methods: {
      ...Utils,
      //移除资源
      pageRemove: function () {
        let selectedUuidList = this.selectedList
        let alarmUuid = this.param.alarmUuid
        // let labels = this.dbData.zwatchResourceAlarm[alarmUuid].labels
        this.removeResourceFromLabel(selectedUuidList, alarmUuid)
          .then(() => this.param.refresh())
          .then(() => this.queryList())
      },
      //移除资源回调
      removeResourceFromLabel: function (resourceUuidList, alarmUuid) {
        const self = this
        let alarmName = this.dbData.zwatchResourceAlarm[alarmUuid].name
        let event = self.createEvent('zwatchAlarm.action.removeResourceFromLabel', alarmName)
        let labels = this.dbData.zwatchResourceAlarm[alarmUuid].labels
        let key = labels[0].key
        let labelUuid = labels[0].uuid
        let oldValue = labels[0].value
        let value = _.xor(oldValue.split('|'), resourceUuidList).join('|')
        return rpc.update('zwatch/alarms/labels', labelUuid, {
          'updateAlarmLabel': {
            key: key,
            operator: 'Regex',
            value: value
          }
        }, event)
          .then((resp) => {
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
      },
      //或得资源标题： 例如： 云主机、物理机、主存储等
      getTitle: function () {
        let alarmUuid = this.param.alarmUuid
        let labels = this.dbData.zwatchResourceAlarm[alarmUuid].labels
        if (!labels[0]) return ''
        let key = labels[0] && labels[0].key
        return this.param.getResourceType(key)
      },
      //查询条件
      getCondition: function () {
        let alarmUuid = this.param.alarmUuid
        let labels = this.dbData.zwatchResourceAlarm[alarmUuid].labels
        let conditionList = []
        if (labels[0]) {
          let uuidList = labels[0] && labels[0].value.split('|')
          conditionList.push(`uuid?=${uuidList}`)
        }
        if (this.param.conditions) {
          conditionList = conditionList.concat(this.param.conditions)
        }
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      //回到相应资源详情页
      openResourceDetail: function (resourceUuid) {
        let alarmUuid = this.param.alarmUuid
        let labels = this.dbData.zwatchResourceAlarm[alarmUuid].labels
        let key = labels[0] && labels[0].key
        if (this.dbData.zwatchResourceAlarmA[alarmUuid] && this.dbData.zwatchResourceAlarmA[alarmUuid].tag === 'VRouter' && key === 'VMUuid') {
          if (this.dbData.vm[resourceUuid].applianceVmType === 'vrouter' || this.dbData.vm[resourceUuid].applianceVmType === 'VirtualRouter') key = 'vrouter'
          if (this.dbData.vm[resourceUuid].applianceVmType === 'vpcvrouter') key = 'vpcvrouter'
        }
        if (this.dbData.l3network[resourceUuid] && this.dbData.l3network[resourceUuid].type === 'L3VpcNetwork') {
          key = 'VpcNetwork'
        }
        let obj = {
          'vrouter': 'VirtualRouterDetailDlg',
          'vpcvrouter': 'VpcVRouterDetailDlg',
          'VMUuid': 'detailVm',
          'BackupStorageUuid': 'BackupStorageDetailDlg',
          'HostUuid': 'detailHost',
          'L3NetworkUuid': 'L3NetworkDetailDlg',
          'VpcNetwork': 'VpcNetworkDetailDlg',
          'VipUUID': 'VipDetailDialog',
          'PrimaryStorageUuid': 'PrimaryStorageDetailDlg',
          'SourceHostUuid': 'detailHost',
          'DestinationHostUuid': 'detailHost'
        }
        let dlg = obj[key]
        this.$router.push({name: dlg, params:{uuid: resourceUuid}});
      },
      getPath: function () {
        let alarmUuid = this.param.alarmUuid
        // let tag = this.dbData.zwatchResourceAlarmA[alarmUuid].tag
        let labels = this.dbData.zwatchResourceAlarm[alarmUuid].labels
        let obj = {
          'VMUuid': 'vm-instances',
          'BackupStorageUuid': 'backup-storage',
          'HostUuid': 'hosts',
          'L3NetworkUuid': 'l3-networks',
          'VipUUID': 'vips',
          'PrimaryStorageUuid': 'primary-storage'
        }
        let path = ''
        let key = labels[0] && labels[0].key
        if (obj[key]) {
          path = obj[key]
        }
        return path
      },
      getTableName: function () {
        let alarmUuid = this.param.alarmUuid
        // let tag = this.dbData.zwatchResourceAlarmA[alarmUuid].tag
        let labels = this.dbData.zwatchResourceAlarm[alarmUuid].labels
        let obj = {
          'VMUuid': 'vm',
          'BackupStorageUuid': 'backupstorage',
          'HostUuid': 'host',
          'L3NetworkUuid': 'l3network',
          'VipUUID': 'vip',
          'PrimaryStorageUuid': 'primarystorage'
        }
        let tableName = ''
        let key = labels[0] && labels[0].key
        if (obj[key]) {
          tableName = obj[key]
        }
        return tableName
      },
      queryList: async function () {
        let alarmUuid = this.param.alarmUuid
        let labels = this.dbData.zwatchResourceAlarm[alarmUuid].labels
        if (labels.length === 0) return
        let conditions = this.getCondition()
        let path = this.getPath()
        let tableName = this.getTableName()
        let resp = await rpc.query(path, {
          count: false,
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          q: conditions,
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
        })
        await this.updateWindow({
          pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
          total: resp.total
        })
        let uuidList = resp.inventories.map((item) => item.uuid)
        let table = {}
        await this.updateDbTable({
          tableName: tableName,
          list: resp.inventories
        })
        await this.updateWindow({uuidList, table})
          .then(() => {
            this.itemList = this.windowData.uuidList.map((uuid) => {
              return this.dbData[tableName][uuid];
            })
          })
      },
      pageAdd () {
        let alarmUuid = this.param.alarmUuid
        // let namespace = this.dbData.zwatchResourceAlarm[alarmUuid].namespace
        let labels = this.dbData.zwatchResourceAlarm[alarmUuid].labels
        let key = labels[0].key
        let oldValue = labels[0].value
        let selectListParam = {}
        let routes = {
          'VMUuid': {
            select: 'VmInstanceMultiSelectListDlg',
            conditions: ['hypervisorType=KVM', 'type=UserVm']
          },
          'BackupStorageUuid': {
            select: 'BackupStorageListMultiSelectList',
            conditions: ['type!=vCenter', '__systemTag__!?=remote,onlybackup,aliyun,remotebackup']
          },
          'HostUuid': {
            select: 'HostListMultiSelectDlg',
            conditions: ['hypervisorType!=ESX']
          },
          'PrimaryStorageUuid': {
            select: 'PrimaryStorageListMultiSelectList',
            conditions: ['type!=vCenter']
          },
          'VipUUID': {
            select: 'VIPMultiSelectList',
            conditions: ['l3Network.l2Network.cluster.type!=vmware']
          },
          'L3NetworkUuid': {
            select: 'L3NetworkMultiSelectList',
            conditions: ['l2Network.cluster.type=zstack']
          }
        }
        if (this.dbData.zwatchResourceAlarmA[alarmUuid] && this.dbData.zwatchResourceAlarmA[alarmUuid].tag === 'VRouter' && key === 'VMUuid') {
          selectListParam = {
            select: 'RouterMultiSelectListDlg',
            conditions: ['hypervisorType=KVM']
          }
        } else {
          selectListParam = routes[key]
        }
        let value = oldValue.split('|')
        let conditions = selectListParam.conditions
        if (value.length > 0) {
          conditions.push(`uuid!?=${value}`)
        }
        this.openDialog(selectListParam.select, {
          conditions: conditions,
          select: (uuidList) => {
            return this.addResourceToLabel(uuidList, alarmUuid)
              .then(() => this.param.refresh())
              .then(() => this.queryList())
          }
        })
      },
      addResourceToLabel (resourceUuidList, alarmUuid) {
        const self = this
        let alarmName = this.dbData.zwatchResourceAlarm[alarmUuid].name
        let event = self.createEvent('zwatchAlarm.action.addResourceToLabel', alarmName)
        let labels = this.dbData.zwatchResourceAlarm[alarmUuid].labels
        let key = labels[0].key
        let labelUuid = labels[0].uuid
        let oldValue = labels[0].value
        let value = _.uniq(oldValue.split('|').concat(resourceUuidList)).join('|')
        return rpc.update('zwatch/alarms/labels', labelUuid, {
          'updateAlarmLabel': {
            key: key,
            operator: 'Regex',
            value: value
          }
        }, event)
          .then((resp) => {
            self.incEventSuccess(event)
          }, () => {
            self.incEventFail(event)
          })
      },
    }
  }
</script>

<style scoped>

</style>
