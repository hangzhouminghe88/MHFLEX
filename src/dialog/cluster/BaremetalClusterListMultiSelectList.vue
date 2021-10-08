<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">{{$t('baremetalCluster.selectbaremetalCluster')}}</span>
      <span class="dialog-close el-icon-close" @click="close()"></span>
    </div>

    <div slot="body">
      <div style="padding:30px;overflow: hidden">
        <div slot="page-toolbar" class="page-toolbar-container" style="display: flex;">
          <div class="page-toolbar-left">
            <span class="title">
              <span class="tab-container" v-if="dialogData.param.showTab">
                <span class="tab-item" @click="changeCurrTab('KVM')" :class="{'is-active': currSelectTab === 'KVM'}">{{ $t('common.cluster') }}</span>
                <span class="tab-item" @click="changeCurrTab('baremetal')" :class="{'is-active': currSelectTab === 'baremetal'}">{{ $t('common.baremetalCluster') }}</span>
               </span>
              <span v-if="dialogData.param.showTab && !dialogData.param.showTab" class="title">{{$t('common.cluster') + $t('common.colon')}}</span>
            </span>
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
          </div>
        </div>

        <mh-table :data-source="dataSource"></mh-table>
        <el-pagination v-if="windowData.total > 0"
                       :page-sizes="[5, 10]"
                       :page-size="windowData.pageSize"
                       layout="total, sizes, prev, pager, next, jumper"
                       :total="windowData.total"
                       class="page-table-pagination"
                       @current-change="pageCurrentChange"
                       @size-change="pageSizeChange"
                       :current-page="windowData.pageIndex">
        </el-pagination>
      </div>
    </div>

    <div slot="footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import ClusterList from 'src/om/cluster/List';
  import { formatDatetime } from 'src/utils/utils';
  import PageBase from 'src/windows/PageBase';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import _ from 'lodash';

  export default {
    name: "BaremetalClusterListMultiSelectList",

    mixins: [MultiSelectList, PageBase, ClusterList, WindowBase],

    data() {
      let self = this;
      return {
        currSelectTab: 'KVM',
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        itemList: [],
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item =>  self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              sortable: true,
              tooltip: true,
              field: 'name'
            },
            {
              getContent: item =>  self.getField('hypervisorType', item),
              getHeaderContent: self.$t('common.hypervisorType'),
              sortable: true,
              tooltip: true,
              field: 'hypervisorType'
            },
            {
              getContent: item =>  self.getField('hostNum', item),
              getHeaderContent: self.$t('common.hostNum'),
              field: 'hostNum'
            },
            {
              getContent: item =>  self.getField('state', item),
              getHeaderContent: self.$t('common.state'),
              field: 'state'
            },
            {
              getContent: item =>  self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              sortable: true,
              tooltip: true,
              field: 'createDate'
            },
          ]
        }
      }
    },

    created() {
      let zoneUuid = localStorage.getItem('currZoneUuid')
      if (this.dialogData && this.dialogData.param && this.dialogData.param.zoneUuid) {
        zoneUuid = this.dialogData.param.zoneUuid
      }
      if(this.dialogData.param.conditions.includes('hypervisorType=baremetal')) {
        this.currSelectTab = 'baremetal'
      }
      this.updateWindow({
        sortBy: 'createDate',
        sortDirection: '-',
        zoneUuid,
        pageIndex: 1,
        pageSize: 5,
        selectedUuidList: [],
        methods: {
          queryList: this.queryList
        }
      }).then(() => this.queryList())
      if (!this.dialogData.param.noAssistant) {
        this.queryForAssistant()
      }
    },

    methods: {
      queryForAssistant () {
        let self = this
        this.deleteCurrAssistant(this.windowData.id)
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${self.genUniqueId()}`
          let title = 'attachCluster'
          let handler = () => {
            if (resourceName === 'BaremetalCluster') {
              self.openDialog('CreateBaremetalClusterDlg', {
                ok:(param) => {
                  self.createBaremetalCluster(param)
                    .then(() => {
                      self.queryList()
                      self.queryForAssistant()
                    })
                }
              })
            }else{
              self.$router.push({name: 'createCluster'})
            }
          }
          self.createAssistant({
            id,
            title,
            ownerId: self.windowData.id,
            operation,
            content: `lackOf${resourceName}`,
            handler
          })
        }
        if (this.currSelectTab === 'KVM') {
          rpc.query('clusters', {count: true, q: this.getCondition()}).then(resp => {
            if (resp.total === 0) newAssistant('Cluster', 'create')
          })
        } else {
          rpc.query('clusters', {count: true, q: this.getCondition()}).then(resp => {
            if (resp.total === 0) newAssistant('BaremetalCluster', 'create')
          })
        }
      },

      //创建裸金属cluster
      createBaremetalCluster(param) {
        const self = this
        let event = self.createEvent('cluster.action.create', param.name)
        return rpc.create('clusters', param, event).then(() => {
          self.incEventSuccess(event)
        }, () => {
          self.incEventFail(event)
        })
      },

      getField(field, item) {
        let self = this, normalFields = ['name', 'hypervisorType', 'state'];
        if(_.includes(normalFields, field)) return item[field];
        if(field === 'hostNum') return self.dbData.clusterA[item.uuid].hostNum;
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },

      getCondition() {
        let self = this, conditionList = [], conditions = '';
        conditions = self.dialogData.param.conditions ? self.dialogData.param.conditions : '';
        if(self.dialogData.param.conditions.includes('hypervisorType=baremetal')) {
          self.currSelectTab = 'baremetal'
        }
        conditionList = conditionList.concat(conditions);
        if(self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${self.searchStr}%25`);
        }
        if(self.currSelectTab) {
          conditionList.push(`hypervisorType=${self.currSelectTab}`);
        }
        return conditionList;
      },

      close() {
        let self = this;
        self.closeDialog(self.windowId);
      },

      confirm() {
        let self = this;
        self.dialogData.param.select(self.selectedList);
        self.close();
      },

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
    },

    beforeDestroy() {
      let self = this;
      self.deleteAllAssistant();
      self.close();
    }
  }
</script>

<style scoped>
.tab-container{
    border: 1px solid #409EFF;
    border-radius: 2px;
    display: inline-block;
    margin-right: 5px;
    cursor: pointer;
  }

  .tab-item{
    padding: 5px 20px;
    display: inline-block;
    border-radius: 2px;
  }

  .is-active{
    background: #409EFF;
    color: #fff;
  }
</style>
