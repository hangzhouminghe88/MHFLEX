<template>
  <dialog-template width="1000px">
    <div slot="title" class="modal-plain-header">
      <span>选择网络</span>
      <span class="el-icon-close dialog-close" @click="close()"></span>
    </div>
    <div slot="body">
      <div style="padding: 30px;">
        <div class="page-toolbar-container" style="display: flex">
          <div class="page-toolbar-left">
            <component :is="typeListItem.ctrl" :param="typeListItem.param"></component>
          </div>
          <div class="page-toolbar-center"></div>
          <div class="page-toolbar-right">
            <span style="padding: 0 15px;display: inline-block;position: relative;">
            <el-input @blur="search()" @change="search()" placeholder="请输入内容" v-model="searchStr">
               <el-select placeholder="请选择" slot="prepend" style="width: 100px" v-model="selectVal">
                   <el-option :key="index" :label="$t(`${item.name}`)" :value="item.value"
                              v-for="(item, index ) in conditionNameList"></el-option>
               </el-select>
              <span slot="append"><i class="el-icon-search icon"></i></span>
            </el-input>
          </span>
          </div>
        </div>
        <el-table :data="itemList" highlight-current-row @row-click="handleSingleSelect" v-loading="loading">
           <span slot="empty" class="table-nodata">
            <p class="empty-text" v-text="$t('common.noData')"></p>
          </span>
          <el-table-column width="50px">
            <template slot-scope="scope">
              <el-radio v-model="templateRadio" :label="scope.row.uuid">&nbsp</el-radio>
            </template>
          </el-table-column>
          <el-table-column :label="$t('common.name')" prop="name"></el-table-column>
          <el-table-column :label="$t('common.networkType')">
            <template slot-scope="scope">
              {{(scope.row.category === 'Public' || scope.row.category === 'System') ? $t(`common.${scope.row.category}`) : (scope.row.networkServiceType ? $t(`l3network.type.${scope.row.networkServiceType}`) : '')}}
            </template>
          </el-table-column>
          <el-table-column :label="$t('l3network.current')">
            <template slot-scope="scope">
              {{`${ scope.row.availableCapacity} / ${scope.row.totalCapacity}`}}
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
    <div slot="footer" class="dialog-footer">
      <span class="btn-confirm" @click="select()">{{$t('common.confirm')}}</span>
      <span class="btn-cancel"  @click="close()">{{$t('common.cancel')}}</span>
    </div>
  </dialog-template>
</template>

<script>
  import PanelTypeList from 'src/component/FullPanel/PanelTypeList';
  import WindowBase from 'src/windows/Window';
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import Utils from 'src/utils/utils';
  import {mapGetters} from 'vuex';
  import _ from 'lodash';
  export default {
    name: "PrivateAndPublicL3NetworkSingleSelectListDlg",
    mixins: [WindowBase, MultiSelectList],
    components: {
      PanelTypeList
    },
    computed: {
      ...mapGetters({
        getList: 'l3network/getList'
      }),
      itemList(){
        let self = this;
        return self.getList(self.windowData.uuidList);
      }
    },
    data(){
      let self = this;
      return {
        currSelectTab: 'private',
        typeList: [
          {typeName: 'privateNetwork', value: 'private'},
          {typeName: 'publicNetwork', value: 'public'},
          {typeName: 'networkTypevpc', value: 'vpc'}
        ],
        typeListItem: {
          param: {
            getTypeList: () => {
              return self.typeList
            },
            setIndex: (index) => {
              self.currSelectTab = this.typeList[index].value;
              self.updateWindow({
                sortBy: 'createDate',
                sortDirection: '-',
                pageIndex: 1,
                pageCount: 1,
                total: 0,
                pageSize: 5,
              })
                .then(() => {
                  self.queryList();
                })
            },
            getIndex: () => {
              return _.findIndex(this.typeList, it => it.value === this.currSelectTab)
            }
          },
          ctrl: PanelTypeList
        },
        selectVal: 'name',
        searchStr: '',
        conditionNameList: [
          {name: 'common.name', value: 'name'},
          {name: 'UUID', value: 'uuid'}
        ],
        conditions: {
          'false': 'state!=Destroyed',
          'true': 'state=Destroyed'
        },
        hideTabList: [],
        templateRadio: '',
        loading: false
      }
    },
    created(){
      let selectedItems = {
        private: [],
        public: [],
        vpc: []
      }
      if (this.dialogData.param && this.dialogData.param.hideTabList) this.hideTabList = this.dialogData.param.hideTabList;
      this.updateWindow({
        pageIndex: 1,
        pageCount: 1,
        pageSize: 20,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedItems,
        methods: {
          queryList: this.queryList
        }
      }).then(() => this.queryList())
    },
    methods: {
      ...Utils,
      queryList(){
        let self = this;
        self.loading = true;
        return self
          .dispatchAction("l3network/query", {
            start: (self.windowData.pageIndex - 1) * self.windowData.pageSize,
            limit: self.windowData.pageSize,
            q: self.getCondition(),
            sortDirection: self.windowData.sortDirection,
            sortBy: self.windowData.sortBy,
            replyWithCount: true
          })
          .then(resp => {
            let uuidList = resp.uuidList;
            return self
              .updateWindow({
                uuidList,
                table: Utils.createTableObjFromUuidList(resp.uuidList),
                total: resp.total
              })
          }).then(() => {
            self.loading = false;
          })
      },
      getCondition: function () {
        let conditionList = []
        switch (this.currSelectTab) {
          case 'private':
            conditionList = ['category=Private', 'type=L3BasicNetwork']
            break
          case 'public':
            conditionList = ['category=Public', 'type=L3BasicNetwork']
            break
          case 'vpc':
            conditionList = ['category=Private', 'type=L3VpcNetwork', 'vmNic.uuid+not+null', 'vmNic.vmInstance.state=Running', 'vmNic.vmInstance.type=ApplianceVm']
            break
        }
        conditionList.push(`zoneUuid=${window.localStorage.getItem('currZoneUuid')}`)
        conditionList = conditionList.concat(this.dialogData.param.conditions)
        if (this.selectVal !== '' && this.searchStr !== '') {
          conditionList = conditionList.concat(`${this.selectVal}~=%25${encodeURIComponent(this.searchStr)}%25`)
        }
        return conditionList
      },
      select() {
        let self = this;
        if(!self.templateRadio) return;
        this.dialogData.param.select(self.templateRadio);
        self.close();
      },
      handleSingleSelect(row){
        let self = this;
        self.templateRadio = row.uuid;
      },
      close(){
        let self = this;
        self.closeDialog(self.windowId);
      }
    }
  }
</script>

<style scoped>

</style>
