<template>
  <dialog-template>
    <div class="modal-plain-header" slot="title">
      <span class="title">{{$t('common.changeResourceOwner')}}</span>
      <span @click="cancel()" class="el-icon-close dialog-close"></span>
    </div>
    <div class="dialog-body-container" slot="body">
      <div class="radio-group">
        <span style="display: inline-block;">
          <component :is="typeListItem.ctrl" :param="typeListItem.param"/>
        </span>
         <span style="padding: 0 15px;display: inline-block; text-align: right">
            <el-input placeholder="请输入内容" v-model="searchStr" @blur="search()" @change="search()">
               <el-select v-model="selectVal" slot="prepend" placeholder="请选择" style="width: 100px">
                   <el-option v-for="(item, index ) in conditionNameList" :label="$t(`${item.name}`)" :key="index"
                              :value="item.value"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
      </div>
      <el-table :data="itemList" @click="handleSelect">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection"></el-table-column>
        <el-table-column :label="'CN/uid'" prop="cn"></el-table-column>
        <el-table-column :label="$t('common.name')">
          <template slot-scope="scope">
            {{scope.row.name ? scope.row.name : void 0}}
          </template>
        </el-table-column>
        <el-table-column :label="'distinguishedName/entryDN'" prop="dn"></el-table-column>
      </el-table>
      <div class="page-table-pagination">
        <el-pagination v-if="windowData.total > 0"
          :page-sizes="[5, 10]"
          :page-size="5"
          :total="windowData.total"
          class="page-table-pagination"
          layout="total, sizes, prev, pager, next"
          @current-change="pageCurrentChange"
          @size-change="pageSizeChange"
          :current-page="windowData.pageIndex"></el-pagination>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="confirm()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel" @click="cancel()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';
  import PanelTypeList from "../../component/FullPanel/PanelTypeList";
  import LdapEntryList from 'src/om/ldapEntry/List';
  import rpc from 'src/utils/rpc';
  import _ from 'lodash';
  export default {
    name: "LdapEntryMultiSelectListDlg",
    components: {PanelTypeList},
    mixins: [WindowBase, LdapEntryList, MultiSelectList],
    data(){
      return {
        typeList: [
          {typeName: 'user', value: 'user'},
          {typeName: 'usergroup', value: 'usergroup'}
        ],
        typeListItem: {
          param: {
            id: 'tabListType',
            getIndex: () => {
              return _.findIndex(this.typeList,(item) => { return item.value === this.windowData.currSelectTab})
            },
            setIndex: (index) => {
              return this.windowData.currSelectTab = this.typeList[index].value;
            },
            getTypeList:() => this.typeList
          },
          ctrl: PanelTypeList
        },
        selectVal: 'CN',
        searchStr: '',
        conditionNameList: [
          {
            name: 'CN',
            value: 'cn'
          },
          {
            name: 'uid',
            value: 'uid'
          },
        ]
      }
    },
    created(){
      let self = this;
      let conditionString = '(|(objectclass=user)(objectclass=person))'
      if (this.dialogData.param && this.dialogData.param.conditionString) {
        conditionString = this.dialogData.param.conditionString
      }
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        sortBy: 'createDate',
        sortDirection: '-',
        currSelectTab: 'user',
        conditionString,
        searchDataList: [],
        searchDataKey: [],
        selectedUuidList: [],
        methods: {
          queryList: this.queryList
        }
      }).then(() => this.queryList())
    },
    methods: {
      cancel(){
        let self = this;
        self.closeDialog(self.windowId);
      },
      search(){
        let self = this;
        self.updateWindow({
          pageIndex: 1
        }).then(() => {
          //self.queryList();
        })
      },
      getCondition: function () {
        let conditionString = ''
        switch (this.windowData.currSelectTab) {
          case 'user':
            conditionString = '(|(objectclass=user)(objectclass=person))'
            break
          case 'group':
            conditionString = '(|(objectclass=group)(objectclass=groupOfUniqueNames))'
            break
        }
        conditionString = this.setConditionString(conditionString, this.dialogData.param.conditionString)
        if (this.windowData.searchConditionList && this.windowData.searchConditionList.length > 0) {
          this.windowData.searchConditionList[0].replace(/~/g, '').replace(/%25/g, '*')
          conditionString = this.setConditionString(conditionString, this.windowData.searchConditionList[0].replace(/~/g, '').replace(/%25/g, '*'))
        }
        conditionString = encodeURIComponent(conditionString)
        return conditionString
      },
      setConditionString: function (basic, increase) {
        let conditionString = '(&(' + basic + ')(' + increase + '))'
        return conditionString
      },
      queryList: function () {
        const self = this
        let queryCondition = self.getCondition()
        return rpc.query('ldap/entries/candidates', {
          ldapFilter: queryCondition
        }).then(resp => {
          let pageCount = resp.inventories.length === 0 ? 1 : Math.ceil(resp.inventories.length / self.windowData.pageSize)
          self.updateWindow({
            availableCount: resp.inventories.length,
            pageCount: pageCount
          })
          let searchDataKey = []
          let uuidList = []
          resp.inventories.forEach(item => {
            item.uuid = item.dn
            uuidList.push(item.uuid)
            item.attributes.forEach(it => {
              item[it.id] = it.values.toString()
              searchDataKey.push(it.id)
            })
            searchDataKey.push('dn')
            searchDataKey.push('uuid')
          })
          searchDataKey = _.uniq(searchDataKey)
          let list = _.chunk(uuidList, self.windowData.pageSize)
          let table = {}
          uuidList.forEach((uuid) => {
            table[uuid] = {
              selected: false
            }
          })
          return self.updateDbTable({
            tableName: 'ldapEntry',
            list: resp.inventories
          }).then(() => {
            return self.updateWindow({
              searchDataList: resp.inventories,
              searchDataKey: searchDataKey,
              uuidList: list[self.windowData.pageIndex - 1],
              table
            })
          }).then(() => {
            return self.searchHandler(self.searchStr)
          })
        })
      },
      searchHandler: function (str) {
        const self = this
        let uuidList = null
        let result = self.fullTextSearch(self.windowData.searchDataList, str)
        if (str === '' || str === undefined) {
          uuidList = self.windowData.searchDataList.map(it => it.uuid)
        } else {
          uuidList = result.map(it => it.uuid)
        }
        let list = _.chunk(uuidList, self.windowData.pageSize)
        let table = {}
        uuidList.forEach((uuid) => {
          table[uuid] = {
            selected: false
          }
        })
        let pageCount = uuidList.length === 0 ? 1 : Math.ceil(uuidList.length / self.windowData.pageSize)
        self.updateWindow({
          availableCount: uuidList.length,
          pageCount: pageCount
        })
        return self.updateWindow({
          uuidList: list[self.windowData.pageIndex - 1],
          table
        })
      },
      fullTextSearch: function (list, str) {
        let result = []
        if ((list.length <= 0) || (str === '') || (str === undefined)) return result
        list.forEach(item => {
          if (JSON.stringify(item).toLocaleLowerCase().indexOf(str.toLocaleLowerCase()) > -1) {
            result.push(item)
          }
        })
        return result
      },
      confirm(){
        let self = this;
        if(!self.isSelected) return;
        self.dialogData.param.select(self.selectedList);
        self.cancel();
      }
    }
  }
</script>

<style scoped>
.radio-group{
  display: flex;
  justify-content: space-between;
  padding: 20px 0px;
}
</style>
