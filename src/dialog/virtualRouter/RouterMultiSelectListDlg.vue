<template>
  <dialog-template width="1000px">
    <div slot="title" class="modal-plain-header">
      <span>选择云路由器</span>
      <span class="el-icon-close dialog-close" @click="close()"></span>
    </div>
    <div slot="body">
      <div style="padding: 30px;">
        <div class="page-toolbar-container" style="display: flex">
          <div class="page-toolbar-left">
            <div class="tab-container" v-if="dialogData.param.showTab">
              <div class="tab-item" :class="{'is-active': windowData.currSelectTab === 'virtualRouter'}" @click="changeCurrTab('virtualRouter')" v-text="$t('common.virtualRouter')"></div>
              <div class="tab-item" :class="{'is-active': windowData.currSelectTab === 'vpcVRouter'}" @click="changeCurrTab('vpcVRouter')" v-text="$t('common.vpcVRouter')"></div>
            </div>
          </div>
          <div class="page-toolbar-center"></div>
          <div class="page-toolbar-right">
            <span style="padding: 0 15px;display: inline-block;position: relative;">
            <el-input @blur="search()" @change="search()" placeholder="请输入内容" v-model="searchStr">
               <el-select placeholder="请选择" slot="prepend" style="width: 100px" v-model="selectVal">
                   <el-option :key="index" :label="$t(`${item.name}`)" :value="item.value"
                              v-for="(item, index ) in conditionNameList"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
          </div>
        </div>
        <mh-table :data-source="dataSource"></mh-table>
        <el-pagination v-if="windowData.total > 0"
                       :current-page="windowData.pageIndex"
                       :page-size="5"
                       :page-sizes="[5, 10]"
                       :total="windowData.total"
                       @current-change="pageCurrentChange"
                       @size-change="pageSizeChange"
                       class="page-table-pagination"
                       layout="total, sizes, prev, pager, next"></el-pagination>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="select()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel"  @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import VirtualRouterList from 'src/network/virtualRouter/List';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import _ from 'lodash'

  export default {
    name: "RouterMultiSelectListDlg",
    mixins: [MultiSelectList, WindowBase, VirtualRouterList],
    data() {
      let self = this;
      return {
        itemList:[],
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value:  'uuid'}
        ],
        dataSource: {
          getItemList: () =>  self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              field: 'name'
            },
            {
              getContent: item => self.getField('defaultIp', item),
              getHeaderContent: self.$t('common.defaultIp'),
              field: 'defaultIp'
            },
            {
              getContent: item => self.getField('hostIp', item),
              getHeaderContent: self.$t('common.hostIp'),
              field: 'hostIp'
            },
            {
              getContent: item => self.getField('hypervisor', item),
              getHeaderContent: self.$t('common.hypervisor'),
              field: 'hypervisor'
            },
            {
              getContent: item => self.getField('cluster', item),
              getHeaderContent: self.$t('common.cluster'),
              field: 'cluster'
            },
            {
              getContent: item => self.getField('state', item),
              getHeaderContent: self.$t('common.state'),
              field: 'state'
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate'
            }
          ]
        }
      }
    },

    created(){
      let selectedItems = {
        virtualRouter: [],
        vpcVRouter: []
      }, self = this, currSelectTab = 'virtualRouter';
      if(self.dialogData.param.currTab){
        currSelectTab = self.dialogData.param.currTab
      }
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-',
        currSelectTab: currSelectTab,
        selectedItems,
        selectedUuidList: [],
        methods: {
          queryList: this.queryList
        }
      }).then(() => this.queryList())
    },

    methods: {
      changeCurrTab(tabName){
        let self = this;
        if (self.windowData.currSelectTab !== tabName) {
          let selectedItems = _.cloneDeep(self.windowData.selectedItems)
          selectedItems[this.windowData.currSelectTab] = self.selectedList
          self.updateWindow({
            currItemUuid: '',
            currSelectTab: tabName,
            pageIndex: 1,
            pageCount: 1,
            pageSize: 20,
            selectedItems,
            sortBy: 'createDate',
            sortDirection: '-',
          })
          self.queryList().then(() => {
            debugger
            let table = _.cloneDeep(self.windowData.table)
            selectedItems[tabName].forEach(uuid => {
              if (table[uuid]) table[uuid].selected = true
            })
            self.updateWindow({ table })
          })
        }
      },

      getField(field, item){
        let self = this, normalFields = ['name', 'hypervisor', 'state'];
        if(_.isUndefined(item)) return '';
        if(_.includes(normalFields, field)) return item[field];
        if(field === 'defaultIp') return self.getVRouterDefaultIp(item.uuid)
        if(field === 'hostIp') return item.hostUuid ? self.dbData.host[item.hostUuid].managementIp : self.dbData.host[item.hostUuid].managementIp;
        if(field === 'cluster') return  self.dbData.cluster[item.clusterUuid].name;
        if(field === 'createDate') return self.formatDatetime(new Date(item.createDate));
      },

      //查询条件
      getCondition: function () {
        let conditionList = [], self = this;
        switch (this.windowData.currSelectTab) {
          case 'virtualRouter':
            conditionList = ['applianceVmType?=vrouter,VirtualRouter']
            break
          case 'vpcVRouter':
            conditionList = ['applianceVmType=vpcvrouter']
            break
        }
        if (this.dialogData.param.conditions && Array.isArray(this.dialogData.param.conditions)) {
          conditionList = conditionList.concat(this.dialogData.param.conditions)
        }
        if (self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25}`)
        }
        return conditionList
      },
      //关闭弹框
      close: function () {
        this.closeDialog(this.windowData.id)
      },
      //获得默认Ip
      getVRouterDefaultIp(uuid) {
        let vrouter = this.dbData.vm[uuid]
        if (!vrouter) return
        for (let i = 0; i < vrouter.vmNics.length; i++) {
          if (vrouter.defaultRouteL3NetworkUuid === vrouter.vmNics[i].l3NetworkUuid) {
            return vrouter.vmNics[i].ip
          }
        }
      },
      //单选
      handleSingleSelect(row){
        let self = this;
        self.templateRadio = row.uuid;
      },
      //点击确定回调
      select() {
        let selectedItems = _.cloneDeep(this.windowData.selectedItems)
        selectedItems[this.windowData.currSelectTab] = this.selectedList
        let selectedUuidList = []
        _.values(selectedItems).forEach(it => {
          selectedUuidList = selectedUuidList.concat(it)
        })
        if (selectedUuidList.length > 0) this.dialogData.param.select(selectedUuidList)
        this.close()
      },
      ...Utils
    }
  }
</script>

<style scoped>
  .tab-container{
    display: inline-flex;
    border: 1px solid #39f;
    border-radius: 2px;
    cursor: pointer;
  }

  .tab-item{
    padding: 5px 20px;
    border-radius: 2px;
  }

  .is-active{
    background: #39f;
    color: #fff;
  }
</style>
