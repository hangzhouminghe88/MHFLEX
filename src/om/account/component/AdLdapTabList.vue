<template>
  <div class="container">
    <div class="page-toolbar-container">
      <el-row>
        <el-col :span="14">
          <span class="detail-list-title">
            {{`AD/LDAP${$t('common.colon')}`}}
          </span>
          <drop-down class="detail-dropdown">
            <span slot="title">
              <span class="text">{{$t('common.actions')}}</span>
            </span>
            <span slot="content">
              <div class="dropdown-content" style="padding: 4px 20px;">
                <a style="padding-top:12px;" @click="!isSelected && pageCreateLdapBinding()" :class="{'disabled-text': isSelected || !dbData.common.isAdmin }">{{$t("common.attachLDAP")}}</a>
                <a style="padding-bottom:12px;" @click="isSelected && dbData.common.isAdmin && pageDeleteLdapBinding(windowData.dataUuid)" :class="{'disabled-text': !isSelected || !dbData.common.isAdmin}">{{$t("common.detachLDAP")}}</a>
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
    <div class="page-table-container">
      <el-table
      :data="itemList"
      @selection-change="handleSelection">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection"></el-table-column>
        <el-table-column :label="'CN/uid'" prop="cn"></el-table-column>
        <el-table-column :label="$t('common.type')">
          <template slot-scope="scope">
            {{scope.row.name ? scope.row.name : void 0}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.createDate')">
          <template slot-scope="scope">
            {{formatDatetime(scope.row.createDate)}}
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="page-table-pagination">
      <el-pagination v-if="windowData.availableCount > 0"
        :page-sizes="[5, 10]"
        :page-size="5"
        :total="windowData.availableCount"
        class="page-table-pagination"
        layout="total, sizes, prev, pager, next"
        @current-change="pageCurrentChange"
        @size-change="pageSizeChange"
        :current-page="windowData.pageIndex"></el-pagination>
    </div>
  </div>
</template>

<script>
  import WindowBase from 'src/windows/Window';
  import rpc from 'src/utils/rpc';
  import AccountList from 'src/om/account/List';

  export default {
    name: "AdLdapTabList",
    mixins: [WindowBase, AccountList],
    props: ['param'],
    data() {
      return {
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'common.uuid', value: 'uuid'}
        ],
        itemList: []
      }
    },
    created() {
      let dataUuid = this.param.uuid
      this.updateWindow({
        pageIndex: 1,
        pageSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        dataUuid: dataUuid,
        selectedUuidList: [],
        methods: {
          queryList: this.queryList
        }
      }).then(() => this.queryList())
    },
    computed: {
      isSelected(){
        let self = this;
        return self.windowData.selectedUuidList.length >= 1;
      },
      selectedList(){
        let self = this;
        return self.windowData.selectedUuidList;
      },
      isSingleSelected(){
        let self = this;
        return self.windowData.selectedUuidList.length === 1;
      },
    },
    methods: {
      getCondition: function () {
        let conditionList = []
        let conditions = this.param && this.param.conditions ? this.param.conditions : []
        conditionList = conditionList.concat(conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`);
        }
        return conditionList
      },
      queryList: async function () {
        const self = this
        let resp = await rpc.query('ldap/bindings', {
          count: false,
          start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
          limit: self.windowData.pageSize,
          replyWithCount: true,
          q: self.getCondition(),
          sort: `${self.windowData.sortDirection}${self.windowData.sortBy}`
        })
        self.updateWindow({
          pageCount: resp.total === 0 ? 1 : Math.ceil(resp.total / self.windowData.pageSize),
          availableCount: resp.total
        })
        let uuidList = resp.inventories.map((item) => item.uuid)
        let table = {}
        uuidList.map((uuid) => {
          table[uuid] = {
            selected: false
          }
        })
        self.updateWindow({uuidList, table})
        self.updateDbTable({
          tableName: 'ldapBinding',
          list: resp.inventories
        })
        uuidList.forEach(uuid => {
          ((uuid) => {
            rpc.query('ldap/entry', {
              ldapFilter: self.dbData.ldapBinding[uuid].ldapUid.split(',')[0]
            }).then((resp) => {
              if (resp.inventories.length > 0) {
                let ldapBinding = _.cloneDeep(self.dbData.ldapBinding[uuid])
                let ldapEntry = resp.inventories
                for (let i = ldapEntry.length - 1; i >= 0; i--) {
                  for (let j = ldapEntry[i].attributes.length - 1; j >= 0; j--) {
                    if ((ldapEntry[i].attributes[j].id === 'objectClass')) {
                      if ((ldapEntry[i].attributes[j].values.indexOf('user') > -1 || ldapEntry[i].attributes[j].values.indexOf('person') > -1) && (ldapEntry[i].dn === ldapBinding.ldapUid)) {
                        ldapBinding.type = 'user'
                        break
                      }
                      if ((ldapEntry[i].attributes[j].values.indexOf('group') > -1 || ldapEntry[i].attributes[j].values.indexOf('groupOfUniqueNames') > -1) && (ldapEntry[i].dn === ldapBinding.ldapUid)) {
                        ldapBinding.type = 'group'
                        break
                      }
                    }
                  }
                }
                return self.updateDbRow({
                  tableName: 'ldapBinding',
                  id: uuid,
                  data: ldapBinding
                })
              } else {
                return ''
              }
            })
          })(uuid)
          self.itemList = getData();
        })
      },
      search() {
        let self = this;
        self.updateWindow({
          pageIndex: 1
        })
          .then(() => {
            self.queryList();
          })
      },
      getData(){
        let self = this;
        return self.windowData.uuidList.map((uuid) => {
          return self.dbData.ldapBinding[uuid];
        })
      },
      handleSelection(rows){
        let self = this, uuidList = [];
        uuidList = rows.map((row) => {
          return row.uuid;
        })
        self.updateWindow({
          selectedUuidList: uuidList
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
    }
  }
</script>

<style scoped>

</style>
