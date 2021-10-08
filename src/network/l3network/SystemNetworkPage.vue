<template>
    <page-template>
      <div slot="page-header" style="height: 60px; line-height: 60px;">
        <el-row :gutter="10">
          <el-col :span="2">
            <span class="page-header-title">{{ $t(`common.systemnetwork`) }}</span>
          </el-col>
          <el-col :span="2.2">
            <el-tabs>
              <el-tab-pane :label="`${$t('common.available')}(${windowData.availableCount ? windowData.availableCount : '0'})`"  v-if="dbData.common.isAdmin"></el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
      </div>
      <div slot="page-toolbar" class="page-toolbar-container">
        <el-row type="flex" justify="space-between">
          <div style="flex-shrink: 0;">
            <span class="btn-success" @click="updateWindow({ currItemUuid: '' }); openCreateSystemNetwork()"><i class="el-icon-plus icon"></i>{{$t('common.createSystemNetwork')}}</span>

            <drop-down class="btn-primary more dropdown" :class="{'disabled': !isSelected || windowData.currItemUuid !== ''}" :enabled="isSelected && windowData.currItemUuid === ''">
            <span slot="title">
               <i class="el-icon-more"></i>
               <span class="text">{{ $t("common.moreActions") }}</span>
            </span>
              <span slot="content">
              <transition name="fade" type="transition" mode="out-in">
                <div class="dropdown-content" style="padding: 4px 20px;">
                  <a id="common-addIpRange" style="padding-top:12px;" @click="isSingleSelected && pageAddIpRange()" :class="{ 'disabled-text': !isSingleSelected}">{{ $t("common.addIpRange") }}</a>
                  <a id="common-shareToAll" v-permission="'LICENSE_BASIC_PAID'" @click="isSelected && hasNotSharedToAll() && pageShareSystemNetworkToAll()" :class="{ 'disabled-text': !isSelected || !hasNotSharedToAll()}">{{$t("common.shareToAll")}}</a>
                  <a id="common-recallFromAll" v-permission="'LICENSE_BASIC_PAID'" @click="isSelected && hasSharedToAll() && pageRecallSystemNetworkFromAll()" :class="{ 'disabled-text': !isSelected || !hasSharedToAll()}">{{$t("common.recallFromAll")}}</a>
                  <a id="common-destroy" style="padding-bottom:12px;" @click="pageDelete()">{{$t("common.destroy")}}</a>
                </div>
              </transition>
            </span>
            </drop-down>
          </div>
          <div style="text-align: right;flex-shrink: 0;">
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
        </el-row>
      </div>


      <div slot="page-table-content" style="max-height: 400px;">
        <el-table
          ref="multipleTable"
          :data="itemList"
          tooltip-effect="dark"
          style="width: 100%"
          @selection-change="handleSelect"
          v-loading="windowData.loading"
          @sort-change="handleSort"
        >
          <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
          </span>
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            :label="$t('common.name')"
            prop="name"
          >
            <template slot-scope="scope">
              <a class="link" @click="$router.push({name:'detailSystemNetwork', params: {uuid: scope.row.uuid}})">{{scope.row.name}}</a>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.networkType')"
            prop=""
          >
            <template slot-scope="scope">
              {{$t('common.systemNetwork')}}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('l3network.current')"
            prop=""
          >
            <template slot-scope="scope" v-if="dbData.l3network[scope.row.uuid].availableCapacity !== undefined">
              {{`${dbData.l3network[scope.row.uuid] && dbData.l3network[scope.row.uuid].availableCapacity} / ${dbData.l3network[scope.row.uuid] && dbData.l3network[scope.row.uuid].totalCapacity}`}}
            </template>
            <template slot-scope="scope" v-else>
              0
            </template>
          </el-table-column>

          <el-table-column
            label="CIDR"
            prop="networkCidr"
          >
            <template slot-scope="scope">
              {{dbData.l3network[scope.row.uuid].ipRanges.length > 0 ? dbData.l3network[scope.row.uuid].ipRanges[0].networkCidr : void 0}}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.createDate')"
            prop="createDate">
            <template slot-scope="scope">
              {{formatDatetime(new Date(scope.row.createDate))}}
            </template>
          </el-table-column>
        </el-table>
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
          <add-ip-range-dlg v-if="showIpRangeDlg" :param="ipRangeMessage" @close="closeIpRange"></add-ip-range-dlg>
        </div>
      </div>
    </page-template>
</template>

<script>
  import List from 'src/network/l3network/List'
  import PageTemplate from "../../component/PageTemplate";
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import Root from 'src/windows/Root';
  import rpc from 'src/utils/rpc';
  import AddIpRangeDlg from 'src/network/l3network/component/AddIPRange'

  export default {
    name: "SystemNetworkPage",
    mixins: [Root,WindowBase,List, PageBase],
    components: {PageTemplate,AddIpRangeDlg},
    created: function () {
      return this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        currItemUuid: '',
        sortBy: 'createDate',
        selectUuidList: [],
        sortDirection: '-',
        loading: false,
        methods: {
          queryList: this.init
        }
      }).then(() => {
        return this.init()
      })
    },
    computed:{
      isSelected(){
        let self = this;
        return self.windowData && self.windowData.selectUuidList.length >=1;
      },
      selectedList(){
        let self = this;
        return self.windowData && self.windowData.selectUuidList;
      },
      isSingleSelected(){
        let self = this;
        return self.windowData && self.windowData.selectUuidList.length ===1;
      }
    },
    destroyed: function () {
      this.deleteCurrAssistant(this.windowData.id)
    },
    data () {
      return {
        showIpRangeDlg:false,
        ipRangeMessage:{},
        networkUuidList: [],
        l2NetworkUuidList: [],
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
        searchStr: "",
        selectVal: 'name',
        itemList:[]
      }

    },
    methods: {
      closeIpRange(){
        this.showIpRangeDlg = false;
      },
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        }).then(() => {
          self.queryList()
        })
      },
      refresh(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        }).then(() => {

          self.queryList();
        })
      },
      handleSort(e){
        if(e.order === 'ascending'){
          this.updateWindow({
            sortBy: e.prop,
            sortDirection: '+'
          })
        }else{
          this.updateWindow({
            sortBy: e.prop,
            sortDirection: '-'
          })
        }
        this.queryList();
      },
      getCondition: function () {
        let conditionList = []
        conditionList.push(`uuid?=${this.networkUuidList.join()}`)
        conditionList.push(`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${this.searchStr}%25`)
        }
        return conditionList
      },
      init: function () {
        const self = this
        self.deleteAllAssistant()
        let privateNetworkUuidList = []
        let vCenterNetworkUuidList = []
        let l2NetworkUuidList = []
        let vCenterL2NetworkUuidList = []
        let taskList = []
        let zoneUuid = `zone.uuid=${window.localStorage.getItem('currZoneUuid')}`
        let p = rpc.query('l3-networks', {
          q: ['category=System', 'type=L3BasicNetwork', zoneUuid]
        }).then((resp) => {
          privateNetworkUuidList = privateNetworkUuidList.concat(resp.inventories.map(it => {
            return it.uuid
          }))
          l2NetworkUuidList = l2NetworkUuidList.concat(resp.inventories.map(it => it.l2NetworkUuid))
        })
        taskList.push(p)

        p = rpc.query('l3-networks', {
          q: [`l2Network.cluster.type=vmware`, 'category=System', 'type=L3BasicNetwork', zoneUuid],
          fields: 'uuid'
        }).then((resp) => {
          vCenterNetworkUuidList = vCenterNetworkUuidList.concat(resp.inventories.map(it => {
            return it.uuid
          }))
          vCenterL2NetworkUuidList = vCenterL2NetworkUuidList.concat(resp.inventories.map(it => it.l2NetworkUuid))
        })
        taskList.push(p)
        Promise.all(taskList).then(() => {
          privateNetworkUuidList = _.difference(privateNetworkUuidList, vCenterNetworkUuidList)
          self.networkUuidList = privateNetworkUuidList
          self.l2NetworkUuidList = _.difference(l2NetworkUuidList, vCenterL2NetworkUuidList)
          return self.queryList().then(() => {
            return self.queryForAssistant()
          })
        })
      },
      queryForAssistant () {
        let self = this
        let zoneUuid = `zone.uuid=${localStorage.getItem('currZoneUuid')}`
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${this.genUniqueId()}`
          self.createAssistant({
            id,
            operation,
            title: 'publicNetTitle',
            ownerId: self.windowData.id,
            content: `lackOf${resourceName}`,
            handler: () => {
              self.openFullMainWindow(`Create${resourceName}Dlg`,
                {
                  ok: (param) => {
                    self[`create${resourceName}`](param)
                      .then(() => {
                        self.queryForAssistant()
                      })
                  },
                  cancel: () => {
                    self.queryForAssistant()
                  }
                }
              )
            }
          })
        }
        let l2Path = 'l2-networks'
        if (!this.dbData.common.isAdmin) {
          l2Path = 'l2-networks/vxlan'
        }
        rpc.query(l2Path, {count: true, q: [zoneUuid, `uuid!?=${this.$data.vmwareL2NetworkList}`, 'type!=VxlanNetworkPool']}).then(resp => {
          if (resp.total === 0) newAssistant('L2Network', 'create')
        })
      },
      openCreateSystemNetwork: function () {
        this.$router.push('createsystemnetwork');
      },
      pageRecallSystemNetworkFromAll: function () {
        let self = this
        let uuidList = this.getSharedToAllList()
        if (uuidList.length > 0) {
          self.openDialog('ConfirmDlg',{
            title: 'common.recallFromAll',
            description: 'account.recall',
            uuidList:uuidList,
            icon: 'vm_plain',
            ok: () => {
              this.recallFromAll(uuidList)
            },
            getName: (uuid) => {
              return self.dbData.l3network[uuid].name;
            }
          })
        }
      },
      pageShareSystemNetworkToAll: function () {
        const self = this
        if (!self.isSelected || self.selectedList.length <= 0) return false
        let uuidList = self.selectedList

        self.openDialog('ConfirmDlg',{
          title: 'common.shareToAll',
          uuidList:uuidList,
          description: 'instanceOffering.shareToAllText',
          icon: 'vm_plain',
          ok: () => {
            this.shareL3NetworkToAll(uuidList)
          },
          getName: (uuid) => {
            return self.dbData.l3network[uuid].name;
          }
        })

      },
      pageStart: function () {
        let uuidList = []
        this.windowData.uuidList.forEach((uuid) => {
          if (this.windowData.table[uuid].selected) uuidList.push(uuid)
        })
        if (uuidList.length > 0) this.start(uuidList)
      },
      handleSelect(rows){
        let self = this, uuidList = [];
        uuidList = rows.map((item) => {
          return item.uuid;
        });
        self.updateWindow({
          selectUuidList: uuidList
        })
      },
      pageStop: function () {
        let uuidList = []
        this.windowData.uuidList.forEach((uuid) => {
          if (this.windowData.table[uuid].selected) uuidList.push(uuid)
        })
        if (uuidList.length > 0) this.stop(uuidList)
      },
      refresh: function (uuid) {
        this.updateWindow({
          currItemUuid: ''
        })
        this.queryList()
      },
      pageSizeChange(val) {
        this.updateWindow({
          pageSize: val,
          pageIndex: 1,
        })
      },
      pageCurrentChange(val) {
        this.updateWindow({
          pageIndex: val
        })
      }
    },
    watch: {
      'dbData.l3network': function (conditions, oldConditions) {
        setTimeout(this.resizeHeader, 0)
      }
    },
    filters: {


    }
  }
</script>

<style scoped>

</style>
