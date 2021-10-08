<template>
   <div class="container">
     <div class="page-toolbar-container">
       <el-row>
         <el-col :span="14">
           <span class="detail-list-title">{{$t('common.user')}}{{$t('common.colon')}}</span>
           <drop-down class="detail-dropdown" v-if="!dbData.common.isAdmin">
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content">
                <a style="margin-top: 12px;" @click="!isSelected && attachUser()" :class="{'disabled-text': isSelected}">{{$t('common.addUser')}}</a>
                <a @click="isSelected && pageRemoveUser()" :class="{'disabled-text': !isSelected}">{{$t("user.remove")}}</a>
                <a @click="isSelected && pageDelete()" style="padding-bottom:12px;" :class="{'disabled-text': !isSelected}">{{$t('common.destroy')}}</a>
              </div>
            </span>
           </drop-down>
         </el-col>
         <el-col :span="10" style="text-align: right">
          <span style="display: inline-block;">
            <el-input :placeholder="$t('common.searchPlaceholder')" v-model="searchStr" @blur="search()"
                      @change="search()">
               <el-select v-model="selectVal" slot="prepend" :placeholder="$t('common.searchLabelPlaceholder')"
                          style="width: 105px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
         </el-col>
       </el-row>
     </div>
     <div >
       <el-table
       :data="itemList"
       @selection-change="handleSelect">
          <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
         <el-table-column :type="!dbData.common.isAdmin ? 'selection' : ''" width="55px;"></el-table-column>
         <el-table-column :label="$t('common.name')">
           <template slot-scope="scope">
             <span class="link">{{scope.row.name}}</span>
           </template>
         </el-table-column>
         <el-table-column :label="$t('common.createDate')">
           <template slot-scope="scope">
             {{scope.row.createDate && formatDatetime(new Date(scope.row.createDate))}}
           </template>
         </el-table-column>
       </el-table>
       <div class="page-table-pagination">
         <el-pagination v-if="windowData.total > 0"
           :page-sizes="[10, 20, 50, 100]"
           :page-size="windowData.pageSize"
           layout="total, sizes, prev, pager, next, jumper"
           :total="windowData.total"
           class="page-table-pagination"
           @current-change="pageCurrentChange"
           @size-change="pageSizeChange"
           :current-page="windowData.pageIndex">
         </el-pagination>
       </div>
     </div>
   </div>
</template>

<script>
  import UserList from 'src/om/user/List';
  import Utils from 'src/utils/utils';
  import rpc from 'src/utils/rpc';
  import WindowBase from 'src/windows/Window';
  export default {
    name: "UserTabList",
    mixins: [UserList, WindowBase],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    computed: {
      isSingleSelected(){
        let self = this;
        return self.windowData.selectedUuidList.length === 1;
      },
      isSelected(){
        let self = this;
        return self.windowData.selectedUuidList.length >=1;
      },
      selectedList(){
        let self = this;
        return self.windowData.selectedUuidList;
      }
    },
    data(){
      return {
        searchStr: '',
        selectVal: 'name',
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
        dataUuid: self.param.uuid ? self.param.uuid : '',
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
        conditions: self.param && self.param.conditions ? self.param.conditions : []
      })
        .then(() => {
          self.queryList();
        })
    },
    methods: {
      ...Utils,
      search(){
       let self = this;
       self.updateWindow({
         pageIndex: 1
       })
         .then(() => {
           self.queryList();
         })
      },
      getCondition(){
        let self = this, conditionList = [];
        if(self.windowData.conditions){
         conditionList.push(self.windowData.conditions);
        }
        if (self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
        }
        return conditionList
      },
      pageCurrentChange(val){
        let self = this;
        self.updateWindow({
          pageIndex: val
        })
      },
      pageSizeChange(size){
        let self = this;
        self.updateWindow({
          pageSize: size,
          pageIndex: 1
        })
      },
      attachUser(){
        let self = this
        if (self.isSelected) return
        self.openDialog('UserSelectConfirmDlg', {
          uuid: self.windowData.dataUuid,
          select: (uuidList) => {
            self.addUser(uuidList, self.windowData.dataUuid).then(() => self.queryList())
          }
        })
      },
      pageRemoveUser: function () {
        let self = this
        if (self.selectedList.length === 0) return
        let event = self.createEvent('user.action.removeUserFromGroup', self.selectedList.length === 1 ? self.dbData.user[self.selectedList[0]].name : '', self.selectedList.length)
        let tasks = []
        self.selectedList.forEach((uuid) => {
          let p = rpc._delete(`accounts/groups/${self.windowData.dataUuid}/users/${uuid}`, event)
            .then((resp) => {
              let newUuidList = self.windowData.uuidList.filter((_uuid) => uuid !== _uuid)
              let newTable = _.cloneDeep(self.windowData.table)
              delete newTable[uuid]
              self.updateWindow({
                uuidList: newUuidList,
                table: newTable
              })
              self.incEventSuccess(event)
            }, () => {
              self.incEventFail(event)
            })
          tasks.push(p)
        })
        Promise.all(tasks).then(() => self.queryList())
      },
      handleSelect(rows){
        let self =this, uuidList = []
        uuidList = rows.map((item) => {
          return item.uuid;
        })
        self.updateWindow({
          selectedUuidList: uuidList,
        })
      },
    }
  }
</script>

<style scoped>

</style>
