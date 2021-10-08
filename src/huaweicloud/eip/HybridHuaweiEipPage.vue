<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2.2">
          <span class="page-header-title">弹性Eip</span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs v-model="currSelectTab">
            <el-tab-pane :label="$t('common.available') + `(${windowData.avaialableCount ? windowData.avaialableCount : '0'})`"
                         name="available"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div class="page-toolbar-container" slot="page-toolbar">
      <el-row type="flex">
        <div class="page-toolbar-left">
          <span class="btn-success" @click="goToCreate()">
            <i class="el-icon-plus icon"></i>
            <span class="text">创建弹性公网Eip</span>
          </span>
          <drop-down class="btn-primary more dropdown" :enabled="isSelected" :class="{'disabled': !isSelected}">
            <span slot="title">
              <i class="el-icon-more"></i>
              <span class="text">{{$t('common.moreActions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a style="padding-top: 12px;" :class="{'disabled-text': isAttachEcs()}" @click="!isAttachEcs() && pageAttach()">{{$t('common.attach')}}</a>
                <a :class="{'disabled-text': !isAttachEcs()}" @click="isAttachEcs() && pageDetach()">{{$t('common.detach')}}</a>
                <a style="padding-bottom: 12px;" @click="pageDelete()">{{$t('common.destroy')}}</a>
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
    <div slot="page-table-content">
      <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
      <div class="page-table-pagination">
        <el-pagination :total="windowData.availableCount"
                       :page-size="windowData.pageIndex"
                       @current-change="pageCurrentChange"
                       v-if="windowData.availableCount > 0"
                       @size-change="pageSizeChange"
                       layout="total, sizes, prev, pager, ->, next, jumper"
                       :page-sizes="[10,20,50,100]"></el-pagination>
      </div>
    </div>
  </page-template>
</template>

<script>
import MultiSelectList from 'src/windows/Base/MultiSelectList';
import PageTemplate from 'src/component/PageTemplate';
import { formatDatetime,capitalize } from 'src/utils/utils';
import WindowBase from 'src/windows/Window';
import EipList from './List';

export default {
  name: 'HybridHuaweiEipPage',
  mixins: [WindowBase, MultiSelectList, EipList],
  components: {
    PageTemplate
  },
  data() {
    let _this = this;
    return {
      currSelectTab: 'available',
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
        getItemList: () => _this.itemList,
        handleSelection: _this.handleSelect,
        handleSort: _this.handleSort,
        type: 'selection',
        fields: [
          {
            getHeaderContent: _this.$t('common.name'),
            getContent: item => _this.getField('name', item),
            onClick: (item) => {
               _this.$router.push({name: 'detailHybridHuaweiEip', params: {uuid: item.uuid}})
            },
            className: 'link',
            tooltip: true,
            sortable: true,
            field: 'name'
          },
          {
            getHeaderContent: _this.$t('hybrideip.eip'),
            getContent: item => _this.getField('name', item),
            tooltip: true,
          },
          {
            getHeaderContent: _this.$t('common.bandwidth'),
            getContent: item => _this.getField('bandWidth', item),
            tooltip: true,
          },
          {
            getHeaderContent: _this.$t('common.status'),
            getContent: item => _this.getField('status', item),
            tooltip: true,
          },
          {
            getHeaderContent: _this.$t('common.hostname'),
            getContent: item => _this.getField('ecsName', item),
            tooltip: true,
          },
          {
            getHeaderContent: _this.$t('common.hybridDatacenter'),
            getContent: item => _this.getField('dataCenterName', item),
            tooltip: true,
          },
          {
            getHeaderContent: _this.$t('common.createDate'),
            getContent: item => _this.getField('createDate', item),
            tooltip: true,
            sortable: true,
            field: 'createDate'
          }
        ]
      }
    }
  },
  created() {
    let _this = this;
    _this.updateWindow({
      pageIndex: 1,
      pageSize: 10,
      sortBy: 'createDate',
      sortDirection: '-',
      selectedUuidList: [],
      loading: false,
      methods: {
        queryList: _this.queryList
      }
    }).then(() => {
      _this.queryList();
    })
  },
  methods: {
    getField(field, item) {
        let self = this, normalFields = ['eipAddress', 'dataCenterName'];
        if(normalFields.includes(field)) return item[field];
				if(field === 'name') return item[field].replace(/zstack/g, '');
				if(field === 'status') return item[field].charAt(0) + item[field].toLowerCase().slice(1);
        if(field === 'ecsName') {
          return item[field] === '' ? self.$t('ldapEntry.notAttachedLdap') : item[field];
        }
        if(field === 'bandWidth') return item[field] ? `${item[field]}M` : '1M';
        if(field === 'createDate') return formatDatetime(new Date(item[field]));
    },
    goToCreate() {
      let _this = this;
      _this.$router.push({name: 'createHybridHuaweiEip'})
    }
  }
}
</script>

<style lang="less" scoped>

</style>
