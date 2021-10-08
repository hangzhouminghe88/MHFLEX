<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">
            {{$t('common.hybridimage')}}
          </span>
        </el-col>
        <el-col :span="10">
          <el-tabs v-model="currTab"  @tab-click="changeCurrTab">
            <el-tab-pane name="self" :label="$t('hybridimage.self')+`(${windowData.selfCount ? windowData.selfCount : '0'})`"></el-tab-pane>
            <el-tab-pane name="system" :label="$t('hybridimage.aliyunSystem') + `(${windowData.systemCount ? windowData.systemCount : '0'})`"></el-tab-pane>
            <el-tab-pane name="uploading" :label="$t('common.uploading') + `(${windowData.uploadingCount ? windowData.uploadingCount : '0'})`"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>

    <div slot="page-toolbar" class="page-toolbar-container">
      <div class="flex" style="justify-content: space-between;">
        <div class="left">
          <!--创建-->
          <span class="btn-success" v-if="['self'].includes(currTab)" @click="goToCreate()">
             <i class="el-icon-plus icon"></i>
             <span class="text">{{$t('hybridimage.create')}}</span>
           </span>
          <!--删除-->
          <span class="btn-primary" v-if="['self', 'system'].includes(currTab)" :class="{'disabled': !isSelected}" @click="isSelected && pageDelete()">
             <i class="el-icon-remove icon"></i>
             <span class="text">{{$t('common.destroy')}}</span>
           </span>
        </div>
         <div class="right">
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
    </div>
    <div slot="page-table-content">
       <mh-table :data-source="currTab!=='uploading' ? dataSource : dataUploadSource" :loading="windowData.loading"></mh-table>
       <div class="page-table-pagination">
        <el-pagination v-if="currTab !== 'uploading' && windowData.total > 0"
                       :page-size = "windowData.pageSize"
                       :page-sizes = "[10, 20, 50, 100]"
                       @current-change="pageCurrentChange"
                       @size-change="pageSizeChange"
                       layout="total, sizes, prev, pager, next"
                       :total="windowData.total"
        ></el-pagination>
       </div>
    </div>
  </page-template>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import PageTemplate from 'src/component/PageTemplate';
  import { formatDatetime } from 'src/utils/utils';
  import WindowBase from 'src/windows/Window';
  import PageBase from 'src/windows/PageBase';
  import HybridAliCloudList from './List';

  export default {
    name: 'hybirdAliCloudImagePage',

    mixins: [HybridAliCloudList, WindowBase, MultiSelectList, PageBase],

    components: {
      PageTemplate
    },

    data() {
      let self = this;
      return {
        selectVal: 'name',
        searchStr: '',
        itemList: [],
        refreshProgress: null,
        currTab: 'self',
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
        //自定义镜像与公共镜像的数据源
        dataSource: {
          getItemList: () => self.itemList,
          handleSort: self.handleSort,
          handleSelection: self.handleSelect,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              onClick: (item) => {
                self.$router.push({name: 'detailHybridAliCloudImage', params: {
                  uuid: item.uuid,
                    currTab: self.currTab
                  }})
              },
              className: self.currTab !== 'uploading' ? 'link' : '',
              sortable: true,
              tooltip: true,
              field: 'name'
            },
            {
              getContent: item => self.getField('platform', item),
              getHeaderContent: self.$t('common.platform'),
              field: 'platform'
            },
            {
              getContent: item => self.getField('type', item),
              getHeaderContent: self.$t('hybridimage.type'),
              field: 'type',

              sortable: true
            },
            {
              getContent: item => self.getField('ecsImageSize', item),
              getHeaderContent: self.$t('hybridimage.ecsImageSize'),
              field: 'ecsImageSize'
            },
            {
              getContent: item => self.getField('ecsImageId', item),
              getHeaderContent: self.$t('hybridimage.ecsImageId'),
              field: 'ecsImageId',
              tooltip: true
            },
            {
              getContent: item => self.getField('dataCenterName',  item),
              getHeaderContent: self.$t('hybridimage.dataCenter'),
              field: 'dataCenterName'
            },
            {
              getContent: item => self.getField('createDate', item),
              getHeaderContent: self.$t('common.createDate'),
              field: 'createDate',
              sortable: true
            }
          ]
        },
        //上传镜像的数据源
        upLoadItemList: [],
        dataUploadSource: {
          getItemList: () => self.upLoadItemList,
          handleSort: self.handleSort,
          handleSelection: self.handleSelect,
          type: 'selection',
          fields: [
            {
              getContent: item => self.getField('name', item),
              getHeaderContent: self.$t('common.name'),
              sortable: true,
              tooltip: true,
              field: 'name'
            },
            {
              getContent: item => self.getField('progress', item),
              getHeaderContent: self.$t('hybridimage.uploadStatus'),
              field: 'progress',
              progress: true
            },
            {
              getContent: item => self.getField('dataCenterName',  item),
              getHeaderContent: self.$t('hybridimage.dataCenter'),
              field: 'dataCenterName'
            }
          ]
        },
      }
    },

    created() {
      let self = this;
      self.currTab = self.$route.params.currTab ? self.$route.params.currTab : 'self';
      self.refreshProgress = setInterval(this.refreshEcsImageProcess, 5000)
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        loading: false,
        methods: {
          queryList: self.queryList
        }
      }).then(() => {
        self.queryList();
      })
    },

    methods: {
      changeCurrTab() {
        this.itemList = [];
        this.updateWindow({
          pageIndex: 1,
          pageSize: 10
        }).then(() => {
          this.queryList()
        })
      },

      getCondition: function () {
        let conditionList = [], self = this;
        if (this.currTab !== 'uploading') {
          conditionList = [`type=${this.currTab}`]
        }
        if (self.selectVal !== '' && self.searchStr != '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}25%`);
        }
        return conditionList
      },

      getField(field, item) {
        let self = this, normalFields = ['name', 'platform', 'ecsImageId'];
        if(self.currTab !== 'uploading') {
          if(normalFields.includes(field)) return item[field];
          if(field === 'createDate') return formatDatetime(new Date(item[field]));
          if(field === 'dataCenterName') {
            return item[field];
          }
          if(field === 'type') return self.$t(`hybridimage.${item.type}`);
          if(field === 'ecsImageSize') return `${item.ecsImageSize} GB`
        }
        if(self.currTab === 'uploading') {
          if(field === 'name') return item[field];
          if(field === 'dataCenterName') {
            return self.getDataCenterName(item.dataCenterUuid);
          }
          if(field === 'progress') {
            return {
              'used': item['progress']['progress'].replace('%', ''),
              'total': 100
            };
          }
        }
      },

      beforeDestroy() {
         if(this.refreshProgress){
          clearInterval(this.refreshProgress);
          this.refreshProgress = null;
        }
      }
    }
  }
</script>

<style scoped lang="less">

</style>
