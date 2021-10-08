<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2.2">
          <span class="page-header-title">{{$t('common.autoscalinggroup')}}</span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs active-name="available">
            <el-tab-pane :label="`${$t('common.available')}(${windowData.availableCount ? windowData.availableCount : 0})`" name="available"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row style="flex-wrap: nowrap;" type="flex">
        <div style="flex-shrink: 0">
          <span class="btn-success" @click="$router.push({name: 'createAutoScalingGroup'})">
            <i class="el-icon-plus icon"></i>{{$t('autoScaling.create')}}
          </span>
          <span class="btn-primary" :class="{'disabled': !canEnable()}" @click="canEnable() && pageEnable()">
            <i class="el-icon-caret-right icon"></i>{{$t('common.enable')}}
          </span>
          <span class="btn-primary" :class="{'disabled': !canDisable()}" @click="canDisable() && pageDisable()">
            <i class="el-icon-remove-outline icon"></i>{{$t('common.disable')}}
          </span>
          <span class="btn-primary" style="position: relative;" :class="{'disabled': !isSelected}" @click="isSelected && pageDelete()">
            <i class="el-icon-remove-outline icon"></i>
            {{$t("common.destroy")}}
             <help-trigger name="autoScalingGroup" style="position: absolute;top: 10px;right: -25px;"/>
          </span>
        </div>
        <div style="flex-shrink: 0; flex-grow: 1"></div>
        <div style="flex-shrink: 0">
            <span style="padding: 0 15px;display: inline-block;">
             <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
             </el-input>
           </span>
          <span class="btn-refresh" @click="refresh()"><i class="el-icon-refresh icon"></i></span>
        </div>
      </el-row>
    </div>
    <div slot="page-table-content">
      <el-table
       :data=" itemList"
       @selection-change="handleChangeSelect"
       @sort-change="handleSort"
       v-loading="windowData.loading">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection"></el-table-column>
        <el-table-column :label="$t('common.name')" prop="name" sortable show-tooltip-when-overflow>
          <template slot-scope="scope">
            <span class="link" @click="goToDetail(scope.row.uuid)">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('autoScaling.MinimumNumberOfInstance')" prop="minResourceSize" show-tooltip-when-overflow>
        </el-table-column>
        <el-table-column :label="$t('autoScaling.MaximumNumberOfInstance')" prop="maxResourceSize" show-tooltip-when-overflow></el-table-column>
        <el-table-column :label="$t('autoScaling.currentNumOfHealthyVmInstance')+'/'+$t('autoScaling.currentTotalOfHealthyVmInstance')">
          <template slot-scope="scope">
            {{`${scope.row.healthyVmInstanceNum}`+'/'+`${scope.row.totalVmInstanceNum}`}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.state')" prop="state" sortable show-tooltip-when-overflow>
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="scope.row.state"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.createDate')" prop="createDate" sortable show-tooltip-when-overflow>
          <template slot-scope="scope">
            {{formatDatetime(new Date(scope.row.createDate))}}
          </template>
        </el-table-column>
      </el-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData.availableCount > 0"
          :current-page="windowData.pageIndex"
          :page-size="windowData.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="windowData.availableCount"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          class="page-table-pagination"
          layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
      </div>
    </div>
  </page-template>
</template>

<script>
  import PageTemplate from "../../component/PageTemplate";
  import AutoScalingGroupList from 'src/ecs/autoScalingGroup/List';
  import TableBodyItemState from "../../component/TableBodyItemState";

  export default {
    name: "AutoScalingGroupPage",
    mixins: [AutoScalingGroupList],
    components: {TableBodyItemState, PageTemplate},
    data() {
      return {
        searchStr: '',
        selectVal: 'name',
        conditions: {
          'available': 'state!=Deleted',
          'destroyed': 'state=Deleted'
        },
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        itemList: []
      }
    },
    created(){
      let self = this;
      self.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        currTab: 'available',
        selectUuidList: [],
        loading: false,
        methods: {
          queryList: self.queryList
        }
      })
        .then(() => {
          return self.queryList()
        })
    },
    computed: {
      isSelected(){
        let self = this;
        return self.windowData && self.windowData.selectUuidList && self.windowData.selectUuidList.length >=1;
      },
      selectedList(){
        let self = this;
        return self.windowData && self.windowData.selectUuidList && self.windowData.selectUuidList;
      }
    },
    methods: {
      search(){

      },
      pageSizeChange(val) {
        let self = this;
        self.updateWindow({
          pageSize: val,
          pageIndex: 1,
        })
      },
      pageCurrentChange(val) {
        let self = this;
        self.updateWindow({
          pageIndex: val
        })
      },
      refresh(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        })
          .then(() => {
            self.queryList();
          })
      },
      handleSort(e) {
        if (e.order === 'ascending') {
          this.updateWindow({
            sortBy: e.prop,
            sortDirection: '+'
          })
            .then(() => {
              this.queryList();
            })
        } else {
          this.updateWindow({
            sortBy: e.prop,
            sortDirection: '-'
          })
            .then(() => {
              this.queryList();
            })
        }
      },
      handleChangeSelect(val) {
        let self = this, uuidList = [];
        uuidList = val.map((item) => {
          return item.uuid;
        })
        self.updateWindow({
          selectUuidList: uuidList
        })
      },
      canEnable(){
        let self = this;
        if(!self.isSelected) return false;
        return self.selectedList.some(uuid => self.dbData.autoScalingGroup[uuid].state !== 'Enabled');
      },
      canDisable(){
        let self = this;
        if(!self.isSelected) return false;
        return self.selectedList.some(uuid => self.dbData.autoScalingGroup[uuid].state !== 'Disabled');
      },
      goToDetail(uuid){
        let self = this;
        self.$router.push({
          name: 'detailAutoScalingGroup',
          params: {
            uuid
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>
