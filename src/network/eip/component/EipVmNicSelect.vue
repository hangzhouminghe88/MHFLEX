<template>
  <div style="overflow: hidden;">
    <div class="page-toolbar-container" style="display: flex">
      <div class="page-toolbar-left"></div>
      <div class="page-toolbar-center"></div>
      <div class="page-toolbar-right">
        <div class="radio-group" style="text-align: right">
            <span style="padding: 0 15px;display: inline-block;">
              <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
                 <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
                 </el-select>
                <span slot="append"><i class="el-icon-search icon"></i></span>
              </el-input>
             </span>
        </div>
      </div>
    </div>
    <div class="page-table">
      <div class="table-header">
        <span v-for="(column, index) in columns" :class="`table-td-${index}`" v-text="column"></span>
      </div>
      <ul class="table-row" v-for="uuid in windowData.uuidList" @click="!dbData.vmNicRefs[uuid] && select(uuid, $event)">
        <li class="table-td-0">
          <i @click="expandData(uuid, $event)" v-if="dbData.vmNicRefs[uuid] && !windowData.table[uuid].expanded" class="el-icon-arrow-right"></i>
          <i @click="expandData(uuid, $event)" v-if="dbData.vmNicRefs[uuid] && windowData.table[uuid].expanded" class="el-icon-arrow-down"></i>
        </li>
        <li class="table-td-1">
          <span v-if="dbData.vmNicRefs[uuid]">{{dbData.vmNicRefs[uuid].internalName}}</span>
          <span v-else>
            <el-radio v-model="windowData.table[uuid].selected" :label="true">&nbsp</el-radio>
            {{dbData.ip[uuid] && getL3NetworkName(dbData.ip[uuid].l3NetworkUuid)}}
          </span>
        </li>
        <li class="table-td-2">
          <span v-if="dbData.vmNicRefs[uuid]">{{dbData.vmNicRefs[uuid].usedIps.length}}</span>
          <span v-else>-</span>
        </li>
        <li class="table-td-3">
          <span v-if="dbData.vmNicRefs[uuid]">{{dbData.vmNicRefs[uuid].mac}}</span>
          <span v-else>-</span>
        </li>
        <li class="table-td-4">
          <span v-if="dbData.vmNicRefs[uuid]">-</span>
          <span v-else>{{dbData.ip[uuid].ipVersion === 4 ? 'IPv4' : 'IPv6'}}</span>
        </li>
        <li class="table-td-5">
          <span v-if="dbData.vmNicRefs[uuid]">-</span>
          <span v-else-if="dbData.ip[uuid] && dbData.ip[uuid].isStatic === true">{{dbData.ip[uuid].ip ? `${dbData.ip[uuid].ip}(${$t('common.static')})` : $t('common.empty')}}</span>
          <span v-else-if="dbData.ip[uuid] && dbData.ip[uuid].isStatic === false || dbData.ip[uuid].isStatic === undefined">{{dbData.ip[uuid].ip ? `${dbData.ip[uuid].ip}(${$t('common.dynamic')})` : $t('common.empty')}}</span>
        </li>
        <li class="table-td-6">
          <span v-if="dbData.vmNicRefs[uuid]">{{dbData.vmNicRefs[uuid].inboundBandwidth && dbData.vmNicRefs[uuid].inboundBandwidth > -1 ? bytesToSize(parseInt(dbData.vmNicRefs[uuid].inboundBandwidth), 'bps') : $t('common.unlimited')}}</span>
          <span v-else>-</span>
        </li>
        <li class="table-td-7">
          <span v-if="dbData.vmNicRefs[uuid]">{{dbData.vmNicRefs[uuid].outboundBandwidth && dbData.vmNicRefs[uuid].outboundBandwidth > -1 ? bytesToSize(parseInt(dbData.vmNicRefs[uuid].outboundBandwidth), 'bps') : $t('common.unlimited')}}</span>
          <span v-else>-</span>
        </li>
      </ul>
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
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';

  export default {
    name: 'EipVmNicSelect',
    props: {
      getNicList: {
        type: Function,
        required: true
      },
      closePage: {
        type: Function,
        required: true
      },
      selectNicIP: {
        type: Function,
        required: true
      }
    },
    mixins: [WindowBase, MultiSelectList],
    created: function () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        uuidList: [],
        sortBy: 'createDate',
        sortDirection: '-',
        methods: {
          queryList: this.init
        }
      }).then(() => {
        this.init()
      })
    },
    data () {
      let self = this;
      return {
        conditionNameList: [
          {
            name: 'common.name',
            value: 'vmInstance.name'
          }
        ],
        selectVal: 'vmInstance.name',
        searchStr: '',
        vmNicUuidList: [],
        columns: [
          '',
          self.$t('common.name'),
          self.$t('common.networkNumber'),
          'MAC',
          self.$t('common.ipVersion'),
          'IP',
          self.$t('common.networkInboundBandwidth'),
          self.$t('common.networkOutboundBandwidth'),
        ]
      }
    },
    methods: {
      getCondition: function () {
        let conditionList = []
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },
      getL3NetworkName (uuid) {
        let value = ''
        try {
          value = this.dbData.l3network[uuid].name
        } catch (e) {
          this.getResourceNames([uuid])
        }
        return value
      },
      getResourceNames (uuid) {
        let script = `tmp = call("org.zstack.header.vo.APIGetResourceNamesMsg", '{"uuids": ["${uuid}"]}').result.inventories
      put("name", tmp)`
        return rpc.query('batch-queries', {
          script: encodeURIComponent(script)
        }).then(resp => {
          if (resp.result.name.length > 0) {
            let obj = resp.result.name[0]
            obj.name = resp.result.name[0].resourceName
            this.updateDbRow({
              tableName: 'l3network',
              id: uuid,
              data: obj
            })
          }
        })
      },
      canOpenDetailPage (uuid) {
        let l3NetworkUuid = _.get(this.dbData.ip, [uuid, 'l3NetworkUuid'])
        if (!l3NetworkUuid) return false
        return !!_.get(this.dbData.l3network, [l3NetworkUuid, 'state'])
      },
      init () {
        let nicList = this.getNicList()
        let table = {}
        let self = this
        let _uuidList = nicList.map((item) => item.uuid)
        self.vmNicUuidList = _uuidList

        let searchConditionList = this.getCondition()
        if (searchConditionList.length > 0) {
          let searchName = searchConditionList[0].split('%25')[1]
          _uuidList = _.filter(_uuidList, (uuid) => {
            let name = this.dbData.vmNicRefs[uuid].internalName
            return name.indexOf(searchName) >= 0
          })
        }

        self.vmUuid = nicList.length > 0 ? nicList[0].vmInstanceUuid : ''
        _uuidList.forEach((uuid) => {
          table[uuid] = {
            selected: _.get(table, [uuid, 'selected']),
            expanded: _.get(table, [uuid, 'expanded'])
          }
        })
        let pageSize = this.windowData.pageSize
        let pageIndex = this.windowData.pageIndex
        let pageCount = Math.ceil(_uuidList.length / pageSize)
        let uuidList = _.chunk(_uuidList, pageSize)[pageIndex - 1]
        let ipList = _.flatten(nicList.map((item) => item.usedIps))
        return self.updateDbTable({
          tableName: 'ip',
          list: ipList
        }).then(() => {
          return self.updateDbTable({
            tableName: 'vmNicRefs',
            list: nicList
          })
        }).then(() => {
          return self.updateWindow({ uuidList, table, pageCount })
        })
          .then(() => {
            self.expandData(uuidList[0])
            return new Promise((resolve, reject) => { resolve() })
          })
          .then(() => self.queryQos(uuidList))
          .then(() => self.queryStaticIp(uuidList))
          .then(() => self.queryL3Network(uuidList))
      },
      queryQos: function (uuidList) {
        if (!this.dbData.common.isOpensource) {
          uuidList.forEach((uuid) => {
            rpc.query(`vm-instances/${uuid}/nic-qos`)
              .then((resp) => {
                let vmNic = _.cloneDeep(this.dbData.vmNicRefs[uuid])
                vmNic.inboundBandwidth = resp.inboundBandwidth
                vmNic.outboundBandwidth = resp.outboundBandwidth
                this.updateDbRow({
                  tableName: 'vmNicRefs',
                  id: uuid,
                  data: vmNic
                })
              })
          })
        }
      },
      queryL3Network: function (uuidList) {
        rpc.query(`l3-networks`, {
          q: `vmNic.uuid?=${uuidList}`
        }).then((resp) => {
          let l3network = _.cloneDeep(this.dbData.l3network)
          let list = []
          resp.inventories.forEach(item => {
            let _item = item
            if (l3network[item.uuid]) {
              _item = {
                ...l3network[item.uuid],
                ...item
              }
            }
            list.push(_item)
          })
          this.updateDbTable({
            tableName: 'l3network',
            list: list
          })
        })
      },
      queryStaticIp: function (uuidList) {
        rpc.query(`system-tags`, {
          q: [`resourceUuid=${this.windowData.dataUuid}`, 'resourceType=VmInstanceVO']
        })
          .then((resp) => {
            resp.inventories.forEach((item) => {
              if (item.tag.indexOf('staticIp::') > -1) {
                let l3NetworkUuid = item.tag.split('::')[1]
                for (let i = 0; i < uuidList.length; ++i) {
                  let vmNic = _.cloneDeep(this.dbData.vmNicRefs[uuidList[i]])
                  vmNic.usedIps.forEach((ip, index) => {
                    if (ip.l3NetworkUuid === l3NetworkUuid) {
                      let ipInventoy = _.cloneDeep(this.dbData.ip[ip.uuid])
                      ipInventoy.isStatic = true
                      this.updateDbRow({
                        tableName: 'ip',
                        id: ipInventoy.uuid,
                        data: ipInventoy
                      })
                    }
                  })
                }
              }
            })
          })
      },
      expandData (uuid, $event) {
        if ($event) $event.stopPropagation()
        let flag = this.windowData.table[uuid].expanded
        let table = {}
        let vmNicRefs = this.dbData.vmNicRefs[uuid]
        let children = vmNicRefs.usedIps.map((item) => item.uuid)
        let uuidList = _.cloneDeep(this.windowData.uuidList)
        if (flag) {
          _.remove(uuidList, it => _.includes(children, it))
        } else {
          uuidList = _.cloneDeep(this.vmNicUuidList)
          let index = _.findIndex(uuidList, id => id === uuid)
          uuidList.splice(index + 1, 0, children)
          uuidList = _.flatten(uuidList)
        }
        uuidList.forEach(uuid => {
          table[uuid] = {
            selected: true,
            expanded: false
          }
        })
        children.forEach(id => {
          table[id] = {
            selected: false
          }
        })
        table[uuid].expanded = !flag
        table[uuid].selected = this.windowData.table[uuid].selected
        if (table[uuid].selected) {
          children.forEach(id => {
            table[id].selected = true
          })
        }
        this.updateWindow({table, uuidList}).then(() => {
          this.$forceUpdate()
        })
      },
      close: function () {
        this.closeDialog(this.windowData.id)
        this.closePage()
      },
      ok () {
        if (!this.$data.selectedUuid) {
          this.$message('请选择网卡!');
          return
        }
        this.selectNicIP(this.$data.selectedUuid, this.dbData.ip[this.$data.selectedUuid].vmNicUuid)
        this.close()
      },
      select: function (uuid) {
        this.singleSelect(uuid)
        this.$data.selectedUuid = uuid
      },

      singleSelect: function (uuid) {
        let self = this;
        let table = _.cloneDeep(self.windowData.table)
        Object.keys(table).forEach((id) => {
          table[id].selected = false
        })
        table[uuid].selected = true
        self.updateWindow({
          table
        })
      },
      ...Utils
    },
    watch: {
      'windowData.pageSize': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.init()
      },
      'windowData.pageIndex': function (val, oldVal) {
        if (oldVal !== undefined && val !== oldVal) this.init()
      }
    }
  }
</script>

<style scoped>
  .table-header{
    display: inline-block;
    width: 100%;
    background: #e1e4e5;
  }

  [class^='table-td']{
    display: inline-block;
    width: 13%;
    height: 40px;
    line-height: 40px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  .table-td-0{
    width: 50px;
    height: 30px;
  }
  .table-row{
    border-bottom: 1px solid #eef3f7;
  }
</style>
