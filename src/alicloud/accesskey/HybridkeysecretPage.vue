<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="12">
        <el-col :span="2.2" class="page-header-title">{{$t('common.accesskey')}}</el-col>
        <el-col :span="2.2">
          <el-tabs v-model="windowData.currTab"
                   @tab-click="handleChangeTab"
          >
            <el-tab-pane :label = "$t('hybridKeySecret.aliyun') +
                         `(${windowData.aliyunCount ? windowData.aliyunCount : '0'})`"
                         name = "aliyun"
            ></el-tab-pane>
            <!-- <el-tab-pane :label = "$t('hybridKeySecret.daho') +
                         `(${windowData.dahoCount ? windowData.dahoCount : '0'})`"
                         name = "daho"
            ></el-tab-pane> -->
          </el-tabs>
        </el-col>
      </el-row>
    </div>

    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-left">
          <span class="btn-success" @click="goToCreate()">
            <i class="el-icon-plus icon"></i>
            <span class="text">{{$t('hybridKey.AddAliyunAccessKey')}}</span>
          </span>
          <drop-down class="btn-primary more dropdown" :enabled="isSelected"
                     :class="{'disabled': !isSelected}"
          >
            <span slot="title">
              <i class="el-icon-more"></i>
              <span class="text">{{$t('common.moreActions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a style="padding-top: 12px;" :class="{'disabled-text': !isSingleSelected || isDefault()}"
                   @click="isSingleSelected && !isDefault() && pageAttach()"
                >{{$t('common.setDefault')}}</a>
                <a :class="{'disabled-text': !isSingleSelected || !isDefault()}"
                   @click="isSingleSelected && isDefault() && pageDetach()">{{$t('common.cancelDefault')}}</a>
                <a @click="pageDelete(windowData.currTab)" style="padding-bottom: 12px;">{{$t("common.destroy")}}</a>
              </div>
            </span>
          </drop-down>
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
          <span @click="refresh()" class="btn-refresh">
            <i class="el-icon-refresh icon"></i>
          </span>
        </div>
      </el-row>
    </div>

    <div slot="page-table-content" class="page-body">
      <mh-table :data-source="dataSource" v-if="windowData.currTab === 'aliyun'"></mh-table>
      <mh-table :data-source="dahoDataSource" v-if="windowData.currTab ===  'daho'"></mh-table>
      <el-pagination v-if="total > 0"
                     :page-sizes="[10, 20, 50, 100]"
                     :page-size="windowData.pageSize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total"
                     class="page-table-pagination"
                     @current-change="pageCurrentChange"
                     @size-change="pageSizeChange"
                     :current-page="windowData.pageIndex">
      </el-pagination>
    </div>

  </page-template>
</template>

<script>
  import { checkAccessKey } from  'src/alicloud/accesskey/Assistant/AccessKeyAssistant';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import PageTemplate from "src/component/PageTemplate";
  import List from 'src/alicloud/accesskey/List';
  import WindowBase from 'src/windows/Window';
  import { formatDatetime } from 'src/utils/utils';
  import _ from 'lodash'

  export default {
    name: "HybridkeysecretPage",

    components: {
      PageTemplate,
    },

    mixins: [WindowBase, MultiSelectList, List],

    created () {
      let self = this, currTab = 'aliyun';
      if(self.$route.params.type) currTab = self.$route.params.type;
      else currTab ='aliyun';
      self.updateWindow({
        pageIndex:  1,
        pageSize: 10,
        currTab: currTab,
        selectedUuidList: [],
        sortBy: 'createDate',
        sortDirection: '-'
      }).then( () => {
        checkAccessKey('aliyun', self);
        self.queryList();
      })
    },

    data () {
      let self = this;
      return {
        selectVal: 'name',
        searchStr:  '',
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
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              className: 'link',
              onClick: (item) => {
                self.$router.push({name: 'detailHybridKeySecret', params: {uuid: item.uuid, type: 'aliyun'}})
              },
              field: 'name'
            },
            {
              getContent: item => self.getField('akey', item),
              getHeaderContent: self.$t('hybridKey.AccessKeyID'),
              field: 'akey'
            },
            {
              getContent: item => self.getField('hybridAccountId', item),
              getHeaderContent: self.$t('hybridKey.hybridAccountId'),
              field: 'hybridAccountId',
              sortable: true,
            },
            {
              getContent: item => self.getField('hybridUserName', item),
              getHeaderContent: self.$t('hybridKey.hybridUserName')
            },
            {
              getContent: item => self.getField('default', item),
              getHeaderContent: self.$t('common.default')
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate',
              sortable: true
            }
          ]
        },
        dahoDataSource: {
          getItemList: () => self.itemList,
          handleSelection: self.handleSelect,
          handleSort: self.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              className: 'link',
              onClick: (item) => {
                self.$router.push({name: 'detailHybridKeySecret', params: {uuid: item.uuid, type: 'daho'}})
              },
              field: 'name'
            },
            {
              getContent: item => self.getField('akey', item),
              getHeaderContent: self.$t('hybridKey.AccessKeyID'),
              field: 'akey'
            },
            {
              getContent: item => self.getField('default', item),
              getHeaderContent: self.$t('common.default')
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate',
              sortable: true
            }
          ]
        }
      }
    },

    methods: {
      getField (field, item) {
        if (_.isUndefined(item)) return '';
        let self = this, normalFields = ['name', 'akey', 'hybridAccountId', 'hybridUserName'];
        if (normalFields.includes(field)) return item[field];
        if (field === 'createDate') return formatDatetime(new Date(item[field]));
        if (field === 'default') return self.dbData.hybridKeySecret[item.uuid].current === 'true'
          ? self.$t('hybridKey.currentTrue') : self.$t('hybridKey.currentFalse');
      },

      handleChangeTab(e){
        let self = this;
        self.itemList = [];
        self.updateWindow({
          pageIndex:  1,
          pageSize: 10,
          currTab: e.name,
          selectedUuidList: [],
          sortBy: 'createDate',
          sortDirection: '-'
        }).then( () => {
          self.deleteGlobalAssistant('Hybrid')
          checkAccessKey(self.windowData.currTab, self);
          self.queryList();
        })
      },

      isDefault (){
        let self = this;
        if(!self.isSelected) return false;
        return self.dbData.hybridKeySecret[self.selectedList[0]].current === 'true';
      },

      goToCreate () {
        let self = this;
        self.$router.push({name: 'createHybridkeysecret', params: {type: self.windowData.currTab}});
      }
    },

    computed: {
      total () {
        let self = this;
        return self.windowData[`${self.windowData.currTab}Count`];
      }
    },

    destroyed () {
      let self = this;
      self.deleteGlobalAssistant('Hybrid');
      self.deleteAllAssistant();
    }
  }
</script>

<style scoped>

</style>
