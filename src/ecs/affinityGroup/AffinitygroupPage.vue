<template>
  <page-template>
    <div slot="page-header">
      <el-row :gutter="10">
        <el-col :span="2">
          <span class="page-header-title" v-text="$t('common.affinitygroup')"></span>
        </el-col>
        <el-col :span="2.2">
          <el-tabs @tab-click="setTabVal" v-model="currTab">
            <el-tab-pane :label="`${$t('common.available')}(${windowData.availableCount ? windowData.availableCount : 0 })`" name="available"></el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
    <div slot="page-toolbar" class="page-toolbar-container">
      <el-row type="flex" justify="space-between">
        <div style="flex-shrink: 0;">
          <span class="btn-success" @click="goToCreate();"><i class="el-icon-plus icon"></i>{{$t('affinityGroup.create')}}</span>
          <span class="btn-primary" v-permission="'AG.CHANGE_AG_STATE'" :class="{ 'disabled': !isSelected || inStates('Enabled')}" @click="isSelected && !inStates('Enabled') && pageStart()"><i
            class="el-icon-caret-right icon"></i>{{$t('common.start')}}</span>
          <span class="btn-primary" v-permission="'AG.CHANGE_AG_STOP'" :class="{ 'disabled': !isSelected} || inStates('Disabled')" @click="isSelected && !inStates('Disabled') && pageStop()"><i
            class="el-icon-remove-outline icon"></i>{{$t('common.stop')}}
          </span>
          <drop-down class="btn-primary more dropdown" :class="{'disabled': !isSelected}" :enabled="isSelected">
            <span slot="title">
               <i class="el-icon-more"></i>
               <span class="text">{{ $t("common.moreActions") }}</span>
            </span>
            <span slot="content">
              <transition name="fade" type="transition" mode="out-in">
                <div class="dropdown-content" style="padding: 4px 20px;">
                   <a v-permission="'AG.ADD_VM_2_AG'" style="padding-top: 12px;"
                      @click="isSingleSelected && canAddVmToAffinityGroup(selectedList[0])
                    && pageAddVmToAffinityGroup(queryList)"
                      :class="{ 'disabled-text': !isSingleSelected || !canAddVmToAffinityGroup(selectedList[0])}"
                   >
                     {{ $t("affinityGroup.addVm") }}
                   </a>
                  <a v-permission="'AG.REMOVE_VM_FROM_AG'"
                     @click="isSingleSelected && canRemoveVmFromAffinityGroup(selectedList[0]) && pageRemoveVmFromAffinityGroup(queryList)"
                     :class="{ 'disabled-text': !isSingleSelected || !canRemoveVmFromAffinityGroup(selectedList[0])}">
                    {{ $t("affinityGroup.removeVm") }}
                  </a>
                  <a v-permission="'LICENSE_BASIC_PAID'"
                     @click="isSelected && pageChangeResourceOwner()"
                     :class="{ 'disabled-text': !isSelected}" v-if="dbData.common.isAdmin">
                    {{$t("common.changeResourceOwner")}}
                  </a>
                  <a v-permission="'AG.DELETE'"
                     @click="pageDelete()" style="padding-bottom: 12px;">
                    {{$t("common.destroy")}}
                  </a>
                </div>
              </transition>
            </span>
          </drop-down>
        </div>
        <div style="text-align: right;flex-shrink: 0;">
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
      :data="affinitygroupList"
      @selection-change="handleSelect"
      @sort-change="handleSort"
      v-loading="windowData.loading">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection" width="50px;"></el-table-column>
        <el-table-column :label="$t('common.name')" prop="name" sortable show-tooltip-when-overflow>
          <template slot-scope="scope">
            <span class="link" @click="goToDetail(scope.row.uuid)">{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.strategy')" show-tooltip-when-overflow>
          <template slot-scope="scope">
            {{$t(`affinityGroup.${dbData.affinitygroup[scope.row.uuid].policy}`)}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.vm')" props="vmNums" show-tooltip-when-overflow>
          <template slot-scope="scope">
            {{dbData.affinitygroupA[scope.row.uuid].vmNums}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.status')" show-tooltip-when-overflow>
          <template slot-scope="scope">
            <table-body-item-state slot="item" :state="dbData.affinitygroup[scope.row.uuid].state"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.type')" prop="type" sortable show-tooltip-when-overflow></el-table-column>
        <el-table-column :label="$t('common.owner')">
          <template slot-scope="scope">
           {{dbData.affinitygroupA[scope.row.uuid].accountName}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.createDate')" prop="createDate" sortable show-tooltip-when-overflow>
          <template slot-scope="scope">
            {{new Date(scope.row.createDate) | formatDatetime}}
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
    import WindowBase from 'src/windows/Window';
    import PageBase from 'src/windows/PageBase';
    import AffinityGroupList from 'src/ecs/affinityGroup/List';
    import Utils from 'src/utils/utils';
    import TableBodyItemState from "../../component/TableBodyItemState";
    export default {
      name: "AffinitygroupPage",
      mixins: [AffinityGroupList, WindowBase, PageBase],
      components: {TableBodyItemState, PageTemplate},
      data(){
        return {
          currTab: 'available',
          searchStr: "",
          selectVal: 'name',
          conditionNameList: [
            {name: 'common.name', value: 'name'},
            {name: 'common.uuid', value: 'uuid'}
          ],
          affinitygroupList: []
        }
      },
      created(){
        let self = this;
        self.updateWindow({
          pageIndex: 1,
          pageSize: 10,
          sortBy: 'createDate',
          sortDirection: '-',
          selectUuidList: [],
          methods: {
            queryList: self.queryList
          }
        })
          .then(() => {
            self.queryList();
          })
      },
      computed:{
        isSelected(){
          let self = this;
          return self.windowData && self.windowData.selectUuidList.length >=1;
        },
        selectedList(){
          let self = this;
          return self.windowData && self.windowData.selectUuidList;
        },
        isSingleSelected(){
          let self = this;
          return self.windowData && self.windowData.selectUuidList.length ===1;
        }
      },
      methods: {
        ...Utils,
        search(){
          let self = this;
          self.updateWindow({
            pageIndex: 1
          }).then(() => {
            self.queryList()
          })
        },
        setTabVal(){

        },
        handleSort(e){
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
        pageSizeChange(val) {
          this.updateWindow({
            pageSize: val,
            pageIndex: 1,
          })
        },
        pageCurrentChange(val) {
          this.updateWindow({
            pageIndex: val
          })
        },
        getCondition () {
          let conditionList = []
          conditionList.push('appliance=customer')
          if (this.selectVal !=='' && this.searchStr !== '') {
            conditionList = conditionList.concat(`${this.selectVal}~=%${this.searchStr}%`)
          }
          return conditionList
        },
        handleSelect(rows){
          let self = this, uuidList = [];
          uuidList = rows.map((item) => {
            return item.uuid;
          });
          self.updateWindow({
            selectUuidList: uuidList
          })
        },
        goToCreate(){
          let self = this;
          self.$router.push({name: 'createAffinityGroup'})
        },
        goToDetail(uuid){
          let self = this;
          self.$router.push({
            name: 'detailAffinityGroup',
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
