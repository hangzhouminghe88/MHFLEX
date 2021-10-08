<template>
  <dialog-template width="1000px">
    <div slot="title" class="model-plain-header">
      <span class="title">{{$t('common.selectInstanceOffering')}}</span>
      <span @click="close()" class="el-icon-close dialog-close"></span>
    </div>
    <div slot="body">
      <div style="padding:30px;">
        <div class="page-toolbar-container" style="display: flex">
          <div class="page-toolbar-left">
            <component v-if="dialogData.param.showTab" :is="typeListItem.ctrl" :param="typeListItem.param"/>
          </div>
          <div class="page-toolbar-center"></div>
          <div class="page-toolbar-left">
            <el-input @blur="search()" @change="search()" placeholder="请输入内容" v-model="searchStr">
              <el-select placeholder="请选择" slot="prepend" style="width: 100px" v-model="selectVal">
                <el-option :key="index" :label="$t(`${item.name}`)" :value="item.value"
                           v-for="(item, index ) in conditionNameList"></el-option>
              </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </div>
        </div>
        <el-table
          :data="itemList"
          @row-click="handleSingleSelect"
          highlight-current-row>
           <span slot="empty" class="table-nodata">
            <p class="empty-text" v-text="$t('common.noData')"></p>
          </span>
          <el-table-column width="50px">
            <template slot-scope="scope">
              <el-radio :label="scope.row.uuid" v-model="templateRadio">&nbsp</el-radio>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.name')">
            <template slot-scope="scope">
              {{scope.row.name}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.cpuNum')">
            <template slot-scope="scope">
              {{scope.row.cpuNum}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.memorySize')">
            <template slot-scope="scope">
              {{bytesToSize(scope.row.memorySize)}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('instanceOffering.allocatorStrategy')">
            <template slot-scope="scope">
              <div v-if="scope.row.allocatorStrategy !== 'MaxInstancePerHostHostAllocatorStrategy'">
                {{$t(`instanceOffering.${scope.row.allocatorStrategy}`) }}
              </div>
              <div v-if="scope.row.allocatorStrategy === 'MaxInstancePerHostHostAllocatorStrategy'">
                {{$t(`instanceOffering.${scope.row.allocatorStrategy}`) + ':' + scope.row.maxInstancePerHost }}
              </div>
            </template>
          </el-table-column>
          <el-table-column  :label="$t('common.createDate')">
            <template slot-scope="scope">
              {{formatDatetime(new Date(scope.row.createDate))}}
            </template>
          </el-table-column>
        </el-table>
        <el-pagination v-if="windowData.total > 0"
          :current-page="windowData.pageIndex"
          :page-size="5"
          :page-sizes="[5, 10]"
          :total="windowData.total"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          class="page-table-pagination"
          layout="total, sizes, prev, pager, next"></el-pagination>
      </div>
    </div>
    <div class="dialog-footer" slot="footer">
      <span @click="confirm" class="btn-confirm">{{$t('common.ok')}}</span>
      <span @click="close" class="btn-cancel">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import PanelTypeList from 'src/component/FullPanel/PanelTypeList';
  import Utils from 'src/utils/utils';
  import DialogTemplate from "../DialogTemplate";
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import VirtualRouterOfferingList from 'src/network/virtualRouterOffering/List';
  import InstanceOfferingList from 'src/ecs/intanceOffing/List';
  import _ from 'lodash';

  export default {
    name: "SingleSelectList",
    mixins: [WindowBase, MultiSelectList, VirtualRouterOfferingList, InstanceOfferingList],
    components: {
      PanelTypeList,
      DialogTemplate
    },
    created(){
      let selectedItems = {
        instanceOffering: [],
        virtualRouterOffering: []
      }
      this.QueryInVROffering = VirtualRouterOfferingList.methods.queryList.bind(this)
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 5,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedItems,
        methods: {
          queryList: this.queryList
        }
      }).then(() => this.queryList())
    },
    data() {
      let self = this;
      return {
        typeList: [
          {typeName: 'instanceOffering', value: 'instanceOffering'},
          {typeName: 'virtualRouterOffering', value: 'virtualRouterOffering'}
        ],
        typeListItem: {
        id: 'imageTypeList',
          param: {
          getTypeList: () => {
            return this.typeList
          },
            setIndex: (index) => {
              self.currSelectTab = self.typeList[index].value;
              self.updateWindow({
                currItemUuid: '',
                pageIndex: 1,
                total: 0,
                pageSize: 5,
                sortBy: 'createDate',
                sortDirection: '-'
              }).then(() => {
                if (this.currSelectTab === 'instanceOffering') self.queryList()
                else self.QueryInVROffering()
              })
          },
            getIndex: () => {
            return _.findIndex(this.typeList, it => it.value === this.currSelectTab)
          }
        },
        ctrl: PanelTypeList
      },
        currSelectTab: 'instanceOffering',
        templateRadio: '',
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        itemList: [],
      }
    },
    methods: {
      ...Utils,
      handleSingleSelect(row){
        let self = this;
        self.templateRadio = row.uuid;
      },
      getCondition: function () {
        let conditionList = []
        switch (this.currSelectTab) {
          case 'instanceOffering':
            conditionList = ['type=UserVm']
            break
          case 'virtualRouterOffering':
            conditionList = ['type=VirtualRouter', `zoneUuid=${window.localStorage.getItem('currZoneUuid')}`]
            break
        }
        conditionList = conditionList.concat(this.dialogData.param.conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      close: function () {
        if (this.dialogData.param.ok) {
          this.dialogData.param.ok()
        }
        this.closeDialog(this.windowId)
      },
      confirm: function () {
        let self = this;
        if(!self.templateRadio) return;
        self.dialogData.param.select(self.templateRadio);
        self.close();
      },
    }
  }
</script>

<style scoped>

</style>
