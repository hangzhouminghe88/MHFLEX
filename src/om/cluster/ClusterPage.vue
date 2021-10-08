<template>
  <page-template>
    <div slot="page-header" style="height: 60px;line-height: 60px;">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title">{{$t('common.cluster')}}</span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs v-model="currTab">
            <el-tab-pane
              :label="`${$t('common.available')}(${windowData.availableCount?windowData.availableCount:'0'})`"
              name="available"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex" justify="space-between" style="flex-wrap: nowrap;">
        <div style="flex-shrink: 0;">
          <span class="btn-success" @click="openCreateCluster"><i class="el-icon-plus icon"></i> {{ $t("cluster.create")}} </span>
          <span class="btn-primary" :class="{'disabled':!canEnable()}" @click.stop="canEnable() && pageEnable()"><i
            class="el-icon-caret-right icon"></i> {{ $t("common.enable")}} </span>
          <span class="btn-primary" :class="{'disabled':!canDisabled()}" @click.stop="canDisabled() && pageDisable()"><i
            class="el-icon-remove-outline icon"></i> {{ $t("common.disable") }} </span>

          <drop-down class="btn-primary more dropdown" v-if="currTab === 'available'"
                     :class="{'disabled': !isSelected}" :enabled="isSelected">
                    <span slot="title">
                          <i class="el-icon-more"></i>
                         <span class="text">{{ $t("common.moreActions") }}</span>
                    </span>
            <span slot="content">
                <div class="dropdown-content" :class="{ 'show': windowData.showMoreDropdown }">
                    <a id="common-attachl2" @click="isSingleSelected && pageAttachl2()"
                       style="padding-top: 12px;" :class="{ 'disabled-text': !isSingleSelected}">{{ $t("common.attachl2") }}</a>
                    <a id="common-detachl2"
                       @click="isSingleSelected && GetisAttachL2network(selectedList[0]) && pageDetachl2()"
                       :class="{ 'disabled-text': !isSingleSelected || !GetisAttachL2network(selectedList[0])}">{{ $t("common.detachl2") }}</a>
                    <a id="common-attachprimarystorage"
                       @click="isSingleSelected && canAttachPrimaryStorage(selectedList[0]) && pageAttachPrimaryStorage()"
                       :class="{ 'disabled-text': !canAttachPrimaryStorage(selectedList[0]) || !isSingleSelected}">{{ $t("common.attachprimarystorage")}}</a>
                    <a id="common-detachprimarystorage"
                       @click="isSingleSelected && canDetachPrimaryStorage(selectedList[0]) && pageDetachPrimaryStorage()"
                       :class="{ 'disabled-text': !canDetachPrimaryStorage(selectedList[0]) || !isSingleSelected}">{{ $t("common.detachprimarystorage")}}</a>
                    <a id="common-destroy" style="padding-bottom:12px;" @click="isSelected && pageDelete()"
                       :class="{ 'disabled-text': !isSelected}">{{ $t("common.destroy") }}</a>
                </div>
            </span>
          </drop-down>
        </div>
        <div style="flex-shrink: 1;flex-grow: 1;"></div>
        <div style="text-align: right;flex-shrink: 0;">
                    <span style="padding: 0 15px;display: inline-block;">
                        <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
                        <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                            <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)"
                                       :key="index" :value="item.value"></el-option>
                        </el-select>
                        <span slot="append"><i class="el-icon-search icon"></i></span>
                        </el-input>
                    </span>
          <span @click="refresh()" class="btn-refresh"><i class="el-icon-refresh icon"></i></span>
        </div>
      </el-row>
    </div>
    <div slot="page-table-content" style="max-height: 400px;">
      <mh-table :data-source="dataSource" :loading="windowData.loading"></mh-table>
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
  </page-template>
</template>

<script>
  import PageTemplate from "../../component/PageTemplate";
  import ClusterList from './List'
  import WindowBase from 'src/windows/Window';
  import Root from 'src/windows/Root';
  import Utils from 'src/utils/utils';
  import MultiSelectList from 'src/windows/Base/MultiSelectList'
  import TableBodyItemState from 'src/component/TableBodyItemState'
  import TableBodyItemList from "../../component/TableBodyItemList";
  import PageBase from 'src/windows/PageBase';

  export default {
    name: "ClusterPage",
    mixins: [ClusterList, WindowBase, Root, PageBase, MultiSelectList],
    components: {
      PageTemplate,
      TableBodyItemList,
      TableBodyItemState
    },
    created: function () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 10,
        currItemUuid: '',
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        loading: true,
        methods: {
          queryList: this.queryList
        }
      })
        .then(() => {
          this.queryList()
        })
    },
    destroyed: function () {
    },
    data() {
      return {
        searchStr: '',
        selectVal: "name",
        currTab: 'available',
        availableCount: 0,
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
          getItemList: () => this.itemList,
          handleSelection: this.handleSelect,
          handleSort: this.handleSort,
          type: 'selection',
          fields: [
            {
              getContent: item => this.getField('name', item),
              className: 'link',
              onClick: item => { this.$router.push({name: 'detailCluster', params: {uuid: item.uuid}}) },
              getHeaderContent: this.$t('common.name'),
              field: 'name',
              sortable: true
            },
            {
              getContent: item => this.getField('hypervisorType', item),
              getHeaderContent: this.$t('common.hypervisorType'),
              field: 'hypervisorType',
              sortable: true
            },
            {
              getContent: item => this.getField('hostNum', item),
              getHeaderContent: this.$t('common.hostNum'),
              field: 'hostNum',
            },
            {
              getContent: item => this.getField('cpuInfo', item),
              getHeaderContent: this.$t('cluster.cpuInfo'),
              field: 'cpuInfo'
            },
            {
              getContent: item => this.getField('memoryInfo', item),
              getHeaderContent: this.$t('cluster.memoryInfo'),
              field: 'memoryInfo'
            },
            {
              getContent: item => this.getField('state', item),
              getHeaderContent: this.$t('common.state'),
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
      }
    },
    methods: {
      ...Utils,
      getCondition: function () {
        let conditionList = []
        conditionList.push(`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
        conditionList.push('type=zstack')
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%${encodeURIComponent(this.searchStr)}%`)
        }
        return conditionList
      },

      getField(field, item){
         let self = this;
        if (_.isUndefined(item)) return ''
        let normalFields = ['name', 'state','hypervisorType']
        if (_.includes(normalFields, field)) return item[field]
        if (field === 'createDate') return self.formatDatetime(new Date(item[field]))
        if(field === 'cpuInfo')
          return self.dbData.clusterA[item.uuid].totalCpu &&
          `${self.dbData.clusterA[item.uuid].availableCpu}/${self.dbData.clusterA[item.uuid].totalCpu}`
        if(field === 'memoryInfo') return `${self.bytesToSize(self.dbData.clusterA[item.uuid].availableMemory)}/${self.bytesToSize(self.dbData.clusterA[item.uuid].totalMemory)}`
        if(field === 'hostNum') return self.dbData.clusterA[item.uuid].hostNum
      },
      canEnable(){
        let self = this;
        if(self.windowData.selectedUuidList.length<=0) return false;
        return self.windowData.selectedUuidList.some((uuid) => self.dbData.cluster[uuid].state !== 'Enabled');
      },
      canDisabled() {
        let self = this;
        if(self.windowData.selectedUuidList.length<=0) return false;
        return self.windowData.selectedUuidList.some((uuid) => self.dbData.cluster[uuid].state !== 'Disabled');
      }
    },
    filters: {
      dateFormat(val, fmt) { //author: meizz
        let value = new Date(val);
        var o = {
          "M+": value.getMonth() + 1,                 //月份
          "d+": value.getDate(),                    //日
          "h+": value.getHours(),                   //小时
          "m+": value.getMinutes(),                 //分
          "s+": value.getSeconds(),                 //秒
          "q+": Math.floor((value.getMonth() + 3) / 3), //季度
          "S": value.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt))
          fmt = fmt.replace(RegExp.$1, (value.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
          if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
      }
    }
  }
</script>

<style scoped>

</style>
