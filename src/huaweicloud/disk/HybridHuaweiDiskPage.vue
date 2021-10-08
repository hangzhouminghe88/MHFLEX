<template>
  <page-template>
    <div slot="page-header" >
      <el-row :gutter="10">
        <el-col :span="2.2" class="page-header-title">
          华为云云盘
        </el-col>
        <el-col :span="2.2">
          <el-tabs v-model="currSelectTab">
            <el-tab-pane name="available" :label="$t('common.available') + `(${windowData.availableCount ? windowData.availableCount : 0})`"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>

    <!--page-toolbar-->
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex">
        <div class="page-toolbar-left">
          <!--添加云盘-->
          <span class="btn-success" @click="goToCreate()">
          <i class="el-icon-plus icon"></i>
          <span class="text">添加云盘</span>
        </span>
          <!--更多操作-->
          <drop-down class="btn-primary more dropdown"
                     :enabled="isSelected"
                     :class="{'disabled': !isSelected}">
          <span slot="title">
             <i class="el-icon-more icon"></i>
             <span class="text">{{$t('common.moreActions')}}</span>
          </span>
            <span slot="content">
            <div class="dropdown-content">
              <a style="padding-top: 12px"
                 :class="{'disabled-text': !(isSingleSelected && !dbData.hybridHuaweiDisk[selectedList[0]].ecsInstanceUuid)}"
                 @click="isSingleSelected && !dbData.hybridHuaweiDisk[selectedList[0]].ecsInstanceUuid && pageHuaweiAttachEcs()">{{$t('common.attach')}}</a>
              <a @click="isSelected && canDetachEcsInstance() && pageHuaweiDiskDetach()"
                 :class="{'disabled-text': !(isSelected && canDetachEcsInstance())}">{{$t('common.detach')}}</a>
              <a style="padding-bottom: 12px"
                 @click="canDeleteDisk() && pageHuaweiDiskDelete()"
                 :class="{ 'disabled-text': !canDeleteDisk() }">
                {{$t('common.destroy')}}
              </a>
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
    <!--表格容器-->
    <div slot="page-table-content">
       <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
       <div class="page-table-pagination">
         <el-pagination v-if="windowData.availableCount > 0"
                        :page-size="windowData.pageSize"
                        :page-sizes="[10, 20, 50, 100]"
                        @current-change="pageCurrentChange"
                        layout="total, sizes, prev, pager, next, jumper"
                        @size-change="pageSizeChange"
                        :current-page="windowData.pageIndex"
                        :total="windowData.availableCount"
         ></el-pagination>
       </div>
    </div>
  </page-template>
</template>

<script>
    import MultiSelectList from 'src/windows/Base/MultiSelectList';
    import PageTemplate from "src/component/PageTemplate";
    import { formatDatetime } from 'src/utils/utils';
    import WindowBase from 'src/windows/Window';
    import HuaweiDiskList from './List';

    export default {
      name: "HybridHuaweiDiskPage",
      mixins: [MultiSelectList, WindowBase, HuaweiDiskList],
      components: {
        PageTemplate
      },
      data() {
        let self = this;
        return {
          currSelectTab: 'available',
          itemList: [],
          selectVal: 'name',
          searchStr: '',
          conditionNameList: [
            {name: 'common.name', value: 'name'},
            {name: 'UUID', value: 'uuid'}
          ],
          dataSource: {
            getItemList: () => self.itemList,
            handleSelection: self.handleSelect,
            type: 'selection',
            handleSort: self.handleSort,
            fields: [
              {
                getHeaderContent: self.$t('common.name'),
                getContent: item => self.getField('name',  item),
                field: 'name',
                sortable: true,
                className: 'link',
                onClick: (item) => {
                  self.$router.push({name: 'detailHybridHuaweiDisk', params: {uuid: item.uuid}})
                }
              },
              {
                getContent: item => self.getField('diskId', item),
                getHeaderContent: self.$t('hybridAliyunDisk.diskId'),
                field: 'diskId',
                sortable: true,
                tooltip: true
              },
              {
                getContent: item => self.getField('diskCategory', item),
                getHeaderContent: self.$t('hybridAliyunDisk.diskCategory'),
                field: 'diskCategory',
                sortable: true
              },
              {
                getContent: item => self.getField('ecsName', item),
                getHeaderContent: '云主机',
                field: 'ecsInstanceUuid',
                sortable: true,
                tooltip: true
              },
              {
                getContent: item => self.getField('sizeWithGB', item),
                getHeaderContent: self.$t('common.size'),
                field: 'sizeWithGB',
                sortable: true
              },
              {
                getContent: item => self.getField('diskChargeType', item),
                getHeaderContent: self.$t('hybridAliyunDisk.billingMethod'),
                field: 'diskChargeType',
                sortable: true,
                tooltip: true
              },
              {
                getContent: item => self.getField('diskType', item),
                getHeaderContent: self.$t('hybridAliyunDisk.diskType'),
                field: 'diskType',
                sortable: true
              },
              {
                getContent: item => self.getField('identityZoneName', item),
                getHeaderContent: self.$t('common.hybrididentityzone'),
                field: 'identityZoneName',
                tooltip: true,
              },
              {
                getContent: item => self.getField('createDate', item),
                getHeaderContent: self.$t('common.createDate'),
                field: 'createDate',
                sortable: true,
                tooltip: true
              }
            ]

          }
        }
      },
      created() {
        //初始化数据
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
        }).then(() => {
          self.queryList();
        })
      },
      methods: {
        getField(field, item) {
          let self = this, normalFields = ['diskId','name', 'identityZoneName'];
          if(_.includes(normalFields, field)) return item[field];
          if(field === 'diskCategory') return self.$t(`hybridTencentDisk.${(item.diskCategory)}`);
          if(field === 'sizeWithGB') return `${item[field]}G`;
          if(field === 'diskChargeType') return item[field] ? self.$t(`hybridTencentDisk.${item[field]}`) : self.$t('hybridTencentDisk.afterPayment');
          if(field === 'diskType') return self.$t(`hybridTencentDisk.${item[field]}`);
          if(field === 'createDate') return formatDatetime(new Date(item[field]));
          if(field === 'ecsName') return item.ecsName ? item[field] : self.$t('common.noAttach');
        },
        goToCreate() {
          let self = this;
          self.$router.push({name: 'createHybridHuaweiDisk'})
        }
      }
    }
</script>

<style scoped>

</style>
