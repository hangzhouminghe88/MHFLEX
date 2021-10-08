<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2.2" class="page-header-title">
          Secret Key
        </el-col>
        <el-col :span="2">
          <el-tabs v-model="currTab">
            <el-tab-pane :label="$t('common.available') + `(${windowData.availableCount ? windowData.availableCount : '0'})`" name="available"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>

    <div slot="page-toolbar" class="page-toolbar-container">
      <div class="page-toolbar-left">
        <div class="btn-success" @click="goToCreate()">
          <i class="el-icon-plus"></i>
          <span class="text">{{$t('hybridTencentKey.AddTencentSecretKey')}}</span>
        </div>
        <drop-down class="dropdown btn-primary more"
                   :enabled="isSelected"
                   :class="{'disabled': !isSelected}">
          <span slot="title">
            <span class="text">
              <i class="el-icon-more"></i>
              {{$t('common.moreActions')}}
            </span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="padding-top: 12px;"
                 :class="{'disabled-text': !isSingleSelected || isDefault()}"
                 @click="isSingleSelected && !isDefault() && pageAttach()">
                {{$t('common.setDefault')}}
              </a>
              <a :class="{'disabled-text': !isSingleSelected || !isDefault()}"
                 @click="isSingleSelected && isDefault() && pageDetach()">
                {{$t('common.cancelDefault')}}
              </a>
              <a style="padding-bottom: 12px;"
                 :class="{'disabled-text': !isSelected}"
                 @click="isSelected && pageDelete()">
                {{$t('common.destroy')}}
              </a>
            </div>
          </span>
        </drop-down>
      </div>
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
    </div>

    <div slot="page-table-content">
       <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
       <div class="page-table-pagination">
         <el-pagination @size-change="pageSizeChange" v-show="windowData.availableCount > 0"
                        @current-change="pageCurrentChange"
                        layout="total, sizes, prev, pager, next, jumper, ->"
                        :total="windowData.availableCount"
                        :current-page="windowData.pageIndex"
                        :page-sizes="[10,20,50,100]"
                        :page-size="windowData.pageSize"></el-pagination>
       </div>
    </div>
  </page-template>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import {checkAccessKey} from "./assitant/SecretKeyAssistant";
  import PageTemplate from "src/component/PageTemplate";
  import { formatDatetime } from 'src/utils/utils';
  import PageBase from 'src/windows/PageBase';
  import WindowBase from 'src/windows/Window';
  import TencentSkList from './List';

  export default {
    name: "SecretKey",

    mixins: [MultiSelectList, WindowBase, PageBase, TencentSkList],

    components: {PageTemplate},

    data() {
      let self = this;
      return {
        currTab: 'available',
        selectVal: 'name',
        searchStr: '',
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
              onClick: (item) => {
                self.$router.push({name: 'detailHybridTencentKeySecret', params: {uuid: item.uuid}})
              },
              className: 'link',
              tooltip: true,
              sortable: true
            },
            {
              getContent: item => self.getField('secretId', item),
              getHeaderContent: self.$t('hybridTencentKey.secretId'),
              tooltip: true,
              sortable: true
            },
            {
              getContent: item => self.getField('secretKey', item),
              getHeaderContent: self.$t('hybridTencentKey.secretKey'),
              tooltip: true
            },
            {
              getContent: item => self.getField('current', item),
              getHeaderContent: self.$t('common.default'),
              tooltip: true
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              sortable: true,
              tooltip: true
            }
          ]
        }
      }
    },

    created() {
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        loading: false,
        selectedUuidList: [],
        methods: {
          queryList: self.queryList
        }
      }).then( () => {
         self.queryList()
           .then(() => {
             checkAccessKey(self);
           });
      })
    },

    methods: {
      getField(field, item) {
        let self = this, normalFields = ['name', 'secretId', 'secretKey'];
        //if(!item[field]) return '';
        if(_.includes(normalFields, field)) return item[field];
        if(field === 'current') return item[field] === 'true' ? self.$t('common.yes') : self.$t('common.no');
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
      },

      //添加腾讯sk
      goToCreate() {
        let self = this;
        self.$router.push({name: 'createHybridTencentKeySecret'})
      }
    }
  }
</script>

<style scoped>
  .page-toolbar-container{
    justify-content: space-between;
    display: flex;
    width: calc(100% - 40px);
  }
</style>
