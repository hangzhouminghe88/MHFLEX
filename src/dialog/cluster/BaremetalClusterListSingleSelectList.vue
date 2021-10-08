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
  import  MultiSelectList from 'src/windows/Base/MultiSelectList';
  import { formatDatetime } from 'src/utils/utils';
  import ClusterList from 'src/om/cluster/List';
  import PageBase from 'src/windows/PageBase';
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';


  export default {

    name: "L2networkKvmClusterAndBaremetalClusterTabList",

    mixins: [MultiSelectList, PageBase, WindowBase, ClusterList],

    data() {
      let self = this;
      return {
        selectVal: 'name',
        searchStr: '',
        itemList: [],
        currSelectTab: 'KVM',
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
        templateRadio: '',
        dataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          handSingleSelect: self.handleSingleSelect,
          templateRadio: () => self.templateRadio,
          type: 'radio',
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              sortable: true,
              tooltip: true,
              field: 'name',
            },
            {
              getContent: item => self.getField('hypervisorType', item),
              getHeaderContent: self.$t('common.hypervisorType'),
              sortable: true,
              tooltip: true,
              field: 'hypervisorType',
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate',
              sortable: true,
              tooltip: true,
            }
          ]
        }
      }
    },

    methods: {
      queryForAssistant () {
        let self = this
        let newAssistant = (resourceName, operation) => {
          let id = `assistant-${self.genUniqueId()}`
          let title = 'attachCluster'
          let handler = () => {
            self.$router.push({name: 'createCluster'});
            self.deleteAllAssistant();
            self.close();
          }
          if (resourceName === 'BaremetalCluster') {
            title = 'attachBaremetalCluster'
            handler = () => {
              self.openDialog('CreateBaremetalClusterDlg',{
                ok:(param) => {
                  self.createBaremetalCluster(param)
                    .then(() => {
                      self.queryList()
                      self.queryForAssistant()
                    })
                }
              })
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
        let self = this, normalFields = ['name', 'hypervisorType'];
        if(_.includes(normalFields, field)) return item[field];
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
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

      handleSingleSelect(rows) {
        let self = this;
        self.templateRadio = rows.uuid;
      },

      confirm() {
        let self = this;
        self.dialogData.param.select(self.templateRadio);
        self.close();
      },

      close() {
        let self = this;
        self.closeDialog(self.windowId);
      }
    },

    destroyed() {
      let self = this;
      self.deleteAllAssistant();
      self.close();
    },

    created() {
      let self = this
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
      }).then(() => {
        this.deleteCurrAssistant(this.windowData.id)
        if (!this.dialogData.param.noAssistant) {
          this.queryForAssistant()
        }
      })
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
