<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">{{$t('common.selectVmInstance')}}</span>
      <span class="dialog-close el-icon-close" @click="cancel"></span>
    </div>

    <div slot="body">
      <div style="padding: 10px 20px">
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
          <mh-table :data-source="dataSource"></mh-table>
          <div class="page-table-pagination">
            <el-pagination v-if="windowData.availableCount > 0"
                           :page-sizes="[5, 10]"
                           :page-size="5"
                           :total="windowData.availableCount"
                           class="page-table-pagination"
                           layout="total, sizes, prev, pager, next"
                           @current-change="pageCurrentChange"
                           @size-change="pageSizeChange"
                           :current-page="windowData.pageIndex"></el-pagination>
          </div>
        </div>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="cancel">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  import _ from 'lodash';

  export default {
    name: "PortForwardingVmNicSingleSelect",
    mixins: [WindowBase, MultiSelectList],
    data(){
      let self = this;
      return {
        selectVal: 'vmInstance.name',
        searchStr:'',
        conditionNameList: [
          {name: 'common.name', value: 'vmInstance.name'},
          {name: 'common.ip', value: 'ip'}
        ],
        type:'radio',
        itemList: [],
        templateRadio: '',
        dataSource:{
          getItemList: () => self.itemList,
          handSingleSelect: self.select,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'radio',
          templateRadio: () => self.templateRadio,
          fields: [
            {
              getContent: item => self.getField('vm', item),
              getHeaderContent: self.$t('common.vm'),
              sortable: true
            },
            {
              getContent: item => self.getField('internalName', item),
              getHeaderContent: self.$t('common.nicName'),
            },
            {
              getContent: item => self.getField('ip', item),
              getHeaderContent: 'IP',
              sortable: true
            }
          ]
        }
      }
    },

    created(){
      let self = this;
      self.type = self.dialogData.param.type ?  self.dialogData.param.type : 'radio';
      let nicList = []
      let taskList = []
      if (this.dialogData.param.portForwardingUuid) {
        let dataUuid = this.dialogData.param.portForwardingUuid
        this.updateWindow({ dataUuid })
        let p = rpc.query(`port-forwarding/${this.windowData.dataUuid}/vm-instances/candidate-nics`)
          .then((resp) => {
            nicList = nicList.concat(resp.inventories)
          })
        taskList.push(p)
        Promise.all(taskList).then(() => {
          _.uniqBy(nicList, 'uuid')
          this.vmNicList = nicList
          this.updateWindow({
            pageIndex: 1,
            pageCount: 1,
            pageSize: 20,
            sortBy: 'createDate',
            sortDirection: '-',
            currItemUuid: '',
            methods: {
              queryList: this.queryList
            }
          }).then(() => this.queryList())
        })
      }
    },

    methods: {
      getField(field, item){
        let self = this;
        if(_.isUndefined(item)) return '';
        let normalFields = ['ip', 'internalName'];
        if(_.includes(normalFields, field)) return item[field];
        if(field === 'vm') return self.dbData.vm[self.dbData.vmNicRefs[item.uuid].vmInstanceUuid] && self.dbData.vm[self.dbData.vmNicRefs[item.uuid].vmInstanceUuid].name;
      },


      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },

      getCondition () {
        let conditionList = []
        if(this.vmNicList && this.vmNicList.length > 0)
        conditionList.push(`uuid?=${this.vmNicList.map(it => it.uuid).join()}`)
        conditionList.push('vmInstance.type=UserVm')
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      queryList: function () {
        let vmNicInventories
        let uuidList
        let table = {}
        let vmUuidList
        rpc.query('vm-instances/nics', {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          replyWithCount: true,
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`,
          q: this.getCondition()
        })
          .then((resp) => {
            this.updateWindow({
              pageCount: resp.total === 0 ? 1 : resp.total === 0 ? 1 : Math.ceil(resp.total / this.windowData.pageSize),
              availableCount: resp.total
            })
            vmNicInventories = resp.inventories
            uuidList = vmNicInventories.map((item) => item.uuid)
            uuidList.forEach((uuid) => {
              table[uuid] = {
                selected: false
              }
            })
            vmUuidList = _.uniq(vmNicInventories.map((item) => item.vmInstanceUuid))
            return rpc.queryResourceNames(this, 'vm', vmUuidList)
          })
          .then(() => {
            this.updateWindow({ uuidList, table })
            return this.updateDbTable({
              tableName: 'vmNicRefs',
              list: vmNicInventories
            })
          }).then(() => {
          return rpc.query('vm-instances', {
            q: `uuid?=${vmUuidList}`
          })
        }).then((resp) => {
          this.updateDbTable({
            tableName: 'vm',
            list: resp.inventories
          }).then(() => {
            this.itemList = this.getItemList();
          })
        })
      },

      getItemList(){
        let self = this;
        return self.windowData.uuidList.map((uuid) => {
          return self.dbData.vmNicRefs[uuid];
        })
      },

      confirm() {
        let vmUuidList = [], self = this;
        if(self.dialogData.param.select && self.dialogData.param.type === 'radio'){
          vmUuidList.push( self.templateRadio)
          if (!self.templateRadio) return
          this.dialogData.param.select(vmUuidList)
          this.cancel()
        }
        if(self.dialogData.param.select && self.dialogData.param.type === 'selection'){
          vmUuidList.push( self.selectedList)
          if (!self.selectedList) return
          this.dialogData.param.select(vmUuidList)
          this.cancel()
        }
      },
      select(row) {
        let self = this;
        self.templateRadio = row.uuid;
      },
      ...Utils
    }
  }
</script>

<style scoped>

</style>
