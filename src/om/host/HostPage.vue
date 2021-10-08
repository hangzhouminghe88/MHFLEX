<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">{{$t('common.host')}}</span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs v-model="currTab">
            <el-tab-pane
              :label="`${$t('common.available')}(${windowData.availableCount ? windowData.availableCount:'0'})`"
              name="available"
            ></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex" justify="space-between" style="flex-wrap: nowrap;">
        <div style="flex-shrink: 0;">
          <span class="btn-success" v-permission="'HOST.ADD'" @click="openCreateHost()">
            <i class="el-icon-plus icon"></i>
            {{ $t("host.add")}}
          </span>
          <span
            class="btn-primary"
            :class="{'disabled': !isSelected || inState('Enabled')}"
            @click="isSelected && !inState('Enabled') && pageEnable()"
          >
            <i class="el-icon-caret-right icon"></i>
            {{ $t("common.enable")}}
          </span>
          <span
            class="btn-primary"
            :class="{'disabled':!isSelected ||  inState('Disabled')}"
            @click="isSelected && !inState('Disabled') && pageDisable()"
          >
            <i class="el-icon-remove-outline icon"></i>
            {{ $t("common.disable") }}
          </span>
          <drop-down class="dropdown btn-primary more" :enabled="isSelected" :class="{'disabled': !isSelected}">
            <span slot="title">
              <i class="el-icon-more icon"></i>
              <span class="text">{{$t('common.moreActions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a style="margin-top: 12px" :class="{'disabled-text': !isSelected}" @click="isSelected && pageReconnect()">{{$t('common.reconnect')}}</a>
                <a @click="!inState('Maintenance') && !inStatus('Disconnected', 'Connecting') && pageMaintain()" :class="{'disabled-text':inState('Maintenance') || inStatus('Disconnected', 'Connecting') }">{{ $t("common.intoMaintain")}}</a>
                <a style="margin-bottom: 12px" :class="{'disabled-text': !isSelected}" @click="isSelected && pageDelete()">{{$t('common.destroyed')}}</a>
              </div>
            </span>
          </drop-down>
        </div>
        <div style="flex-shrink: 1;flex-grow: 1;"></div>
        <div style="text-align: right;flex-shrink: 0;">
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
        <el-pagination v-if="windowData.total > 0"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="windowData.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="windowData.total"
          class="page-table-pagination"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          :current-page="windowData.pageIndex"
        ></el-pagination>
      </div>
    </div>
  </page-template>
</template>

<script>

import MultiSelectList from 'src/windows/Base/MultiSelectList';
import PageTemplate from "../../component/PageTemplate";
import WindowBase from "src/windows/Window";
import HostList from "src/om/host/List";
import TableBodyItemState from "../../component/TableBodyItemState";
import TableBodyItemList from "../../component/TableBodyItemList";
import PageBase from 'src/windows/PageBase';

export default {
  name: "HostPage",
  mixins: [WindowBase, HostList, MultiSelectList, PageBase],
  components: { PageTemplate },
  data() {
    return {
      currTab: "available",
      selectVal: "name",
      searchStr: "",
      conditionNameList: [
        { name: "common.name", value: "name" },
        { name: "common.uuid", value: "uuid" }
      ],
      itemList: [],
      //构造数据源
      dataSource: {
        getItemList: () => this.itemList,
        handleSelection: this.handleSelect,
        handleSort: this.handleSort,
        type: 'selection',
        fields: [
          {
            getContent: item => this.getField('name', item),
            className: 'link',
            onClick: item => { this.$router.push({name: 'detailHost', params: {uuid: item.uuid}}) },
            getHeaderContent: this.$t('common.name'),
            field: 'name',
            sortable: true
          },
          {
            getContent: item => this.getField('managementIp', item),
            getHeaderContent: this.$t('common.managementIp'),
            field: 'managementIp',
            sortable: true
          },
          {
            getContent: item => this.getField('clusterUuid', item),
            getHeaderContent: this.$t('common.cluster'),
            field: 'clusterUuid',
            sortable: true
          },
          {
            getContent: item => this.getField('state', item),
            getHeaderContent: this.$t('common.state'),
            field: 'state'
          },
          {
            getContent: item => this.getField('status', item),
            getHeaderContent: this.$t('common.status'),
            field: 'state'
          },
          {
            getContent: item => this.getField('createDate', item),
            getHeaderContent: this.$t('common.createDate'),
            field: 'createDate',
            sortable: true
          },
        ]
      },
    };
  },
  computed: {

  },
  created() {
    let self = this;
    self
      .updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: "createDate",
        sotDirection: "-",
        loading: false,
        selectedUuidList: [],
        methods: {
          queryList: self.queryList
        }
      })
      .then(() => {
        self.queryList();
      });
  },
  methods: {
    //获得某条数据
    getField (field, item) {
      if (_.isUndefined(item)) return ''
      let normalFields = ['name', 'state','managementIp', 'status']
      if (_.includes(normalFields, field)) return item[field]
      if (field === 'createDate') return this.formatDatetime(new Date(item[field]))
      if(field === 'clusterUuid'){
        if(this.dbData.cluster[this.dbData.host[item.uuid].clusterUuid]) {
          return this.dbData.cluster[this.dbData.host[item.uuid].clusterUuid].name;
        }
      }
    },
    getCondition() {
      let self = this,
        conditionList = [];
      conditionList.push(
        `zoneUuid=${window.localStorage.getItem("currZoneUuid")}`
      );
      conditionList.push("hypervisorType=KVM");
      if (self.selectVal !== "" && self.searchStr !== "") {
        conditionList = conditionList.concat(
          `${self.selectVal}~=%${self.searchStr}%`
        );
      }
      return conditionList;
    },
    goToDetail(uuid) {
      let self = this;
      self.$router.push({ name: "detailHost", params: { uuid } });
    }
  }
};
</script>

<style scoped>
</style>
