<template>
  <div class="container">
    <div class="page-toolbar-container" style="display: flex">
      <div class="page-toolbar-left">
        <span>{{$t('common.host')}}{{$t('common.colon')}}</span>
        <drop-down class="detail-dropdown">
          <span  slot="title">
            <span class="text">{{$t('common.actions')}}</span>
          </span>
          <span slot="content">
            <div class="dropdown-content">
              <a style="margin-top: 12px;" @click="goToAddHost()">{{$t('host.add')}}</a>
              <a :class="{'disabled-text': inState('Enabled')}" @click="!inState('Enabled') && pageEnable()">{{$t('common.enable')}}</a>
              <a :class="{'disabled-text': inState('Disabled')}" @click="!inState('Disabled') && pageDisable()">{{$t('common.disable')}}</a>
              <a @click="!inState('Maintenance') && pageReconnect()"  :class="{'disabled-text':inState('Maintenance')}">{{$t('common.reconnect')}}</a>
              <a @click="!inState('Maintenance') && !inState('Disconnected', 'Connecting') && pageMaintain()"  :class="{'disabled-text':inState('Maintenance') || inState('Disconnected', 'Connecting')}">{{$t('common.intoMaintain')}}</a>
              <a style="margin-bottom: 12px;" :class="{'disabled-text': !isSelected}" @click="isSelected && pageDelete()">{{$t('common.destroyed')}}</a>
            </div>
          </span>
        </drop-down>
      </div>
      <div class="page-toolbar-center"></div>
      <div class="page-toolbar-right">
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
      </div>
    </div>
    <div class="page-table">
      <el-table :data="itemList" @selection-change="handleSelect" @sort-change="handleSort">
         <span slot="empty" class="table-nodata">
           <p class="empty-text" v-text="$t('common.noData')"></p>
         </span>
        <el-table-column type="selection"></el-table-column>
        <el-table-column :label="$t('common.name')" prop="name" sortable>
          <template slot-scope="scope">
            <div class="link" @click="goToHost(scope.row.uuid)">{{scope.row.name}}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.managementIp')" prop="managementIp">
          <template slot-scope="scope">
            <table-body-item-list :copy="'true'" :content="scope.row.managementIp"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.hypervisorType')">
          <template slot-scope="scope">
             {{scope.row.hypervisorType}}
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.state')">
          <template slot-scope="scope">
            <table-body-item-state :state="scope.row.state"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.status')">
          <template slot-scope="scope">
            <table-body-item-state :state="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.createDate')" prop="createDate" sortable>
          <template slot-scope="scope">
            {{formatDatetime(new Date(scope.row.createDate))}}
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
</template>

<script>
  import TableBodyItemState from "../../../component/TableBodyItemState";
  import MultiSelectList from 'src/windows/Base/MultiSelectList';
  import HostList from 'src/om/host/List';
  import TableBodyItemList from "../../../component/TableBodyItemList";
  export default {
    name: "HostTabList",
    components: {TableBodyItemList, TableBodyItemState},
    mixins: [HostList, MultiSelectList],
    props: {
      param: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data(){
      return {
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
      let self = this;
      if (self.param && self.param.refresh) {
        self.refresh = self.param.refresh
      }
      self.updateWindow({
        pageIndex: 1,
        pagSize: 10,
        sortBy: 'createDate',
        sortDirection: '-',
        selectedUuidList: [],
      }).then(() => {
        return self.queryList();
      })
    },
    methods: {
      getCondition(){
        let conditionList = [], self = this;
        conditionList.push(`zoneUuid=${localStorage.getItem('currZoneUuid')}`)
        conditionList.push(`cluster.uuid=${self.param.clusterUuid}`)
        if (self.selectVal !== '' && self.searchStr !== '') {
          conditionList = conditionList.concat(`${self.selectVal}~=%25${encodeURIComponent(self.searchStr)}%25`);
        }
        return conditionList
      },
      goToAddHost(){
        let self = this;
        self.$router.push({name: 'createHost', params: {clusterUuid: self.param.clusterUuid}})
      },
      goToHost(uuid){
        let self = this;
        self.$router.push({name: 'detailHost', params: {uuid}})
      }
    }
  }
</script>

<style scoped>

</style>
