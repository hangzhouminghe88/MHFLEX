<template>
  <dialog-template>
    <span slot="title">
      <span>{{ $t("loadbalancer.select") }}</span>
      <span class="el-icon-close dialog-close" @click="ok()"></span>
    </span>
    <div slot="body">
      <div style="padding:30px;overflow-y: hidden;">
        <div class="radio-group" style="text-align: right">
       <span style="padding: 0 15px;display: inline-block;">
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
        </div>
        <el-table
          highlight-current-row
          :data="itemList"
          @row-click="handleSingleSelect"
          v-loading="windowData.loading">
           <span slot="empty" class="table-nodata">
             <p class="empty-text" v-text="$t('common.noData')"></p>
          </span>
          <el-table-column
            width="50px;">
            <template slot-scope="scope">
              <el-radio :label="scope.row.uuid" v-model="templateRadio">&nbsp</el-radio>
            </template>
          </el-table-column>
          <el-table-column
            prop="name"
            :label="$t('common.name')"></el-table-column>
          <el-table-column
            prop="managementIp"
            :label="$t('common.managementIp')"></el-table-column>
          <el-table-column
            :label="$t('common.cluster')">
            <template slot-scope="scope">
              {{dbData.cluster[dbData.host[scope.row.uuid].clusterUuid].name}}
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('common.hypervisorType')"
            prop="hypervisorType"></el-table-column>
        </el-table>
        <el-pagination v-if="windowData.availableCount > 0"
          :page-sizes="[5, 10]"
          :page-size="windowData.pageSize"
          :total="windowData.availableCount"
          class="page-table-pagination"
          layout="total, sizes, prev, pager, next"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          :current-page="windowData.pageIndex"></el-pagination>
      </div>
    </div>
      <div slot="footer" class="dialog-footer">
        <span class="btn-confirm" @click="ok">{{$t('common.ok')}}</span>
        <span class="btn-cancel" @click="cancel">{{$t('common.cancel')}}</span>
      </div>
  </dialog-template>
</template>

<script>
  import Utils from 'src/utils/utils';
  import HostList from 'src/om/host/List';
  import WindowBase from 'src/windows/Window';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  export default {
    name: "HostListSingleSelectList",
    mixins: [HostList, WindowBase, MultiSelectList],
    created: function () {
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        sortBy: 'createDate',
        sortDirection: '-',
        methods: {
          queryList: this.queryList
        }
      }).then(() => {
        this.queryList()
      })
    },
    destroyed: function () {
    },
    updated: function () {
    },
    data () {
      return {
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
        searchStr: '',
        selectVal: 'name',
        templateRadio: "",
        itemList: []
      }
    },
    methods: {
      getCondition: function () {
        let conditionList = []
        conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`)
        if (this.dialogData.param && this.dialogData.param.conditions) conditionList = conditionList.concat(this.dialogData.param.conditions)
        if (this.searchStr !== '' && this.selectVal !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      cancel: function () {
        this.closeDialog(this.windowData.id)
      },
      handleSingleSelect(row){
        let self = this;
        self.templateRadio = row.uuid;
      },
      ok: function () {
        let self = this;
        if (!self.templateRadio) return
        this.dialogData.param.select(self.templateRadio)
        this.closeDialog(this.windowData.id)
      },
      ...Utils
    }
  };
</script>

<style scoped>
  .tab-item {
    display: inline-block;
  }
  .tab-title {
    display: inline-block;
    top: -13px;
    position: relative;
    margin-right: 15px;
  }
</style>
