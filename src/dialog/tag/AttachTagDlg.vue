<template>
  <dialog-template>
    <div slot="title" class="modal-plain-header">
      <span>{{ $t("tag.attach") }}</span>
      <span class="el-icon-close dialog-close" @click="cancel()"></span>
    </div>
    <div slot="body" class="dialog-body-container">
      <div class="page-toolbar-container" style="display: inline-block;width: 94%;">
         <component :param="typeListItem.param" :is="typeListItem.ctrl" v-if="showTab"/>
         <div style="float: right;">
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
        </div>
      </div>
      <div class="dialog-body-content">
        <el-table :data="itemList"
        @selection-change="handleChangeSelect">
           <span slot="empty" class="table-nodata">
            <p class="empty-text" v-text="$t('common.noData')"></p>
          </span>
          <el-table-column type="selection"></el-table-column>
          <el-table-column :label="$t('common.name')" prop="name"></el-table-column>
          <el-table-column :label="$t('common.color')" prop="color">
            <template slot-scope="scope">
              <span style="width: 16px;height: 16px;display: inline-block" :style="{'background-color': scope.row.color}"></span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('tag.allResourceCount')" prop="resourceName">
            <template slot-scope="scope">
              {{getResourceCount(scope.row)}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.owner')" prop="ownerName"></el-table-column>
          <el-table-column :label="$t('common.createDate')">
            <template slot-scope="scope">
              {{new Date(scope.row.createDate) | formatDatetime}}
            </template>
          </el-table-column>
        </el-table>
        <div class="page-table-pagination">
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
      </div>
    </div>
    <div slot="footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.ok')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import FullPanelTypeList from 'src/component/FullPanel/PanelTypeList';
  import DialogTemplate from "../DialogTemplate";
  import TagList from "src/om/tag/List";
  import Utils from 'src/utils/utils';
  import {mapGetters} from 'vuex';
  import _ from 'lodash'

  export default {
      name: "AttachTagDlg",
      mixins: [WindowBase, TagList, MultiSelectList],
      components: {DialogTemplate, FullPanelTypeList},
      data(){
        let self = this;
        return {
          tabList:[
            {
              typeName: 'admin',
              value: 'admin',
              permission: 'LICENSE_BASIC_COMMUNITY'
            },
            {
              typeName: 'other',
              value: 'other',
              permission: 'LICENSE_BASIC_PAID'
            },
          ],
          tabListType: 'admin',
          //设置tab切换
          typeListItem: {
            id: 'tabListType',
            param: {
              getTypeList: () => self.tabList,
              getIndex: () => {
                return _.findIndex(self.tabList, it => it.value === self.tabListType)
              },
              setIndex: (index) => {
                debugger
                if (self.tabList[index].value === self.tabListType) return;
                self.tabListType = self.tabList[index].value;
                self.queryList()
                // this.queryForAssistant()
              },
              getDisabled: self.genGetDisabled('tabListType')
            },
            ctrl: FullPanelTypeList
          },
          itemList: [],
          selectVal: 'name',
          searchStr: '',
          conditionNameList: [
            {name: 'common.name', value: 'name'},
            {name: 'common.uuid', value: 'uuid'}
          ]
        }
      },
      created(){
        let self  = this;
        self.updateWindow({
          pageIndex: 1,
          pageSize: 5,
          sortBy: 'createDate',
          sortDirection: '-',
          selectedUuildList:[],
          methods: {
            queryList: self.queryList
          }
        })
          .then(() =>{
            this.queryList();
          })
      },
      computed:{
        //判断是否展示tab
        showTab () {
          return this.dialogData.param.showTab
        },
        selectedList(){
          let self =this;
          if(self.windowData.selectedUuildList){
            return self.windowData.selectedUuildList
          }
          return []
        },
        ...mapGetters({
          getTag: 'tag/get',
          get: 'tag/get'
        })
      },
      methods: {
        //获得资源名称
        getResourceCount (item) {
          return item.resourceCount ? item.resourceCount : 0
        },
        confirm(){
          let self = this;
          if (this.selectedList.length === 0) return;
          if(self.dialogData.param.ok){
            self.dialogData.param.ok(self.selectedList, self.closeDialog(self.windowId));
          }
          self.closeDialog(self.windowId);
        },
        cancel(){
          let self = this;
          self.closeDialog(self.windowId);
        },
        genGetDisabled(){

        },
        getCurrAccountUuid () {
          if (!this.showTab) {
            return this.dialogData.param.accountUuid
          } else {
            if (this.tabListType === 'admin') {
              return this.dialogData.param.currAccountUuid
            } else {
              return this.dialogData.param.resourceOwnerUuid
            }
          }
        },
        getCondition: function () {
          let conditionList = [];
          if (!this.showTab) {
            conditionList = conditionList.concat(this.dialogData.param.conditions)
          } else {
            if (this.tabListType === 'admin') {
              conditionList = conditionList.concat(this.dialogData.param.currAccountCondition)
            } else {
              conditionList = conditionList.concat(this.dialogData.param.resourceOwnerCondition)
            }
          }
          conditionList = conditionList.concat(this.getSearchCondition());
          return conditionList
        },
        getSearchCondition () {
          let queryType = 'zql';
          if (this.dialogData.param.queryType === 'normal') {
            queryType = 'normal'
          }
          let searchConditionList = [];
          if (queryType === 'normal') {
            if (this.selectVal !== '' && this.searchStr !== '') {
              searchConditionList = [`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`]
            }
          } else if (queryType === 'zql') {
           if (this.selectVal !== '' && this.searchStr !== '') {
              searchConditionList = [`${this.selectVal}~=%${encodeURIComponent(this.searchStr)}%`]
            }
          }
          return searchConditionList
        },
        queryList () {
          let self = this;
          self.updateWindow({
            uuidList: []
          });
          let queryType = 'zql';
          if (self.dialogData.param.queryType === 'normal') {
            queryType = 'normal'
          }
          let p;
          if (queryType === 'normal') {
            p = self.dispatchAction('tag/query', {
              start: (self.windowData.pageIndex - 1) * this.windowData.pageSize,
              limit: self.windowData.pageSize,
              q: self.getCondition(),
              sort: `${self.windowData.sortDirection}${this.windowData.sortBy}`,
              replyWithCount: true
            })
          } else if (queryType === 'zql') {
            let accountUuid = this.getCurrAccountUuid();
            if (accountUuid === '') {
              this.itemList =  self.get(self.windowData.uuidList);
              this.updateWindow({
                availableCount: 0
              })
              return Promise.resolve()
            }
            p = self.dispatchAction('tag/queryByAccount', {
              start: (self.windowData.pageIndex - 1) * this.windowData.pageSize,
              limit: self.windowData.pageSize,
              q: self.getCondition(),
              sortDirection: self.windowData.sortDirection,
              sortBy: self.windowData.sortBy,
              type: 'my',
              accountUuid,
              replyWithCount: true
            })
          }
          return p.then(resp => {
            let uuidList = resp.uuidList;
            this.dispatchAction('tag/queryResourceCount', uuidList);
            return self.updateWindow({
              uuidList,
              table: Utils.createTableObjFromUuidList(uuidList),
              pageCount: Utils.computePageCount(resp.total, self.windowData.pageSize),
              availableCount: resp.total
            })
          }).then(() => {
            this.itemList =  self.get(self.windowData.uuidList);
          })
        },
        pageSizeChange(val) {
          this.updateWindow({
            pageSize: val
          })
        },
        pageCurrentChange(val) {
          this.updateWindow({
            pageIndex: val
          })
        },
        handleChangeSelect(row){
          let self = this;
          let uuidList =  row.map((item) => {
            return item.uuid;
          });
          self.updateWindow({
            selectedUuildList: uuidList
          })
        }
      }
    }
</script>

<style scoped>
 .dialog-body-header{
   padding: 30px 20px 20px;
 }
  .dialog-body-content{
    padding: 0px 20px;
  }
  .dialog-body-container{
    max-height: 600px;
    overflow-y: auto;
    margin-bottom: 20px;
  }
</style>
