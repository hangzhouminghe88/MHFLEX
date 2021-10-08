<template>
   <el-dialog :visible.async="visibled" @close="close()" width="900;">
     <span slot="title">
       选择三层网络
     </span>
       <div class="radio-group">
         <span class="radio-btn" :class="{'is-active': windowData.currTab === 'public'}"
               @click="changeCurrTab('public')">{{$t('common.publicNetwork')}}</span>
         <span class="radio-btn" :class="{'is-active': windowData.currTab === 'private'}"
               @click="changeCurrTab('private')">{{$t('common.privateNetwork')}}</span>
         <span class="radio-btn" v-if="ipType !== 'IPV6'" :class="{'is-active': windowData.currTab === 'vpc'}"
               @click="changeCurrTab('vpc')">VPC</span>
       </div>
     <div style="max-height: 450px; overflow-y: auto">
       <el-table v-if="ipType !==$t('common.doubleIPv4AndIPv6')"
         :data="l3networkListItem"
         v-loading="windowData.loading"
         :highlight-current-row="windowData.selectType!=='selection' ? true : false"
         @selection-change="handleSelectionChange"
         @row-click="handleSingleSelect">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
         <el-table-column
           width="100"
           :type="windowData.selectType === 'selection'? 'selection': ''"
           v-if="windowData.selectType === 'selection'">
         </el-table-column>
         <el-table-column
           width="100"
           v-if="windowData.selectType !== 'selection'">
           <template slot-scope="scope">
             <el-radio :label="scope.row.uuid" v-model="templateRadio">&nbsp</el-radio>
           </template>
         </el-table-column>
         <el-table-column
           :label="$t('common.name')"
           prop="name">
         </el-table-column>
         <el-table-column
           :label="$t('common.networkType')">
           <template slot-scope="scope">
             {{(scope.row.category === 'Public' || scope.row.category === 'System') ? $t(`common.${scope.row.category}`) : scope.row.networkServiceType ? $t(`l3network.type.${scope.row.networkServiceType}`) : ''}}
           </template>
         </el-table-column>
         <el-table-column
           :label="$t('l3network.current')">
           <template slot-scope="scope">
             {{scope.row.availableCapacity | getCurrent(scope.row.totalCapacity)}}
           </template>
         </el-table-column>
         <el-table-column
           label="CIDR">
           <template slot-scope="scope">
             {{dbData.l3network[scope.row.uuid].ipRanges.length > 0 ? dbData.l3network[scope.row.uuid].ipRanges[0].networkCidr : void 0}}
           </template>
         </el-table-column>
         <el-table-column
           :label="$t('common.ipVersion')">
           <template slot-scope="scope">
             {{scope.row.ipVersion === 4 ? 'IPV4': 'IPV6'}}
           </template>
         </el-table-column>
         <el-table-column
           :label="$t('common.createDate')">
           <template slot-scope="scope">
             {{formatDatetime(new Date(dbData.l3network[scope.row.uuid].createDate))}}
           </template>
         </el-table-column>
       </el-table>
       <el-pagination v-if="windowData.total > 0"
         :page-sizes="[5, 10]"
         :page-size="windowData.pageSize"
         :total="windowData.total"
         class="page-table-pagination"
         layout="total, sizes, prev, pager, next"
         @current-change="pageCurrentChange"
         @size-change="pageSizeChange"
         :current-page="windowData.pageIndex"></el-pagination>
     </div>
     <div slot="footer" class="dialog-footer">
       <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
       <span class="btn-cancel" @click="close">{{$t('common.cancel')}}</span>
     </div>
   </el-dialog>
</template>

<script>
  import L3NetWork from 'src/network/l3network/List';
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  import {mapGetters} from 'vuex'

  export default {
    name: "NetWorkSelectListConfirmDlg",
    mixins:[WindowBase, L3NetWork, Root],
    props: {
      ipType: {
        type: String,
        default: ''
      },
      model: {
        type: Boolean,
        default: false
      },
      message: {
        type: Object,
      }
    },
    data() {
      return{
        visibled: false,
        maxPCpuNum: 0,
        selectUuid: [],
        conditions: [],
        templateRadio: [],
        selectNetworkUuid: []
      }
    },
    computed:{
      ...mapGetters({
        getList: 'l3network/getList'
      }),
      l3networkListItem(){
       let self = this;
       return self.getList(self.windowData.uuidList)
      }
    },
    created(){
      this.updateWindow({
        networkUuidList: this.message.networkUuidList,
        imageUuid:"",
        loading: false,
        clusterUuid: '',
        primaryStorageUuid: '',
        hostUuid: '',
        sortBy: 'createDate',
        sortDirection: '-',
        vmNicConfigList: [],
        currTab: 'public',
        ipv6NetworkUuidList: this.message.ipv6NetworkUuidList,
        selectType: this.message.selectType,
        loading: false,
      })
    },
    mounted() {
      let self = this;
      this.visibled = this.model;
      if(self.ipType === 'IPV4')this.selectNetwork();
      if(self.ipType === 'IPV6')this.selectIpv6Network()
    },
    methods:{
      ...Utils,
      pageCurrentChange(val){
        this.updateWindow({
          pageIndex: val
        }).then(() => {
          this.queryList();
        })
      },
      pageSizeChange(val){
        this.updateWindow({
          pageSize:val
        })
          .then(() => {
            this.queryList();
          })
      },
      handleSingleSelect(row){
        if(this.windowData.selectType!=='selection'){
          this.selectNetworkUuid = [];
          this.templateRadio = row.uuid;
          this.selectNetworkUuid.push(row.uuid);
        }
      },
      close(){
        let self = this;
        self.visibled = false;
        this.$emit('setShowFlase');
      },
      confirm(){
        let self = this;
        if(this.windowData.selectType === 'selection'){
          if(self.selectUuid.length <=0 ) {
            this.$message('你还没有选择资源');
          }
          this.$emit('setShowFlase',self.selectUuid);
        }
        else(this.windowData.selectType !== 'selection');
        this.$emit('setShowFlase',self.selectNetworkUuid);
      },
      changeCurrTab(tabName){
        let self = this;
        if(this.windowData.currTab !== tabName){
          this.updateWindow({
            currTab: tabName
          }).then(()=>{
            if(self.ipType === 'IPV4')this.selectNetwork();
            if(self.ipType === 'IPV6')this.selectIpv6Network()
          })
        }
      },
      selectNetwork: function () {
        let self = this;
        this.conditions = [];
        let conditions = ['system=false', 'l2Network.cluster.type=zstack', `uuid!?=${self.windowData.networkUuidList}`, 'ipVersion=4'];
        if (self.windowData.imageUuid !== '') {
          rpc.query(`images-l3networks/dependencies`, {
            zoneUuid: localStorage.getItem('currZoneUuid'),
            imageUuid: self.windowData.imageUuid
          })
            .then((resp) => {
              if (resp.inventories.length > 0) {
                let uuidList = resp.inventories.map((item) => item.ipRanges.length && item.uuid);
                conditions.push(`uuid?=${uuidList}`)
              } else if (resp.inventories.length === 0) {
                conditions.push(`uuid?=${[]}`)
              }
              this.conditions = conditions;
              this.getCondition();
              self.queryList();
            }, () => {
              conditions.push(`uuid?=${[]}`);
              this.conditions = conditions;
              this.getCondition();
              self.queryList();
            })
        } else {
          let categories = ['Private', 'Public'];
          rpc.query('l3-networks', {q: [`category?=${categories}`, `zoneUuid=${localStorage.getItem('currZoneUuid')}`]}).then(resp => {
            if (resp.inventories.length > 0) {
              let uuidList = resp.inventories.map((item) => item.ipRanges.length && item.uuid);
              conditions.push(`uuid?=${uuidList}`)
            } else if (resp.inventories.length === 0) {
              conditions.push(`uuid?=${[]}`)
            }
            this.conditions = conditions;
            this.getCondition();
            self.queryList();
          })
        }
      },
      queryList(){
        let self = this;
        self.windowData.loading = true;
        return self
          .dispatchAction("l3network/query", {
            start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
            limit: self.windowData.pageSize,
            q: self.getCondition(),
            sortDirection: self.windowData.sortDirection,
            sortBy: self.windowData.sortBy,
            replyWithCount: true
          })
          .then(resp => {
            let uuidList = resp.uuidList;
            return self
              .updateWindow({
                uuidList,
                table: Utils.createTableObjFromUuidList(resp.uuidList),
                total: resp.total
              })
          }).then( () => {
             self.windowData.loading = false;
          });
      },
      getCondition () {
        let conditionList = [];
        switch (this.windowData.currTab) {
          case 'private':
            conditionList = ['category=Private', 'type=L3BasicNetwork'];
            break;
          case 'public':
            conditionList = ['category=Public', 'type=L3BasicNetwork'];
            break;
          case 'vpc':
            conditionList = ['category=Private', 'type=L3VpcNetwork', 'vmNic.uuid+not+null', 'vmNic.vmInstance.state=Running', 'vmNic.vmInstance.type=ApplianceVm'];
            break
        }
        conditionList.push(`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`);
        conditionList = conditionList.concat(this.conditions);
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          conditionList = conditionList.concat(this.windowData.searchConditionList)
        }
        return conditionList
      },
      selectIpv6Network: function () {
        let self = this;
        let conditions = ['system=false', 'l2Network.cluster.type=zstack', `uuid!?=${self.windowData.ipv6NetworkUuidList}`, 'ipVersion=6'];
        if (self.windowData.imageUuid !== '') {
          rpc.query(`images-l3networks/dependencies`, {
            zoneUuid: localStorage.getItem('currZoneUuid'),
            imageUuid: self.windowData.imageUuid
          })
            .then((resp) => {
              if (resp.inventories.length > 0) {
                let uuidList = resp.inventories.map((item) => item.ipRanges.length && item.uuid);
                conditions.push(`uuid?=${uuidList}`)
              } else if (resp.inventories.length === 0) {
                conditions.push(`uuid?=${[]}`);
                this.conditions = conditions;
                this.getCondition();
                self.queryList();
              }
            }, () => {
              conditions.push(`uuid?=${[]}`);
              this.conditions = conditions;
              this.getCondition();
              self.queryList();
            })
        } else {
          let categories = ['Private', 'Public'];
          rpc.query('l3-networks', {q: [`category?=${categories}`, `zoneUuid=${localStorage.getItem('currZoneUuid')}`]}).then(resp => {
            if (resp.inventories.length > 0) {
              let uuidList = resp.inventories.map((item) => item.ipRanges.length && item.uuid);
              conditions.push(`uuid?=${uuidList}`);
              this.conditions = conditions;
              this.getCondition();
              self.queryList();
            } else if (resp.inventories.length === 0) {
              conditions.push(`uuid?=${[]}`);
              this.conditions = conditions;
              this.getCondition();
              self.queryList();
            }
          })
        }
      },
      handleSelectionChange(row){
        this.selectUuid = row.map(item => {return item.uuid})
      }
    },
    filters: {
      getCurrent(availableCount, totalableCount){
        if(!availableCount || !totalableCount) return;
        return `${availableCount}/${totalableCount}`;
      }
    },
    watch: {
      ipType(newVal, oldVal){
        if(newVal === 'IPV4') this.selectNetwork();
        if(newVal === 'IPV6') this.selectIpv6Network();
      },
      model(newVal, oldVal){
        if(newVal !== oldVal){
          this.visibled = newVal;
        }
      }
    }
  }
</script>

<style scoped>
  .radio-group{
    display: inline-block;
    border-radius: 3px;
    cursor: pointer;
    transition: all ease-out 0.5s;
    margin-right: 20px;
    background-color: #e9edfa;
    margin-left:0;
  }
  .radio-btn{
    display: inline-block;
    padding: 10px 20px;
    font-size: 12px;
    border: none;
    margin: 0px;
  }
  .is-active{
    background-color: #5e7ce0!important;
    transition: background-color cubic-bezier(0.5, 0.8, 0.5, 1) 0.5s,
      background-color ease-in 0.5s;
    color: #fff;
  }
</style>
