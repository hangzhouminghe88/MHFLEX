<template>
  <div class="container">
    <el-row style="height: 55px;">
      <el-col :span="2.2">
        <ul class="tab-container">
          <li :class="{'active': currSelectTab === 'vm'}" @click="changeTab('vm')">{{$t('common.vm')}}</li>
          <li :class="{'active': currSelectTab === 'volume'}" @click="changeTab('volume')">{{$t('common.volume')}}</li>
        </ul>
      </el-col>
      <el-col :span="3" style="margin-top: 4px;">
        <drop-down class="detail-dropdown">
          <span slot="title">
            <span class="text">{{$t('common.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="padding: 12px 0px;" @click="isSelected && pageTagDetach()" :class="{'disabled-text': !isSelected}">{{$t('tag.detach')}}</a>
            </div>
          </span>
        </drop-down>
      </el-col>
      <el-col :span="5" class="search">
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
    <el-table
    :data="itemList"
    @selection-change="handleSelectList">
       <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
      <el-table-column type="selection"></el-table-column>
      <el-table-column :label="$t('common.name')">
        <template slot-scope="scope">
          <span class="link">{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.create')">
        <template slot-scope="scope">
          {{formatDatetime(new Date(scope.row.createDate))}}
        </template>
      </el-table-column>
    </el-table>
    <div class="page-table-pagination">
      <el-pagination v-if="windowData.total > 0"
        :current-page="windowData.pageIndex"
        :page-size="10"
        :page-sizes="[10, 20, 50, 100]"
        :total="windowData.total"
        @current-change="pageCurrentChange"
        @size-change="pageSizeChange"
        class="page-table-pagination"
        layout="total, sizes, prev, pager, next"></el-pagination>
    </div>
  </div>
</template>

<script>
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import WindowBase from 'src/windows/Window';
  import Utils from 'src/utils/utils';
  import {mapGetters} from 'vuex';

  export default {
    name: "BindTagForResourceTab",
    mixins: [MultiSelectList, WindowBase],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data() {
      return {
        currSelectTab: 'vm',
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
        selectVal: 'name',
        searchStr: '',
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
        selectedUuidList: []
      })
        .then(() => {
          self.query();
        })
    },
    computed: {
      ...mapGetters({
        getVm: 'vm/get',
        getVolume: 'volume/get'
      }),
    },
    methods: {
      ...Utils,
      changeTab(tabName) {
        let self = this;
        if (self.currSelectTab === tabName) return;
        self.currSelectTab = tabName;
        self.itemList = [];
        self.updateWindow({
          pageIndex: 1,
          pageSize: 10,
          selectedUuidList: []
        }).then(() => {
          self.query();
        })
      },
      getCondition () {
        let conditionList = [], self = this;
        if (self.param && self.param.uuid) {
          conditionList.push(`__tagUuid__=${this.param.uuid}`)
        }
        if (self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`)
        }
        return conditionList
      },
      query(){
        let self = this;
        if(self.currSelectTab ===  'vm') self.queryVmList.bind(self)();
        if(self.currSelectTab === 'volume') self.queryVolumeList.bind(self)();
      },
      queryVmList () {
        let self = this;
        return this.dispatchAction('vm/query', {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          q: this.getCondition(),
          sortBy: this.windowData.sortBy,
          sortDirection: this.windowData.sortDirection
        }).then(resp => {
          return this.updateWindow({
            uuidList: resp.uuidList,
            table: Utils.createTableObjFromUuidList(resp.uuidList),
            pageCount: Utils.computePageCount(resp.total, this.windowData.pageSize),
            total: resp.total
          })
        })
          .then(() => {
            self.itemList = this.getVm(self.windowData.uuidList)
          })
      },
      queryVolumeList () {
        let self = this;
        return this.dispatchAction('volume/batchQuery', {
          start: (this.windowData.pageIndex - 1) * this.windowData.pageSize,
          limit: this.windowData.pageSize,
          q: this.getCondition(),
          sort: `${this.windowData.sortDirection}${this.windowData.sortBy}`
        }).then(resp => {
          return this.updateWindow({
            uuidList: resp.uuidList,
            table: Utils.createTableObjFromUuidList(resp.uuidList),
            pageCount: Utils.computePageCount(resp.total, this.windowData.pageSize),
            total: resp.total
          })
        })
          .then(() => {
            self.itemList = this.getVolume(self.windowData.uuidList)
          })
      },
      pageTagDetach(){
        let self = this;
        if(!self.isSelected) return;
        let paramList = [{
          uuid: self.param.uuid,
          resourceUuidList: self.selectedList
        }]
        let paramObj = {
          title: 'tag.detachResource',
          description: self.currSelectTab === 'vm' ? 'tag.detachVmDescription' : 'tag.detachVolumeDescription',
          icon: self.currSelectTab === 'vm' ? 'vm_plain' : 'volume_popupico',
          uuidList: self.selectedList,
          getName(uuid){
            return self.dbData[self.currSelectTab][uuid].name
          },
          ok(){
            self.dispatchActionWithEvent('tag/detach', paramList).then(() => {
              self.query()
              if (self.param.refresh) self.param.refresh()
            })
          }
        }
        self.openDialog('ConfirmDlg', paramObj)
      },
      handleSelectList(rows){
        let self = this, uuidList = [];
        uuidList = rows.map((row) => {
          return row.uuid;
        })
        self.updateWindow({
          selectedUuidList: uuidList
        })
      }
    }
  }
</script>

<style scoped lang="less">
  .tab-container {
    display: inline-block;
    border-radius: 3px;
    cursor: pointer;
    transition: all ease-out 0.5s;
    margin-right: 20px;
    background-color: #e9edfa;

    li {
      display: inline-block;
      padding: 10px 20px;
      border-radius: 2px;
      font-size: 12px;

      &:last-child {
        margin: 0px -1px;
      }
    }

    .active {
      background-color: #5e7ce0;
     transition: background-color cubic-bezier(0.5, 0.8, 0.5, 1) 0.5s,
      background-color ease-in 0.5s;
     color: #fff;
    }
  }

  .search {
    float: right;
    margin-right: 25px;
  }
</style>
