<template>
  <dialog-template width="1000px">
    <div slot="title" class="modal-plain-header">
      <span class="modal-title">{{$t('common.selectNetwork')}}</span>
      <span class="dialog-close el-icon-close" @click="cancel()"></span>
    </div>

    <div slot="body">
      <div style="padding: 20px 30px;">
        <div class="page-toolbar-container" style="display: flex">
          <div class="page-toolbar-left">
            <div class="tab-container">
              <span class="tab-item" :class="{'actived': currTab === 'private'}" @click="handleChangeTab('private')"
                    v-text="$t('common.privateNetwork')"></span>
              <span class="tab-item" :class="{'actived': currTab === 'public'}" @click="handleChangeTab('public')"
                    v-text="$t('common.publicNetwork')"></span>
            </div>
          </div>
          <div class="page-toolbar-center"></div>
          <div class="page-toolbar-right">
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
          </div>
        </div>

        <div class="page-table">
          <mh-table :data-source="dataSource"></mh-table>
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
    </div>

    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirm">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import List from 'src/vcenter/vCenterNetWork/List';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import _ from 'lodash'

  export default {
    name: "vCenterPrivateAndPublicMultiSelectListConfirmDlg",
    mixins: [MultiSelectList, WindowBase, List],
    data() {
      let self = this;
      return {
        currTab: 'private',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        selectVal: 'name',
        searchStr: '',
        itemList: [],
        dataSource: {
          getItemList: () => self.itemList,
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
              getContent: item => self.getField('category', item),
              getHeaderContent: self.$t('common.networkType'),
              field: 'category'
            },
            {
              getContent: item => self.getField('vCenter', item),
              getHeaderContent: 'vCenter',
              field: 'vCenter'
            },
            {
              getContent: item => self.getField('current', item),
              getHeaderContent: self.$t('l3network.current'),
              field: 'current'
            },
            {
              getContent: item => self.getField('cidr', item),
              getHeaderContent: 'CIDR',
              field: 'cidr'
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

    created() {
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: []
      }).then(() => {
        self.queryList();
      })
    },


    methods: {

      ...Utils,

      getField(field, item) {
        let self = this;
        if (_.isUndefined(item)) return ''
        let normalFields = ['name']
        if (_.includes(normalFields, field)) return item[field];
        if (field === 'category') return self.$t(`common.${self.dbData.l3network[item.uuid].category}`);
        if (field === 'vCenter') return self.dbData.l3networkA[item.uuid] &&
          self.dbData.l3networkA[item.uuid].vCenterUuid && self.dbData.vCenters[self.dbData.l3networkA[item.uuid].vCenterUuid]
          && self.dbData.vCenters[self.dbData.l3networkA[item.uuid].vCenterUuid].name
        if (field === 'current') return `${self.dbData.l3network[item.uuid]
        && self.dbData.l3network[item.uuid].availableCapacity}
        / ${self.dbData.l3network[item.uuid] && self.dbData.l3network[item.uuid].totalCapacity}`;
        if (field === 'createDate') return self.formatDatetime(new Date(item[field]));
        if (field === 'cidr') return self.dbData.l3network[item.uuid].ipRanges.length > 0
          ? self.dbData.l3network[item.uuid].ipRanges[0].networkCidr : void 0;
      },

      handleChangeTab(name) {
        let self = this;
        if (name === self.currTab) return;
        self.itemList = [];
        self.currTab = name;
        self.updateWindow({
          pageIndex: 1,
          pageSize: 5,
          sortBy: 'createDate',
          sortDirection: '-'
        }).then(() => {
          self.queryList();
        })
      },

      getCondition() {
        let conditionList = []
        switch (this.currTab) {
          case 'private':
            conditionList = ['category=Private', 'type=L3BasicNetwork']
            break
          case 'public':
            conditionList = ['category=Public', 'type=L3BasicNetwork']
            break
        }
        conditionList.push(`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
        conditionList = conditionList.concat(this.dialogData.param.conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },

      confirm(){
         let self = this;
         if(!self.isSelected){
           self.$message('您还没有选择资源')
           return;
         }
         self.dialogData.param.select(self.selectedList);
         self.cancel();
      },

      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      }
    }
  }
</script>

<style scoped>
  .tab-container {
    display: inline-block;
    border: 1px solid #39f;
    border-radius: 2px;
    cursor: pointer;
  }

  .tab-item {
    display: inline-block;
    padding: 8px 20px;
    text-align: center;
  }

  .actived {
    background: #39f;
    color: #fff;
  }
</style>
